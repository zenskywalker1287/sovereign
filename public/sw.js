/**
 * SOVEREIGN service worker — minimal offline shell.
 * The SW's URL is /sovereign/sw.js on GH Pages; its scope is its registered path.
 * All cache keys are resolved relative to the registration so base path works
 * transparently for GH Pages, root domain, or any future host.
 */
const CACHE = 'sovereign-v1';
const SHELL = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // bypass cross-origin (OpenRouter, Gemini, fonts, etc.)
  if (url.origin !== self.location.origin) return;
  // navigation: network-first, fall back to cached app shell index
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./'))
    );
    return;
  }
  // static: cache-first
  event.respondWith(
    caches.match(event.request).then((hit) =>
      hit ||
      fetch(event.request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
        }
        return res;
      })
    )
  );
});
