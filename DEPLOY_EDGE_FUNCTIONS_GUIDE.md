# 🚀 DEPLOY EDGE FUNCTIONS - GUIDA COMPLETA

## 📋 **METODI DI DEPLOY**

### **METODO 1: Dashboard Supabase (RACCOMANDATO)**

#### **1. Vai al Dashboard Supabase**
1. Apri [supabase.com](https://supabase.com)
2. Accedi al tuo account
3. Seleziona il tuo progetto

#### **2. Vai alla Sezione Edge Functions**
1. Nel menu laterale, clicca su **"Edge Functions"**
2. Clicca su **"Create a new function"**

#### **3. Crea la Funzione `subscribe`**
1. **Nome funzione**: `subscribe`
2. **Copia il codice** da `supabase/functions/subscribe/index.ts`
3. **Clicca "Deploy"**

#### **4. Crea la Funzione `unsubscribe`**
1. **Nome funzione**: `unsubscribe`
2. **Copia il codice** da `supabase/functions/unsubscribe/index.ts`
3. **Clicca "Deploy"**

#### **5. Crea la Funzione `send-notification`**
1. **Nome funzione**: `send-notification`
2. **Copia il codice** da `supabase/functions/send-notification/index.ts`
3. **Clicca "Deploy"**

### **METODO 2: Supabase CLI (Alternativo)**

#### **1. Installa Supabase CLI**
```bash
# Opzione 1: Homebrew (se funziona)
brew install supabase/tap/supabase

# Opzione 2: NPM (se hai permessi)
npm install -g supabase

# Opzione 3: Download diretto
# Vai su https://github.com/supabase/cli/releases
# Scarica il file per macOS
```

#### **2. Autenticati**
```bash
supabase login
```

#### **3. Collega il Progetto**
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

#### **4. Deploy delle Funzioni**
```bash
# Deploy singola funzione
supabase functions deploy subscribe
supabase functions deploy unsubscribe
supabase functions deploy send-notification

# Oppure deploy di tutte le funzioni
supabase functions deploy
```

## 🔧 **CONFIGURAZIONE VARIABILI D'AMBIENTE**

### **Nel Dashboard Supabase**
1. Vai in **Settings > Edge Functions**
2. Aggiungi queste variabili d'ambiente:

```
VAPID_PUBLIC_KEY=BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
VAPID_PRIVATE_KEY=x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w
```

## 📁 **CONTENUTO DELLE FUNZIONI**

### **1. Funzione `subscribe`**
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

### **2. Funzione `unsubscribe`**
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
    const { subscription } = await req.json()
    
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

    // Rimuovi subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint)

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

### **3. Funzione `send-notification`**
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

## ✅ **VERIFICA DEPLOY**

### **1. Controlla nel Dashboard**
1. Vai in **Edge Functions**
2. Dovresti vedere le 3 funzioni:
   - `subscribe`
   - `unsubscribe`
   - `send-notification`

### **2. Test delle Funzioni**
```bash
# Test subscribe
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/subscribe' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"subscription": {"endpoint": "test", "keys": {"p256dh": "test", "auth": "test"}}}'

# Test send-notification
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "test", "title": "Test", "body": "Test notification"}'
```

## 🎯 **PROSSIMI PASSI**

Dopo il deploy delle Edge Functions:

1. **Testa l'app**: `npm run dev`
2. **Vai alla Dashboard**
3. **Cerca la sezione "Push Notifications"**
4. **Clicca su "Abilita"** per testare la subscription
5. **Usa il pulsante "Test"** per inviare una notifica di test

## 🚨 **TROUBLESHOOTING**

### **Errore: "Function not found"**
- Verifica che le funzioni siano deployate correttamente
- Controlla i nomi delle funzioni (devono essere esatti)

### **Errore: "VAPID keys not configured"**
- Verifica che le variabili d'ambiente siano configurate nel dashboard
- Controlla che i nomi delle variabili siano esatti

### **Errore: "Subscription not found"**
- Verifica che la tabella `push_subscriptions` sia creata
- Controlla che l'utente sia autenticato

---

**Una volta deployate le Edge Functions, le push notifications saranno completamente funzionanti! 🚀**
