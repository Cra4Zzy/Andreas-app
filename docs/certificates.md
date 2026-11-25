# Zertifikate – Ausstellungsprozess (Vorbereitung)

Die Teilnehmerverwaltung bietet eine Vorschau für tatsächlich bestandene Theorieprüfungen. Der Teilnehmername und die E-Mail-Adresse kommen aus dem ausgewählten Konto. Das Prüfungsdatum wird auf den aktuellen Berliner Kalendertag vorbelegt und darf korrigiert, aber nicht in die Zukunft gelegt werden. Der Ausbildungsbereich muss explizit gewählt werden. Nur beim Gabelstapler ist der zuvor abgestimmte Hinweis auf DGUV Grundsatz 308-001 hinterlegt. Andere Normen bleiben bis zur fachlichen Freigabe leer.

Der Entwurf ist sichtbar als **kein Prüfungsnachweis** markiert. Ein ausdrücklich bestätigter Prüfungseintrag kann über die bestehende serverseitig autorisierte RPC gespeichert werden. Die E-Mail-Auswahl ist nur ein Vorschauwert; sie wird nicht gespeichert und löst keinen Versand aus.

Vor Live-Ausstellung: genehmigte Unterschrift und finale Fachtexte übernehmen; zugriffsgeschützte serverseitige PDF-Erstellung (kein öffentlich erreichbares Unterschriftsbild), authentifizierte Ausstellungs- und Versandfunktion mit Prüfung von Rollen, Teilnehmer, Abschlussstatus und Widerruf, eindeutige Zertifikatsreferenz, idempotente Versandaufträge und protokollierte Zustellstatus, privater Download im Schulungspass. Bestehenden SMTP-Transport erst nach tatsächlichem Test für Zertifikat-Anhänge freigeben. Keine Zertifikate aus Lernrunden automatisch ausstellen.

## Individuelle Schulungsnachweise

Drei zusätzliche Vorlagen, unabhängig vom Lernfragenpool: VDI 2700ff Teilnahme, Abseilen Theorie/Praxis, Brandschutzhelfer Ausbildung ohne Arbeitgeberbestellung. Nur Administration mit bestätigten tatsächlich durchgeführten Inhalten; keine automatische Ausstellung. Zusatzdaten werden im ausgestellten privaten PDF gespeichert, nicht in der Teilnehmerprofil- oder Kurstabelle. Bei fehlgeschlagener Ausstellung kann derselbe Schulungseintrag über die Vorlage und das Datum erneut verwendet werden. Bestehende Theorie- und Unterweisungsnachweise bleiben unverändert. Die Vorlagen werden erst sichtbar, wenn der Zertifikatsdienst templatesV2 meldet. Die 12 Monate beim Abseilen sind Ausbildervorgabe, die wiederkehrende praktische Unterweisung ist davon getrennt. Fachtexte durch Ausbilder freigeben.

## Separate praktische Prüfungsnachweise

Die Administration kann Theorie, Praxis oder beide tatsächlich bestandenen Prüfungen auswählen. Es entstehen getrennte Abschlussdatensätze und PDF-Zertifikate. Bei gemeinsamem Versand werden beide PDFs angehängt. Sondervorlagen und Unterweisungen bleiben getrennt. Das Datum gilt für beide ausgewählten Prüfungen; bei unterschiedlichen Prüfungstagen bitte separat ausstellen. Kein eigenständiger Fahrausweis. Erst mit dem Servermerkmal `practiceV1` wird die Auswahl aktiviert. Vor Aktivierung die serverseitige PDF-Erstellung und den SMTP-Versand prüfen.
