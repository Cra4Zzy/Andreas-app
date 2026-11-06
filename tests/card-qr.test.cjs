'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const qr=require('qrcode');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const source=read('dist/card-qr.js');
const target='https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html';

function mockCardQr(){
  const calls=[],downloads=[],blobs=[],revoked=[];
  const encoder={
    async toCanvas(canvas,url,opts){calls.push({type:'canvas',url,opts});canvas.width=opts.width||2352;canvas.height=canvas.width;},
    async toString(url,opts){calls.push({type:'svg',url,opts});return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';}
  };
  const context={AbbateQR:encoder,Blob,URL:{
    createObjectURL(blob){blobs.push(blob);return 'blob:test-'+blobs.length;},
    revokeObjectURL(url){revoked.push(url);}
  },setTimeout(fn){fn();},document:{
    body:{appendChild(){}},
    createElement(tag){
      if(tag==='canvas')return {width:0,height:0,toBlob(fn){fn(new Blob(['PNG'],{type:'image/png'}));}};
      if(tag==='a')return {style:{},href:'',download:'',click(){downloads.push({href:this.href,name:this.download});},remove(){}};
      throw Error('Unexpected element '+tag);
    }
  }};
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(source,context);
  return {helper:context.AbbateCardQR,calls,downloads,blobs,revoked};
}

test('printed card QR always uses canonical HTTPS login with no student/session data',()=>{
  const {helper}=mockCardQr();
  assert.equal(helper.target,target);
  assert.equal(new URL(helper.target).pathname,'/dist/konto.html');
  assert.equal(helper.previewWidth,240);
  assert.equal(helper.printScale,48);
  assert.doesNotMatch(source,/ABBATE_CONFIG\.portalUrl|auth\.getSession|sessionStorage/);
  assert.doesNotMatch(target,/token|verify\//i);
});

test('PNG download generates integer-scaled print QR instead of stretching tiny preview',async()=>{
  const {helper,calls,downloads,blobs,revoked}=mockCardQr();
  await helper.render({});
  await helper.downloadPng();
  assert.equal(calls[0].opts.width,240);
  assert.equal(calls[1].opts.scale,48);
  assert.equal(calls[1].opts.width,undefined);
  assert.ok(calls.every(x=>x.url===target&&x.opts.margin===4&&x.opts.errorCorrectionLevel==='Q'));
  assert.equal(downloads.length,1);
  assert.equal(downloads[0].name,'abbate-karten-qr-druck.png');
  assert.equal(blobs[0].type,'image/png');
  assert.equal(revoked.length,1);
});

test('SVG download produces a scalable QR with the identical target',async()=>{
  const {helper,calls,downloads,blobs}=mockCardQr();
  await helper.downloadSvg();
  assert.equal(calls[0].type,'svg');
  assert.equal(calls[0].url,target);
  assert.equal(calls[0].opts.type,'svg');
  assert.equal(calls[0].opts.margin,4);
  assert.equal(downloads[0].name,'abbate-karten-qr-druck.svg');
  assert.match(blobs[0].type,/image\/svg\+xml/);
});

test('QR engine generates print-resolution PNG including standard quiet zone',async()=>{
  const png=await qr.toBuffer(target,{scale:48,margin:4,errorCorrectionLevel:'Q',color:{dark:'#000000',light:'#ffffff'}});
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const expected=(qr.create(target,{errorCorrectionLevel:'Q'}).modules.size+8)*48;
  assert.ok(expected>=2000);
  assert.equal(png.readUInt32BE(16),expected);
  assert.equal(png.readUInt32BE(20),expected);
  assert.ok(png.length>2000,'PNG must contain a populated QR matrix');
  assert.ok(qr.create(target,{errorCorrectionLevel:'Q'}).modules.size>21);
});

test('admin loads QR module before portal and never exports preview canvas',()=>{
  const page=read('dist/verwaltung.html');
  assert.match(page,/vendor\/qrcode\.js\?v=2/);
  assert.match(page,/card-qr\.js\?v=1/);
  assert.ok(page.indexOf('card-qr.js?v=1')<page.indexOf('portal.js?v=13'));
  const portal=read('dist/portal.js');
  assert.match(portal,/AbbateCardQR\.render\(canvas\)/);
  assert.match(portal,/AbbateCardQR\.downloadPng\(\)/);
  assert.match(portal,/AbbateCardQR\.downloadSvg\(\)/);
  assert.doesNotMatch(portal,/canvas\.toDataURL\('image\/png'\)/,'Cannot save tiny preview canvas');
});
