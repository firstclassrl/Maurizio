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
    const systemPrompt = "Sei un assistente AI specializzato per studi legali italiani. Usa CONTENUTO_DB quando presente per rispondere con dati reali dell'utente. Se il dato non è in CONTENUTO_DB, spiega cosa manca e suggerisci come ottenerlo. Rispondi in italiano, sintetico e professionale."

    // Costruzione contesto dati dal database
    const dbContext = await buildDbContext(supabase, user.id, question)

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
          { role: 'assistant', content: dbContext ? `CONTENUTO_DB:\n${dbContext}` : 'CONTENUTO_DB: (nessun risultato pertinente)' },
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

// Heuristica semplice per creare un contesto dai dati su Supabase
async function buildDbContext(supabase: any, userId: string, question: string): Promise<string> {
  try {
    const q = question.toLowerCase()
    const entities = extractEntities(q)
    // finestra temporale
    let days = 30
    if (/[\b\s]oggi\b/.test(q)) days = 1
    else if (q.includes('settimana')) days = 7
    else if (q.includes('mese')) days = 30
    else if (q.includes('domani')) days = 2

    // categoria
    let categoriaFilter: string | null = null
    if (q.includes('udienz')) categoriaFilter = 'Udienza'
    else if (q.includes('scadenz')) categoriaFilter = 'Scadenza'

    const today = new Date()
    const to = new Date()
    to.setDate(today.getDate() + days)

    let query = supabase
      .from('activities')
      .select(`*, practices!inner(numero, cliente_id, clients!practices_cliente_id_fkey(ragione,nome,cognome))`)
      .eq('user_id', userId)
      .gte('data', today.toISOString().slice(0,10))
      .lte('data', to.toISOString().slice(0,10))
      .order('data', { ascending: true })
      .limit(50)

    if (categoriaFilter || entities.category) {
      query = query.ilike('categoria', `%${categoriaFilter}%`)
    }

    // filtri per cliente/pratica se estratti
    if (entities.practice) {
      // join su practices.numero non direttamente filtrabile: recupera id pratica e poi filtra
      const { data: prac } = await supabase
        .from('practices')
        .select('id')
        .eq('user_id', userId)
        .ilike('numero', `%${entities.practice}%`)
        .limit(1)
        .maybeSingle()
      if (prac?.id) query = query.eq('pratica_id', prac.id)
    }
    if (entities.client) {
      query = query.or(`practices.clients.ragione.ilike.%${entities.client}%,practices.clients.nome.ilike.%${entities.client}%,practices.clients.cognome.ilike.%${entities.client}%`)
    }
    if (entities.counterparty) {
      // controparti salvate su controparti_ids -> cerca per nome su clients e mappa a id
      const { data: cps } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .or(`ragione.ilike.%${entities.counterparty}%,nome.ilike.%${entities.counterparty}%,cognome.ilike.%${entities.counterparty}%`)
        .limit(50)
      if (cps && cps.length) {
        const ids = cps.map((c: any) => c.id).join(',')
        // PostgREST non filtra array contains facilmente qui, lasciamo solo categoria/cliente/pratica
      }
    }

    const { data, error } = await query
    if (error) return ''
    if (!data || data.length === 0) return ''

    // Conteggi sintetici utili (es. quante udienze)
    const countUdienze = (data as any[]).filter(a => (a.categoria || '').toLowerCase().includes('udienz')).length

    const lines = (data as any[]).slice(0, 20).map((a: any) => {
      const client = a.practices?.clients
      const clientName = client ? (client.ragione || `${client.nome||''} ${client.cognome||''}`.trim()) : 'N/D'
      const date = a.data
      const time = a.ora || '-'
      return `- ${date} ${time} • ${a.categoria} • ${a.attivita} • pratica ${a.practices?.numero || ''} • cliente ${clientName}`
    }).join('\n')

    // Aggiunge risultati correlati su pratiche/cliente se esplicitati
    let extra = ''
    if (entities.practice) {
      const { data: pr } = await supabase
        .from('practices')
        .select('numero, tipo_procedura, autorita_giudiziaria, rg, giudice')
        .eq('user_id', userId)
        .ilike('numero', `%${entities.practice}%`)
        .limit(1)
      if (pr && pr.length) {
        const p = pr[0]
        extra += `\nDettagli pratica ${p.numero}: tipo ${p.tipo_procedura || '-'}, autorità ${p.autorita_giudiziaria || '-'}, R.G. ${p.rg || '-'}, giudice ${p.giudice || '-'}.`
      }
    }
    if (entities.client) {
      const { data: cl } = await supabase
        .from('clients')
        .select('ragione,nome,cognome,email,telefono')
        .eq('user_id', userId)
        .or(`ragione.ilike.%${entities.client}%,nome.ilike.%${entities.client}%,cognome.ilike.%${entities.client}%`)
        .limit(1)
      if (cl && cl.length) {
        const c = cl[0]
        const name = c.ragione || `${c.nome||''} ${c.cognome||''}`.trim()
        extra += `\nCliente: ${name}${c.email?`, email ${c.email}`:''}${c.telefono?`, tel ${c.telefono}`:''}.`
      }
    }

    return `Intervallo: prossimi ${days} giorni. Totale risultati: ${data.length}. Udienze nel periodo: ${countUdienze}.\nElenco (max 20):\n${lines}${extra}`
  } catch (_) {
    return ''
  }
}

function extractEntities(q: string): { client?: string; practice?: string; counterparty?: string; category?: string } {
  const out: any = {}
  // pratica tipo 2025/003
  const prac = q.match(/\b\d{4}\s*\/?\s*\d{1,4}\b/)
  if (prac) out.practice = prac[0].replace(/\s+/g,'')
  // semplice heuristica per client: dopo "cliente" o nome società maiuscola
  const clientAfterWord = q.match(/cliente\s+([a-zàèéìòùA-Z0-9\.,&\-\s]{2,})/i)
  if (clientAfterWord) out.client = clientAfterWord[1].trim()
  const counterAfterWord = q.match(/controparte\s+([a-zàèéìòùA-Z0-9\.,&\-\s]{2,})/i)
  if (counterAfterWord) out.counterparty = counterAfterWord[1].trim()
  // categorie chiave
  if (q.includes('udienz')) out.category = 'Udienza'
  else if (q.includes('scadenz')) out.category = 'Scadenza'
  else if (q.includes('appuntament')) out.category = 'Appuntamento'
  return out
}


