import { useState, useEffect } from 'react';

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
  isLoading: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: 'default',
    isEnabled: false,
    isLoading: false
  });

  useEffect(() => {
    // Verifica supporto per le notifiche
    if ('Notification' in window) {
      setState(prev => ({ 
        ...prev, 
        isSupported: true,
        permission: Notification.permission,
        isEnabled: Notification.permission === 'granted'
      }));
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ 
        ...prev, 
        permission,
        isEnabled: permission === 'granted'
      }));
      
      return permission === 'granted';
    } catch (error) {
      console.error('Errore richiesta permessi:', error);
      return false;
    }
  };

  const toggleNotifications = async (): Promise<boolean> => {
    if (state.isEnabled) {
      // Disabilita notifiche
      setState(prev => ({ ...prev, isEnabled: false }));
      return true;
    } else {
      // Richiedi permessi e abilita
      const granted = await requestPermission();
      return granted;
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    if (!state.isEnabled) {
      console.log('Notifiche non abilitate');
      return false;
    }

    try {
      const notification = new Notification('Test Notifica LexAgenda', {
        body: 'Questa è una notifica di test per verificare che le notifiche funzionino correttamente!',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'test-notification',
        requireInteraction: true
      });

      // Chiudi automaticamente dopo 5 secondi
      setTimeout(() => {
        notification.close();
      }, 5000);

      console.log('Notifica di test inviata con successo');
      return true;
    } catch (error) {
      console.error('Errore nell\'invio notifica di test:', error);
      return false;
    }
  };

  return {
    isSupported: state.isSupported,
    permission: state.permission,
    isSubscribed: state.isEnabled,
    isLoading: state.isLoading,
    requestPermission,
    toggleSubscription: toggleNotifications,
    sendTestNotification
  };
}
