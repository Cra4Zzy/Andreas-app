'use strict';
/*
 * Keep only the kind of callback and any error flag, never credentials/tokens.
 * Supabase may consume the URL fragment while initializing the client.
 */
globalThis.ABBATE_AUTH_RETURN=(()=>{
  const hash=new URLSearchParams(globalThis.location?.hash?.slice(1)||'');
  const query=new URLSearchParams(globalThis.location?.search||'');
  return Object.freeze({
    recovery:hash.get('type')==='recovery'||query.get('type')==='recovery',
    failed:hash.has('error')||hash.has('error_code')||query.has('error')||query.has('error_code')
  });
})();
// Only the public project key belongs in the app. Never place service-role keys here.
globalThis.ABBATE_CONFIG=Object.freeze({
  url:'https://qyizzwqrruwojtriqfuc.supabase.co',
  publishableKey:'sb_publishable_Hi-fik6cinX8mdyMquIm3g_f7OjSI8O',
  // Use the branded URL only when the website is actually running on that host.
  // Until DNS, GitHub Pages and Supabase redirects are ready, existing links remain usable.
  portalUrl:globalThis.location?.protocol==='https:' && globalThis.location?.hostname==='app.gabelstaplerfahrschule-andreas.de'
    ? 'https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html'
    : 'https://cra4zzy.github.io/Andreas-app/dist/konto.html',
  environment:'pilot'
});
