# 🚀 DEPLOY MANUALE EDGE FUNCTIONS - PUSH NOTIFICATIONS

## 📋 Problema Attuale
Le push notifications non funzionano perché le Edge Functions non sono deployate o non hanno le variabili d'ambiente configurate.

## 🔧 Soluzione: Deploy Manuale

### **Passo 1: Configura Variabili d'Ambiente in Supabase**

1. Vai su **Supabase Dashboard** → **Settings** → **Edge Functions** → **Environment Variables**
2. Aggiungi queste variabili:

```
VAPID_PUBLIC_KEY = BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
VAPID_PRIVATE_KEY = x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w
SUPABASE_URL = https://xehvemqogsznmxgfemeu.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaHZlbXFvZ3N6bm14Z2ZlbWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzUyNzAsImV4cCI6MjA3Mzg1MTI3MH0.Y7vRtXVbU3fb_spwd7Nh6T_ppUK_wkTTLvN63dZpV7A
```

### **Passo 2: Deploya le Edge Functions**

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Clicca **"Create a new function"**
3. Crea queste 3 funzioni:

#### **Funzione 1: subscribe**
- **Nome**: `subscribe`
- **Copia il contenuto** da `supabase/functions/subscribe/index.ts`

#### **Funzione 2: send-notification**
- **Nome**: `send-notification`  
- **Copia il contenuto** da `supabase/functions/send-notification/index.ts`

#### **Funzione 3: send-test-notification**
- **Nome**: `send-test-notification`
- **Copia il contenuto** da `supabase/functions/send-test-notification/index.ts`

### **Passo 3: Verifica Database**

Assicurati che la tabella `push_subscriptions` esista:

```sql
-- Esegui questo SQL nel SQL Editor di Supabase
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Abilita RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Crea policy
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
    FOR ALL USING (auth.uid() = user_id);
```

### **Passo 4: Test**

1. **Ricarica l'app** nel browser
2. **Vai su "Opzioni" → "Push"**
3. **Attiva le notifiche**
4. **Clicca "Test"**
5. **Dovresti ricevere** la notifica!

## 🔍 Troubleshooting

### Errore 401 Unauthorized
- Verifica che `SUPABASE_ANON_KEY` sia configurata correttamente
- Controlla che l'utente sia autenticato

### Errore CORS
- Le Edge Functions hanno già i CORS headers configurati
- Verifica che le funzioni siano deployate correttamente

### Notifiche non ricevute
- Verifica che `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` siano configurate
- Controlla che il browser supporti le push notifications
- Verifica che l'utente abbia dato il permesso per le notifiche

## 📱 Compatibilità

- ✅ **Chrome/Edge** - Supporto completo
- ✅ **Firefox** - Supporto completo  
- ✅ **Safari** - Supporto da macOS 16.4+
- ✅ **Tutti i browser moderni** - Funziona su desktop
