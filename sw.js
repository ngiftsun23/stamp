// STAMP service worker: cache the app shell, serve it offline.
// Bump CACHE when shipping changes so old caches are dropped.
const CACHE = 'stamp-v12';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from cache at once, refresh the cache in the background.
function staleWhileRevalidate(req, cacheKey = req) {
  return caches.open(CACHE).then(cache =>
    cache.match(cacheKey, { ignoreSearch: true }).then(hit => {
      const net = fetch(req)
        .then(res => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(cacheKey, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate' && url.origin === location.origin) {
    const scope = new URL('./', location.href).pathname;
    if (url.pathname === scope || url.pathname === scope + 'index.html') {
      e.respondWith(
        staleWhileRevalidate(new Request('./index.html'), './index.html')
          .then(res => res || caches.match('./index.html'))
      );
    } else {
      // Unknown page: let the server answer; offline, fall back to the app.
      e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    }
    return;
  }
  if (url.origin === location.origin || FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(staleWhileRevalidate(req));
  }
});
