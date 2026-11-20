'use strict';
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {transformSync}=require('esbuild');
const {PDFDocument,StandardFonts,rgb}=require('pdf-lib');
const C=require('../dist/certificate-model.js');
async function main(){
 const source=readFileSync('backend/functions/abbate-certificates/index.ts','utf8');
 const start=source.indexOf('const courses:'),end=source.indexOf('const uuid='),pdfStart=source.indexOf('const textDate='),pdfEnd=source.indexOf('Deno.serve(');
 assert.ok(start>=0&&end>start&&pdfStart>0&&pdfEnd>pdfStart);
 const isolated=source.slice(start,end)+source.slice(pdfStart,pdfEnd)+'\nreturn {createPDF,templateDetails,templates};';
 const js=transformSync('function load(){'+isolated+'}',{loader:'ts',target:'es2022'}).code+'\nreturn load();';
 const movements=[];
 const wrapped={create:async()=>{const pdf=await PDFDocument.create();const add=pdf.addPage.bind(pdf);pdf.addPage=(...args)=>{const page=add(...args);const draw=page.drawText.bind(page);page.drawText=(text,opts)=>{const w=opts.font.widthOfTextAtSize(text,opts.size);assert.ok(opts.x>=24&&opts.x+w<=818.01,'text inside frame: '+text);assert.ok(opts.y>=24&&opts.y+opts.size<=571,'text height: '+text);movements.push({text,y:opts.y});return draw(text,opts);};return page;};return pdf;}};
 const S=new Function('PDFDocument','StandardFonts','rgb','fetch','Fault',js)(wrapped,StandardFonts,rgb,async()=>({ok:false}),Error);
 const signature=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXuoAAAAASUVORK5CYII=','base64');
 const p={id:'synthetic',role:'learner',name:'Musterteilnehmer',email:'test@example.invalid'};
 const v={completedAt:'2026-11-18',notification:'none',birthDate:'1990-01-01',birthPlace:'Berlin',company:'Muster GmbH',location:'Satteldorf',department:'Lagerhalle',theoryConfirmed:'yes',practiceConfirmed:'yes'};
 const record={completed_at:v.completedAt,reference:'AB-TEST'};
 for(const t of Object.values(C.templates)){
   const d=C.prepare(p,{...v,course:t.course,proofType:t.id},'2026-11-19');
   const detail=S.templateDetails(S.templates[t.id],d,d.completedAt);
   assert.deepEqual(detail,d.details);
   for(const draft of [true,false]){
     movements.length=0;
     const data=await S.createPDF(p.name,t.label,record,signature,draft,null,S.templates[t.id],detail);
     const pdf=await PDFDocument.load(data);
     assert.equal(pdf.getPageCount(),1);assert.equal(pdf.getPages()[0].getWidth(),842);
     assert.equal(pdf.getTitle(),'Abbate – '+t.proof);
     assert.ok(movements.some(m=>m.text.includes(draft?'Noch nicht ausgestellt':'AB-TEST')));
     if(t.id==='fire')assert.ok(movements.some(m=>m.text.includes('Arbeitgeber')));
     if(t.id==='rope')assert.ok(movements.some(m=>m.text.includes('12 Monate')));
     if(t.id==='cargo')assert.ok(movements.some(m=>m.text.includes('VDI 2700ff')));
   }
 }
 for(const c of C.fields){
   const pdf=await PDFDocument.load(await S.createPDF(p.name,c.label,record,signature,false));
   assert.equal(pdf.getTitle(),'Abbate – Nachweis der Theorieprüfung');
   assert.equal(pdf.getPageCount(),1);
   const annual=await PDFDocument.load(await S.createPDF(p.name,'Jährliche Unterweisung',record,signature,false,c.label));
   assert.equal(annual.getTitle(),'Abbate – Jährliche Unterweisung');
 }
 console.log('20 PDF generation cases passed (6 new, 14 existing); synthetic data, no issuance or mail.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
