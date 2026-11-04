# Abbate Lernraum – Web-App-Installation (PWA)

Stand: 4. November 2026. **Für die Erstveröffentlichung ist die browserbasierte Installation der bevorzugte Weg.** Apple App Store und Google Play Store sind vorerst nicht Bestandteil der Freigabe; vorbereitete native Quellprojekte bleiben unveröffentlicht und können später wieder aufgenommen werden.

## Für Teilnehmer

Adresse: **https://app.gabelstaplerfahrschule-andreas.de/**.

Der Startbildschirm-Link führt zur eigenständig nutzbaren Web-App unter `/dist/`. Die App hat ein Manifest (Name, Icon, Scope, Standalone-Darstellung), HTTPS-Hosting und einen Service Worker ausschließlich für öffentliche statische Dateien. **Anmeldung, Lerninhalte, Prüfungsfortschritt, Freischaltungsstatus und Administrationsaktionen brauchen eine Serververbindung.** Keine Voll-Offline-Funktion versprechen.

### iPhone und iPad

1. Im Browser **Safari** den Abbate Lernraum öffnen (Link auf der Landingpage führt zur App/Anmeldeseite).
2. Auf **Teilen** tippen; bei neueren Safari-Layouts ggf. zuerst das Seitenmenü öffnen.
3. **Zum Home-Bildschirm hinzufügen** wählen.
4. **Als Web-App öffnen** einschalten und **Hinzufügen** tippen.
5. Abbate künftig über das eigene Icon starten. Falls bereits im Browser angemeldet, kann eine erneute Anmeldung in der eigenständigen App erforderlich sein.

Quelle: https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios

### Android (Chrome)

1. Lernraum in **Chrome** öffnen.
2. Chrome-Menü **⋮** öffnen.
3. **App installieren** oder **Zum Startbildschirm hinzufügen** wählen (abhängig vom Browser und Gerät).
4. Bestätigen und Abbate über das Startbildschirm-Icon öffnen. Browser mit anderer PWA-Unterstützung können stattdessen eine normale Verknüpfung erstellen.

Quelle: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable

## Zahlungs- und Zugangssystem

Andreas bietet den Zugang entweder **zusammen mit einer Fahrschulung** oder **separat als digitalen 30-Tage-Zugang** an. Der Vertrag und die Zahlung erfolgen **ausschließlich außerhalb der App**, direkt über Andreas (bar oder Banküberweisung). Ein Administrator überprüft die Zahlung und schaltet manuell für 30 Tage frei. **Keine automatische Verlängerung, kein Checkout, keine Zahlungsaufforderung im Lernraum.**

Die PWA muss nicht dem Apple-/Google-Store-Review unterzogen werden. Das ersetzt **keine** Prüfung von Verbraucherrecht, Preisangaben, Widerruf, Datenschutz, Impressum oder Sicherheit. Bei einer eigenständigen Fernabsatz-Bestellung sind die vorvertraglichen Informationen, der Bestellprozess und ggf. die Widerrufsfunktion separat zu prüfen.

## Technische Abnahme vor Produktionsfreigabe

- [ ] Landingpage `/` auf iPhone Safari und Android Chrome öffnen; Links und beide Anleitungen prüfen.
- [ ] App über `/dist/` installieren – **sowohl vor als auch nach** dem Login – und Icon, Name sowie Standalone-Modus testen.
- [ ] Benutzer ausloggen/einloggen, E-Mail bestätigen, Passwort zurücksetzen, 30-Tage-Zugang aktivieren und nach Ablauf kontrollieren; keine unberechtigte Schülerfreigabe.
- [ ] Mehrere Sprachen testen; neue Originalfragen sind bislang nur Deutsch/Rumänisch und nicht benotet.
- [ ] Ladezustände bei Netzausfall testen; persönliche Daten dürfen nicht ungeschützt offline gespeichert werden.
- [ ] Service-Worker-Update auf vorhandenen Geräten, PWA-Icon, Website-Cache und „App löschen“ prüfen.
- [ ] Datenschutz-, AGB-, Widerrufs-, Impressums- und Konto-Löschseiten im mobilen Browser und installierten Modus aufrufen.
- [ ] Fachlich geprüfte Lehrunterlagen, bestätigte Lösungen und Diagramme ergänzen; Kundenabnahme durch Andreas.
- [ ] Rechtsprüfung des eigenständigen kostenpflichtigen digitalen Lernzugangs und Freigabe der Verbraucherinformationen durch Andreas.
- [ ] Live-Installation auf echten Geräten dokumentieren; erfolgreiche CI/FTPS-Jobs ersetzen den Gerätetest nicht.

## Projektstatus

PWA-Manifest und Service-Worker waren schon vorhanden. Die öffentliche Downloadseite wurde auf **mobile Installation statt Store-Buttons** umgestellt. Der Login-Einstieg bindet jetzt ebenfalls Manifest/Icon/Service-Worker ein. Für Desktop bleiben Downloadoptionen separat bestehen; nicht veröffentlichte Installer dürfen nicht als fertige Releases dargestellt werden.

Native Apple-/Android-Builds können im Repository für spätere Pläne verbleiben, werden aber nicht zur Voraussetzung der ersten PWA-Veröffentlichung.
