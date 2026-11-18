'use strict';
(()=>{
 const button=document.querySelector('#confirm'),message=document.querySelector('#message'),title=document.querySelector('#title');
 // Fragment is not sent to the web server. Remove it before verification.
 let token=location.hash.match(/^#token_hash=([a-zA-Z0-9_-]{32,256})$/)?.[1]||'';
 history.replaceState(null,'',location.pathname);
 if(!token){message.textContent='Dieser Link ist unvollständig. Fordere über die Anmeldung eine neue Bestätigungs-E-Mail an.';return;}
 button.disabled=false;let busy=false;
 button.addEventListener('click',async()=>{
   if(busy||!token)return;
   busy=true;button.disabled=true;message.textContent='Deine Adresse wird bestätigt …';
   try{
     const config=globalThis.ABBATE_CONFIG;
     const response=await fetch(config.url+'/auth/v1/verify',{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({token_hash:token,type:'email'}),credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000)});
     if(!response.ok){
       if([400,401,403,422].includes(response.status)){token='';message.textContent='Dieser Link ist ungültig, abgelaufen oder bereits verwendet. Melde dich an oder fordere eine neue Bestätigungs-E-Mail an.';}
       else message.textContent='Die Bestätigung ist momentan nicht möglich. Bitte versuche es erneut.';
       return;
     }
     // No session is persisted or forwarded. School approval remains separate.
     token='';title.textContent='E-Mail-Adresse bestätigt.';message.textContent='Du kannst dich jetzt anmelden. Deinen Lernzugang schaltet die Fahrschule separat frei.';button.hidden=true;
   }catch{message.textContent='Die Verbindung konnte nicht hergestellt werden. Bitte versuche es erneut.';}
   finally{busy=false;button.disabled=!token;}
 });
})();