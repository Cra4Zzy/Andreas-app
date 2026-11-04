# Abbate Lernraum · konsistente App-Navigation und Lokalisierung

Stand: 4. November 2026. Dieses Dokument ist die verbindliche UX-/Lokalisierungs-Checkliste vor Kundenfreigabe.

## Gemeinsame Informationsarchitektur

1. **Lernbereich**: Start, Lernen, Prüfungstraining und Übungsergebnisse innerhalb der App.
2. **Schulungspass**: Nur die von der Fahrschule dokumentierten Schulungen, Unterweisungen und Prüfungsergebnisse, niemals automatisch aus Übungen erzeugt.
3. **Konto**: Registrierung, Anmeldung, Wiederherstellung, Passwortänderung, Datenschutz und Kontolöschung.
4. **Verwaltung**: Nur für serverseitig berechtigte Mitarbeiter. Zugriffsschutz niemals allein durch Navigation oder Übersetzung steuern.

Die Web-App hat eine direkt erreichbare Schulungspass-Navigation auf Desktop und Mobilgeräten. Konto, Schulungspass und Verwaltung nutzen denselben Header und eine auf Mobilgeräten horizontal scrollbar angeordnete Bereichsnavigation. Verwaltungslinks sind nur nach bestätigter Mitarbeiterberechtigung sichtbar. Keine geschützte Funktion darf allein von der Sichtbarkeit dieses Links abhängen.

## Gemeinsame Sprachlogik

- Zentraler Katalog: `dist/i18n.js` mit 26 Sprachcodes und nativen Sprachnamen.
- Gemeinsame Kurztexte des App-Shells: `ABBATE_SHELL_LABELS`.
- Gemeinsame gespeicherte Präferenz: `abbate-language-v1` (gleiche Web-Origin).
- Lernbereich: `dist/app.js`; Kontoseiten: `dist/portal-language.js`.
- Auswahl muss in allen Bereichen die gleichen 26 Sprachen zeigen, durchsuchbar sein und den aktiven Zustand klar anzeigen.
- Kontoeingaben, Passwörter, E-Mail-Adressen, Schülernamen, IDs, Schulungsnachweise und Berechtigungen dürfen nicht durch Übersetzungslogik verändert werden.
- Datumskonvention der gewählten Locale, nicht der deutschen Standardsprache.

## Was technisch unterstützt wird – und was noch nicht

**Vollständige Sprachwahl** ist nicht gleichbedeutend mit einer **vollständigen fachlich abgenommenen Übersetzung** aller Inhalte.

- Der Lernbereich besitzt die 26 vorübersetzten grundlegenden UI-Sprachpakete.
- Ukrainisch, Russisch und Tschechisch haben ergänzende Konto-/Portalübersetzungen. Andere Portalsprachen können weiterhin deutsche Texte zeigen, bis entsprechende Übersetzungspakete erstellt und geprüft wurden.
- Das vollständige Sachfragenmaterial ist nicht in allen 26 Sprachen verfügbar. Die Theoriefragen aus der Kundenvorlage sind derzeit nur Deutsch/Rumänisch; keine falsche Vollübersetzung behaupten.
- Rechtliche Dokumente und sicherheitsrelevante Begriffe müssen gesondert fachlich und rechtlich geprüft werden.
- Vor Freigabe für eine Zielsprache müssen **Login, Registrierung, Passwort-Reset, Schulungspass, Konto, Fehlermeldungen, Freigabestatus und Lernfragen** vollständig in dieser Sprache getestet werden. Für die Mitarbeiterverwaltung ist die Einsatzsprache mit dem Kunden festzulegen.

## Abnahmetests

- [ ] 26 Sprachen in Lern-App, Konto, Schulungspass und Verwaltung identisch und durchsuchbar.
- [ ] Wahl in einem Bereich bleibt beim Wechsel in jeden anderen Bereich erhalten.
- [ ] Sprachwechsel beschädigt keine eingegebenen Formularwerte und ändert keine Schülerdaten.
- [ ] Deutsch, Ukrainisch, Russisch, Tschechisch und Englisch auf echten Geräten manuell auf Überläufe und unübersetzte UI prüfen.
- [ ] Mobilbreiten 360–430 px, Tablet, Desktop; lange Sprachbezeichnungen ohne abgeschnittene Funktionen.
- [ ] Unangemeldeter Nutzer erhält niemals Zugriff auf Schulungspass oder Verwaltung.
- [ ] Mitarbeiterverwaltung nur nach Backend-Check sichtbar und nutzbar.
- [ ] Leerer Schulungspass ist ohne simulierte Einträge verständlich und bietet einen klaren Weg zum Lernbereich.
- [ ] Desktop-Installer mit Live-Frontend: neue Texte erscheinen nach App-Neustart ohne neue Installation.
- [ ] PWA-Cache nach Deploy korrekt aktualisiert; alte Assets werden nicht dauerhaft gezeigt.
- [ ] Sicherheitstexte und vertragliche Dokumente vor Kundenlaunch fachlich freigeben.

## Design-Referenzen

- Apple HIG Settings: https://developer.apple.com/design/human-interface-guidelines/settings
- Android App languages: https://developer.android.com/guide/topics/resources/app-languages
- USWDS language selection: https://designsystem.digital.gov/patterns/select-a-language/three-or-more-languages/

**Freigabekriterium:** Keine Zielsprache als vollständig lokalisiert oder sicherheitsfachlich freigegeben kommunizieren, bevor die gesamte Nutzerreise inklusive Authentifizierung und Fachfragen geprüft wurde.
