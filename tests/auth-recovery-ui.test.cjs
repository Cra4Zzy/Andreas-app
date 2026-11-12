'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const portal=fs.readFileSync(path.join(__dirname,'../dist/portal.js'),'utf8');
const wait=()=>new Promise(resolve=>setImmediate(resolve));
function simulate({recovery=true,failed=false,hash='#type=recovery'}={}){
  const root={
    innerHTML:'',
    setAttribute(){},
    removeAttribute(){},
    addEventListener(){}
  };
  let callback;
  let loadCount=0;
  const uid='20000000-0000-0000-0000-000000000002';
  const client={auth:{
    getSession:async()=>({data:{session:{user:{id:uid}}},error:null}),
    getUser:async()=>({data:{user:{id:uid}},error:null}),
    onAuthStateChange:fn=>{callback=fn;}
  }};
  const backend={
    client,
    state:async()=>{loadCount++;return {me:{id:uid},students:[]}},
    termsAccepted:async()=>true
  };
  const location={hash,search:'',replace(){throw Error('Unexpected account redirect')}};
  const document={
    body:{dataset:{view:'login'}},
    querySelector:selector=>selector==='#portal-content'?root:{textContent:''},
    addEventListener(){}
  };
  const sandbox={
    globalThis:{ABBATE_BACKEND:backend,ABBATE_ACCOUNTS:{},ABBATE_AUTH_RETURN:{recovery,failed}},
    document,location,addEventListener(){},
    setInterval(){},
    setTimeout(fn){queueMicrotask(fn)}
  };
  vm.runInNewContext(portal,sandbox,{timeout:1000});
  return {root,emit:kind=>callback(kind),loadCount:()=>loadCount};
}

test('a previously signed-in account cannot satisfy an unverified recovery link',async()=>{
  const scene=simulate({recovery:true,failed:false});
  await wait();
  assert.match(scene.root.innerHTML,/Dieser Link ist nicht mehr gültig/);
  assert.doesNotMatch(scene.root.innerHTML,/id="password-form"/);
  assert.equal(scene.loadCount(),0);
});

test('an explicit verified recovery event is required before showing password form',async()=>{
  const scene=simulate({recovery:true,failed:false});
  await wait();
  scene.emit('SIGNED_IN');
  await wait();
  assert.doesNotMatch(scene.root.innerHTML,/id="password-form"/);
  scene.emit('PASSWORD_RECOVERY');
  await wait();
  assert.match(scene.root.innerHTML,/id="password-form"/);
  assert.equal(scene.loadCount(),0);
});

test('an error-flagged expired link cannot be reused despite a recovery callback',async()=>{
  const scene=simulate({recovery:true,failed:true});
  await wait();
  scene.emit('PASSWORD_RECOVERY');
  await wait();
  assert.match(scene.root.innerHTML,/Dieser Link ist nicht mehr gültig/);
  assert.doesNotMatch(scene.root.innerHTML,/id="password-form"/);
});

test('password-reset success revokes refresh sessions globally',()=>{
  assert.match(portal,/auth\.signOut\(\{scope:'global'\}\)/);
});

test('successful recovery callback shows a dedicated confirmation instead of expired-link error',async()=>{
  const scene=simulate({recovery:true,failed:false,hash:'#passwort-gesetzt'});
  await wait();
  assert.match(scene.root.innerHTML,/Dein neues Passwort ist gespeichert/);
  assert.match(scene.root.innerHTML,/Jetzt anmelden/);
  assert.doesNotMatch(scene.root.innerHTML,/Dieser Link ist nicht mehr gültig/);
  assert.equal(scene.loadCount(),0,'Success confirmation does not require a signed-in session');
});
test('success state wins over stale recovery URL while genuine invalid links remain blocked',()=>{
  assert.match(portal,/passwordResetCompleted=true;\s*passwordResetSuccess\(\);/);
  assert.match(portal,/if\(event==='SIGNED_OUT'&&!passwordResetCompleted\)/);
  assert.match(portal,/location\.replace\('\.\/konto\.html#passwort-gesetzt'\)/);
});
