const CACHE_PREFIX = "salaJa-";
const CACHE_NAME = `${CACHE_PREFIX}v5`;
const LEGACY_CACHE_NAMES = ["salaJa-v2", "salaJa-v3", "salaJa-v4"];
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./login.html",
  "./dashboard.html",
  "./reserva.html",
  "./minhas-reservas.html",
  "./admin.html",
  "./gerir-espacos.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./logo.png",
  "./offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (name) =>
              (name.startsWith(CACHE_PREFIX) || LEGACY_CACHE_NAMES.includes(name)) &&
              name !== CACHE_NAME,
          )
          .map((name) => caches.delete(name)),
      ),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (
    request.method !== "GET" ||
    url.origin !== scope.origin ||
    !url.pathname.startsWith(scope.pathname)
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match(new URL("./offline.html", scope).href);
          }
          throw new Error(`Offline and no cached response for ${url.href}`);
        });
    }),
  );
});
