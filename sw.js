const CACHE_NAME = 'ethio-super-ai-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './profile.png',
  './profile2.png',
  './favicon.png',
  './manifest.json',
  './robots.txt',
  './sitemap.xml'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS).catch(error => {
          console.warn('Cache addAll error:', error);
          // Continue even if some assets fail to cache
          return Promise.resolve();
        });
      })
      .catch(error => {
        console.error('Cache open error:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            // Clone the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // Return offline page or cached response on network error
            return caches.match('./index.html');
          });
      })
      .catch(error => {
        console.error('Cache match error:', error);
        return fetch(event.request);
      })
  );
});
