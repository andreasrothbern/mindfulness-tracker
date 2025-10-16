// src/sw.js - Custom Service Worker für Mindfulness App

const CACHE_NAME = 'mindfulness-app-v1';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/styles.css',
  '/polyfills.js',
  '/main.js'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching files');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('[SW] Installed successfully');
        return self.skipWaiting();
      })
  );
});

// Aktivierung
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch-Strategie: Cache First, dann Network
self.addEventListener('fetch', (event) => {
  // Nur für GET-Requests cachen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Wenn im Cache gefunden, sofort zurückgeben
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Ansonsten vom Netzwerk laden
        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Nur erfolgreiche Responses cachen
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Response klonen für Cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Offline-Fallback für HTML-Seiten
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background Sync für Offline-Daten (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'trigger-sync') {
    console.log('[SW] Background sync triggered');
    // Hier könntest du offline-Daten synchronisieren
  }
});

// Push Notifications (für später)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png'
    };

    event.waitUntil(
      self.registration.showNotification('Mindfulness Reminder', options)
    );
  }
});
