'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('dist/backend.js','utf8');
function openWindow(name='',storage={}){
  let authOptions;
  let removed=null;
  let sequence=0;
  const page={name};
  const browserStorage={
    getItem:key=>storage[key]??null,
    setItem:(key,val)=>{storage[key]=val;},
    removeItem:key=>{delete storage[key];}
  };
  const scope={
    window:page,sessionStorage:browserStorage,localStorage:{removeItem:key=>{removed=key;}},
    crypto:{randomUUID:()=>`00000000-0000-4000-8000-${String(++sequence).padStart(12,'0')}`},
    ABBATE_CONFIG:{url:'https://example.supabase.co',publishableKey:'sb_publishable_test'},
    AbbateSupabase:{createClient:(_url,_key,opts)=>{authOptions=opts.auth;return {auth:{}};}},
    ABBATE_ACCOUNTS:{today:()=>''}
  };
  scope.globalThis=scope;
  vm.runInNewContext(code,scope,{filename:'dist/backend.js'});
  return {page,authOptions,storage,removed};
}
test('new browser windows use different auth storage keys and never reuse old shared localStorage',()=>{
  const a=openWindow(),b=openWindow();
  assert.notEqual(a.authOptions.storageKey,b.authOptions.storageKey);
  assert.equal(a.authOptions.storage,a.storage && a.authOptions.storage);
  assert.equal(a.authOptions.persistSession,true);
  assert.equal(a.authOptions.detectSessionInUrl,true);
  assert.equal(a.removed,'abbate-auth-v1');
  assert.equal(b.removed,'abbate-auth-v1');
});
test('same window preserves auth context across page navigation and reload',()=>{
  const storage={};
  const before=openWindow('',storage);
  const after=openWindow(before.page.name,storage);
  assert.equal(before.authOptions.storageKey,after.authOptions.storageKey);
  assert.equal(before.authOptions.storage,after.authOptions.storage);
});
test('a signed-out window cannot clear a second window session storage',()=>{
  const one={};const two={};
  const a=openWindow('',one),b=openWindow('',two);
  one[a.authOptions.storageKey]='session-for-admin';
  two[b.authOptions.storageKey]='session-for-learner';
  a.authOptions.storage.removeItem(a.authOptions.storageKey);
  assert.equal(two[b.authOptions.storageKey],'session-for-learner');
});
test('regular logout is local; password recovery still globally invalidates sessions',()=>{
  const portal=fs.readFileSync('dist/portal.js','utf8');
  assert.match(portal,/data-logout[^\n]+signOut\(\{scope:'local'\}\)/);
  assert.match(portal,/auth\.signOut\(\{scope:'global'\}\)/);
});
