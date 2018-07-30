
/**
 * I really struggled with this section. I found a link on slack that was posted by @MinimumViablePerson
 *  that led me to a great resource with samples of the service worker being used in different ways. After
 * reading it numerous time and a lot of googling later i was able to get it working correctly.
 * here is the link to the repo.
 * https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker
 */
const idb = require('idb');
const FILES = 'v1';
const FETCHED = 'fetched';
const cacheFiles = [ // List of files that need to cache on install
  './',
  './index.html',
  './restaurant.html',
  './main.js',
  './restaurant_info.js',
  'https://fonts.googleapis.com/css?family=Oswald|Mogra',
]
const dbPromise = idb.open('places', 2, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
    //Placeholder for database creation
    case 1:
    console.log('Creating the datastore.')
    upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    upgradeDB.transaction.objectStore('restaurants').createIndex('neighborhood', 'neighborhood');
  }
})
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
  if (event.request.method != 'GET') return; // Exclude non GET events
  // If the URL contains the port of the server then dont cache the request.


  if (event.request.url.indexOf(':1337') !== -1){
    console.log(event.request.url.split('/'));
  }
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