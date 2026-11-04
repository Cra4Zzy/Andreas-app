'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value??'').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const API = globalThis.ABBATE_BACKEND;
  const preferred=(localStorage.getItem('abbate-language-v1')||'de').split('-')[0];
  const state={questions:[],lang:preferred==='ro'?'ro':'de',search:''};
  const note=$('theory-language-note');
  $('theory-lang').value=state.lang;
  function render(){
    const visible=state.questions.filter(q=>{
      const t=q.translations?.[state.lang]||q.translations?.de;
      return !state.search||String(q.question_no).includes(state.search)||[t?.title,...(t?.answers||[])].some(v=>String(v||'').toLocaleLowerCase().includes(state.search));
    });
    $('theory-count').textContent=visible.length+' von '+state.questions.length+' Fragen';
    $('theory-list').innerHTML=visible.map(q=>{
      const t=q.translations?.[state.lang]||q.translations?.de;
      const answers=Array.isArray(t?.answers)?t.answers:[];
      return '<article class="theory-question">'+
        '<div class="theory-question-top"><span class="theory-id">Frage '+String(q.question_no).padStart(2,'0')+'</span><span>Original · Seite '+q.source_page+'</span>'+(q.requires_diagram?'<span class="theory-diagram">Diagramm / Abbildung erforderlich</span>':'')+'</div>'+
        '<h2>'+escapeHtml(t?.title||'Fragetext fehlt')+'</h2>'+
        (answers.length?'<ol class="theory-options" type="A">'+answers.map(value=>'<li>'+escapeHtml(value)+'</li>').join('')+'</ol>':'<p class="theory-numeric">Freitext- oder Diagrammaufgabe · Lösung und ggf. Abbildung noch zu ergänzen.</p>')+
        '<p class="theory-foot">Bearbeitungsstand: Entwurf · Lösung nicht verifiziert · keine Bewertung</p>'+
        '</article>';
    }).join('')||'<p class="theory-empty">Keine passenden Fragen gefunden.</p>';
  }
  $('theory-lang').addEventListener('change',event=>{state.lang=event.target.value;render();});
  $('theory-search').addEventListener('input',event=>{state.search=event.target.value.trim().toLocaleLowerCase();render();});
  async function boot(){
    try{
      const me=await API.identity();
      if(!me){location.replace('./konto.html');return;}
      if(!API.isStaff(me)){
        $('theory-state').textContent='Dieser Entwurf ist ausschließlich für freigeschaltete Trainer und Administratoren zugänglich.';
        return;
      }
      const {data,error}=await API.client.from('abbate_theory_questions')
        .select('question_no,source_page,question_type,requires_diagram,review_status,translations')
        .eq('school_id',me.school).eq('document_key','theorie-ro-2019')
        .order('question_no',{ascending:true});
      if(error)throw error;
      state.questions=(data||[]).filter(q=>q.review_status==='draft'||q.review_status==='approved');
      if(preferred!=='ro'&&preferred!=='de'){
        note.textContent='Die App-Sprache ist '+preferred.toUpperCase()+'. Für diesen neuen Katalog liegen derzeit nur Deutsch und Rumänisch vor. Die übrigen Sprachfassungen sind noch nicht übersetzt und werden nicht als fertig ausgegeben.';
        note.hidden=false;
      }else note.hidden=true;
      $('theory-state').hidden=true;
      $('theory-content').hidden=false;
      render();
    }catch(error){
      console.error('Could not retrieve theory catalog',error?.code||'network');
      $('theory-state').textContent='Der Fragenkatalog konnte nicht geladen werden. Bitte Verbindung oder Berechtigung prüfen.';
    }
  }
  boot();
  API.client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT')location.replace('./konto.html');});
})();