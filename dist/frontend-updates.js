'use strict';
/* Abbate live web-update check. No native permissions or private user data. */
(() => {
  const build=document.querySelector('meta[name="abbate-build"]')?.content?.trim();
  if(!/^[0-9a-f]{40}$/.test(build||''))return;
  const endpoint=new URL('./build-info.json',document.baseURI);
  let busy=false,dirty=false,notice=null,noticeVersion=null;
  const memory=new Map();
  function read(key){try{return sessionStorage.getItem(key)||memory.get(key)||null;}catch{return memory.get(key)||null;}}
  function write(key,value){memory.set(key,value);try{sessionStorage.setItem(key,value);}catch{}}
  const triedKey='abbate-update-tried',dismissKey='abbate-update-dismissed',manualKey='abbate-update-manual';
  document.addEventListener('input',e=>{if(e.target.closest?.('form'))dirty=true;},{passive:true});
  const unsafe=()=>{
    const q=new URLSearchParams(location.search),h=location.hash.toLowerCase();
    return dirty||!!document.querySelector('dialog[open], [data-abbate-update-block]')||
      ['#uebung','#lernfragen','#ergebnis'].includes(h)||
      ['code','token_hash','access_token','error','error_code'].some(k=>q.has(k))||
      /access_token|refresh_token|type=recovery|error=/i.test(h);
  };
  function clearBanner(){notice?.remove();notice=null;noticeVersion=null;}
  function freshURL(version){
    const next=new URL(location.href);
    next.searchParams.set('abbate_revision',version.slice(0,12));
    next.searchParams.set('abbate_reload',String(Date.now()));
    return next;
  }
  async function published(version){
    // FTP can publish the revision marker before the corresponding page.
    const next=freshURL(version);next.hash='';
    const response=await fetch(next,{cache:'no-store',credentials:'same-origin'});
    if(!response.ok)return false;
    const html=await response.text();
    return html.match(/<meta\s+name="abbate-build"\s+content="([a-f0-9]{40})"\s*\/?>/i)?.[1]===version;
  }
  function refresh(version,manual=false){
    write(triedKey,version);
    if(manual)write(manualKey,version);
    clearBanner();
    location.replace(freshURL(version).href);
  }
  function banner(version){
    if(read(dismissKey)===version||read(manualKey)===version){clearBanner();return;}
    if(noticeVersion===version&&notice)return;
    clearBanner();noticeVersion=version;
    notice=document.createElement('aside');
    notice.setAttribute('role','status');
    notice.style.cssText='position:fixed;z-index:9999;bottom:18px;right:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;max-width:calc(100vw - 36px);padding:12px 14px;border-radius:12px;background:#193942;color:#fff;box-shadow:0 8px 24px #102b3444;font:600 14px/1.4 system-ui,sans-serif';
    const msg=document.createElement('span');msg.textContent='Neue App-Version verfügbar.';
    const button=document.createElement('button');
    button.type='button';button.textContent='Aktualisieren';
    button.style.cssText='background:#f3c349;color:#193942;border:0;border-radius:8px;padding:10px 12px;font-weight:750;cursor:pointer';
    const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Update-Hinweis schließen');
    close.style.cssText='background:transparent;color:#fff;border:1px solid #ffffff78;border-radius:8px;width:36px;height:36px;font-size:23px;cursor:pointer';
    close.addEventListener('click',()=>{write(dismissKey,version);clearBanner();});
    button.addEventListener('click',async()=>{
      if(button.disabled)return;
      if(unsafe()&&!window.confirm('Jetzt aktualisieren? Nicht gespeicherte Eingaben können verloren gehen.'))return;
      button.disabled=true;button.textContent='Prüfe …';
      try{
        if(await published(version)){refresh(version,true);return;}
        msg.textContent='Update wird noch bereitgestellt.';button.textContent='Erneut prüfen';
      }catch{msg.textContent='Update momentan nicht erreichbar.';button.textContent='Erneut prüfen';}
      finally{button.disabled=false;}
    });
    notice.append(msg,button,close);document.body.append(notice);
  }
  async function check(){
    if(busy||document.visibilityState==='hidden')return;
    busy=true;
    try{
      const url=new URL(endpoint);url.searchParams.set('t',String(Date.now()));
      const res=await fetch(url,{cache:'no-store',credentials:'same-origin'});
      if(!res.ok)return;
      const json=await res.json(),version=json?.commit;
      if(typeof version!=='string'||!/^[0-9a-f]{40}$/.test(version))return;
      if(version===build){clearBanner();return;}
      if(read(dismissKey)===version||read(manualKey)===version){clearBanner();return;}
      if(!unsafe()&&read(triedKey)!==version){
        if(await published(version)){if(!unsafe()&&read(dismissKey)!==version){refresh(version);return;}}
        else return;
      }
      banner(version);
    }catch{/* No connection: keep learning app operational. */}
    finally{busy=false;}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});
  else check();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
  window.addEventListener('online',check);
  setInterval(check,300000);
})();
