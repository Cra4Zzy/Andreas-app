'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const portal=fs.readFileSync('dist/portal.js','utf8');
const backend=fs.readFileSync('dist/backend.js','utf8');
const html=fs.readFileSync('dist/konto.html','utf8');

test('successful registration prominently explains confirmation and immediate access',()=>{
  assert.match(portal,/function registrationComplete\(email\)/);
  assert.match(portal,/Bestätigungslink/);
  assert.match(portal,/Ohne diese Bestätigung kannst du dich noch nicht anmelden/);
  assert.match(portal,/Direkt mit dem Lernen beginnen/);
  assert.match(portal,/Registriere dich nicht erneut/);
  assert.match(portal,/registrationSuccessEmail=values\.email\.trim\(\)/);
  assert.match(portal,/if\(registrationSuccessEmail\)\{registrationComplete\(registrationSuccessEmail\);return;\}/);
});

test('rate-limit feedback handles the actual Supabase cooldown error',()=>{
  const functionBody=backend.slice(backend.indexOf(' function message(error){'),backend.indexOf('\n globalThis.ABBATE_BACKEND'));
  assert.ok(functionBody,'Error-message function must exist');
  const message=new Function(functionBody+';return message;')();
  const feedback=message({code:'over_email_send_rate_limit',message:'For security purposes, you can only request this after 20 seconds.'});
  assert.match(feedback,/20 Sekunden/);
  assert.match(feedback,/Du musst dich nicht erneut registrieren/);

  assert.match(backend,/over_email_send_rate_limit/);
  assert.match(backend,/you can only request this after/);
  assert.match(backend,/seconds/);
  assert.match(backend,/Du musst dich nicht erneut registrieren/);
});

test('login screen loads updated registration scripts and styling',()=>{
  assert.match(html,/portal\.js\?v=23/);
  assert.match(html,/portal\.css\?v=10/);
  assert.match(html,/backend\.js\?v=10/);
});

 test('spam warning is prominent before registration and before confirmation steps',()=>{
 const login=portal.slice(portal.indexOf('function login(){'),portal.indexOf('function registrationComplete(email)'));
 const success=portal.slice(portal.indexOf('function registrationComplete(email)'),portal.indexOf('function recovery(){'));
 for(const section of [login,success]){assert.match(section,/class="portal-spam-warning"/);assert.match(section,/Wichtig: Spamordner prüfen!/);assert.match(section,/in den Posteingang/);}
 assert.ok(login.indexOf('portal-spam-warning')<login.indexOf('id="register-form"'));
 assert.ok(success.indexOf('portal-spam-warning')<success.indexOf('portal-registration-complete__steps'));
 assert.match(fs.readFileSync('dist/portal.css','utf8'),/\.portal-spam-warning\{[^}]*border-left:/);
 assert.equal((html.match(/&amp;spam=1/g)||[]).length,3);
 });
