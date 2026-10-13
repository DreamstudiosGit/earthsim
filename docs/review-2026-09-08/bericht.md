**SimEarth 2.0 – Code-, UI- und UX-Analyse**

Stand: 8. September 2026. Es wurden keine Spielmechaniken, Quelldateien oder Abhängigkeiten geändert. Dieser Ordner enthält ausschließlich den Bericht und Prüfnachweise.

Das Spiel hat einen funktionierenden Simulationskern und einen erkennbaren Retro-Stil. Die größten Probleme liegen derzeit zwischen Simulation und Bedienoberfläche: Modellregler verändern die laufende Simulation nicht, einige erfolglose Aktionen kosten Energie und mehrere Anzeigen bleiben nach Eingriffen veraltet. Diese Fehler sollten vor weiterem Balancing oder größeren Erweiterungen behoben werden, weil sie das Verständnis der Spielregeln untergraben.

**Prüfumfang und belastbare Ergebnisse**

Untersucht wurden Anwendung und Fenstersteuerung, Speichern/Laden, Klima, Geologie, Flüsse, Biome, Leben, Zivilisation, Darstellung und Informationsfenster. Sprite- und Konstantentabellen wurden im Zusammenhang mit ihren Verbrauchern geprüft; eine vollständige Prüfung jedes einzelnen Bildpunkts war nicht Gegenstand der Analyse.

- `npm.cmd run typecheck`: erfolgreich.
- TypeScript separat in ein temporäres Verzeichnis kompiliert: erfolgreich. Das Ergebnis ist per SHA-256 identisch mit der vorhandenen `simulation.js`. Der Browser verwendet also den aktuellen Quellstand.
- Chrome mit isoliertem Browserkontext, direkt über `file://`: Start sowie gezielte Bedien- und Zustandsprüfungen erfolgreich ausführbar. Dabei wurde kein vorhandener Spielstand aus dem normalen Browserprofil verwendet.
- Oberflächenprüfung bei 1440 × 900, 1024 × 768, 390 × 844 sowie nach Verkleinerung eines geöffneten Fensters auf 780 × 600.
- Alle zwölf Kartenmodi und die sechs Klima-Overlays ließen sich in einer entwickelten Welt ohne Browserausnahme zeichnen.
- Drei deterministische Simulationsläufe mit jeweils 40 ausgesetzten Prokaryoten: Seed 12345 über 6.000 Schritte, Seeds 777 und 42 über jeweils 1.200 Schritte. Insgesamt 8.400 Schritte. Verwendet wurde die tatsächliche `App.tick`-Reihenfolge mit unterdrückten UI-Meldungen und Meilensteindialogen.
- An den geprüften Endzuständen keine nichtendlichen Werte in den untersuchten Fließkommafeldern und keine Verletzung der geprüften 0–1-Grenzen. Alle Landzellen hatten dort einen Abflussnachbarn. Das ist keine Garantie für alle Seeds, Eingriffe oder unbegrenzt lange Spiele.
- Seed 12345 erreichte Nanotechnologie. Endwerte: rund 12,27 °C globale Temperatur, 21,89 % Sauerstoff und 532,69 ppm CO₂. Der Spielstand mit 2.253.778 Zeichen ließ sich im isolierten Chrome-Kontext speichern.

Positiv sind die Trennung der Simulationssysteme, strenge TypeScript-Einstellungen, ein speicherbarer Zufallsgenerator, wiederverwendete Datenpuffer und Sprite-Caches. Insbesondere die Kopplung von Flüssen, Feuchtigkeit und Vegetation bietet eine gute Grundlage. Ein grundlegender Framework-Wechsel erscheint für die hier gefundenen Probleme nicht erforderlich.

Die folgenden Reproduktionen kombinieren echte Browserereignisse mit gezielt gesetzten Testzuständen. Letztere werden genannt, wo sie seltene Situationen wie beschädigte Spielstände, niedrige Habitatkapazität oder das Erreichen der Fenstergrenze nachstellen. Es wurde kein vollständiger menschlicher Spieldurchlauf und keine Prüfung in Firefox oder Safari durchgeführt.

**Bestätigte Codefehler**

Prioritäten: **P1** = zuerst beheben, zentrale Funktion oder bestehender Weltzustand betroffen. **P2** = relevante Fehlfunktion in bestimmten Situationen. **P3** = geringere Auswirkung oder seltener Randfall. Aufwand **klein / mittel / größer** ist eine relative Einschätzung einschließlich gezielter Prüfung, keine Zeit- oder Kostenzusage.

| ID | Priorität | Befund | Vorschlag und Begründung | Aufwand |
| --- | --- | --- | --- | --- |
| F01 | P1 | Alle 27 Modellregler sind von der laufenden Simulation entkoppelt. | Parameterreferenzen beim Reset erhalten oder Regler neu anbinden; danach Anzeigen beim Laden synchronisieren. Ohne diese Reparatur kann man die Modelle trotz bezahltem Öffnen nicht steuern. | Klein–mittel |
| F02 | P1 | Fehlgeschlagenes Laden kann die aktuelle Welt teilweise überschreiben; Werte werden unzureichend geprüft. | Zuerst den gesamten Spielstand validieren und in einen Zwischenzustand einlesen; erst bei Erfolg übernehmen. So bleibt die bisherige Welt bei jedem Ladefehler erhalten. | Mittel |
| F03 | P2 | Abgelehnte bzw. wirkungslose Platzierungen kosten trotzdem Energie. | Gültigkeit und tatsächliche Wirkung vor dem Abbuchen prüfen; Aktionen sollen ein eindeutiges Ergebnis zurückgeben. Das verhindert Ressourcenverlust ohne Gegenleistung. | Klein–mittel |
| F04 | P2 | Die Lebensraumprüfung akzeptiert Populationen ohne ausreichende Überlebenskapazität. | Dieselbe effektive Habitat- und Konkurrenzberechnung wie beim Wachstum verwenden. Sonst verspricht die Platzierung Erfolg, den die Simulation unmittelbar wieder zunichtemachen kann. | Mittel |
| F05 | P2 | Anzeigen und abgeleitete Zustände bleiben nach Eingriffen bzw. Neustart veraltet. | Eine gemeinsame Aktualisierung nach Weltänderungen einführen und die Cache-Abhängigkeiten von Examine vervollständigen. Gerade in Pause muss eine bezahlte Aktion sofort nachvollziehbar sein. | Mittel |
| F06 | P2 | Feuer verbrennt die zugrunde liegende Vegetation nicht. | Vegetation im betroffenen Gebiet reduzieren und Biome daraus neu ableiten. Nur so entstehen nachvollziehbare Brandschäden und eine anschließende Erholung. | Klein–mittel |
| F07 | P2 | Die Driftphase wird weder gespeichert noch bei einem neuen Planeten zurückgesetzt. | Den Zustand der Geologie ausdrücklich zurücksetzen und in das Speicherformat aufnehmen. Neue und geladene Welten dürfen keine Driftphase der vorherigen Sitzung übernehmen. | Mittel |
| F08 | P2 | Fenster geraten auf schmalen Bildschirmen und nach Größenänderung außer Reichweite. | Layout auf die tatsächliche Fläche begrenzen, beim Resize neu anordnen und eine Funktion zum Zurückholen der Fenster anbieten. Sonst sind zentrale Spielansichten nicht erreichbar. | Mittel |
| F09 | P2 | Auch ein Rechtsklick führt das aktive Werkzeug aus und berechnet Kosten. | Mausaktionen nach Taste filtern; Rechts- und Mittelklick gezielt definieren. So verändert ein beiläufiger Rechtsklick nicht die Welt. | Klein |
| F10 | P3 | Neuer Planet bzw. Laden während eines Meilensteindialogs übernimmt dessen vorübergehende Pause. | Vorübergehende Dialogpause und vom Spieler gewählte Geschwindigkeit getrennt behandeln. Nach dem Schließen des Dialogs durch einen Weltwechsel muss der Geschwindigkeitszustand eindeutig sein. | Klein |
| F11 | P3 | Der Fensterfokus funktioniert nach Erreichen der z-index-Grenze nicht mehr zuverlässig. | Fensterreihenfolge bei Bedarf neu durchnummerieren. Ein bloßes Deckeln erzeugt gleiche Ebenen, sodass später im DOM liegende Fenster andere überdecken. | Klein |

**Belege und Reproduktion zu den Fehlern**

**F01 – Modellregler:** In [src/app.ts:141](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:141) werden die Regler gebaut, danach ruft der Konstruktor `newPlanet()` auf (`:153`). `ModelParams.reset()` ersetzt die fünf Parameterobjekte ([src/params.ts:284](C:/Users/Winmonster/Documents/SimEarth2.0/src/params.ts:284)). Die Listener in `buildSliderPanel` halten aber die ursprüngliche Referenz fest ([src/panels.ts:13](C:/Users/Winmonster/Documents/SimEarth2.0/src/panels.ts:13), `:35`). Im Browser wurde „Solar Input“ von 50 auf 100 gesetzt: Die Anzeige wurde 100, `params.atmo.solarInput` blieb 0,5. Derselbe Bindungsfehler betrifft alle fünf Reglergruppen in den vier Modellfenstern, insgesamt 27 Regler. Auch die sichtbaren Reglerpositionen werden beim Laden nicht aus dem geladenen Zustand aktualisiert.

**F02 – Laden:** `deserialize` schreibt schon die Höhenkarte in die aktive Welt, bevor beispielsweise das Temperaturfeld vollständig geprüft ist ([src/app.ts:1290](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:1290), `:1308`, `:1315`). Im Test enthielt ein Spielstand eine geänderte erste Höhe und ein Temperaturarray falscher Länge. Ergebnis: „corrupt save“, aber die Höhe war bereits auf etwa 0,9876 verändert. Außerdem wurden ein negativer Energiewert, `timeScale = 999`, Biomindex 255 und ein Textwert als Sonneneinstrahlung ohne Ausnahme übernommen. `yearsPerTick` war anschließend `undefined`. Versions- und Größenprüfungen sind vorhanden, reichen aber nicht für Arraywerte, Enum-Grenzen, Parameter, Zeitwerte und die parallelen Lebensdaten aus. Ungültige Indizes können später auch Renderer beschädigen. Dieser Befund betrifft Robustheit bei beschädigten Daten, keine nachgewiesene externe Angriffsmöglichkeit.

**F03 – Kosten ohne Wirkung:** Bei Terraformern wird bereits in [src/app.ts:890](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:890) abgebucht; die Wasserprüfung des Monolithen folgt erst bei `:918`. Reproduktion mit 5.000 Ω: Monolith ins Wasser setzen, Fehlermeldung erhalten, anschließend nur noch 2.500 Ω. Auch wiederholtes Aussetzen derselben Art kostet erneut Energie ([src/app.ts:866](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:866)), obwohl `LifeSystem.seed` bei bereits ausreichender Dichte ohne Änderung zurückkehrt ([src/life.ts:790](C:/Users/Winmonster/Documents/SimEarth2.0/src/life.ts:790)). Test: 4.950 → 4.900 Ω, Dichte beide Male 0,20. Beim Pflanzen auf ausschließlich wasserbedeckter Pinselfläche wird ebenfalls vor dem Überspringen aller Wasserzellen abgebucht ([src/app.ts:789](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:789), `:843`).

**F04 – Habitatprüfung:** `habitabilityProblem` prüft einzelne Bedingungen, aber nicht das Produkt der Faktoren und nicht den effektiven Platz nach Konkurrenz ([src/life.ts:807](C:/Users/Winmonster/Documents/SimEarth2.0/src/life.ts:807)). Im gezielten Test mit Sauerstoff knapp über der Mindestgrenze wurde eine Säugetierplatzierung akzeptiert, obwohl die berechnete Kapazität nur etwa 0,00267 betrug. Das liegt unter 0,02, der Mindestdichte im Wachstum. Bei unveränderten Bedingungen nimmt die Population deshalb ab. Ein positiver Einzelwert genügt nicht als Nachweis eines tragfähigen Lebensraums.

**F05 – Veraltete Zustände:** Nach dem Aussetzen einer Art in Pause betrug die tatsächliche Dichte 0,20, aber `tileBiomass`, `lifeMarker` und die globale Artzählung blieben 0. Die Nachricht behauptete erfolgreiche Einführung; die Karte hatte noch keinen Marker und Examine zeigte gleichzeitig eine Population und „Barren“. Die Ableitungen werden erst im nächsten Simulationsschritt aktualisiert ([src/app.ts:748](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:748), [src/life.ts:759](C:/Users/Winmonster/Documents/SimEarth2.0/src/life.ts:759), `:790`). Beim Weltreset läuft außerdem `refreshDerived()` vor der Biomklassifikation ([src/world.ts:429](C:/Users/Winmonster/Documents/SimEarth2.0/src/world.ts:429)), sodass die Verteilung bis zum nächsten Tick nicht zur neuen Karte passt. Ein weiterer Cachefehler steckt in der Examine-Signatur ([src/panels.ts:452](C:/Users/Winmonster/Documents/SimEarth2.0/src/panels.ts:452)): Höhe fehlt als Abhängigkeit. Bei gezielter Höhenänderung von 225 auf 855 m blieb die Anzeige auf 225 m, solange die übrigen Signaturwerte unverändert waren.

**F06 – Feuer:** `EventSystem.fire` setzt Waldzellen auf `Grass` und schädigt Tiere, verändert aber `world.vegetation` nicht ([src/geo.ts:360](C:/Users/Winmonster/Documents/SimEarth2.0/src/geo.ts:360)). Kontrollierter Test auf einer Waldzelle: Biom `Forest` → `Grass`, Vegetation bleibt 0,80; nach `BiomeSystem.step` wieder `Forest`. Da Biome ohnehin aus Vegetation und Klima berechnet werden, ist die direkte Änderung des Biomlabels kein dauerhafter Brandschaden. Die Vegetationswirkung anderer zerstörerischer Ereignisse sollte im selben Zuge gezielt auf gewünschtes Verhalten geprüft werden.

**F07 – Driftphase:** `GeoSystem.offsets` enthält aufgesammelte Plattenbewegung ([src/geo.ts:13](C:/Users/Winmonster/Documents/SimEarth2.0/src/geo.ts:13), `:49`). `newPlanet` setzt nur Welt, Parameter und Historie zurück; `serialize` enthält die Offsets nicht. Gezielter Test: Offset beim Speichern 0,25, vor dem Laden 0,85, nach dem Laden weiterhin 0,85. Ein neuer Planet behielt ebenfalls einen zuvor gesetzten Offset von 0,75. Dadurch hängt der Zeitpunkt des nächsten Plattenschritts vom vorherigen Zustand der App ab. Zusätzlich rundet das Speicherformat mehrere Felder bewusst; eine Reparatur der Drift allein macht gespeicherte Fortsetzungen daher noch nicht bitgenau identisch.

**F08 – Fensterlayout:** Die Anfangsgeometrie wird einmal berechnet und setzt mindestens 720 px Desktopbreite voraus ([src/app.ts:128](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:128)). Die schmale CSS-Regel begrenzt die Fensterbreite, nicht ihre Position ([styles.css:921](C:/Users/Winmonster/Documents/SimEarth2.0/styles.css:921)); Desktop und Dokument schneiden Überläufe ab ([styles.css:31](C:/Users/Winmonster/Documents/SimEarth2.0/styles.css:31), `:178`). Bei 390 px Bildschirmbreite begann die Karte bei x = 436 und war vollständig unsichtbar. Nach Verkleinerung von 1440 auf 780 px blieb die Karte bei x = 914; das Editfenster war weiterhin 790 px hoch bei nur 600 px Bildschirmhöhe. Öffnen über das Menü setzt die Fensterposition nicht zurück.

**F09 – Maustasten:** Der `pointerdown`-Handler unterscheidet keine Maustasten ([src/app.ts:235](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:235)). Ein echter Rechtsklick auf das aktive Höhenwerkzeug senkte im Browser die Energie von 5.000 auf 4.950 Ω. Das Kontextmenü wird zwar unterdrückt, die Werkzeugaktion aber trotzdem ausgeführt.

**F10 – Dialogpause:** `showEventDialog` setzt die Geschwindigkeit vorübergehend auf 0; die Rückkehr erfolgt ausschließlich über den Schließen-Callback ([src/app.ts:1067](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:1067)). `newPlanet` und `load` verwenden dagegen `eventDialog.hide()`, das den Callback verwirft ([src/dialog.ts:129](C:/Users/Winmonster/Documents/SimEarth2.0/src/dialog.ts:129)). Reproduktion: Geschwindigkeit 3 → Meilensteindialog → neuer Planet. Der Dialog ist weg, Geschwindigkeit bleibt 0. Das Spiel kann über „Speed“ weitergesetzt werden; es ist kein dauerhafter Stillstand.

**F11 – Fensterstapel:** `WindowManager.focus` deckelt den Zähler auf 3999 ([src/windows.ts:141](C:/Users/Winmonster/Documents/SimEarth2.0/src/windows.ts:141)). Mit gezielt an die Grenze gesetztem Zähler erhielten Karte und anschließend fokussiertes Editfenster beide 3999. Bei Überlappung entscheidet dann die DOM-Reihenfolge. Der Fehler ist in längeren Sitzungen relevant; eine Neuordnung der vorhandenen Ebenen behebt ihn ohne unbegrenztes Wachstum.

**Angezeigte Funktionen, deren Umsetzung fehlt**

Diese Punkte sind von den oben reproduzierten Fehlfunktionen zu unterscheiden. Hier ist eine Produktentscheidung sinnvoll, bevor zusätzliche Regeln entwickelt werden.

| ID | Befund | Vorschlag und Begründung | Aufwand |
| --- | --- | --- | --- |
| M01 | „Art / Media“ besitzt keine Wirkung in den Simulationssystemen. Das Feld erscheint nur in Interface, Reglerdefinition und Standardwerten ([src/params.ts:201](C:/Users/Winmonster/Documents/SimEarth2.0/src/params.ts:201), `:248`, `:280`). | Eine konkrete Wirkung festlegen und implementieren oder den Regler vorläufig als in Entwicklung kennzeichnen. Auch nach F01 bleibt diese Einstellung sonst wirkungslos. | Klein für Kennzeichnung, mittel–größer für Mechanik |
| M02 | Nach Nanotechnologie fordert der Report zum „Exodus“ auf, aber es gibt weder Auslöser noch Abschlusslogik dafür ([src/panels.ts:413](C:/Users/Winmonster/Documents/SimEarth2.0/src/panels.ts:413); Technologieentwicklung endet in [src/civ.ts:194](C:/Users/Winmonster/Documents/SimEarth2.0/src/civ.ts:194)). | Entweder einen erreichbaren Abschluss definieren oder klar zum freien Weiterspielen übergehen. Ein nicht erreichbares Ziel erzeugt unnötige Suche und den Eindruck, etwas falsch zu machen. | Klein für Text, größer für Spielabschluss |

„DataSound“ kennzeichnet sich bereits ausdrücklich als nicht implementiert. Das ist transparent und wurde deshalb nicht als Defekt eingestuft.

**Weitere UI- und UX-Vorschläge**

Der Retro-Stil kann erhalten bleiben. Die folgenden Vorschläge betreffen vor allem Lesbarkeit, Rückmeldung und Orientierung.

| ID | Empfehlung | Begründung anhand des aktuellen Spiels | Priorität / Aufwand |
| --- | --- | --- | --- |
| U01 | Dauerhaft sichtbare Pause/Weiter-Steuerung, Geschwindigkeit, Zeitmaßstab und nächstes Ziel ergänzen. | Die Geschwindigkeit steckt im Menü; Meldungen verschwinden nach 4,2 Sekunden. Die wichtige Anfangsaufgabe „Seed life in the oceans“ steht im zunächst geschlossenen Report. Ohne Einführung kann der Spieler lange eine sterile Welt beobachten, weil Leben zuerst ausgesetzt werden muss. | Hoch / mittel |
| U02 | Werkzeugname, Kosten und tatsächliche Pinselfläche bereits beim Zeigen auf die Karte anzeigen. | Die sechs Werkzeuge starten als kleine Symboltasten; der Cursor markiert nur eine Zelle, obwohl Höhen- und Biomwerkzeuge 5 × 5 Zellen verändern und Ereignisse noch größere Flächen betreffen. Eine Flächenvorschau und eine Begründung für ungültige Ziele machen Eingriffe berechenbar. | Hoch / mittel |
| U03 | UI-Skalierung, breitere bzw. ausklappbare Auswahlpaletten und größere Bedienelemente anbieten. | Viele Beschriftungen sind 8–11 px groß. Die 96 px schmale Werkzeugleiste kürzt längere Namen; Schließen-Schaltflächen sind nur 11 × 11 px groß. Größere Bedienelemente helfen auf Notebooks, bei Touchbedienung und auf hochauflösenden Displays, ohne die Pixelgrafik des Planeten aufzugeben. | Hoch / mittel |
| U04 | Menüs per Tastatur bedienbar machen, Regler beschriften und Dialogfokus korrekt führen. | Alle sieben Menüeinträge sind nicht fokussierbare `div`-Elemente. Für sämtliche 27 Regler fehlt die programmatische Zuordnung eines Labels. Das Ereignisfenster besitzt keine Dialogsemantik und keine Fokusführung. Native Bedienelemente, zugeordnete Labels, klare Fokusmarkierung und passende Tastenaktionen verbessern Zugänglichkeit und allgemeine Bedienbarkeit. | Hoch / mittel |
| U05 | Kartenlegenden und Diagramme nach tatsächlichen Werten und Einheiten beschriften. | Die Lebenskarte verwendet artspezifische Farben, ihre Legende zeigt aber nur „SEA LIFE“ und „LAND LIFE“ ([src/render.ts:168](C:/Users/Winmonster/Documents/SimEarth2.0/src/render.ts:168), [src/app.ts:396](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:396)). Temperaturlegenden enthalten nur COLD/MILD/HOT. Im Luftdiagramm sind die Balken unterschiedlich normalisiert; ihr Längenverhältnis entspricht keinem gemeinsamen Gasanteil. Ohne Erklärung lassen sich falsche Zusammenhänge ablesen. | Mittel / mittel |
| U06 | Historie mit Zeitachse, sinnvollen Wertebereichen und Speicherung versehen; ein Ereignisprotokoll hinzufügen. | Temperaturwerte unter 0 °C werden im History-Plot alle an dieselbe Unterkante geklemmt ([src/panels.ts:338](C:/Users/Winmonster/Documents/SimEarth2.0/src/panels.ts:338)). Die X-Achse zählt Messpunkte ohne Zeitstempel, obwohl sich Jahre pro Tick ändern. Laden löscht die Historie; wichtige Meldungen verschwinden schnell oder werden durch andere Meldungen ersetzt. Ein Verlauf mit ablesbaren Zeiten hilft zu verstehen, warum eine Welt kippt. | Mittel / mittel–größer |
| U07 | Speichern sichtbarer und sicherer machen: Speicherdatum, mehrere Stände oder Export sowie Schutz vor versehentlichem „New Planet“. | Es gibt genau einen lokalen Speicherplatz. Ein neues Spiel ersetzt die aktive Welt unmittelbar; ein Laden ersetzt sie ebenfalls. Der gespeicherte Slot bleibt bei einem Neustart bestehen, aber ungespeicherter Fortschritt geht verloren. Eine Rückfrage nur bei ungespeicherten Änderungen oder eine Wiederherstellungsmöglichkeit reduziert diesen Verlust. | Hoch / mittel |
| U08 | Zoomen und direktes Verschieben der Karte ergänzen; Fenster anordnen/maximieren/zurücksetzen ermöglichen. | Die Detailansicht bleibt bei 16 px pro Zelle, Verschieben verlangt das Move-Werkzeug. Die Weltkarte ermöglicht Sprünge, ersetzt aber keine variable Detailstufe. Ein klarer Wechsel zwischen Übersicht und Eingriff reduziert unnötige Werkzeugwechsel. | Mittel / mittel |

Bei U05 sollte auch „Update Background“ geprüft werden: Der Menüpunkt schaltet tatsächlich die Ereignisebene und aktualisiert dabei die hervorgehobene Events-Taste nicht ([src/app.ts:598](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:598)). Beschriftung und gemeinsamer Zustand der beiden Bedienelemente sollten zusammenpassen.

**Performance und Absicherung**

**T01 – Neuzeichnen an Änderungen koppeln, insbesondere bei Pause und Globus.** Die Detailkarte wird in jedem Animationsframe neu gezeichnet, auch wenn die Welt pausiert und sich nichts verändert. Der Globus berechnet zudem pro Bild alle Projektionspixel neu und aktualisiert seine zugrunde liegende Welttextur vollständig ([src/app.ts:1141](C:/Users/Winmonster/Documents/SimEarth2.0/src/app.ts:1141), [src/render.ts:522](C:/Users/Winmonster/Documents/SimEarth2.0/src/render.ts:522), `:552`). In einer lokalen Messung an der entwickelten Welt bei 1440 × 900 und Geräteskalierung 1 lagen die medianen synchronen Aufrufzeiten ungefähr bei 1,4 ms für die flache Karte, 10 ms für den Globus und 13 ms für die Detailkarte. Das sind Messwerte dieses Headless-Setups, keine allgemeine FPS-Aussage. Das Optimierungspotenzial ist dennoch konkret: unveränderte Grundkarte zwischenspeichern, Cursor separat behandeln und Globusrotation von der Aktualisierung der Welttextur trennen. Priorität mittel, Aufwand mittel.

**T02 – Gezielte Regressionstests für die nachgewiesenen Fehler ergänzen.** Es gibt einen nützlichen Headless-Probelauf, aber kein `test`-Skript und keine automatisierte Prüfung dieser Bedien- und Speicherinvarianten. Besonders sinnvoll sind Reglerbindung nach Start/Reset/Laden, unveränderter Weltzustand nach gescheitertem Laden, keine Kosten ohne Wirkung, Anzeigen im pausierten Zustand und Vegetationsverlust durch Feuer. Solche Tests prüfen beobachtbares Verhalten und würden die wichtigsten gefundenen Fehler dauerhaft absichern. Priorität hoch, Aufwand mittel.

**T03 – Den vorhandenen Headless-Probelauf mit dem tatsächlichen Spielablauf abgleichen.** `tools/headless.js` führt die Simulationssysteme aus, übernimmt aber nicht die gesamte App-Logik für Jahre, Zeitmaßstäbe und Energie; außerdem richtet er den Rückruf für Zivilisationsereignisse nicht ein. Seine Biomausgabe dividiert auch Wasserbiome durch die Landzahl, obwohl die Beschreibung Landanteile verspricht. Für die Bewertung von Relief ist der Helfer nützlich, für Spielablauf, Alter und nukleare Ereignisse nur eingeschränkt repräsentativ. Gemeinsame Schrittlogik und klar getrennte Land-/Wasserstatistiken würden widersprüchliche Testergebnisse vermeiden. Priorität mittel, Aufwand mittel.

Ein umfassender Architekturumbau ist dafür nicht erforderlich. Als spätere Aufteilung bietet sich an, Aktionsvalidierung/Kosten und Speichern/Laden aus der rund 1.400 Zeilen langen `App` herauszulösen. Beide Bereiche besitzen eigene Regeln und verursachen derzeit mehrere der konkreten Fehler.

**Empfohlene Reihenfolge zur Auswahl**

1. **F01 und F02:** Steuerbarkeit und Schutz des bestehenden Weltzustands herstellen; mit den passenden Teilen von T02 absichern.
2. **F03 bis F07 sowie F09:** Aktionen, Rückmeldungen und Simulation konsistent machen.
3. **F08 sowie U01 bis U04 und U07:** Erreichbarkeit, Einstieg, Lesbarkeit und Bedienung verbessern.
4. **M01/M02:** Entscheiden, welche angekündigten Mechaniken tatsächlich zum Spiel gehören sollen.
5. **U05/U06/U08, T01/T03 und F10/F11:** Auswertung, Komfort, Performance und seltene Randfälle vervollständigen.

Die Kennungen können einzeln ausgewählt werden, beispielsweise „F01, F03, F06 und U01“. Es wurde noch keiner dieser Vorschläge umgesetzt.

**Prüfnachweise**

- [Zusammengefasste Mess- und Reproduktionsergebnisse](nachweise.json)
- [Startansicht bei 1440 × 900](desktop.png)
- [Startansicht bei 1024 × 768](laptop.png)
- [390 px breite Ansicht mit unerreichbarer Übersichtskarte](mobile.png)
- [Entwickelte Welt nach 6.000 Schritten](late-game.png)
- [Examine-Fenster in der entwickelten Welt](late-examine.png)

Die Screenshots zeigen tatsächliche Browserdarstellungen. Die zufällig generierten Startwelten unterscheiden sich zwischen den Ansichten; die entwickelte Welt stammt aus Seed 12345.
