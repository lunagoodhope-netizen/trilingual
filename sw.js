const CACHE='trilingual-records-v4';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('trilingual-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith((async()=>{try{const r=await fetch(e.request,{cache:'no-store'});if(r.ok){const c=await caches.open(CACHE);await c.put(e.request,r.clone())}return r}catch(err){const old=await caches.match(e.request);if(old)return old;throw err}})())});
