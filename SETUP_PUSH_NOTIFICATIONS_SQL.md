# 🚀 SETUP COMPLETO PUSH NOTIFICATIONS - SQL

## ✅ **FILE SQL COMPLETO CREATO**

Ho creato il file `supabase/migrations/20250121_complete_push_notifications_setup.sql` che contiene tutto il necessario per le push notifications.

## 📋 **COSA FA QUESTO SQL**

### **1. Crea la Tabella `push_subscriptions`**
- Memorizza le subscription push degli utenti
- Collegata alla tabella `auth.users` di Supabase
- Include endpoint, chiavi di crittografia e timestamp

### **2. Configura Sicurezza (RLS)**
- Abilita Row Level Security
- Policy per permettere agli utenti di gestire solo le proprie subscription

### **3. Crea Funzioni Principali**
- `send_push_notification()` - Invia notifiche push
- `manage_push_subscription()` - Gestisce subscribe/unsubscribe
- `send_deadline_notifications()` - Notifiche automatiche per scadenze
- `test_push_notification()` - Test delle notifiche
- `cleanup_old_subscriptions()` - Pulizia subscription obsolete

### **4. Trigger e Indici**
- Trigger per aggiornare automaticamente `updated_at`
- Indici per migliorare le performance
- Vista per statistiche

## 🔧 **COME ESEGUIRE IL SETUP**

### **PASSO 1: Esegui il SQL**
1. Vai su [supabase.com](https://supabase.com)
2. Accedi al tuo progetto
3. Vai in **SQL Editor**
4. Copia e incolla tutto il contenuto del file `20250121_complete_push_notifications_setup.sql`
5. Clicca **Run** per eseguire

### **PASSO 2: Configura Variabili d'Ambiente**
Nel dashboard Supabase:
1. Vai in **Settings > Edge Functions**
2. Aggiungi queste variabili d'ambiente:

```
VAPID_PUBLIC_KEY=BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
VAPID_PRIVATE_KEY=x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w
```

### **PASSO 3: Testa il Setup**
Nel SQL Editor, esegui:

```sql
-- Test delle notifiche
SELECT public.test_push_notification();

-- Vedi le statistiche
SELECT * FROM public.push_notification_stats;

-- Testa la gestione subscription
SELECT public.manage_push_subscription(
    'subscribe',
    'https://example.com/endpoint',
    'test-p256dh-key',
    'test-auth-key'
);
```

## 🎯 **FUNZIONI DISPONIBILI**

### **`send_push_notification(user_id, title, body, ...)`**
Invia una notifica push a un utente specifico.

**Parametri:**
- `user_id_param` - ID dell'utente
- `title` - Titolo della notifica
- `body` - Corpo della notifica
- `icon_url` - URL dell'icona (opzionale)
- `badge_url` - URL del badge (opzionale)
- `tag` - Tag per raggruppare notifiche (opzionale)
- `data` - Dati aggiuntivi in JSON (opzionale)

### **`manage_push_subscription(action, endpoint, p256dh_key, auth_key)`**
Gestisce le subscription push.

**Parametri:**
- `action` - 'subscribe' o 'unsubscribe'
- `endpoint` - Endpoint della subscription
- `p256dh_key` - Chiave P256DH
- `auth_key` - Chiave di autenticazione

### **`send_deadline_notifications()`**
Invia notifiche automatiche per scadenze urgenti di oggi.

### **`test_push_notification(user_id)`**
Invia una notifica di test.

### **`cleanup_old_subscriptions()`**
Rimuove subscription più vecchie di 30 giorni.

## 📊 **MONITORAGGIO**

### **Vista Statistiche**
```sql
SELECT * FROM public.push_notification_stats;
```

Mostra:
- Numero totale di subscription
- Numero di utenti unici
- Prima e ultima subscription

### **Query Utili**
```sql
-- Vedi tutte le subscription
SELECT * FROM public.push_subscriptions;

-- Conta subscription per utente
SELECT user_id, COUNT(*) as subscription_count 
FROM public.push_subscriptions 
GROUP BY user_id;

-- Subscription più recenti
SELECT * FROM public.push_subscriptions 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔒 **SICUREZZA**

- ✅ **RLS abilitato** - Gli utenti vedono solo le proprie subscription
- ✅ **Funzioni SECURITY DEFINER** - Eseguono con privilegi elevati
- ✅ **Validazione input** - Controlli sui parametri
- ✅ **Gestione errori** - Try/catch per operazioni critiche

## 🚨 **TROUBLESHOOTING**

### **Errore: "VAPID keys not configured"**
- Verifica che le variabili d'ambiente siano configurate nel dashboard Supabase
- Controlla che i nomi delle variabili siano esatti

### **Errore: "User not authenticated"**
- Assicurati che l'utente sia loggato
- Verifica che RLS sia configurato correttamente

### **Notifiche non arrivano**
- Controlla che il Service Worker sia registrato nel browser
- Verifica che l'utente abbia concesso i permessi
- Controlla la console del browser per errori

## ✅ **VERIFICA SETUP COMPLETO**

Dopo aver eseguito il SQL, dovresti avere:

1. ✅ Tabella `push_subscriptions` creata
2. ✅ RLS configurato
3. ✅ Funzioni create e funzionanti
4. ✅ Trigger e indici attivi
5. ✅ Variabili d'ambiente configurate
6. ✅ Test delle notifiche funzionante

## 🎉 **PROSSIMI PASSI**

1. **Esegui il SQL** nel dashboard Supabase
2. **Configura le variabili d'ambiente**
3. **Testa le funzioni** con le query di test
4. **Integra nel frontend** usando le funzioni create
5. **Testa su dispositivo mobile**

---

**Setup completo! Ora hai tutto il backend necessario per le push notifications! 🚀**
