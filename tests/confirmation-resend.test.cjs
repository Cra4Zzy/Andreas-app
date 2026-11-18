'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const portal=fs.readFileSync('dist/portal.js','utf8');
test('resend is available in both signup and login',()=>{
  assert.match(portal,/function login\(\)[\s\S]*?\$\{resendControl\(\)\}/);
  assert.match(portal,/function registrationComplete\(email\)[\s\S]*?\$\{resendControl\(\)\}/);
});
test('uses signup resend API and blocks repeated clicks',async()=>{
  const code=portal.slice(portal.indexOf('  let resendUntil='),portal.indexOf('  function login(){'));
  let calls=0,feedback='';
  const input={value:'test@example.test',reportValidity:()=>true};
  const button={disabled:false},status={textContent:''};
  const root={querySelector:s=>s.includes('login-form')?input:status,querySelectorAll:()=>[button]};
  const B={client:{auth:{resend:async args=>{calls++;assert.equal(args.type,'signup');assert.equal(args.email,'test@example.test');assert.equal(args.options.emailRedirectTo,'https://example.test/konto.html');return {error:null};}}}};
  const run=new Function('root','B','view','state','registrationSuccessEmail','notice','setTimeout','globalThis',code+';return resendConfirmation;')(root,B,'login',{},null,t=>feedback=t,()=>{}, {ABBATE_CONFIG:{portalUrl:'https://example.test/konto.html'}});
  await run();await run();
  assert.equal(calls,1);assert.equal(button.disabled,true);assert.match(feedback,/Falls deine E-Mail-Adresse noch nicht bestätigt ist/);
});
