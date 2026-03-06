const CACHE_NAME = 'sea-diary-cache-v232';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event: Caches vital files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache v232');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate Event: Cleans up old caches from previous versions
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-First Strategy with Firebase/Weather Bypass
self.addEventListener('fetch', event => {
  // CRITICAL: Do not cache Firebase database calls or Weather API calls
  if (event.request.url.includes('firestore') || 
      event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('weatherapi.com')) {
      return; 
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response so we can save a copy to the offline cache
        let responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If network fails (you are entirely offline), serve the app from cache
        return caches.match(event.request);
      })
  );
});
