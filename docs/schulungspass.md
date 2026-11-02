# Konten, gemeinsamer Karten-QR und Schulungsverlauf

## Vereinbarter Ablauf

Alle Fahrausweise erhalten denselben QR-Code zur endgültigen Portaladresse. Der Code identifiziert keine Person und erteilt keine Berechtigung. Das angemeldete Benutzerkonto bestimmt den eigenen Verlauf. Ein bestehender gültiger Login kann direkt zu „Meine Schulungen“ führen; sonst erscheint die Anmeldung.

Neue Teilnehmer registrieren sich selbst. In der zentralen Verwaltung sieht Andreas alle Konten seiner Schule, einschließlich neuer Registrierungen mit Status „Wartet auf Freischaltung“. Er kann den Zugang manuell nach Zahlungsprüfung aktivieren, eine Laufzeit setzen und ihn pausieren. Pausieren bewahrt sämtliche Einträge, sperrt aber den Zugang. Löschen ist eine getrennte, bestätigungspflichtige Aktion.

Andreas bzw. berechtigte Trainer erfassen tatsächlich durchgeführte Schulungen, Unterweisungen und Prüfungen mit Titel, tatsächlichem Datum und Ergebnis. Ergebnisse sind „Teilgenommen“, „Bestanden“ und „Nicht bestanden“. Für eine Prüfung sind ausschließlich die letzten beiden möglich. Nicht bestandene Prüfungsversuche bleiben Teil des Verlaufs. Künftige Termine und nicht besuchte Schulungen gehören nicht hinein. Übungsrunden der Lern-App werden nicht automatisch zu bestätigten Nachweisen.

Teilnehmer sehen ausschließlich ihre eigenen Einträge und können keine Konten, Freischaltungen oder Ergebnisse bearbeiten. Eine Ergebniskorrektur durch Mitarbeiter wird protokolliert. Die Seite ist ausdrücklich kein automatisches rechtliches Gültigkeitsversprechen.

## Funktionsvorschau

- `dist/konto.html`: gemeinsame Eingangsseite; simulierte Registrierung und Demo-Anmeldung mit fiktiver E-Mail-Adresse, ohne Passwort.
- `dist/verwaltung.html`: alle Demo-Konten, Suche und Statusfilter; Aktivieren, Pausieren, Ablaufdatum, bestätigter Löschdialog; Ergebnisse erfassen und ändern; gemeinsamer QR-Code als PNG.
- `dist/nachweise.html`: reine Leseansicht des in der Portal-Demo gewählten Kontos; noch nicht freigeschaltete, pausierte oder abgelaufene Konten sehen eine Statusseite.
- `dist/konten-model.js`: gemeinsames Demo-Datenmodell; verwendet denselben Browser-Speicher wie die Lern-App und übernimmt bestehende Demo-Teilnehmer.

Die Vorschau hat **keine echte Authentifizierung oder produktive Datenbank**. Die öffentliche Verwaltungsdemo darf ausschließlich fiktive Daten enthalten. Ihre Session-Kennung und Browser-Prüfungen sind kein Schutz für echte personenbezogene Daten. Registrierung und Verwaltung lassen sich in mehreren Tabs desselben Browsers ausprobieren; Änderungen werden über Browser-Speicher synchronisiert. Geräteübergreifender Betrieb fehlt. Vor dem Kartendruck ist der Demo-Link durch die endgültige Portaladresse zu ersetzen.

## Datenbankvorbereitung

`backend/schema.sql` und anschließend `backend/accounts.sql` sind Entwürfe für ein eigenes Supabase-Projekt; sie wurden nur lokal in PostgreSQL/PGlite getestet und nicht in der Cloud ausgeführt.

Die Erweiterung legt neue Registrierungen serverseitig stets als `learner` mit `pending` an. Die Schule stammt aus `abbate_private.registration_settings`, niemals aus vom Benutzer editierbaren Metadaten. Vor Freigabe der Registrierung muss ein vertrauenswürdiger Betreiber die Schule eintragen und Andreas’ Konto als aktiven Admin einrichten. Bestehende Rollen werden durch die neue Erweiterung nicht automatisch aktiv geschaltet.

RLS und Spaltenrechte trennen Konten, Schulen und Aktionen. Nur aktive Admins können den Zugang von Teilnehmerkonten ändern. Aktive Trainer dürfen bestätigte Ergebnisse erfassen bzw. korrigieren, jedoch keine Konten aktivieren. Teilnehmer können sich keine Rechte oder Ergebnisse geben. Die Datenbank liest den aktuellen Zugangsstatus bei Anfragen, sodass eine Pause nicht auf die Erneuerung eines JWT warten muss. Zugangs- und Ergebniskorrekturen werden in einer privaten Audit-Tabelle erfasst.

## Vor echtem Betrieb noch erforderlich

Echte Registrierung mit E-Mail-Bestätigung, Anmeldung, Passwortwiederherstellung, vertrauenswürdige Admin-Einrichtung und API-Anbindung fehlen. Die öffentliche Demo-Verwaltung muss durch echte serverseitige Autorisierung ersetzt werden. Das bestehende Datenbankprojekt ist noch nicht festgelegt.

Kontolöschung muss über einen ausschließlich serverseitigen Admin-Endpunkt erfolgen: aktuelle Adminberechtigung und Schulzugehörigkeit prüfen, Zielsitzungen widerrufen, Abhängigkeiten und Aufbewahrung klären, Daten entsprechend entfernen und die Auth-Löschung bestätigen. Der Browser darf weder einen Service-Key erhalten noch direkt Auth-Konten löschen. Ein Zahlungsverzug ist zunächst eine manuelle Pause; es ist keine Zahlungsanbieter- oder automatische Mahnanbindung enthalten.

Zusätzlich fehlen fachlich geprüfte Übersetzungen der neuen Ansichten, Datenschutz-/Aufbewahrungsregeln und Tests mit echten Konten und mehreren Geräten. Android-/iOS-Projekte sind vorbereitet, aber diese Änderung erzeugt keine signierten Store-Builds.
