import { useState, useEffect } from 'react'
import { useToast } from '../components/ui/Toast'

interface AppUpdateState {
  isUpdateAvailable: boolean
  isUpdating: boolean
  updateApp: () => void
}

export function useAppUpdate(): AppUpdateState {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    // Registra il service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrato:', registration)

          // Controlla se c'è un aggiornamento disponibile
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // C'è un nuovo service worker installato
                  setIsUpdateAvailable(true)
                  showSuccess(
                    'Aggiornamento disponibile',
                    'È disponibile una nuova versione dell\'applicazione. Clicca per aggiornare.'
                  )
                }
              })
            }
          })

          // Controlla aggiornamenti ogni 30 secondi
          setInterval(() => {
            registration.update()
          }, 30000)

        })
        .catch((error) => {
          console.error('Errore nella registrazione del Service Worker:', error)
        })

      // Ascolta i messaggi dal service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_READY') {
          console.log('Service Worker pronto')
        }
      })

      // Controlla se c'è un service worker in attesa
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Il service worker è stato aggiornato, ricarica la pagina
        window.location.reload()
      })
    }
  }, [showSuccess])

  const updateApp = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setIsUpdating(true)
      
      // Invia messaggio al service worker per saltare l'attesa
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      
      // Forza il reload della pagina
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      showError('Errore', 'Impossibile aggiornare l\'applicazione')
    }
  }

  return {
    isUpdateAvailable,
    isUpdating,
    updateApp
  }
}
