import { useState, useEffect } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isSubscribed: boolean;
  isLoading: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    subscription: null,
    isSubscribed: false,
    isLoading: false
  });

  useEffect(() => {
    // Verifica supporto per Service Worker e Push Manager
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setState(prev => ({ ...prev, isSupported: true }));
      
      // Verifica permessi notifiche
      if ('Notification' in window) {
        setState(prev => ({ ...prev, permission: Notification.permission }));
      }

      // Verifica se già sottoscritto
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({ 
        ...prev, 
        subscription, 
        isSubscribed: !!subscription 
      }));
    } catch (error) {
      console.error('Errore nel controllo subscription:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.log('Push notifications non supportate');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        console.log('Permesso per notifiche concesso');
        return true;
      } else {
        console.log('Permesso per notifiche negato');
        return false;
      }
    } catch (error) {
      console.error('Errore nella richiesta permessi:', error);
      return false;
    }
  };

  const subscribeToPush = async (): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      console.log('Push notifications non supportate o permesso negato');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Chiave VAPID pubblica (dovrebbe essere in .env)
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
        'BBtzXffm323WoFzkn6tSqS-ZP5Hr3pJluGbkuD20hcgUet0gO84sZWbPJptoCbJ90rLFd0vpL8yuMPM-M4tceSE';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      setState(prev => ({ 
        ...prev, 
        subscription, 
        isSubscribed: true,
        isLoading: false
      }));

      // Invia subscription al server (implementare endpoint)
      await sendSubscriptionToServer(subscription);

      console.log('Sottoscrizione push completata');
      return true;
    } catch (error) {
      console.error('Errore durante la sottoscrizione:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!state.subscription) {
      console.log('Nessuna subscription attiva');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await state.subscription.unsubscribe();
      
      setState(prev => ({ 
        ...prev, 
        subscription: null, 
        isSubscribed: false,
        isLoading: false
      }));

      // Rimuovi subscription dal server
      await removeSubscriptionFromServer(state.subscription);

      console.log('Disiscrizione push completata');
      return true;
    } catch (error) {
      console.error('Errore durante la disiscrizione:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const toggleSubscription = async (): Promise<boolean> => {
    if (state.isSubscribed) {
      const result = await unsubscribeFromPush();
      // Refresh state after unsubscribe
      if (result) {
        await checkExistingSubscription();
      }
      return result;
    } else {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        const result = await subscribeToPush();
        // Refresh state after subscribe
        if (result) {
          await checkExistingSubscription();
        }
        return result;
      }
      return false;
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    if (!state.isSubscribed) {
      console.log('Nessuna subscription attiva per il test');
      return false;
    }

    try {
      // Invia notifica di test al server
      const response = await fetch('/api/send-test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: state.subscription,
          title: 'Test Notifica',
          body: 'Questa è una notifica di test da LexAgenda!'
        })
      });

      if (response.ok) {
        console.log('Notifica di test inviata');
        return true;
      } else {
        console.error('Errore nell\'invio notifica di test');
        return false;
      }
    } catch (error) {
      console.error('Errore nella notifica di test:', error);
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    toggleSubscription,
    sendTestNotification
  };
}

// Utility function per convertire VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Funzioni per comunicare con il server
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    // Usa l'endpoint Supabase Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await import('../lib/supabase')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Errore nel salvataggio subscription');
    }

    console.log('Subscription salvata sul server');
  } catch (error) {
    console.error('Errore nel salvataggio subscription:', error);
    // Non bloccare l'utente se il server non è disponibile
  }
}

async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  try {
    // Usa l'endpoint Supabase Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await import('../lib/supabase')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      })
    });

    if (!response.ok) {
      throw new Error('Errore nella rimozione subscription');
    }

    console.log('Subscription rimossa dal server');
  } catch (error) {
    console.error('Errore nella rimozione subscription:', error);
    // Non bloccare l'utente se il server non è disponibile
  }
}
