'use strict';
// Static learning shell only. No authenticated responses or student records are cached.
const CACHE='abbate-learning-v41';
const ASSETS=["./styles.css?v=18","./experience.css?v=4","./i18n-packs.js?v=9","./i18n-ru.js?v=1","./i18n-uk.js?v=1","./i18n-modern.js?v=2","./i18n.js?v=12","./practice-bank.js?v=1","./practice-expansion.js?v=1","./practice-expansion-final.js?v=1","./app.js?v=35","./portal-language.js?v=1","./portal.css?v=8","./konten-model.js?v=1","./manifest.webmanifest?v=9","./icon-192.png?v=9","./icon-512.png?v=9","./icon-maskable.png?v=9","./apple-touch-icon.png?v=9","./favicon.png?v=9","./assets/logo-abbate.png","./assets/abbate-stapler-kundenfoto-hq.avif","./assets/theorie-schulung.webp","./assets/fonts/barlow-600.woff","./assets/fonts/barlow-700.woff","./assets/fonts/barlow-800.woff","./assets/fonts/source-sans-400.woff","./assets/fonts/source-sans-600.woff","./assets/fonts/source-sans-700.woff"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('andreas-demo-shell-')||k.startsWith('abbate-learning-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.mode==='navigate')return;const url=new URL(e.request.url);if(url.origin!==self.location.origin||!ASSETS.some(a=>new URL(a,self.registration.scope).pathname===url.pathname))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});

// Cache the selected translated question pack after its first successful
// download; do not force every learner to download 25 languages on install.
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const prefix=new URL('./practice-translations/',self.registration.scope).pathname;
  if(url.origin!==self.location.origin||!url.pathname.startsWith(prefix)||!url.pathname.endsWith('.js'))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    try{
      const response=await fetch(event.request);
      if(response.ok)await cache.put(event.request,response.clone());
      return response;
    }catch{
      return await cache.match(event.request)||Response.error();
    }
  }));
});
