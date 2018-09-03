
/**
 * I really struggled with this section. I found a link on slack that was posted by @MinimumViablePerson
 *  that led me to a great resource with samples of the service worker being used in different ways. After
 * reading it numerous time and a lot of googling later i was able to get it working correctly.
 * here is the link to the repo.
 * https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker
 */

import { dbPromise } from './js/indb';
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
  if (event.request.url.indexOf('sockjs-node/info') !== -1) return; //webpack-dev-server related
  if (event.request.url.indexOf('reviews') !== -1) {
    console.log('reviews');
    return;
  }
  // If the URL contains the port of the server then dont cache the request.x
  if (event.request.url.indexOf(':1337')!== -1) {
    let id = event.request.url.indexOf('id=') == -1 ? -1 // assign -1 as id
    : event.request.url.split('id=').pop(); //pull id off the end of the url
    apiCall(event, id);
  } else {
    nonApiCall(event);
  }
});
/**
 * Handle calls to the backend api 
 */
  const apiCall = (event, id) => {
    id = parseInt(id);
    console.log(id);
    event.respondWith(
      dbPromise.then(db => {
        let tx = db.transaction('restaurants', 'readonly');
        let store = tx.objectStore('restaurants');
        return store.get(id);
      })
      .then(data => {
        return (
          (data && data.data) ||
          fetch(event.request)
          .then(res => res.json())
          .then(json => {
            return dbPromise.then(db => {
              let tx = db.transaction('restaurants', 'readwrite');
              let store = tx.objectStore('restaurants');
              store.put({
                id,
                data: json
              });
              tx.complete;
              return json;
            });
          })
        );
      })
      .then(response => new Response(JSON.stringify(response)))
      .catch(error => new Response("Error fetching data", {status: 500}))
    );
  }
/**
 * Handle non api calls
 */
  const nonApiCall = (event) => {
    //console.log(event.request.url);
    event.respondWith(
      caches.match(event.request).then(res => {
        if (res) return res;
        const reqCopy = event.request.clone();
        return fetch(reqCopy).then(res => {//
          if (res.type == 'basic' || event.request.url.indexOf('https://api.tiles.mapbox.com/v4/' != -1) || event.request.url.indexOf('googleapis.com' != -1)){
          const resCopy = res.clone();
          caches.open(FETCHED).then(cache => {
            cache.put(event.request, resCopy);
          });
          return res;
        }
        });
      })
    );
  }

