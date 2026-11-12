'use strict';
// Additional independent practice exercises. Editorial drafts awaiting Andreas' review.
// Not official DGUV exam questions; translations are not supplied in this file.
(()=>{
 const current=globalThis.ABBATE_PRACTICE_BANK;
 if(!current||!Array.isArray(current.questions))throw Error('Practice bank must load first');
 const rows={
 "gabelstapler": [
  [
   "g2-fahrweg",
   "betrieb",
   "Vor dir liegt verschüttete Flüssigkeit auf dem Fahrweg. Wie gehst du vor?",
   "Der Stapler würde unmittelbar über den rutschigen Bereich fahren.",
   "Fahrt anhalten und Gefahrenstelle sichern oder beseitigen lassen.",
   "Die Stelle bei angehobener Gabel möglichst schnell überfahren.",
   "Auf trockenere Reifen hoffen und unverändert weiterfahren.",
   "Verunreinigte Fahrwege gefährden die Standsicherheit und müssen vor dem Befahren ausreichend gesichert sein."
  ],
  [
   "g2-sichtladung",
   "betrieb",
   "Eine hohe Palette versperrt die Sicht nach vorn. Was ist richtig?",
   "Du musst zu einem Lagerplatz fahren und kannst den Fahrweg nicht einsehen.",
   "Nur nach geeigneter sicherer Methode fahren, beispielsweise rückwärts mit freier Sicht.",
   "Die Palette hochheben, bis du unter ihr hindurchsehen kannst.",
   "Den Fahrweg ohne Einweiser oder freie Sicht trotzdem befahren.",
   "Die Fahrtrichtung und Sicht müssen eine sichere Beobachtung des Verkehrswegs ermöglichen; Lasten dürfen nicht die Sichtkontrolle ersetzen."
  ],
  [
   "g2-fussgaengerstop",
   "betrieb",
   "Ein Fußgänger bleibt unmittelbar neben dem Stapler stehen. Was tust du?",
   "Die Person befindet sich im möglichen Fahr- und Schwenkbereich.",
   "Anhalten und erst mit sicherem Abstand weiterfahren.",
   "Den Fußgänger durch kurzes Beschleunigen überholen.",
   "Mit angehobener Last an der Person vorbeifahren.",
   "Personen müssen außerhalb des Gefahrenbereichs bleiben; nötigenfalls ist die Fahrt zu unterbrechen."
  ],
  [
   "g2-hubmast",
   "grundlagen",
   "Am Hubmast bemerkst du eine beschädigte Hydraulikleitung. Was gilt?",
   "Hydrauliköl tritt sichtbar aus dem Arbeitsgerät aus.",
   "Stapler außer Betrieb nehmen und den Schaden melden.",
   "Die undichte Stelle während des Hebens mit der Hand prüfen.",
   "Nur kleinere Lasten heben, bis die Schicht zu Ende ist.",
   "Hydraulikschäden können zu unkontrollierten Bewegungen führen; eine sichere Benutzung ist bis zur Prüfung nicht gegeben."
  ],
  [
   "g2-lagerregal",
   "lasten",
   "Du willst eine Palette in ein Regal einlagern. Was prüfst du zuerst?",
   "Die Regalebene ist hoch und die Tragfähigkeit muss eingehalten werden.",
   "Regalfach, Lastgewicht und freie Einlagerungsfläche auf Eignung prüfen.",
   "Die Palette möglichst schnell in das Regal schieben.",
   "Das Gesamtgewicht allein nach der Kartonanzahl schätzen.",
   "Regale und Lastaufnahmemittel müssen zur Last und Einlagerungssituation passen."
  ],
  [
   "g2-batterieschaden",
   "grundlagen",
   "Eine Staplerbatterie ist äußerlich beschädigt. Was ist richtig?",
   "Vor dem Laden fallen Risse oder ungewöhnliche Flüssigkeit auf.",
   "Nicht laden oder benutzen und zuständige Fachpersonen informieren.",
   "Beschädigung mit Klebeband abdecken und sofort laden.",
   "Die Batterie ohne Prüfung durch eine andere Person laden lassen.",
   "Beschädigte Batterien bergen elektrische und chemische Gefahren und benötigen eine fachgerechte Beurteilung."
  ],
  [
   "g2-fahrerkabine",
   "betrieb",
   "Was gilt für lose Gegenstände im Fahrerbereich?",
   "Werkzeug liegt auf dem Boden neben den Bedienpedalen.",
   "Gegenstände entfernen und den Bedienbereich frei halten.",
   "Werkzeug nur mit einem Fuß während der Fahrt festhalten.",
   "Lose Teile unter dem Fahrersitz verstecken.",
   "Lose Gegenstände können Pedale blockieren und die sichere Bedienung des Fahrzeugs beeinträchtigen."
  ],
  [
   "g2-uebergabe",
   "grundlagen",
   "Du übernimmst einen Stapler nach einem Schichtwechsel. Was gehört dazu?",
   "Ein Kollege hat das Fahrzeug zuletzt verwendet.",
   "Erforderliche Prüfung durchführen und bekannte Mängel erfragen.",
   "Annehmen, dass der Kollege sämtliche Prüfungen übernommen hat.",
   "Ohne Blick auf die Maschine die Fahrt beginnen.",
   "Die übernehmende Person muss sich vor der Benutzung vom sicheren Zustand überzeugen."
  ],
  [
   "g2-transportsicherung",
   "lasten",
   "Ein hoher Gegenstand steht lose auf der Palette. Wie handelst du?",
   "Die Last könnte beim Bremsen nach vorn kippen.",
   "Last standsicher aufbauen und gegen Umfallen oder Herabfallen sichern.",
   "Die Gabel besonders hoch tragen, damit die Last stabil bleibt.",
   "Nur die Kurven langsam nehmen, geradeaus schneller fahren.",
   "Lose Lasten müssen vor dem Transport stabilisiert werden, damit Brems- und Fahrbewegungen kein Herabfallen auslösen."
  ],
  [
   "g2-arbeitsende",
   "betrieb",
   "Was ist bei einem unbeaufsichtigten Stapler wichtig?",
   "Du beendest deine Schicht und verlässt den Bereich.",
   "Fahrzeug sicher abstellen, gegen Wegrollen und unbefugte Nutzung sichern.",
   "Schlüssel stecken lassen, damit Kollegen die Maschine finden.",
   "Gabel auf Augenhöhe belassen, damit sie sichtbar ist.",
   "Eine sichere Abstellung umfasst abgesenkte Lastaufnahme und Schutz vor Bewegung und unbefugter Inbetriebnahme."
  ],
  [
   "g2-bremsweg",
   "betrieb",
   "Warum musst du mit Last den Bremsweg besonders beachten?",
   "Der Stapler transportiert schwere Ware durch einen Lagergang.",
   "Geschwindigkeit den Sicht-, Untergrund- und Lastverhältnissen anpassen.",
   "Mit schwerer Last stets später bremsen als ohne Last.",
   "Beim Bremsen die Last stark anheben, um besser zu verzögern.",
   "Masse und Fahrbahnzustand beeinflussen den Anhalteweg; angepasste Geschwindigkeit ist zentral."
  ],
  [
   "g2-rampe",
   "betrieb",
   "Was prüfst du vor dem Befahren einer steilen Rampe?",
   "Die Route ist für das Fahrzeug möglicherweise zu steil.",
   "Zulässige Steigung und sichere Betriebsweise aus der Fahrzeugvorgabe prüfen.",
   "Die Rampe unabhängig vom Gefälle mit Maximalgeschwindigkeit befahren.",
   "Mit angehobener Last über den Rampenrand fahren.",
   "Nur Rampen innerhalb der vorgesehenen Einsatzgrenzen dürfen befahren werden; Betriebsanleitung und Lastführung sind maßgeblich."
  ],
  [
   "g2-zinke",
   "lasten",
   "Eine Palette ist breiter als der Gabelabstand. Was ist zu beachten?",
   "Du planst die Aufnahme einer ungewöhnlich großen Ladung.",
   "Gabelabstand und Aufnahmepunkte passend zur Last einstellen.",
   "Nur eine Zinke benutzen, wenn die Last zu breit ist.",
   "Die Ladung schräg anheben, bis sie die richtige Lage erreicht.",
   "Eine gleichmäßige und geeignete Lastaufnahme reduziert Abrutschen und Kippen."
  ],
  [
   "g2-betriebsanweisung",
   "grundlagen",
   "Welche Rolle spielt die betriebliche Verkehrsregelung?",
   "Im Lager gelten markierte Einbahn- und Fußgängerbereiche.",
   "Die vorgegebenen Fahrwege und Verkehrsregeln beachten.",
   "Mit Staplern gelten nur die Regeln der öffentlichen Straße.",
   "Markierungen ignorieren, sobald das Fahrzeug beladen ist.",
   "Betriebliche Fahrwege und Sicherheitsregeln schützen Staplerverkehr und zu Fuß gehende Personen."
  ],
  [
   "g2-nothalt",
   "grundlagen",
   "Die Lenkung reagiert während der Fahrt ungewöhnlich. Was ist richtig?",
   "Das Fahrzeug lässt sich nicht mehr gewohnt kontrollieren.",
   "An sicherer Stelle anhalten und Fahrzeug prüfen lassen.",
   "Mit höherer Geschwindigkeit fahren, damit die Lenkung leichter reagiert.",
   "Den Fehler durch besonders große Lenkausschläge ausgleichen.",
   "Eine beeinträchtigte Lenkung gefährdet die sichere Führung; die Maschine darf nicht unkontrolliert weiterbetrieben werden."
  ],
  [
   "g2-anschlagkette",
   "lasten",
   "Du willst mit einem Stapler eine frei hängende Last bewegen. Was gilt?",
   "Eine Last soll an einem Haken unter den Gabeln hängen.",
   "Nur mit dafür freigegebenem Gerät und geeigneter Lastaufnahmeeinrichtung.",
   "Eine beliebige Kette reicht aus, wenn die Last nicht schwer ist.",
   "Die Kette direkt zwischen beide Gabelzinken klemmen.",
   "Freihängende Lasten verändern die Stabilität; Herstellerfreigaben und geeignete Einrichtungen sind erforderlich."
  ],
  [
   "g2-rollenlast",
   "lasten",
   "Ein zylindrisches Bauteil liegt ungesichert auf einer Palette. Was tust du?",
   "Die Ladung kann während des Transports rollen.",
   "Bauteil gegen Rollen sichern, bevor die Palette aufgenommen wird.",
   "Mit der Palette besonders ruckartig anfahren.",
   "Die Zinken so hoch stellen, dass das Bauteil nicht sichtbar ist.",
   "Runde oder rollfähige Lasten benötigen eine zuverlässige Sicherung gegen Lageänderungen."
  ],
  [
   "g2-pruefplakette",
   "grundlagen",
   "Woran erkennst du, ob der Stapler eingesetzt werden darf?",
   "An der Maschine klebt eine Prüfplakette.",
   "Neben der Prüfung des Fahrzeugs sind gültiger Prüfstatus und Einsatzfreigabe zu beachten.",
   "Eine beliebige Plakette ersetzt immer die tägliche Sichtprüfung.",
   "Eine fehlende Freigabe kann durch vorsichtige Fahrweise ersetzt werden.",
   "Wiederkehrende Prüfung und tägliche Betriebskontrolle erfüllen unterschiedliche Sicherheitsfunktionen."
  ],
  [
   "g2-licht",
   "betrieb",
   "Im Lager ist die Beleuchtung plötzlich ausgefallen. Was ist richtig?",
   "Du kannst Hindernisse im Fahrweg nicht mehr sicher erkennen.",
   "Fahrt unterbrechen, bis sichere Sicht gewährleistet ist.",
   "Die Fahrgeschwindigkeit erhöhen, um den dunklen Bereich zu verlassen.",
   "Mit angehobener Gabel ohne Sichtkontrolle weiterfahren.",
   "Ein nicht sicher überblickbarer Fahrweg darf nicht ohne wirksame Sicherungsmaßnahmen befahren werden."
  ],
  [
   "g2-ueberhang",
   "lasten",
   "Eine Last ragt seitlich weit über die Gabel hinaus. Was prüfst du?",
   "Du willst die Palette durch ein schmales Tor transportieren.",
   "Freiraum, Stabilität und zulässige Lastaufnahme vor der Fahrt beurteilen.",
   "Die seitliche Ausladung durch eine schnelle Kurve ausgleichen.",
   "Die Last unabhängig von ihrer Form mit Maximaltempo fahren.",
   "Überstände erhöhen Kollisionsrisiken und können die Stabilität und den erforderlichen Verkehrsraum verändern."
  ],
  [
   "g2-wartungsbereich",
   "betrieb",
   "Vor einem Wartungsbereich stehen Absperrungen. Wie verhältst du dich?",
   "Dein üblicher Fahrweg ist vorübergehend gesperrt.",
   "Sperrung beachten und eine freigegebene alternative Strecke wählen.",
   "Absperrungen kurz verschieben und unbemerkt hindurchfahren.",
   "Unter Last direkt durch den Arbeitsbereich fahren.",
   "Abgesperrte Bereiche dürfen nicht ohne Freigabe betreten oder befahren werden."
  ],
  [
   "g2-bremsprobe",
   "grundlagen",
   "Wann ist eine Funktionsprüfung der Betriebsbremse sinnvoll?",
   "Du bereitest den Stapler vor der Arbeit vor.",
   "Im Rahmen der vorgeschriebenen Prüfung vor dem Einsatz.",
   "Ausschließlich nach einem schweren Unfall durchführen.",
   "Nur wenn der Stapler bereits eine hohe Geschwindigkeit erreicht hat.",
   "Die Funktionsfähigkeit sicherheitsrelevanter Einrichtungen wird vor dem Einsatz geprüft."
  ],
  [
   "g2-fahrzeuganhaenger",
   "betrieb",
   "Du möchtest einen Anhänger mit dem Stapler ziehen. Was ist erforderlich?",
   "Der Betrieb plant einen Transport mit angehängter Last.",
   "Herstellerfreigabe, geeignete Kupplung und zulässige Zuglast beachten.",
   "Jeden Anhänger ohne Prüfung an eine Gabelzinke binden.",
   "Nur den Reifendruck erhöhen und losfahren.",
   "Zugbetrieb ist nur innerhalb der technischen Vorgaben und mit geeigneter Verbindung sicher möglich."
  ],
  [
   "g2-rueckfahrt",
   "betrieb",
   "Was ist beim Rückwärtsfahren mit dem Stapler wichtig?",
   "Im Lagergang befindet sich ein unübersichtlicher Bereich.",
   "Fahrweg und Personenbereich sicher beobachten und nötigenfalls einweisen lassen.",
   "Dauerhaft nur in den Rückspiegel sehen, unabhängig von der Umgebung.",
   "Ohne Sicht fahren, solange die Hupe einmal betätigt wurde.",
   "Rückwärtsfahrten erfordern freie Sicht oder wirksame zusätzliche Sicherungsmaßnahmen."
  ],
  [
   "g2-lastentnahme",
   "lasten",
   "Du entnimmst eine Palette aus einem hohen Regalfach. Was ist richtig?",
   "Die Palette steht möglicherweise nicht mittig.",
   "Last sicher aufnehmen und vor dem Absenken stabilisieren.",
   "Die Palette beim Herausziehen zur Seite schwenken lassen.",
   "Unterhalb der angehobenen Palette nachsehen, ob sie beschädigt ist.",
   "Ein kontrolliertes Aufnehmen und Absenken verhindert Lastabsturz und gefährliche Bewegungen."
  ]
 ],
 "hebebuehnen": [
  [
   "h2-absenkweg",
   "betrieb",
   "Warum muss der Bereich unter einer Hubarbeitsbühne frei bleiben?",
   "Der Korb wird abgesenkt und unter ihm stehen Materialien.",
   "Quetsch- und Kollisionsgefahren beim Absenken vermeiden.",
   "Materialien mit dem Korb nach unten drücken.",
   "Nur den Fußbereich der Bedienperson im Auge behalten.",
   "Der Absenkbereich darf keine Personen oder Hindernisse enthalten, die eingeklemmt werden können."
  ],
  [
   "h2-transporthoehe",
   "betrieb",
   "Wie verfährst du eine fahrbare Bühne über einen niedrigen Durchgang?",
   "Die Durchfahrt ist niedriger als der ausgefahrene Ausleger.",
   "Bühne gemäß Betriebsanleitung in geeignete Transportstellung bringen.",
   "Ausleger ausgefahren lassen und unter der Decke entlangfahren.",
   "Den Korb seitlich an den Türrahmen drücken.",
   "Für Fahrbewegungen müssen Bauhöhe und Transportstellung zu den Herstellervorgaben und zum Durchgang passen."
  ],
  [
   "h2-bodenoeffnung",
   "grundlagen",
   "Neben der Bühne ist eine ungesicherte Bodenöffnung. Wie reagierst du?",
   "Ein Fahr- oder Abstützpunkt liegt in der Nähe der Öffnung.",
   "Aufstellort wechseln oder die Tragfähigkeit und Sicherung fachgerecht klären.",
   "Eine Abstützung direkt auf den Rand der Öffnung setzen.",
   "Die Gefahrenstelle nur durch einen Karton verdecken.",
   "Öffnungen und Randbereiche können unter Stützlast versagen und müssen wirksam berücksichtigt werden."
  ],
  [
   "h2-rettungsperson",
   "grundlagen",
   "Warum muss eine zweite Person mit dem Rettungsverfahren vertraut sein?",
   "Eine Bedienperson könnte oben handlungsunfähig werden.",
   "Damit im Notfall eine sichere Rettung eingeleitet werden kann.",
   "Damit Arbeiten im Korb grundsätzlich ohne Sicherung stattfinden dürfen.",
   "Damit die Bühne schneller als zugelassen betrieben werden darf.",
   "Ein Rettungskonzept muss die bodenseitige Hilfe bei Ausfall oder Notfall berücksichtigen."
  ],
  [
   "h2-werkzeugabwurf",
   "betrieb",
   "Was gilt für Werkzeuge in großer Höhe?",
   "Ein loses Werkzeug könnte über die Korbkante fallen.",
   "Werkzeuge so sichern, dass sie niemanden gefährden oder herabfallen.",
   "Werkzeuge zur Entlastung einfach auf dem Geländer abstellen.",
   "Werkzeuge bei Bedarf aus dem Korb nach unten werfen.",
   "Herabfallende Gegenstände gefährden Personen unterhalb; Material muss sicher aufbewahrt werden."
  ],
  [
   "h2-trittstufe",
   "betrieb",
   "Eine Kiste soll als zusätzliche Standfläche im Korb dienen. Was ist richtig?",
   "Du erreichst die Arbeitsstelle sonst nur knapp.",
   "Nicht auf improvisierte Erhöhungen steigen; geeignetes Arbeitsmittel einsetzen.",
   "Die Kiste auf das Geländer stellen und darauf klettern.",
   "Den Korb absichtlich über die zulässige Höhe hinaus belasten.",
   "Improvisierte Erhöhungen beeinträchtigen den vorgesehenen Absturzschutz und sind unzulässig."
  ],
  [
   "h2-lastverteilen",
   "lasten",
   "Worauf achtest du bei mehreren Personen im Arbeitskorb?",
   "Im Korb arbeiten zwei Personen mit schwerem Werkzeug.",
   "Zulässige Korblast einschließlich Personen und Werkzeug nicht überschreiten.",
   "Die Last ausschließlich nach der Werkzeuggröße beurteilen.",
   "Schweres Werkzeug direkt auf dem Schutzgeländer lagern.",
   "Die zulässige Tragfähigkeit umfasst alle Personen, Materialien und Werkzeuge im Korb."
  ],
  [
   "h2-abstuetzplatte",
   "grundlagen",
   "Wann kommen zusätzliche Unterlegplatten für Stützen in Betracht?",
   "Der Aufstellboden ist nur begrenzt belastbar.",
   "Wenn dies zur sicheren Lastverteilung nach Vorgaben erforderlich ist.",
   "Um die Stützen möglichst dicht am Rand einer Baugrube aufzulegen.",
   "Um ohne Herstellerangaben beliebig größere Reichweiten zu nutzen.",
   "Ausreichende Aufstandsflächen sind für die sicheren Stützkräfte erforderlich."
  ],
  [
   "h2-baugrube",
   "grundlagen",
   "Eine Bühne soll direkt an einer Baugrubenkante stehen. Was prüfst du?",
   "Der Untergrund könnte durch die Baugrube seitlich nachgeben.",
   "Ausreichenden Sicherheitsabstand und Tragfähigkeit des Untergrunds sicherstellen.",
   "Die Stützen in die Baugrube hinein verlängern.",
   "Das Risiko nur durch langsames Heben des Korbs ausgleichen.",
   "Baugruben können die Standsicherheit durch Böschungs- und Untergrundversagen beeinträchtigen."
  ],
  [
   "h2-witterung",
   "betrieb",
   "Während des Einsatzes setzt Vereisung ein. Wie handelst du?",
   "Bedienflächen und Arbeitsbereich werden glatt.",
   "Arbeiten unterbrechen und Einsatzbedingungen gemäß Betriebsanleitung neu bewerten.",
   "Die Bühne höher fahren, um Schnee und Eis zu vermeiden.",
   "Die Warnhinweise ignorieren, solange die Plattform beleuchtet ist.",
   "Witterungsänderungen können Haftung, Bedienbarkeit und sichere Einsatzgrenzen verändern."
  ],
  [
   "h2-aufbaukontakt",
   "grundlagen",
   "Eine Stahlkonstruktion schränkt den Korbweg ein. Was ist wichtig?",
   "Beim Anheben droht eine Quetschung zwischen Korb und Träger.",
   "Bewegungen so planen, dass Körper und Korb nicht eingeklemmt werden.",
   "Die Fahrt schneller ausführen, damit der Korb rascher vorbeikommt.",
   "Die Konstruktion mit dem Korb zur Seite drücken.",
   "Quetschstellen zwischen Plattform und Umgebung erfordern sorgfältige Beobachtung und kontrollierte Bewegung."
  ],
  [
   "h2-sicherheitsabstand",
   "betrieb",
   "Wann muss der Gefahrenbereich einer Bühne abgesperrt werden?",
   "Unter dem Einsatzort führt ein öffentlicher Verkehrsweg vorbei.",
   "Wenn Dritte durch Bewegung oder herabfallende Gegenstände gefährdet werden könnten.",
   "Nur wenn bereits ein Gegenstand heruntergefallen ist.",
   "Niemals, da der Arbeitskorb grundsätzlich alle Gefahren verhindert.",
   "Der Bereich unter und neben der Bühne muss gegen vorhersehbare Gefährdungen geschützt werden."
  ],
  [
   "h2-korbtor",
   "betrieb",
   "Was gilt für die Einstiegstür des Arbeitskorbs?",
   "Du bist bereits auf Arbeitshöhe.",
   "Die Tür entsprechend der vorgesehenen Verriegelung geschlossen halten.",
   "Die Tür offen lassen, damit man schneller aussteigen kann.",
   "Die Tür durch ein Seil dauerhaft offen binden.",
   "Vorgesehene Verschlüsse sind Teil der Schutzmaßnahmen gegen Absturz aus dem Arbeitskorb."
  ],
  [
   "h2-energieleitung",
   "grundlagen",
   "Was gilt, wenn eine Freileitung nicht sicher abgeschaltet ist?",
   "Du arbeitest mit der Hubarbeitsbühne in ihrer Nähe.",
   "Vorgegebene Sicherheitsabstände und notwendige Schutzmaßnahmen sicherstellen.",
   "Den Korb bis kurz vor die Leitung bewegen, solange sie nicht berührt wird.",
   "Auf die Kunststoffreifen vertrauen und ohne Abstand arbeiten.",
   "Elektrische Überschläge sind auch ohne direkten Kontakt möglich; Sicherheitsabstände sind erforderlich."
  ],
  [
   "h2-schwanken",
   "betrieb",
   "Der Arbeitskorb beginnt ungewöhnlich stark zu schwingen. Was ist richtig?",
   "Der Bewegungsverlauf ist nicht mehr kontrolliert.",
   "Bewegung stoppen und Ursache beziehungsweise Einsatzbedingungen prüfen.",
   "Mit schnellen Gegenbewegungen unkontrolliert nachregeln.",
   "Zusätzliche Personen in den Korb holen, um ihn schwerer zu machen.",
   "Ungewöhnliches Schwingen kann auf ungeeignete Einsatzbedingungen oder eine Störung hindeuten."
  ],
  [
   "h2-ladegeraet",
   "grundlagen",
   "Ein Ladekabel der elektrisch betriebenen Bühne ist beschädigt. Was tust du?",
   "Beim Anschließen ist eine beschädigte Isolierung sichtbar.",
   "Ladevorgang nicht starten und das Kabel fachgerecht prüfen lassen.",
   "Den Schaden mit nassen Handschuhen anfassen.",
   "Den Stecker möglichst stark in die Buchse drücken.",
   "Beschädigte elektrische Leitungen stellen ein Stromschlag- und Brandrisiko dar."
  ],
  [
   "h2-gelaenderanbau",
   "betrieb",
   "Darfst du ein Geländer eigenständig entfernen, um näher heranzukommen?",
   "Ein Bauteil verhindert die Annäherung an die Arbeitsstelle.",
   "Schutzeinrichtungen nicht eigenmächtig verändern oder entfernen.",
   "Das Geländer nach dem Anheben abschrauben und später montieren.",
   "Ohne Geländer weiterarbeiten, solange eine Person danebensteht.",
   "Bauliche Schutzeinrichtungen dürfen nicht ohne zulässige Vorgabe und sichere Ersatzmaßnahmen verändert werden."
  ],
  [
   "h2-lastkran",
   "lasten",
   "Darf die Bühne als Kran zum Heben einer Last verwendet werden?",
   "Material soll frei hängend neben dem Arbeitskorb transportiert werden.",
   "Nur wenn Hersteller und Ausrüstung diesen besonderen Einsatz ausdrücklich zulassen.",
   "Immer, wenn das Gewicht kleiner als das eigene Körpergewicht ist.",
   "Einfach einen Haken am Geländer befestigen und Material anheben.",
   "Hubarbeitsbühnen sind nicht automatisch für Kranarbeiten oder zusätzliche Hängelasten ausgelegt."
  ],
  [
   "h2-arbeitsvorbereitung",
   "grundlagen",
   "Was gehört zur Vorbereitung an einem neuen Einsatzort?",
   "Du kennst den Baustellenbereich noch nicht.",
   "Gefährdungen, Boden, Verkehrswege, Rettung und Gerätetauglichkeit beurteilen.",
   "Nur die Entfernung zum nächsten Parkplatz schätzen.",
   "Unabhängig von der Umgebung sofort ganz ausfahren.",
   "Eine standortbezogene Gefährdungsbeurteilung ist Voraussetzung für sichere Einsatzbedingungen."
  ],
  [
   "h2-kabelschlaufe",
   "betrieb",
   "Ein Stromkabel liegt quer über dem Fahrweg der Bühne. Was ist richtig?",
   "Beim Verfahren könnte das Kabel eingeklemmt werden.",
   "Fahrweg frei machen und elektrische Leitungen vor Beschädigung schützen.",
   "Das Kabel mit den Rädern als Fahrbahnschwelle nutzen.",
   "Den Korb hochfahren, ohne den Bodenbereich zu kontrollieren.",
   "Überfahrene oder gequetschte Kabel können elektrische und mechanische Gefahren verursachen."
  ],
  [
   "h2-leitungsnaehe",
   "grundlagen",
   "Wer klärt die Schutzmaßnahmen an einer elektrischen Anlage?",
   "Die Bühne soll nahe an unter Spannung stehenden Betriebsmitteln arbeiten.",
   "Zuständige Stellen einbeziehen und abgestimmte Schutzmaßnahmen umsetzen.",
   "Die Person im Korb entscheidet allein nach Augenmaß.",
   "Der Abstand wird erst nach Beginn der Arbeit festgelegt.",
   "Arbeiten nahe elektrischen Anlagen erfordern geplante und abgestimmte Schutzmaßnahmen."
  ],
  [
   "h2-funkkommunikation",
   "betrieb",
   "Warum müssen Signale zwischen Boden und Korb eindeutig sein?",
   "Eine Person am Boden unterstützt das Rangieren.",
   "Damit Bewegungen nur nach klarer Verständigung ausgeführt werden.",
   "Damit mehrere Personen gleichzeitig widersprüchliche Anweisungen geben können.",
   "Damit der Notablass ohne Einweisung ausprobiert wird.",
   "Klare Verständigung reduziert Fehlbewegungen und Kollisionen beim Rangieren."
  ],
  [
   "h2-neuebedienung",
   "grundlagen",
   "Du wechselst auf eine andere Bauart von Bühne. Was ist erforderlich?",
   "Die Bedienfunktionen unterscheiden sich deutlich.",
   "Eine gerätespezifische Einweisung vor dem selbstständigen Einsatz.",
   "Nur das Lesen des Firmenlogos auf dem Gerät.",
   "Eine Probefahrt mit bereits ausgefahrenem Korb ohne Anleitung.",
   "Die Qualifizierung allein ersetzt nicht die Einweisung in den konkreten Gerätetyp."
  ],
  [
   "h2-steckanschluss",
   "grundlagen",
   "Was ist vor dem Anschluss eines Ladegeräts zu prüfen?",
   "Eine elektrische Hubarbeitsbühne soll aufgeladen werden.",
   "Geeigneten Anschluss und unbeschädigte Leitung gemäß Herstellerangaben prüfen.",
   "Jede Steckdose unabhängig von Zustand und Absicherung verwenden.",
   "Den Netzstecker während des Ladevorgangs regelmäßig herausziehen.",
   "Geeignete und intakte elektrische Anschlüsse schützen vor Stromschlag und Brand."
  ],
  [
   "h2-absperrpersonal",
   "betrieb",
   "Eine Person betritt während der Hubarbeit den abgesperrten Bereich. Was tust du?",
   "Du erkennst eine Person direkt unter dem Arbeitskorb.",
   "Gefährdende Bewegung unterbrechen und den Bereich räumen lassen.",
   "Weiterfahren, wenn die Person einen Schutzhelm trägt.",
   "Ein Werkzeug als Warnsignal in ihre Richtung fallen lassen.",
   "Eine Absperrung ersetzt nicht die Beobachtung des Gefahrenbereichs während des Betriebs."
  ]
 ]
};
 const ids=new Set(current.questions.map(q=>q.id));
 const added=Object.entries(rows).flatMap(([course,list])=>list.map(([id,topic,title,context,right,wrong1,wrong2,why],index)=>{
   if(ids.has(id))throw Error('Duplicate practice question: '+id);ids.add(id);
   const answers=[wrong1,wrong2,right];
   const correct=(index+course.length)%3;
   const reordered=correct===2?answers:correct===0?[right,wrong1,wrong2]:[wrong1,right,wrong2];
   return Object.freeze({id,course,topic,title,context,answers:Object.freeze(reordered),correct,why,source:current.courses[course].source});
 }));
 globalThis.ABBATE_PRACTICE_BANK=Object.freeze({courses:current.courses,questions:Object.freeze([...current.questions,...added])});
})();
