'use strict';
// Demo assets only. No authenticated responses or student records are cached.
const CACHE='abbate-learning-v8';
const ASSETS=["./styles.css?v=8","./i18n.js?v=8","./app.js?v=8","./manifest.webmanifest?v=8","./icon-192.png?v=8","./icon-512.png?v=8","./icon-maskable.png?v=8","./apple-touch-icon.png?v=8","./favicon.png?v=8","./assets/logo-abbate.png","./assets/stapler-schulung.webp","./assets/theorie-schulung.webp","./assets/fonts/barlow-600.woff","./assets/fonts/barlow-700.woff","./assets/fonts/barlow-800.woff","./assets/fonts/source-sans-400.woff","./assets/fonts/source-sans-600.woff","./assets/fonts/source-sans-700.woff"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('andreas-demo-shell-')||k.startsWith('abbate-learning-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.mode==='navigate')return;const url=new URL(e.request.url);if(url.origin!==self.location.origin||!ASSETS.some(a=>new URL(a,self.registration.scope).pathname===url.pathname))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
