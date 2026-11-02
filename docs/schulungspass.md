# Schulungspass und QR Nachweise

## Stand

`dist/nachweise.html` ist eine separate deutsche Ablaufvorschau mit fiktiven Daten. Sie zeigt den persönlichen Verlauf, die Auswahl einzelner Abschlüsse, einen QR-Code, eine beschränkte Prüfansicht, Ablauf und Widerruf. Freigaben werden nur im Browser gespeichert; sie sind noch nicht geräteübergreifend prüfbar. Es gibt noch keine echte Anmeldung oder produktive API. Die neue Ansicht muss vor Integration in die mehrsprachige App in alle 24 Sprachen übersetzt werden.

`backend/schema.sql` enthält das lokal gegen PostgreSQL geprüfte Datenmodell für Supabase. Es wurde in keinem Cloud-Projekt ausgeführt. Im verbundenen Konto war kein dieser App zugeordnetes Projekt vorhanden.

## Vorgesehener Ablauf

1. Die Fahrschule lädt Teilnehmer ein. Rollen werden ausschließlich serverseitig vergeben.
2. Lernrunden bleiben Übungsergebnisse und erzeugen keinen Schulungsnachweis.
3. Berechtigte Trainer bestätigen tatsächliche Schulungen, Unterweisungen und Prüfungen mit Datum, Kursversion und Referenz. Inhaltliche Korrekturen erfolgen durch Widerruf und Neuausstellung.
4. Teilnehmer sehen den eigenen Verlauf nach Anmeldung. Ein persönlicher QR-Code führt zu diesem angemeldeten Bereich; der Link selbst erteilt keine Rechte.
5. Für Arbeitgeber oder Prüfer wählen Teilnehmer einzelne bestätigte Abschlüsse aus. Der Server erzeugt eine befristete, widerrufbare Freigabe.
6. Die Prüfansicht prüft online Freigabe, Ablauf und Widerruf jedes Abschlusses. Offline kann kein aktueller Status bestätigt werden.

Abschlussdatum und Ablauf des Lernzugangs sind voneinander unabhängig. Ein geplanter Folgetermin ist kein automatisches rechtliches Gültigkeitsversprechen. Welche Nachweise die Fahrschule ausstellt und welche Dokumente zusätzlich erforderlich sind, wird fachlich festgelegt.

## Daten und Berechtigungen

Schulen, Mitgliedschaften, Profile, Kurse und bestätigte Abschlüsse liegen in getrennten Tabellen mit RLS. Teilnehmer können keine Abschlüsse ausstellen oder ihre Rolle ändern. Trainer sehen nur ihre Schule. Ausgestellte Inhalte sind clientseitig nur widerrufbar. Ein eng begrenzter Rollenhelfer liegt außerhalb der exponierten API-Schemas und verwendet keine editierbaren JWT-user_metadata.

Freigaben und deren genaue Auswahl liegen im privaten Schema. Zusammengesetzte Fremdschlüssel verhindern die Freigabe fremder Abschlüsse. Die Browserrollen erhalten keinerlei Tabellenzugriff auf Tokens. Gespeichert wird ausschließlich SHA-256 eines serverseitig erzeugten Tokens aus mindestens 32 zufälligen Bytes.

## Noch zu implementierende API

| Vorgang | Prüfung durch den Server |
| --- | --- |
| Verlauf laden | Anmeldung und eigene `auth.uid()`; Teilnehmer-ID im QR-Code ist keine Berechtigung. |
| Abschluss bestätigen | Vertrauenswürdig vergebene Trainerrolle, richtige Schule, Teilnehmer und fachliche Freigabe. |
| Freigabe anlegen | Anmeldung, Eigentum aller ausgewählten Abschlüsse, bestätigt und nicht widerrufen, höchstens sieben Tage. |
| Freigabe auflösen | Token-Hash, Ablauf, Widerruf und alle ausgewählten Abschlüsse prüfen; nur ausgewählte Titel, Datum, Aussteller und Referenz ausgeben. Name erst nach festgelegtem Freigabekonzept. |
| Freigabe widerrufen | Anmeldung und Eigentum; sofort serverseitig unwirksam machen. |

Die Auflösung benötigt Rate-Limits, eine einheitliche Nicht-verfügbar-Antwort und `Cache-Control: no-store`. Tokens werden aus dem URL-Fragment per POST übermittelt und nicht in Analytics oder Logs geschrieben. Der Service-Key bleibt im Backend. Ein QR-Code identifiziert nicht die vorzeigende Person; erforderliche Identitätskontrolle ist ein eigener Schritt.

Vor Livebetrieb fehlen außerdem Einladungen, Wiederherstellung und Kontolöschung, ein Audit-Protokoll für Ausstellung/Widerruf, Aufbewahrungsregeln, geprüfte Übersetzungen und die Verbindung zu einem eigenen Datenbankprojekt. Die lokale Vorschau ist ausdrücklich kein Sicherheitsmechanismus für echte Teilnehmerdaten.
