'use strict';
const assert=require('node:assert/strict');
const {readFileSync,writeFileSync,mkdirSync}=require('node:fs');
const {transformSync}=require('esbuild');
const {PDFDocument,StandardFonts,rgb}=require('pdf-lib');
const C=require('../../dist/certificate-model.js');
async function main(){
 const source=readFileSync('backend/functions/abbate-certificates/index.ts','utf8');
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
 for(const field of C.fields){
   const practice=await createPDF('Musterteilnehmer',field.label,date,signature,false,null,null,{},true);
   const doc=await PDFDocument.load(practice);
   assert.equal(doc.getPageCount(),1);
   assert.equal(doc.getTitle(),'Abbate – Nachweis der Praxisprüfung');
 }
 const sample=await createPDF('Musterteilnehmer','Jährliche Unterweisung',date,signature,true,C.fields[0].label);
 const draft=await PDFDocument.load(sample);
 mkdirSync('review-pdfs',{recursive:true});
 writeFileSync('review-pdfs/Abbate-Jaehrliche-Unterweisung-MUSTER.pdf',Buffer.from(sample,'base64'));
 const theory=await createPDF('Musterteilnehmer',C.fields[0].label,date,signature,true);
 writeFileSync('review-pdfs/Abbate-Theoriepruefung-MUSTER.pdf',Buffer.from(theory,'base64'));
 assert.equal(draft.getPageCount(),1);
 const practice=await createPDF('Musterteilnehmer',C.fields[0].label,date,signature,true,null,null,{},true);
 writeFileSync('review-pdfs/Abbate-Praxispruefung-MUSTER.pdf',Buffer.from(practice,'base64'));
 await verifyBatch(source,theory,practice);
 console.log('22 real PDF generation/load cases and actual batch handler/MIME validation passed, synthetic data only.');
}

async function verifyBatch(source,theory,practice){
 const nodemailer=require('nodemailer');
 const ids=['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'];
 const records=ids.map((id,i)=>({id,school_id:'school',participant_id:'synthetic',kind:'exam',outcome:'passed',completed_at:'2026-11-17',reference:'TEST-'+i,revoked_at:null,abbate_courses:{title:C.fields[0].label+(i?' · Praxisprüfung':' · Theorieprüfung')}}));
 const certs=ids.map((id,i)=>({completion_id:id,pdf_base64:i?practice:theory,mail_status:'not_sent',invalidated_at:null}));
 let role='admin',handler,deliveries=0,last;
 const membership=()=>[{school_id:'school',role,access_status:'active',access_until:null}];
 function table(rows){
   const filters=[];let patch;
   const q={select(){return q},eq(k,v){filters.push(x=>x[k]===v);return q},in(k,v){filters.push(x=>v.includes(x[k]));return q},is(k,v){filters.push(x=>(x[k]??null)===v);return q},update(v){patch=v;return q},then(ok,fail){return Promise.resolve().then(()=>{const found=rows.filter(x=>filters.every(f=>f(x)));if(patch)found.forEach(x=>Object.assign(x,patch));return {data:found.map(x=>({...x})),error:null}}).then(ok,fail)}};
   return q;
 }
 const caller={auth:{getUser:async()=>({data:{user:{id:'synthetic-staff'}},error:null})},from(name){if(name==='abbate_memberships')return table(membership().map(x=>({...x,user_id:'synthetic-staff'})));if(name==='abbate_completions')return table(records);throw Error(name)}};
 const admin={from(name){assert.equal(name,'abbate_certificates');return table(certs)},auth:{admin:{getUserById:async()=>({data:{user:{email:'learner@example.test',email_confirmed_at:'yes'}}})}}};
 const smtp={createTransport(){return {async sendMail(options){deliveries++;last=options;const transport=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'unix'});const mime=await transport.sendMail(options);const content=mime.message.toString();assert.equal((content.match(/Content-Type: application\/pdf/g)||[]).length,2);assert.equal(options.attachments.length,2);for(const file of options.attachments)assert.equal((await PDFDocument.load(file.content)).getPageCount(),1);return {accepted:[options.to.address],messageId:'synthetic-test-id'}}}}};
 const deno={env:{get(k){return k==='SUPABASE_SERVICE_ROLE_KEY'?'service':k==='CERT_SMTP_FROM'?'school@example.test':'synthetic'}},serve(fn){handler=fn}};
 const js=transformSync(source.replace(/^import .*;$/gm,''),{loader:'ts',target:'es2022'}).code;
 new Function('createClient','PDFDocument','StandardFonts','rgb','nodemailer','Deno',js)((url,key)=>key==='service'?admin:caller,PDFDocument,StandardFonts,rgb,smtp,deno);
 const request=(body)=>handler(new Request('https://example.test',{method:'POST',headers:{authorization:'Bearer synthetic'},body:JSON.stringify(body)}));
 const body={action:'mail_batch',completionIds:ids,confirmed:true,email:'company@example.test',alternateRecipient:true};
 role='trainer';assert.equal((await request(body)).status,403);assert.equal(deliveries,0);role='admin';
 records[1].participant_id='other';assert.equal((await request(body)).status,403);records[1].participant_id='synthetic';
 assert.equal((await request({...body,confirmed:false})).status,400);
 const result=await request(body);assert.equal(result.status,200);assert.equal((await result.json()).mailStatus,'accepted');
 assert.equal(last.to.address,'company@example.test');assert.equal(deliveries,1);assert.ok(certs.every(x=>x.mail_status==='accepted'&&x.mail_recipient==='company@example.test'));
 assert.equal((await (await request(body)).json()).mailStatus,'accepted');assert.equal(deliveries,1);
 console.log('Batch: two actual PDFs composed into MIME, alternate recipient, role and participant rejection, duplicate-send prevention passed. No external SMTP connection.');
}

main().catch(e=>{console.error(e);process.exitCode=1});
