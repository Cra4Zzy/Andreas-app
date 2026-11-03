'use strict';
// Static learning shell only. No authenticated responses or student records are cached.
const CACHE='abbate-learning-v19';
const ASSETS=["./styles.css?v=13","./i18n-packs.js?v=9","./i18n.js?v=9","./app.js?v=19","./konten-model.js?v=1","./manifest.webmanifest?v=9","./icon-192.png?v=9","./icon-512.png?v=9","./icon-maskable.png?v=9","./apple-touch-icon.png?v=9","./favicon.png?v=9","./assets/logo-abbate.png","./assets/abbate-stapler-kundenfoto.avif","./assets/theorie-schulung.webp","./assets/fonts/barlow-600.woff","./assets/fonts/barlow-700.woff","./assets/fonts/barlow-800.woff","./assets/fonts/source-sans-400.woff","./assets/fonts/source-sans-600.woff","./assets/fonts/source-sans-700.woff"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('andreas-demo-shell-')||k.startsWith('abbate-learning-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.mode==='navigate')return;const url=new URL(e.request.url);if(url.origin!==self.location.origin||!ASSETS.some(a=>new URL(a,self.registration.scope).pathname===url.pathname))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
