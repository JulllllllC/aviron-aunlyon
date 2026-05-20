// AvironCoach — Service Worker PWA
const CACHE_NAME = 'aviron-coach-v20260516';
const BASE = '/aviron-aunlyon/';
const STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  BASE + 'icon-152.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function(){});
    })
  );
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

self.addEventListener('fetch', function(event) {
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
          return cached || caches.match(BASE + 'index.html');
        });
      })
  );
});
