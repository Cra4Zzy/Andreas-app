# Abbate-App auf ALL-INKL (eigene Subdomain)

Stand: 2. November 2026. Die Subdomain `app.gabelstaplerfahrschule-andreas.de`
wurde vom Betreiber im KAS angelegt und das Let's-Encrypt-Zertifikat dort
als **aktiv** bestätigt. Ein externer HTTPS-Aufruf, ein Dateiupload und der
vollständige Authentifizierungsablauf sind noch **nicht abgenommen**.

## Ziel

- Website und App-Downloads: `https://app.gabelstaplerfahrschule-andreas.de/`
- Login, Registrierung, Reset: `https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html`
- KAS-Webspace-Ziel: `/gabelstaplerfahrschule-andreas.de/abbate-app/`
- Bestehende Hauptwebsite bleibt unverändert.
- ALL-INKL-Mailpostfach `noreply@gabelstaplerfahrschule-andreas.de` und seine MX/SPF/DKIM-Einträge bleiben unverändert.
- Kein kostenpflichtiges DNS-Upgrade und **keine** GitHub-Pages-CNAME-Umstellung erforderlich.

## Vorbereitung: bereits vom Betreiber durchgeführt

1. In KAS eine Subdomain mit dem vollständigen Namen `app.gabelstaplerfahrschule-andreas.de` angelegt.
2. Ziel `Webspace`; eigenes Verzeichnis `/gabelstaplerfahrschule-andreas.de/abbate-app/` angelegt und zugeordnet.
3. SSL-Schutz über Let's Encrypt beantragt; in KAS als `aktiv` angezeigt.

## Website-Deployment (per GitHub Actions, noch nicht ausgelöst)

Manuell zu startender Workflow:
[Deploy Abbate website to ALL-INKL](https://github.com/Cra4Zzy/Andreas-app/actions/workflows/deploy-allinkl.yml)

Voraussetzungen in **GitHub Repository → Settings → Secrets and variables → Actions**:

**Repository Secrets (niemals in Chat oder Code eintragen):**

- `ABBATE_FTPS_HOST`: FTPS-Server/Host aus KAS → FTP (nicht automatisch die Website-Domain verwenden)
- `ABBATE_FTPS_USER`: zugehöriger FTP-Benutzer
- `ABBATE_FTPS_PASSWORD`: FTP-Passwort

**Wichtig zum Serverpfad:** Im ALL-INKL-KAS ist der neu angelegte FTP-Benutzer auf
`/gabelstaplerfahrschule-andreas.de/abbate-app/` beschränkt. Nach FTP-Login
erscheint dieser Ordner als eigenes Startverzeichnis `/`. Der Workflow lädt
daher gezielt nach `/` **innerhalb dieses beschränkten Kontos** und benötigt
keine zusätzliche Remote-Path-Variable. **Keinen Haupt-FTP-Benutzer verwenden.**
Vor dem ersten Upload kontrollieren, dass das neue FTP-Konto im KAS wirklich
nur für den App-Ordner gilt und Schreibrechte besitzt.

Danach in **Actions → Deploy Abbate website to ALL-INKL → Run workflow**
den Upload von Hand starten. Es erfolgt **kein automatischer Upload**
beim Push.

Der Workflow führt `npm ci`, `npm test` und `npm run build` aus,
packt nur `index.html`, `downloads.json` und `dist/` und lädt
sie per explizitem TLS/FTPS über `lftp` hoch. Ein Artefakt als
manuelle Upload-Alternative wird ebenfalls erzeugt. Keine Löschung
auf dem Remote-Server. Keine Repository-Secrets im öffentlichen Webspace.

Verfügbarkeit anschließend prüfen:
- `https://app.gabelstaplerfahrschule-andreas.de/`
- `https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html`
- `https://app.gabelstaplerfahrschule-andreas.de/downloads.json`

## Supabase Auth nach erfolgreichem HTTPS-Upload

Im Projekt Abbate Lernraum:
**Authentication → URL Configuration**.

- Site URL: `https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html`
- Redirect URLs: diese neue URL und zur Übergangszeit die bisherige
  `https://cra4zzy.github.io/Andreas-app/dist/konto.html`.
- E-Mail-Templates und eventuell fest eingetragene URL-Ziele überprüfen.
- Anmelden, Bestätigen, Zurücksetzen, wiederholten Reset-Link und Abmelden
  mit frischen Testkonten in privaten Fenstern und der Desktop-App prüfen.

`dist/backend-config.js` verwendet die neue Portal-URL nur dann, wenn
die App unter dem neuen HTTPS-Host läuft. Bereits installierte Desktop-
und Mobile-Builds sind weiterhin gesondert zu aktualisieren.
Ein Domainwechsel allein löst keine Auth-/Token-Probleme.

## Hinweise und Sicherheit

ALL-INKL unterstützt explizite FTPs-Verbindungen über SSL/TLS:
https://all-inkl.com/wichtig/faq

Ein FTP-Konto für die App sollte nach Möglichkeit auf deren Verzeichnis
beschränkt sein. Keine globalen FTP-Passwörter in Chatnachrichten eingeben.
Den Workflow erst auslösen, wenn die FTP-Wurzel und das richtige Ziel
klar sind. Nicht `/gabelstaplerfahrschule-andreas.de/` als Ziel verwenden.

## Checkliste

- [x] Subdomain in KAS erstellt
- [x] SSL in KAS als aktiv bestätigt
- [ ] Neue Subdomain extern mit gültigem HTTPS erreichbar
- [ ] Abgetrenntes FTP-Konto/Pfad bestätigt und GitHub-Secrets hinterlegt
- [ ] GitHub Actions Deployment erfolgreich
- [ ] Startseite und Konto-Seite über neue Adresse erreichbar
- [ ] Supabase Redirect URLs nachgezogen
- [ ] Passwort-Reset, bestehender Login, abgelaufener Link sicher geprüft
- [ ] Desktop-Installer und Mobile-App-Links auf neuer Domain überprüft
