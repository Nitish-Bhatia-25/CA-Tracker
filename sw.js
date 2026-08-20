// App-shell caching so the tracker can at least OPEN offline.
// Data still lives in a GitHub Gist, so logging/editing sessions
// still needs a connection — this only makes the shell (HTML/CSS/JS/
// icons) load instantly and work without a network.
const CACHE_NAME = 'ca-tracker-shell-v2';
const SHELL_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .catch(() => { /* non-fatal — first run may be offline */ })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle same-origin GETs (the app shell). Everything else —
  // in particular api.github.com reads/writes — passes straight
  // through untouched, so your data is never cached or stale.
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      // Cache-first for instant/offline loads; refreshes in the background.
      return cached || networkFetch;
    })
  );
});
