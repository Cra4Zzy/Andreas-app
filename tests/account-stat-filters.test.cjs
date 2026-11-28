'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const p=fs.readFileSync('dist/portal.js','utf8');
const source=p.slice(p.indexOf('  function matchesAccountStatus('),p.indexOf('  function people()'));
const match=new Function('state','M',source+'\nreturn matchesAccountStatus;')({me:{id:'self'}},{access:p=>p.access==='active'&&!p.expired});
const person=(access,extra={})=>({id:'p',role:'learner',access,...extra});
test('pending excludes staff, active excludes expired and inactive includes all blocked accounts',()=>{assert.equal(match(person('pending'),'pending'),true);assert.equal(match(person('pending',{role:'trainer'}),'pending'),false);assert.equal(match(person('active',{expired:true}),'active'),false);assert.equal(match(person('active',{expired:true}),'inactive'),true);assert.equal(match(person('paused'),'inactive'),true);assert.equal(match(person('pending'),'inactive'),true);assert.equal(match(person('active',{id:'self'}),'all'),false);});
test('summary controls select the matching filter, reset the search and open the mobile picker',()=>{assert.match(p,/data-account-stat/);assert.match(p,/aria-pressed="\$\{filter===key\}"/);const handler=p.slice(p.indexOf('function selectAccountStat('),p.indexOf('function peopleList('));assert.match(handler,/filter=key;search=''/);assert.match(handler,/setPickerOpen\(true\)/);assert.match(handler,/selected=matching\[0\]\?\.id\|\|null/);assert.match(p,/selectAccountStat\(stat.dataset.accountStat\)/);});

test('participant search opts out of browser and password-manager autofill',()=>{const input=p.match(/<input id="account-search"[^>]*>/)?.[0];assert.ok(input);assert.match(input,/autocomplete="off"/);assert.match(input,/name="abbate-directory-query"/);assert.match(input,/data-lpignore="true"/);assert.match(input,/data-1p-ignore/);});
