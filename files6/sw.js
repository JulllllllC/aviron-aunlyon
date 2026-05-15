// AvironCoach — Service Worker PWA
const CACHE_NAME = 'aviron-coach-v20260515';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Network only — pas de cache pour éviter les problèmes
self.addEventListener('fetch', function(event) {
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('fonts.googleapis.com')) return;
  if (event.request.url.includes('fonts.gstatic.com')) return;
  if (event.request.url.includes('cdn.jsdelivr.net')) return;
  // Laisser passer toutes les requêtes normalement
  event.respondWith(fetch(event.request).catch(function() {
    return caches.match(event.request);
  }));
});

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-152.png'
];

// Installation
self.addEventListener('install', function(event) {
  self.skipWaiting(); // Force l'activation immédiate
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function(){});
    })
  );
});

// Activation — supprime TOUS les anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) {
              console.log('SW: suppression ancien cache', key);
              return caches.delete(key);
            })
      );
    }).then(function() {
      // Prend le contrôle de tous les clients immédiatement
      return self.clients.claim();
    })
  );
});

// Fetch — Network First, cache en fallback
self.addEventListener('fetch', function(event) {
  // Ne pas intercepter les requêtes externes
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('fonts.googleapis.com')) return;
  if (event.request.url.includes('fonts.gstatic.com')) return;
  if (event.request.url.includes('cdn.jsdelivr.net')) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (response.status === 200 && event.request.method === 'GET') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('/index.html');
        });
      })
  );
});

// Message pour forcer la mise à jour depuis l'app
self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
