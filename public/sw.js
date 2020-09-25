const version = 22
const USER_CACHE = 'dynamic-user'
const PAGE_CACHE = 'dynamic-pageLoad'

function retrieveCacheList(){
  let response = fetch('/asset-manifest.json').then(res =>{
    if(res.ok){
      return res.json()
    }
  }).then(json =>{
    console.log(json)
    let list=[]
    for(let key in json.files){
      let str = new String(json.files[key])
      if(str.endsWith('.map')) continue;
      if(str.startsWith('/precache-manifest')) continue;
      if(str.endsWith('service-worker.js')) continue;
      list.push(str)
    }
    return list
  }).catch(error=>{
    console.log(error)
    return null
  })
  return response
}


self.addEventListener('install', function(event) {
  console.log(`SW: Install sw.js v-${version}`)
  self.skipWaiting();

  event.waitUntil(
    caches.open(PAGE_CACHE).then(async function(cache) {
      let assetsToCache = await retrieveCacheList()
      console.log(assetsToCache)
      assetsToCache=assetsToCache.concat([
        '/',
        '/sw.js',
        '/static/manifest.json',
        '/static/pointPerpNarrow.jpg',
        '/static/finger192.png',
        '/fueltypes/',
        '/static/finger128.ico',
        '/static/finger512.png',
      ])
      console.log(assetsToCache)
      for(let i in assetsToCache){
        cache.add(assetsToCache[i])
      }
      return
    })
  )
});


self.addEventListener('activate', event => {
  console.log(`sw.js v-${version} is active!!`);
});





//https://jakearchibald.com/2014/offline-cookbook/#on-network-response
//---FETCH EVENT--------------------------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  let request = event.request
  let requestURL = new URL(event.request.url);

//----------------------------------------------------------TAKE NO ACTION FOR: ----------------
  if (requestURL.origin!=location.origin ||                 // non-local urls
      request.method!='GET' ||                              // non-GET requests
      requestURL.pathname.startsWith('/function') ||        // api no-cache functions
      requestURL.pathname.startsWith('/account') ||         // api account functions
      requestURL.pathname.startsWith('/registration') ||    // api registration
      !requestURL.pathname.startsWith('/user') ||
      requestURL.pathname.startsWith('/api')                // api db operations
    ){
    console.log(`SW: Take no action - ${request.method}: ${requestURL}`);
    event.respondWith(fetch(event.request))
  } else {

  //---USE SERVICE WORKER-----------------------------------------------------------------------
    console.log(`SW: ${request.method}: ${requestURL.pathname}`)

    event.respondWith(async function() {
      // Dynamic user cache is cleared on logout in myJWT.js
      let mode = requestURL.pathname.startsWith('/user') ? 'user' : 'pageLoad'
      let cacheName =  mode==='user' ? USER_CACHE : PAGE_CACHE

      const cache = await caches.open(cacheName);

      //---GET NETWORK RESPONSE AND SAVE TO CACHE -----------------------------------
      networkResponse = fetch(event.request).then((response) =>{
        if(response.ok){
          if (response.status === 200) { 
            cache.put(event.request, response.clone()).then(()=>{
              console.log(`SW: Saved to ${cacheName}: ${requestURL.pathname}`)
            })
          } else {
            console.log(`SW: NOT SAVED to cache: ${requestURL.pathname}`)
          }
        }else{
          console.log(response)
        }      
        return response
      }).catch((error)=>{
        // No network response
        console.log(`SW: Error - ${error} (${requestURL.pathname})`)
        return new Response("Sorry, something went wrong.", {"status" : 500, "headers" : {"Content-Type" : "text/plain"}});
      })
      
      //---SERVE PAGE RESOURCES FROM CACHE -------------------------------------------
      if(mode==='pageLoad'){
        console.log(`SW: Returned cached result for ${requestURL.pathname}`)
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;
      }
      return networkResponse
    }());
  }
});
