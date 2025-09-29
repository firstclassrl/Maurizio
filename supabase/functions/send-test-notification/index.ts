import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendNotification as sendWebPush } from "https://deno.land/x/webpush@v1.3.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subscription, title, body } = await req.json()
    
    // Estrai user_id dal token JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token di autorizzazione mancante')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Utente non autenticato')
    }

    // Invia notifica push usando libreria Deno webpush
    
    const payload = JSON.stringify({
      title: title || 'Test Notifica LexAgenda',
      body: body || 'Questa è una notifica di test per verificare che le push notifications funzionino correttamente!',
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
        message: 'Test successful'
      }
    })

    console.log('[send-test-notification] endpoint:', subscription?.endpoint)
    console.log('[send-test-notification] vapid public set:', !!Deno.env.get('VAPID_PUBLIC_KEY'))

    const sub = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    }

    await sendWebPush(sub as any, payload, {
      vapidDetails: {
        subject: 'mailto:your-email@example.com',
        publicKey: Deno.env.get('VAPID_PUBLIC_KEY')!,
        privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!,
      },
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Test notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending test notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
