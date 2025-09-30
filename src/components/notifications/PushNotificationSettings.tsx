import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Bell, BellOff, Smartphone, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useInAppNotifications } from '../../hooks/useInAppNotifications';
import { InAppNotification } from './InAppNotification';

export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    toggleSubscription,
    sendTestNotification
  } = usePushNotifications();

  const { notifications, showNotification, removeNotification } = useInAppNotifications();
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const handleToggle = async () => {
    const success = await toggleSubscription();
    if (success) {
      console.log('Stato notifiche aggiornato');
    }
  };

  const handleTestNotification = async () => {
    setTestResult('idle');
    const success = await sendTestNotification();
    
    if (success) {
      setTestResult('success');
      // Mostra notifica in-app per Chrome
      if (navigator.userAgent.includes('Chrome')) {
        showNotification(
          'Notifica Inviata',
          'Notifica di test inviata con successo! (Chrome: potrebbe non essere visibile)',
          'success',
          4000
        );
      }
    } else {
      setTestResult('error');
      showNotification(
        'Errore',
        'Impossibile inviare la notifica di test',
        'error',
        4000
      );
    }
    
    // Reset del risultato dopo 3 secondi
    setTimeout(() => setTestResult('idle'), 3000);
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
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Non Supportato</p>
              <p className="text-sm text-gray-600">
                Le push notifications non sono supportate su questo dispositivo o browser.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifiche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle principale */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notifiche</p>
            <p className="text-sm text-gray-600">
              Ricevi notifiche per scadenze importanti
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={permission === 'denied' || isLoading}
          />
        </div>

        {/* Stato del permesso */}
        {permission === 'denied' && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Notifiche Disabilitate</p>
              <p className="text-sm text-red-800">
                Le notifiche sono state disabilitate. Abilita le notifiche nelle impostazioni del browser per ricevere promemoria.
              </p>
            </div>
          </div>
        )}

        {permission === 'default' && !isSubscribed && (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Bell className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Pronto per l'Attivazione</p>
              <p className="text-sm text-yellow-800">
                Clicca su "Abilita" per ricevere notifiche push per le tue scadenze.
              </p>
            </div>
          </div>
        )}

        {isSubscribed && (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Notifiche Attive</p>
              <p className="text-sm text-green-800">
                Riceverai notifiche per le scadenze importanti.
              </p>
            </div>
          </div>
        )}

        {/* Test notification */}
        {isSubscribed && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Test Notifica</p>
                <p className="text-sm text-gray-600">
                  Invia una notifica di test per verificare che tutto funzioni
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Test
              </Button>
            </div>

            {/* Risultato test */}
            {testResult === 'success' && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✅ Notifica di test inviata con successo!
              </div>
            )}

            {testResult === 'error' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                ❌ Errore nell'invio della notifica di test
              </div>
            )}
          </div>
        )}

        {/* Informazioni aggiuntive */}
        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Notifiche immediate per scadenze urgenti</p>
            <p>• Funziona su tutti i browser moderni</p>
            <p>• Puoi disabilitare le notifiche in qualsiasi momento</p>
            <p>• Compatibile con Chrome, Firefox, Safari, Edge</p>
            <p>• Suono di notifica incluso</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Notifiche in-app */}
    {notifications.map(notification => (
      <InAppNotification
        key={notification.id}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        duration={notification.duration}
        onClose={() => removeNotification(notification.id)}
      />
    ))}
  </>
  );
}
