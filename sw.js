const FILES = 'v1';
const FETCHED = 'fetched';
const cacheFiles = [ // List of files that need to cache on install
  './',
  './index.html',
  './restaurant.html',
  './css/styles.css',
  './img/1.jpg',
  './img/2.jpg',
  './img/3.jpg',
  './img/4.jpg',
  './img/5.jpg',
  './img/6.jpg',
  './img/7.jpg',
  './img/8.jpg',
  './img/9.jpg',
  './img/10.jpg',
  './js/dbhelper.js',
  './js/main.js',
  './js/restaurant_info.js',
  'https://fonts.googleapis.com/css?family=Oswald|Mogra',
]

/**
 * Install the service worker and open the local cache.
 */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(FILES)
    .then(cache => cache.addAll(cacheFiles))
  );
});

/**
 * Activate and clean up old caches.
 */

self.addEventListener('activate', (event) => {
  const myCaches = [FILES, FETCHED];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !myCaches.includes(cacheName));
    })
    .then(oldCaches => {
      return Promise.all(oldCaches.map(oldCache => {
        return caches.delete(oldCache);
      }));
    })
  );
});

/**
 * Check all request to see if they exist is cache. If so return them. If not
 * clone the request and try to fetch it from the network. Check to make sure
 * the response is valid and if so clone it and add it to the cache before
 * returning it.
 */

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(res => {
      if (res) return res;
      const reqCopy = event.request.clone();
      return fetch(reqCopy).then(res => {
        if (!res || res.status != 200 || res.type !== 'basic') return res;
        const resCopy = res.clone();
        caches.open(FETCHED).then(cache => {
          cache.put(event.request, resCopy);
        });
        return res;
      });
    })
  );
});