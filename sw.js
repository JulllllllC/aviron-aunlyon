// AvironCoach — Service Worker désactivé
// L'app n'utilise plus de cache hors-ligne (voir le script de nettoyage dans index.html).
// Ce fichier se contente de se désinscrire lui-même et de vider tous les caches existants,
// pour tous les appareils qui avaient encore l'ancien Service Worker actif.
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) { return caches.delete(key); }));
    }).then(function() {
      return self.registration.unregister();
    }).then(function() {
      return self.clients.matchAll({type: 'window'});
    }).then(function(clients) {
      clients.forEach(function(client) { client.navigate(client.url); });
    })
  );
});
