const files = 'v2';
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
self.addEventListener('install', (e) =>{
  console.log("[SERVICE_WORKER] Installed");
  e.waitUntil(
    caches.open(files)
      .then(cache => cache.addAll(cacheFiles))
  );
});

/**
 * Activate and clean up old caches.
 */

self.addEventListener('activate', (e) =>{
  console.log("[SERVICE_WORKER] Activated");
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!files.includes(key)){
          return caches.delete(key);
        }
      })
    ))
    .then(() => self.clients.claim())
  );
});



