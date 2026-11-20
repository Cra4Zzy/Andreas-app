// Public examination endpoint. No account needed; each submission requires an unguessable attempt token.
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type, apikey, authorization","Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const courses=new Set(["gabelstapler","hebebuehnen","krane","lasten","bagger","ladungssicherung","abseilen"]);
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 try{
 const raw=await req.text();if(raw.length>12000)return reply({error:"Anfrage zu groß."},413);
 const b=JSON.parse(raw);let rpc:string,args:Record<string,unknown>;
 if(b.action==="start"){
  if(typeof b.name!=="string"||b.name.trim().length<2||b.name.trim().length>120||!courses.has(b.course)||typeof b.language!=="string"||!/^[a-z]{2,3}$/.test(b.language))return reply({error:"Bitte Name, Fachbereich und Sprache prüfen."},400);
  rpc="abbate_guest_exam_start";args={p_name:b.name,p_course:b.course,p_language:b.language,p_bucket:(req.headers.get("x-forwarded-for")||req.headers.get("cf-connecting-ip")||"unknown").split(",")[0].trim().slice(0,128)};
 }else if(b.action==="submit"){
  if(typeof b.id!=="string"||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(b.id)||typeof b.token!=="string"||!/^[a-f0-9]{64}$/.test(b.token)||!b.answers||typeof b.answers!=="object"||Array.isArray(b.answers))return reply({error:"Ungültige Prüfungsabgabe."},400);
  rpc="abbate_guest_exam_submit";args={p_attempt:b.id,p_token:b.token,p_answers:b.answers};
 }else return reply({error:"Unbekannte Anfrage."},400);
 const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");const url=Deno.env.get("SUPABASE_URL");if(!key||!url)return reply({error:"Prüfungsdienst nicht verfügbar."},503);
 const r=await fetch(url+"/rest/v1/rpc/"+rpc,{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify(args)});
 const data=await r.json();
 if(!r.ok){if(String(data.message).includes("Too many attempts"))return reply({error:"Zu viele Prüfungsstarts. Bitte später erneut versuchen."},429);return reply({error:"Prüfung konnte nicht verarbeitet werden. Bitte erneut versuchen."},400);}
 return reply(data);
 }catch{return reply({error:"Prüfungsdienst momentan nicht erreichbar."},503);}
});