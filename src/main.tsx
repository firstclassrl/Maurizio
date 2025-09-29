import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Registra Service Worker per Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrato con successo:', registration.scope);
        
        // Verifica se c'è un aggiornamento disponibile
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nuovo Service Worker disponibile');
                // attiva subito il nuovo SW
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('❌ Registrazione Service Worker fallita:', registrationError);
      });
  });

  // Gestione aggiornamenti Service Worker
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker aggiornato');
    // Ricarica la pagina per usare il nuovo Service Worker
    window.location.reload();
  });

  // Messaggio dal SW quando è pronto: ricarica in modo gentile
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_READY') {
      console.log('📦 Nuova versione pronta');
      // Reload soft con preservazione scroll
      const { scrollX, scrollY } = window;
      window.location.reload();
      window.scrollTo(scrollX, scrollY);
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)