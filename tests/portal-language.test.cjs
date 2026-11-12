'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

function languageRegistry(){
  const context={console};context.globalThis=context;vm.createContext(context);
  for(const file of ['i18n-packs.js','i18n-ru.js','i18n-uk.js','i18n-modern.js','i18n.js'])
    vm.runInContext(read('dist/'+file),context,{filename:file});
  return context.ABBATE_I18N;
}

test('learning, account, records and admin share all 26 native-language options',()=>{
  const registry=languageRegistry();
  const langs=registry.languages.map(l=>l.code);
  assert.equal(langs.length,26);
  assert.equal(new Set(langs).size,26);
  for(const code of langs){
    assert.ok(registry.shellLabels[code],'Missing shared shell translation: '+code);
    assert.equal(registry.shellLabels[code].length,6,'Incomplete shared shell copy: '+code);
  }
  for(const file of ['dist/konto.html','dist/nachweise.html','dist/verwaltung.html']){
    const html=read(file);
    for(const id of ['portal-language','portal-language-dialog','portal-language-search','portal-language-grid'])
      assert.ok(html.includes('id="'+id+'"'),file+' missing '+id);
    for(const code of ['learn','records','account','admin'])
      assert.ok(html.includes('data-nav="'+code+'"'),file+' missing navigation '+code);
    assert.match(html,/i18n-packs\.js\?v=9/);
    assert.match(html,/i18n\.js\?v=12/);
    assert.match(html,/portal-language\.js\?v=3/);
    assert.match(html,file==='dist/konto.html'?/portal\.js\?v=15/:/portal\.js\?v=13/);
    assert.match(html,file==='dist/konto.html'?/portal\.css\?v=8/:/portal\.css\?v=7/);
    assert.doesNotMatch(html,/<select id="portal-language"/,'Outdated four-language selector in '+file);
  }
});

test('portal translation uses the same preference and never changes user input or account values',()=>{
  const code=read('dist/portal-language.js');
  assert.match(code,/const languages=I18N\.languages/);
  assert.match(code,/const highlightedCopy=I18N\.shellLabels/);
  assert.match(code,/abbate-language-v1/);
  assert.match(code,/MutationObserver\(apply\)/);
  assert.match(code,/NodeFilter\.SHOW_TEXT/);
  assert.match(code,/localStorage\.setItem\(STORAGE,code\)/);
  assert.match(code,/I18N\.load\(current\)/);
  assert.match(code,/addEventListener\('storage'/);
  assert.doesNotMatch(code,/\.innerHTML\s*=/);
  assert.doesNotMatch(code,/querySelectorAll\('input/);
  for(const term of ['Зареєструвати обліковий запис','Зарегистрировать учётную запись','Zaregistrovat účet'])
    assert.ok(code.includes(term),'Missing reviewed portal phrase: '+term);
});

test('navigation keeps staff-only routes hidden unless backend allows them',()=>{
  const portal=read('dist/portal.js');
  assert.match(portal,/link\.hidden=!state\?\.me\|\|!B\.isStaff\(state\.me\)/);
  assert.match(portal,/const day=value=>new Intl\.DateTimeFormat\(localStorage\.getItem/);
  assert.match(read('dist/app.js'),/passLabel\(\)/);
  assert.match(read('dist/app.js'),/nachweise\.html/);
  assert.doesNotMatch(read('dist/app.js'),/passPreviewLabel\(\) · DE/);
});

test('cross-page locale scripts and entry points are syntactically valid',()=>{
  for(const path of ['dist/i18n.js','dist/portal-language.js','dist/portal.js','dist/app.js']){
    assert.doesNotThrow(()=>new vm.Script(read(path),{filename:path}),'JS syntax invalid in '+path);
  }
});

// Visual regression guard: the Schulungspass does not show a redundant read-only label.
test('training record page has no Nur ansehen badge',()=>{
  const source=read('dist/portal.js');
  assert.doesNotMatch(source,/class=\"portal-readonly\"/);
});
