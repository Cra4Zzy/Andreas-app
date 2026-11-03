# Abbate Lernraum — Abnahme mit Andreas (Testbetrieb)

**Stand:** 3. November 2026  
**Teststatus:** noch **nicht** mit echten Testanmeldungen auf Endgeräten durchgeführt. Diese Liste dient der dokumentierten gemeinsamen Abnahme, nicht als Behauptung, dass die Tests bestanden wurden.

## 1. Vorab abstimmen

- [ ] Ziel: Lern-App mit Prüfungssimulation **oder** verbindliche Theorieabschlussprüfung? Eine reine Simulation darf keine verbindliche Prüfung erzeugen.
- [ ] Schulungsarten: nur Gabelstapler oder zusätzlich Kran/Bagger/etc.?
- [ ] Endgültige fachlich freigegebene Fragen, Antworten, Erklärungen und Übersetzungen durch Andreas bereitstellen.
- [ ] Kaufvertrag: Privat/Arbeitgeber, tatsächlicher Abschlussweg (vor Ort/Telefon/E-Mail), 30-Tage-Preis, Umsatzsteuerangaben, Quittung/Rechnung und Widerrufsabwicklung bestimmen.
- [ ] Rechtstext-/Aufbewahrungsfragen inklusive ggf. Schulungsnachweisen, AVV und Impressum prüfen und freigeben.

## 2. Andreas' Zugriff (sichere Anlage)

**Keine fremden Passwörter im GitHub, Chat oder in E-Mails sammeln.** Andreas soll sein persönliches Konto selbst mit eigener E-Mail und sicherem Passwort registrieren und die E-Mail bestätigen:
https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html

Derzeit ist im Supabase-Projekt **ein aktives Admin-Konto** und **kein Lernendenkonto** vorhanden (Stand der Prüfung). Ob das bestehende Admin-Konto tatsächlich Andreas gehört, wurde **nicht** anhand einer Identität bestätigt. Nicht einfach bestehende Konten überschreiben oder fremde Konten zu Administratoren erheben.

- [ ] Bestehendes Admin-Konto gemeinsam mit Andreas zuordnen; prüfen, ob er selbst bereits einen Zugang besitzt
- [ ] Sofern nötig: Konto von Andreas selbst registrieren und E-Mail bestätigen lassen
- [ ] Erst nach Bestätigung durch Andreas die konkrete Nutzerkennung mit einer Adminrolle verbinden; keine automatische Rollenübernahme
- [ ] Administratoren dürfen ohne beabsichtigtes Ablaufdatum arbeiten; Teilnehmer beginnen als `pending`
- [ ] Für den Schülertest eine **separate, ausdrücklich zugelassene Test-E-Mail** nutzen
- [ ] Testkonto nur mit bekanntem Teststatus versehen; keine fiktiven amtlichen Prüfungsergebnisse eintragen

## 3. Funktionale End-to-End-Tests (am besten Desktop + Smartphone)

- [ ] Registrierung mit leerem AGB-Häkchen muss verhindert werden
- [ ] AGB akzeptieren und Registrierung starten; gespeicherte Version und Zeitstempel prüfen
- [ ] E-Mail-Bestätigung führen und mit registriertem Konto anmelden
- [ ] Anmeldung mit falschem Passwort scheitert
- [ ] Passwortreset per E-Mail, Änderung und Neuanmeldung funktionieren
- [ ] Gebrauchten/abgelaufenen Recovery-Link erneut öffnen — darf keine bestehende Sitzung als gültigen Reset akzeptieren
- [ ] Schüler bleibt nach Kontoanlage bis Freischaltung gesperrt
- [ ] Admin bestätigt **simulierten Zahlungsnachweis** im Test; manuell für 30 Kalendertage freischalten
- [ ] Gebuchter Zeitraum und Gültigkeit bis einschließlich letztem Tag prüfen
- [ ] Kein automatischer Neuvertrag oder Einzug nach Ablauf
- [ ] Erneute manuelle Freischaltung um 30 Tage erhöht Restlaufzeit korrekt
- [ ] Pause unterbindet Zugang; das vertragliche Enddatum wird dabei nicht automatisch verschoben
- [ ] Lernrunde starten, Beantwortung und Persistenz auf zweitem Gerät prüfen
- [ ] Übungsergebnis wird **nicht** als offizieller Schulungsnachweis gespeichert
- [ ] Trainer dokumentiert nur eine tatsächlich durchgeführte Schulung; Schüler sieht ausschließlich eigenen Nachweis
- [ ] Rollenrechte: Teilnehmer kann keine fremden Daten oder Adminfunktionen lesen
- [ ] Rechtelinks auf Start, Registrierung, Schulungspass, Verwaltung und in Lern-App prüfen
- [ ] Cookie- und Browserdaten nicht mit Auth-Token in URLs/Logs versehentlich offenlegen
- [ ] DSGVO-Kontolöschung gegen echte Aufbewahrungspflichten abnehmen, **bevor** sie mit realen Prüfungsnachweisen verwendet wird

## 4. Visuelle Qualitätssicherung

- [ ] Windows: Chrome und Edge, Breite 1280–1920 px
- [ ] macOS: Safari und Chrome
- [ ] iPhone: Safari, schmale 375 px Ansicht, Safe Areas, Tastatur und Scrollen
- [ ] Android: Chrome, schmale 360 px Ansicht und Home-Screen-PWA
- [ ] Touch-Ziele, Fokus, Kontrast, Formfehler, Ladezustände und Langtexte
- [ ] AGB/Hinweise auf allen Geräten lesbar, keine überflüssigen Download-/Pilot-Banner
- [ ] Keine irreführenden Store-/Installations-Buttons zu unveröffentlichten Releases

## 5. Veröffentlichung

**Web-App für ersten internen Abnahmetest:** nach gemeinsamem End-to-End-Test geeignet.  
**Bezahlter Kundenbetrieb:** erst nach inhaltlicher und rechtlicher Freigabe, Backup-/Sicherheitstest und Abnahme.  
**App Stores und signierte Desktop-App:** eigene Veröffentlichungsschritte mit Eigentümerkonten, Signing und realen Endgerätetests; bisher **nicht** als Store-Produkt verfügbar.

## Abnahmeprotokoll

- Andreas: [ ] Ja, als Schulungsanbieter freigegeben [ ] noch Änderungen
- Technische Abnahme: [ ] Ja [ ] noch Änderungen
- Fragenkatalog: [ ] Geprüft [ ] fehlt
- Rechts-/Datenschutzunterlagen: [ ] Freigegeben [ ] offen
- Datum, getestete Build-Version, Prüfer: ______________________
