# Desktop-Installationspakete (Windows und macOS)

Stand: 2. November 2026. **Interner Pilot**, noch keine signierte/notarisierte öffentliche Veröffentlichung.

## Bereits implementiert

- Tauri 2 lädt die **lokal gebündelten** Dateien aus `dist/` in einem eigenen Desktop-Fenster. Die Nutzer öffnen **keinen Browser**.
- Das vorhandene Supabase-Backend und das bestehende Login werden unverändert genutzt. **Internet ist für Anmeldung, Synchronisation und Freigaben nötig**; kein vollständiger Offline-Modus.
- Original-App-Icon wird beim Build über die Tauri-CLI in Windows-/macOS-Formate umgewandelt.
- Der GitHub-Workflow `.github/workflows/desktop-builds.yml` erstellt unabhängig voneinander:
  - Windows x64: `.exe` (NSIS-Installationsprogramm).
  - macOS Universal: `.dmg` (Intel + Apple Silicon).
- Beide Dateien stehen nach **erfolgreichem** Workflow-Lauf im Bereich **Actions → Desktop pilot installers → aktueller Lauf → Artifacts**. GitHub-Artefakte sind ZIP-Dateien und verfallen nach 14 Tagen. Zusätzlich ist jetzt ein Veröffentlichungsschritt eingerichtet: Erst wenn **Windows und Universal-Mac-Build erfolgreich** sind, werden beide Installer im GitHub-Prerelease mit dem Tag `desktop-pilot` veröffentlicht. Der Workflow trägt dann `windowsPreview` und `macosPreview` in `downloads.json` ein, sodass die Download-Seite beide ausdrücklich als **Testversionen** anzeigt. Ein bereits zuvor bestätigter Windows-Testdownload existiert. **Der neue Mac-Direktlink gilt erst nach erfolgreichem Release-Job als verfügbar; die Installation auf einem echten Mac bleibt separat zu testen.**

## Manuelle Builds

Auf Windows oder macOS müssen Node.js 24, Rust und die üblichen Tauri-Systemvoraussetzungen installiert sein. Für den Mac-Build Xcode Command Line Tools bereitstellen.

```bash
npm ci
npm test
npx --yes @tauri-apps/cli@2.12.4 icon dist/icon-512.png --output src-tauri/icons
# Windows: (auf Windows)
npx --yes @tauri-apps/cli@2.12.4 build --bundles nsis
# Mac: (auf macOS; Universal erfordert beide Rust-Targets)
rustup target add x86_64-apple-darwin aarch64-apple-darwin
npx --yes @tauri-apps/cli@2.12.4 build --bundles dmg --target universal-apple-darwin
```

Die Tauri-Konfiguration führt `npm run build` selbst aus. Die Desktop-App enthält keine eigenen Supabase-Geheimschlüssel.

## Vor der Verteilung an Schüler

1. Buildjobs müssen **grün** sein; Installationsprogramm auf echtem Windows und Mac ausprobieren. Besonders Registrierung/Anmeldung, E-Mail-Bestätigung, Schulungspass, Admin-Berechtigungen und Wechsel zurück zur App nach Bestätigung testen.
2. Supabase Auth-SMTP, Redirects und erstes echtes Admin-Konto laut `docs/backend-launch.md` abschließen. Die vorhandenen Funktionen sind bereits implementiert, aber nicht vollständig mit echten Konten end-to-end getestet.
3. Version und Produkt-Identität festlegen. `de.abbate.lernraum.desktop.preview` ist ausdrücklich nur die Pilot-ID.
4. Für eine komfortable öffentliche Verteilung: **Windows-Code-Signatur** und **Apple Developer ID + Notarisierung** einrichten. Der Mac-Pilot ist nur ad hoc signiert und kann durch Gatekeeper blockiert werden; ein unsignierter Windows-Pilot kann SmartScreen-Warnungen auslösen.
5. Nach Freigabe geprüfte Installer über die eigene Download-Seite bzw. einen definierten Release-Kanal verteilen. Noch keinen automatischen Updater behaupten: Dafür sind Update-Signatur und kontrollierter Update-Endpunkt nötig.

Tauri-Dokumentation: https://v2.tauri.app/distribute/ und https://v2.tauri.app/distribute/pipelines/github/
