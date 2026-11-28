'use strict';
(() => {
  // Localize visible auth/portal text only. Never alter form values, passwords,
  // Supabase payloads, account IDs or the German legal document contents.
  const STORAGE='abbate-language-v1';
  const words={"Firma / Arbeitgeber (optional)":{"en":"Company / employer (optional)","ru":"Компания / работодатель (необязательно)","uk":"Компанія / роботодавець (необов’язково)","cs":"Firma / zaměstnavatel (volitelné)","pl":"Firma / pracodawca (opcjonalnie)","fr":"Entreprise / employeur (facultatif)","es":"Empresa / empleador (opcional)","it":"Azienda / datore di lavoro (facoltativo)","nl":"Bedrijf / werkgever (optioneel)","pt":"Empresa / empregador (opcional)","ro":"Companie / angajator (opțional)","sk":"Firma / zamestnávateľ (nepovinné)","sv":"Företag / arbetsgivare (valfritt)","da":"Virksomhed / arbejdsgiver (valgfrit)","fi":"Yritys / työnantaja (valinnainen)","hu":"Cég / munkáltató (nem kötelező)","hr":"Tvrtka / poslodavac (neobavezno)","sl":"Podjetje / delodajalec (neobvezno)","bg":"Фирма / работодател (незадължително)","el":"Εταιρεία / εργοδότης (προαιρετικά)","lt":"Įmonė / darbdavys (nebūtina)","lv":"Uzņēmums / darba devējs (neobligāti)","et":"Ettevõte / tööandja (valikuline)","ga":"Cuideachta / fostóir (roghnach)","mt":"Kumpanija / min iħaddem (mhux obbligatorju)"},"Firma / Arbeitgeber":{"en":"Company / employer","ru":"Компания / работодатель","uk":"Компанія / роботодавець","cs":"Firma / zaměstnavatel"},"Meine Firma":{"en":"My company","ru":"Моя компания","uk":"Моя компанія","cs":"Moje firma"},"Firma speichern":{"en":"Save company","ru":"Сохранить компанию","uk":"Зберегти компанію","cs":"Uložit firmu"},"Firma bearbeiten":{"en":"Edit company","ru":"Изменить компанию","uk":"Редагувати компанію","cs":"Upravit firmu"},"Deine Firma ist für die Fahrschule in der Teilnehmerverwaltung sichtbar.":{"en":"Your company is visible to the driving school in the participant administration.","ru":"Ваша компания отображается автошколе в списке участников.","uk":"Вашу компанію видно автошколі в списку учасників.","cs":"Vaše firma je viditelná pro autoškolu v seznamu účastníků."},"Zahlungen":{"en":"Payments","ru":"Платежи","uk":"Платежі","cs":"Platby"},"Zahlungsübersicht":{"en":"Payment overview","ru":"Обзор платежей","uk":"Огляд платежів","cs":"Přehled plateb"},"Keine Firma hinterlegt":{"en":"No company specified","ru":"Компания не указана","uk":"Компанію не вказано","cs":"Firma neuvedena"},"Firma eintragen":{"en":"Enter company","ru":"Указать компанию","uk":"Вказати компанію","cs":"Zadat firmu"},"Bestätigungs-E-Mail erneut senden":{"uk":"Надіслати лист підтвердження повторно","ru":"Отправить письмо подтверждения повторно","cs":"Znovu odeslat potvrzovací e-mail","en":"Resend confirmation email"},"Bestätigungs-E-Mail wird angefordert …":{"uk":"Запит листа підтвердження …","ru":"Запрашиваем письмо подтверждения …","cs":"Vyžaduje se potvrzovací e-mail …","en":"Requesting confirmation email …"},"Falls deine E-Mail-Adresse noch nicht bestätigt ist, erhältst du einen neuen Bestätigungslink. Bitte prüfe auch deinen Spamordner.":{"uk":"Якщо вашу адресу ще не підтверджено, ви отримаєте нове посилання. Перевірте також папку спаму.","ru":"Если адрес ещё не подтверждён, вы получите новую ссылку. Проверьте также папку спама.","cs":"Pokud e-mail ještě není potvrzen, obdržíte nový odkaz. Zkontrolujte také spam.","en":"If your email address is not yet confirmed, you will receive a new confirmation link. Please check your spam folder too."},"Bitte warte, bevor du eine weitere E-Mail anforderst. Prüfe in der Zwischenzeit deinen Spamordner.":{"uk":"Зачекайте перед повторним запитом. Перевірте папку спаму.","ru":"Подождите перед повторным запросом. Проверьте папку спама.","cs":"Před další žádostí vyčkejte. Mezitím zkontrolujte spam.","en":"Please wait before requesting another email. Check your spam folder in the meantime."},"Die E-Mail konnte momentan nicht angefordert werden. Bitte versuche es später erneut oder wende dich an die Fahrschule.":{"uk":"Не вдалося надіслати запит. Спробуйте пізніше або зверніться до навчального центру.","ru":"Не удалось запросить письмо. Повторите попытку позже или обратитесь в учебный центр.","cs":"E-mail se nyní nepodařilo vyžádat. Zkuste to později nebo kontaktujte školicí středisko.","en":"The email could not be requested right now. Try again later or contact the driving school."},"Dein persönlicher Zugang":{"uk":"Ваш особистий доступ","ru":"Ваш личный доступ","cs":"Váš osobní přístup"},"Zur Lern-App ↗":{"uk":"До навчального застосунку ↗","ru":"К учебному приложению ↗","cs":"Do výukové aplikace ↗"},"Ein QR-Code. Dein persönlicher Bereich.":{"uk":"Один QR-код. Ваш особистий розділ.","ru":"Один QR-код. Ваш личный раздел.","cs":"Jeden QR kód. Váš osobní prostor."},"Deine Schulungen.":{"uk":"Ваші навчання.","ru":"Ваши курсы.","cs":"Vaše školení."},"Dein Überblick.":{"uk":"Ваш огляд.","ru":"Всё под контролем.","cs":"Váš přehled."},"Melde dich an und sieh deine persönlichen Schulungen und Prüfungsergebnisse. Deine Fahrschule pflegt die Einträge für dich.":{"uk":"Увійдіть, щоб переглянути свої навчання та результати іспитів. Ваш навчальний центр веде ці записи.","ru":"Войдите, чтобы посмотреть свои учебные курсы и результаты экзаменов. Записи ведёт учебный центр.","cs":"Přihlaste se a prohlédněte si svá školení a výsledky zkoušek. Záznamy spravuje vaše školicí středisko."},"01 / Bereits registriert":{"uk":"01 / Уже зареєстровані","ru":"01 / Уже зарегистрированы","cs":"01 / Již registrováni"},"Deinen Bereich öffnen":{"uk":"Відкрити особистий розділ","ru":"Открыть личный раздел","cs":"Otevřít svůj účet"},"E-Mail-Adresse":{"uk":"Електронна пошта","ru":"Электронная почта","cs":"E-mailová adresa"},"Passwort":{"uk":"Пароль","ru":"Пароль","cs":"Heslo"},"Sicher anmelden ↗":{"uk":"Безпечно увійти ↗","ru":"Безопасно войти ↗","cs":"Bezpečně se přihlásit ↗"},"Passwort vergessen?":{"uk":"Забули пароль?","ru":"Забыли пароль?","cs":"Zapomněli jste heslo?"},"02 / Neu bei Abbate":{"uk":"02 / Уперше в Abbate","ru":"02 / Впервые в Abbate","cs":"02 / Nově u Abbate"},"Dein Konto anlegen":{"uk":"Створити обліковий запис","ru":"Создать учётную запись","cs":"Vytvořit účet"},"Die Registrierung ist kostenlos. Der Zugang zu den Lerninhalten wird durch die Fahrschule freigeschaltet. Es gibt kein automatisches Abo.":{"uk":"Реєстрація безкоштовна. Доступ до матеріалів активує навчальний центр. Автоматичної підписки немає.","ru":"Регистрация бесплатна. Доступ к учебным материалам активирует учебный центр. Автоматической подписки нет.","cs":"Registrace je zdarma. Přístup k výukovým materiálům aktivuje školicí středisko. Nejde o automatické předplatné."},"Vor- und Nachname":{"uk":"Ім’я та прізвище","ru":"Имя и фамилия","cs":"Jméno a příjmení"},"Mindestens 12 Zeichen. Verwende ein eigenes, sicheres Passwort.":{"uk":"Щонайменше 12 символів. Використовуйте власний надійний пароль.","ru":"Не менее 12 символов. Используйте собственный надёжный пароль.","cs":"Alespoň 12 znaků. Použijte vlastní silné heslo."},"Ich akzeptiere die":{"uk":"Я приймаю","ru":"Я принимаю","cs":"Souhlasím s"},"AGB und Nutzungsbedingungen":{"uk":"Правилами та умовами використання","ru":"Условиями использования","cs":"obchodními a uživatelskými podmínkami"},"(Fassung 02.11.2026).":{"uk":"(редакція від 02.11.2026).","ru":"(редакция от 02.11.2026).","cs":"(verze 02.11.2026)."},"Unsere":{"uk":"Нашу","ru":"Нашу","cs":"Naše"},"Datenschutzerklärung":{"uk":"Політику конфіденційності","ru":"Политику конфиденциальности","cs":"Zásady ochrany osobních údajů"},"und Informationen zu":{"uk":"та інформацію про","ru":"и информацию о","cs":"a informace o"},"Widerruf und Verbraucherrechten":{"uk":"право на відмову та права споживачів","ru":"право на отказ и права потребителей","cs":"odstoupení od smlouvy a právech spotřebitele"},"kannst du jederzeit einsehen. Die Registrierung ist kostenlos und keine Bestellung.":{"uk":"можна переглянути будь-коли. Реєстрація безкоштовна й не є замовленням.","ru":"можно посмотреть в любое время. Регистрация бесплатна и не является заказом.","cs":"si můžete kdykoliv přečíst. Registrace je zdarma a nepředstavuje objednávku."},"Konto registrieren":{"uk":"Зареєструвати обліковий запис","ru":"Зарегистрировать учётную запись","cs":"Zaregistrovat účet"},"Dein Zugang":{"uk":"Ваш доступ","ru":"Ваш доступ","cs":"Váš přístup"},"Passwort zurücksetzen.":{"uk":"Скидання пароля.","ru":"Сброс пароля.","cs":"Obnovení hesla."},"Wir senden dir einen Link, mit dem du ein neues Passwort festlegen kannst.":{"uk":"Ми надішлемо посилання, за яким можна встановити новий пароль.","ru":"Мы отправим ссылку для установки нового пароля.","cs":"Pošleme vám odkaz pro nastavení nového hesla."},"Link anfordern":{"uk":"Отримати посилання","ru":"Получить ссылку","cs":"Vyžádat odkaz"},"Zur Anmeldung":{"uk":"До входу","ru":"К входу","cs":"K přihlášení"},"Dein neues Passwort.":{"uk":"Ваш новий пароль.","ru":"Ваш новый пароль.","cs":"Vaše nové heslo."},"Neues Passwort":{"uk":"Новий пароль","ru":"Новый пароль","cs":"Nové heslo"},"Passwort speichern":{"uk":"Зберегти пароль","ru":"Сохранить пароль","cs":"Uložit heslo"},"Aktuelle Nutzungsbedingungen.":{"uk":"Актуальні умови використання.","ru":"Актуальные условия использования.","cs":"Aktuální podmínky používání."},"Ich akzeptiere die AGB vom 02.11.2026.":{"uk":"Я приймаю умови використання від 02.11.2026.","ru":"Я принимаю условия использования от 02.11.2026.","cs":"Souhlasím s podmínkami z 02.11.2026."},"Weiter zum Lernraum":{"uk":"Перейти до навчання","ru":"Перейти к обучению","cs":"Pokračovat do výuky"},"Abmelden":{"uk":"Вийти","ru":"Выйти","cs":"Odhlásit se"},"Mein Konto":{"uk":"Мій обліковий запис","ru":"Моя учётная запись","cs":"Můj účet"},"Meine Schulungen":{"uk":"Мої навчання","ru":"Мои курсы","cs":"Moje školení"},"Zum Lernen":{"uk":"До навчання","ru":"К обучению","cs":"K výuce"},"Verwaltung öffnen":{"uk":"Відкрити керування","ru":"Открыть управление","cs":"Otevřít správu"},"Passwort ändern":{"uk":"Змінити пароль","ru":"Изменить пароль","cs":"Změnit heslo"},"Aktuelles Passwort":{"uk":"Поточний пароль","ru":"Текущий пароль","cs":"Současné heslo"},"Neues Passwort speichern":{"uk":"Зберегти новий пароль","ru":"Сохранить новый пароль","cs":"Uložit nové heslo"},"Konto und persönliche Daten löschen":{"uk":"Видалити обліковий запис і персональні дані","ru":"Удалить учётную запись и персональные данные","cs":"Smazat účet a osobní údaje"},"Dein Passwort zur Bestätigung":{"uk":"Ваш пароль для підтвердження","ru":"Ваш пароль для подтверждения","cs":"Heslo pro potvrzení"},"Ich möchte mein Konto und alle zugehörigen Einträge endgültig löschen.":{"uk":"Я хочу назавжди видалити свій обліковий запис і всі пов’язані записи.","ru":"Я хочу окончательно удалить учётную запись и все связанные записи.","cs":"Chci trvale smazat svůj účet a všechny související záznamy."},"Mein Konto endgültig löschen":{"uk":"Назавжди видалити обліковий запис","ru":"Удалить учётную запись навсегда","cs":"Trvale smazat můj účet"},"Bitte zuerst anmelden.":{"uk":"Спочатку увійдіть.","ru":"Сначала войдите.","cs":"Nejprve se přihlaste."},"Zur Anmeldung ↗":{"uk":"До входу ↗","ru":"К входу ↗","cs":"K přihlášení ↗"},"Gerade nicht erreichbar.":{"uk":"Наразі недоступно.","ru":"Сейчас недоступно.","cs":"Momentálně nedostupné."},"Erneut versuchen":{"uk":"Спробувати ще раз","ru":"Повторить попытку","cs":"Zkusit znovu"},"Meine Schulungen.":{"uk":"Мої навчання.","ru":"Мои курсы.","cs":"Moje školení."},"Nur ansehen":{"uk":"Лише перегляд","ru":"Только просмотр","cs":"Pouze prohlížení"},"Noch keine Einträge.":{"uk":"Записів поки немає.","ru":"Записей пока нет.","cs":"Zatím žádné záznamy."},"Konto & Datenschutz":{"uk":"Обліковий запис і конфіденційність","ru":"Учётная запись и конфиденциальность","cs":"Účet a ochrana údajů"},"Konten aktualisieren":{"uk":"Оновити облікові записи","ru":"Обновить учётные записи","cs":"Aktualizovat účty"},"Geschützter Verwaltungsbereich":{"uk":"Захищений розділ керування","ru":"Защищённый раздел управления","cs":"Chráněná správa"},"Konten im Blick.":{"uk":"Облікові записи під контролем.","ru":"Учётные записи под контролем.","cs":"Přehled účtů."},"Ergebnisse mit einem Klick.":{"uk":"Результати одним натисканням.","ru":"Результаты одним нажатием.","cs":"Výsledky jedním kliknutím."},"Registrierte Konten":{"uk":"Зареєстровані облікові записи","ru":"Зарегистрированные учётные записи","cs":"Registrované účty"},"Warten auf Freischaltung":{"uk":"Очікують активації","ru":"Ожидают активации","cs":"Čekají na aktivaci"},"Aktive Zugänge":{"uk":"Активні доступи","ru":"Активные доступы","cs":"Aktivní přístupy"},"Pausiert / abgelaufen":{"uk":"Призупинені / прострочені","ru":"Приостановлены / истекли","cs":"Pozastavené / prošlé"},"Konten suchen":{"uk":"Пошук облікових записів","ru":"Поиск учётных записей","cs":"Hledat účty"},"Name oder E-Mail":{"uk":"Ім’я або електронна пошта","ru":"Имя или электронная почта","cs":"Jméno nebo e-mail"},"Zugangsstatus":{"uk":"Стан доступу","ru":"Статус доступа","cs":"Stav přístupu"},"Alle Konten":{"uk":"Усі облікові записи","ru":"Все учётные записи","cs":"Všechny účty"},"Aktiviert":{"uk":"Активовані","ru":"Активированы","cs":"Aktivováno"},"Pausiert":{"uk":"Призупинено","ru":"Приостановлено","cs":"Pozastaveno"},"Abgelaufen":{"uk":"Термін минув","ru":"Срок истёк","cs":"Platnost vypršela"},"Wartet auf Freischaltung":{"uk":"Очікує активації","ru":"Ожидает активации","cs":"Čeká na aktivaci"},"Kein Verwaltungszugang.":{"uk":"Немає доступу до керування.","ru":"Нет доступа к управлению.","cs":"Bez přístupu do správy."},"Keine passenden Konten.":{"uk":"Відповідних облікових записів немає.","ru":"Подходящих учётных записей нет.","cs":"Žádné odpovídající účty."},"Konten & Schulungsverwaltung":{"uk":"Облікові записи й керування навчаннями","ru":"Учётные записи и управление обучением","cs":"Správa účtů a školení"},"Dein Schulungspass":{"uk":"Ваш навчальний паспорт","ru":"Ваш учебный паспорт","cs":"Váš průkaz školení"},"Zur Lern-App":{"uk":"До навчального застосунку","ru":"К учебному приложению","cs":"Do výukové aplikace"},"AGB":{"uk":"Умови використання","ru":"Условия использования","cs":"Podmínky"},"Datenschutz":{"uk":"Конфіденційність","ru":"Конфиденциальность","cs":"Ochrana údajů"},"Widerruf":{"uk":"Відмова від договору","ru":"Отказ от договора","cs":"Odstoupení"},"Konto löschen":{"uk":"Видалити обліковий запис","ru":"Удалить учётную запись","cs":"Smazat účet"},"Impressum":{"uk":"Відомості про власника","ru":"Сведения о владельце","cs":"Tiráž"},"Persönlicher Zugang":{"uk":"Один QR-код. Ваш особистий розділ.","ru":"Один QR-код. Ваш личный раздел.","cs":"Jeden QR kód. Váš osobní prostor."},"Melde dich an, um die von deiner Fahrschule dokumentierten Schulungen und Prüfungsergebnisse einzusehen.":{"ru":"Войдите, чтобы просмотреть сведения об обучении и результаты экзаменов, внесённые учебным центром.","uk":"Увійдіть, щоб переглянути навчання та результати іспитів, внесені навчальним центром.","cs":"Přihlaste se pro zobrazení školení a výsledků zkoušek zaznamenaných školicím střediskem."},"Anmelden ↗":{"ru":"Войти ↗","uk":"Увійти ↗","cs":"Přihlásit se ↗"},"02 / Registrierung":{"ru":"02 / Регистрация","uk":"02 / Реєстрація","cs":"02 / Registrace"},"Konto erstellen":{"uk":"Створити обліковий запис","ru":"Создать учётную запись","cs":"Vytvořit účet"},"Die Registrierung ist kostenfrei. Lerninhalte stehen nach Freischaltung durch die Fahrschule zur Verfügung. Es entsteht kein Abonnement.":{"uk":"Реєстрація безкоштовна. Доступ до матеріалів активує навчальний центр. Автоматичної підписки немає.","ru":"Регистрация бесплатна. Доступ к учебным материалам активирует учебный центр. Автоматической подписки нет.","cs":"Registrace je zdarma. Přístup k výukovým materiálům aktivuje školicí středisko. Nejde o automatické předplatné."},"Teilnehmerverwaltung":{"ru":"Управление участниками","uk":"Керування учасниками","cs":"Správa účastníků"},"Schulungen und Prüfungsergebnisse":{"ru":"Обучение и результаты экзаменов","uk":"Навчання та результати іспитів","cs":"Školení a výsledky zkoušek"},"Dokumentierte Schulungen und Prüfungen":{"ru":"Задокументированные обучения и экзамены","uk":"Задокументовані навчання та іспити","cs":"Zaznamenaná školení a zkoušky"},"Zugänge verwalten, Schulungen dokumentieren und Prüfungsergebnisse erfassen.":{"ru":"Управление доступом, учёт обучения и результатов экзаменов.","uk":"Керування доступом, облік навчань і результатів іспитів.","cs":"Správa přístupů, evidence školení a výsledků zkoušek."},"Der QR-Code führt zur Anmeldeseite und kann auf allen Schülerkarten verwendet werden.":{"ru":"QR-код ведёт на страницу входа и подходит для всех карточек учащихся.","uk":"QR-код відкриває сторінку входу та підходить для всіх карток учнів.","cs":"QR kód vede na přihlašovací stránku a lze jej použít na všech kartách účastníků."},"Der QR-Code enthält keine personenbezogenen Daten.":{"ru":"QR-код не содержит персональных данных.","uk":"QR-код не містить персональних даних.","cs":"QR kód neobsahuje osobní údaje."},"Anmeldeseite öffnen ↗":{"ru":"Открыть страницу входа ↗","uk":"Відкрити сторінку входу ↗","cs":"Otevřít přihlašovací stránku ↗"},"PNG (Druckqualität) herunterladen":{"ru":"Скачать PNG для печати","uk":"Завантажити PNG для друку","cs":"Stáhnout PNG pro tisk"},"SVG (Vektorformat) herunterladen":{"ru":"Скачать SVG (векторный формат)","uk":"Завантажити SVG (векторний формат)","cs":"Stáhnout SVG (vektorový formát)"}};

  // Account copy is separate from the learning catalogue. Keep exact text-node
  // fragments here, including the fragments around links and emphasis.
  const english={
    'Gerade nicht erreichbar.':'Currently unavailable.',
    'Erneut versuchen':'Try again',
    'Bitte zuerst anmelden.':'Please sign in first.',
    'Zur Anmeldung ↗':'Go to sign-in ↗',
    'Bitte melde dich zur Bestätigung erneut an.':'Please sign in again to confirm.',
    'Bitte akzeptiere die AGB.':'Please accept the terms and conditions.',
    'Der E-Mail-Versand wird noch eingerichtet. Bitte wende dich an die Fahrschule.':'Email delivery is still being configured. Please contact your driving school.',
    'Persönlicher Zugang':'Personal access',
    'Schulungen und Prüfungsergebnisse':'Training and exam results',
    'Melde dich an, um die von deiner Fahrschule dokumentierten Schulungen und Prüfungsergebnisse einzusehen.':'Sign in to view the training and exam results recorded by your driving school.',
    '01 / Bereits registriert':'01 / Already registered',
    'Deinen Bereich öffnen':'Open your account',
    'Passwort':'Password',
    'Anmelden ↗':'Sign in ↗',
    'Passwort vergessen?':'Forgot your password?',
    '02 / Registrierung':'02 / Registration',
    'Konto erstellen':'Create an account',
    'Die Registrierung ist kostenfrei.':'Registration is free.',
    'Wichtig:':'Important:',
    'Nach dem Absenden musst du deine E-Mail-Adresse über einen Link in deinem Postfach bestätigen. Erst danach kannst du dich anmelden. Die Fahrschule schaltet deinen Lernzugang anschließend frei. Es entsteht kein Abonnement.':'After submitting, you must confirm your email address using the link sent to your inbox. You can then sign in. Your driving school will activate your learning access afterwards. No subscription is created.',
    'Vor- und Nachname':'First and last name',
    'Mindestens 12 Zeichen. Verwende ein eigenes, sicheres Passwort.':'At least 12 characters. Use a unique, strong password.',
    'Ich akzeptiere die':'I accept the',
    'AGB und Nutzungsbedingungen':'terms and conditions',
    '(Fassung 02.11.2026).':'(version dated 2 November 2026).',
    'Unsere':'Our',
    'Datenschutzerklärung':'privacy policy',
    'und Informationen zu':'and information about',
    'Widerruf und Verbraucherrechten':'withdrawal and consumer rights',
    'kannst du jederzeit einsehen. Die Registrierung ist kostenlos und keine Bestellung.':'are available at any time. Registration is free and does not place an order.',
    'Konto registrieren':'Register account',
    'Registrierungsanfrage eingegangen':'Registration request received',
    'Fast geschafft!':'Almost there!',
    'E-Mail bestätigen.':'Confirm your email.',
    'Deine Anmeldung ist noch nicht abgeschlossen.':'Your registration is not complete yet.',
    'Öffne den Bestätigungslink, den du per E-Mail erhältst. Ohne diese Bestätigung kannst du dich noch nicht anmelden.':'Open the confirmation link sent to you by email. You cannot sign in until you have confirmed your address.',
    'Bitte prüfe das Postfach von':'Please check the inbox for',
    '1. Registrierungsanfrage abgeschickt':'1. Registration request submitted',
    'Deine Anfrage wurde angenommen.':'Your request has been accepted.',
    '2. E-Mail-Adresse bestätigen':'2. Confirm your email address',
    'Öffne die E-Mail und klicke auf den Bestätigungslink.':'Open the email and click the confirmation link.',
    '3. Freischaltung durch die Fahrschule':'3. Activation by your driving school',
    'Nach der Bestätigung wird dein Lernzugang von der Fahrschule freigeschaltet.':'After confirmation, your driving school will activate your learning access.',
    'Keine E-Mail gefunden?':'Cannot find the email?',
    'Bitte prüfe auch deinen Spamordner und gib der Zustellung etwas Zeit.':'Please also check your spam folder and allow some time for delivery.',
    'Registriere dich nicht erneut.':'Do not register again.',
    'Nach der Bestätigung zur Anmeldung ↗':'Sign in after confirming your email ↗',
    'Dein Zugang':'Your access',
    'Passwort zurücksetzen.':'Reset your password.',
    'Wir senden dir einen Link, mit dem du ein neues Passwort festlegen kannst.':'We will send you a link to set a new password.',
    'Link anfordern':'Request link',
    'Zur Anmeldung':'Back to sign-in',
    'Dein neues Passwort.':'Your new password.',
    'Neues Passwort':'New password',
    'Passwort speichern':'Save password',
    'Passwort erfolgreich geändert':'Password changed successfully',
    'Dein neues Passwort ist gespeichert.':'Your new password has been saved.',
    'Du kannst dich jetzt mit deinem neuen Passwort bei Abbate Lernraum anmelden.':'You can now sign in to Abbate Lernraum with your new password.',
    'Jetzt anmelden ↗':'Sign in now ↗',
    'Dieser Link ist nicht mehr gültig.':'This link is no longer valid.',
    'Der Link wurde möglicherweise bereits verwendet oder ist abgelaufen. Fordere bitte einen neuen Link an, um dein Passwort sicher zurückzusetzen.':'This link may have already been used or expired. Please request a new link to reset your password securely.',
    'Neuen Link anfordern':'Request a new link',
    'Falls ein Konto mit dieser Adresse existiert, erhältst du einen Link zum Zurücksetzen. Bitte auch den Spamordner prüfen.':'If an account exists for this address, you will receive a password reset link. Please also check your spam folder.',
    'E-Mail oder Passwort stimmt nicht.':'The email address or password is incorrect.',
    'Bitte bestätige zuerst deine E-Mail-Adresse.':'Please confirm your email address first.',
    'Zu viele Versuche. Bitte warte kurz und versuche es erneut.':'Too many attempts. Please wait a moment and try again.',
    'Bitte ein sicheres Passwort mit mindestens 12 Zeichen verwenden.':'Please use a strong password with at least 12 characters.',
    'Keine Serververbindung. Bitte Internetverbindung prüfen.':'Cannot connect to the server. Please check your internet connection.',
    'Die Anfrage konnte nicht abgeschlossen werden. Bitte neu laden oder die Fahrschule kontaktieren.':'The request could not be completed. Please reload or contact your driving school.',
    'Bitte akzeptiere die AGB vor der Registrierung.':'Please accept the terms and conditions before registering.',
    'Dein Konto':'Your account',
    'Passwort ändern':'Change password',
    'Aktuelles Passwort':'Current password',
    'Neues Passwort speichern':'Save new password',
    'Abmelden':'Sign out',
    'Zum Lernen':'Start learning',
    'Verwaltung öffnen':'Open administration',
    'Mitarbeiterkonten werden durch den verantwortlichen Betreiber verwaltet.':'Staff accounts are managed by the responsible operator.',
    'Dein persönlicher Schulungspass':'Your personal training record',
    'Durchgeführte Schulungen, Unterweisungen und Prüfungen.':'Completed training, instruction and exams.',
    'Dokumentierter Verlauf':'Recorded history',
    'Eintrag':'record',
    'Einträge':'records',
    'Zuletzt durchgeführt':'Most recently completed',
    'Noch kein Eintrag':'No records yet',
    'Von deiner Fahrschule erfasst':'Recorded by your driving school',
    'Dokumentierte Schulungen und Prüfungen':'Recorded training and exams',
    'Neueste zuerst':'Newest first',
    'Noch keine Einträge.':'No records yet.',
    'Hier erscheinen durchgeführte Schulungen und Prüfungen, sobald die Fahrschule sie erfasst hat.':'Completed training and exams will appear here once your driving school records them.',
    'Die Angaben werden von der Fahrschule gepflegt. Übungsrunden aus der Lern-App erzeugen keine bestätigten Schulungs- oder Prüfungseinträge.':'These records are maintained by your driving school. Practice rounds in the learning app do not create confirmed training or exam records.',
    'Konto & Datenschutz':'Account and privacy',
    'AGB':'Terms and conditions',
    'Datenschutz':'Privacy',
    'Widerruf':'Right of withdrawal',
    'Konto löschen':'Delete account',
    'Impressum':'Legal notice',
    'Konzeption & Design der App:':'App concept and design:'
  };
  for(const [source,translation] of Object.entries(english)){
    words[source]={...words[source],en:translation};
  }

  words["Wichtig: Spamordner prüfen!"]={"en":"Important: Check your spam folder!","ru":"Важно: проверьте папку «Спам»!","uk":"Важливо: перевірте папку «Спам»!","cs":"Důležité: zkontrolujte složku Spam!","pl":"Ważne: sprawdź folder Spam!","fr":"Important : vérifiez vos courriers indésirables !","es":"Importante: revisa la carpeta de spam.","it":"Importante: controlla la cartella spam!","nl":"Belangrijk: controleer je spammap!","pt":"Importante: verifica a pasta de spam!","ro":"Important: verifică folderul Spam!","sk":"Dôležité: skontrolujte priečinok Spam!","sv":"Viktigt: kontrollera skräpposten!","da":"Vigtigt: tjek din spammappe!","fi":"Tärkeää: tarkista roskapostikansio!","hu":"Fontos: ellenőrizd a spam mappát!","hr":"Važno: provjeri mapu neželjene pošte!","sl":"Pomembno: preveri mapo z neželeno pošto!","bg":"Важно: проверете папката „Спам“!","el":"Σημαντικό: ελέγξτε τον φάκελο ανεπιθύμητης αλληλογραφίας!","lt":"Svarbu: patikrinkite šlamšto aplanką!","lv":"Svarīgi: pārbaudiet surogātpasta mapi!","et":"Oluline: kontrolli rämpsposti kausta!","ga":"Tábhachtach: seiceáil d’fhillteán turscair!","mt":"Importanti: iċċekkja l-folder tal-ispam!"};
  words["Die Bestätigungs-E-Mail kann im Spamordner landen. Verschiebe sie gegebenenfalls in den Posteingang und öffne dort den Bestätigungslink."]={"en":"The confirmation email may end up in your spam folder. If so, move it to your inbox and open the confirmation link there.","ru":"Письмо с подтверждением может попасть в спам. Если это произошло, переместите его во входящие и откройте ссылку для подтверждения там.","uk":"Лист із підтвердженням може потрапити до спаму. У такому разі перемістіть його до вхідних та відкрийте там посилання для підтвердження.","cs":"Potvrzovací e-mail může skončit ve spamu. V takovém případě jej přesuňte do doručené pošty a otevřete potvrzovací odkaz tam.","pl":"E-mail potwierdzający może trafić do spamu. W takim przypadku przenieś go do skrzynki odbiorczej i otwórz tam link potwierdzający.","fr":"L’e-mail de confirmation peut arriver dans les spams. Si c’est le cas, déplacez-le dans votre boîte de réception et ouvrez-y le lien de confirmation.","es":"El correo de confirmación puede llegar a la carpeta de spam. Si es así, muévelo a la bandeja de entrada y abre allí el enlace de confirmación.","it":"L’e-mail di conferma potrebbe finire nello spam. In tal caso, spostala nella posta in arrivo e apri da lì il link di conferma.","nl":"De bevestigingsmail kan in je spammap terechtkomen. Verplaats deze zo nodig naar je inbox en open daar de bevestigingslink.","pt":"O e-mail de confirmação pode ir para a pasta de spam. Nesse caso, move-o para a caixa de entrada e abre aí a ligação de confirmação.","ro":"E-mailul de confirmare poate ajunge în spam. Dacă se întâmplă acest lucru, mută-l în căsuța de primire și deschide acolo linkul de confirmare.","sk":"Potvrdzovací e-mail môže skončiť v spame. V takom prípade ho presuňte do doručenej pošty a otvorte tam potvrdzovací odkaz.","sv":"Bekräftelsemejlet kan hamna i skräpposten. Flytta det i så fall till inkorgen och öppna bekräftelselänken där.","da":"Bekræftelsesmailen kan ende i spammappen. Flyt den i så fald til indbakken, og åbn bekræftelseslinket der.","fi":"Vahvistusviesti voi päätyä roskapostiin. Siirrä se tarvittaessa saapuneisiin viesteihin ja avaa vahvistuslinkki siellä.","hu":"A megerősítő e-mail a spam mappába kerülhet. Ha így van, helyezd át a beérkező levelek közé, és ott nyisd meg a megerősítő linket.","hr":"E-poruka za potvrdu može završiti u neželjenoj pošti. Ako se to dogodi, premjesti je u pristiglu poštu i tamo otvori poveznicu za potvrdu.","sl":"Potrditveno e-sporočilo lahko konča v neželeni pošti. Če se to zgodi, ga premakni v mapo Prejeto in tam odpri potrditveno povezavo.","bg":"Имейлът за потвърждение може да попадне в спам. Ако е там, преместете го във входящата поща и отворете връзката за потвърждение оттам.","el":"Το email επιβεβαίωσης μπορεί να καταλήξει στα ανεπιθύμητα. Αν συμβεί αυτό, μετακινήστε το στα εισερχόμενα και ανοίξτε εκεί τον σύνδεσμο επιβεβαίωσης.","lt":"Patvirtinimo laiškas gali patekti į šlamšto aplanką. Jei taip nutiko, perkelkite jį į gautuosius ir ten atidarykite patvirtinimo nuorodą.","lv":"Apstiprinājuma e-pasts var nonākt surogātpasta mapē. Ja tā noticis, pārvietojiet to uz iesūtni un tur atveriet apstiprinājuma saiti.","et":"Kinnitusmeil võib sattuda rämpsposti. Sel juhul tõsta see postkasti ja ava seal kinnituslink.","ga":"D’fhéadfadh an ríomhphost deimhnithe dul isteach san fhillteán turscair. Más amhlaidh atá, bog chuig an mbosca isteach é agus oscail an nasc deimhnithe ansin.","mt":"L-email ta’ konferma tista’ tasal fil-folder tal-ispam. Jekk jiġri hekk, mexxiha fl-inbox u iftaħ il-link ta’ konferma hemm."};

  words["App installieren"]={"en":"Install app","ru":"Установить приложение","uk":"Встановити застосунок","cs":"Nainstalovat aplikaci","pl":"Zainstaluj aplikację","fr":"Installer l’application","es":"Instalar aplicación","it":"Installa l’app","nl":"App installeren","pt":"Instalar aplicação","ro":"Instalează aplicația","sk":"Nainštalovať aplikáciu","sv":"Installera appen","da":"Installer appen","fi":"Asenna sovellus","hu":"Alkalmazás telepítése","hr":"Instaliraj aplikaciju","sl":"Namesti aplikacijo","bg":"Инсталирай приложението","el":"Εγκατάσταση εφαρμογής","lt":"Įdiegti programėlę","lv":"Instalēt lietotni","et":"Paigalda rakendus","ga":"Suiteáil an aip","mt":"Installa l-app"};

  words["Du wurdest nach 5 Minuten Inaktivität abgemeldet. Bitte melde dich erneut an."]={"en":"You were signed out after 5 minutes of inactivity. Please sign in again.","ru":"Вы вышли из аккаунта после 5 минут бездействия. Войдите снова.","uk":"Вас було автоматично виведено після 5 хвилин бездіяльності. Увійдіть знову.","cs":"Po 5 minutách nečinnosti jste byli odhlášeni. Přihlaste se znovu.","pl":"Wylogowano Cię po 5 minutach bezczynności. Zaloguj się ponownie.","fr":"Tu as été déconnecté après 5 minutes d’inactivité. Reconnecte-toi.","es":"Se ha cerrado tu sesión tras 5 minutos de inactividad. Vuelve a iniciar sesión.","it":"Sei stato disconnesso dopo 5 minuti di inattività. Accedi nuovamente.","nl":"Je bent na 5 minuten inactiviteit uitgelogd. Log opnieuw in.","pt":"A tua sessão terminou após 5 minutos de inatividade. Inicia sessão novamente.","ro":"Ai fost deconectat după 5 minute de inactivitate. Autentifică-te din nou.","sk":"Po 5 minútach nečinnosti ste boli odhlásení. Prihláste sa znova.","sv":"Du loggades ut efter 5 minuters inaktivitet. Logga in igen.","da":"Du blev logget ud efter 5 minutters inaktivitet. Log ind igen.","fi":"Sinut kirjattiin ulos 5 minuutin käyttämättömyyden jälkeen. Kirjaudu uudelleen.","hu":"5 perc inaktivitás után kijelentkeztettünk. Jelentkezz be újra.","hr":"Odjavljeni ste nakon 5 minuta neaktivnosti. Prijavite se ponovno.","sl":"Po 5 minutah nedejavnosti ste bili odjavljeni. Prijavite se znova.","bg":"Излязохте от профила след 5 минути бездействие. Влезте отново.","el":"Αποσυνδέθηκες μετά από 5 λεπτά αδράνειας. Συνδέσου ξανά.","lt":"Po 5 minučių neveiklos buvai atjungtas. Prisijunk iš naujo.","lv":"Pēc 5 minūšu neaktivitātes tiki izrakstīts. Piesakies vēlreiz.","et":"Sind logiti pärast 5 minutit tegevusetust välja. Logi uuesti sisse.","ga":"Rinneadh tú a shíniú amach tar éis 5 nóiméad neamhghníomhaíochta. Sínigh isteach arís.","mt":"Ġejt illoggjat ’il barra wara 5 minuti ta’ inattività. Erġa’ idħol."};

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
    if(current==='en'){
      const wait=value.match(/^Bitte warte noch (\d+) Sekunden, bevor du eine weitere E-Mail anforderst\. (.*)$/);
      const help='Falls du dich eben registriert hast, prüfe zuerst dein E-Mail-Postfach und den Spamordner. Du musst dich nicht erneut registrieren.';
      const englishHelp='If you have just registered, check your inbox and spam folder first. You do not need to register again.';
      if(wait&&wait[2]===help)return 'Please wait '+wait[1]+' seconds before requesting another email. '+englishHelp;
      if(value==='Bitte warte kurz, bevor du eine weitere E-Mail anforderst. '+help)return 'Please wait a moment before requesting another email. '+englishHelp;
    }
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
