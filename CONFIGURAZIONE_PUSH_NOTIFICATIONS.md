# 🔧 CONFIGURAZIONE PUSH NOTIFICATIONS - GUIDA PASSO PASSO

## ✅ **PASSO 1: Chiavi VAPID Generate**

Le chiavi VAPID sono state generate con successo:

```
Public Key:  BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
Private Key: x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w
```

## 📝 **PASSO 2: Configurazione Variabili d'Ambiente**

Crea un file `.env.local` nella root del progetto con questo contenuto:

```env
# Push Notifications Configuration
REACT_APP_VAPID_PUBLIC_KEY=BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
REACT_APP_VAPID_PRIVATE_KEY=x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w

# Supabase Configuration (se non già presente)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🗄️ **PASSO 3: Configurazione Database**

Aggiungi questa tabella al tuo database Supabase:

```sql
-- Tabella per salvare le subscription push
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indice per performance
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON push_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔧 **PASSO 4: Creare Endpoint API**

Crea questi file per gestire le subscription:

### **4.1: Endpoint per Salvare Subscription**

Crea `supabase/functions/subscribe/index.ts`:

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
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
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

### **4.2: Endpoint per Rimuovere Subscription**

Crea `supabase/functions/unsubscribe/index.ts`:

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

### **4.3: Endpoint per Inviare Notifiche**

Crea `supabase/functions/send-notification/index.ts`:

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
```

## 🚀 **PASSO 5: Deploy delle Edge Functions**

```bash
# Deploy delle funzioni
supabase functions deploy subscribe
supabase functions deploy unsubscribe
supabase functions deploy send-notification
```

## 🎯 **PASSO 6: Integrazione nell'App**

### **6.1: Aggiungi il Componente al Dashboard**

Modifica `src/pages/DashboardPage.tsx`:

```typescript
import { PushNotificationSettings } from '../components/notifications/PushNotificationSettings';

// Nel render, aggiungi dopo la sezione Quick Add Form:
<PushNotificationSettings />
```

### **6.2: Aggiorna l'Hook per Usare gli Endpoint**

L'hook `usePushNotifications` è già configurato per usare gli endpoint `/api/subscribe` e `/api/unsubscribe`.

## 🧪 **PASSO 7: Test**

1. **Avvia l'app**: `npm run dev`
2. **Apri su mobile**: Vai su `http://localhost:5173` dal tuo smartphone
3. **Abilita notifiche**: Clicca sul toggle nelle impostazioni
4. **Testa notifica**: Usa il pulsante "Test" per verificare

## 🔍 **PASSO 8: Verifica Funzionamento**

### **Controlli da Fare:**

1. **Service Worker registrato**: Controlla nella console del browser
2. **Permessi concessi**: Verifica nelle impostazioni del browser
3. **Subscription salvata**: Controlla la tabella `push_subscriptions`
4. **Notifica ricevuta**: Testa con il pulsante "Test"

### **Debug Console:**

```javascript
// Controlla se il Service Worker è registrato
navigator.serviceWorker.ready.then(reg => console.log('SW ready:', reg))

// Controlla subscription
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => console.log('Subscription:', sub))
)
```

## ⚠️ **PROBLEMI COMUNI E SOLUZIONI**

### **1. "Service Worker non registrato"**
- Verifica che il file `sw.js` sia in `public/`
- Controlla la console per errori
- Assicurati che l'app sia servita via HTTPS (o localhost)

### **2. "Permessi negati"**
- Vai nelle impostazioni del browser
- Abilita le notifiche per il tuo sito
- Ricarica la pagina

### **3. "Subscription non salvata"**
- Verifica che gli endpoint API siano deployati
- Controlla i log delle Edge Functions
- Verifica che l'utente sia autenticato

### **4. "Notifiche non ricevute"**
- Verifica che il dispositivo supporti le notifiche
- Controlla che l'app non sia in background
- Testa su dispositivi reali (non emulatori)

## 📱 **COMPATIBILITÀ**

- ✅ **Android Chrome**: Completo
- ✅ **iOS Safari**: iOS 16.4+
- ✅ **Desktop Chrome/Firefox**: Completo
- ⚠️ **Safari Desktop**: Limitato
- ⚠️ **Firefox Mobile**: Parziale

## 🎉 **RISULTATO FINALE**

Dopo aver completato tutti i passi, avrai:

- ✅ Push notifications funzionanti
- ✅ Notifiche per scadenze importanti
- ✅ Funziona anche quando l'app è chiusa
- ✅ Controllo completo dell'utente
- ✅ Test integrato

## 📞 **SUPPORTO**

Se hai problemi:

1. Controlla la console del browser per errori
2. Verifica che tutti i file siano stati creati correttamente
3. Assicurati che le variabili d'ambiente siano configurate
4. Testa su dispositivi reali

---

**Buona implementazione! 🚀**
