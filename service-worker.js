const CACHE_NAME = 'sea-diary-cache-v252';
const urlsToCache = [
  '/',
  '/index.html?v=252',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => { return cache.addAll(urlsToCache); }));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.map(key => { if (key !== CACHE_NAME) return caches.delete(key); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore') || event.request.url.includes('firebaseio.com')) return;
  event.respondWith(fetch(event.request).catch(() => { return caches.match(event.request); }));
});
