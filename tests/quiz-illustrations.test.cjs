'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const ropeIds=["as-absperren","as-aenderung","as-anschlag","as-dokumentation","as-ende","as-gelander","as-kante","as-kennzeichnung","as-kommunikation","as-kompatibel","as-kontrolle","as-lager","as-partner","as-planung","as-pruefung","as-rettungsdienst","as-schutz","as-sitz","as-uebergabe","as-verschluss","as-verstaendnis","as-werkzeug","as-wetter","as-ziel","as-zugang"];
const cargoIds=["ls-anzahl","ls-aufbau","ls-direkt","ls-empfindlich","ls-fahrer","ls-formschluss","ls-gewicht","ls-haken","ls-kantenschutz","ls-kraftschluss","ls-kurzstrecke","ls-lastplan","ls-luecke","ls-matten","ls-palette","ls-pflicht","ls-reibung","ls-riss","ls-rollen","ls-schwerpunkt","ls-sichtcheck","ls-stf","ls-teilentladung","ls-winkel","ls-zurrpunkt"];
const craneIds=["k-anzuheben","k-bremsprobe","k-lastanschlag","k-lastweg","k-personen","k-ruck","k-sicht","k-signale","k-signalverlust","k-sperrbereich","k-stopp","k-stuetzen","k-wetter","k-zugrichtung","k2-anfahrbereich","k2-arbeitsplanung","k2-betriebsbereich","k2-funkakku","k2-hakenposition","k2-hochheben","k2-mehrereanschlaeger","k2-ortswechsel","k2-pendel","k2-schneekante","k2-wetterbeobachtung"];
const excavatorIds=["b-boeschung","b-einstieg","b-einweisen","b-einweiser","b-graben","b-laufwerk","b-leitungen","b-personen","b-pruefung","b-rueckwaerts","b-schwenkbereich","b-standsicherheit","b-unterbau","b-verlassen","b2-arbeitsunterbrechung","b2-bodenprobe","b2-feuchtigkeit","b2-fremdperson","b2-fussgaenger","b2-ladearbeiten","b2-maschinenzugang","b2-parkstellung","b2-schwenkradius","b2-verkehrseinweiser","b2-wasserleitung"];
const liftIds=["h-absperren","h-kollision","h-quetschen","h-rettung","h-schraegstellung","h-sicht","h-strom","h-tragfaehigkeit","h-transportstellung","h-ueberlast","h-umgebung","h-untergrund","h-verfahren","h-wind","h2-absperrpersonal","h2-abstuetzplatte","h2-arbeitsvorbereitung","h2-aufbaukontakt","h2-energieleitung","h2-funkkommunikation","h2-lastverteilen","h2-leitungsnaehe","h2-rettungsperson","h2-sicherheitsabstand","h2-transporthoehe"];
const riggingMap={"a-neigungswinkel":"lasten","l-spreizwinkel":"lasten","l2-tragfaehigkeit":"lasten","l2-aufhaengung":"lasten","a-probehub":"lasten","l2-anheben":"lasten","a-schwerpunkt":"lasten","l-schwerpunkt":"lasten","l2-einseitig":"lasten","a-kantenschutz":"lasten","l-kantenschutz":"lasten","a-sichtpruefung":"lasten","l-sichtpruefung":"lasten","l2-kettenriss":"lasten","l2-fasern":"lasten","a-haken":"lasten","l2-lasthaken":"lasten","l2-schaekel":"lasten","l-ablegen":"lasten","a-lastweg":"lasten","l2-transportweg":"lasten","a-abstimmung":"lasten","l-zeichen":"lasten","l2-einweiserrolle":"lasten","a-vierstraenge":"lasten"};
const app=read('dist/app.js'),html=read('dist/index.html'),sw=read('dist/sw.js'),css=read('dist/experience.css');
const scope={};for(const path of ['dist/practice-bank.js','dist/practice-expansion.js','dist/practice-expansion-final.js'])vm.runInNewContext(read(path),scope);
const prefix=app.slice(app.indexOf('const QUIZ_ILLUSTRATIONS ='),app.indexOf('function quizView() {'));
const {map,render}=new Function('esc','I18N',prefix+'return {map:QUIZ_ILLUSTRATIONS,render:questionIllustration};')(v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'),{t:()=> 'Vorschau'});
test('175 illustrated questions use approved IDs across all seven categories',()=>{
 assert.equal(Object.keys(map).length,175);
 const questions=scope.ABBATE_PRACTICE_BANK.questions;assert.equal(questions.length,350);
 for(const q of questions){
   const result=render(q);
   if(Object.hasOwn(map,q.id)){
     assert.equal(q.course,ropeIds.includes(q.id)?'abseilen':cargoIds.includes(q.id)?'ladungssicherung':craneIds.includes(q.id)?'krane':excavatorIds.includes(q.id)?'bagger':liftIds.includes(q.id)?'hebebuehnen':Object.hasOwn(riggingMap,q.id)?'lasten':'gabelstapler');
     assert.match(result,/data-action="quiz-illustration"/);
     assert.match(result,/aria-haspopup="dialog"/);
     assert.match(render(q,true),/question-illustration-large/);
     const file='dist/'+map[q.id].slice(2);
     const bytes=fs.readFileSync(file);
     assert.match(file,/\/premium\/[\w-]+\.webp$/);
     assert.equal(bytes.toString('ascii',0,4),'RIFF');
     assert.equal(bytes.toString('ascii',8,12),'WEBP');
     assert.ok(bytes.length>10000&&bytes.length<200000);
     assert.match(result,/width="\d+" height="\d+"/);
     assert.ok(sw.includes(JSON.stringify(map[q.id])));
   }else assert.equal(result,'');
 }
 assert.equal(render({course:'krane',id:Object.keys(map)[0]},true),'');
 assert.equal(render({course:'gabelstapler',id:'a-neigungswinkel'},true),'');
 assert.equal(render({course:'lasten',id:'g-kurvenfahrt'},true),'');
 assert.equal(render(null),'');
});
test('pilot is optional in all learning modes and does not modify answers',()=>{
 assert.match(app,/\$\{questionIllustration\(q\)\}<div class="answers"/);
 assert.match(app,/action==='quiz-illustration'&&run&&route==='uebung'/);
 assert.match(app,/if\(illustration\)modal\(esc\(I18N\.t\(10\)\),illustration\)/);
 assert.match(css,/\.question-illustration img,\.question-illustration-large img\{[^}]*height:auto/);
 assert.match(app,/event\.target\.closest\('figure'\)\.hidden=true/);
 assert.match(html,/app\.js\?v=56"/);
 assert.match(sw,/"\.\/app\.js\?v=56"/);
 assert.match(html,/experience\.css\?v=11"/);
 assert.match(sw,/"\.\/experience\.css\?v=11"/);
});

test('half the forklift questions have neutral photo scenes and retired vectors are not cached',()=>{
 assert.equal(new Set(Object.values(map)).size,93);
 assert.deepEqual(Object.keys(map).sort(),["a-abstimmung","a-haken","a-kantenschutz","a-lastweg","a-neigungswinkel","a-probehub","a-schwerpunkt","a-sichtpruefung","a-vierstraenge","as-absperren","as-aenderung","as-anschlag","as-dokumentation","as-ende","as-gelander","as-kante","as-kennzeichnung","as-kommunikation","as-kompatibel","as-kontrolle","as-lager","as-partner","as-planung","as-pruefung","as-rettungsdienst","as-schutz","as-sitz","as-uebergabe","as-verschluss","as-verstaendnis","as-werkzeug","as-wetter","as-ziel","as-zugang","b-boeschung","b-einstieg","b-einweisen","b-einweiser","b-graben","b-laufwerk","b-leitungen","b-personen","b-pruefung","b-rueckwaerts","b-schwenkbereich","b-standsicherheit","b-unterbau","b-verlassen","b2-arbeitsunterbrechung","b2-bodenprobe","b2-feuchtigkeit","b2-fremdperson","b2-fussgaenger","b2-ladearbeiten","b2-maschinenzugang","b2-parkstellung","b2-schwenkradius","b2-verkehrseinweiser","b2-wasserleitung","g-anbaugeraet","g-batterieladen","g-flurpruefung","g-fussgaenger","g-gabelabsenken","g-gabelabstand","g-kurvenfahrt","g-ladebruecke","g-ladungssicherung","g-lastschwerpunkt","g-mangelmelden","g-neigung","g-personen","g-reifen","g-rueckhalt","g-schieflast","g-tore","g-transporthoehe","g-verkehrswege","g2-lagerregal","g2-rampe","g2-sichtladung","g2-transportsicherung","g2-uebergabe","g2-zinke","h-absperren","h-kollision","h-quetschen","h-rettung","h-schraegstellung","h-sicht","h-strom","h-tragfaehigkeit","h-transportstellung","h-ueberlast","h-umgebung","h-untergrund","h-verfahren","h-wind","h2-absperrpersonal","h2-abstuetzplatte","h2-arbeitsvorbereitung","h2-aufbaukontakt","h2-energieleitung","h2-funkkommunikation","h2-lastverteilen","h2-leitungsnaehe","h2-rettungsperson","h2-sicherheitsabstand","h2-transporthoehe","k-anzuheben","k-bremsprobe","k-lastanschlag","k-lastweg","k-personen","k-ruck","k-sicht","k-signale","k-signalverlust","k-sperrbereich","k-stopp","k-stuetzen","k-wetter","k-zugrichtung","k2-anfahrbereich","k2-arbeitsplanung","k2-betriebsbereich","k2-funkakku","k2-hakenposition","k2-hochheben","k2-mehrereanschlaeger","k2-ortswechsel","k2-pendel","k2-schneekante","k2-wetterbeobachtung","l-ablegen","l-kantenschutz","l-schwerpunkt","l-sichtpruefung","l-spreizwinkel","l-zeichen","l2-anheben","l2-aufhaengung","l2-einseitig","l2-einweiserrolle","l2-fasern","l2-kettenriss","l2-lasthaken","l2-schaekel","l2-tragfaehigkeit","l2-transportweg","ls-anzahl","ls-aufbau","ls-direkt","ls-empfindlich","ls-fahrer","ls-formschluss","ls-gewicht","ls-haken","ls-kantenschutz","ls-kraftschluss","ls-kurzstrecke","ls-lastplan","ls-luecke","ls-matten","ls-palette","ls-pflicht","ls-reibung","ls-riss","ls-rollen","ls-schwerpunkt","ls-sichtcheck","ls-stf","ls-teilentladung","ls-winkel","ls-zurrpunkt"]);
 assert.equal(scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='gabelstapler').length,50);
 assert.equal(scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='gabelstapler'&&render(q)).length,25);
 assert.doesNotMatch(sw,/assets\/quiz\/g[^"]+\.svg/);
 assert.doesNotMatch(css,/\.question-illustration img,\.question-illustration-large img\{[^}]*aspect-ratio:2\/1/);
});


test('25 rigging questions are illustrated and the original neutral angle image remains',()=>{
 const qs=scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='lasten');
 assert.equal(qs.length,50);
 assert.deepEqual(Array.from(qs.filter(q=>render(q)),q=>q.id).sort(),["a-abstimmung","a-haken","a-kantenschutz","a-lastweg","a-neigungswinkel","a-probehub","a-schwerpunkt","a-sichtpruefung","a-vierstraenge","l-ablegen","l-kantenschutz","l-schwerpunkt","l-sichtpruefung","l-spreizwinkel","l-zeichen","l2-anheben","l2-aufhaengung","l2-einseitig","l2-einweiserrolle","l2-fasern","l2-kettenriss","l2-lasthaken","l2-schaekel","l2-tragfaehigkeit","l2-transportweg"]);
 assert.equal(map['a-neigungswinkel'],"./assets/quiz/premium/a-neigungswinkel.webp");
 assert.equal(map['l-spreizwinkel'],map['a-neigungswinkel']);
 assert.match(render(qs.find(q=>q.id==='a-neigungswinkel')),/width="682" height="200"/);
 assert.equal(JSON.parse(sw.match(/const ASSETS=(\[[^\n]+\]);/)[1]).filter(a=>a===map['a-neigungswinkel']).length,1);
});

test('25 lift questions use 15 cached illustrations and remain isolated from other categories',()=>{const qs=scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='hebebuehnen');assert.equal(qs.length,50);assert.deepEqual(Array.from(qs.filter(q=>render(q)),q=>q.id).sort(),liftIds);const urls=[...new Set(liftIds.map(id=>map[id]))];assert.equal(urls.length,15);const cached=JSON.parse(sw.match(/const ASSETS=(\[[^\n]+\]);/)[1]);for(const url of urls)assert.equal(cached.filter(a=>a===url).length,1);for(const id of liftIds){const q=qs.find(q=>q.id===id);assert.match(render(q),/width="960" height="720"/);assert.match(render(q,true),/question-illustration-large/);assert.equal(render({...q,course:'lasten'}),'');assert.equal(render({...q,course:'gabelstapler'}),'');}});

test('25 excavator questions use 13 cached illustrations and remain isolated from other categories',()=>{const qs=scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='bagger');assert.equal(qs.length,50);assert.deepEqual(Array.from(qs.filter(q=>render(q)),q=>q.id).sort(),excavatorIds);const urls=[...new Set(excavatorIds.map(id=>map[id]))];assert.equal(urls.length,13);const cached=JSON.parse(sw.match(/const ASSETS=(\[[^\n]+\]);/)[1]);for(const url of urls)assert.equal(cached.filter(a=>a===url).length,1);for(const id of excavatorIds){const q=qs.find(q=>q.id===id);assert.match(render(q),/width="1120" height="630"/);assert.match(render(q,true),/question-illustration-large/);for(const course of ['lasten','hebebuehnen','gabelstapler','krane'])assert.equal(render({...q,course}),'');}});

test('25 crane questions use ten cached illustrations and remain isolated from other categories',()=>{const qs=scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='krane');assert.equal(qs.length,50);assert.deepEqual(Array.from(qs.filter(q=>render(q)),q=>q.id).sort(),craneIds);const urls=[...new Set(craneIds.map(id=>map[id]))];assert.equal(urls.length,10);const cached=JSON.parse(sw.match(/const ASSETS=(\[[^\n]+\]);/)[1]);for(const url of urls)assert.equal(cached.filter(a=>a===url).length,1);for(const id of craneIds){const q=qs.find(q=>q.id===id);assert.match(render(q),/width="1120" height="630"/);assert.match(render(q,true),/question-illustration-large/);for(const course of ['lasten','hebebuehnen','gabelstapler','bagger'])assert.equal(render({...q,course}),'');}});

test('25 cargo questions use ten cached illustrations and remain isolated from other categories',()=>{const qs=scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='ladungssicherung');assert.equal(qs.length,50);assert.deepEqual(Array.from(qs.filter(q=>render(q)),q=>q.id).sort(),cargoIds);const urls=[...new Set(cargoIds.map(id=>map[id]))];assert.equal(urls.length,10);const cached=JSON.parse(sw.match(/const ASSETS=(\[[^\n]+\]);/)[1]);for(const url of urls)assert.equal(cached.filter(a=>a===url).length,1);for(const id of cargoIds){const q=qs.find(q=>q.id===id);assert.match(render(q),/width="1120" height="630"/);assert.match(render(q,true),/question-illustration-large/);for(const course of ['lasten','hebebuehnen','gabelstapler','bagger','krane','abseilen'])assert.equal(render({...q,course}),'');}});

test('25 rope questions use eleven cached illustrations and all seven categories have 25 illustrated questions',()=>{const qs=scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course==='abseilen');assert.equal(qs.length,50);assert.deepEqual(Array.from(qs.filter(q=>render(q)),q=>q.id).sort(),ropeIds);const urls=[...new Set(ropeIds.map(id=>map[id]))];assert.equal(urls.length,11);const cached=JSON.parse(sw.match(/const ASSETS=(\[[^\n]+\]);/)[1]);for(const url of urls)assert.equal(cached.filter(a=>a===url).length,1);for(const id of ropeIds){const q=qs.find(q=>q.id===id);assert.match(render(q),/width="1120" height="630"/);assert.match(render(q,true),/question-illustration-large/);for(const course of ['lasten','hebebuehnen','gabelstapler','bagger','krane','ladungssicherung'])assert.equal(render({...q,course}),'');}for(const course of ['lasten','hebebuehnen','gabelstapler','bagger','krane','ladungssicherung','abseilen'])assert.equal(scope.ABBATE_PRACTICE_BANK.questions.filter(q=>q.course===course&&render(q)).length,25);});
