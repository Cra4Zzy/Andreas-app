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
const passPreviewLabel=()=>({bg:'Преглед на удостоверенията',hr:'Pregled potvrda',cs:'Náhled osvědčení',da:'Forhåndsvisning af beviser',nl:'Voorbeeld opleidingsbewijzen',en:'Training records preview',et:'Koolitustõendite eelvaade',fi:'Koulutustodistusten esikatselu',fr:'Aperçu des attestations',de:'Schulungsnachweise ansehen',el:'Προεπισκόπηση βεβαιώσεων',hu:'Képzési igazolások előnézete',ga:'Réamhamharc ar thaifid oiliúna',it:'Anteprima attestati',lv:'Apmācību apliecinājumu priekšskatījums',lt:'Mokymų pažymėjimų peržiūra',mt:'Preview taċ-ċertifikati',pl:'Podgląd zaświadczeń',pt:'Pré-visualização de certificados',ro:'Previzualizare certificate',sk:'Náhľad osvedčení',sl:'Predogled potrdil',es:'Vista previa de certificados',sv:'Förhandsvisning av utbildningsintyg'}[selectedLanguage]||'Training records preview');
const uid = () => globalThis.crypto?.randomUUID?.() || 'demo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
const dateISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const offsetDate = days => { const d = new Date(); d.setDate(d.getDate()+days); return dateISO(d); };
const fmtDate = date => new Date(date+'T12:00:00').toLocaleDateString(languageConfig().locale,{day:'2-digit',month:'2-digit',year:'numeric'});
const endOfDay = date => new Date(date+'T23:59:59.999');
const active = person => globalThis.ABBATE_ACCOUNTS.access(person);
const daysLeft = date => Math.max(0,Math.ceil((endOfDay(date)-new Date())/86400000));
const initials = name => name.split(' ').filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase();
const isNativeApp = () => globalThis.Capacitor?.isNativePlatform?.() === true;
const isAppMode = () => isNativeApp() || window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
function installPlatform() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1)) return 'iphone';
  return /Macintosh|Mac OS X/i.test(ua) ? 'mac' : 'windows';
}
const QUESTIONS = [
  {id:'check',topic:'grundlagen',title:'Beim Fahrzeugcheck bemerkst du einen sicherheitsrelevanten Mangel. Was machst du?',context:'Du willst gerade mit deiner Arbeit beginnen. Eine Funktion arbeitet nicht zuverlässig.',answers:['Ich arbeite vorsichtig weiter und melde den Mangel später.','Ich benutze das Gerät nicht weiter und melde den Mangel der zuständigen Person.','Ich lasse eine andere Person damit weiterfahren.'],correct:1,why:'Sicherheitsrelevante Mängel müssen gemeldet werden. Ein Fahrzeug mit solchen Mängeln darf nicht weiter eingesetzt werden.'},
  {id:'auftrag',topic:'grundlagen',title:'Wer darf einen Gabelstapler mit Fahrersitz selbstständig führen?',context:'Es geht um den selbstständigen Einsatz im Betrieb.',answers:['Wer volljährig, geeignet und ausgebildet ist, seine Befähigung nachgewiesen hat und schriftlich beauftragt wurde.','Jede Person, die einen Pkw-Führerschein besitzt.','Jede Person, die schon einmal mitgefahren ist.'],correct:0,why:'Ein Pkw-Führerschein allein genügt nicht. Erforderlich sind Eignung, Ausbildung, Befähigungsnachweis und schriftliche Beauftragung.'},
  {id:'traglast',topic:'lasten',title:'Worauf kommt es vor dem Aufnehmen einer Last an?',context:'Du möchtest sicher sein, dass du die Last mit diesem Fahrzeug bewegen darfst.',answers:['Ich schätze das Gewicht und orientiere mich nur an der Fahrzeuggröße.','Ich nehme die Last kurz hoch und beobachte, was passiert.','Ich halte die zulässige Belastung des Fahrzeugs ein.'],correct:2,why:'Flurförderzeuge dürfen nicht überlastet werden. Entscheidend ist die zulässige Belastung.'},
  {id:'unter-last',topic:'lasten',title:'Eine Last ist angehoben. Was gilt für den Bereich darunter?',context:'Eine Person möchte direkt unter der angehobenen Last hindurchgehen.',answers:['Der Bereich darunter bleibt frei; dort darf sich niemand aufhalten.','Ein kurzer Aufenthalt ist in Ordnung, wenn die Last stillsteht.','Der Aufenthalt ist erlaubt, wenn die Person einen Helm trägt.'],correct:0,why:'Unter angehobenen Lasten darf sich niemand aufhalten. Auch ein Helm macht diesen Bereich nicht sicher.'},
  {id:'sicht',topic:'betrieb',title:'Die Last versperrt dir die Sicht auf den Fahrweg. Wie gehst du vor?',context:'Du musst den Fahrweg und mögliche Gefahren zuverlässig erkennen können.',answers:['Ich fahre besonders schnell durch den unübersichtlichen Bereich.','Ich sorge für ausreichende Sicht oder lasse mich nach betrieblicher Vorgabe einweisen.','Ich hupe und fahre ohne freie Sicht weiter.'],correct:1,why:'Du brauchst ausreichende Sicht oder eine sichere Einweisung. Hupen ersetzt beides nicht.'},
  {id:'verlassen',topic:'betrieb',title:'Du verlässt das Fahrzeug. Was ist dabei wichtig?',context:'Dein Arbeitsschritt ist beendet und du steigst aus.',answers:['Der nächste Fahrer wird das Fahrzeug schon sichern.','Es reicht, wenn das Fahrzeug gerade stillsteht.','Ich sichere es gegen unbeabsichtigtes Bewegen und unbefugtes Benutzen.'],correct:2,why:'Vor dem Verlassen muss das Fahrzeug gegen unbeabsichtigtes Bewegen und unbefugtes Benutzen gesichert werden.'}
];
const TOPICS = [
  {id:'grundlagen',name:'Fahrzeug & Verantwortung',description:'Gut vorbereitet starten: Was du vor dem Einsatz wissen und prüfen solltest.',short:'Dein sicherer Einstieg',icon:'shield',color:''},
  {id:'lasten',name:'Lasten & Grenzen',description:'Lasten richtig einschätzen und die Grenzen des Fahrzeugs beachten.',short:'Mit Überblick bewegen',icon:'file',color:'sand'},
  {id:'betrieb',name:'Sicher im Arbeitsalltag',description:'Sicht, Zusammenarbeit und ein sicher abgestelltes Fahrzeug.',short:'Auf dich und andere achten',icon:'users',color:'blue'}
];
let data={selected:null,students:[],results:[],mastered:{}};
let run=null, latestResult=null, search='', deferredInstall=null, toastTimer=null, pendingRoute=null;
const student = () => data.students.find(s=>s.id===data.selected)||{id:'guest',name:'Gast',email:'',until:offsetDate(-1),access:'pending'};
const question = id => QUESTIONS.find(q=>q.id===id);
const topic = id => TOPICS.find(t=>t.id===id);
const mastered = () => (data.mastered[student().id]||[]).filter(id=>question(id));
let saveTimer,saveQueue=Promise.resolve();
function save(){
  clearTimeout(saveTimer);saveTimer=setTimeout(()=>{
    const payload={results:data.results.slice(-100),mastered:mastered()};
    saveQueue=saveQueue.then(()=>B.savePractice(payload)).catch(()=>toast('Dein Lernstand konnte gerade nicht auf dem Server gespeichert werden. Bitte Internetverbindung prüfen.'));
  },150);
}
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
  $('#desktop-nav').innerHTML=nav.map(([id,,name])=>`<a href="#${id}" class="${current===id?'active':''}" ${current===id?'aria-current="page"':''}>${name}</a>`).join('');
  $('#mobile-nav').innerHTML=nav.map(([id,i,name])=>`<a href="#${id}" class="${current===id?'active':''}" ${current===id?'aria-current="page"':''}>${icon(i)}${name}</a>`).join('');
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
function topicRows() { return TOPICS.map(t=>`<button class="topic-row" data-action="topic" data-topic="${t.id}"><span class="topic-symbol ${t.color}">${icon(t.icon)}</span><span><strong class="topic-title">${t.name}</strong><small>${t.short}</small></span>${icon('arrow')}</button>`).join(''); }
function installStrip() { return isAppMode()?'':`<aside class="install-strip"><img src="./icon-192.png?v=9" alt="" width="47" height="47"><div><strong>Auch unterwegs lernen.</strong><p>Einmal hinzufügen und direkt über das App-Symbol starten.</p></div><button class="secondary" data-action="install">App hinzufügen ${icon('plus')}</button></aside>`; }
function home() {
  const name=esc(student().name.split(' ')[0]), learned=mastered().length, total=QUESTIONS.length, ok=active(student());
  return heading('Schön, dass du da bist',`Heute ein Stück sicherer, ${name}.`,'',accessLine())+languageStatus()+`
  <section class="home-hero"><div class="hero-text"><div class="course-label"><span></span>Gabelstapler · Dein Theorietraining</div><h2>${esc(I18N.t(20))}</h2><p>Verstehe die Antworten und handle im Arbeitsalltag sicher.</p><div class="hero-actions"><button class="primary" data-action="${ok?'start-learn':'access'}">${ok?(learned?'Weiterlernen':'Lernrunde starten'):'Zugang ansehen'} ${icon(ok?'arrow':'lock')}</button><a class="text-link" href="#pruefung">Prüfung vorbereiten ${icon('arrow')}</a></div><div class="hero-proof">${icon('clock')}In deinem Tempo. Ohne Zeitdruck.</div></div><div class="hero-photo"><img src="./assets/stapler-schulung.webp" alt="Gelbes Flurförderzeug und Gabelstapler auf dem Schulungsgelände" width="1920" height="1080"><div class="photo-caption">${icon('shield')}<div><strong>Für deinen echten Arbeitsalltag.</strong><small>Aus der Praxis. Schritt für Schritt.</small></div></div></div></section>
  <section class="learning-route" aria-label="Dein Lernweg"><a class="route-step" href="#lernen"><span class="route-number">01</span><span><strong>Verstehen</strong><small>Themen in Ruhe durchgehen</small></span>${icon('arrow')}</a><button class="route-step" data-action="start-learn"><span class="route-number">02</span><span><strong>Wissen festigen</strong><small>Mit direkter Rückmeldung üben</small></span>${icon('arrow')}</button><a class="route-step" href="#pruefung"><span class="route-number">03</span><span><strong>Bereit werden</strong><small>Den Prüfungsablauf kennenlernen</small></span>${icon('arrow')}</a></section>
  <div class="home-lower"><section><div class="section-topline"><h2>Dein Kurs. In kleinen Schritten.</h2><a class="text-link" href="#lernen">Alle Themen ${icon('arrow')}</a></div><div class="topic-list">${topicRows()}</div></section><aside class="progress-note"><div class="note-label">${icon('chart')}Dein persönlicher Lernweg</div><h3>${learned?'Das wächst mit jeder Runde.':'Du musst nicht alles auf einmal können.'}</h3><p>${learned?`Du hast bereits ${learned} von ${total} Fragen richtig beantwortet.`:'Starte mit einer kurzen Runde. Zu jeder Antwort erhältst du eine Erklärung.'}</p><div class="progress-meter" role="progressbar" aria-label="Richtig beantwortete Beispielfragen" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${learned}"><span style="width:${learned/total*100}%"></span></div><div class="progress-count">${learned} von ${total} Fragen richtig beantwortet</div><a class="text-link" href="#ergebnisse">Deine bisherigen Runden ${icon('arrow')}</a></aside></div>${installStrip()}`;
}
function learning() { return heading('Dein Kurs. In kleinen Schritten.','Verstehen kommt vor Auswendiglernen.','Wähle ein Thema und lerne mit kurzen Fragen und verständlichen Erklärungen.',accessLine())+`<div class="lesson-grid">${TOPICS.map(t=>`<section class="lesson-card"><span class="topic-symbol ${t.color}">${icon(t.icon)}</span><h2>${t.name}</h2><p>${t.description}</p><div class="lesson-meta">${QUESTIONS.filter(q=>q.topic===t.id).length} Beispielfragen · mit Erklärungen</div><button class="secondary" data-action="topic" data-topic="${t.id}">Thema ansehen ${icon('arrow')}</button></section>`).join('')}</div><section class="learning-tip"><img src="./assets/theorie-schulung.webp" alt="Teilnehmer bei einer gemeinsamen Theorie-Schulung" loading="lazy" width="1100" height="825"><div><h3>Du lernst für sicheres Handeln.</h3><p>Nimm dir Zeit, Situationen wirklich zu verstehen.</p><button class="text-link" data-action="start-learn">Alle Themen üben ${icon('arrow')}</button></div></section>`; }
function examStart() { return heading('Deine Prüfungsvorbereitung','Schon ein gutes Gefühl? Probier es aus.','Wähle die Runde, die zu dir passt.',accessLine())+`<div class="mode-grid"><section class="mode-card"><span class="mode-icon">${icon('book')}</span><h2>Mit Rückmeldung üben</h2><p>Du erhältst nach jeder Frage sofort eine Erklärung.</p><div class="mode-features"><span>${icon('check')}Erklärung direkt nach jeder Frage</span><span>${icon('check')}In Ruhe nachdenken und dazulernen</span><span>${icon('check')}${QUESTIONS.length} Beispielfragen aus allen Themen</span></div><button class="secondary" data-action="start-learn">Lernrunde starten ${icon('arrow')}</button></section><section class="mode-card focus"><span class="mode-icon">${icon('file')}</span><h2>Den Ablauf kennenlernen</h2><p>Beantworte zuerst die ganze Runde. Die Auswertung folgt am Schluss.</p><div class="mode-features"><span>${icon('check')}Antworten vor der Abgabe ändern</span><span>${icon('check')}Auswertung nach dem Abschluss</span><span>${icon('check')}${QUESTIONS.length} Beispielfragen · ohne Zeitlimit</span></div><button class="primary gold" data-action="start-exam">Prüfungstraining starten ${icon('arrow')}</button></section></div><div class="notice">${icon('help')}<span>Diese Vorschau nutzt redaktionelle Beispielfragen und ist kein amtlicher Fragenkatalog.</span></div>`; }
function startRun(mode,topicId) {
  if(!active(student())) { access(); return; }
  if(run) { modal('Eine Runde läuft noch',`<p>Du kannst deine laufende Runde fortsetzen oder sie beenden und neu anfangen.</p><div class="modal-actions"><button class="primary" data-action="continue-run">Weiterlernen ${icon('arrow')}</button><button class="text-link" data-action="replace-run" data-mode="${mode}" data-topic="${topicId||''}">Neu beginnen</button></div>`); return; }
  run={mode,ids:QUESTIONS.filter(q=>!topicId||q.topic===topicId).map(q=>q.id),index:0,answers:{},checked:[],at:new Date().toISOString()};
  close(); go('uebung');
}
function quizView() {
  if(!run)return examStart();
  const q=question(run.ids[run.index]), t=topic(q.topic), chosen=run.answers[q.id], checked=run.checked.includes(q.id), correct=chosen===q.correct;
  return `<div class="quiz-shell"><div class="quiz-top"><span class="quiz-mode">${icon(run.mode==='learn'?'book':'file')}${run.mode==='learn'?'Deine Lernrunde':'Dein Prüfungstraining'}</span><button class="text-link" data-action="exit-run">Runde beenden ${icon('close')}</button></div><div class="quiz-progress" style="grid-template-columns:repeat(${run.ids.length},1fr)" aria-label="Frage ${run.index+1} von ${run.ids.length}">${run.ids.map((_,i)=>`<span class="${i<run.index?'done':i===run.index?'current':''}"></span>`).join('')}</div><section class="question-card"><div class="question-meta"><span>${t.name}</span><span>${run.index+1} / ${run.ids.length}</span></div><h1>${q.title}</h1><p class="question-context">${q.context}</p><div class="answers" role="group" aria-label="Antwortmöglichkeiten">${q.answers.map((answer,i)=>`<button class="answer ${chosen===i?'selected':''} ${checked&&i===q.correct?'correct':''} ${checked&&i===chosen&&!correct?'incorrect':''}" data-action="answer" data-index="${i}" aria-pressed="${chosen===i}" ${checked?'disabled':''}><span class="answer-letter">${String.fromCharCode(65+i)}</span><span>${answer}</span>${checked&&i===q.correct?icon('check'):''}</button>`).join('')}</div>${checked?`<div class="feedback ${correct?'':'again'}">${icon(correct?'check':'help')}<div><h3>${correct?'Richtig. Gut eingeordnet.':'Gut, dass du es hier ausprobierst.'}</h3><p>${q.why}</p></div></div>`:''}<div class="quiz-bottom"><button class="secondary" data-action="previous" ${run.index===0?'disabled':''}>Zurück</button>${run.mode==='learn'&&!checked?`<button class="primary" data-action="check-answer" ${chosen===undefined?'disabled':''}>Antwort prüfen ${icon('check')}</button>`:`<button class="primary" data-action="next">${run.index===run.ids.length-1?'Runde abschließen':'Nächste Frage'} ${icon('arrow')}</button>`}</div></section><p class="question-note">${run.mode==='learn'?'Eine passende Antwort pro Frage. Nimm dir Zeit für die Erklärung.':'Unbeantwortete Fragen zählen in dieser Übungsrunde als falsch.'}</p></div>`;
}
function rememberCorrect(id) { const list=data.mastered[student().id]||[]; if(!list.includes(id))list.push(id); data.mastered[student().id]=list; }
async function completeRun() {
  if(!await checkAccess())return;
  if(!run)return;
  if(!active(student())) { run=null;close();go('start');access();return; }
  const result={id:uid(),student:student().id,mode:run.mode,ids:[...run.ids],answers:{...run.answers},score:run.ids.filter(id=>run.answers[id]===question(id).correct).length,total:run.ids.length,at:new Date().toISOString()};
  run.ids.forEach(id=>{if(run.answers[id]===question(id).correct)rememberCorrect(id);});
  data.results.push(result);latestResult=result;run=null;save();close();go('ergebnis');
}
function reviewCards(result) { return (result.ids||[]).map(id=>{const q=question(id);if(!q)return '';const choice=result.answers[id],correct=choice===q.correct;return `<article class="review-card ${correct?'':'wrong'}"><header>${icon(correct?'check':'help')}<h3>${q.title}</h3></header><p>${q.why}</p><p class="your-answer">Deine Antwort: ${choice===undefined?'Nicht beantwortet':esc(q.answers[choice])}</p></article>`;}).join(''); }
function resultView() {
  if(!latestResult)return results(); const r=latestResult;
  return heading('Gut, dass du drangeblieben bist.','Eine Runde weiter.','Schau dir an, was schon sitzt und was du noch festigen kannst.')+`<div class="result-layout"><section class="result-main"><span class="overline">${r.mode==='learn'?'Deine Lernrunde':'Dein Prüfungstraining'}</span><div class="result-mark">${r.score}<span> / ${r.total}</span></div><h2>${r.score===r.total?'Das war eine sichere Runde.':'Mit jeder Erklärung wächst dein Wissen.'}</h2><p>${r.score===r.total?'Alle Antworten richtig. Wiederhole die Themen später noch einmal.':'Lies die Erklärungen und übe die schwierigen Themen gezielt.'}</p><div class="result-actions"><button class="primary" data-action="start-learn">Weiter üben ${icon('arrow')}</button><a class="secondary" href="#start">Zum Start</a></div><p class="form-caption">Dieses Ergebnis ist kein Prüfungsnachweis.</p></section><section class="review-list" aria-label="Erklärungen zu deinen Antworten">${reviewCards(r)}</section></div>`;
}
function results() {
  const list=data.results.filter(r=>r.student===student().id).slice().reverse();
  return heading('Dein bisheriger Weg','Du siehst, was du geschafft hast.','Hier findest du deine bisherigen Runden und Ergebnisse.',accessLine())+(list.length?`<div class="history-list">${list.map(r=>`<article class="history-row"><div><h3>${r.mode==='legacy'?'Frühere Bedienungsdemo':r.mode==='learn'?'Lernrunde':'Prüfungstraining'}</h3><p>${new Date(r.at).toLocaleString(languageConfig().locale,{dateStyle:'medium',timeStyle:'short'})} · ${r.total||3} Fragen</p></div><div class="history-score">${r.score} / ${r.total||3}${r.mode!=='legacy'?`<button class="text-link" data-action="review-result" data-id="${esc(r.id)}">Ansehen ${icon('arrow')}</button>`:'<small>Vorschau</small>'}</div></article>`).join('')}</div>`:`<section class="empty-state"><span class="topic-symbol">${icon('chart')}</span><h2>Deine erste Runde wartet auf dich.</h2><p>Starte mit ein paar Fragen. Dein Ergebnis erscheint anschließend hier.</p><button class="primary" data-action="start-learn">Lernrunde starten ${icon('arrow')}</button></section>`);
}
function admin(){if(B.isStaff(B.me)){location.href='./verwaltung.html';return '';}return heading('Verwaltung','Kein Verwaltungszugang.','Dieser Bereich ist nur für berechtigte Mitarbeiter zugänglich.');}
function render() { navigation();const content=route==='start'?home():route==='lernen'?learning():route==='pruefung'?examStart():route==='ergebnisse'?results():route==='verwaltung'?admin():route==='uebung'?quizView():resultView();$('#main').innerHTML=`<div class="page-enter">${content}</div>`;I18N.localize(document.body);navigation(); }
function go(next) { if(location.hash==='#'+next){route=next;render();window.scrollTo({top:0,behavior:'auto'});}else location.hash=next; }
window.addEventListener('hashchange',()=>{let next=location.hash.slice(1);if(next==='verlauf')next='ergebnisse';if(!Object.hasOwn(routeMap,next))next='start';if(next==='uebung'&&!run)next='pruefung';if(next==='ergebnis'&&!latestResult)next='ergebnisse';route=next;render();window.scrollTo({top:0,behavior:'auto'});$('#main').focus({preventScroll:true});});
function profile(){
  const s=student();
  modal('Dein Profil & Zugang',`<div class="profile-summary"><span class="profile-avatar">${esc(initials(s.name))}</span><div><strong>${esc(s.name)}</strong><p>${esc(s.email)}</p></div></div><p>Dein Zugang ist aktiv${s.until?' bis einschließlich '+fmtDate(s.until):'.'}.</p><div class="profile-actions"><button class="secondary" data-action="language">🌐 ${esc(languageConfig().name)}</button><a class="secondary" href="./nachweise.html">${esc(passPreviewLabel())} · DE</a><a class="secondary" href="./konto.html#einstellungen">Konto & Datenschutz</a></div><div class="profile-footer">${B.isStaff(B.me)?'<a class="text-link" href="./verwaltung.html">Zur Verwaltung ↗</a>':''}<button class="text-link" data-action="logout">Abmelden</button></div>`);
}
function languagePicker() {
  modal(esc(tr('title')),`<p>${esc(tr('intro'))}</p><div class="language-grid">${I18N.languages.map(language=>`<button class="language-option ${language.code===selectedLanguage?'active':''}" data-action="set-language" data-language="${language.code}" aria-pressed="${language.code===selectedLanguage}"><span class="language-abbr">${language.code.toUpperCase()}</span><span>${esc(language.name)}</span>${language.code===selectedLanguage?`<small>${esc(tr('selected'))}</small>`:''}</button>`).join('')}</div><div class="language-review-note">${icon('shield')}<span>${esc(I18N.t(8))}</span></div>`);
}
function access() { const s=student();modal('Dein Lernzugang',`<div class="notice ${active(s)?'':'warning'}">${icon(active(s)?'check':'lock')}<span>${active(s)?'Dein Zugang ist aktiv':s.access==='pending'?'Dein Konto wartet auf Freischaltung':s.access==='paused'?'Dein Zugang ist pausiert':'Dein Zugang ist abgelaufen'}. Gültig bis einschließlich <strong>${fmtDate(s.until)}</strong>.</span></div><p>${active(s)?'Du kannst alle freigeschalteten Themen und Übungsrunden nutzen.':'Melde dich bei deiner Fahrschule, wenn du weiterlernen möchtest.'}</p><button class="primary" data-action="close">Verstanden ${icon('check')}</button>`); }
function topicInfo(id) { const t=topic(id);if(!t)return;modal(t.name,`<p>${t.description}</p><p>In dieser Lernrunde beantwortest du ${QUESTIONS.filter(q=>q.topic===id).length} Beispielfragen. Nach jeder Frage erfährst du, worauf es ankommt.</p><button class="primary" data-action="start-learn" data-topic="${id}">Mit diesem Thema starten ${icon('arrow')}</button><p class="form-caption">Die Fragen dienen zur Vorschau. Der verbindliche Katalog deiner Fahrschule folgt vor dem echten Einsatz.</p>`); }
function about(){modal('Abbate Lernraum · Pilotbetrieb',`<p>Deine Anmeldung, Zugangsfreigabe und Schulungsnachweise werden auf dem Server verwaltet. Nur die Fahrschule kann tatsächliche Schulungen und Prüfungen bestätigen.</p><div class="notice">${icon('help')}<span>Das Theorietraining enthält derzeit sechs redaktionelle Beispielfragen. Verbindliche Inhalte und Fachübersetzungen müssen vor dem öffentlichen Start von der Fahrschule freigegeben werden.</span></div><p>Übungsrunden sind keine Prüfungsnachweise. Für den Zugriff und die Speicherung deines Lernstands ist eine Internetverbindung erforderlich.</p><div class="profile-footer"><a class="text-link" href="./datenschutz.html">Datenschutz</a><a class="text-link" href="./konto.html#einstellungen">Konto verwalten</a></div>`);}
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
  else if(action==='logout'){await B.client.auth.signOut();location.replace('./konto.html');}
  else if(action==='topic')topicInfo(el.dataset.topic);
  else if(action==='start-learn')startRun('learn',el.dataset.topic);
  else if(action==='start-exam')startRun('exam');
  else if(action==='continue-run'){close();go('uebung');}
  else if(action==='replace-run'){run=null;startRun(el.dataset.mode,el.dataset.topic);}
  else if(action==='answer'&&run){const q=question(run.ids[run.index]);if(!run.checked.includes(q.id)){run.answers[q.id]=Number(el.dataset.index);const y=window.scrollY;render();window.scrollTo({top:y,behavior:'auto'});document.querySelector(`[data-action="answer"][data-index="${el.dataset.index}"]`)?.focus({preventScroll:true});}}
  else if(action==='check-answer'&&run){const q=question(run.ids[run.index]);if(run.answers[q.id]===undefined)return;run.checked.push(q.id);if(run.answers[q.id]===q.correct)rememberCorrect(q.id);save();const y=window.scrollY;render();window.scrollTo({top:y,behavior:'auto'});$('.feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
  else if(action==='previous'&&run){run.index=Math.max(0,run.index-1);render();}
  else if(action==='next'&&run){if(!active(student())){run=null;go('start');access();return;}if(run.index<run.ids.length-1){run.index++;render();window.scrollTo({top:0,behavior:'auto'});}else if(run.mode==='learn'){completeRun();}else{const missing=run.ids.filter(id=>run.answers[id]===undefined).length;modal('Bereit für deine Auswertung?',`<p>${missing?`${missing} Frage${missing===1?' ist':'n sind'} noch unbeantwortet. In dieser Übungsrunde ${missing===1?'zählt sie':'zählen sie'} als falsch.`:'Du hast alle Fragen beantwortet. Nach dem Abschluss siehst du deine Auswertung und alle Erklärungen.'}</p><button class="primary" data-action="finish">Runde abgeben ${icon('check')}</button><div class="modal-actions"><button class="text-link" data-action="close">Antworten noch einmal ansehen</button></div>`);}}
  else if(action==='finish')completeRun();
  else if(action==='exit-run'){pendingRoute='start';askExit();}
  else if(action==='confirm-exit'){run=null;close();go(pendingRoute||'start');pendingRoute=null;}
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
  const results=source.filter(r=>r&&typeof r.id==='string'&&r.id.length<=80&&['learn','exam'].includes(r.mode)&&Array.isArray(r.ids)&&Number.isInteger(r.score)&&Number.isInteger(r.total)&&r.score>=0&&r.total<=ids.length&&r.score<=r.total&&Number.isFinite(Date.parse(r.at))).map(r=>({id:r.id,student:B.me.id,mode:r.mode,ids:r.ids.filter(id=>ids.includes(id)),answers:Object.fromEntries(Object.entries(r.answers||{}).filter(([id,a])=>ids.includes(id)&&Number.isInteger(a)&&a>=0&&a<3)),score:r.score,total:r.total,at:new Date(r.at).toISOString()}));
  return {results:results.slice(-100),mastered:Array.isArray(input?.mastered)?input.mastered.filter(id=>ids.includes(id)):[]};
}
async function checkAccess(){
  try{const me=await B.identity();if(!me){location.replace('./konto.html');return false;}if(!active(me)){location.replace('./nachweise.html');return false;}data.students=[me];return true;}
  catch{document.documentElement.dataset.loading='';$('#main').innerHTML='<section class="empty-state"><h1>Keine Serververbindung.</h1><p>Bitte prüfe deine Internetverbindung und lade die Seite erneut.</p><a class="primary" href="./index.html">Erneut verbinden</a><a class="text-link" href="./konto.html">Zur Anmeldung</a></section>';document.documentElement.removeAttribute('data-loading');run=null;return false;}
}
async function boot(){
  if(!await checkAccess())return;
  data.selected=B.me.id;
  try{
    const practice=practicePayload(await B.loadPractice());data.results=practice.results;data.mastered={[B.me.id]:practice.mastered};
    await I18N.load(selectedLanguage);render();document.documentElement.removeAttribute('data-loading');
  }catch{document.documentElement.removeAttribute('data-loading');$('#main').innerHTML='<section class="empty-state"><h1>Dein Lernbereich konnte nicht geladen werden.</h1><a class="primary" href="./index.html">Erneut versuchen</a></section>';}
}
boot();

function install(platform=installPlatform()){
if(isAppMode()){modal('Du nutzt bereits die App-Ansicht.',`<div class="install-app-identity"><img src="./icon-192.png?v=9" alt="Abbate App-Symbol"><div><strong>Andreas Abbate</strong><span>Lern- & Prüfungsapp</span></div><span class="app-mode-check">${icon('check')}</span></div><p>Der Lernbereich ist bereits in einem eigenen App-Fenster geöffnet.</p><button class="primary" data-action="close">Weiterlernen ${icon('arrow')}</button>`);return;}
const platforms=[['windows','Windows'],['mac','Mac'],['iphone','iPhone'],['android','Android']];
modal('Dein Lernbereich als App',`<div class="install-app-identity"><img src="./icon-192.png?v=9" alt="Abbate App-Symbol"><div><strong>Andreas Abbate</strong><span>Lern- & Prüfungsapp</span></div></div><div class="install-benefits"><span>${icon('check')} Eigenes App-Symbol</span><span>${icon('check')} Eigene App-Ansicht</span></div><p>Wähle dein Gerät und füge den Lernbereich als App hinzu.</p><div class="modal-tabs platform-tabs" aria-label="Installationsanleitung nach Gerät">${platforms.map(([key,label])=>`<button class="${key===platform?'active':''}" data-action="install-tab" data-platform="${key}" aria-pressed="${key===platform}">${label}</button>`).join('')}</div><div class="install-steps"><div class="install-step"><span>1</span><div><strong>Link im Browser öffnen</strong><p>Öffne den Lernbereich in Safari, Chrome oder Edge.</p></div></div><div class="install-step"><span>2</span><div><strong>App hinzufügen</strong><p>Nutze „Zum Home-Bildschirm“, „Zum Dock hinzufügen“ oder „App installieren“.</p></div></div><div class="install-step"><span>3</span><div><strong>Über das Symbol starten</strong><p>Öffne die App anschließend direkt über das neue Symbol.</p></div></div></div>${platform!=='iphone'&&platform===installPlatform()&&deferredInstall?'<button class="primary" data-action="native-install">Auf diesem Gerät installieren '+icon('plus')+'</button>':''}<div class="install-preview-note">${icon('lock')}<span>Frei zugängliche Vorführversion mit Beispieldaten.</span></div>`);
} 

B.client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')location.replace('./konto.html');});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkAccess();});
setInterval(()=>{if(!document.hidden)checkAccess();},30000);
