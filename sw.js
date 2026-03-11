/**
 * SalaJá - Service Worker
 * Handles caching for offline functionality
 */

const CACHE_NAME = "salaja-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./dashboard.html",
  "./calendario.html",
  "./horarios.html",
  "./definicoes.html",
  "./admin.html",
  "./reserva.html",
  "./minhas-reservas.html",
  "./perfil.html",
  "./login.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./logo.svg",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://unpkg.com/lucide@latest",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error("Failed to cache:", err);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests except for fonts and lucide
  if (
    !event.request.url.startsWith(self.location.origin) &&
    !event.request.url.includes("fonts.googleapis.com") &&
    !event.request.url.includes("fonts.gstatic.com") &&
    !event.request.url.includes("unpkg.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline fallback for HTML requests
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html");
          }
        });
    }),
  );
});

// Handle messages from the main app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
