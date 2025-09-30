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
    console.log('sendTestNotification chiamato, isEnabled:', state.isEnabled);
    console.log('Permission attuale:', Notification.permission);
    
    // Forza il controllo diretto del permesso invece dello stato
    if (Notification.permission !== 'granted') {
      console.log('Permessi non concessi');
      return false;
    }

    try {
      console.log('Creando notifica...');
      
      // Configurazione specifica per Chrome su macOS
      const notification = new Notification('Test Notifica LexAgenda', {
        body: 'Questa è una notifica di test!',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'lexagenda-test',
        requireInteraction: false, // Chrome su macOS ha problemi con requireInteraction
        silent: false,
        renotify: true
      });

      console.log('Notifica creata:', notification);

      // Aggiungi eventi per debug
      notification.onshow = () => {
        console.log('Notifica mostrata');
        // Feedback visivo per Chrome
        if (navigator.userAgent.includes('Chrome')) {
          console.log('Chrome: notifica inviata (potrebbe non essere visibile)');
        }
      };
      notification.onerror = (e) => console.error('Errore notifica:', e);
      notification.onclose = () => console.log('Notifica chiusa');

      // Chiudi automaticamente dopo 5 secondi
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Suono di notifica
      playNotificationSound();

      console.log('Notifica di test inviata con successo');
      return true;
    } catch (error) {
      console.error('Errore nell\'invio notifica di test:', error);
      return false;
    }
  };

  const playNotificationSound = () => {
    try {
      // Crea un suono di notifica usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Suono di notifica (due toni)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('Suono di notifica riprodotto');
    } catch (error) {
      console.log('Impossibile riprodurre suono:', error);
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
