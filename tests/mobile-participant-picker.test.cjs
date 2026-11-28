'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/portal.js','utf8');
function setup(mobile=true){
 const handlers={},nodes={},classes=new Set();let focused=null,detailId=null;
 for(const id of ['account-picker','account-picker-toggle','account-search','account-list'])nodes['#'+id]={innerHTML:'',attrs:{'aria-expanded':'false'},classList:{toggle(c,on){on?classes.add(c):classes.delete(c)}},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},focus(){focused=id}};
 const students=Array.from({length:200},(_,i)=>({id:'p'+i,name:'Teilnehmer '+i,email:'person'+i+'@example.test',access:'active',role:'learner'}));
 const c={state:{students,me:{id:'staff',role:'admin'}},selected:'p0',search:'',filter:'all',view:'admin',safe:x=>String(x).replaceAll('<','&lt;'),badge:()=>'',paymentBadge:()=>'',M:{access:()=>true},B:{isStaff:()=>true},window:{matchMedia:()=>({matches:mobile})},document:{querySelector:s=>nodes[s]},requestAnimationFrame:fn=>fn(),focusOverviewRecord:id=>{c.focusedRecord=id},root:{querySelector:s=>nodes[s],querySelectorAll:()=>[],addEventListener:(name,fn)=>handlers[name]=fn},renderDetail:()=>{detailId=c.selected}};
 vm.runInNewContext(source.slice(source.indexOf('  function matchesAccountStatus('),source.indexOf('  function detail()')),c);
 vm.runInNewContext(source.slice(source.indexOf("  root.addEventListener('keydown'"),source.indexOf('  B.client.auth.onAuthStateChange')),c);
 return {c,nodes,classes,handlers,focused:()=>focused,detailId:()=>detailId};
}
test('mobile picker opens search, filters 200 accounts and closes after selection',async()=>{
 const s=setup(),toggle=s.nodes['#account-picker-toggle'];
 await s.handlers.click({target:{closest:q=>q==='#account-picker-toggle'?toggle:null}});
 assert.equal(toggle.attrs['aria-expanded'],'true');assert.ok(s.classes.has('is-open'));assert.equal(s.focused(),'account-search');
 s.handlers.input({target:{id:'account-search',value:'person137@'}});
 assert.match(s.nodes['#account-list'].innerHTML,/data-person="p137"/);assert.doesNotMatch(s.nodes['#account-list'].innerHTML,/data-person="p13"/);
 await s.handlers.click({target:{closest:q=>q==='[data-person]'?{dataset:{person:'p137'}}:null}});
 assert.equal(s.detailId(),'p137');assert.match(toggle.innerHTML,/Teilnehmer 137/);assert.equal(toggle.attrs['aria-expanded'],'false');assert.ok(!s.classes.has('is-open'));assert.equal(s.focused(),'account-picker-toggle');
});
test('empty search and Escape preserve the selected participant',()=>{
 const s=setup();s.c.setPickerOpen(true);
 s.handlers.input({target:{id:'account-search',value:'no match'}});assert.match(s.nodes['#account-list'].innerHTML,/Keine passenden Konten/);
 let prevented=false;s.handlers.keydown({key:'Escape',target:{closest:()=>true},preventDefault(){prevented=true}});
 assert.ok(prevented);assert.equal(s.c.selected,'p0');assert.equal(s.nodes['#account-picker-toggle'].attrs['aria-expanded'],'false');
});
test('desktop selection keeps the list available',async()=>{
 const s=setup(false);s.c.setPickerOpen(true);
 await s.handlers.click({target:{closest:q=>q==='[data-person]'?{dataset:{person:'p18'}}:null}});
 assert.equal(s.detailId(),'p18');assert.ok(s.classes.has('is-open'));
});

test('selection from the archive closes its dialog and opens the actual participant',async()=>{
 const s=setup();let closed=false;const dialog={close(){closed=true;}};
 await s.handlers.click({target:{closest:q=>q==='[data-person]'?{dataset:{person:'p19'}}:q==='#certificate-overview'?dialog:null}});
 assert.equal(closed,true);assert.equal(s.detailId(),'p19');
});

test('archive navigates to the exact record and resets conflicting account filters',async()=>{
 const s=setup();let closed=false;const dialog={close(){closed=true;}};
 s.c.search='other';s.c.filter='paused';
 await s.handlers.click({target:{closest:q=>q==='[data-person]'?{dataset:{person:'p19',overviewRecord:'record19'}}:q==='#certificate-overview'?dialog:null}});
 assert.equal(closed,true);assert.equal(s.detailId(),'p19');assert.equal(s.c.focusedRecord,'record19');assert.equal(s.c.search,'');assert.equal(s.c.filter,'all');
 assert.match(s.nodes['#account-list'].innerHTML,/data-person="p19" aria-pressed="true"/);
});

test('pending statistic opens filtered list and selects a matching account',async()=>{
 const s=setup();s.c.state.students[7].access='pending';s.c.state.students[12].access='pending';s.c.search='no match';
 await s.handlers.click({target:{closest:q=>q==='[data-account-stat]'?{dataset:{accountStat:'pending'}}:null}});
 assert.equal(s.c.filter,'pending');assert.equal(s.c.search,'');assert.equal(s.detailId(),'p7');assert.ok(s.classes.has('is-open'));
 assert.match(s.nodes['#account-list'].innerHTML,/data-person="p7"/);assert.match(s.nodes['#account-list'].innerHTML,/data-person="p12"/);assert.doesNotMatch(s.nodes['#account-list'].innerHTML,/data-person="p0"/);
});

test('active statistic rejects unsolicited name autofill but allows intentional search',async()=>{const s=setup(false),input=s.nodes['#account-search'];input.id='account-search';s.c.document.activeElement=null;await s.handlers.click({target:{closest:q=>q==='[data-account-stat]'?{dataset:{accountStat:'active'}}:null}});input.value='Andreas Abbate';s.handlers.input({target:input});assert.equal(input.value,'');assert.equal(s.c.search,'');assert.match(s.nodes['#account-list'].innerHTML,/data-person="p137"/);s.c.document.activeElement=input;input.value='Andreas Abbate';input.matches=selector=>selector===':autofill';s.handlers.input({target:input});assert.equal(input.value,'');assert.equal(s.c.search,'');input.matches=()=>false;input.value='person137@';s.handlers.input({target:input});assert.equal(s.c.search,'person137@');assert.match(s.nodes['#account-list'].innerHTML,/data-person="p137"/);assert.doesNotMatch(s.nodes['#account-list'].innerHTML,/data-person="p0"/);});
