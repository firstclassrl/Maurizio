# 🔧 RISOLUZIONE PROBLEMI NOTIFICHE PUSH

## 🚨 **PROBLEMI IDENTIFICATI E RISOLTI**

### ✅ **1. Discrepanza nei nomi delle colonne del database**
**Problema**: Le Edge Functions usavano `p256dh_key` e `auth_key` mentre il database aveva `p256dh` e `auth`
**Risolto**: ✅ Aggiornate le Edge Functions per usare i nomi corretti

### ✅ **2. Hook per test notifiche migliorato**
**Problema**: L'hook non gestiva correttamente l'autenticazione e gli errori
**Risolto**: ✅ Aggiornato per usare Supabase Edge Functions con autenticazione corretta

### ✅ **3. Edge Function per test notifiche**
**Problema**: Mancava una funzione dedicata per testare le notifiche
**Risolto**: ✅ Creata `send-test-notification` Edge Function

## 📋 **PASSI PER RISOLVERE LE NOTIFICHE**

### **Passo 1: Configura le variabili d'ambiente**
Crea il file `.env.local` nella root del progetto:

```env
# Push Notifications Configuration (Vite)
VITE_VAPID_PUBLIC_KEY=BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
VITE_VAPID_PRIVATE_KEY=x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w

# Supabase Configuration (sostituisci con i tuoi valori)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### **Passo 2: Deploya le Edge Functions**
Esegui lo script di deploy:

```bash
./deploy-push-notifications.sh
```

Oppure manualmente:
```bash
supabase functions deploy subscribe
supabase functions deploy unsubscribe
supabase functions deploy send-notification
supabase functions deploy send-test-notification
```

### **Passo 3: Configura le variabili d'ambiente in Supabase**
Nel dashboard Supabase, vai in **Settings > Edge Functions** e aggiungi:

```
VAPID_PUBLIC_KEY=BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
VAPID_PRIVATE_KEY=x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w
```

### **Passo 4: Verifica il database**
Assicurati che la tabella `push_subscriptions` esista. Se non esiste, esegui la migrazione:

```sql
-- Esegui questo nel SQL Editor di Supabase
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Crea policy
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);
```

## 🧪 **TEST DELLE NOTIFICHE**

### **Test 1: Verifica Service Worker**
1. Apri la console del browser (F12)
2. Vai su Application > Service Workers
3. Verifica che il Service Worker sia registrato e attivo

### **Test 2: Verifica Permessi**
1. Vai alla Dashboard dell'app
2. Cerca la sezione "Push Notifications"
3. Verifica che il toggle sia disponibile
4. Clicca per abilitare le notifiche

### **Test 3: Test Notifica**
1. Dopo aver abilitato le notifiche
2. Clicca sul pulsante "Test"
3. Dovresti ricevere una notifica di test

### **Test 4: Verifica Database**
Nel SQL Editor di Supabase:
```sql
-- Controlla se la subscription è stata salvata
SELECT * FROM push_subscriptions;

-- Controlla le statistiche
SELECT COUNT(*) as total_subscriptions FROM push_subscriptions;
```

## 🔍 **DEBUG E LOG**

### **Console del Browser**
Controlla la console per questi messaggi:
- ✅ "Service Worker registrato con successo"
- ✅ "Permesso per notifiche concesso"
- ✅ "Sottoscrizione push completata"
- ✅ "Notifica di test inviata con successo"

### **Log delle Edge Functions**
Nel dashboard Supabase, vai in **Edge Functions > Logs** per vedere gli errori.

### **Test Manuale delle Edge Functions**
Puoi testare le funzioni direttamente:

```bash
# Test subscribe
curl -X POST 'https://your-project.supabase.co/functions/v1/subscribe' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"subscription": {...}, "userAgent": "test"}'

# Test send-notification
curl -X POST 'https://your-project.supabase.co/functions/v1/send-test-notification' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"subscription": {...}, "title": "Test", "body": "Test message"}'
```

## ⚠️ **PROBLEMI COMUNI E SOLUZIONI**

### **"Service Worker non registrato"**
- Verifica che il file `public/sw.js` esista
- Controlla che l'app sia servita via HTTPS (o localhost)
- Ricarica la pagina

### **"Permessi negati"**
- Vai nelle impostazioni del browser
- Abilita le notifiche per il tuo sito
- Ricarica la pagina

### **"Subscription non salvata"**
- Verifica che le Edge Functions siano deployate
- Controlla i log delle Edge Functions
- Verifica che l'utente sia autenticato

### **"Notifiche non ricevute"**
- Verifica che il dispositivo supporti le notifiche
- Controlla che l'app non sia in background
- Testa su dispositivi reali (non emulatori)

### **"Errore 401 Unauthorized"**
- Verifica che l'utente sia autenticato
- Controlla che il token di accesso sia valido
- Ricarica la pagina e riprova

## 📱 **COMPATIBILITÀ**

### **✅ Supportato**
- **Android Chrome**: Completo
- **iOS Safari**: iOS 16.4+
- **Desktop Chrome/Firefox**: Completo

### **⚠️ Limitazioni**
- **Safari Desktop**: Supporto limitato
- **Firefox Mobile**: Supporto parziale
- **iOS Safari**: Richiede iOS 16.4+

## 🎯 **RISULTATO FINALE**

Dopo aver completato tutti i passi, dovresti avere:

- ✅ Push notifications funzionanti
- ✅ Notifiche per scadenze importanti
- ✅ Funziona anche quando l'app è chiusa
- ✅ Controllo completo dell'utente
- ✅ Test integrato
- ✅ Sicurezza RLS configurata
- ✅ Edge Functions deployate

## 📞 **SUPPORTO AGGIUNTIVO**

Se hai ancora problemi:

1. **Controlla la console del browser** per errori dettagliati
2. **Verifica le variabili d'ambiente** nel file .env.local
3. **Controlla il dashboard Supabase** per configurazioni
4. **Testa su dispositivo mobile** per funzionalità complete
5. **Controlla i log delle Edge Functions** per errori server-side

---

**Le notifiche dovrebbero funzionare correttamente dopo aver seguito questa guida! 🚀**
