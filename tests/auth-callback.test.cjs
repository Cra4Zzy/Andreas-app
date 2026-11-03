'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const config=fs.readFileSync(path.join(__dirname,'../dist/backend-config.js'),'utf8');
const portal=fs.readFileSync(path.join(__dirname,'../dist/portal.js'),'utf8');

function evaluate(hash,hostname='cra4zzy.github.io'){
  const globals={location:{hash,search:'',hostname,protocol:'https:'}};
  // Node vm contexts do not inherit URLSearchParams; browsers supply it natively.
  vm.runInNewContext(config,{globalThis:globals,URLSearchParams});
  return globals;
}

test('auth scripts contain valid JavaScript syntax',()=>{
  assert.doesNotThrow(()=>new vm.Script(config));
  assert.doesNotThrow(()=>new vm.Script(portal));
});

test('valid recovery callback is captured before Supabase clears the fragment',()=>{
  const data=evaluate('#access_token=not-a-real-token&refresh_token=not-a-real-token&type=recovery');
  assert.equal(data.ABBATE_AUTH_RETURN.recovery,true);
  assert.equal(data.ABBATE_AUTH_RETURN.failed,false);
  assert.equal(JSON.stringify(data.ABBATE_AUTH_RETURN).includes('not-a-real-token'),false);
});

test('reused/expired callback remains flagged even if an old session exists',()=>{
  const data=evaluate('#error=access_denied&error_code=otp_expired&error_description=invalid');
  assert.equal(data.ABBATE_AUTH_RETURN.failed,true);
  assert.equal(data.ABBATE_AUTH_RETURN.recovery,false);
});

test('ordinary login navigation is not mistaken for a recovery callback',()=>{
  const data=evaluate('#einstellungen');
  assert.equal(data.ABBATE_AUTH_RETURN.failed,false);
  assert.equal(data.ABBATE_AUTH_RETURN.recovery,false);
});

test('custom portal URLs switch only on the verified app hostname',()=>{
  const publicSite=evaluate('').ABBATE_CONFIG;
  const brandedSite=evaluate('', 'app.gabelstaplerfahrschule-andreas.de').ABBATE_CONFIG;
  assert.equal(publicSite.portalUrl,'https://cra4zzy.github.io/Andreas-app/dist/konto.html');
  assert.equal(brandedSite.portalUrl,'https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html');
});

test('auth error and recovery guard are checked before loading signed-in profiles',()=>{
  const errorGuard=portal.indexOf("if(view==='login' && failedAuthLink){invalidResetLink();return;}");
  const recoveryGuard=portal.indexOf("if(view==='login' && (recoveryLinkAttempt || recoveryMode))");
  const profileLoad=portal.indexOf('await load();', recoveryGuard);
  assert.ok(errorGuard>0 && recoveryGuard>errorGuard);
  assert.ok(profileLoad>recoveryGuard,'Must not auto-redirect prior to handling callback');
  assert.ok(portal.includes('const authReturn = globalThis.ABBATE_AUTH_RETURN'));
  assert.match(portal,/!data\?\.session \|\| !recoveryMode/);
  assert.match(portal,/checked\.data\.user\.id!==data\.session\.user\?\.id/);
  assert.match(portal,/event==='PASSWORD_RECOVERY'/);
});
test('an old authenticated session alone never authorizes password-reset form',()=>{
  assert.match(portal,/Only Supabase's PASSWORD_RECOVERY callback authorizes this screen/);
  assert.match(portal,/if\(error \|\| !data\?\.session \|\| !recoveryMode\)/);
});
