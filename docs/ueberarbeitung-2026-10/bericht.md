# Überarbeitung Oktober 2026 – Abschlussbericht

Grundlage: die vorhandene Version (Retro-Nachbau von *SimEarth: The Living Planet*, Maxis 1990) und der
Prüfbericht vom 8. 9. 2026. Das Original selbst lag nicht als Datei vor; der Wiedererkennungswert wurde an
der vorhandenen Version festgemacht: Pull-down-Menüs, Edit-/Kartenansicht mit Pixelkacheln im EGA-Stil,
Gaia, Modellfenster mit Reglern, Werkzeuge mit Ω-Kosten, Zeitalter, Katastrophen, Zivilisation.

Weitere Dokumente: [evolution.md](evolution.md) (Evolutionssystem), [quellenpruefung.md](quellenpruefung.md)
(fachliche Prüfung mit Quellen), [pruefliste.md](pruefliste.md) (Bestand und Prüfstatus),
`assets/README.md` (Grafiken).

## 1. Evolutionslogik

- **Neuer zentraler Evolutionsbaum** (`src/evolution.ts`) mit 31 Schritten: 2 Ursprung, 14 Pflanzen, 15 Tiere.
  Abstammung, Lebensraum und ökologische Beziehungen sind getrennte Daten und werden getrennt geprüft und
  dargestellt. Spielmechanik, Baumansicht, Ereignistexte und Chronik lesen dieselben Einträge.
- **Pflanzen sind eine eigene Schicht** (`src/flora.ts`): 14 Pflanzengruppen mit Lebensraumansprüchen
  (Temperatur, relative Feuchte, Wasserzugang, Höhe), Ausbreitung von Feld zu Feld und selten über weite
  Strecken. Daraus ergibt sich ohne Skript die Dramaturgie Meer → Ufer → Sumpf → Fluss → Landesinneres.
  Süßwasser-Grünalgen bilden den Übergang zu den Landpflanzen; Moose sind eine Schwesterlinie der
  Gefäßpflanzen; Laubbäume gehören zu den Blütenpflanzen; Urbäume, Bärlapp-Schuppenbäume und Nadelbäume
  haben eigene Einordnungen.
- **Biome hängen von den Pflanzen ab:** Wald braucht Bäume, Nadelwald Nadelbäume, bemooste Kälte wird zur
  neuen **Tundra**, offenes Land heißt „Offenland“.
- **Tiere fressen, was es gibt:** Tragfähigkeit = Biom × Temperatur × Sauerstoff × Nahrung auf dem Feld
  (Plankton, Algenwiese, Pflanzengruppen, Beutetiere). Konkurrenz vor allem innerhalb gleicher Lebensweise.
- **Entwickeln statt Zufall:** Neue Gruppen werden mit Evolutionspunkten (EP, aus der Vielfalt lebender
  Gruppen) entwickelt; die ersten Populationen entstehen neben den Vorfahren. Unterarten entstehen weiter
  von selbst (Regler „Mutationsrate“).
- **Pflanzen–Tier-Verknüpfungen mit echter Wirkung:** Bestäuber (+20 % Dichte, doppelte Ausbreitung von
  Blütenpflanzen und Laubbäumen), fleischfressende Pflanzen (dichter bei Insekten), Vögel (doppelte
  Fernverbreitung von Samen), Moose/Farne als Bodenbildner für Urbäume. Blütenpflanzen sind ohne
  Bestäuber erreichbar.
- **Korrigierte Widersprüche des Vorgängers:** Fische nicht mehr aus Gliederfüßern/Weichtieren, Wale aus
  Säugetieren, Säugetiere als Schwesterlinie der Reptilien, Carnifern nicht mehr aus Insekten, fiktive
  Trichordaten durch Landgliederfüßer ersetzt. Alle Abstammungsaussagen wurden mit Fachquellen geprüft.
- **Keine Sackgassen:** Ausgestorbene Gruppen werden gemeldet und lassen sich neu ansiedeln; fehlende
  Bedingungen werden konkret benannt.

## 2. Oberfläche und Grafiken

- **Neues Designsystem** (`styles.css`): dunkle Natur-Farbwelt, dichtes, gut lesbares Glas, Farbcodes
  Pflanzen grün / Tiere bernstein / Ursprung teal / Energie gold / EP violett, Systemschrift, klare
  Hierarchie, sanfte Animationen (respektiert „Bewegung reduzieren“).
- **Hauptansicht:** Die Kachelkarte füllt die Bühne (Zoom per Mausrad/Pinch/Knöpfe, Verschieben mit Maus
  Mitte/rechts, Werkzeug oder einem Finger), Pinsel-Vorschau und Kosten-Tooltip, Werkzeugdock mit
  bebilderten Paletten (gesperrte Gruppen öffnen den Baum), Kartenebenen, Ziel-Leiste „Nächster Schritt“.
- **Kopfleiste:** die Menüs des Originals (Datei, Fenster, Modelle, Diagramme, Optionen, Tempo) als
  moderne, tastaturbedienbare Pull-downs, Ressourcen Ω/EP, O₂/CO₂/Temperatur, Zeitalter und Datum,
  Pause/Tempo, Evolution-Knopf mit Zähler. Mobil: Menü-Blatt, kompakte Leiste.
- **Alle Fenster neu gestaltet:** Evolutionsbaum (neu), Chronik (neu), Übersichtskarte (12 Modi mit
  Symbolen und Legenden), Gaia, Verlauf (mit Zeitachse und Bereich unter 0 °C), Bericht (Kennzahlen statt
  Textblock), Glossar (Abstammung/Lebensraum/Ökologie erklärt), Untersuchen (Lebensraum, Pflanzen des
  Feldes, Tiere, Eignung mit Namen), vier Modellfenster (Regler mit Beschriftung, Erklärung,
  Standardwerten), vier Diagramme (mit eigenen Skalen und Leerzuständen), Spielstände-Dialog,
  Rückfragen, Fehlerdialog beim Laden.
- **151 SVG-Dateien** in `assets/` (31 Evolution, 75 Oberfläche, 8 Ressourcen, 20 Lebensräume,
  17 Ereignisse), einheitliche Bildsprache, alle eingebunden. Die Kachelkarte bleibt Pixelkunst und
  wurde um Bodentexturen, 14 Pflanzen-Overlays und neue Tiersprites erweitert.
- **Ereignisse:** jede Entwicklung erhält einmalig eine Karte (Titel, Erklärung, konkrete Änderung,
  „Im Evolutionsbaum ansehen“); große Meilensteine eine hervorgehobene Karte; geordnete Warteschlange;
  bereits gezeigte Ereignisse werden gespeichert und nach dem Laden nicht wiederholt; alles bleibt in
  Chronik und Baum nachlesbar.

## 3. Speicherung

- Format 5: komprimiert, stabile Kennungen (Klassen, Pflanzengruppen, Schritte per Namen), drei Plätze,
  automatische Sicherung, Angebot „Weiterspielen“ beim Start.
- Laden prüft vollständig in einen Zwischenzustand und übernimmt erst danach; bei Fehlern bleibt der
  laufende Planet unverändert (Befund F02 des Vorberichts).
- Version-4-Spielstände werden migriert und nie gelöscht; jede Umdeutung wird gemeldet.

## 4. Behobene Befunde des Prüfberichts vom 8. 9. 2026

F01 Regler-Bindung · F02 Laden atomar · F03 keine Kosten ohne Wirkung · F04 Platzierung prüft echten Platz ·
F05 Anzeigen nach Eingriffen aktuell · F06 Feuer verbrennt Vegetation · F07 Driftphase zurückgesetzt und
gespeichert · F08 Fenster erreichbar · F09 nur Primärtaste löst Werkzeuge aus · F10 keine hängende
Dialogpause · F11 begrenzter Fensterstapel · M01 „Kunst/Medien“ wirkt · M02 kein unerreichbarer „Exodus“ ·
U01–U08 umgesetzt · T01 Kartenzeichnung zwischengespeichert · T02 automatisierte Tests · T03 Headless-Werkzeug.

## 5. Prüfungen (tatsächlich ausgeführt)

| Prüfung | Ergebnis |
|---|---|
| `npm test` (32 automatisierte Tests: Baumdaten, Zyklen, Kennungen, Nahrungs-Konsistenz, Entwickeln/Kosten/Doppelklick, Aussterben, 3 komplette Durchläufe mit verschiedenen Strategien, Simulation inkl. F01/F03–F07, Speichern/Laden, 9 beschädigte Varianten, Formatfehler, Migration v4) | 32/32 bestanden |
| Greedy-Durchlauf auf 16 zufälligen Planeten (Seeds 1–8, 11–37) | 16/16 erreichen alle 31 Schritte (~4.700 Zeitschritte) |
| Funktionstest Desktop im Browser (Prüf-Agent, 18 Skripte, 379 Prüfungen, 1440/1920 px und 700–1280 px) | alle Abläufe außer den gemeldeten Befunden F-01–F-09 bestanden; diese wurden behoben |
| Darstellung/Mobil/Kontrast/Leistung (Prüf-Agent, 7 Viewports von 390 bis 2560 px, Touch per CDP) | 3 hohe, 8 mittlere, 11 niedrige Befunde gemeldet; alle behoben |
| Nachprüfungen nach den Korrekturen (selbst ausgeführt) | Kopfleiste ohne Überbreite 320–2000 px (früh und spät); Pinch zoomt ohne Kosten, Tippen untersucht, Ziehen verschiebt; Verschiebe-Optimierung pixelgleich zur Neuzeichnung (0,4–0,6 ms statt 17–50 ms); Fehlerdialog beim Laden lässt den Planeten unverändert; Baum-Ereignis erscheint im Detailbereich statt als Überlagerung |
| Konsole | in allen Läufen keine Fehler; einzige frühere Warnung (Globus) behoben |

Nachweis-Screenshots: `nachweis-karte-desktop.png`, `nachweis-baum-desktop.png`, `nachweis-mobil-baum.png`.

## 6. Einschränkungen und ungeprüfte Bereiche

- Ein **Regressionslauf der beiden Prüf-Agenten** gegen den allerletzten Stand wurde begonnen, aber durch ein
  Nutzungslimit abgebrochen. Die Korrekturen sind durch die Testsuite und gezielte eigene Browserprüfungen
  abgesichert, nicht durch eine vollständige Wiederholung aller 379 Agenten-Prüfungen.
- Geprüft nur in Chrome (headless, DPR 1). Firefox, Safari, echte Touch-Geräte und hochauflösende
  Bildschirme (DPR 2) wurden nicht getestet. Komprimierte Spielstände brauchen `CompressionStream`
  (in aktuellen Browsern vorhanden; sonst wird unkomprimiert gespeichert).
- **Leistung:** Ein Simulationsschritt kostet im späten Spiel ~14 ms (vorher ~9 ms) wegen der reicheren
  Tierwelt; bei „Schnell“ ist das spürbar, aber flüssig. Bei 2560 px dauert eine vollständige
  Kartenneuzeichnung ~50 ms und wird deshalb gedrosselt.
- Klang (DataSound) ist weiterhin nicht umgesetzt und als „noch nicht verfügbar“ gekennzeichnet.
- Ein echter alter Spielstand (Version 4) lag nicht vor; die Migration wurde mit synthetischen,
  formatgetreuen Spielständen geprüft. Der alte Speicherplatz wird nie verändert.
- Der Karten-Hover-Tipp (Lebensraum/Temperatur/Kosten) ist auf Touch-Geräten nicht verfügbar; dort
  liefert „Untersuchen“ die Information (5 Ω).
