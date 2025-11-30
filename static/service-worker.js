const CACHE_NAME = "barberia-cache-v1";

const OFFLINE_FILES = [
  "/offline.html",
  "/css/offline.css",
  "/img/logo.jpg",
  "/img/icon-192.png",
  "/img/icon-512.png"
];

// Instalación del SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_FILES))
  );
  console.log("💈 Service Worker instalado");
});

// Activación
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  console.log("💈 Service Worker activado");
});

// Estrategia: Cache → Red → Offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      if (resp) return resp;

      return fetch(event.request)
        .then(networkResp => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResp.clone());
            return networkResp;
          });
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
        });
    })
  );
});
