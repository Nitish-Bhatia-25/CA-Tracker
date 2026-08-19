// Minimal service worker — required for "Add to Home Screen" to behave
// like a real app, but doesn't cache anything so you always get the
// latest version and your data always comes fresh from GitHub.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', () => {
  // pass-through, no caching
});
