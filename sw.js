'use strict';
const PREFIX = 'grow-vault:' + encodeURIComponent(self.registration.scope) + ':';
const CACHE = PREFIX + 'v6';
const ASSETS = ['./', './index.html', './engine.js?v=6', './app.js?v=6', './manifest.webmanifest'];
const URLS = new Set(ASSETS.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([...URLS])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  // Never intercept another app, external API, or URL with unrelated query data.
  if (event.request.method !== 'GET' || !URLS.has(event.request.url)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type !== 'opaque') event.waitUntil(cache.put(event.request, response.clone()).catch(() => {}));
      return response;
    } catch {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      return Response.error();
    }
  })());
});
