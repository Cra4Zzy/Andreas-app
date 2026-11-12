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
 ],
 "krane": [
  [
   "k2-arbeitsplanung",
   "grundlagen",
   "Was gehört vor einem Kraneinsatz zur Arbeitsvorbereitung?",
   "Last, Standort und Transportweg sind noch nicht abgestimmt.",
   "Tragfähigkeit, Anschlagmittel, Lastweg und Gefahrenbereich vorab klären.",
   "Zuerst die schwerste Last ohne weitere Planung anheben.",
   "Nur den kürzesten Weg auf dem Hallenboden markieren.",
   "Eine geplante Kranbewegung benötigt geeignete Lastaufnahme, sichere Wege und abgestimmte Schutzmaßnahmen."
  ],
  [
   "k2-hakenposition",
   "lasten",
   "Wie wird der Kranhaken vor dem Anheben über der Last positioniert?",
   "Die Anschlagpunkte liegen unterhalb des Krans.",
   "Möglichst senkrecht über dem Lastschwerpunkt entsprechend der Anschlagung.",
   "Weit seitlich versetzt, damit die Last schneller einschwenkt.",
   "In jedem Fall am äußeren Rand der Last, unabhängig vom Schwerpunkt.",
   "Senkrechte Krafteinleitung und geeignete Anschlagpunkte vermindern seitliches Wegschlagen und unkontrollierte Bewegungen."
  ],
  [
   "k2-hakengabel",
   "grundlagen",
   "Ein Lasthaken zeigt eine auffällige Verformung. Was gilt?",
   "Der Haken sieht gegenüber seinem üblichen Zustand aufgebogen aus.",
   "Kranbetrieb unterbrechen und den Haken fachkundig überprüfen lassen.",
   "Die Verformung mit der nächsten Last zurückbiegen.",
   "Nur noch leichte Lasten anhängen und weiterarbeiten.",
   "Verformungen können die Sicherheit des Hakens beeinträchtigen; eine eigenmächtige Weiterbenutzung ist nicht zulässig."
  ],
  [
   "k2-zugueberlast",
   "lasten",
   "Die Last ist schwerer als zunächst angenommen. Was tust du?",
   "Bei der Vorbereitung ergeben sich neue Gewichtsangaben.",
   "Tatsächliche Last bestimmen und Tragfähigkeitsgrenzen erneut prüfen.",
   "Die Sicherheitsreserve durch schnelleres Heben ersetzen.",
   "Das Lastgewicht durch Anschlagen an einem anderen Punkt ignorieren.",
   "Sicheres Heben erfordert verlässliche Lastdaten und die Einhaltung aller relevanten Tragfähigkeiten."
  ],
  [
   "k2-arbeitskorb",
   "betrieb",
   "Darf ein gewöhnlicher Kranhaken ohne Weiteres Personen befördern?",
   "Eine Person möchte an eine hoch gelegene Arbeitsstelle gelangen.",
   "Nein, Personentransport erfordert dafür zulässige besondere Einrichtungen und Maßnahmen.",
   "Ja, wenn sich die Person am Anschlagseil festhält.",
   "Ja, sobald der Hub besonders langsam ausgeführt wird.",
   "Das Befördern von Personen ist nur unter besonderen, hierfür vorgesehenen Bedingungen zulässig."
  ],
  [
   "k2-bruecke",
   "betrieb",
   "Ein Brückenkran fährt auf einem gemeinsam genutzten Hallenweg. Was ist wichtig?",
   "Unter dem Transportweg halten sich Beschäftigte auf.",
   "Lastweg und Verkehrsbereich wirksam freihalten beziehungsweise absichern.",
   "Mit der Last knapp über den Köpfen der Beschäftigten fahren.",
   "Nur die Warnhupe statt weiterer Maßnahmen benutzen.",
   "Gefährdete Personen dürfen sich nicht unter schwebenden Lasten oder in deren Transportweg befinden."
  ],
  [
   "k2-zweitekrane",
   "betrieb",
   "Zwei Krane arbeiten in einem überschneidenden Bereich. Was ist notwendig?",
   "Ausleger oder Lasten könnten miteinander kollidieren.",
   "Einsätze koordinieren und geeignete Maßnahmen gegen gegenseitige Gefährdung treffen.",
   "Beide Kranführer arbeiten ohne Absprache gleichzeitig.",
   "Die Bewegungen werden bewusst beschleunigt, um Kreuzungen zu vermeiden.",
   "Überlappende Arbeitsbereiche erfordern eine abgestimmte Betriebsorganisation und geeignete Sicherungen."
  ],
  [
   "k2-pruefbuch",
   "grundlagen",
   "Welche Bedeutung hat die vorgeschriebene wiederkehrende Kranprüfung?",
   "Die Maschine wird regelmäßig im Betrieb eingesetzt.",
   "Sie ergänzt die Betriebskontrolle durch die vorgeschriebene fachkundige Prüfung.",
   "Sie ersetzt jede Sichtprüfung vor Arbeitsbeginn dauerhaft.",
   "Sie ist nur nach einem Absturz erforderlich.",
   "Wiederkehrende Prüfungen und laufende Einsatzkontrollen haben unterschiedliche Aufgaben."
  ],
  [
   "k2-absetzflaeche",
   "lasten",
   "Die vorgesehene Absetzfläche ist uneben. Wie handelst du?",
   "Die Last könnte beim Aufsetzen kippen.",
   "Geeignete tragfähige und stabile Unterlagen beziehungsweise Fläche vorbereiten.",
   "Last auf einer Ecke absetzen und unverändert hängen lassen.",
   "Eine Person während des Absetzens unter die Last stellen.",
   "Absetzflächen müssen die Last sicher aufnehmen und gefährliche Kipp- oder Rollbewegungen verhindern."
  ],
  [
   "k2-anfahrbereich",
   "betrieb",
   "Vor dem Anfahren des Krans befindet sich eine Person im Fahrbereich. Was tust du?",
   "Der Fahrweg ist durch eine Person blockiert.",
   "Bewegung erst starten, wenn der Gefahrenbereich frei und sicher ist.",
   "Die Person durch eine kleine Probefahrt zur Seite drängen.",
   "Ohne Sichtkontrolle allein anhand des Endschalters anfahren.",
   "Fahr- und Schwenkbewegungen dürfen keine Menschen gefährden."
  ],
  [
   "k2-schlaffseil",
   "lasten",
   "Warum darf das Hubseil beim Absetzen nicht unkontrolliert schlaff werden?",
   "Die Last liegt auf, der Haken wird weiter abgesenkt.",
   "Damit Seil und Haken nicht verklemmen oder unkontrolliert belastet werden.",
   "Damit die Last anschließend durch das Seil seitlich gezogen werden kann.",
   "Damit sich Anschlagmittel selbstständig vom Haken lösen.",
   "Unkontrollierte Seilführung kann zu Verwicklungen und gefährlichen Lastbewegungen führen."
  ],
  [
   "k2-pendel",
   "betrieb",
   "Eine transportierte Last gerät ins Pendeln. Was ist richtig?",
   "Die Last bewegt sich seitlich stärker als geplant.",
   "Bewegungen kontrolliert reduzieren und Pendeln ohne Personen im Gefahrenbereich beruhigen.",
   "Mit schnellen Gegenbewegungen und voller Fahrt kompensieren.",
   "Die schwingende Last mit bloßen Händen festhalten.",
   "Pendelnde Lasten können Personen und Einrichtungen treffen; ruhige Bewegungen vermindern das Risiko."
  ],
  [
   "k2-funkakku",
   "grundlagen",
   "Die Funksteuerung eines Krans hat eine schwache Batterie. Was gilt?",
   "Die Verbindung könnte während des Hebens abbrechen.",
   "Vor dem Einsatz eine zuverlässige Steuerverbindung sicherstellen.",
   "Noch schnell eine Last heben, bevor die Steuerung ausfällt.",
   "Bei Verbindungsverlust die Last durch Ziehen am Anschlagmittel bewegen.",
   "Zuverlässige Steuerung und Kommunikation sind Voraussetzung für kontrollierte Kranbewegungen."
  ],
  [
   "k2-mehrereanschlaeger",
   "betrieb",
   "Zwei Personen geben dem Kranführer gleichzeitig unterschiedliche Zeichen. Was ist richtig?",
   "Die Zeichen widersprechen einander.",
   "Bewegung unterbrechen und eindeutige Zuständigkeit klären.",
   "Das Zeichen der weiter entfernten Person bevorzugen.",
   "Die Bewegung nach eigenem Gefühl fortsetzen.",
   "Kranführer benötigen klare und eindeutige Verständigung, insbesondere bei unübersichtlichen Lastwegen."
  ],
  [
   "k2-endabschaltung",
   "grundlagen",
   "Warum darf eine Endabschaltung nicht als normale Hubbegrenzung missbraucht werden?",
   "Die Last wird häufig bis zum maximalen Hubweg bewegt.",
   "Endschalter sind Sicherheitseinrichtungen und ersetzen keine kontrollierte Bedienung.",
   "Endschalter erlauben grundsätzlich schnelleres Heben ohne Sicht.",
   "Sie sollen bei jedem Hub möglichst hart angefahren werden.",
   "Sicherheitseinrichtungen dienen dem Schutz vor Gefahren und dürfen nicht planmäßig überbeansprucht werden."
  ],
  [
   "k2-wetterbeobachtung",
   "betrieb",
   "Der Wind nimmt bei einer großflächigen Last deutlich zu. Was ist erforderlich?",
   "Eine große Bauteilfläche wirkt wie ein Segel.",
   "Wind- und Einsatzgrenzen beurteilen und gegebenenfalls das Heben einstellen.",
   "Die Last immer höher heben, damit der Wind weniger wirkt.",
   "Die Anschlagmittel durch dünnere ersetzen.",
   "Wind kann besonders bei großflächigen Lasten erhebliche Zusatzkräfte und Pendelbewegungen erzeugen."
  ],
  [
   "k2-ortswechsel",
   "grundlagen",
   "Was ist beim Versetzen eines Mobilkrans an einen neuen Standort wichtig?",
   "Untergrund und Stützbedingungen verändern sich.",
   "Standplatz und Abstützung vor erneuter Lastaufnahme prüfen.",
   "Die Einstellungen des vorherigen Standorts ungeprüft übernehmen.",
   "Die Abstützung während des Hebens nachjustieren lassen.",
   "Jeder Aufstellort kann andere Boden- und Stützlastbedingungen aufweisen."
  ],
  [
   "k2-betriebsbereich",
   "betrieb",
   "Ein Kran soll über eine Straße hinweg arbeiten. Was ist zu klären?",
   "Dritte könnten in den Gefahrenbereich gelangen.",
   "Erforderliche Sperrungen, Abstimmungen und Schutzmaßnahmen vor dem Hub.",
   "Die Fahrbahn nur mit einer Warnhupe sichern.",
   "Die Last ohne Sicherung möglichst schnell über Fahrzeuge heben.",
   "Eine sichere Verkehrsführung verhindert unzulässige Gefährdung Dritter durch Lasten und Kranbewegungen."
  ],
  [
   "k2-hochheben",
   "lasten",
   "Nach dem Probehub hängt eine Last deutlich schief. Was ist richtig?",
   "Der Schwerpunkt wurde offenbar falsch eingeschätzt.",
   "Last sicher absetzen und Anschlagung sowie Schwerpunkt erneut prüfen.",
   "Weiterheben, damit sich die Schieflage von selbst ausgleicht.",
   "Eine Person an der schiefen Last ziehen lassen.",
   "Der Probehub dient dazu, falsche Anschlagung und instabile Lastlage vor dem Transport zu erkennen."
  ],
  [
   "k2-schwebelast",
   "betrieb",
   "Darfst du eine angehobene Last unbeaufsichtigt hängen lassen?",
   "Die Schicht endet, aber die Last hängt noch am Haken.",
   "Nein, Last sicher absetzen und Kran ordnungsgemäß sichern.",
   "Ja, wenn der Kran gegen Wegfahren verriegelt wird.",
   "Ja, sofern ein Warnschild am Boden steht.",
   "Schwebende Lasten sind grundsätzlich nicht unbeaufsichtigt zu belassen."
  ],
  [
   "k2-mitnahme",
   "betrieb",
   "Ein Kollege möchte auf einer Kranlast mitfahren. Was gilt?",
   "Die Last soll zu einem höher gelegenen Punkt transportiert werden.",
   "Personen dürfen nicht auf oder an gewöhnlichen Lasten mitbefördert werden.",
   "Mitfahren ist zulässig, wenn der Kollege einen Helm trägt.",
   "Mitfahren ist immer erlaubt, sobald der Kollege dem Kranführer bekannt ist.",
   "Das Mitnehmen von Personen an Lasten führt zu erheblichen Absturz- und Quetschgefahren."
  ],
  [
   "k2-warnsignal",
   "betrieb",
   "Eine betriebliche Warnanlage am Kran fällt aus. Was ist richtig?",
   "Vor dem Anfahren ist kein vorgesehener Warnhinweis mehr möglich.",
   "Sicherheitsrelevanten Ausfall melden und Betrieb gemäß Vorgaben unterbrechen.",
   "Die Anlage ignorieren, wenn der Motor läuft.",
   "Die Warnung dauerhaft durch Klopfen auf das Gehäuse ersetzen.",
   "Erforderliche Warneinrichtungen müssen funktionsfähig sein, damit Personen rechtzeitig geschützt werden."
  ],
  [
   "k2-schneekante",
   "grundlagen",
   "Ein Autokran soll auf gefrorenem unebenem Boden abgestützt werden. Was gilt?",
   "Der Boden kann beim Auftauen an Tragfähigkeit verlieren.",
   "Tragfähigkeit und Stützsituation unter den tatsächlichen Bedingungen beurteilen.",
   "Gefrorener Boden ist immer beliebig tragfähig.",
   "Stützen ausschließlich auf kleine Steine stellen.",
   "Temperatur, Feuchte und Untergrundaufbau beeinflussen die Tragfähigkeit von Kranstandorten."
  ],
  [
   "k2-laufkatze",
   "betrieb",
   "Eine Laufkatze fährt auf ein Hindernis zu. Wie handelst du?",
   "Im Fahrbereich steht ein Gegenstand.",
   "Bewegung rechtzeitig stoppen und Hindernis sicher beseitigen lassen.",
   "Den Gegenstand mit der Last langsam wegdrücken.",
   "Mit erhöhter Geschwindigkeit am Hindernis vorbeifahren.",
   "Kranbewegungen müssen so geführt werden, dass keine Kollisionen mit Hindernissen auftreten."
  ],
  [
   "k2-anschlagaufnahme",
   "lasten",
   "Du sollst eine Last an einer nicht ausgewiesenen Öse aufnehmen. Was ist richtig?",
   "Die Öse könnte nur zur Montage einer Abdeckung bestimmt sein.",
   "Tragfähigkeit und Eignung des Anschlagpunkts vor Benutzung verifizieren.",
   "Jede Öse ist für volle Krantraglast geeignet.",
   "Die Öse nur mit zwei Personen gleichzeitig belasten.",
   "Nicht jede vorhandene Öse ist ein tragfähiger Anschlagpunkt für Kranlasten."
  ]
 ],
 "lasten": [
  [
   "l2-seilbruch",
   "grundlagen",
   "Ein Drahtseil zeigt mehrere gebrochene Einzeldrähte. Was ist richtig?",
   "Die Bruchstellen liegen im tragenden Seilbereich.",
   "Anschlagmittel nicht weiterbenutzen und fachgerecht beurteilen lassen.",
   "Die Drahtenden mit bloßen Händen zurückbiegen.",
   "Das Seil weiterverwenden, wenn die Last besonders leicht ist.",
   "Drahtbrüche können ein Ablegekriterium darstellen; beschädigte Seile müssen sachkundig beurteilt werden."
  ],
  [
   "l2-schaekel",
   "grundlagen",
   "Was ist bei der Verwendung eines Schäkels entscheidend?",
   "Ein Schäkel verbindet Anschlagmittel und Last.",
   "Geeignete Tragfähigkeit, unbeschädigten Zustand und ordnungsgemäßen Bolzen prüfen.",
   "Den Bolzen durch einen beliebigen Nagel ersetzen.",
   "Die Tragfähigkeit anhand der Farbe abschätzen.",
   "Schäkel müssen passend dimensioniert, vollständig und in der vorgesehenen Belastungsrichtung genutzt werden."
  ],
  [
   "l2-tragfaehigkeit",
   "lasten",
   "Was musst du bei einer mehrsträngigen Anschlagung beachten?",
   "Die Stränge verlaufen schräg zur Senkrechten.",
   "Tragfähigkeit der gesamten Anschlagart und Winkel berücksichtigen.",
   "Die Tragfähigkeit jedes Strangs einfach beliebig addieren.",
   "Die Last ausschließlich am leichtesten Strang einhängen.",
   "Neigungswinkel und wirksame Strangzahl beeinflussen die zulässige Belastung erheblich."
  ],
  [
   "l2-schweissnaht",
   "grundlagen",
   "Darf ein improvisierter Anschlagpunkt an eine Last geschweißt werden?",
   "Für die Last fehlen geeignete ausgewiesene Aufnahmepunkte.",
   "Nur fachgerecht ausgelegte und freigegebene Anschlagpunkte verwenden.",
   "Eine beliebige Schweißnaht genügt ohne Prüfung.",
   "Einen Haken durch eine Öffnung im Blech stecken.",
   "Anschlagpunkte müssen nachweislich für die Kräfte beim Heben geeignet sein."
  ],
  [
   "l2-einseitig",
   "lasten",
   "Eine Last ist auf einer Seite deutlich schwerer. Wie gehst du vor?",
   "Der Schwerpunkt liegt außerhalb der geometrischen Mitte.",
   "Schwerpunkt ermitteln und Anschlagung darauf abstimmen.",
   "Alle Stränge unabhängig vom Schwerpunkt gleich lang lassen.",
   "Die Last zuerst bis zur vollen Hubhöhe anheben.",
   "Bei außermittigem Schwerpunkt können Lasten unerwartet kippen oder einzelne Stränge überlastet werden."
  ],
  [
   "l2-kettenriss",
   "grundlagen",
   "Was gilt für eine Anschlagkette mit sichtbaren Rissen?",
   "An einem Kettenglied fällt ein Riss auf.",
   "Kette sofort aussondern und zuständige Person informieren.",
   "Den Riss mit Farbe markieren und unverändert heben.",
   "Das Glied mit Draht umwickeln und weiterverwenden.",
   "Risse an tragenden Kettengliedern sind sicherheitsrelevante Schäden und erfordern die Außerbetriebnahme."
  ],
  [
   "l2-lastfuehrung",
   "betrieb",
   "Wie führst du eine große Last bei Drehgefahr?",
   "Die Last kann während des Anhebens seitlich ausschwenken.",
   "Geeignete vorgesehene Führungsmittel und sicheren Abstand benutzen.",
   "Die Last während der Fahrt direkt zwischen den Händen halten.",
   "Unter die Last treten und sie von unten ausrichten.",
   "Lastführung darf nicht dazu führen, dass Hände oder Körper in den Gefahrenbereich geraten."
  ],
  [
   "l2-schnueren",
   "lasten",
   "Was ist bei der Schnürgang-Anschlagung wichtig?",
   "Das Anschlagmittel wird um ein Bauteil geführt.",
   "Eignung der Anschlagart und zulässige Belastung gemäß Kennzeichnung beachten.",
   "Die gleiche Tragfähigkeit wie bei jeder anderen Anschlagart annehmen.",
   "Das Anschlagmittel ungeprüft beliebig stark zusammenziehen.",
   "Die Schnürgang-Anschlagart kann die zulässige Tragfähigkeit ändern und muss korrekt angewendet werden."
  ],
  [
   "l2-winkelmesser",
   "lasten",
   "Warum darfst du einen flachen Strangwinkel nicht ignorieren?",
   "Zwei Anschlagstränge laufen nahezu waagerecht zur Last.",
   "Hohe Strangkräfte können die zulässige Tragfähigkeit überschreiten.",
   "Ein flacher Winkel macht den Strang automatisch stärker.",
   "Die Last verteilt sich unabhängig vom Winkel stets gleich.",
   "Bei zunehmendem Winkel zur Senkrechten steigen die Beanspruchungen der Stränge."
  ],
  [
   "l2-heisse-last",
   "grundlagen",
   "Was musst du bei einer heißen Last prüfen?",
   "Ein Stahlteil wurde kurz zuvor wärmebehandelt.",
   "Temperaturgrenzen der Anschlagmittel und geeignete Auswahl beachten.",
   "Jedes textile Anschlagmittel verträgt beliebige Temperaturen.",
   "Die Kennzeichnung spielt bei Hitze keine Rolle.",
   "Temperatur kann die zulässige Belastbarkeit von Anschlagmitteln beeinträchtigen."
  ],
  [
   "l2-abstand",
   "betrieb",
   "Darfst du beim Absetzen mit den Fingern unter die Last greifen?",
   "Die Last soll millimetergenau auf einer Unterlage landen.",
   "Nein, Abstand halten und geeignete Hilfsmittel verwenden.",
   "Ja, wenn du Arbeitshandschuhe trägst.",
   "Ja, wenn die Kranbewegung besonders langsam ist.",
   "Körperteile zwischen Last und Unterlage können eingeklemmt werden."
  ],
  [
   "l2-verbindung",
   "grundlagen",
   "Ein Verbindungsglied der Anschlagkette ist nicht verriegelt. Was gilt?",
   "Die Sicherung des Verbindungselements fehlt.",
   "Nicht anschlagen, bis das Verbindungselement korrekt gesichert ist.",
   "Den Bolzen ohne Verriegelung benutzen, sofern niemand zusieht.",
   "Das Element mit Klebeband verschließen.",
   "Verbindungselemente müssen vollständig und entsprechend ihrer Bauart gesichert sein."
  ],
  [
   "l2-lasthaken",
   "lasten",
   "Was prüfst du beim Einhängen in einen Kranhaken?",
   "Mehrere Anschlagmittel sollen in den Haken geführt werden.",
   "Sicheren Sitz und Eignung von Haken und Aufhängung sicherstellen.",
   "Anschlagmittel an der Hakenspitze auflegen.",
   "Die Hakensicherung durch einen Kabelbinder ersetzen.",
   "Die Kraft muss bestimmungsgemäß in den dafür vorgesehenen Bereichen eingeleitet werden."
  ],
  [
   "l2-fasern",
   "grundlagen",
   "Ein Hebeband zeigt starke Aufrauhung und Faserschäden. Was ist richtig?",
   "Tragende Fasern sind sichtbar beschädigt.",
   "Hebeband aussondern und fachkundig überprüfen lassen.",
   "Mit einem weiteren Knoten die Schäden verdecken.",
   "Die Last anschließend schneller anheben.",
   "Beschädigte tragende Fasern können die Belastbarkeit eines Hebebands erheblich mindern."
  ],
  [
   "l2-anheben",
   "betrieb",
   "Was gilt unmittelbar beim ersten Zentimeter des Anhebens?",
   "Die Last hebt gerade von ihrer Unterlage ab.",
   "Sitz der Anschlagung, Gleichgewicht und Bewegungsverhalten prüfen.",
   "Die Last ohne Kontrolle bis zur vollen Höhe ziehen.",
   "Unter der Last schauen, ob die Anschlagmittel gespannt sind.",
   "Ein kontrollierter Probehub macht mögliche Instabilitäten vor dem weiteren Transport sichtbar."
  ],
  [
   "l2-lastgewichte",
   "lasten",
   "Das Lastgewicht ist unbekannt. Was ist richtig?",
   "Das Bauteil besitzt keine Gewichtskennzeichnung.",
   "Belastbares Gewicht ermitteln, bevor Anschlagmittel ausgewählt werden.",
   "Das Gewicht anhand der Farbe der Last schätzen.",
   "Ein beliebiges Anschlagmittel mit doppelter Länge verwenden.",
   "Ohne bekanntes oder zuverlässig bestimmtes Gewicht lässt sich die Eignung der Anschlagmittel nicht sicher prüfen."
  ],
  [
   "l2-lose-teile",
   "betrieb",
   "Auf der zu hebenden Last liegen lose Werkzeuge. Was tust du?",
   "Beim Anheben könnten Werkzeuge herunterfallen.",
   "Lose Gegenstände vor dem Hub entfernen oder wirksam sichern.",
   "Werkzeuge bei der Fahrt mit einer Hand auffangen.",
   "Die Last etwas schneller anheben, damit nichts verrutscht.",
   "Lose Gegenstände können herabfallen und Personen im Umfeld gefährden."
  ],
  [
   "l2-wind",
   "betrieb",
   "Eine großflächige Last wird bei starkem Wind angeschlagen. Was gilt?",
   "Das Bauteil bietet dem Wind eine große Angriffsfläche.",
   "Windverhältnisse beurteilen und bei unsicherer Lage den Hub unterlassen.",
   "Die Last ohne Rücksicht auf Pendelbewegungen anheben.",
   "Zusätzliche Personen sollen die Last direkt festhalten.",
   "Windkräfte können die Lastführung und die Standsicherheit beim Transport beeinträchtigen."
  ],
  [
   "l2-unterlage",
   "betrieb",
   "Warum sind geeignete Unterlagen beim Absetzen wichtig?",
   "Eine runde Last würde auf dem Boden wegrollen.",
   "Last standsicher absetzen und gegebenenfalls gegen Rollen sichern.",
   "Die Last direkt auf den Anschlagmitteln stehen lassen.",
   "Die Unterlagen erst nach dem Absetzen unter die Last schieben.",
   "Geeignete Auflagen verhindern Umkippen und ungewollte Bewegungen beim Absetzen."
  ],
  [
   "l2-transportweg",
   "betrieb",
   "Was muss vor dem Lasttransport abgestimmt werden?",
   "Die Last wird über mehrere Arbeitsbereiche bewegt.",
   "Sicherer Lastweg, Verständigung und notwendige Absperrungen.",
   "Nur die voraussichtliche Dauer des Hubs.",
   "Eine Person soll unter der Last den Weg anzeigen.",
   "Der Lasttransport erfordert sichere Verkehrswege und eine eindeutige Koordination."
  ],
  [
   "l2-schutzschlauch",
   "lasten",
   "Was ist bei Anschlagmitteln mit Schutzschlauch zu beachten?",
   "Ein Band liegt an einer rauen Kante an.",
   "Schutzmittel entsprechend Eignung und Einsatzvorgaben auswählen.",
   "Jeder dünne Stofflappen ersetzt einen geeigneten Kantenschutz.",
   "Ein Schutzschlauch hebt jede zulässige Belastungsgrenze auf.",
   "Schutzmittel müssen zum Material, zur Kante und zum vorgesehenen Belastungsfall passen."
  ],
  [
   "l2-reinigung",
   "grundlagen",
   "Ein Hebeband wurde mit unbekannter Chemikalie verschmutzt. Was ist richtig?",
   "Das Band ist nicht mehr eindeutig zu beurteilen.",
   "Benutzung stoppen und Verträglichkeit beziehungsweise Zustand fachgerecht klären.",
   "Mit beliebigem Lösungsmittel reinigen und sofort weiterheben.",
   "Die Chemikalie ignorieren, solange das Band trocken ist.",
   "Chemikalien können die Festigkeit textiler Anschlagmittel beeinträchtigen."
  ],
  [
   "l2-aufhaengung",
   "lasten",
   "Was prüfst du bei mehreren Strängen am Aufhängeglied?",
   "Zwei Stränge werden gemeinsam in eine Aufhängung gelegt.",
   "Alle Verbindungselemente müssen geeignet und bestimmungsgemäß angeordnet sein.",
   "Ein Strang darf beliebig in die Hakenspitze ausweichen.",
   "Ein Ring mit Riss kann bei kleinen Lasten verwendet werden.",
   "Anschlag- und Verbindungselemente müssen tragfähig und korrekt angeordnet sein."
  ],
  [
   "l2-einweiserrolle",
   "betrieb",
   "Was gilt, wenn Anschläger und Kranführer keine Sichtverbindung haben?",
   "Ein Träger versperrt die Sicht auf den Absetzpunkt.",
   "Eindeutige sichere Kommunikation organisieren und bei Unklarheit stoppen.",
   "Durch Zuruf mehrerer Personen ohne Zuständigkeit koordinieren.",
   "Die Last ohne Einweisung anhand von Geräuschen bewegen.",
   "Fehlende Sicht muss durch wirksame Abstimmung und sichere Kommunikation ausgeglichen werden."
  ],
  [
   "l2-ausserbetrieb",
   "grundlagen",
   "Ein beschädigtes Anschlagmittel wurde aussortiert. Was ist zusätzlich wichtig?",
   "Es liegt weiterhin frei zugänglich neben einsatzbereiten Mitteln.",
   "Gegen erneute versehentliche Verwendung sichern und zuständige Person informieren.",
   "Das Mittel unmarkiert in den Bestand zurücklegen.",
   "Es nur bei einer besonders leichten Last noch einmal benutzen.",
   "Abgelegte Anschlagmittel müssen vor einer weiteren Benutzung zuverlässig geschützt werden."
  ]
 ],
 "bagger": [
  [
   "b2-schwenkradius",
   "betrieb",
   "Warum ist der hintere Schwenkradius eines Baggers kritisch?",
   "Das Heck bewegt sich über eine begrenzte Arbeitsfläche.",
   "Dritte können vom schwenkenden Oberwagen erfasst werden.",
   "Der Schwenkradius hat keinen Einfluss auf Personen neben der Maschine.",
   "Das Heck bewegt sich immer nur in Fahrtrichtung.",
   "Beim Schwenken entsteht ein Gefahrenbereich auch hinter der Maschine."
  ],
  [
   "b2-verkehrseinweiser",
   "betrieb",
   "Wie wird eine Fahrbewegung bei verdeckter Sicht abgesichert?",
   "Ein Bagger soll hinter einem Hindernis rangieren.",
   "Bei Bedarf geeignete Einweisung mit klarer Verständigung organisieren.",
   "Ohne Sicht auf die Signale des Einweisers fahren.",
   "Die Rückwärtsfahrt nur durch einmaliges Hupen absichern.",
   "Unübersichtliche Fahrwege erfordern wirksame Maßnahmen gegen Anfahren und Einklemmen."
  ],
  [
   "b2-standplatz",
   "grundlagen",
   "Was gilt für einen Baggerstandplatz am Hang?",
   "Der Boden ist geneigt und möglicherweise rutschig.",
   "Standsicherheit und Betriebsgrenzen der Maschine vor dem Einsatz prüfen.",
   "Bei jeder Neigung darf die Maschine beliebig weit ausfahren.",
   "Den Bagger grundsätzlich auf einer gelösten Erdschicht aufstellen.",
   "Böschungsneigung und Untergrund beeinflussen die Standsicherheit erheblich."
  ],
  [
   "b2-oberleitung",
   "betrieb",
   "Warum muss der Abstand des Auslegers zu Stromleitungen geplant werden?",
   "Der Ausleger kann beim Schwenken in Leitungsnähe kommen.",
   "Elektrischer Überschlag ist auch ohne direkten Kontakt möglich.",
   "Nur die Schaufel kann Strom leiten, nicht der Ausleger.",
   "Mit trockener Erde ist jeder Abstand automatisch sicher.",
   "Einsatzgrenzen und Schutzabstände müssen vor Annäherung an elektrische Anlagen geklärt werden."
  ],
  [
   "b2-fremdperson",
   "betrieb",
   "Ein Passant betritt die Baustelle im Schwenkbereich. Was ist richtig?",
   "Die Person steht plötzlich nahe der Baggerschaufel.",
   "Bewegung sofort unterbrechen und Bereich räumen lassen.",
   "Die Schaufel hochheben und über die Person schwenken.",
   "Die Person nur aus dem Seitenfenster weiter beobachten.",
   "Personen im Gefahrenbereich dürfen nicht durch Arbeitsbewegungen gefährdet werden."
  ],
  [
   "b2-parkstellung",
   "grundlagen",
   "Wie wird eine Erdbaumaschine nach Arbeitsende gesichert?",
   "Der Bagger bleibt unbeaufsichtigt auf der Baustelle.",
   "Arbeitsgerät absetzen, Maschine sichern und unbefugte Nutzung verhindern.",
   "Den Löffel in Kopfhöhe stehen lassen.",
   "Den Motor unbeaufsichtigt durchlaufen lassen.",
   "Eine ordnungsgemäße Abstellung vermindert unbeabsichtigte Bewegungen und Zugang für Unbefugte."
  ],
  [
   "b2-eigenlast",
   "lasten",
   "Warum sind Gerätegrenzen beim Heben mit einem Bagger entscheidend?",
   "Eine schwere Last soll am Ausleger aufgenommen werden.",
   "Standsicherheit und zulässige Lastaufnahme können sonst überschritten werden.",
   "Jede Maschine darf jede Last heben, solange die Schaufel passt.",
   "Nur die Länge des Anschlagseils entscheidet über das Risiko.",
   "Hebe- und Tragfähigkeitsangaben sind abhängig von Ausrüstung und Einsatzsituation."
  ],
  [
   "b2-untergrundhohlraum",
   "grundlagen",
   "Der Boden über einem alten Keller könnte hohl sein. Was tust du?",
   "Du sollst mit dem Bagger den Bereich befahren.",
   "Tragfähigkeit und mögliche Hohlräume vor dem Befahren klären.",
   "Die Stelle mit maximalem Schwung überqueren.",
   "Einfach eine schwere Last auf dem Untergrund ablegen.",
   "Hohlräume können unter Maschinengewicht einbrechen und die Maschine zum Absturz bringen."
  ],
  [
   "b2-feuchtigkeit",
   "grundlagen",
   "Nach Starkregen wird die Böschung weich. Was ist richtig?",
   "Ein Bagger arbeitet nahe der Böschungskante.",
   "Boden- und Standsicherheitsverhältnisse erneut beurteilen.",
   "Die Maschine näher an die Kante setzen, um die Reichweite zu erhöhen.",
   "Die Veränderungen bis zum Schichtende ignorieren.",
   "Durchfeuchtung kann die Tragfähigkeit und Standsicherheit von Böschungen verändern."
  ],
  [
   "b2-bodenprobe",
   "grundlagen",
   "Warum müssen Leitungspläne vor dem Aushub geprüft werden?",
   "Unter dem geplanten Aushub könnten Kabel verlaufen.",
   "Damit Leitungen erkannt und geeignete Sicherungsmaßnahmen geplant werden.",
   "Damit der Aushub unabhängig von fremden Anlagen schneller erfolgt.",
   "Weil Maschinen nie in der Nähe von Leitungen eingesetzt werden dürfen.",
   "Unterirdische Versorgungsleitungen erfordern eine zuverlässige Lageklärung vor Erdarbeiten."
  ],
  [
   "b2-maschinenzugang",
   "grundlagen",
   "Was gilt beim Ein- und Aussteigen an der Erdbaumaschine?",
   "Die Maschine steht auf unebenem Gelände.",
   "Vorgesehene Aufstiege benutzen und sicheren Halt gewährleisten.",
   "An der Hydraulikleitung aus der Kabine hinunterrutschen.",
   "Mit laufender Maschine auf den Schwenkarm springen.",
   "Sichere Aufstiege und geeignete Haltepunkte vermindern Sturz- und Quetschgefahren."
  ],
  [
   "b2-kupplung",
   "grundlagen",
   "Wie kontrollierst du einen neuen Tieflöffel nach dem Anbau?",
   "Der Löffel ist über den Schnellwechsler angeschlossen.",
   "Korrekte Verriegelung und vorgeschriebene Kontrollschritte sicherstellen.",
   "Den Löffel nur optisch aus größerer Entfernung beurteilen.",
   "Direkt unter den angehobenen Löffel treten.",
   "Fehlerhaft verriegelte Anbaugeräte können sich lösen und Menschen gefährden."
  ],
  [
   "b2-hydraulikwartung",
   "grundlagen",
   "Warum dürfen Hydraulikleitungen nicht unter Druck geöffnet werden?",
   "Ein Schlauch muss ausgetauscht werden.",
   "Austretende Flüssigkeit kann mit hohem Druck schwere Verletzungen verursachen.",
   "Der Druck verhindert stets das Austreten von Öl.",
   "Eine offene Leitung kann gefahrlos mit den Händen geprüft werden.",
   "Hochdruckflüssigkeit kann in Gewebe eindringen und erfordert sichere Druckentlastung."
  ],
  [
   "b2-fahrweg",
   "betrieb",
   "Du musst über eine provisorische Baustellenbrücke fahren. Was prüfst du?",
   "Die Brücke ist nur für bestimmte Lasten ausgelegt.",
   "Tragfähigkeit und Eignung für Gewicht und Abmessungen der Maschine.",
   "Ob die Brücke farblich zur Maschine passt.",
   "Nur ob ein leichter Pkw die Brücke bereits befahren hat.",
   "Behelfsbauwerke dürfen nur innerhalb ihrer nachgewiesenen Tragfähigkeit genutzt werden."
  ],
  [
   "b2-baggertransport",
   "betrieb",
   "Was ist beim Transport eines Baggers auf einem Tieflader wichtig?",
   "Die Maschine wird zur nächsten Baustelle gebracht.",
   "Maschine gemäß Transportvorgaben sichern und Ladeeinrichtung prüfen.",
   "Die Arbeitsausrüstung lose über den Rand hinausragen lassen.",
   "Während der Fahrt die Kabinentür offen halten.",
   "Transportsicherung und geeignete Ladeeinrichtungen verhindern Verrutschen und Herabfallen."
  ],
  [
   "b2-schaufelfuellung",
   "lasten",
   "Warum darf ein Radlader mit hoch gehobener Schaufel nicht schnell fahren?",
   "Die Last ist schwer und der Untergrund uneben.",
   "Ein hoher Schwerpunkt kann Kippgefahr und Sichtprobleme verstärken.",
   "Die Schaufel stabilisiert bei hoher Fahrtgeschwindigkeit automatisch.",
   "Die Schaufelhöhe ist für die Standsicherheit ohne Bedeutung.",
   "Ein angehobener Schwerpunkt verschlechtert typischerweise die Stabilität bei Fahrt und Kurven."
  ],
  [
   "b2-fussgaenger",
   "betrieb",
   "Wie verhältst du dich beim Rangieren neben Fußgängern?",
   "Der Baustellenzugang ist gleichzeitig ein Fußweg.",
   "Fahrbewegung erst bei sicher freiem und überschaubarem Bereich ausführen.",
   "Mit der Schaufel Fußgänger zur Seite dirigieren.",
   "Nur einmal hupen und ohne Sicht langsam weiterfahren.",
   "Fahr- und Personenverkehr müssen wirksam getrennt oder sicher koordiniert werden."
  ],
  [
   "b2-ueberlastwarnung",
   "lasten",
   "Beim Heben meldet die Maschine Überlast. Was tust du?",
   "Eine angehobene Last erreicht die zulässigen Grenzen.",
   "Gefährdende Bewegung stoppen und Lastsituation sicher korrigieren.",
   "Die Warnung abschalten und unverändert weiterheben.",
   "Die Last bei laufender Maschine ruckartig anziehen.",
   "Überlastwarnungen weisen auf mögliche Grenzüberschreitungen und Standsicherheitsrisiken hin."
  ],
  [
   "b2-wasserleitung",
   "grundlagen",
   "Beim Graben wird eine unbekannte Leitung freigelegt. Was gilt?",
   "Die Leitung ist nicht in den Bauplänen verzeichnet.",
   "Arbeiten im betroffenen Bereich stoppen und Leitung fachgerecht identifizieren lassen.",
   "Die Leitung mit der Baggerschaufel probeweise verschieben.",
   "Ohne Prüfung direkt unter der Leitung weitergraben.",
   "Unbekannte Leitungen können elektrische, gas- oder wassertechnische Gefahren verursachen."
  ],
  [
   "b2-hangefahrt",
   "betrieb",
   "Wie verfährst du einen Bagger auf einer starken Geländeneigung?",
   "Die geplante Fahrtroute führt an einem Hang entlang.",
   "Zulässige Neigung und vorgeschriebene Fahrweise der Maschine beachten.",
   "Unabhängig von den Herstellergrenzen quer zum Hang fahren.",
   "Den Ausleger weit nach außen schwenken, um das Fahrzeug auszugleichen.",
   "Die zulässige Hanglage hängt von Maschine, Untergrund und Herstellerangaben ab."
  ],
  [
   "b2-schlechtebeleuchtung",
   "betrieb",
   "Beim Arbeiten in einer dunklen Grube ist die Sicht unzureichend. Was ist richtig?",
   "Du kannst Personen und Hindernisse kaum erkennen.",
   "Arbeit unterbrechen, bis die Gefahrenbereiche ausreichend sichtbar sind.",
   "Die Grabgeschwindigkeit erhöhen, um den Einsatz schnell zu beenden.",
   "Auf die Beleuchtung verzichten, solange der Motor läuft.",
   "Sichere Sicht auf Fahr- und Arbeitsbereiche ist für kontrollierte Maschinenbewegungen erforderlich."
  ],
  [
   "b2-kettenverschleiss",
   "grundlagen",
   "Beim täglichen Check fällt ein beschädigter Raupenstrang auf. Was tust du?",
   "Eine Kettenverbindung zeigt deutliche Schäden.",
   "Maschine nicht unkontrolliert weiterbenutzen und Schäden melden.",
   "Mit hoher Geschwindigkeit weiterfahren, damit sich die Kette richtet.",
   "Nur auf weichem Boden ohne Prüfung weiterarbeiten.",
   "Beschädigungen am Laufwerk können Steuerbarkeit und Standsicherheit beeinträchtigen."
  ],
  [
   "b2-ladearbeiten",
   "betrieb",
   "Du belädst einen Lkw mit dem Bagger. Was ist wichtig?",
   "Der Lkw-Fahrer hält sich nahe am Ladebereich auf.",
   "Aufenthalt von Personen im Gefahrenbereich verhindern und Abläufe abstimmen.",
   "Mit der Schaufel über die ungeschützte Fahrerkabine schwenken.",
   "Die Beladung ohne Verständigung mit dem Fahrer beginnen.",
   "Beim Laden besteht Gefahr durch herabfallendes Material und Schwenkbewegungen."
  ],
  [
   "b2-arbeitsunterbrechung",
   "betrieb",
   "Du unterbrichst Baggerarbeiten für eine Besprechung. Was gilt?",
   "Die Maschine soll mehrere Minuten ohne Bedienung stehen.",
   "Arbeitsgerät sicher absetzen und Maschine gegen unbeabsichtigte Nutzung sichern.",
   "Die angehobene Schaufel als Markierung stehen lassen.",
   "Die Maschine unbeaufsichtigt mit eingelegtem Fahrantrieb lassen.",
   "Auch kurze Unterbrechungen erfordern einen sicheren Maschinenzustand."
  ],
  [
   "b2-rollmaterial",
   "lasten",
   "Beim Transport mit dem Radlader kann loses Material herunterfallen. Was ist richtig?",
   "Der Lader fährt nahe an Beschäftigten vorbei.",
   "Ladung sicher aufnehmen und eine sichere Fahrweise mit geeigneter Schaufelstellung wählen.",
   "Die Schaufel maximal hochheben, damit die Umgebung freie Sicht hat.",
   "Die Ladung ohne Begrenzung der Schaufelfüllung aufnehmen.",
   "Lose Ladung, hohe Schaufelstellung und schlechte Sicht können Personen und Verkehr gefährden."
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
