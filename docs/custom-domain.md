# Eigene App-Domain vorbereiten (ALL-INKL + GitHub Pages + Supabase)

Stand: 2. November 2026. **Technisch vorbereitet, DNS und Websitezuordnung noch nicht bestätigt.**
Kein bestehender E-Mail-, Domain- oder Websiteeintrag wurde geändert.

## Zieladressen

| Zweck | Adresse |
| --- | --- |
| Bestehende Website, bleibt unberührt | `https://gabelstaplerfahrschule-andreas.de/` |
| Neue App-Landingpage | `https://app.gabelstaplerfahrschule-andreas.de/` |
| Login, Bestätigung, Passwort-Reset | `https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html` |
| GitHub Pages DNS-Ziel | `cra4zzy.github.io.` |

## Schritt 1 – ALL-INKL KAS (vom Domaininhaber)

In **Tools → DNS-Einstellungen** die Domain
`gabelstaplerfahrschule-andreas.de` öffnen.

Zuerst prüfen, ob bereits ein Record mit Namen `app` existiert. Wenn nicht,
**Neuen DNS-Eintrag erstellen**:

| ALL-INKL-Feld | Wert |
| --- | --- |
| Name | `app` |
| Typ | `CNAME` |
| Prio | `0` |
| Data | `cra4zzy.github.io.` |

Abschließenden Punkt bei Data nicht vergessen. Keine Änderungen an `@`,
`www`, MX, SPF, DKIM oder anderen Records vornehmen. Wenn ein `app`-Record
existiert, vor einer Änderung dessen Zweck überprüfen.

Bei ALL-INKL kann es 3–4 Stunden dauern, bis DNS propagiert ist:
https://all-inkl.com/wichtig/anleitungen/providerwechsel/einrichtung/dns/cname_178.html

## Schritt 2 – GitHub Pages

Repository: https://github.com/Cra4Zzy/Andreas-app/settings/pages

- Unter **Custom domain** den Wert
  `app.gabelstaplerfahrschule-andreas.de` eintragen und **Save** wählen.
- Bei Branch Publishing schreibt GitHub gewöhnlich automatisch eine
  `CNAME`-Datei in den Publish-Branch. Eine manuell vorweg erstellte CNAME
  kann die bisherige GitHub Pages-Adresse früher als erwünscht umstellen:
  deshalb ist sie noch nicht committed.
- DNS-Check und Zertifikat abwarten und anschließend **Enforce HTTPS**
  aktivieren.
- Beide Seiten im privaten Browserfenster testen: Root-Seite und
  `/dist/konto.html`.

Dokumentation:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Schritt 3 – Supabase (erst wenn HTTPS auf der App-Domain funktioniert)

Projekt **Abbate Lernraum** → Authentication → URL Configuration.

- **Site URL:** `https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html`
- **Redirect URLs:** Diese neue URL UND vorübergehend
  `https://cra4zzy.github.io/Andreas-app/dist/konto.html` erlauben.
- Vorhandene E-Mail-Vorlagen und ihre `.SiteURL`/`.RedirectTo`-Verwendung
  auf das neue Ziel prüfen; nur auf die neue Domain verweisen, wenn sie
  wirklich erreichbar ist.
- Mit frischem Testkonto Registrierung, Bestätigung, Passwort-Reset,
  erneute Anmeldung und wiederverwendeten Reset-Link testen.

Die Applikation in `dist/backend-config.js` erkennt den neuen HTTPS-Host
und benutzt daraufhin automatisch die neue Rücksprung-URL; auf der alten
GitHub-Domain bleibt die vorhandene Pilot-URL. Bereits installierte native
Apps enthalten ihre alten Webassets und brauchen nach der Domainumstellung
bei Bedarf einen neuen Release.

**Hinweis:** Ein neues Domainziel allein behebt keine fehlerhafte
Authentifizierungslogik. Der Reset-Link-Fix muss nach Deployment auch real
mit einem Einmal-Link getestet werden. E-Mail-Versand und DNS-Einträge für
`noreply@gabelstaplerfahrschule-andreas.de` bleiben unverändert.

## Freigabe-Checkliste

- [ ] KAS-DNS-CNAME korrekt gesetzt (keine bestehenden Records überschrieben)
- [ ] GitHub Pages Custom Domain gesetzt
- [ ] HTTPS aktiv und die bestehende Website unverändert erreichbar
- [ ] Supabase-Redirects und Site URL hinterlegt
- [ ] Registrierungs- und Reset-Mails zeigen auf den neuen Host
- [ ] Ablauf mit frischem + erneut verwendetem Reset-Link bestanden
- [ ] Download-Links, Schulungspass, QR-Code und Desktop-App abgeprüft
