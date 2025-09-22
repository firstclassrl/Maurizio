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
                // Qui potresti mostrare una notifica all'utente per aggiornare
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
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)