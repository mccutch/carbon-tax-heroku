
self.addEventListener('install', function(event) {
  console.log("Install sw.js v-9")
  // cache a cat SVG
  event.waitUntil(
   caches.open('cache1').then(function(cache) {
     return cache.addAll([
       '/index.html',
       '/static/pointPerpNarrow.jpg',
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
self.addEventListener('fetch', (event) => {
  console.log(event.request.method)
  event.respondWith(async function() {

    const networkResponse = await fetch(event.request);

    if(event.request.method==="GET"){
      const cache = await caches.open('dynamic-cache2');
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;

      event.waitUntil(
        cache.put(event.request, networkResponse.clone())
      );
    }
    
    
    return networkResponse;
  }());
});
/*
self.addEventListener('fetch', (event) => {
  event.respondWith(async function() {
    const cache = await caches.open('dynamic-cache2');
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) return cachedResponse;
    const networkResponse = await fetch(event.request);
    event.waitUntil(
      async function() {
        if(!toString(event.request.url).includes("refresh")){
          console.log(`Saving to cache: ${event.request.url}`)
          cache.put(event.request, networkResponse.clone())
        }else{
          console.log(`CACHE REJECT: ${event.request.url}`)
        }
      }
      
    );
    return networkResponse;
  }());
});
*/

