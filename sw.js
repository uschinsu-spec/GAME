const BUILD='20260919-v98';
const CACHE={shell:'game-shell-v98',assets:'game-assets-v98',maps:'game-maps-v98'};
const OWN=new Set(Object.values(CACHE));
const SHELL=['./','./index.html','./style.css','./manifest.webmanifest','./build.json'];

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE.shell).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>/^game-(shell|assets|maps)-/.test(key)&&!OWN.has(key)).map(key=>caches.delete(key)))),
  self.clients.claim()
 ]).then(async()=>{
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  clients.forEach(client=>client.postMessage({type:'BUILD_ACTIVE',build:BUILD}));
 }));
});
async function networkFirst(request,cacheName,ignoreSearch=false){const cache=await caches.open(cacheName);try{const response=await fetch(request);if(response&&response.ok)cache.put(request,response.clone());return response;}catch(error){const cached=await cache.match(request,{ignoreSearch});if(cached)return cached;throw error;}}
async function staleWhileRevalidate(request,cacheName){const cache=await caches.open(cacheName),cached=await cache.match(request,{ignoreSearch:true});const update=fetch(request).then(response=>{if(response&&response.ok)cache.put(request,response.clone());return response;}).catch(()=>null);return cached||update;}
async function cacheFirst(request,cacheName){const cache=await caches.open(cacheName),cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;const response=await fetch(request);if(response&&response.ok)cache.put(request,response.clone());return response;}
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'||/\/index\.html$/.test(url.pathname)||/\/build\.json$/.test(url.pathname))return event.respondWith(networkFirst(request,CACHE.shell,true));
 if(/\/maps\/.*\.json$/.test(url.pathname))return event.respondWith(staleWhileRevalidate(request,CACHE.maps));
 if(/\.(png|webp|svg|jpg|jpeg|gif|mp3|ogg|wav)$/i.test(url.pathname))return event.respondWith(cacheFirst(request,CACHE.assets));
 if(/\.(js|css|json|webmanifest)$/i.test(url.pathname))return event.respondWith(networkFirst(request,CACHE.shell,true));
 event.respondWith(networkFirst(request,CACHE.shell));
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
