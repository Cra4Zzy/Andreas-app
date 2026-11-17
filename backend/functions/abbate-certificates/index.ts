import { createClient } from "npm:@supabase/supabase-js@2.89.0";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import nodemailer from "npm:nodemailer@10.6.0";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Cache-Control":"no-store"};
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{...cors,"Content-Type":"application/json"}});
class Fault extends Error { constructor(message:string,public status=400){super(message)} }
const courses:Record<string,string>={"Fahr- und Steuerpersonal / Gabelstaplerfahrer":"Theoretische Ausbildungsinhalte nach DGUV Grundsatz 308-001","Hebebühnen":"","Krane":"","Anschlagen von Lasten":"","Erdbaumaschinen & Bagger":"","Ladungssicherung":"","Abseilen aus Höhen":""};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const bucket="abbate-certificate-assets";
const smtp=()=>({host:Deno.env.get("CERT_SMTP_HOST"),user:Deno.env.get("CERT_SMTP_USER"),pass:Deno.env.get("CERT_SMTP_PASSWORD"),from:Deno.env.get("CERT_SMTP_FROM")});
const mailReady=()=>{const s=smtp();return !!(s.host&&s.user&&s.pass&&s.from);};
const mailText="Guten Tag,\n\nherzlichen Glückwunsch zur bestandenen Theorieprüfung! Im Anhang findest du dein Zertifikat der Fahrschule Andreas Abbate. Du kannst den Nachweis auch in deinem persönlichen Schulungspass abrufen.\n\nViele Grüße\nFahrschule Andreas Abbate";
async function sendCertificate(admin:any,r:any,pdf:string,expectedEmail:string){
 if(!mailReady())throw new Fault("Der Zertifikatsversand ist noch nicht eingerichtet.",409);
 const {data:recipient,error:userError}=await admin.auth.admin.getUserById(r.participant_id);
 const email=recipient?.user?.email;
 if(userError||!recipient?.user?.email_confirmed_at||!email||!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)||email.toLowerCase()!==String(expectedEmail||"").trim().toLowerCase())throw new Fault("Die bestätigte E-Mail-Adresse stimmt nicht mit der Versandvorschau überein.",409);
 const {data:claim,error:claimError}=await admin.from("abbate_certificates").update({mail_status:"sending",mail_attempted_at:new Date().toISOString(),mail_recipient:email}).eq("completion_id",r.id).eq("mail_status","not_sent").is("invalidated_at",null).select("completion_id").maybeSingle();
 if(claimError)throw new Fault("Versand konnte nicht reserviert werden.",500);
 if(!claim){const {data:current}=await admin.from("abbate_certificates").select("mail_status,invalidated_at").eq("completion_id",r.id).maybeSingle();if(current?.invalidated_at)throw new Fault("Dieses Zertifikat wurde gesperrt.",409);return current?.mail_status||"uncertain";}
 const s=smtp();let status="uncertain",id=null;
 try{
  const transport=nodemailer.createTransport({host:s.host,port:465,secure:true,auth:{user:s.user,pass:s.pass},connectionTimeout:12000,greetingTimeout:12000,socketTimeout:20000,tls:{rejectUnauthorized:true}});
  const info=await transport.sendMail({from:{name:"Fahrschule Andreas Abbate",address:s.from!},to:{name:"",address:email},subject:"Dein Zertifikat – bestandene Theorieprüfung",text:mailText,attachments:[{filename:"Abbate-"+r.reference+".pdf",content:pdf,encoding:"base64",contentType:"application/pdf"}],disableFileAccess:true,disableUrlAccess:true});
  if(info.accepted?.length){status="accepted";id=info.messageId||null;}
 }catch(e){console.error("Certificate SMTP result uncertain",e instanceof Error?e.name:"unknown");}
 const {error:finishError}=await admin.from("abbate_certificates").update({mail_status:status,mail_accepted_at:status==="accepted"?new Date().toISOString():null,mail_message_id:id}).eq("completion_id",r.id).eq("mail_status","sending");
 return finishError?"uncertain":status;
}
const signaturePath=(school:string)=>school+"/signature.png";
const textDate=(s:string)=>new Intl.DateTimeFormat("de-DE",{dateStyle:"long",timeZone:"Europe/Berlin"}).format(new Date(s+"T12:00:00Z"));
async function createPDF(name:string,label:string,record:any,signature:ArrayBuffer,draft=false){
 const pdf=await PDFDocument.create(), p=pdf.addPage([842,595]);
 const serif=await pdf.embedFont(StandardFonts.TimesRoman), bold=await pdf.embedFont(StandardFonts.HelveticaBold), regular=await pdf.embedFont(StandardFonts.Helvetica), italic=await pdf.embedFont(StandardFonts.TimesRomanItalic);
 const ink=rgb(.13,.17,.14), gold=rgb(.63,.53,.30), muted=rgb(.37,.40,.36);
 const center=(t:string,y:number,size:number,font=regular,color=ink,max=735)=>{
  let actual=size,w=font.widthOfTextAtSize(t,actual);if(w>max){actual*=max/w;w=font.widthOfTextAtSize(t,actual);}
  if(actual<10)throw new Fault("Der Name oder Ausbildungsbereich ist zu lang für das Zertifikat.");
  p.drawText(t,{x:(842-w)/2,y,size:actual,font,color});
 };
 const at=(t:string,x:number,y:number,font=regular,size=11,color=ink)=>p.drawText(t,{x:x-font.widthOfTextAtSize(t,size)/2,y,size,font,color});
 p.drawRectangle({x:0,y:0,width:842,height:595,color:rgb(.996,.992,.974)});
 p.drawRectangle({x:24,y:24,width:794,height:547,borderColor:gold,borderWidth:.8});
 for(const [x,y,dx,dy] of [[24,24,1,1],[818,24,-1,1],[24,571,1,-1],[818,571,-1,-1]]){p.drawLine({start:{x,y},end:{x:x+27*dx,y},thickness:2,color:gold});p.drawLine({start:{x,y},end:{x,y:y+27*dy},thickness:2,color:gold});}
 // The logo is fetched only from the fixed public school asset, never from a request URL.
 try{const res=await fetch("https://app.gabelstaplerfahrschule-andreas.de/dist/assets/logo-abbate.png",{signal:AbortSignal.timeout(5000)});if(res.ok){const logo=await pdf.embedPng(await res.arrayBuffer());const scale=Math.min(49/logo.height,65/logo.width);p.drawImage(logo,{x:421-logo.width*scale/2,y:504,width:logo.width*scale,height:logo.height*scale});}}catch{/* school name remains visible */}
 center("FAHRSCHULE ANDREAS ABBATE",485,12,bold);
 center("Z E R T I F I K A T",428,42,serif);
 center("ERFOLGREICH BESTANDENE THEORIEPRÜFUNG",403,13,bold,gold);
 center("Hiermit bestätigen wir, dass",356,13,regular,muted);
 try{center(name,310,34,serif);}catch(e){if(e instanceof Fault)throw e;throw new Fault("Der Name enthält Zeichen, die die PDF-Schrift noch nicht unterstützt. Kein Zertifikat ausgestellt.");}
 center("die Theorieprüfung im Ausbildungsbereich",281,13,regular,muted);
 center(label,253,19,bold);
 if(courses[label])center(courses[label],231,12,regular,muted);
 center("am "+textDate(record.completed_at)+" erfolgreich bestanden hat.",208,13,regular,muted);
 center("Herzlichen Glückwunsch zu dieser Leistung.",169,17,italic);
 const sig=await pdf.embedPng(signature),s=Math.min(155/sig.width,55/sig.height);
 p.drawImage(sig,{x:600-sig.width*s/2,y:102,width:sig.width*s,height:sig.height*s});
 for(const x of [242,600])p.drawLine({start:{x:x-94,y:99},end:{x:x+94,y:99},color:gold,thickness:.8});
 at(textDate(record.completed_at),242,111);at("Prüfungsdatum",242,81,bold);at("Andreas Abbate",600,81,bold);at("Prüfungsverantwortlicher",600,66,regular,10,muted);
 center(draft?"ENTWURF · KEIN PRÜFUNGSNACHWEIS · NICHT AUSGESTELLT":"Nur Theorieprüfung · Kein eigenständiger Fahrausweis · "+record.reference,42,10,bold,muted);
 if(draft){center("VORSCHAU / ENTWURF",564,12,bold,rgb(.57,.18,.14));center("ENTWURF",382,16,bold,rgb(.57,.18,.14));}
 pdf.setTitle("Abbate – Nachweis der Theorieprüfung");pdf.setAuthor("Fahrschule Andreas Abbate");
 return await pdf.saveAsBase64();
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 if(req.method!=="POST")return json({error:"Methode nicht erlaubt"},405);
 try{
  const token=req.headers.get("authorization")||"";
  if(!token.startsWith("Bearer "))throw new Fault("Bitte anmelden.",401);
  const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const caller=createClient(url,anon,{global:{headers:{Authorization:token}},auth:{persistSession:false,autoRefreshToken:false}});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:auth,error:authError}=await caller.auth.getUser(token.slice(7));
  if(authError||!auth.user)throw new Fault("Bitte erneut anmelden.",401);
  const body=await req.json();
  if(!body||typeof body!=="object")throw new Fault("Ungültige Anfrage.");
  const action=body.action;
  if(!["status","signature","issue","download","list","mail","preview"].includes(action))throw new Fault("Unbekannte Aktion.");
  // A live membership read is enforced by the existing RLS policy (including live_session).
  const {data:members,error:membershipError}=await caller.from("abbate_memberships").select("school_id,role,access_status,access_until").eq("user_id",auth.user.id);
  if(membershipError||!members?.length)throw new Fault("Kein gültiger Zugang.",403);
  const active=(m:any)=>m.role==="admin"&&m.access_status==="active"&&(!m.access_until||m.access_until>=new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Berlin"}).format(new Date()));
  if(action==="status"||action==="signature"){
   const m=members.find((m:any)=>m.school_id===body.school&&active(m));
   if(!m)throw new Fault("Administratorrechte erforderlich.",403);
   if(action==="signature"){
    if(body.confirmed!==true||typeof body.png!=="string"||body.png.length>1400000)throw new Fault("Bitte freigegebene PNG-Datei bestätigen.");
    let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(body.png),x=>x.charCodeAt(0));}catch{throw new Fault("Ungültiges PNG.");}
    if(bytes.length>1048576||bytes.length<32||![137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x))throw new Fault("Nur PNG bis 1 MB.");
    const width=new DataView(bytes.buffer).getUint32(16),height=new DataView(bytes.buffer).getUint32(20);
    if(!width||!height||width>3000||height>3000)throw new Fault("PNG-Abmessungen ungültig.");
    try{const doc=await PDFDocument.create();await doc.embedPng(bytes);}catch{throw new Fault("PNG konnte nicht gelesen werden.");}
    const {error}=await admin.storage.from(bucket).upload(signaturePath(m.school_id),bytes,{contentType:"image/png",upsert:true});
    if(error)throw new Fault("Unterschrift konnte nicht gespeichert werden.",500);
    return json({signatureReady:true,mailReady:mailReady()});
   }
   const {data:sig}=await admin.storage.from(bucket).download(signaturePath(m.school_id));
   return json({signatureReady:!!sig,mailReady:mailReady()});
  }
  if(action==="preview"){
   const m=members.find((m:any)=>m.school_id===body.school&&active(m));
   if(!m)throw new Fault("Administratorrechte erforderlich.",403);
   const label=body.label,date=body.completedAt,today=new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Berlin"}).format(new Date());
   if(typeof label!=="string"||!Object.hasOwn(courses,label)||!uuid.test(String(body.participantId||""))||typeof date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+"T12:00:00Z"))||new Date(date+"T12:00:00Z").toISOString().slice(0,10)!==date||date>today)throw new Fault("Ungültige Vorschauangaben.");
   const {data:learner,error:learnerError}=await caller.from("abbate_memberships").select("user_id").eq("school_id",m.school_id).eq("user_id",body.participantId).eq("role","learner").maybeSingle();
   if(learnerError||!learner)throw new Fault("Teilnehmer nicht verfügbar.",404);
   const {data:profile,error:profileError}=await caller.from("abbate_profiles").select("display_name").eq("school_id",m.school_id).eq("user_id",learner.user_id).maybeSingle();
   if(profileError||!profile?.display_name)throw new Fault("Teilnehmername fehlt.");
   const {data:sig,error:sigError}=await admin.storage.from(bucket).download(signaturePath(m.school_id));
   if(sigError||!sig)throw new Fault("Die freigegebene Unterschrift fehlt.",409);
   const pdf=await createPDF(profile.display_name,label,{completed_at:date,reference:"ENTWURF"},await sig.arrayBuffer(),true);
   return json({pdf,draft:true});
  }
  if(action==="list"){
   const ids=body.ids;
   if(!Array.isArray(ids)||ids.length>100||ids.some(x=>typeof x!=="string"||!uuid.test(x)))throw new Fault("Ungültige Prüfungsreferenzen.");
   if(!ids.length)return json({certificates:[]});
   const {data:allowed,error:allowedError}=await caller.from("abbate_completions").select("id").in("id",ids).eq("kind","exam").eq("outcome","passed").is("revoked_at",null);
   if(allowedError)throw new Fault("Zertifikate konnten nicht geprüft werden.",500);
   if(!allowed?.length)return json({certificates:[]});
   const {data:rows,error:rowsError}=await admin.from("abbate_certificates").select("completion_id,issued_at,mail_status,invalidated_at").in("completion_id",allowed.map(x=>x.id)).is("invalidated_at",null);
   if(rowsError)throw new Fault("Zertifikate konnten nicht geprüft werden.",500);
   return json({certificates:rows||[]});
  }
  if(!uuid.test(String(body.completionId||"")))throw new Fault("Ungültige Prüfungsreferenz.");
  // RLS checks school, active account and live session; a learner can only read their own unrevoked record.
  const {data:r,error:recordError}=await caller.from("abbate_completions").select("id,school_id,participant_id,kind,outcome,completed_at,reference,revoked_at,abbate_courses(title)").eq("id",body.completionId).maybeSingle();
  if(recordError||!r||r.revoked_at||r.kind!=="exam"||r.outcome!=="passed")throw new Fault("Kein berechtigter bestandener Prüfungseintrag.",404);
  const m=members.find((m:any)=>m.school_id===r.school_id);
  if(!m||(["issue","mail"].includes(action)?!active(m):!(active(m)||m.role==="trainer"||r.participant_id===auth.user.id)))throw new Fault("Keine Berechtigung.",403);
  const {data:existing,error:existingError}=await admin.from("abbate_certificates").select("pdf_base64,invalidated_at,issued_at,mail_status").eq("completion_id",r.id).maybeSingle();
  if(existingError)throw new Fault("Zertifikat konnte nicht geprüft werden.",500);
  if(existing?.invalidated_at)throw new Fault("Dieses Zertifikat wurde gesperrt.",409);
  if(action==="mail"){
   if(body.confirmed!==true||!existing)throw new Fault("Bitte den Versand eines ausgestellten Zertifikats ausdrücklich bestätigen.");
   const mailStatus=await sendCertificate(admin,r,existing.pdf_base64,body.email);
   return json({mailStatus,reference:r.reference});
  }
  if(action==="download"){
   if(!existing)throw new Fault("Für diese Prüfung wurde noch kein Zertifikat ausgestellt.",404);
   return json({pdf:existing.pdf_base64,reference:r.reference,issuedAt:existing.issued_at});
  }
  if(body.confirmed!==true)throw new Fault("Bitte Ausstellung ausdrücklich bestätigen.");
  if(existing)return json({pdf:existing.pdf_base64,reference:r.reference,issuedAt:existing.issued_at,mailStatus:existing.mail_status||"not_sent"});
  const title=(r.abbate_courses as any)?.title||"",suffix=" · Theorieprüfung";
  const label=title.endsWith(suffix)?title.slice(0,-suffix.length):"";
  if(!Object.hasOwn(courses,label))throw new Fault("Bitte einen Prüfungseintrag aus der Zertifikatsvorbereitung auswählen.");
  const {data:profile,error:profileError}=await caller.from("abbate_profiles").select("display_name").eq("school_id",r.school_id).eq("user_id",r.participant_id).maybeSingle();
  if(profileError||!profile?.display_name)throw new Fault("Teilnehmername fehlt.");
  const {data:sig,error:sigError}=await admin.storage.from(bucket).download(signaturePath(r.school_id));
  if(sigError||!sig)throw new Fault("Die freigegebene Unterschrift muss zuerst hinterlegt werden.",409);
  const pdf=await createPDF(profile.display_name,label,r,await sig.arrayBuffer());
  const {error:saveError}=await admin.from("abbate_certificates").insert({completion_id:r.id,issued_by:auth.user.id,pdf_base64:pdf});
  if(saveError){if(saveError.code==="23505"){const {data:stored}=await admin.from("abbate_certificates").select("pdf_base64,invalidated_at,issued_at,mail_status").eq("completion_id",r.id).maybeSingle();if(stored&&!stored.invalidated_at)return json({pdf:stored.pdf_base64,reference:r.reference,issuedAt:stored.issued_at,mailStatus:stored.mail_status||"not_sent"});}throw new Fault("Zertifikat konnte nicht gespeichert werden.",409);}
  return json({pdf,reference:r.reference,mailStatus:"not_sent"});
 }catch(e){if(e instanceof Fault)return json({error:e.message},e.status);console.error("Certificate operation failed",e instanceof Error?e.name:"unknown");return json({error:"Zertifikatsdienst momentan nicht verfügbar."},500);}
});