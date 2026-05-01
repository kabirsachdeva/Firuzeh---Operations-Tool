const CACHE = 'firuzeh-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, clone));
      return res;
    }))
  );
});
