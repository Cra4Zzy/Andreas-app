# Backend und Inbetriebnahme

Stand: 2. November 2026. Technischer Pilot, noch keine Freigabe für echte Schulungsdaten.

## Eingerichtet

Eigenes Supabase-Projekt `qyizzwqrruwojtriqfuc`, Name **Abbate Lernraum**, Region `eu-central-1` (Frankfurt), in der vom Nutzer gewählten Organisation. Bei Erstellung wurden **0 US$/Monat** für den Free-Tarif angezeigt; keine kostenpflichtige Erweiterung gebucht. Das andere Projekt wurde nicht verändert.

Cloud-Migration: `20261102122610_live_accounts`. Die Schulzuordnung für neue Registrierungen ist serverseitig eingerichtet. Neue Konten starten ausschließlich als `learner/pending`. Es gibt **keinen automatischen ersten Admin**, kein vorgegebenes Adminpasswort und keine künstlichen Cloud-Testkonten.

Der Browser kommuniziert über HTTPS mit Supabase Auth und der Data API. Der Schlüssel in `dist/backend-config.js` ist ausdrücklich ein öffentlicher Publishable-Key. Ein Service- oder Secret-Key ist weder nötig noch im Appcode enthalten.

## Rechte und Daten

Alle öffentlichen App-Tabellen verwenden RLS. Anmeldung allein erteilt keine Verwaltungsrechte. Berechtigungen stammen aus aktuellen Mitgliedschaften, nicht aus vom Nutzer editierbaren Metadaten. Mitgliedschaften und geschützte Daten prüfen zusätzlich die aktuelle Auth-Sitzung. Eine Pause oder ein abgelaufenes Zugangsdatum sperrt den nächsten Zugriff auf geschützte Daten, auch wenn ein altes JWT noch gültig ist.

- Teilnehmer: eigene Konto- und Zugangsangaben, nach Freischaltung eigene nicht zurückgezogene Nachweise und eigene Übungsdaten.
- Trainer: aktive Berechtigung innerhalb der eigenen Schule; Abschlüsse erfassen und Ergebnisse korrigieren, keine Freischaltungen.
- Admins: zusätzlich Teilnehmer aktivieren/pausieren, Laufzeit setzen und nach erneuter Passwortbestätigung löschen.
- Anonyme Besucher: kein Lesen von Konten, Nachweisen oder Übungsdaten; keine geschützten RPCs.

Atomare Serverbefehle `abbate_record_completion` und `abbate_delete_account` sind öffentliche SECURITY-INVOKER-Wrapper. Ihre privaten Implementierungen prüfen Identität, aktuelle Sitzung, Rolle und Schulzugehörigkeit. Kontolöschung erfordert eine frische Anmeldung (zehn Minuten), entfernt persönliche Zuordnungen, Schulungsverlauf, Übungsdaten und Auth-Identität in einer Transaktion. Von anderen Teilnehmern verwendete Schulungsstammdaten werden nicht gelöscht. Mitarbeiterkonten können nicht über die Teilnehmer-Verwaltung gelöscht werden.

Zugangs- und Ergebniskorrekturen werden in einer privaten Audit-Tabelle protokolliert. Übungsdaten sind ausdrücklich unbestätigt. Clientseitig ermittelte Lernergebnisse werden niemals als bestätigte Prüfung behandelt.

Die Lernoberfläche prüft den Zugang beim Öffnen, beim Zurückkehren in die App und alle 30 Sekunden. Datenbankregeln greifen bei jeder Serveranfrage. Die sechs öffentlich ausgelieferten Beispielfragen sind kein geschützter Bezahlinhalt; echte kostenpflichtige Inhaltskataloge benötigen vor Veröffentlichung zusätzlich serverseitige Auslieferung.

## Noch nötige Konfiguration

1. **E-Mail-Versand:** in Supabase Auth einen eigenen SMTP-Absender konfigurieren. Der Standardversand ist auf Teamadressen beschränkt und nicht für Teilnehmer im Produktivbetrieb geeignet. Versanddomain und SPF/DKIM beim gewählten Anbieter einrichten. Niemals Passwörter/SMTP-Secrets im Repository speichern.
2. **Auth-URLs:** derzeit zeigt `portalUrl` auf `https://cra4zzy.github.io/Andreas-app/dist/konto.html`. Diese URL als Site URL bzw. erlaubtes Redirect-Ziel konfigurieren; zusätzlich bei Verwendung der bestehenden Sites-Adresse deren `/konto.html` freigeben. Vor dem Kartendruck auf die endgültige Kundendomain umstellen. Native Bestätigung/Reset nutzt vorerst die HTTPS-Webansicht, anschließend normale Anmeldung in der App; keine vorgetäuschten Universal Links.
3. **Passwortschutz:** serverseitige Mindestlänge mindestens zwölf Zeichen, geeignete Rate-Limits und gegebenenfalls CAPTCHA konfigurieren. Die Oberfläche verlangt bereits zwölf Zeichen. E-Mail-Bestätigung bleibt aktiviert. Administrativen MFA-Schutz vor echten Teilnehmerdaten entscheiden/einrichten.
4. **Erster Admin:** der vorgesehene Inhaber registriert selbst ein Konto mit eigenem Passwort und bestätigt seine E-Mail. Ein vertrauenswürdiger Betreiber prüft die ausdrücklich freigegebene E-Mail und setzt nur diese Mitgliedschaft auf `admin/active`. Keine automatische Rollenübernahme aus Registrierungsfeldern. Keine Zugangsdaten per Chat sammeln.
5. **Abnahme:** Registrierung, Bestätigung, Reset, Freischaltung, Verlauf und Kontolöschung mit ausdrücklich freigegebenen Konten auf zwei Geräten testen. Dann Inhalte, Datenschutz/Rechtsgrundlagen, Aufbewahrung, Auftragsverarbeitung und Backup-/Wiederherstellungskonzept freigeben.

## Verifiziert und offene Prüfung

Lokal bestehen PostgreSQL/PGlite-Tests zu RLS, Schulgrenzen, Rollenmanipulation, Registrierung als `pending`, Ergebniskorrektur, Pause, abgelaufenem Zugang, widerrufener Sitzung, serverseitiger Ergebniserfassung und Kontolöschung. Cloud-Abfragen bestätigen RLS auf allen öffentlichen App-Tabellen. Anonyme REST-/RPC-Zugriffe werden abgewiesen.

Supabase Security Advisor meldet keine WARN-/ERROR-Funde, jedoch vier erwartete INFO-Hinweise für private Tabellen mit RLS ohne Client-Policies: Registrierungskonfiguration, Audit und alte nicht öffentlich genutzte Freigabetabellen. Diese Tabellen sind nicht in der Data API exponiert, haben keine Browserrechte und bleiben standardmäßig gesperrt. Referenz: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

Authentifizierte Cloud-Ende-zu-Ende-Tests sind **noch offen**. Die automatische Freigabeprüfung lehnte das Erstellen agentengenerierter Cloud-Testkonten einschließlich Adminrechten ab. Es wurden keine solchen Konten erstellt. Diese Grenze wird nicht durch manuelle Auth-Tabellen oder andere Erstellungswege umgangen.

## Primärquellen

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/sessions
- https://supabase.com/changelog/cbc-tls-ciphers-deprecated
