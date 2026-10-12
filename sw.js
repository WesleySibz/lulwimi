// Offline support. The page itself is fetched network-first so a new version shows up the first time
// you open the app online; everything else (scripts, audio) is served from cache and refreshed in the
// background. Bump CACHE when releasing so phones drop the old files.
const CACHE = 'lulwimi-v6';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()),
));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return r; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./'))),
    );
    return;
  }
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((r) => { if (r.ok && r.status === 200) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }),
  );
});
