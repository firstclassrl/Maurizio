# 🔧 CONFIGURAZIONE VARIABILI D'AMBIENTE SUPABASE

## 📋 Variabili da Configurare nel Dashboard Supabase

Vai su **Supabase Dashboard** → **Settings** → **Edge Functions** → **Environment Variables** e aggiungi:

### **Chiavi VAPID per Push Notifications**
```
VAPID_PUBLIC_KEY = BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE
VAPID_PRIVATE_KEY = x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w
```

### **Configurazione Supabase (se non già presente)**
```
SUPABASE_URL = https://xehvemqogsznmxgfemeu.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaHZlbXFvZ3N6bm14Z2ZlbWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzUyNzAsImV4cCI6MjA3Mzg1MTI3MH0.Y7vRtXVbU3fb_spwd7Nh6T_ppUK_wkTTLvN63dZpV7A
```

## 🚀 Deploy delle Edge Functions

Dopo aver configurato le variabili, deploya le Edge Functions:

```bash
# Dal terminale, nella cartella del progetto
supabase functions deploy subscribe
supabase functions deploy send-notification
supabase functions deploy send-test-notification
```

## ✅ Verifica Configurazione

1. **Controlla le variabili** nel dashboard Supabase
2. **Deploya le Edge Functions** aggiornate
3. **Testa le notifiche** nell'app
4. **Verifica la console** per errori

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
