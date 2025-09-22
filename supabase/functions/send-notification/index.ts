import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, title, body, data } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Recupera subscription dell'utente
    const { data: subscription, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (subError || !subscription) {
      throw new Error('Subscription non trovata')
    }

    // Invia notifica push usando web-push
    const webPush = await import('https://esm.sh/web-push@3.6.7')
    
    const payload = JSON.stringify({
      title: title || 'LexAgenda',
      body: body || 'Nuova notifica',
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: data || {}
    })

    await webPush.sendNotification({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    }, payload, {
      vapidDetails: {
        subject: 'mailto:your-email@example.com',
        publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
        privateKey: Deno.env.get('VAPID_PRIVATE_KEY')
      }
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
