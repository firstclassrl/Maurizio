// Service Worker per Push Notifications - LexAgenda
const CACHE_NAME = 'lexagenda-sw-v1';
const STATIC_CACHE_NAME = 'lexagenda-static-v1';
const urlsToCache = [
  '/',
  '/favicon.png',
  '/logo studio legale maurizio.png',
  '/Marchio AbruzzoAI.png'
];

// Installazione Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installazione in corso...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aperto');
        // Cache solo i file che esistono realmente
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Service Worker: Impossibile cacheare ${url}:`, error);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('Service Worker: Installazione completata');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Errore durante installazione:', error);
        return self.skipWaiting();
      })
  );
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Attivazione in corso...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Rimozione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Attivazione completata');
      return self.clients.claim();
    }).then(async () => {
      const all = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of all) {
        client.postMessage({ type: 'SW_READY' });
      }
    })
  );
});

// Gestione Push Notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Ricevuta push notification');
  
  let notificationData = {
    title: 'LexAgenda',
    body: 'Nuova notifica',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Apri App',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Chiudi',
        icon: '/favicon.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  // Se i dati sono disponibili, personalizza la notifica
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || 'LexAgenda',
        body: data.body || 'Nuova notifica',
        data: {
          ...notificationData.data,
          ...data.data
        }
      };
    } catch (error) {
      console.log('Service Worker: Errore nel parsing dei dati:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Gestione click su notifica
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Click su notifica', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Apri l'app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Se l'app è già aperta, portala in primo piano
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Se l'app non è aperta, aprila
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'close') {
    // Chiudi la notifica (già fatto con event.notification.close())
    console.log('Service Worker: Notifica chiusa');
  }
});

// Gestione messaggi dal client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Ricevuto messaggio:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestione fetch per cache
self.addEventListener('fetch', (event) => {
  // Solo per richieste GET
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Per l'index.html, usa sempre la rete per verificare aggiornamenti
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se la risposta è valida, aggiorna la cache
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Se la rete fallisce, usa la cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Per gli asset statici, usa cache-first
  if (url.pathname.startsWith('/assets/') || url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Per altre richieste, usa network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

console.log('Service Worker: Caricato e pronto');
