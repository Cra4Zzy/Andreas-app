'use strict';
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const B = globalThis.ABBATE_BACKEND;
const LANGUAGE_STORE = 'abbate-language-v1';
const I18N = globalThis.ABBATE_I18N;
const supportedLanguage = code => I18N.languages.some(language=>language.code===code);
const browserLanguage = (navigator.languages||[navigator.language||'de']).map(value=>String(value).toLowerCase().split('-')[0]).find(supportedLanguage)||'de';
let selectedLanguage = localStorage.getItem(LANGUAGE_STORE)||browserLanguage;
if(!supportedLanguage(selectedLanguage))selectedLanguage='de';
const languageConfig = () => I18N.languages.find(language=>language.code===selectedLanguage)||I18N.languages.find(language=>language.code==='de');
const tr = key => I18N.copy[selectedLanguage]?.[key]||I18N.copy.de[key]||key;
const passLabel=()=>I18N.shellLabels[selectedLanguage]?.[2]||'Schulungspass';
const uid = () => globalThis.crypto?.randomUUID?.() || 'round-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
const dateISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const offsetDate = days => { const d = new Date(); d.setDate(d.getDate()+days); return dateISO(d); };
const fmtDate = date => new Date(date+'T12:00:00').toLocaleDateString(languageConfig().locale,{day:'2-digit',month:'2-digit',year:'numeric'});
const endOfDay = date => new Date(date+'T23:59:59.999');
const active = person => globalThis.ABBATE_ACCOUNTS.access(person);
const daysLeft = date => Math.max(0,Math.ceil((endOfDay(date)-new Date())/86400000));
const initials = name => name.split(' ').filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
const isNativeApp = () => globalThis.Capacitor?.isNativePlatform?.() === true || location.protocol === 'tauri:' || location.hostname === 'tauri.localhost';
const isAppMode = () => isNativeApp() || window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
// Native desktop/mobile builds already have an app icon and need no web download prompt.

function installPlatform() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1)) return 'iphone';
  return /Macintosh|Mac OS X/i.test(ua) ? 'mac' : 'windows';
}
const PRACTICE_BANK=globalThis.ABBATE_PRACTICE_BANK;
if(!PRACTICE_BANK||!Array.isArray(PRACTICE_BANK.questions))throw Error('Question bank not loaded');
// Stable question IDs and numeric answer keys always come from the German
// source. Only the six visible text fields are replaced by static locale packs.
const QUESTION_LOCALES=globalThis.ABBATE_QUESTION_TRANSLATIONS||(globalThis.ABBATE_QUESTION_TRANSLATIONS=Object.create(null));
const questionLocaleRequests=new Map();
async function ensureQuestionLocale(code){
  if(code==='de')return true;
  if(!supportedLanguage(code))return false;
  if(QUESTION_LOCALES[code])return Object.keys(QUESTION_LOCALES[code]).length===PRACTICE_BANK.questions.length;
  if(!questionLocaleRequests.has(code)){
    const promise=new Promise(resolve=>{
      const script=document.createElement('script');
      script.src='./practice-translations/'+code+'.js?v=1';
      script.async=true;
      script.onload=()=>resolve(Boolean(QUESTION_LOCALES[code]&&Object.keys(QUESTION_LOCALES[code]).length===PRACTICE_BANK.questions.length));
      script.onerror=()=>resolve(false);
      document.head.appendChild(script);
    });
    questionLocaleRequests.set(code,promise);
  }
  const available=await questionLocaleRequests.get(code);
  if(!available)questionLocaleRequests.delete(code);
  return available;
}
function localizedQuestion(q){
  if(!q||selectedLanguage==='de')return q;
  const fields=QUESTION_LOCALES[selectedLanguage]?.[q.id];
  if(!Array.isArray(fields)||fields.length!==6||fields.some(t=>typeof t!=='string'||!t.trim()))return q;
  return {...q,title:fields[0],context:fields[1],answers:fields.slice(2,5),why:fields[5]};
}

// Fifty explicitly graded, course-scoped exercises per area. The legacy six demo questions are retired.
const LEGACY_GRADED_QUESTIONS = [
  {id:'check',topic:'grundlagen',title:'Beim Fahrzeugcheck bemerkst du einen sicherheitsrelevanten Mangel. Was machst du?',context:'Du willst gerade mit deiner Arbeit beginnen. Eine Funktion arbeitet nicht zuverlässig.',answers:['Ich arbeite vorsichtig weiter und melde den Mangel später.','Ich benutze das Gerät nicht weiter und melde den Mangel der zuständigen Person.','Ich lasse eine andere Person damit weiterfahren.'],correct:1,why:'Sicherheitsrelevante Mängel müssen gemeldet werden. Ein Fahrzeug mit solchen Mängeln darf nicht weiter eingesetzt werden.'},
  {id:'auftrag',topic:'grundlagen',title:'Wer darf einen Gabelstapler mit Fahrersitz selbstständig führen?',context:'Es geht um den selbstständigen Einsatz im Betrieb.',answers:['Wer volljährig, geeignet und ausgebildet ist, seine Befähigung nachgewiesen hat und schriftlich beauftragt wurde.','Jede Person, die einen Pkw-Führerschein besitzt.','Jede Person, die schon einmal mitgefahren ist.'],correct:0,why:'Ein Pkw-Führerschein allein genügt nicht. Erforderlich sind Eignung, Ausbildung, Befähigungsnachweis und schriftliche Beauftragung.'},
  {id:'traglast',topic:'lasten',title:'Worauf kommt es vor dem Aufnehmen einer Last an?',context:'Du möchtest sicher sein, dass du die Last mit diesem Fahrzeug bewegen darfst.',answers:['Ich schätze das Gewicht und orientiere mich nur an der Fahrzeuggröße.','Ich nehme die Last kurz hoch und beobachte, was passiert.','Ich halte die zulässige Belastung des Fahrzeugs ein.'],correct:2,why:'Flurförderzeuge dürfen nicht überlastet werden. Entscheidend ist die zulässige Belastung.'},
  {id:'unter-last',topic:'lasten',title:'Eine Last ist angehoben. Was gilt für den Bereich darunter?',context:'Eine Person möchte direkt unter der angehobenen Last hindurchgehen.',answers:['Der Bereich darunter bleibt frei; dort darf sich niemand aufhalten.','Ein kurzer Aufenthalt ist in Ordnung, wenn die Last stillsteht.','Der Aufenthalt ist erlaubt, wenn die Person einen Helm trägt.'],correct:0,why:'Unter angehobenen Lasten darf sich niemand aufhalten. Auch ein Helm macht diesen Bereich nicht sicher.'},
  {id:'sicht',topic:'betrieb',title:'Die Last versperrt dir die Sicht auf den Fahrweg. Wie gehst du vor?',context:'Du musst den Fahrweg und mögliche Gefahren zuverlässig erkennen können.',answers:['Ich fahre besonders schnell durch den unübersichtlichen Bereich.','Ich sorge für ausreichende Sicht oder lasse mich nach betrieblicher Vorgabe einweisen.','Ich hupe und fahre ohne freie Sicht weiter.'],correct:1,why:'Du brauchst ausreichende Sicht oder eine sichere Einweisung. Hupen ersetzt beides nicht.'},
  {id:'verlassen',topic:'betrieb',title:'Du verlässt das Fahrzeug. Was ist dabei wichtig?',context:'Dein Arbeitsschritt ist beendet und du steigst aus.',answers:['Der nächste Fahrer wird das Fahrzeug schon sichern.','Es reicht, wenn das Fahrzeug gerade stillsteht.','Ich sichere es gegen unbeabsichtigtes Bewegen und unbefugtes Benutzen.'],correct:2,why:'Vor dem Verlassen muss das Fahrzeug gegen unbeabsichtigtes Bewegen und unbefugtes Benutzen gesichert werden.'},
 ];

const QUESTIONS = [...PRACTICE_BANK.questions];
const TOPICS = [
  {id:'grundlagen',name:'Fahrzeug & Verantwortung',description:'Gut vorbereitet starten: Was du vor dem Einsatz wissen und prüfen solltest.',short:'Dein sicherer Einstieg',icon:'shield',color:''},
  {id:'lasten',name:'Lasten & Grenzen',description:'Lasten richtig einschätzen und die Grenzen des Fahrzeugs beachten.',short:'Mit Überblick bewegen',icon:'file',color:'sand'},
  {id:'betrieb',name:'Sicher im Arbeitsalltag',description:'Sicht, Zusammenarbeit und ein sicher abgestelltes Fahrzeug.',short:'Auf dich und andere achten',icon:'users',color:'blue'}
];
const COURSES=[{"id":"gabelstapler","name":"Gabelstapler","desc":"Fahrbetrieb, Fahrzeugcheck und Lastaufnahme. 50 bewertbare Übungsfragen.","sub":"50 Lernfragen","icon":"shield","color":"","active":true},{"id":"hebebuehnen","name":"Hebebühnen","desc":"Sicheres Arbeiten mit Hubarbeitsbühnen: Vorbereitung, Standsicherheit und Bedienung.","sub":"Lernmaterial folgt","icon":"users","color":"blue","active":false},{"id":"krane","name":"Krane","desc":"Kranbetrieb, Signale, Arbeitsbereich und sichere Lastbewegungen.","sub":"Lernmaterial folgt","icon":"file","color":"sand","active":false},{"id":"lasten","name":"Anschlagen von Lasten","desc":"Lasten richtig anschlagen, Anschlagmittel beurteilen und sicher kommunizieren.","sub":"Lernmaterial folgt","icon":"book","color":"","active":false},{"id":"bagger","name":"Erdbaumaschinen & Bagger","desc":"Bedienung von Erdbaumaschinen, Sicherheitsabstände und Gefahrenbereiche.","sub":"Lernmaterial folgt","icon":"shield","color":"blue","active":false}].map(course=>({...course,active:true,sub:PRACTICE_BANK.questions.filter(q=>q.course===course.id).length+' Übungsfragen'}));
// Every qualification has its own materials. Never reuse forklift content for cranes or earthmovers.
let activeCourseId='gabelstapler';
const courseQuestions=id=>QUESTIONS.filter(q=>(q.course||'gabelstapler')===id);
const courseLabel=id=>COURSES.find(c=>c.id===id)?.name||'Gabelstapler';
let data={selected:null,students:[],results:[],mastered:{}};
let run=null, latestResult=null, search='', deferredInstall=null, toastTimer=null, pendingRoute=null;
const student = () => data.students.find(s=>s.id===data.selected)||{id:'guest',name:'Gast',email:'',until:offsetDate(-1),access:'pending'};
const question = id => QUESTIONS.find(q=>q.id===id)||LEGACY_GRADED_QUESTIONS.find(q=>q.id===id);
const topic = id => TOPICS.find(t=>t.id===id);
const mastered = () => (data.mastered[student().id]||[]).filter(id=>question(id));
let saveTimer,saveQueue=Promise.resolve(),saveRevision=0,savedRevision=0;
function save(){
  const revision=++saveRevision;
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{
    const payload={results:data.results.slice(-100),mastered:[...mastered()]};
    saveQueue=saveQueue.catch(()=>{}).then(()=>B.savePractice(payload)).then(()=>{
      savedRevision=Math.max(savedRevision,revision);
    }).catch(()=>toast('Dein Lernstand ist noch nicht gespeichert. Bitte Verbindung prüfen; bei Wiederverbindung wird erneut gespeichert.'));
  },150);
}
window.addEventListener('online',()=>{if(savedRevision<saveRevision)save();});
function toast(message) { $('#toast').textContent=I18N.text(message); $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4300); }
function modal(title,content) { $('#modal-content').innerHTML=`<div class="modal-head"><h2>${title}</h2><button class="icon-button" data-action="close" aria-label="Schließen">${icon('close')}</button></div><div class="modal-body">${content}</div>`; I18N.localize($('#modal-content')); if(!$('#modal').open) $('#modal').showModal(); }
function close() { $('#modal').close(); }
let route='start';

const routeMap={start:'Start',lernen:'Lernen',pruefung:'Prüfung',ergebnisse:'Ergebnisse',verwaltung:'Verwaltung',uebung:'Training',ergebnis:'Dein Ergebnis'};
function accessLine() { const s=student(); return `<span class="access-line ${active(s)?'':'expired'}">${icon(active(s)?'check':'lock')}${active(s)?s.until?`Zugang aktiv · ${daysLeft(s.until)} Tage`:'Zugang aktiv':s.access==='pending'?'Wartet auf Freischaltung':s.access==='paused'?'Zugang pausiert':'Zugang abgelaufen'}</span>`; }
function heading(label,title,description='',action='') { return `<div class="page-heading"><div><div class="overline">${icon('book')}${label}</div><h1>${title}</h1>${description?`<p>${description}</p>`:''}</div>${action}</div>`; }
function navigation() {
  const nav=[['start','home',tr('home')],['lernen','book',tr('learn')],['pruefung','file',tr('exam')],['ergebnisse','chart',tr('results')]];
  const current=route==='uebung'?(run?.mode==='learn'?'lernen':'pruefung'):route==='ergebnis'?'ergebnisse':route;
  $('#desktop-nav').innerHTML=nav.map(([id,,name])=>`<a href="#${id}" class="${current===id?'active':''}" ${current===id?'aria-current="page"':''}>${name}</a>`).join('')+`<a href="./nachweise.html">${esc(passLabel())}</a>`;
  $('#mobile-nav').innerHTML=nav.map(([id,i,name])=>`<a href="#${id}" class="${current===id?'active':''}" ${current===id?'aria-current="page"':''}>${icon(i)}${name}</a>`).join('')+`<a href="./nachweise.html">${icon('shield')}${esc(passLabel())}</a>`;
  document.documentElement.lang=selectedLanguage;
  $('#language-code').textContent=selectedLanguage.toUpperCase();
  $('#language-button').setAttribute('aria-label',`${tr('change')}: ${languageConfig().name}`);
  $('.brand').setAttribute('aria-label',tr('home'));
  $('.brand small').textContent=I18N.t(11);
  $('#desktop-nav').setAttribute('aria-label',I18N.t(28));
  $('#mobile-nav').setAttribute('aria-label',I18N.t(28));
  $('#profile-button').setAttribute('aria-label',I18N.t(88));
  document.title=I18N.t(19);
  $('#profile-name').textContent=student().name.split(' ')[0]; $('#avatar').textContent=initials(student().name);
}
function languageStatus() {
  if(selectedLanguage==='de')return '';
  return `<aside class="language-status"><span class="language-status-icon" aria-hidden="true">🌐</span><div><strong>${esc(I18N.t(180))}</strong><p>${esc(I18N.t(8))}</p></div><button class="text-link" data-action="language">${esc(tr('change'))}</button></aside>`;
}

function topicRows() {
  return COURSES.map((course,i) =>
    '<div class="topic-row course-home-row '+(course.active?'course-home-active':'course-home-pending')+'">'+
     '<span class="course-home-number">'+String(i+1).padStart(2,'0')+'</span>'+
     '<span class="topic-symbol '+course.color+'">'+icon(course.icon)+'</span>'+
     '<span class="course-home-copy"><strong class="topic-title">'+esc(course.name)+'</strong><small>'+esc(course.sub)+'</small></span>'+
     (course.active
      ?'<button type="button" class="course-home-link" data-action="start-learn" data-course="'+esc(course.id)+'" aria-label="'+esc(course.name)+' üben">'+icon('arrow')+'</button>'
      :'<span class="course-home-soon">Bald</span>')+
    '</div>'
  ).join('');
}
function installStrip() { return isAppMode()?'':`<aside class="install-strip"><img src="./icon-192.png?v=9" alt="" width="47" height="47"><div><strong>Mobile Nutzung</strong><p>Der Lernraum kann auf iOS und Android zum Startbildschirm hinzugefügt werden.</p></div><button class="secondary" data-action="install">Installationsanleitung ${icon('arrow')}</button></aside>`; }
function home() {
  const name=esc(student().name.split(' ')[0]), learned=mastered().length, total=QUESTIONS.length, ok=active(student());
  return heading('Lernübersicht',`Willkommen, ${name}.`,'',accessLine())+languageStatus()+`
  <section class="home-hero"><div class="hero-text"><div class="course-label"><span></span>Gabelstapler · Dein Theorietraining</div><h2>${esc(I18N.t(20))}</h2><p>Übe die theoretischen Grundlagen für den sicheren Umgang mit Gabelstaplern.</p><div class="hero-actions"><button class="primary" data-action="${ok?'start-learn':'access'}" data-course="gabelstapler">${ok?(learned?'Weiterlernen':'Lernrunde starten'):'Zugang ansehen'} ${icon(ok?'arrow':'lock')}</button><a class="text-link" href="#pruefung">Prüfung vorbereiten ${icon('arrow')}</a></div><div class="hero-proof">${icon('clock')}Übungsrunden ohne Zeitlimit.</div></div><div class="hero-photo"><img src="./assets/abbate-stapler-kundenfoto-hq.avif" alt="Originaler gelber Jungheinrich-Gabelstapler der Fahrschule Andreas Abbate" width="1244" height="1265" decoding="async" fetchpriority="high"></div></section>
  <section class="learning-route" aria-label="Dein Lernweg"><a class="route-step" href="#lernen"><span class="route-number">01</span><span><strong>Verstehen</strong><small>Themen in Ruhe durchgehen</small></span>${icon('arrow')}</a><button class="route-step" data-action="start-learn" data-course="gabelstapler"><span class="route-number">02</span><span><strong>Wissen festigen</strong><small>Mit direkter Rückmeldung üben</small></span>${icon('arrow')}</button><a class="route-step" href="#pruefung"><span class="route-number">03</span><span><strong>Bereit werden</strong><small>Den Prüfungsablauf kennenlernen</small></span>${icon('arrow')}</a></section>
  <div class="home-lower"><section><div class="section-topline"><h2>Ausbildungsbereiche</h2><a class="text-link" href="#lernen">Alle Bereiche ${icon('arrow')}</a></div><div class="topic-list">${topicRows()}</div></section><aside class="progress-note"><div class="note-label">${icon('chart')}Lernfortschritt</div><h3>${learned?'Dein Lernstand':'Noch keine Fragen abgeschlossen'}</h3><p>${learned?`Du hast bereits ${learned} von ${total} Fragen richtig beantwortet.`:'Beginne eine Lernrunde. Zu jeder Antwort erhältst du eine Erläuterung.'}</p><div class="progress-meter" role="progressbar" aria-label="Richtig beantwortete Übungsfragen" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${learned}"><span style="width:${learned/total*100}%"></span></div><div class="progress-count">${learned} von ${total} Fragen richtig beantwortet</div><a class="text-link" href="#ergebnisse">Deine bisherigen Runden ${icon('arrow')}</a></aside></div>${installStrip()}`;
}

function learning() {
 const cards=COURSES.map((course,i)=>
 '<article class="qualification-card '+(course.active?'qualification-available':'qualification-upcoming')+'">'+
 '<div class="qualification-top"><span class="qualification-index">0'+(i+1)+' / 05</span><span class="qualification-badge '+(course.active?'live':'upcoming')+'">'+(courseQuestions(course.id).length+' Fragen im Pool')+'</span></div>'+
 '<div class="qualification-symbol '+course.color+'">'+icon(course.icon)+'</div>'+
 '<h2>'+esc(course.name)+'</h2>'+
 '<p>'+esc(course.desc)+'</p>'+
 '<div class="qualification-footer">'+(course.active
  ?'<button class="primary qualification-cta" data-action="start-learn" data-course="'+esc(course.id)+'">'+Math.min(ROUND_QUESTION_LIMIT,courseQuestions(course.id).length)+' Fragen üben '+icon('arrow')+'</button><button class="text-link" data-action="start-exam" data-course="'+esc(course.id)+'">Prüfungstraining '+icon('arrow')+'</button>'
  :'<span class="qualification-awaiting">Lernmaterial noch nicht verfügbar</span>')+'</div>'+
 '<p class="form-caption">Fachliche Grundlage: <a href="'+esc(PRACTICE_BANK.courses[course.id].url)+'" target="_blank" rel="noopener noreferrer">'+esc(PRACTICE_BANK.courses[course.id].source)+'</a></p>'+
 '</article>'
 ).join('');
 return heading('Deine Ausbildung','Was möchtest du lernen?','Wähle deinen Ausbildungsbereich. Alle fünf Bereiche enthalten Übungsfragen. Die fachliche Freigabe durch die Fahrschule steht noch aus.',accessLine())+
 (selectedLanguage==='de'||QUESTION_LOCALES[selectedLanguage]?'':'<p class="form-caption">Übersetzung der Übungsfragen momentan nicht verfügbar; deutsche Texte werden angezeigt.</p>')+
  '<section class="qualification-grid" aria-label="Ausbildungsbereiche">'+cards+'</section>'+
 '<section class="learning-tip"><img src="./assets/theorie-schulung.webp" alt="Teilnehmer bei einer Theorie-Schulung" loading="lazy" width="1100" height="825"><div><h3>Lernmaterial nach Ausbildungsbereich</h3><p>Die Themen sind nach Ausbildungsbereichen gegliedert. Diese Übungsfragen ersetzen keine verbindliche Abschlussprüfung.</p><a class="text-link" href="#pruefung">Zum Prüfungstraining '+icon('arrow')+'</a></div></section>';
}
function examStart() {
  const name=courseLabel(activeCourseId),pool=courseQuestions(activeCourseId).length,count=Math.min(ROUND_QUESTION_LIMIT,pool);
  return heading(name+' · Prüfungsvorbereitung','Prüfungsvorbereitung','Wähle eine Übungsform.',accessLine())+
  '<p class="adaptive-learning-note">Deine Auswahl passt sich an: Neue Fragen zuerst, Fehler zeitversetzt wiederholen und sicher beantwortete Fragen in größeren Abständen auffrischen.</p><div class="mode-grid"><section class="mode-card"><span class="mode-icon">'+icon('book')+'</span><h2>Mit Rückmeldung üben</h2><p>Nach jeder Frage erhältst du eine Erklärung.</p><div class="mode-features"><span>'+icon('check')+'Erklärung direkt nach jeder Frage</span><span>'+icon('check')+'Ohne Zeitlimit üben</span><span>'+icon('check')+count+' individuell gemischte Fragen aus '+pool+' Übungsfragen</span></div><button class="secondary" data-action="start-learn" data-course="'+esc(activeCourseId)+'">Lernrunde starten '+icon('arrow')+'</button></section><section class="mode-card focus"><span class="mode-icon">'+icon('file')+'</span><h2>Den Ablauf kennenlernen</h2><p>Beantworte zunächst alle Fragen. Die Auswertung erfolgt nach dem Abschluss.</p><div class="mode-features"><span>'+icon('check')+'Antworten vor der Abgabe ändern</span><span>'+icon('check')+'Auswertung nach dem Abschluss</span><span>'+icon('check')+count+' individuell gemischte Fragen · ohne Zeitlimit</span></div><button class="primary gold" data-action="start-exam" data-course="'+esc(activeCourseId)+'">Prüfungstraining starten '+icon('arrow')+'</button></section></div><p class="exam-disclaimer">Eine verbindliche Abschlussprüfung oder Unterweisung findet hier nicht statt. Die fachliche Freigabe der neuen Übungsfragen durch die Fahrschule steht noch aus.</p>';
}
const ROUND_QUESTION_LIMIT=20;
const DAY_MS=86400000;
// Adaptive spacing based only on the signed-in learner's saved, completed rounds.
// Correct streaks are revisited after 1, 3, 7, 14, 30 and 60 days;
// wrong or unanswered questions become due again on the following day.
// These intervals are a transparent product heuristic, not a validated exam score.
const CORRECT_REVIEW_DAYS=[1,3,7,14,30,60];
function shuffled(items){
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}
function questionLearningState(courseId,now=Date.now()){
  const states=new Map();
  const history=data.results
    .filter(r=>r.student===student().id&&r.course===courseId&&['learn','exam'].includes(r.mode)&&
      Array.isArray(r.ids)&&Number.isFinite(Date.parse(r.at)))
    .slice().sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
  for(const round of history){
    const at=Date.parse(round.at);
    for(const id of round.ids){
      const q=question(id);
      if(!q||(q.course||'gabelstapler')!==courseId)continue;
      const previous=states.get(id);
      const correct=round.answers?.[id]===q.correct;
      const streak=correct?(previous?.streak||0)+1:0;
      const interval=correct?CORRECT_REVIEW_DAYS[Math.min(streak-1,CORRECT_REVIEW_DAYS.length-1)]:1;
      states.set(id,{streak,correct,attempts:(previous?.attempts||0)+1,
        lastAt:at,dueAt:at+interval*DAY_MS,overdueDays:Math.max(0,(now-at-interval*DAY_MS)/DAY_MS)});
    }
  }
  return states;
}
function selectRoundQuestions(courseId,topicId,now=Date.now()){
  const available=courseQuestions(courseId).filter(q=>!topicId||q.topic===topicId);
  const limit=Math.min(ROUND_QUESTION_LIMIT,available.length);
  if(!limit)return [];
  const states=questionLearningState(courseId,now);
  const previous=data.results.filter(r=>r.student===student().id&&r.course===courseId&&
    ['learn','exam'].includes(r.mode)&&Array.isArray(r.ids))
    .slice().sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))[0];
  const recentlySeen=new Set(previous?.ids||[]);
  // First exhaust unseen questions, then due mistakes, then due correct answers.
  // Questions not yet due are fillers only when needed to reach 20.
  const pools=[[],[],[],[],[]];
  for(const q of shuffled(available)){
    const state=states.get(q.id);
    const group=!state?0:!state.correct?(now>=state.dueAt?1:3):
      (now>=state.dueAt?2:4);
    pools[group].push(q.id);
  }
  // Prefer questions absent from the previous completed round within each category.
  const selected=[];
  for(const pool of pools){
    const fresh=pool.filter(id=>!recentlySeen.has(id));
    const repeated=pool.filter(id=>recentlySeen.has(id));
    for(const id of [...fresh,...repeated]){
      if(selected.length===limit)break;
      selected.push(id);
    }
    if(selected.length===limit)break;
  }
  return shuffled(selected);
}
function startRun(mode,topicId,courseId) {
  if(courseId&&COURSES.some(c=>c.id===courseId))activeCourseId=courseId;
  if(!active(student())) { access(); return; }
  if(run) { modal('Eine Runde läuft noch',`<p>Du kannst deine laufende Runde fortsetzen oder sie beenden und neu anfangen.</p><div class="modal-actions"><button class="primary" data-action="continue-run">Weiterlernen ${icon('arrow')}</button><button class="text-link" data-action="replace-run" data-mode="${mode}" data-topic="${topicId||''}" data-course="${activeCourseId}">Neu beginnen</button></div>`); return; }
  run={mode,course:activeCourseId,ids:selectRoundQuestions(activeCourseId,topicId),index:0,answers:{},checked:[],at:new Date().toISOString()};
  close(); go('uebung');
}
function quizView() {
  if(!run)return examStart();
  const q=localizedQuestion(question(run.ids[run.index])), t=q.course==='gabelstapler'?topic(q.topic):null, courseName=courseLabel(q.course||run.course), categoryLabel=t?.name||courseName, chosen=run.answers[q.id], checked=run.checked.includes(q.id), correct=chosen===q.correct;
  return `<div class="quiz-shell"><div class="quiz-top"><span class="quiz-mode">${icon(run.mode==='learn'?'book':'file')}${run.training?'Dein Fehlertraining':run.mode==='learn'?'Deine Lernrunde':'Dein Prüfungstraining'}</span><button class="text-link" data-action="exit-run">Runde beenden ${icon('close')}</button></div><div class="quiz-progress" style="grid-template-columns:repeat(${run.ids.length},1fr)" aria-label="Frage ${run.index+1} von ${run.ids.length}">${run.ids.map((_,i)=>`<span class="${i<run.index?'done':i===run.index?'current':''}"></span>`).join('')}</div><section class="question-card"><div class="question-meta"><span>${esc(categoryLabel)}</span><span>${run.index+1} / ${run.ids.length}</span></div>${selectedLanguage==='de'||QUESTION_LOCALES[selectedLanguage]?.[q.id]?'':'<p class="question-language-notice" role="note">Übersetzung nicht verfügbar – diese Frage wird auf Deutsch angezeigt.</p>'}<h1>${esc(q.title)}</h1><p class="question-context">${esc(q.context)}</p><div class="answers" role="group" aria-label="Antwortmöglichkeiten">${q.answers.map((answer,i)=>`<button class="answer ${chosen===i?'selected':''} ${checked&&i===q.correct?'correct':''} ${checked&&i===chosen&&!correct?'incorrect':''}" data-action="answer" data-index="${i}" aria-pressed="${chosen===i}" ${checked?'disabled':''}><span class="answer-letter">${String.fromCharCode(65+i)}</span><span>${esc(answer)}</span>${checked&&i===q.correct?icon('check'):''}</button>`).join('')}</div>${checked?`<div class="feedback ${correct?'':'again'}">${icon(correct?'check':'help')}<div><h3>${correct?'Richtig beantwortet.':'Antwort nicht korrekt.'}</h3><p>${esc(q.why)}</p></div></div>`:''}<div class="quiz-bottom"><button class="secondary" data-action="previous" ${run.index===0?'disabled':''}>Zurück</button>${run.mode==='learn'&&!checked?`<button class="primary" data-action="check-answer" ${chosen===undefined?'disabled':''}>Antwort prüfen ${icon('check')}</button>`:`<button class="primary" data-action="next">${run.index===run.ids.length-1?'Runde abschließen':'Nächste Frage'} ${icon('arrow')}</button>`}</div></section><p class="question-note">${run.mode==='learn'?'Eine passende Antwort pro Frage. Nimm dir Zeit für die Erklärung.':'Unbeantwortete Fragen zählen in dieser Übungsrunde als falsch.'}</p></div>`;
}
function rememberCorrect(id) { const list=data.mastered[student().id]||[]; if(!list.includes(id))list.push(id); data.mastered[student().id]=list; }
let completingRun=false;
async function completeRun() {
  if(completingRun)return;
  completingRun=true;
  try{
    if(!await checkAccess())return;
    if(!run)return;
    if(!active(student())) { run=null;close();go('start');access();return; }
    const result={id:uid(),student:student().id,mode:run.mode,course:run.course,ids:[...run.ids],answers:{...run.answers},score:run.ids.filter(id=>run.answers[id]===question(id).correct).length,total:run.ids.length,at:new Date().toISOString()};
    const nextMastered=[...new Set([...mastered(),...run.ids.filter(id=>run.answers[id]===question(id).correct)])];
    // A completed round is only shown as saved after the server has accepted it.
    await B.savePractice({results:[result],mastered:nextMastered});
    data.mastered[student().id]=nextMastered;
    data.results.push(result);
    latestResult=result;run=null;close();go('ergebnis');
  }catch{
    toast('Ergebnis noch nicht gespeichert. Die Runde bleibt erhalten – bitte Verbindung prüfen und erneut abschließen.');
  }finally{completingRun=false;}
}
function wrongQuestionIds(result) {
  return (result.ids||[]).filter(id=>{
    const q=question(id);
    return q && result.answers?.[id]!==q.correct;
  });
}
function startMistakeTraining(result) {
  if(!result)return;
  if(!active(student())){access();return;}
  if(run){toast('Beende zuerst deine laufende Runde.');return;}
  const ids=wrongQuestionIds(result);
  if(!ids.length){toast('In dieser Runde gibt es keine Fehler zum Üben.');return;}
  activeCourseId=COURSES.some(c=>c.id===result.course)?result.course:'gabelstapler';
  run={mode:'learn',training:true,course:activeCourseId,ids,index:0,answers:{},checked:[],at:new Date().toISOString()};
  latestResult=null;
  go('uebung');
}
function reviewCards(result) {
  const ids=wrongQuestionIds(result);
  if(!ids.length)return '<div class="result-clean">'+icon('check')+'<div><strong>Keine Fehler in dieser Runde.</strong><p>Alle Fragen wurden richtig beantwortet.</p></div></div>';
  return '<div class="result-error-list">'+ids.map((id,i)=>{
    const q=localizedQuestion(question(id)),choice=result.answers?.[id];
    const selected=Number.isInteger(choice)&&q.answers?.[choice]!==undefined?esc(q.answers[choice]):'Nicht beantwortet';
    return '<details class="result-error"><summary><span class="result-error-index">'+String(i+1).padStart(2,'0')+'</span><span class="result-error-title">'+esc(q.title)+'</span><span class="result-error-chevron" aria-hidden="true">⌄</span></summary><div class="result-error-detail"><div><small>Deine Antwort</small><p class="result-answer-wrong">'+selected+'</p></div><div><small>Richtige Antwort</small><p class="result-answer-correct">'+esc(q.answers[q.correct])+'</p></div><p class="result-error-explanation">'+esc(q.why)+'</p></div></details>';
  }).join('')+'</div>';
}
function resultView() {
  if(!latestResult)return results();
  const r=latestResult,total=Math.max(0,Number(r.total)||0),score=Math.max(0,Math.min(total,Number(r.score)||0));
  const missed=wrongQuestionIds(r).length,percent=total?Math.round(score/total*100):0;
  return heading(esc(courseLabel(r.course))+' · Auswertung','Dein Ergebnis','Die wichtigsten Zahlen und deine Fehler auf einen Blick.')+
  '<div class="compact-result"><section class="compact-result-summary" aria-label="Ergebnisübersicht">'+
  '<div class="compact-result-head"><div><span class="overline">'+(r.mode==='learn'?'Lernrunde':'Prüfungstraining')+'</span><h2>'+(missed?'Runde abgeschlossen':'Alles richtig beantwortet')+'</h2><p>'+(missed?'Sieh dir deine Fehler an und festige die Antworten im Fehlertraining.':'Starke Runde. Wiederhole die Inhalte später zur Festigung.')+'</p></div><div class="compact-result-percent" aria-label="'+percent+' Prozent richtig">'+percent+'<span>%</span></div></div>'+
  '<div class="compact-result-meter" role="progressbar" aria-label="Richtig beantwortet" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+score+'"><span style="width:'+percent+'%"></span></div>'+
  '<div class="compact-result-stats"><div><strong>'+score+'</strong><small>Richtig</small></div><div><strong>'+missed+'</strong><small>Fehler / Offen</small></div><div><strong>'+total+'</strong><small>Fragen gesamt</small></div></div>'+
  '<div class="compact-result-buttons">'+(missed?'<button class="primary" data-action="mistake-training" data-id="'+esc(r.id)+'">Fehlertraining starten '+icon('arrow')+'</button>':'<button class="primary" data-action="start-learn" data-course="'+esc(r.course||'gabelstapler')+'">Neue Lernrunde '+icon('arrow')+'</button>')+
  '<a class="secondary" href="#ergebnisse">Zur Lernhistorie</a></div><p class="form-caption">Übungsergebnis · kein offizieller Prüfungsnachweis.</p></section>'+
  '<section class="compact-result-review" aria-label="Fehlerübersicht"><div class="compact-result-review-heading"><div><span class="overline">Deine Nachbereitung</span><h2>Fehler ansehen <span>('+missed+')</span></h2></div><small>Zum Öffnen antippen</small></div>'+reviewCards(r)+'</section></div>';
}
function results() {
  const list=data.results.filter(r=>r.student===student().id).slice().reverse();
  const header=heading('Lernhistorie','Deine Ergebnisse','Alle Übungsrunden auf einen Blick. Öffne die Fehler direkt hier und wiederhole gezielt die schwierigen Fragen.',accessLine());
  if(!list.length)return header+'<section class="empty-state"><span class="topic-symbol">'+icon('chart')+'</span><h2>Noch keine Übungsrunden</h2><p>Nach deiner ersten abgeschlossenen Runde erscheinen hier die kompakte Auswertung, aufklappbare Fehler und das Fehlertraining.</p><button class="primary" data-action="start-learn">Lernrunde starten '+icon('arrow')+'</button></section>';
  return header+'<div class="result-history-intro"><div><span class="overline">Dein Lernverlauf</span><strong>'+list.length+' abgeschlossene '+(list.length===1?'Runde':'Runden')+'</strong></div><span>Fehler anzeigen und gezielt üben</span></div><div class="result-history-list">'+list.map(r=>{
    const total=Number(r.total)||r.ids?.length||3,score=Number(r.score)||0,percentage=total?Math.round(score/total*100):0;
    const legacy=r.mode==='legacy',missed=legacy?0:wrongQuestionIds(r).length;
    const name=legacy?'Frühere Übungsrunde':r.mode==='learn'?'Lernrunde':'Prüfungstraining';
    const stamp=Number.isFinite(Date.parse(r.at))?new Date(r.at).toLocaleString(languageConfig().locale,{dateStyle:'medium',timeStyle:'short'}):'';
    return '<article class="result-history-item"><div class="result-history-top"><div class="result-history-description"><span class="result-history-type">'+esc(courseLabel(r.course))+' · '+name+'</span><h2>'+score+' <span>/ '+total+' richtig</span></h2><p>'+esc(stamp)+'</p></div><div class="result-history-percentage" aria-label="'+percentage+' Prozent richtig">'+percentage+'%</div></div><div class="result-history-meter" role="progressbar" aria-label="Richtig beantwortet" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+score+'"><span style="width:'+percentage+'%"></span></div>'+
    (legacy?'<p class="result-history-footnote">Für diese ältere Runde liegt keine detaillierte Fehlerauswertung vor.</p>':
      '<div class="result-history-actions"><span class="result-history-missed">'+(missed?missed+' Fehler / offen':'Alle Fragen richtig')+'</span>'+
      (missed?'<button type="button" class="primary" data-action="mistake-training" data-id="'+esc(r.id)+'">Fehlertraining '+icon('arrow')+'</button>':'')+
      '<button type="button" class="text-link" data-action="review-result" data-id="'+esc(r.id)+'">Komplette Auswertung '+icon('arrow')+'</button></div>'+
      '<details class="result-history-details"><summary>Fehler aufklappen <span>('+missed+')</span><span class="result-history-chevron" aria-hidden="true">⌄</span></summary><div class="result-history-detail-body">'+reviewCards(r)+'</div></details>')+'</article>';
  }).join('')+'</div>';
}
function admin(){if(B.isStaff(B.me)){location.href='./verwaltung.html';return '';}return heading('Verwaltung','Kein Verwaltungszugang.','Dieser Bereich ist nur für berechtigte Mitarbeiter zugänglich.');}
function render() { navigation();const content=route==='start'?home():route==='lernen'?learning():route==='pruefung'?examStart():route==='ergebnisse'?results():route==='verwaltung'?admin():route==='uebung'?quizView():resultView();$('#main').innerHTML=`<div class="page-enter">${content}</div>`;I18N.localize(document.body);navigation(); }
function go(next) { if(location.hash==='#'+next){route=next;render();window.scrollTo({top:0,behavior:'auto'});}else location.hash=next; }
window.addEventListener('hashchange',()=>{let next=location.hash.slice(1);if(next==='verlauf')next='ergebnisse';if(!Object.hasOwn(routeMap,next))next='start';if(next==='uebung'&&!run)next='pruefung';if(next==='ergebnis'&&!latestResult)next='ergebnisse';route=next;render();window.scrollTo({top:0,behavior:'auto'});$('#main').focus({preventScroll:true});});
function profile(){
  const s=student();
  modal('Dein Profil & Zugang',`<div class="profile-summary"><span class="profile-avatar">${esc(initials(s.name))}</span><div><strong>${esc(s.name)}</strong><p>${esc(s.email)}</p></div></div><p>Dein Zugang ist aktiv${s.until?' bis einschließlich '+fmtDate(s.until):'.'}.</p><div class="profile-actions"><button class="secondary" data-action="language">🌐 ${esc(languageConfig().name)}</button><a class="secondary" href="./nachweise.html">${esc(passLabel())}</a><a class="secondary" href="./konto.html#einstellungen">Konto & Datenschutz</a></div><div class="profile-footer">${B.isStaff(B.me)?'<a class="text-link" href="./verwaltung.html">Zur Verwaltung ↗</a>':''}<button class="text-link" data-action="logout">Abmelden</button></div>`);
}
function languagePicker() {
  modal(esc(tr('title')),`<p>${esc(tr('intro'))}</p><label class="language-search"><input id="language-search" type="search" autocomplete="off" aria-label="${esc(tr('title'))}" placeholder="${esc(tr('title'))}"></label><div class="language-grid">${I18N.languages.map(language=>`<button class="language-option ${language.code===selectedLanguage?'active':''}" data-action="set-language" data-language="${language.code}" aria-pressed="${language.code===selectedLanguage}"><span class="language-abbr">${language.code.toUpperCase()}</span><span>${esc(language.name)}</span>${language.code===selectedLanguage?`<small>${esc(tr('selected'))}</small>`:''}</button>`).join('')}</div><div class="language-review-note">${icon('shield')}<span>${esc(I18N.t(8))}</span></div>`);
}
function access() { const s=student();modal('Dein Lernzugang',`<div class="notice ${active(s)?'':'warning'}">${icon(active(s)?'check':'lock')}<span>${active(s)?'Dein Zugang ist aktiv':s.access==='pending'?'Dein Konto wartet auf Freischaltung':s.access==='paused'?'Dein Zugang ist pausiert':'Dein Zugang ist abgelaufen'}. Gültig bis einschließlich <strong>${fmtDate(s.until)}</strong>.</span></div><p>${active(s)?'Du kannst alle freigeschalteten Themen und Übungsrunden nutzen.':'Melde dich bei deiner Fahrschule, wenn du weiterlernen möchtest.'}</p><button class="primary" data-action="close">Verstanden ${icon('check')}</button>`); }
function topicInfo(id) { const t=topic(id);if(!t)return;modal(t.name,`<p>${t.description}</p><p>In dieser Lernrunde beantwortest du ${QUESTIONS.filter(q=>q.topic===id).length} Übungsfragen. Nach jeder Frage erhältst du eine fachliche Erläuterung.</p><button class="primary" data-action="start-learn" data-topic="${id}">Mit diesem Thema starten ${icon('arrow')}</button><p class="form-caption">Diese Übungsfragen helfen beim Lernen. Die verbindlichen Prüfungsinhalte vermittelt deine Fahrschule.</p>`); }
function about(){modal('Über Abbate Lernraum',`<p>Deine Anmeldung, deine Zugangsfreigabe und deine Schulungsnachweise werden sicher über das Konto der Fahrschule verwaltet. Nur berechtigte Mitarbeiter können Schulungen und Prüfungsergebnisse bestätigen.</p><p>Das Theorietraining hilft beim Üben und Verstehen. Übungsrunden ersetzen keine offiziell dokumentierte Prüfung oder Unterweisung.</p><p>Für Anmeldung, Freischaltungen und die Synchronisierung deines Lernstands benötigst du eine Internetverbindung.</p><div class="profile-footer"><a class="text-link" href="./datenschutz.html">Datenschutz</a><a class="text-link" href="./konto.html#einstellungen">Konto verwalten</a></div>`);}
// The same compact search works for every language in the shared registry.
document.addEventListener('input',event=>{
  if(event.target.id!=='language-search')return;
  const query=event.target.value.trim().toLocaleLowerCase();
  for(const option of document.querySelectorAll('#modal .language-option')){
    option.hidden=!option.textContent.toLocaleLowerCase().includes(query);
  }
});
document.addEventListener('click',async event=>{
  const nav=event.target.closest('a[href^="#"]');
  if(nav&&run&&nav.getAttribute('href')!=='#uebung') { event.preventDefault();pendingRoute=nav.getAttribute('href').slice(1);askExit();return; }
  const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
  const action=el.dataset.action;
  if(action==='close'||action==='close-modal')close();
  else if(action==='about')about();
  else if(action==='language')languagePicker();
  else if(action==='set-language'){
    const nextLanguage=el.dataset.language;
    if(nextLanguage===selectedLanguage){close();return;}
    close();toast(I18N.t(178));
    try{
      await I18N.load(nextLanguage);
      await ensureQuestionLocale(nextLanguage);
      selectedLanguage=nextLanguage;
      localStorage.setItem(LANGUAGE_STORE,selectedLanguage);
      render();toast(`${languageConfig().name} · ${tr('selected')}`);
    }catch(error){
      console.warn('Language pack could not be loaded',error);
      await I18N.load(selectedLanguage);
      render();toast(I18N.t(179));
    }
  }
  else if(action==='profile')profile();
  else if(action==='access')access();
  else if(action==='admin'){location.href='./verwaltung.html';}
  else if(action==='logout'){await B.client.auth.signOut({scope:'local'});location.replace('./konto.html');}
  else if(action==='topic')topicInfo(el.dataset.topic);
  else if(action==='start-learn')startRun('learn',el.dataset.topic,el.dataset.course);
  else if(action==='start-exam')startRun('exam',undefined,el.dataset.course);
  else if(action==='continue-run'){close();go('uebung');}
  else if(action==='replace-run'){run=null;startRun(el.dataset.mode,el.dataset.topic,el.dataset.course);}
  else if(action==='answer'&&run){const q=question(run.ids[run.index]);if(!run.checked.includes(q.id)){run.answers[q.id]=Number(el.dataset.index);const y=window.scrollY;render();window.scrollTo({top:y,behavior:'auto'});document.querySelector(`[data-action="answer"][data-index="${el.dataset.index}"]`)?.focus({preventScroll:true});}}
  else if(action==='check-answer'&&run){const q=question(run.ids[run.index]);if(run.answers[q.id]===undefined)return;run.checked.push(q.id);if(run.answers[q.id]===q.correct)rememberCorrect(q.id);save();const y=window.scrollY;render();window.scrollTo({top:y,behavior:'auto'});$('.feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
  else if(action==='previous'&&run){run.index=Math.max(0,run.index-1);render();}
  else if(action==='next'&&run){if(!active(student())){run=null;go('start');access();return;}if(run.index<run.ids.length-1){run.index++;render();window.scrollTo({top:0,behavior:'auto'});}else if(run.mode==='learn'){completeRun();}else{const missing=run.ids.filter(id=>run.answers[id]===undefined).length;modal('Bereit für deine Auswertung?',`<p>${missing?`${missing} Frage${missing===1?' ist':'n sind'} noch unbeantwortet. In dieser Übungsrunde ${missing===1?'zählt sie':'zählen sie'} als falsch.`:'Du hast alle Fragen beantwortet. Nach dem Abschluss siehst du deine Auswertung und alle Erklärungen.'}</p><button class="primary" data-action="finish">Runde abgeben ${icon('check')}</button><div class="modal-actions"><button class="text-link" data-action="close">Antworten noch einmal ansehen</button></div>`);}}
  else if(action==='finish')completeRun();
  else if(action==='exit-run'){pendingRoute='start';askExit();}
  else if(action==='confirm-exit'){run=null;close();go(pendingRoute||'start');pendingRoute=null;}
  else if(action==='mistake-training'){const r=data.results.find(r=>r.id===el.dataset.id&&r.student===student().id);startMistakeTraining(r);}
  else if(action==='review-result'){latestResult=data.results.find(r=>r.id===el.dataset.id);go('ergebnis');}
  else if(action==='install')install();
  else if(action==='install-tab')install(el.dataset.platform);
  else if(action==='native-install'&&deferredInstall){const prompt=deferredInstall;deferredInstall=null;prompt.prompt().then(()=>prompt.userChoice).then(choice=>{close();toast(choice.outcome==='accepted'?'Installation angefordert. Starte anschließend über das App-Symbol.':'Du kannst den Lernbereich weiterhin über den Link öffnen.');}).catch(()=>toast('Nutze zum Hinzufügen das Menü deines Browsers.'));}

});
function askExit() { modal('Die Runde wirklich verlassen?',`<p>Deine noch nicht abgeschlossene Runde wird beendet. Bereits richtig beantwortete Lernfragen bleiben in deinem Lernstand erhalten.</p><button class="primary" data-action="confirm-exit">Runde verlassen</button><div class="modal-actions"><button class="text-link" data-action="close">Doch weiterlernen</button></div>`); }
$('#modal').addEventListener('click',event=>{if(event.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;});
window.addEventListener('appinstalled',()=>{deferredInstall=null;close();render();toast('Die App wurde hinzugefügt.');});
if(!isNativeApp()&&'serviceWorker' in navigator&&/^https:/.test(location.protocol))navigator.serviceWorker.register('./sw.js').catch(()=>{});
route=location.hash.slice(1)||'start';if(route==='verlauf')route='ergebnisse';if(!Object.hasOwn(routeMap,route)||route==='uebung'||route==='ergebnis')route='start';
function practicePayload(input){
  const ids=QUESTIONS.map(q=>q.id),source=Array.isArray(input?.results)?input.results:[];
  const results=source.filter(r=>r&&typeof r.id==='string'&&r.id.length<=80&&['learn','exam'].includes(r.mode)&&Array.isArray(r.ids)&&Number.isInteger(r.score)&&Number.isInteger(r.total)&&r.score>=0&&r.total<=ids.length&&r.score<=r.total&&Number.isFinite(Date.parse(r.at))).map(r=>({id:r.id,student:B.me.id,mode:r.mode,course:COURSES.some(c=>c.id===r.course)?r.course:'gabelstapler',ids:r.ids.filter(id=>ids.includes(id)),answers:Object.fromEntries(Object.entries(r.answers||{}).filter(([id,a])=>ids.includes(id)&&Number.isInteger(a)&&a>=0&&a<3)),score:r.score,total:r.total,at:new Date(r.at).toISOString()}));
  return {results:results.slice(-100),mastered:Array.isArray(input?.mastered)?input.mastered.filter(id=>ids.includes(id)):[]};
}
let accessRequest=null;
async function checkAccess(){
  if(accessRequest)return accessRequest;
  const work=(async()=>{
    try{
      const me=await B.identity();
      if(!me){location.replace('./konto.html');return false;}
      if(!await B.termsAccepted()){location.replace('./konto.html#bedingungen');return false;}
      if(!active(me)){location.replace('./nachweise.html');return false;}
      data.students=[me];return true;
    }catch{
      // Temporary connectivity problems must not destroy an in-progress exercise.
      if(data.selected){
        toast('Verbindung unterbrochen. Deine laufende Runde bleibt erhalten – wir prüfen den Zugang erneut.');
        return false;
      }
      $('#main').innerHTML='<section class="empty-state"><h1>Keine Serververbindung.</h1><p>Bitte prüfe deine Internetverbindung und lade die Seite erneut.</p><a class="primary" href="./index.html">Erneut verbinden</a><a class="text-link" href="./konto.html">Zur Anmeldung</a></section>';
      document.documentElement.removeAttribute('data-loading');return false;
    }
  })();
  accessRequest=work;
  try{return await work;}finally{if(accessRequest===work)accessRequest=null;}
}
async function boot(){
  if(!await checkAccess())return;
  data.selected=B.me.id;
  try{
    const practice=practicePayload(await B.loadPractice());data.results=practice.results;data.mastered={[B.me.id]:practice.mastered};
    await I18N.load(selectedLanguage);
    await ensureQuestionLocale(selectedLanguage);
    render();document.documentElement.removeAttribute('data-loading');
  }catch{document.documentElement.removeAttribute('data-loading');$('#main').innerHTML='<section class="empty-state"><h1>Dein Lernbereich konnte nicht geladen werden.</h1><a class="primary" href="./index.html">Erneut versuchen</a></section>';}
}
boot();

function install(){
  if (!isNativeApp()) {
    location.assign('../#downloads');
    return;
  }
  modal('App bereits installiert', '<p>Du verwendest Abbate Lernraum bereits als eigenständige App. Du kannst ganz normal weiterlernen.</p><button class="primary" data-action="close">Weiterlernen</button>');
} 

B.client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')location.replace('./konto.html');});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){checkAccess();if(savedRevision<saveRevision)save();}});
setInterval(()=>{if(!document.hidden)checkAccess();},30000);
