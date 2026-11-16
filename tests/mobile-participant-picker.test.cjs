'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/portal.js','utf8');
function setup(mobile=true){
 const handlers={},nodes={},classes=new Set();let focused=null,detailId=null;
 for(const id of ['account-picker','account-picker-toggle','account-search','account-list'])nodes['#'+id]={innerHTML:'',attrs:{'aria-expanded':'false'},classList:{toggle(c,on){on?classes.add(c):classes.delete(c)}},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},focus(){focused=id}};
 const students=Array.from({length:200},(_,i)=>({id:'p'+i,name:'Teilnehmer '+i,email:'person'+i+'@example.test',access:'active',role:'learner'}));
 const c={state:{students,me:{id:'staff',role:'admin'}},selected:'p0',search:'',filter:'all',view:'admin',safe:x=>String(x).replaceAll('<','&lt;'),badge:()=>'',M:{access:()=>true},B:{isStaff:()=>true},window:{matchMedia:()=>({matches:mobile})},document:{querySelector:s=>nodes[s]},root:{addEventListener:(name,fn)=>handlers[name]=fn},renderDetail:()=>{detailId=c.selected}};
 vm.runInNewContext(source.slice(source.indexOf('  function people()'),source.indexOf('  function detail()')),c);
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
