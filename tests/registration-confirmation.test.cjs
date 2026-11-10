'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const portal=fs.readFileSync('dist/portal.js','utf8');
const backend=fs.readFileSync('dist/backend.js','utf8');
const html=fs.readFileSync('dist/konto.html','utf8');

test('successful registration prominently explains both confirmation and approval',()=>{
  assert.match(portal,/function registrationComplete\(email\)/);
  assert.match(portal,/Bestätigungslink/);
  assert.match(portal,/Ohne diese Bestätigung kannst du dich noch nicht anmelden/);
  assert.match(portal,/Freischaltung durch die Fahrschule/);
  assert.match(portal,/Registriere dich nicht erneut/);
  assert.match(portal,/registrationSuccessEmail=values\.email\.trim\(\)/);
  assert.match(portal,/if\(registrationSuccessEmail\)\{registrationComplete\(registrationSuccessEmail\);return;\}/);
});

test('rate-limit feedback handles the actual Supabase cooldown error',()=>{
  const functionBody=backend.match(/ function message\\(error\\)\\{[\\s\\S]*?\\n \\}/)?.[0];
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
  assert.match(html,/portal\.js\?v=14/);
  assert.match(html,/portal\.css\?v=8/);
  assert.match(html,/backend\.js\?v=7/);
});
