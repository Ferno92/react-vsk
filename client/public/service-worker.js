
// Flag for enabling cache in production
var doCache = true;

var CACHE_NAME = 'pwa-app-cache';
var cacheVersion = 1;

// Delete old caches
self.addEventListener('activate', event => {
  const currentCachelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(keyList =>
        Promise.all(keyList.map(key => {
          if (!currentCachelist.includes(key)) {
            return caches.delete(key);
          }
        }))
      )
  );
});

// This triggers when user starts the app
self.addEventListener('install', function (event) {
  if (doCache) {
    event.waitUntil(
      caches.open(CACHE_NAME + cacheVersion)
        .then(function (cache) {
          fetch('asset-manifest.json')
            .then(response => {
              console.log("waitUntil response ", response);
              return response.json();
            })
            .then(assets => {
              // We will cache initial page and the main.js
              // We could also cache assets like CSS and images
              const urlsToCache = [
                '/',
                assets['main.js'],
                'offline.html'
              ];
              console.log("cached urls: ", urlsToCache);
              return cache.addAll(urlsToCache);
            })
        })
    );
  }
});

// Here we intercept request and serve up the matching files
self.addEventListener('fetch', function (event) {
  if (doCache) {
    // request.mode = navigate isn't supported in all browsers
    // so include a check for Accept: text/html header.
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
      event.respondWith(
        fetch(event.request.url).catch(error => {
          // Return the offline page
          return caches.match('offline.html');
        })
      );
    }
    else {
      // Respond with everything else if we can
      event.respondWith(caches.match(event.request)
        .then(function (response) {
          return response || fetch(event.request);
        })
      );
    }

  }
});