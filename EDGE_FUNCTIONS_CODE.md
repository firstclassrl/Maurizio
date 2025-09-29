# 📝 CODICE EDGE FUNCTIONS - COPY & PASTE

## 🔧 Funzione 1: subscribe

**Nome**: `subscribe`

```typescript
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
    const { subscription, userAgent } = await req.json()
    
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

    // Salva o aggiorna subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        user_agent: userAgent
      })

    if (error) throw error

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
```

## 🔧 Funzione 2: send-notification

**Nome**: `send-notification`

```typescript
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
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key
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
```

## 🔧 Funzione 3: send-test-notification

**Nome**: `send-test-notification`

```typescript
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

    // Invia notifica push usando web-push
    const webPush = await import('https://esm.sh/web-push@3.6.7')
    
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

    await webPush.sendNotification({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    }, payload, {
      vapidDetails: {
        subject: 'mailto:your-email@example.com',
        publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
        privateKey: Deno.env.get('VAPID_PRIVATE_KEY')
      }
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
```

## 📋 Istruzioni

1. **Copia il codice** di ogni funzione
2. **Vai su Supabase Dashboard** → **Edge Functions**
3. **Crea una nuova funzione** per ognuna
4. **Incolla il codice** corrispondente
5. **Deploya** la funzione
6. **Ripeti** per tutte e 3 le funzioni
