'use strict';
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {transformSync}=require('esbuild');
const {PDFDocument,StandardFonts,rgb}=require('pdf-lib');
const C=require('../../dist/certificate-model.js');
async function main(){
 const source=readFileSync('staging/annual-instruction/abbate-certificates/index.ts','utf8');
 const start=source.indexOf('const courses:');
 const end=source.indexOf('const uuid=');
 const pdfStart=source.indexOf('const textDate='),pdfEnd=source.indexOf('Deno.serve(');
 assert.ok(start>=0&&end>start&&pdfStart>0&&pdfEnd>pdfStart);
 const isolated=source.slice(start,end)+source.slice(pdfStart,pdfEnd)+'\nreturn createPDF;';
 const js=transformSync('function load(){'+isolated+'}',{loader:'ts',target:'es2022'}).code+'\nreturn load();';
 const createPDF=new Function('PDFDocument','StandardFonts','rgb','fetch','Fault',js)(PDFDocument,StandardFonts,rgb,async()=>({ok:false}),Error);
 const signature=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXuoAAAAASUVORK5CYII=','base64');
 const date={completed_at:'2026-11-17',reference:'AB-TEST'};
 for(const field of C.fields){
   const base64=await createPDF('Test Person','Jährliche Unterweisung',date,signature,false,field.label);
   const doc=await PDFDocument.load(base64);
   assert.equal(doc.getPageCount(),1);assert.equal(doc.getPages()[0].getWidth(),842);assert.equal(doc.getTitle(),'Abbate – Jährliche Unterweisung');
   const exam=await PDFDocument.load(await createPDF('Test Person',field.label,date,signature,false));
   assert.equal(exam.getTitle(),'Abbate – Nachweis der Theorieprüfung');
 }
 const draft=await PDFDocument.load(await createPDF('Test Person','Jährliche Unterweisung',date,signature,true,C.fields[0].label));
 assert.equal(draft.getPageCount(),1);
 console.log('15 real PDF generation/load cases passed, using synthetic signature and no real participants.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
