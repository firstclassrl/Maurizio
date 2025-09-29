import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders(originHeader?: string) {
  const ALLOWED_ORIGINS = new Set<string>([
    'https://lexagenda.netlify.app'
  ])

  const origin = originHeader && ALLOWED_ORIGINS.has(originHeader)
    ? originHeader
    : 'https://lexagenda.netlify.app'

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,apikey,x-client-info',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  }
}

type RequestBody = {
  question: string
  userId?: string
  context?: Record<string, unknown>
}

const DEFAULT_MODEL = Deno.env.get('GROQ_MODEL') || 'llama-3.1-8b-instant'
const DAILY_LIMIT = Number(Deno.env.get('AI_DAILY_LIMIT') ?? '100')

serve(async (req) => {
  const origin = req.headers.get('origin') ?? undefined
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    const body = await req.json() as RequestBody
    const question = (body.question || '').toString().trim()
    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question' }), { status: 400, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    // Rate limiting per user per day
    const { data: usageCountData, error: usageErr } = await supabase
      .rpc('ai_usage_count_today', { p_user: user.id })
    if (!usageErr && typeof usageCountData === 'number' && usageCountData >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: 'Daily limit reached', remaining: 0 }), { status: 429, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    // Call Groq API
    const systemPrompt = "Sei un assistente AI specializzato per studi legali italiani. Aiuti gli avvocati a gestire scadenze, pratiche e calendario. Rispondi sempre in italiano professionale ma chiaro. Se ti vengono fatte domande su dati, specifica che puoi interrogare il database dell'utente. Non inventare informazioni legali specifiche."

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      return new Response(JSON.stringify({ error: 'Groq API error', details: errText }), { status: 502, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    const groqJson = await groqRes.json()
    const answer: string = groqJson.choices?.[0]?.message?.content || 'Nessuna risposta.'
    const tokensIn: number = groqJson.usage?.prompt_tokens ?? 0
    const tokensOut: number = groqJson.usage?.completion_tokens ?? 0

    // Log usage
    await supabase.from('ai_usage').insert({
      user_id: user.id,
      model_used: DEFAULT_MODEL,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      question_preview: question.slice(0, 180),
      metadata: body.context || {}
    })

    const remaining = Math.max(DAILY_LIMIT - (Number(usageCountData || 0) + 1), 0)

    return new Response(JSON.stringify({ answer, model: DEFAULT_MODEL, tokens: { in: tokensIn, out: tokensOut }, remaining }), { headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('ai-assistant-groq error:', error)
    return new Response(JSON.stringify({ error: 'Internal error', details: (error as Error).message }), { status: 500, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })
  }
})


