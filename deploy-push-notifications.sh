#!/bin/bash

# Script per deployare le Push Notifications
echo "🚀 Deploying Push Notifications..."

# Verifica che Supabase CLI sia installato
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI non trovato. Installa con: npm install -g supabase"
    exit 1
fi

# Deploy delle Edge Functions
echo "📦 Deploying Edge Functions..."

echo "  - Deploying subscribe function..."
supabase functions deploy subscribe

echo "  - Deploying unsubscribe function..."
supabase functions deploy unsubscribe

echo "  - Deploying send-notification function..."
supabase functions deploy send-notification

echo "  - Deploying send-test-notification function..."
supabase functions deploy send-test-notification

echo "✅ Edge Functions deployed successfully!"

# Verifica che il file .env.local esista
if [ ! -f ".env.local" ]; then
    echo "⚠️  File .env.local non trovato!"
    echo "📝 Crea il file .env.local con questo contenuto:"
    echo ""
    echo "VITE_VAPID_PUBLIC_KEY=BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE"
    echo "VITE_VAPID_PRIVATE_KEY=x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w"
    echo "VITE_SUPABASE_URL=your_supabase_url_here"
    echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here"
    echo ""
    echo "Sostituisci 'your_supabase_url_here' e 'your_supabase_anon_key_here' con i tuoi valori reali."
else
    echo "✅ File .env.local trovato!"
fi

echo ""
echo "🔧 Configurazione necessaria nel Dashboard Supabase:"
echo "1. Vai in Settings > Edge Functions"
echo "2. Aggiungi queste variabili d'ambiente:"
echo "   VAPID_PUBLIC_KEY=BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE"
echo "   VAPID_PRIVATE_KEY=x91rDGXIZhTELfJ8XVv90h8sQlGQpBR67t-EZ6BNp2w"
echo ""
echo "📱 Per testare le notifiche:"
echo "1. Avvia l'app: npm run dev"
echo "2. Vai alla Dashboard"
echo "3. Abilita le Push Notifications"
echo "4. Clicca su 'Test' per inviare una notifica di test"
echo ""
echo "🎉 Setup completato! Le notifiche dovrebbero funzionare ora."
