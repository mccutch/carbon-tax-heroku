
self.addEventListener('install', function(event) {
  console.log("SW: Install sw.js v-12")
  // cache a cat SVG
  event.waitUntil(
   caches.open('cache1').then(function(cache) {
     return cache.addAll([
       '/index.html',
       '/static/pointPerpNarrow.jpg',
       //'/sw.js',
       //'/static/manifest.json',
     ]);
   })
  );
})
/*
self.addEventListener('fetch', function(event) {

  console.log(`FETCH intercepted: ${event.request.url}`);

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
*/



//https://jakearchibald.com/2014/offline-cookbook/#on-network-response
// Cache first, then fall back to network. Doesn't update the cache on network success
self.addEventListener('fetch', (event) => {
    // Parse the URL:
  let request = event.request
  const requestURL = new URL(event.request.url);
  

  // Routing for local URLs
  if (requestURL.origin == location.origin) {

    console.log(`Fetch(local) ${request.method}: ${requestURL.pathname}`)
    if (request.method == 'GET') {
      console.log(`SW: ${request.method} request.`)
      event.respondWith(async function() {
        // Dynamic user cache is cleared on logout in myJWT.js
        let cacheName = requestURL.pathname.startsWith('/user') ? 'dynamic-user' : 'dynamic-pageLoad'

        const cache = await caches.open(cacheName);

        let networkResponse = await fetch(event.request).then((response) =>{
          if (response.status === 200) {
            console.log(`SW: Saved to ${cacheName}: ${requestURL.pathname}`)
            cache.put(event.request, response.clone())
            return response
          } else {
            console.log(`SW: NOT SAVED to cache: ${requestURL.pathname}`)
            return response
          }
        })
        
        if(cacheName === 'dynamic-pageLoad'){

          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) return cachedResponse;
        }
        
        return networkResponse
      }());
    } else {
      console.log(`SW: ${request.method} request.`)
      event.respondWith(
        fetch(request)
      );
      return;
    }


  } else {
  // Take no action for cross-site fetch requests.
    console.log(`SW: Fetch(cross-site) ${request.method}: ${requestURL}`);
    event.respondWith(async function() {
      return fetch(event.request);
    }());
  }
});






/*
self.addEventListener('fetch', (event) => {
  //console.log(event.request.method)
  event.respondWith(async function() {

    const networkResponse = await fetch(event.request);

    if(event.request.method==="GET"){
      console.log(`GET`)
      const cache = await caches.open('dynamic-cache2');
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;

      event.waitUntil(
        cache.put(event.request, networkResponse.clone())
      );
    } else {
      console.log(`${event.request.method}`)
    }
    
    
    return networkResponse;
  }());
});



self.addEventListener('fetch', (event) => {
  event.respondWith(async function() {
    const cache = await caches.open('mysite-dynamic');
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) return cachedResponse;
    const networkResponse = await fetch(event.request);
    event.waitUntil(
      cache.put(event.request, networkResponse.clone())
    );
    return networkResponse;
  }());
});
*/

