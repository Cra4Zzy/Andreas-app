'use strict';
(() => {
  // Localize visible auth/portal text only. Never alter form values, passwords,
  // Supabase payloads, account IDs or the German legal document contents.
  const STORAGE='abbate-language-v1';
  const words={"Dein persönlicher Zugang":{"uk":"Ваш особистий доступ","ru":"Ваш личный доступ","cs":"Váš osobní přístup"},"Zur Lern-App ↗":{"uk":"До навчального застосунку ↗","ru":"К учебному приложению ↗","cs":"Do výukové aplikace ↗"},"Ein QR-Code. Dein persönlicher Bereich.":{"uk":"Один QR-код. Ваш особистий розділ.","ru":"Один QR-код. Ваш личный раздел.","cs":"Jeden QR kód. Váš osobní prostor."},"Deine Schulungen.":{"uk":"Ваші навчання.","ru":"Ваши курсы.","cs":"Vaše školení."},"Dein Überblick.":{"uk":"Ваш огляд.","ru":"Всё под контролем.","cs":"Váš přehled."},"Melde dich an und sieh deine persönlichen Schulungen und Prüfungsergebnisse. Deine Fahrschule pflegt die Einträge für dich.":{"uk":"Увійдіть, щоб переглянути свої навчання та результати іспитів. Ваш навчальний центр веде ці записи.","ru":"Войдите, чтобы посмотреть свои учебные курсы и результаты экзаменов. Записи ведёт учебный центр.","cs":"Přihlaste se a prohlédněte si svá školení a výsledky zkoušek. Záznamy spravuje vaše školicí středisko."},"01 / Bereits registriert":{"uk":"01 / Уже зареєстровані","ru":"01 / Уже зарегистрированы","cs":"01 / Již registrováni"},"Deinen Bereich öffnen":{"uk":"Відкрити особистий розділ","ru":"Открыть личный раздел","cs":"Otevřít svůj účet"},"E-Mail-Adresse":{"uk":"Електронна пошта","ru":"Электронная почта","cs":"E-mailová adresa"},"Passwort":{"uk":"Пароль","ru":"Пароль","cs":"Heslo"},"Sicher anmelden ↗":{"uk":"Безпечно увійти ↗","ru":"Безопасно войти ↗","cs":"Bezpečně se přihlásit ↗"},"Passwort vergessen?":{"uk":"Забули пароль?","ru":"Забыли пароль?","cs":"Zapomněli jste heslo?"},"02 / Neu bei Abbate":{"uk":"02 / Уперше в Abbate","ru":"02 / Впервые в Abbate","cs":"02 / Nově u Abbate"},"Dein Konto anlegen":{"uk":"Створити обліковий запис","ru":"Создать учётную запись","cs":"Vytvořit účet"},"Die Registrierung ist kostenlos. Der Zugang zu den Lerninhalten wird durch die Fahrschule freigeschaltet. Es gibt kein automatisches Abo.":{"uk":"Реєстрація безкоштовна. Доступ до матеріалів активує навчальний центр. Автоматичної підписки немає.","ru":"Регистрация бесплатна. Доступ к учебным материалам активирует учебный центр. Автоматической подписки нет.","cs":"Registrace je zdarma. Přístup k výukovým materiálům aktivuje školicí středisko. Nejde o automatické předplatné."},"Vor- und Nachname":{"uk":"Ім’я та прізвище","ru":"Имя и фамилия","cs":"Jméno a příjmení"},"Mindestens 12 Zeichen. Verwende ein eigenes, sicheres Passwort.":{"uk":"Щонайменше 12 символів. Використовуйте власний надійний пароль.","ru":"Не менее 12 символов. Используйте собственный надёжный пароль.","cs":"Alespoň 12 znaků. Použijte vlastní silné heslo."},"Ich akzeptiere die":{"uk":"Я приймаю","ru":"Я принимаю","cs":"Souhlasím s"},"AGB und Nutzungsbedingungen":{"uk":"Правилами та умовами використання","ru":"Условиями использования","cs":"obchodními a uživatelskými podmínkami"},"(Fassung 02.11.2026).":{"uk":"(редакція від 02.11.2026).","ru":"(редакция от 02.11.2026).","cs":"(verze 02.11.2026)."},"Unsere":{"uk":"Нашу","ru":"Нашу","cs":"Naše"},"Datenschutzerklärung":{"uk":"Політику конфіденційності","ru":"Политику конфиденциальности","cs":"Zásady ochrany osobních údajů"},"und Informationen zu":{"uk":"та інформацію про","ru":"и информацию о","cs":"a informace o"},"Widerruf und Verbraucherrechten":{"uk":"право на відмову та права споживачів","ru":"право на отказ и права потребителей","cs":"odstoupení od smlouvy a právech spotřebitele"},"kannst du jederzeit einsehen. Die Registrierung ist kostenlos und keine Bestellung.":{"uk":"можна переглянути будь-коли. Реєстрація безкоштовна й не є замовленням.","ru":"можно посмотреть в любое время. Регистрация бесплатна и не является заказом.","cs":"si můžete kdykoliv přečíst. Registrace je zdarma a nepředstavuje objednávku."},"Konto registrieren":{"uk":"Зареєструвати обліковий запис","ru":"Зарегистрировать учётную запись","cs":"Zaregistrovat účet"},"Dein Zugang":{"uk":"Ваш доступ","ru":"Ваш доступ","cs":"Váš přístup"},"Passwort zurücksetzen.":{"uk":"Скидання пароля.","ru":"Сброс пароля.","cs":"Obnovení hesla."},"Wir senden dir einen Link, mit dem du ein neues Passwort festlegen kannst.":{"uk":"Ми надішлемо посилання, за яким можна встановити новий пароль.","ru":"Мы отправим ссылку для установки нового пароля.","cs":"Pošleme vám odkaz pro nastavení nového hesla."},"Link anfordern":{"uk":"Отримати посилання","ru":"Получить ссылку","cs":"Vyžádat odkaz"},"Zur Anmeldung":{"uk":"До входу","ru":"К входу","cs":"K přihlášení"},"Dein neues Passwort.":{"uk":"Ваш новий пароль.","ru":"Ваш новый пароль.","cs":"Vaše nové heslo."},"Neues Passwort":{"uk":"Новий пароль","ru":"Новый пароль","cs":"Nové heslo"},"Passwort speichern":{"uk":"Зберегти пароль","ru":"Сохранить пароль","cs":"Uložit heslo"},"Aktuelle Nutzungsbedingungen.":{"uk":"Актуальні умови використання.","ru":"Актуальные условия использования.","cs":"Aktuální podmínky používání."},"Ich akzeptiere die AGB vom 02.11.2026.":{"uk":"Я приймаю умови використання від 02.11.2026.","ru":"Я принимаю условия использования от 02.11.2026.","cs":"Souhlasím s podmínkami z 02.11.2026."},"Weiter zum Lernraum":{"uk":"Перейти до навчання","ru":"Перейти к обучению","cs":"Pokračovat do výuky"},"Abmelden":{"uk":"Вийти","ru":"Выйти","cs":"Odhlásit se"},"Mein Konto":{"uk":"Мій обліковий запис","ru":"Моя учётная запись","cs":"Můj účet"},"Meine Schulungen":{"uk":"Мої навчання","ru":"Мои курсы","cs":"Moje školení"},"Zum Lernen":{"uk":"До навчання","ru":"К обучению","cs":"K výuce"},"Verwaltung öffnen":{"uk":"Відкрити керування","ru":"Открыть управление","cs":"Otevřít správu"},"Passwort ändern":{"uk":"Змінити пароль","ru":"Изменить пароль","cs":"Změnit heslo"},"Aktuelles Passwort":{"uk":"Поточний пароль","ru":"Текущий пароль","cs":"Současné heslo"},"Neues Passwort speichern":{"uk":"Зберегти новий пароль","ru":"Сохранить новый пароль","cs":"Uložit nové heslo"},"Konto und persönliche Daten löschen":{"uk":"Видалити обліковий запис і персональні дані","ru":"Удалить учётную запись и персональные данные","cs":"Smazat účet a osobní údaje"},"Dein Passwort zur Bestätigung":{"uk":"Ваш пароль для підтвердження","ru":"Ваш пароль для подтверждения","cs":"Heslo pro potvrzení"},"Ich möchte mein Konto und alle zugehörigen Einträge endgültig löschen.":{"uk":"Я хочу назавжди видалити свій обліковий запис і всі пов’язані записи.","ru":"Я хочу окончательно удалить учётную запись и все связанные записи.","cs":"Chci trvale smazat svůj účet a všechny související záznamy."},"Mein Konto endgültig löschen":{"uk":"Назавжди видалити обліковий запис","ru":"Удалить учётную запись навсегда","cs":"Trvale smazat můj účet"},"Bitte zuerst anmelden.":{"uk":"Спочатку увійдіть.","ru":"Сначала войдите.","cs":"Nejprve se přihlaste."},"Zur Anmeldung ↗":{"uk":"До входу ↗","ru":"К входу ↗","cs":"K přihlášení ↗"},"Gerade nicht erreichbar.":{"uk":"Наразі недоступно.","ru":"Сейчас недоступно.","cs":"Momentálně nedostupné."},"Erneut versuchen":{"uk":"Спробувати ще раз","ru":"Повторить попытку","cs":"Zkusit znovu"},"Meine Schulungen.":{"uk":"Мої навчання.","ru":"Мои курсы.","cs":"Moje školení."},"Nur ansehen":{"uk":"Лише перегляд","ru":"Только просмотр","cs":"Pouze prohlížení"},"Noch keine Einträge.":{"uk":"Записів поки немає.","ru":"Записей пока нет.","cs":"Zatím žádné záznamy."},"Konto & Datenschutz":{"uk":"Обліковий запис і конфіденційність","ru":"Учётная запись и конфиденциальность","cs":"Účet a ochrana údajů"},"Konten aktualisieren":{"uk":"Оновити облікові записи","ru":"Обновить учётные записи","cs":"Aktualizovat účty"},"Geschützter Verwaltungsbereich":{"uk":"Захищений розділ керування","ru":"Защищённый раздел управления","cs":"Chráněná správa"},"Konten im Blick.":{"uk":"Облікові записи під контролем.","ru":"Учётные записи под контролем.","cs":"Přehled účtů."},"Ergebnisse mit einem Klick.":{"uk":"Результати одним натисканням.","ru":"Результаты одним нажатием.","cs":"Výsledky jedním kliknutím."},"Registrierte Konten":{"uk":"Зареєстровані облікові записи","ru":"Зарегистрированные учётные записи","cs":"Registrované účty"},"Warten auf Freischaltung":{"uk":"Очікують активації","ru":"Ожидают активации","cs":"Čekají na aktivaci"},"Aktive Zugänge":{"uk":"Активні доступи","ru":"Активные доступы","cs":"Aktivní přístupy"},"Pausiert / abgelaufen":{"uk":"Призупинені / прострочені","ru":"Приостановлены / истекли","cs":"Pozastavené / prošlé"},"Konten suchen":{"uk":"Пошук облікових записів","ru":"Поиск учётных записей","cs":"Hledat účty"},"Name oder E-Mail":{"uk":"Ім’я або електронна пошта","ru":"Имя или электронная почта","cs":"Jméno nebo e-mail"},"Zugangsstatus":{"uk":"Стан доступу","ru":"Статус доступа","cs":"Stav přístupu"},"Alle Konten":{"uk":"Усі облікові записи","ru":"Все учётные записи","cs":"Všechny účty"},"Aktiviert":{"uk":"Активовані","ru":"Активированы","cs":"Aktivováno"},"Pausiert":{"uk":"Призупинено","ru":"Приостановлено","cs":"Pozastaveno"},"Abgelaufen":{"uk":"Термін минув","ru":"Срок истёк","cs":"Platnost vypršela"},"Wartet auf Freischaltung":{"uk":"Очікує активації","ru":"Ожидает активации","cs":"Čeká na aktivaci"},"Kein Verwaltungszugang.":{"uk":"Немає доступу до керування.","ru":"Нет доступа к управлению.","cs":"Bez přístupu do správy."},"Keine passenden Konten.":{"uk":"Відповідних облікових записів немає.","ru":"Подходящих учётных записей нет.","cs":"Žádné odpovídající účty."},"Konten & Schulungsverwaltung":{"uk":"Облікові записи й керування навчаннями","ru":"Учётные записи и управление обучением","cs":"Správa účtů a školení"},"Dein Schulungspass":{"uk":"Ваш навчальний паспорт","ru":"Ваш учебный паспорт","cs":"Váš průkaz školení"},"Zur Lern-App":{"uk":"До навчального застосунку","ru":"К учебному приложению","cs":"Do výukové aplikace"},"AGB":{"uk":"Умови використання","ru":"Условия использования","cs":"Podmínky"},"Datenschutz":{"uk":"Конфіденційність","ru":"Конфиденциальность","cs":"Ochrana údajů"},"Widerruf":{"uk":"Відмова від договору","ru":"Отказ от договора","cs":"Odstoupení"},"Konto löschen":{"uk":"Видалити обліковий запис","ru":"Удалить учётную запись","cs":"Smazat účet"},"Impressum":{"uk":"Відомості про власника","ru":"Сведения о владельце","cs":"Tiráž"}};

  // The learning app owns the language registry and the shared preference key.
  // The account/record/admin shell must never maintain a separate shorter list.
  const I18N=globalThis.ABBATE_I18N;
  const languages=I18N.languages;
  const highlightedCopy=I18N.shellLabels;
  const highlightKeys=['Dein Schulungspass','Dein persönlicher Zugang','Schulungspass','Konto','Meine Schulungen','Nur ansehen'];
  const sourceText=new WeakMap(),sourceAttrs=new WeakMap();
  const button=document.getElementById('portal-language');
  const dialog=document.getElementById('portal-language-dialog');
  const grid=document.getElementById('portal-language-grid');
  const search=document.getElementById('portal-language-search');
  const currentLabel=document.getElementById('portal-language-current');
  if(!button||!dialog||!grid||!search||!I18N)return;
  const browserLanguage=(navigator.languages||[navigator.language||'de'])
    .map(v=>String(v).toLowerCase().split('-')[0])
    .find(code=>languages.some(language=>language.code===code))||'de';
  const valid=code=>languages.some(language=>language.code===code);
  let current=valid(localStorage.getItem(STORAGE))?localStorage.getItem(STORAGE):browserLanguage;
  const trim=v=>String(v??'').trim();
  const simple=v=>String(v||'').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const activeName=()=>languages.find(language=>language.code===current)?.name||'Deutsch';
  function translate(value){
    const specialIndex=highlightKeys.indexOf(value);
    // The portal-specific dictionary has verified de/uk/ru/cs entries;
    // use the shared 240-string catalogue for other screens wherever possible.
    if(current!=='de' && words[value]?.[current])return words[value][current];
    if(current!=='de' && specialIndex!==-1)return highlightedCopy[current]?.[specialIndex]||value;
    return I18N.text(value);
  }
  function apply(){
    document.documentElement.lang=current;
    currentLabel.textContent=current.toUpperCase();
    button.setAttribute('aria-label',I18N.t(4)+': '+activeName());
    const roots=[document.querySelector('.portal-header'),document.querySelector('#portal-content'),
      document.querySelector('#portal-status'),document.querySelector('.portal-legal-footer')];
    for(const root of roots){
      if(!root)continue;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let node;
      while((node=walker.nextNode())){
        // The current-language code is dynamic UI state, not source copy.
        if(node.parentElement?.closest('#portal-language'))continue;
        if(!sourceText.has(node))sourceText.set(node,node.nodeValue);
        const initial=sourceText.get(node),value=trim(initial),translated=translate(value);
        const next=value && translated!==value?initial.replace(value,translated):initial;
        if(node.nodeValue!==next)node.nodeValue=next;
      }
      for(const element of root.querySelectorAll('[placeholder],[aria-label],[title]')){
        if(element===button)continue;
        if(!sourceAttrs.has(element))sourceAttrs.set(element,{});
        const attrs=sourceAttrs.get(element);
        for(const name of ['placeholder','aria-label','title']){
          if(!element.hasAttribute(name))continue;
          if(!(name in attrs))attrs[name]=element.getAttribute(name);
          const next=translate(attrs[name]);
          if(element.getAttribute(name)!==next)element.setAttribute(name,next);
        }
      }
    }
    for(const el of document.querySelectorAll('[data-nav]')){
      const destination=el.dataset.nav;
      const active=(destination==='learn'&&false)
        ||(destination==='records'&&document.body.dataset.view==='reader')
        ||(destination==='account'&&document.body.dataset.view==='login')
        ||(destination==='admin'&&document.body.dataset.view==='admin');
      el.classList.toggle('is-current',active);
      if(active)el.setAttribute('aria-current','page');
      else el.removeAttribute('aria-current');
    }
  }
  function renderChoices(){
    grid.replaceChildren();
    const q=simple(search.value.trim());
    const matches=languages.filter(language=>!q||simple(language.name).includes(q)
      ||simple(language.code).includes(q));
    for(const language of matches){
      const option=document.createElement('button');
      option.type='button';option.className='portal-language-option';
      option.dataset.code=language.code;
      option.setAttribute('aria-pressed',String(language.code===current));
      if(language.code===current)option.classList.add('active');
      const code=document.createElement('span');code.className='portal-language-abbr';
      code.textContent=language.code.toUpperCase();
      const name=document.createElement('span');name.textContent=language.name;
      option.append(code,name);
      if(language.code===current){const mark=document.createElement('span');mark.className='portal-language-check';
        mark.textContent='✓';mark.setAttribute('aria-hidden','true');option.append(mark);}
      grid.append(option);
    }
    document.getElementById('portal-language-empty').hidden=matches.length!==0;
  }
  async function setLanguage(code,store=true){
    if(!valid(code))return;
    try{
      await I18N.load(code);
      current=code;
      if(store)localStorage.setItem(STORAGE,code);
      apply();renderChoices();
      window.dispatchEvent(new Event('abbate:language-change'));
    }catch(error){console.warn('Language pack unavailable',error);}
  }
  button.addEventListener('click',()=>{
    search.value='';renderChoices();dialog.showModal();search.focus();
  });
  dialog.querySelector('[data-close-languages]').addEventListener('click',()=>dialog.close());
  search.addEventListener('input',renderChoices);
  grid.addEventListener('click',event=>{
    const choice=event.target.closest('[data-code]');
    if(!choice)return;
    dialog.close();setLanguage(choice.dataset.code);
    button.focus();
  });
  window.addEventListener('storage',event=>{
    if(event.key===STORAGE&&valid(event.newValue))setLanguage(event.newValue,false);
  });
  new MutationObserver(apply).observe(document.querySelector('.portal-main'),{childList:true,subtree:true});
  I18N.load(current).then(()=>{apply();renderChoices();}).catch(error=>console.warn('Initial language not ready',error));
})();
