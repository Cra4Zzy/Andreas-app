'use strict';
/* Abbate live web-update check. No native permissions or private user data. */
(() => {
  const build=document.querySelector('meta[name="abbate-build"]')?.content?.trim();
  if(!/^[0-9a-f]{40}$/.test(build||''))return;
  const endpoint=new URL('./build-info.json',document.baseURI);
  let busy=false,dirty=false,notice=null;
  document.addEventListener('input',e=>{if(e.target.closest?.('form'))dirty=true;},{passive:true});
  const unsafe=()=>{
    const q=new URLSearchParams(location.search),h=location.hash.toLowerCase();
    return dirty||!!document.querySelector('dialog[open]')||
      ['#uebung','#lernfragen','#ergebnis'].includes(h)||
      ['code','token_hash','access_token','error','error_code'].some(k=>q.has(k))||
      /access_token|refresh_token|type=recovery|error=/i.test(h);
  };
  function refresh(version){
    sessionStorage.setItem('abbate-update-tried',version);
    const next=new URL(location.href);
    next.searchParams.set('abbate_revision',version.slice(0,12));
    location.replace(next.href);
  }
  function banner(version){
    if(notice)return;
    notice=document.createElement('aside');
    notice.setAttribute('role','status');
    notice.style.cssText='position:fixed;z-index:9999;bottom:18px;right:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;max-width:calc(100vw - 36px);padding:13px 15px;border-radius:13px;background:#193942;color:#fff;box-shadow:0 10px 32px #102b3466;font:600 15px/1.4 system-ui,sans-serif';
    const msg=document.createElement('span');
    msg.textContent='Eine neue App-Version ist verfügbar.';
    const button=document.createElement('button');
    button.type='button';button.textContent='Jetzt aktualisieren';
    button.style.cssText='background:#f3c349;color:#193942;border:0;border-radius:9px;padding:10px 12px;font-weight:750;cursor:pointer';
    button.addEventListener('click',()=>refresh(version));
    notice.append(msg,button);document.body.append(notice);
  }
  async function check(){
    if(busy||document.visibilityState==='hidden')return;
    busy=true;
    try{
      const url=new URL(endpoint);url.searchParams.set('t',String(Date.now()));
      const res=await fetch(url,{cache:'no-store',credentials:'same-origin'});
      if(!res.ok)return;
      const json=await res.json();
      const version=json?.commit;
      if(typeof version!=='string'||!/^[0-9a-f]{40}$/.test(version)||version===build)return;
      if(!unsafe()&&sessionStorage.getItem('abbate-update-tried')!==version)refresh(version);
      else banner(version);
    }catch(error){/* No connection: keep learning app operational. */}
    finally{busy=false;}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});
  else check();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
  window.addEventListener('online',check);
  setInterval(check,300000);
})();