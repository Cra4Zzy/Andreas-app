# Abbate Desktop: sichere automatische Updates (Tauri 2)

Stand: 4. November 2026 · Technik implementiert, **Produktionsfreigabe noch ausstehend**.

## Zwei Update-Wege – ohne Neuinstallation für normale Änderungen

**Website- und Lerninhalte:** Die künftige stabile Windows-/Mac-App lädt das Abbate-Frontend direkt via HTTPS von `https://app.gabelstaplerfahrschule-andreas.de/dist/`. Dadurch werden Designs, Texte, JavaScript, Übersetzungen und live synchronisierte Lerninhalte beim erneuten Aufrufen **automatisch vom Server übernommen**. Für solche Änderungen müssen **keine neuen Desktop-Installer** gebaut werden. Das setzt einen erreichbaren Webserver voraus und unterscheidet sich vom alten Pilot-Installer, der HTML/JS lokal enthielt.

**Programm-/Runtime-Änderungen:** Für Änderungen am Tauri-Fenster, Rust-Code, native Sicherheitseinstellungen oder Bibliotheken ist weiterhin der **signierte native Updater** zuständig. Die Erstinstallation der neuen stabilen Version ist deshalb einmalig erforderlich. Der private Signierschlüssel und die Mac-Notarisierung sind noch nicht eingerichtet.

Die remote geladene Website erhält **keine zusätzlichen lokalen Tauri-Berechtigungen**; die `src-tauri/capabilities/default.json` schaltet keine `remote`-Domain für IPC frei. Supabase-Anmeldung und serverseitige Rollen bleiben unverändert.

## Was nach der einmaligen Einrichtung passiert

Eine **updatefähige Desktop-App** prüft bei jedem Programmstart das Update-Manifest unter:

`https://github.com/Cra4Zzy/Andreas-app/releases/download/desktop-update-feed/latest.json`

Wenn darin eine höhere Version für Windows x64 bzw. macOS Universal vorliegt, lädt Tauri das signierte Paket herunter, **prüft automatisch dessen kryptografische Tauri-Updater-Signatur** und installiert die neue Version. Anschließend startet die App neu. Ohne Netzwerk oder ohne neue Version öffnet sich die vorhandene Installation weiterhin. Die Prüfung erfolgt bewusst **nur beim Start**, nicht im Hintergrund mitten in einer längeren Lern- oder Prüfungsrunde. Bei langsamem Download kann der Neustart allerdings nach Beginn der Nutzung erfolgen; daher **mit realen Schülerkonten testen und ggf. einen nutzerbestätigten Neustart ergänzen**, bevor der Updater produktiv freigegeben wird.

Die **PWA für iPhone/Android** und das **Live-Frontend der stabilen Desktop-Version** werden über denselben Webserver aktualisiert: Nach erneutem Laden/Start werden geänderte Website-Dateien und Inhalte vom Server bezogen. Kein natives App-Store-Update notwendig.

## Warum wir alte Pilot-Installer nicht einfach fernaktualisieren können

Die alten Windows-/Mac-Pilotinstaller enthalten **noch keinen Updater**. Sie können nicht nachträglich automatisch umgerüstet werden. **Jeder bestehende Pilot-Nutzer muss die erste updatefähige Release-Version einmal manuell installieren.** Der stabile Build bekommt die endgültige Produkt-ID `de.abbate.lernraum.desktop`; beim Wechsel von der bisherigen `.preview`-ID muss auch das Verhalten der vorhandenen Installations- und Anmeldedaten auf Windows/Mac geprüft werden.

## Quellcode und Sicherheitsmodell

- `src-tauri/src/main.rs`: signierte Update-Prüfung und Installation bei Programmstart.
- `src-tauri/Cargo.toml`: optionales Feature `desktop-auto-update`; in alten Piloten standardmäßig ausgeschaltet.
- `src-tauri/tauri.stable.conf.json`: endgültige Desktop-ID, Release-Version, `createUpdaterArtifacts: true`.
- `scripts/make-desktop-update-feed.cjs`: erstellt `latest.json` aus tatsächlich signierten `.sig`-Dateien.
- `.github/workflows/desktop-updates.yml`: MANUELL auslösbarer Freigabeworkflow für Windows und Mac, mit Secret-Prüfung und macOS-Notarisierung.
- Versionspakete liegen unter **unveränderlichen Release-Tags** wie `desktop-v0.2.0`; der Kanal `desktop-update-feed` erhält nur ein neues `latest.json`, **nachdem** beide Plattform-Downloads veröffentlicht sind.

**Kein privater Schlüssel im Repository oder in dieser Dokumentation.** Das Updateverfahren mit Tauri-Signatur darf nicht mit der Betriebssystem-Codesignatur verwechselt werden: Für den Mac muss zusätzlich eine Apple-Developer-ID-Signatur und Notarisierung erfolgen. Für Windows ist die OS-Code-Signatur empfehlenswert, um SmartScreen-Warnungen zu reduzieren.

## Einmalige Einrichtung beim Betreiber (Andreas / Entwicklerzugang)

1. **Tauri-Updater-Schlüsselpaar auf einem vertrauenswürdigen Rechner erzeugen:**

   ```sh
   npx --yes @tauri-apps/cli@2.12.4 signer generate -w ~/.tauri/abbate-updater.key
   ```

   Den **privaten Schlüssel** `abbate-updater.key` und seine Passphrase sicher außerhalb des Repositories (z. B. Passwortmanager und Backup) aufbewahren; **nicht per Chat oder E-Mail weiterreichen**. Den öffentlichen Schlüssel aus `abbate-updater.key.pub` verwenden. Wenn der private Schlüssel verloren geht, lassen sich vorhandene Installationen mit dieser Vertrauenskette nicht mehr aktualisieren.

2. Im Repository unter **Settings → Secrets and variables → Actions** anlegen:
   - **Repository variable** `ABBATE_UPDATER_PUBLIC_KEY`: kompletter Inhalt der `.pub`-Datei (öffentlich, einschließlich Kopfzeile).
   - **Secret** `TAURI_SIGNING_PRIVATE_KEY`: kompletter Inhalt des privaten Update-Schlüssels.
   - **Secret** `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: festgelegte Passphrase (falls verwendet).

3. Für **macOS Developer-ID-Signatur und Notarisierung** außerdem vom Apple-Konto des Betreibers bereitstellen:
   - `APPLE_CERTIFICATE`: base64-kodiertes exportiertes **Developer ID Application**-P12.
   - `APPLE_CERTIFICATE_PASSWORD`: Passwort der P12-Datei.
   - `KEYCHAIN_PASSWORD`: zufälliges temporäres CI-Keychain-Passwort.
   - `APPLE_ID`: Apple-Account-E-Mail.
   - `APPLE_PASSWORD`: **app-spezifisches** Apple-Passwort (nicht das normale Kontopasswort).
   - `APPLE_TEAM_ID`: Apple Developer Team ID.

   Diese Daten als **GitHub Actions Secrets** anlegen. Sie sind noch nicht eingerichtet oder verifiziert. Ein kostenpflichtiges Apple Developer Program kann nötig sein, auch ohne App Store, wenn eine öffentlich notarisiert verteilte Mac-DMG vorgesehen ist.

4. Für die **erste Release-Version** `0.2.0` in `src-tauri/tauri.stable.conf.json` verwenden. Bei jeder weiteren Veröffentlichung **SemVer erhöhen**, z. B. `0.2.1`. Dieselbe Versionsnummer darf nicht erneut für veränderte Dateien verwendet werden.
5. In GitHub **Actions → Abbate signed desktop auto-updates → Run workflow** bewusst manuell auslösen. Der Workflow führt Tests aus, baut Signaturpakete, prüft Mac-Notarisierung, lädt beide Versionen hoch, aktualisiert anschließend den Updatekanal und **erst danach** die beiden Downloadlinks.
6. Für den allerersten Launch Windows und Mac lokal installieren. Die veröffentlichten Installer müssen im Browser und im Betriebssystem mit echten Benutzerkonten getestet werden.

## Unverzichtbare End-to-End-Abnahme

- [ ] Fehlende Secrets müssen den Release-Workflow sicher stoppen.
- [ ] Windows-/Mac-Installer auf echten Geräten installieren, An-/Abmeldung und Sitzungsdaten testen.
- [ ] Release **0.2.0** starten, danach **0.2.1** mit korrektem Signaturschlüssel veröffentlichen; Update erkennen, laden, installieren, App neu starten.
- [ ] Signatur absichtlich verfälschen: Installation muss abgelehnt werden.
- [ ] Offline starten und Update-Server nicht erreichbar simulieren: bestehende Lern-App muss nutzbar bleiben, sofern Backend erreichbar ist.
- [ ] Prüfungs-/Lernrunde während Update-Download: kein unbeabsichtigter Verlust von Antworten und Lernstand.
- [ ] Windows SmartScreen prüfen; bei öffentlicher Verteilung Code-Signing-Zertifikat erwägen.
- [ ] macOS Gatekeeper, Developer-ID-Signatur, Apple-Notarisierung und Universal-Binary auf Intel/Silicon prüfen.
- [ ] Langsame Verbindung, Abbruch, Berechtigungen, Update-Neustart und eventuelle Rückkehr zum Login testen.
- [ ] Vor Freigabe das Review von AGB/Datenschutz/Impressum und die fachliche Freigabe der Schulungsfragen abschließen.

## Offizielle Dokumentation

- https://v2.tauri.app/plugin/updater/
- https://v2.tauri.app/distribute/pipelines/github/
- https://v2.tauri.app/distribute/sign/macos/
