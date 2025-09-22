# 📱 GUIDA IMPLEMENTAZIONE PUSH NOTIFICATIONS

## 🎯 PANORAMICA

Le push notification permettono di inviare notifiche agli utenti anche quando l'app non è aperta, perfetto per ricordare scadenze importanti.

## 🔧 OPZIONI DISPONIBILI

### 1. **Service Worker + Web Push API** (Raccomandato)
- ✅ **Nativo del browser**: Funziona su tutti i dispositivi
- ✅ **Gratuito**: Nessun costo aggiuntivo
- ✅ **Controllo completo**: Personalizzazione totale
- ✅ **Compatibile**: iOS Safari, Android Chrome, Desktop

### 2. **Firebase Cloud Messaging (FCM)**
- ✅ **Google**: Integrazione con Google services
- ✅ **Cross-platform**: iOS, Android, Web
- ✅ **Gratuito**: Fino a 100M messaggi/mese
- ✅ **Analytics**: Statistiche dettagliate

### 3. **OneSignal**
- ✅ **Servizio terzo**: Facile da implementare
- ✅ **Gratuito**: Fino a 30K utenti
- ✅ **Dashboard**: Interfaccia di gestione
- ✅ **Multi-platform**: iOS, Android, Web

## 🚀 IMPLEMENTAZIONE: Service Worker + Web Push

### **Passo 1: Service Worker**

Crea `public/sw.js`:

```javascript
// Service Worker per Push Notifications
const CACHE_NAME = 'lexagenda-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Installazione Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Gestione Push Notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nuova notifica',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Apri App',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Chiudi',
        icon: '/favicon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('LexAgenda', options)
  );
});

// Gestione click su notifica
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

### **Passo 2: Hook per Push Notifications**

Crea `src/hooks/usePushNotifications.tsx`:

```typescript
import { useState, useEffect } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isSubscribed: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    subscription: null,
    isSubscribed: false
  });

  useEffect(() => {
    // Verifica supporto
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setState(prev => ({ ...prev, isSupported: true }));
      
      // Verifica permessi
      if ('Notification' in window) {
        setState(prev => ({ ...prev, permission: Notification.permission }));
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!state.isSupported) return false;

    const permission = await Notification.requestPermission();
    setState(prev => ({ ...prev, permission }));
    return permission === 'granted';
  };

  const subscribeToPush = async () => {
    if (!state.isSupported || state.permission !== 'granted') return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      setState(prev => ({ 
        ...prev, 
        subscription, 
        isSubscribed: true 
      }));

      // Invia subscription al server
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      return true;
    } catch (error) {
      console.error('Errore durante la sottoscrizione:', error);
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!state.subscription) return false;

    try {
      await state.subscription.unsubscribe();
      setState(prev => ({ 
        ...prev, 
        subscription: null, 
        isSubscribed: false 
      }));

      // Rimuovi subscription dal server
      await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.subscription)
      });

      return true;
    } catch (error) {
      console.error('Errore durante la disiscrizione:', error);
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush
  };
}
```

### **Passo 3: Componente Settings**

Crea `src/components/notifications/PushNotificationSettings.tsx`:

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush();
    } else {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        await subscribeToPush();
      }
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Le push notifications non sono supportate su questo dispositivo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notifiche Push</p>
            <p className="text-sm text-gray-600">
              Ricevi notifiche per scadenze importanti
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={permission === 'denied'}
          />
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              Le notifiche sono state disabilitate. Abilita le notifiche nelle impostazioni del browser.
            </p>
          </div>
        )}

        {permission === 'default' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Clicca su "Abilita" per ricevere notifiche push.
            </p>
          </div>
        )}

        {isSubscribed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Notifiche push abilitate. Riceverai notifiche per le scadenze.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### **Passo 4: Registrazione Service Worker**

Aggiorna `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Registra Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrato:', registration);
      })
      .catch((registrationError) => {
        console.log('SW registrazione fallita:', registrationError);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### **Passo 5: Backend API (Supabase Edge Functions)**

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
    const { taskId, userId } = await req.json()

    // Recupera subscription dal database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: subscription } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!subscription) {
      throw new Error('Subscription non trovata')
    }

    // Invia notifica push
    const payload = JSON.stringify({
      title: 'Scadenza Imminente',
      body: 'Hai una scadenza importante oggi!',
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: { taskId }
    })

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: subscription.endpoint,
        notification: {
          title: 'Scadenza Imminente',
          body: 'Hai una scadenza importante oggi!',
          icon: '/favicon.png',
          badge: '/favicon.png'
        },
        data: { taskId }
      })
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

## 🔧 CONFIGURAZIONE NECESSARIA

### **1. Variabili d'Ambiente**
```env
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
FCM_SERVER_KEY=your_fcm_server_key
```

### **2. Database Schema**
```sql
-- Tabella per salvare le subscription
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger per notifiche automatiche
CREATE OR REPLACE FUNCTION send_deadline_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Logica per inviare notifiche
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deadline_notification_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION send_deadline_notification();
```

## 📱 COMPATIBILITÀ

### **✅ Supportato**
- **Android Chrome**: Completo
- **iOS Safari**: iOS 16.4+
- **Desktop Chrome/Firefox**: Completo
- **Desktop Safari**: Limitato

### **⚠️ Limitazioni**
- **iOS Safari**: Richiede iOS 16.4+
- **Safari Desktop**: Supporto limitato
- **Firefox Mobile**: Supporto parziale

## 🚀 PROSSIMI PASSI

1. **Implementa Service Worker**
2. **Aggiungi hook usePushNotifications**
3. **Crea componente settings**
4. **Configura backend API**
5. **Testa su dispositivi reali**

## 💡 SUGGERIMENTI

- **Testa sempre su dispositivi reali**
- **Implementa fallback per browser non supportati**
- **Usa notifiche locali come backup**
- **Rispetta le preferenze utente**
- **Implementa analytics per monitorare l'uso**
