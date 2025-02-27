// Nombre de la caché
const CACHE_NAME = 'marcopolo-v1';
const STATIC_CACHE = 'marcopolo-static-v1';
const DYNAMIC_CACHE = 'marcopolo-dynamic-v1';

// Archivos a cachear inicialmente (recursos estáticos)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/register-sw.js',
  '/earth-sepia.jpg',
  '/night-sky.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-placeholder.svg'
];

// Determinar si estamos en desarrollo o producción
const isDevelopment = self.location.hostname === 'localhost' || 
                      self.location.hostname === '127.0.0.1';

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Precacheando recursos estáticos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
        return self.skipWaiting(); // Activar inmediatamente
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[Service Worker] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Reclamando control de clientes');
        return self.clients.claim(); // Tomar control de los clientes inmediatamente
      })
  );
});

// Estrategia de caché: Stale-While-Revalidate
// Sirve el contenido de la caché mientras actualiza la caché con la respuesta de la red
self.addEventListener('fetch', event => {
  // No interceptar solicitudes WebSocket en desarrollo
  if (event.request.url.startsWith('ws:') || 
      event.request.url.includes('/__vite_ping') ||
      event.request.url.includes('/@vite/client') && isDevelopment) {
    return;
  }
  
  // Ignorar solicitudes a Firebase y otras APIs externas
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebase') ||
      event.request.url.includes('unpkg.com') ||
      event.request.url.includes('flagcdn.com')) {
    return;
  }
  
  // En desarrollo, no cachear archivos de node_modules o archivos de Vite
  if (isDevelopment && (
      event.request.url.includes('node_modules') || 
      event.request.url.includes('/@') || 
      event.request.url.includes('?t=') || 
      event.request.url.includes('?v='))) {
    return;
  }
  
  // Manejar solicitudes de navegación (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(response => {
          return response || fetch(event.request);
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }
  
  // Para otras solicitudes, usar Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Devolver la respuesta cacheada mientras actualizamos la caché
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Verificar si la respuesta es válida
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                  console.log('[Service Worker] Recurso actualizado en caché:', event.request.url);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('[Service Worker] Error al obtener recurso:', error);
            // No hacer nada, simplemente devolver la respuesta cacheada
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});

// Evento para recibir mensajes desde la aplicación
self.addEventListener('message', event => {
  console.log('[Service Worker] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 