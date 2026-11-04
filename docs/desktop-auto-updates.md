# Abbate Desktop-Updates – ohne kostenpflichtige Zertifikate

Stand: 4. November 2026. Zwei Ebenen sind zu unterscheiden: **Live-Frontend funktioniert ohne Signierschlüssel**; die **native Binär-Aktualisierung mit Tauri ist implementiert, benötigt jedoch einen einmalig selbst erzeugten kostenlosen kryptografischen Schlüssel**.

## 1. Automatische Lern- und Design-Updates: kostenlose Desktop-Installer

Die Windows-/Mac-Testinstaller werden ab Version **0.1.1** mit der URL
`https://app.gabelstaplerfahrschule-andreas.de/dist/` gebaut. Hierdurch nutzen diese Desktop-Versionen das online bereitgestellte Frontend statt einer eingefrorenen Kopie aus dem Installer. Änderungen an Design, Fragen, Übersetzungen, JavaScript und Lernbereichen werden beim nächsten Laden/Neustart der App vom Server bezogen. **Keine neue .exe/.dmg wegen gewöhnlicher Frontend-Änderungen.**

Die **iPhone-/Android-PWA** aktualisiert sich unabhängig davon ebenfalls über den Webserver. Eine Internetverbindung ist für Login, Zugangsprüfung und Online-Lernstände erforderlich; keine vollwertige Offlinefunktion versprechen.

Die alte lokal gebündelte Desktop-Version **0.1.0** kann nicht nachträglich automatisch auf den neuen Online-Modus umgestellt werden. Vorhandene Desktop-Testnutzer müssen die neue **0.1.1** einmal manuell installieren. Die bestehende Vorschau-Bundle-ID `de.abbate.lernraum.desktop.preview` bleibt für diesen Übergang gleich. Downloadlinks werden erst nach **erfolgreichen Windows- und Mac-Builds** aktualisiert.

Die öffentlich sichtbare Downloadseite zeigt die spezielle Kennzeichnung `Lerninhalte und Design aktualisieren sich ...` auf Desktop-Karten nur, wenn der Releasejob über `downloads.json.desktopLiveFrontend` bestätigt, dass beide Pakete mit Remote-Frontend gebaut wurden.

## 2. Native Desktop-Programmupdates: Tauri-Updater mit GRATIS-Schlüssel

Wenn wir **Rust-Code, native Bibliotheken oder Installer-Einstellungen** verändern, ist ein echtes Desktop-Update erforderlich. Der Updater ist bereits technisch vorhanden:

- `src-tauri/src/main.rs`: sucht beim Programmstart nach einer höheren signierten Version, lädt sie und installiert sie nach Signaturprüfung.
- `src-tauri/Cargo.toml`: Feature `desktop-auto-update` für updatefähige Releases, in Pilot-Installern deaktiviert.
- `src-tauri/tauri.stable.conf.json`: separate Release-App-ID, Version und `createUpdaterArtifacts: true`.
- `.github/workflows/desktop-updates.yml`: manuell auslösbarer Workflow für Windows und Mac. **Keine Apple-/Windows-Kaufzertifikate erforderlich.**
- `scripts/make-desktop-update-feed.cjs`: erstellt aus den echten signierten Updatepaketen die `latest.json` für GitHub Releases.
- Release-Kanal: `https://github.com/Cra4Zzy/Andreas-app/releases/download/desktop-update-feed/latest.json`.

**Tauri fordert kryptografische Update-Signaturen zwingend.** Sie sind kostenlos und nicht mit Windows SmartScreen oder Apple Developer-ID-Zertifikaten identisch. Die Signaturprüfung darf nicht abgeschaltet werden. Ohne eingerichteten Schlüssel dürfen wir **nicht** behaupten, dass native Updates auf ausgelieferten Installern funktionieren.

### Einmaliger Schritt für den kostenlosen Schlüssel

Auf einem vertrauenswürdigen Rechner:

```sh
npx --yes @tauri-apps/cli@2.12.4 signer generate -w abbate-updater.key
```

Der Befehl erzeugt **lokal und kostenlos** eine private `abbate-updater.key` sowie öffentliche `abbate-updater.key.pub`-Datei. Den privaten Schlüssel und die Passphrase nicht im Repository, Chat, Mail oder öffentlichen Upload speichern. Er muss sicher aufbewahrt werden, damit künftige App-Updates weiter signiert werden können.

Dann im GitHub-Repository unter **Settings → Secrets and variables → Actions** einrichten:

- **Variable** `ABBATE_UPDATER_PUBLIC_KEY`: Inhalt der `abbate-updater.key.pub`.
- **Secret** `TAURI_SIGNING_PRIVATE_KEY`: Inhalt der privaten `abbate-updater.key`.
- **Secret** `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: die beim Erzeugen gewählte Passphrase (wenn vorhanden).

Anschließend über **Actions → Abbate desktop updater (free key, no paid certificates) → Run workflow** für die Version aus `src-tauri/tauri.stable.conf.json` einen Release bauen. Der Releasejob verlangt vollständige Pakete für beide Systeme. Er veröffentlicht zunächst die versionierten .exe/.dmg/.sig-Dateien und erst danach das aktualisierte `latest.json`-Manifest.

**Für jede spätere native Änderung die Versionsnummer erhöhen.** Automatische native Updates finden nur statt, wenn der Installer mit dem kostenlosen, unveränderlichen Update-Schlüssel gebaut wurde. Bestehende alte Testinstaller können sich nicht selbst nachrüsten.

### Einschränkungen ohne bezahlte Betriebssystem-Zertifikate

- **Windows:** Ohne Betriebssystem-Code-Signing-Zertifikat kann SmartScreen beim Installer weiterhin warnen.
- **Mac:** Ohne Apple Developer-ID und Notarisierung kann Gatekeeper die heruntergeladene DMG blockieren oder vor dem Öffnen warnen. Das ist unabhängig von der kostenlosen Tauri-Update-Signatur und darf dem Nutzer nicht als sicher funktionierende Standardinstallation versprochen werden.

Es sind bewusst **keine** Apple-Developer-Zugangsdaten oder Kaufzertifikate für den Tauri-Releaseworkflow mehr erforderlich. Eine Sicherheitsprüfung/Abnahme auf echten Geräten bleibt zwingend.

## Vor realem Desktop-Launch testen

- [ ] Windows-/Mac-Testversion **0.1.1** auf echten Rechnern installieren, Remote-Frontend, Supabase Login, Logout, Reset und Rechte prüfen.
- [ ] App-Frontend verändern, Website deployen, Desktop-App neu starten und Änderung **ohne neue Installation** beobachten.
- [ ] Tauri-Schlüssel kostenlos erzeugen und als GitHub Actions Secret/Variable sicher einrichten.
- [ ] Signierte native **0.2.0** installieren und dann **0.2.1** veröffentlichen; Update auf beiden Systemen durchlaufen lassen.
- [ ] Manipulierte .sig-Datei muss vom Updater abgelehnt werden.
- [ ] Während Lern- und Prüfungsrunden keine unerwarteten Neustarts: Update-Verhalten auf langsamer Verbindung testen und bei Bedarf einen nutzerbestätigten Neustart ergänzen.
- [ ] Mac Gatekeeper und Windows SmartScreen ohne Zertifikate auf den Zielgeräten prüfen.
- [ ] Bei Server- oder Update-Kanal-Ausfall normale Anmeldung und sichere Fehlermeldungen kontrollieren.
- [ ] Erst nach Abschluss dieser Tests automatische **native** Programmupdates als freigegeben bezeichnen.

## Herstellerdokumentation

- https://v2.tauri.app/plugin/updater/
- https://v2.tauri.app/reference/config/#buildconfig


## Verifizierbarer Web-Updatekanal ab Desktop-Vorschau 0.1.2

Die Webversion erhält bei **jedem erfolgreichen Deployment** die Git-Commit-ID im HTML und in `/dist/build-info.json`. Der neue Client `/dist/frontend-updates.js` vergleicht diese Version ohne Cache und lädt eine veraltete HTML-Seite mit eindeutigem Cache-Buster neu. Während Prüfungsrunden, in offenen Dialogen, bei ausgefüllten Formularen und bei Auth-/Reset-Callbacks erscheint stattdessen eine Schaltfläche für einen kontrollierten Neustart der Oberfläche. Auch bei Netzwerkausfall bleibt die Sitzung benutzbar.

Der ALL-INKL-GitHub-Workflow verwendet `lftp mirror --transfer-all` statt `--only-newer` und vergleicht nach dem FTPS-Upload die tatsächlichen HTTPS-Dateien und die Build-ID. **Erst ein grüner Verifikationsschritt bedeutet: Die neue Webversion ist tatsächlich online.**

Wichtige Einschränkungen:

- Der alte lokal gebündelte Desktop-Installer **0.1.0** kann weder den Server-Webclient noch den nativen Updater nachträglich laden. Für den Übergang ist eine einmalige manuelle Installation von mindestens **0.1.2** erforderlich.
- Auch die **0.1.2-Testinstaller** verwenden für Webinhalte den Server und besitzen noch keinen aktivierten nativen Tauri-Updater. Für native Programmupdates muss später die erste signierte **0.2.0** installiert werden.
- Zum Schutz der bisherigen Installation verwendet der signierte 0.2.0-Kanal dieselbe App-ID wie die Vorschau; ein späterer Wechsel der App-ID benötigt einen ausdrücklichen Migrationsplan.
- Die vorhandenen Signierschlüssel müssen vor einem echten Tauri-Updater-Release **einmalig auf einem vertrauenswürdigen Rechner erstellt und in GitHub Actions hinterlegt** werden. Der private Schlüssel darf nie in GitHub-Code, Chat oder ein öffentliches Downloadverzeichnis gelangen.
- Ohne erfolgreich gebauten, signierten Installer und E2E-Test ist der native Updater **nicht produktiv freigegeben**.

Testabfolge: Erst das entfernte „Nur ansehen“-Badge im **Online-Schulungspass** nach grünem Deploy prüfen; dann die **0.1.2-Testversion** installieren, schließen, mit nachfolgender kleiner Webänderung neu starten und denselben Test durchführen.
