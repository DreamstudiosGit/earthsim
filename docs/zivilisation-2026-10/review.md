# Review Zivilisation (C4)

Stand: 15. 10. 2026 · unabhängige Prüfung gegen `docs/zivilisation-spec.md` (Revision 2, §6 und §7) und die
Abnahmekriterien des Nutzers. Kein Code geändert.

> **Nachprüfung vom 15. 10.:** Das Gesamturteil ist jetzt **abnahmereif mit kleinen offenen Punkten**, siehe den
> Abschnitt „Nachprüfung (15. 10.)“ am Ende. Das Folgende ist die Erstprüfung vom 14./15. 10.

## Urteil (Erstprüfung): **bedingt abnahmereif**

Alle harten Vorgaben des Nutzers halten in Probe, Tests, Ladeprüfung und Browser: Abstand ≥ 7, keine Gründung auf
Fels, Wüste, Eis oder Wasser, Wassergrenzen je Zeitalter, ein Konflikt zur Zeit mit Frieden und Meldungen,
unverändertes Speicherformat, keine Zivilisation für Meerestiere. Alle 33 Zivilisationstests sind grün; die
10 roten Tests der Gesamtsuite stammen nachweislich aus anderen Sitzungen. Es gibt keinen Blocker. Sechs Punkte mittlerer Schwere brauchen aber eine Entscheidung oder eine Nachbesserung:

- Nach dem Laden tragen die meisten Städte und fast alle Völker andere Namen.
- In der Spätphase steigt der Landanteil über 0,5 %, und Konflikte und Seuchen häufen sich.
- Die Zeitalter dauern sehr ungleich lang.
- Im echten Spiel sind die Städte zwischen den vielen Tier-Icons bei 16 px schwer zu finden.

## Grundlage

- **Bundle:** eigener Build des Arbeitsbaums vom 14. 10., 23:42 Uhr (mit unfertiger Arbeit der Geologie-, Epochen- und
  Ereignis-Sitzungen).
- **Probe:** `tools/civ-probe.js 2500 12345 777 4242 2024` und `2500 12345 --epoch=today`.
- **Eigene Prüfskripte** (Scratch, nicht im Repo):
  - Zeitalter und Knappheit je Zeitalter, Drift, Namen (3 Läufe)
  - Speichern und Laden mit Altstand-Teppich
  - Vorgeschichte gegen HEAD-`civ.ts`
  - Chrome über das DevTools-Protokoll
- **Browser:** headless Chrome, Kopie von `_preview.*` mit eigenem Bundle, Sperre `simearth-sheet.lock`.
  - Gieriger Baum bis zur Intelligenz, dann +300, +800 und +1500 Ticks.
  - Seed 12345 auf zufälligem Planeten und auf der Erde von heute; in beiden Läufen wurden Vögel intelligent.
  - Desktop 1440 × 900 bei 10, 16, 32 und 48 px; Handy 390 × 844 bei DPR 3 per Geräteemulation; `?terrain=legacy`
    nach Speichern und Laden.

## Abnahme (§6 und Vorgaben des Nutzers)

| Kriterium | Ziel | Ergebnis | Beleg |
|---|---|---|---|
| Keine flächige Bebauung | Paare ≥ 7; Stadtkacheln < 0,5 % des Landes | **teilweise** | Abstand min. 7,0 in allen Läufen (Probe, Browser, Laden). Landanteil Ende Eisenzeit 0,13–0,20 %, bei +2500 aber 0,55 / 0,85 / 0,72 %. Die Probe prüft den Anteil nicht (kein CHECK). |
| Wenige, erkennbare Städte | Ende Steinzeit 3–10, Ende Eisenzeit 8–25 | **teilweise** | Steinzeit 3 / 10 / 11, Eisenzeit 25 / 25 / 18 (12345 / heute / 2024). Seeds 777 und 4242 haben bis Tick 6000 keine denkfähige Landklasse, auch nicht erzwungen. Erkennbarkeit: siehe M6, `review-16px-erde.png`, `review-zeitalter-ben.png`. |
| Standorte | 0 auf verbotenem Boden; ≥ 70 % Fluss/Küste | **erfüllt** | 0 schlechte Gründungen; 100 % / 95 % / 97 % an Fluss oder Küste. `review-32px-fluss-kueste.png`. |
| Siedler sichtbar | ≥ 30 % der Ticks; ≤ 5; Weg ≥ 7 | **erfüllt** | 41–50 % bis zur letzten Gründung; max. 5; Mindestweg 7 (`migration.ts:145`). Steinzeit nur 3–14 % (2c). `review-siedler-32px.png`. |
| Wasser je Zeitalter | Stein ≤ 2, Bronze ≤ 3, Eisen ≤ 6, ab Industrie offen | **erfüllt** | Test „settlers cross as much water …“ grün; Code `SETTLER_WATER`. |
| Optik je Zeitalter | 7 Bausätze; Größen bei 16 px | **erfüllt** | Atlas-Prüfung 0 Probleme, 45 Bausteine; Steinhütte → Fachwerk → Ziegel im echten Spiel: `review-zeitalter-ben.png`. |
| Städte fest in der Landschaft | Skalierung wie Bäume; Markierung < 16 px | **erfüllt** | Skalierung wie die Landschaft (`citylayer.ts`). Verschieben: 0 abweichende Pixel gegenüber dem vollen Neuzeichnen, in 6 Verschiebungen mit 8–34 Stadtkästen; der Überstand bleibt. Markierung: `review-10px-markierung.png`. |
| Völker | ≥ 2 bis Eisenzeit | **erfüllt** | 4–8 Völker am Ende der Bronzezeit. |
| Hunger und Seuchen | nur bei Knappheit; ab Industrie mit Medizin seltener | **teilweise** | Ausbruch nur bei Knappheit (Code, Test). Ab Industrie aber häufiger statt seltener: 10–26 / 1000 Ticks in der Industrie, 57–112 im Atom- und Nanotech-Zeitalter (siehe 2d, M4). |
| Konflikte selten, nachvollziehbar, kein Dauerkrieg | 2–12 in 1000 Ticks; nie 2; Pause ≥ 40; Paar ≥ 200; Meldungen | **teilweise** | Spec-Fenster 7 / 8 / 2, nie 2 gleichzeitig, Pause min. 40, Paar min. 201, Meldungen 18/18 und 20/20. Ab Industrie 7–15 / 1000. 53–70 % der Kriege führt das größte Volk (M3). `review-konflikt-32px.png`. |
| Vegetation und Tiere sichtbar | Herden zwischen den Städten | **erfüllt** | 16 px, 32–34 Städte im Bild: 427–508 Tier-Icons im Bild; Abstand 1 Feld (Test grün). |
| Klima | Industrie +60–150 ppm in 500 Ticks (12345) | **erfüllt (knapp)** | 12345: +146. Streuung groß: heute +169, 2024 +43. Spätphase 980–1590 ppm bei +2500. |
| Laden | Teppich, verbotene Böden zuerst, ≥ 7 | **erfüllt** | Siehe Abschnitt Laden. Altstand mit 3545 Stadtfeldern (2081 auf verbotenem Boden, Bevölkerung 0,99) → 128 Städte, 0 auf verbotenem Boden, min. 7,07, 8 Völker, 93 ms. |
| Speicherformat unverändert | kein Zivilisationsfeld | **erfüllt** | `git diff src/save.ts` ohne Zivilisationsbezug (nur `upliftKind` und `SAVE_FORMAT` 8 der Geologie). |
| Namen aus Seed und Position | deterministisch | **erfüllt, aber nicht stabil** | Nach dem Laden ist der Name = `civName(seed, x, y)`. 50–90 % der Städte sind seit ihrer Gründung gedriftet und heißen danach anders; die Völker heißen fast alle anders (M1). |
| Wasserlebende Arten | keine Zivilisation | **erfüllt** | `sentienceCandidate` nur Land, Monolith und Stadtwerkzeug nur Landklassen; Test grün. |
| Leistung | `civ.step` < 2 ms; Stadtebene < 2 ms je Neuzeichnung | **erfüllt** | `civ.step` im Mittel je 100 Ticks höchstens 1,52 ms (99 Städte, Desktop-CPU). Stadtebene Median 0,3 ms (16 px, 32–34 Städte im Bild), 0,5–0,6 ms (10 px, 43–47 Städte), 0,1 ms (32 px). Erstes Zusammensetzen 15–50 ms (K3). |
| Gesamt | `npm test` grün | **nicht erfüllt, nicht durch die Zivilisation** | 221 Tests, 211 grün, 10 rot. Keiner davon ist ein Zivilisationstest, siehe Abschnitt Tests. |

### Probe im Überblick

| | 12345 zufällig | 12345 heute | 2024 zufällig |
|---|---|---|---|
| Intelligenz | Vögel, Tick 5028 | Säugetiere, Tick 5982 | erzwungen bei Tick 6000, Reptilien |
| Dauer Stein / Bronze / Eisen / Industrie / Atom (Ticks) | 467 / 90 / 656 / 143 / 532 | 766 / 266 / 221 / 211 / 166 | 693 / 10 / 212 / 468 / 403 |
| Städte / Völker bei +2500 | 76 / 8 | 95 / 8 | 99 / 8 |
| Konflikte (Ausgang) | 20 (20 gehalten) | 18 (14 gehalten, 4 übernommen) | 10 (9 gehalten, 1 übernommen) |
| Seuchen | 75 | 74 | 71 |
| `civ.step` max. | 1,47 ms | 0,71 ms | 1,52 ms |
| alle CHECK-Zeilen | ok | ok | ok |

## Laden und Speichern

**Gespieltes Spiel, Node:** Seed 12345, +1300 Ticks; 30 Städte, 8 Völker, eine Siedlergruppe, 3 Friedenspaare.

- Gleich nach dem Laden: alle 30 Städte auf derselben Kachel, gleiche Bevölkerungssumme.
- Verloren, wie in §2.11 genannt: die Siedlergruppe, die Friedenspaare und die Gründungsticks; danach 100 Ticks
  Konfliktruhe.
- Namen:
  - 16 von 30 Städten behalten ihren Namen.
  - 0 von 30 behalten ihr Volk dem Namen nach, 1 von 8 Volksnamen bleibt.
  - Ein Volksname kommt nach dem Laden **doppelt** vor („Goari“ zweimal).
- Das Spiel läuft danach normal weiter.

**Browser:**

- **12345 zufällig:** 48 Städte → 47.
  - Eine lebende Stadt wurde beim Laden gelöscht (K1). Nach dem Code kann das nur die Räumung verbotenen Bodens
    sein: Abstände unter 7 kommen im Spiel nicht vor, und die Probe zeigt solche Städte in 12–39 % der Ticks.
  - Meldung: „Aus 48 Stadtfeldern wurden 47 Städte mit mindestens 7 Feldern Abstand.“
  - 14 von 47 Namen bleiben.
- **heute:** 51 → 51, 43 von 51 Namen bleiben.
- `?terrain=legacy` zeigt die geladenen Städte mit Namen: `review-legacy-32px.png`.

## Befunde

### Blocker

Keine.

### Mittel

**M1 – Nach dem Laden heißen die meisten Städte und fast alle Völker anders**

- **Wo:** `cities.ts:20`, `tribes.ts:151`, `tribes.ts:178`
- **Messung:**
  - Ein Stadtname kommt aus der *aktuellen* Kachel. Bei +2500 sind 63/72, 84/98 und 87/95 Städte seit ihrer Gründung
    mindestens einmal gedriftet (11–18 Plattenschritte in 2500 Ticks). §2.11 nimmt dagegen „im Mittel etwa alle
    1000 Ticks um ein Feld“ an.
  - Ein Volk wird nach seiner *größten* Stadt benannt, nicht nach der Gründungsstadt; Volksnamen bleiben zu 0–1 von 8.
- **Fehlerbild:** Der Spieler speichert, lädt, und aus „Arkani“ werden „Velunen“, die Hälfte der Städte heißt anders.
  Kriegsmeldungen und Chronik passen nicht mehr zur Karte.
- **Vorschlag:**
  - Entscheidung des Nutzers mit den richtigen Zahlen; §2.11 korrigieren.
  - Ohne Formatänderung: Volksnamen aus einer ladefesten Wahl ableiten, etwa der Stadt mit dem kleinsten Kachelindex
    der Gruppe statt der größten, und Doppelnamen verhindern.
  - Stabile Stadtnamen gehen nur mit gespeicherter Information (Driftzähler) und damit einer Formatänderung.

**M2 – Landanteil in der Spätphase über 0,5 %; die Probe prüft ihn nicht**

- **Wo:** `tools/civ-probe.js:250` (nur Ausgabe, kein CHECK)
- **Messung:** 0,55 / 0,85 / 0,72 % bei +2500, gegenüber 0,13–0,20 % am Ende der Eisenzeit. Mit Abstand 7 ist ein
  voller Kontinent bei etwa 1–2 %. Auch ein geladener Teppich landet bei 0,92 %.
- **Vorschlag:**
  - CHECK in die Probe aufnehmen.
  - Entscheiden, ob die 0,5 % nur bis zur Eisenzeit gelten oder ob Siedler ab einem Landanteil nicht mehr aufbrechen.

**M3 – Konflikte ab Industrie häufig und meist vom größten Volk**

- **Wo:** `conflict.ts:154`, Frieden nur je Paar
- **Messung:**
  - 7–15 Kriege je 1000 Ticks ab Industrie; der Planet ist 7–12 % der Zeit im Krieg.
  - 53–70 % der Kriege führt das größte Volk, im Browser-Lauf 8 von 8. Es kämpft reihum gegen jeden Nachbarn, weil
    nur das Paar 200 Ticks Frieden hat.
  - Ausgang fast immer „hält stand“ (12345: 20 von 20).
  - Das CHECK-Fenster der Probe (die ersten 1000 Ticks nach der ersten Nachbarschaft) verdeckt das.
- **Vorschlag:**
  - Ruhezeit auch je Volk, etwa 150 Ticks für beide Seiten gegen alle.
  - Probe über die ganze Laufzeit messen.

**M4 – Seuchen nehmen spät stark zu; Knappheit bleibt eingefroren**

- **Wo:** `cities.ts:185`
- **Messung:** Seuchen je 1000 Ticks: Atom 57–70, Nanotech 112, also etwa alle 9–18 Ticks ein Ausbruch. Die meisten
  Meldungen schluckt die 30-Tick-Drossel.
- **Ursache:** Eine volle Stadt, die erfolgreich Siedler geschickt hat (`cramped = false`), behält ihren
  Knappheitszähler während der ganzen Abklingzeit von 500–800 Ticks. Er sinkt nur, wenn sie nicht voll ist. So
  bleiben solche Städte für Seuchen und Konflikte „knapp“.
- **Vorschlag:** Den Zähler auch senken, wenn die Stadt nicht `cramped` ist. Die Übersprung-Chance an die Zahl der
  Nachbarn koppeln.

**M5 – Zeitalter sehr ungleich lang**

- **Wo:** `cities.ts:239–245`
- **Messung:** Bronzezeit 10–266 Ticks, Eisenzeit 212–656 Ticks.
- **Ursache:** Jedes Volk würfelt in seiner Leitstadt, die Rate des Planeten wächst also mit der Zahl der Völker (1 →
  8). Ausführlich in 2a.
- **Vorschlag:** Erfindungsrate je Planet statt je Volk, etwa Chance × Bevölkerungsanteil des Volkes. Eine
  Mindestdauer je Zeitalter. `landShort` nur für echte Inselvölker und mit Ablauf.

**M6 – Erkennbarkeit im echten Spiel**

- **Messung:**
  - Bei 16 px stehen 30–35 Städte zwischen 430–510 Tier-Icons und gehen darin unter (`review-16px-erde.png`).
  - Die erste Stadt „Ben“ auf einer Flussgabel im Wald ist selbst bei 48 px nur ein kleines Gebäude
    (`review-zeitalter-ben.png`), weil der Fluss den Platz nimmt.
  - Die Bilder der Bauer zeigen ideale Wiesenkacheln.
  - Die Markierung bei 10 px ist lesbar (`review-10px-markierung.png`); bei 16 px fehlt sie.
- **Vorschlag:**
  - Markierung bis einschließlich 16 px, oder Wimpel immer größer.
  - Herden-Icons im Umkreis 2 statt 1 ausdünnen.
  - Auf Flusskacheln mindestens ein mittleres Gebäude.

### Klein

| Nr. | Ort | Befund | Vorschlag |
|---|---|---|---|
| K1 | `cities.ts:67`, `:94` | Laden löscht lebende Städte, deren Boden im Spiel verboten wurde (im Spiel bleiben sie nach §2.2 stehen; Probe: 311–984 Ticks je Lauf mit 1–3 solchen Städten; Browser 48 → 47). Die Meldung nennt dann fälschlich den Abstand. | Verbotene Stadtkacheln nur räumen, wenn eine andere Stadtkachel näher als 7 liegt (Teppich); Meldung trennen. |
| K2 | `civstate.ts:215` | Doppelte Namen: 1–4 doppelte Stadtnamen je ~100 Städte (Fedor, Tiin, Ben, Thaar …), Volksnamen doppelt nach dem Laden. Einsilbige Namen haben nur 504 (Stadt) bzw. 288 (Volk) Möglichkeiten. | Völker immer zweisilbig; Städte zweisilbig oder Prüfung gegen vorhandene Namen. |
| K3 | `citylayer.ts:172` | Bilder abgegangener oder gedrifteter Städte bleiben bis 512 Einträge im Speicher, dann wird alles verworfen. Erstes Zusammensetzen 15–50 ms für 7–45 Städte im Bild (1–2 ms je Stadt), ein einmaliger Ruckler. | Einträge ohne Stadt beim vollen Neuzeichnen entfernen. |
| K4 | `cities.ts:176` | Tragfähigkeit 0 und Bevölkerung genau 0 ergibt `NaN` (0 · (1 − 0/0)), danach CO₂ = `NaN`. Nur mit einem Altstand mit `cityPop` 0 auf einer Stadtkachel erreichbar. | `cap > 0` prüfen. |
| K5 | `conflict.ts:170` | Der Atomschlag umgeht „nur Nachbarn bei Knappheit, einer zur Zeit, danach Frieden“: Er kann während eines Krieges fallen und setzt keine Ruhe. Nur bei Aggression > 0,2 (nicht im Standardbudget), in der Spec so vorgesehen. | Nach dem Schlag `calmUntil` setzen; nicht während eines Konflikts. |
| K6 | `conflict.ts:78`, `:139` | Ein Krieg „um Tiin“ endet mit „Die Ariden übernehmen Ken …“: Verliert der Angreifer, fällt *seine* Stadt, die in der Startmeldung nicht vorkam (Browser, Tick 6953/6963). | Startmeldung nennt beide Städte, oder Endmeldung „wehren den Angriff ab und übernehmen Ken“. |
| K7 | `app.ts:1128` | Das Höhenwerkzeug kann eine Stadt versenken; sie bleibt auf dem Wasser stehen (kein `civ.sync`, Abgleich prüft den Boden nicht). | Nach dem Werkzeug abgleichen, versenkte Städte aufgeben. |
| K8 | `notify.ts:62` | Die Kriegsmeldung zu Beginn ist eine einzeilige Meldung, die die nächste Meldung ersetzt; nur das Ende kommt in die Chronik. | Beginn mit kurzer Mindestanzeige oder als Chronik-Eintrag. |
| K9 | `tools/civ-probe.js:299` | Die Probe prüft weder Landanteil noch Städtezahl je Zeitalter. Konflikte prüft sie nur im ersten 1000-Tick-Fenster. 777/4242 liefern keine Daten. | CHECKs ergänzen, zwei Seeds mit Intelligenz ersetzen. |

## Antworten auf die Fragen des Leads

**2a – Tempo der Zeitalter: Absicht, kein Rechenfehler, aber zu stark gestreut**

- **Mechanik:** `advanceCityTech` (`cities.ts:239–245`) würfelt *je Volk* in dessen Leitstadt:
  `TECH_ADVANCE[t] · Wissenschaft · Bevölkerung`, mal (Netz/4)², höchstens 1.
  - Die Rate des Planeten wächst linear mit der Zahl der Völker.
  - Die Völker steigen in 200–300 Ticks von 1 auf 8.
  - Die Wartezeiten sind exponentiell verteilt.
- **Beispiel Eisenzeit:** Eisen → Industrie bei 8 Völkern mit Eisen-Leitstädten dauert im Mittel
  ≈ 1 / (8 · 0,004 · 0,8) ≈ 40 Ticks. 23 Ticks kommen in etwa 45 % der Fälle vor, sind also gewöhnlich.
- **Beispiel Bronzezeit:** 10 Ticks (2024: ein Volk, Leitstadt 0,58, volles Netz, ≈ 0,003 je Tick) haben eine
  Wahrscheinlichkeit von etwa 3 %, also Pech.
- **`landShort`-Regel** (`cities.ts:243`): Sie hebt die Netzbremse für jedes Volk auf, dessen *letzte* Siedlersuche
  scheiterte.
  - Bei 12345 gab sie für Bronze- und Eisenzeit den Ausschlag: ein Volk mit 3 Städten, Faktor 16/9.
  - Ab dem Atomzeitalter gilt sie für 3–7 von 8 Völkern und verkürzt die späten Zeitalter.
  - Bei heute und 2024 erfanden die Völker der ersten Bronze-, Eisen- und Industriestädte ohne sie.
  - In beiden Läufen war die erste Industriestadt die einzige Stadt eines 1-Stadt-Volkes, mit Bevölkerung 0,23–0,29.
    Jedes Volk würfelt eben für sich.
- **Vorschlag:** siehe M5.

**2b – Viele 1-Stadt-Völker: Regel nicht kaputt, aber sie verbraucht die Farben früh**

- Ende Eisenzeit sind 0 / 2 / 6 von 8 Völkern 1-Stadt-Völker. Bei +2500 hat jedes Volk ≥ 3 Städte; der Zustand ist
  also vorübergehend.
- Fast alle Völker entstehen durch die 15-Felder-Regel: 6 / 8 / 6 „fern der Hauptstadt“, nur 1 / 0 / 0 nach einer
  Überfahrt, 0 / 0 / 1 durch Abspaltung. Alle 8 Farben sind bei +830 bis +1100 vergeben.
- **Folge 1:** Überseekolonien ab der Industrie gehören zum Muttervolk. Völker spannen sich über Kontinente; „neues
  Volk nach Überfahrt“ kommt praktisch nicht mehr vor.
- **Folge 2:** Jedes 1-Stadt-Volk würfelt eigene Erfindungen (2a) und hat eigene Grenzen für Konflikte.
- **Lesbarkeit:** acht Farben auf einem Kontinent, Wimpel einzelner Dörfer.
- **Vorschlag ohne Regeländerung:** zwei Farbplätze für Überfahrten und Abspaltungen freihalten, also die
  15-Felder-Regel nur bis 6 Völker. Das entscheidet der Nutzer.

**2c – Siedleranteil**

- Mit dem aktuellen Stand nicht mehr knapp: 41 / 42 / 50 % der Ticks bis zur letzten Gründung (Probe).
- Je Zeitalter aber ungleich:
  - Steinzeit 3–14 %; die erste Gruppe bricht erst nach ~300 Ticks auf.
  - Bronzezeit 0–24 %, Eisenzeit 45–47 %, ab Industrie 50–79 %.
- In der Steinzeit sieht der Spieler kaum Siedler. Die Spec-Messung ist erfüllt, weil sie die späten Zeitalter
  mitzählt.

**2d – Knappheit ab Industrie: Befürchtung nicht bestätigt, eher das Gegenteil**

| Zeitalter | Städte knapp (≥ 30) | voll | Seuchen / 1000 Ticks | Kriege / 1000 Ticks |
|---|---|---|---|---|
| Eisenzeit | 2–18 % | 4–19 % | 0–12 | 0–14 |
| Industrie | 8–18 % | 18–44 % | 10–26 | 7–12 |
| Atom | 14–37 % | 53–75 % | 11–70 | 9–15 |
| Nanotech (2024) | 36 % | 80 % | 112 | 14 |

- Sobald im Umkreis 30–40 (mit offenem Meer) kein Platz mehr ist, scheitert die Suche, und die Knappheit steigt.
- Zusätzlich friert der Zähler voller Städte während der langen Abklingzeit ein (M4).
- Ergebnis: Seuchen werden spät häufiger statt mit Medizin seltener. Konflikte bleiben bei 7–15 je 1000 Ticks.

**2e – `LEGACY_DRAWS`: bestätigt**

- **Aufbau:** Build desselben Arbeitsbaums mit HEAD-`civ.ts` gegen den neuen Build, Seed 12345 mit dem gierigen Baum
  der Probe.
- **Ergebnis:** Zustand des Zufallsgenerators, Höhen- und Lebensdichte-Prüfsumme gleich bei Tick 1000, 2000, 3000,
  4000 und 5027. Seed 777 ist bis Tick 6000 gleich.
- **Abweichung bei Tick 5028 ist gewollt:** Der alte Kandidat wären Weichtiere (Meer) gewesen, der neue Code wählt
  Vögel.
- **Tick 4305 gilt nicht mehr:** Mit HEAD-`civ.ts` erreicht 12345 im heutigen Baum bis 6000 gar keine Intelligenz.
  Die Verschiebung kommt aus den anderen Sitzungen, nicht aus der Zivilisation.

## Tests

- **Lauf:** alle `tests/*.test.js` mit `SE_BUNDLE`: 221 Tests, 211 grün, 10 rot.
- **Zivilisation grün:** alle Zivilisationstests (`civ`, `conflict`, `civart`, Herden-Abstand) und der
  Speicher-Rundlauf.
- **Rot, fremde Sitzungen:**
  - `altitude` E5 (Nebelwald), `landrender` Kämme unter Eis, `landscape` Flackern und Mehrheitsfilter, `ocean` O02/O03
    (Höhen-Prüfsummen): Geologie/Höhe.
  - `epochs` junge Erde (149 statt 53 Landmassen): Epochen.
- **Rot, gegengeprüft:** `evolution` „full tree reachable plants first“, `founding` Seed 31337, `sim` „greens from the
  shore“. Gegenprobe mit Paaren aus jeweils demselben Baum, die sich nur in `civ.ts` unterscheiden:
  - Baum von 23:45 Uhr: Mit dem neuen `civ.ts` sind `evolution` und `founding` grün (31 von 31 Schritten, Vögel
    intelligent bei Tick 4763), mit dem HEAD-`civ.ts` ebenso.
  - Baum von 00:28 Uhr: Beide bleiben mit *beiden* `civ.ts` nach 15 Schritten hängen, also vor jeder Intelligenz.
  - `sim` scheitert auch mit HEAD-`civ.ts`.
- **Ergebnis:** keiner der 10 Fehler stammt aus der Zivilisation. Der Arbeitsbaum ändert sich während der Prüfung
  durch die anderen Sitzungen.

## Nicht geprüft

- Andere Browser als headless Chrome; echte Touch-Geräte, Gesten und Leistung auf echten Handys (nur
  Geräteemulation); Klang.
- Menschliche Siedlerfiguren im echten Spiel: In beiden Browserläufen wurden Vögel intelligent, sichtbar war nur das
  Platzhalter-Bündel. Die Menschenfiguren kenne ich nur aus den Bögen der Bauer.
- Atomkrieg mit kriegerischem Budget im Spielverlauf (nur Code und Test).
- Stadtwerkzeug und Monolith per Klick im Browser (nur Code: Prüfung vor `spend()`).
- Lange Spiele über +2500 Ticks; Laden echter alter Spielstände von Spielern (nur der erzeugte Teppich).
- Zeitbedarf des Ladens bei sehr großen Teppichen im Browser (Node: 93 ms für 3545 Stadtfelder).

## Nachprüfung (15. 10.)

Kurze Nachprüfung nach den Korrekturen des Leads und den drei Entscheidungen des Nutzers:

- optionales Speicherfeld `civ` (`src/civsave.ts`);
- weiche Obergrenze `CITY_LAND_CAP` = 0,6 %;
- `TRIBE_FAR_MAX` = 6.

Kein Code geändert. Geprüft wurde mit einem eigenen Build des Arbeitsbaums von 06:34 Uhr:

- Probe `2500 12345 2024 99` und `2500 12345 --epoch=today`.
- Speicher-Skript gegen das neue Feld (Seed 12345, zufälliger Planet).
- Ein Browserlauf: Seed 12345, gieriger Baum, Insekten intelligent bei Tick 3946, +1500 Ticks, 16/32/48 px,
  Speichern → Laden.
- Die Gesamtsuite habe ich nicht erneut laufen lassen; der Lead meldet 236/236.

### Neues Urteil: **abnahmereif**, mit kleinen offenen Punkten

- Alle harten Vorgaben halten weiter.
- Namen und Völker überstehen das Laden jetzt vollständig.
- Landanteil, Konflikte und Seuchen liegen im Rahmen.
- Offen bleiben eine Kleinigkeit beim Zeitalter-Tempo (M5, siehe unten), die Dichte der Tier-Icons (M6) und zwei
  neue kleine Befunde (N1, N2).
- Die Spec muss in §6 die geänderten Messungen nachziehen: Konflikte über die ganze Laufzeit, Landanteil 0,6 %. Der
  Nutzer sollte das bestätigen.

### Messwerte

| | 12345 | 2024 | 99 | 12345 heute |
|---|---|---|---|---|
| Intelligenz | Insekten, 4222 | Insekten, 3603 | Vögel, 5000 | erzwungen 6000, Säugetiere |
| Stein / Bronze / Eisen / Industrie (Ticks) | 598 / 87 / 103 / 563 | 646 / 111 / 256 / 285 | 462 / 185 / 508 / 468 | 400 / 298 / 198 / 604 |
| Städte Ende Stein / Eisen | 6 / 9 | 6 / 19 | 4 / **27** | 5 / 14 |
| Landanteil max. / Ende | 0,60 / 0,60 % | 0,62 / 0,61 % | 0,64 / 0,61 % | 0,62 / 0,62 % |
| Konflikte (max. je 1000 Ticks) | 4 (4) | 4 (3) | 8 (6) | 10 (7) |
| Kriege des größten Volkes | 25 % | 50 % | 25 % | 50 % |
| Ausgang gehalten / übernommen | 2 / 2 | 0 / 4 | 3 / 5 | 7 / 3 |
| Seuchen in 2500 Ticks | 1 | 2 | 16 | 8 |
| Völker nach Überfahrt / Abspaltung | 4 / 0 | 6 / 0 | 2 / 1 | 2 / 1 |
| CO₂ +500 Ticks ab Industrie | +122 | +127 | +153 | +65 |
| `civ.step` (Mittel je 100 Ticks, max.) | 0,39 ms | 0,19 ms | 0,37 ms | – |

Alle CHECK-Zeilen sind ok, bis auf eine: Seed 99 hat am Ende der Eisenzeit 27 Städte (Ziel 8–25).
Abstand min. 7,0; 0 schlechte Gründungen; 91–99 % an Fluss oder Küste; Siedler 30–41 % der Ticks.

**Laden (Node):**

- 38 Städte, davon 22 seit ihrer Gründung gedriftet, mit einer Abspaltung („Die Ulmounen in Nofeum sagen sich von den
  Luguiden los“).
- Mit Feld: alle 38 behalten Kachel, Namen, Volk und Farbe; alle 8 Volksnamen bleiben.
- Übernahme, nachgestellt wie in `settleConflict` (Vaum wechselt zu den Luguiden): nach dem Laden „Vaum / Luguiden“.
- Ohne Feld (älterer Stand) und bei sechs verschiedenen Manipulationen wird das Feld als Ganzes verworfen:
  - Name mit 200 Zeichen, Kachel ohne Stadt, unbekanntes Volk, Farbe doppelt, kein Objekt, neun Völker.
  - Alles wird dann wie früher aus dem Raster abgeleitet: 16 von 38 Namen bleiben, kein Absturz.
- Altstand-Teppich ohne Feld: 3445 Stadtfelder (1398 auf verbotenem Boden) → 158 Städte, 0 auf verbotenem Boden,
  min. 7,21, 8 Völker. Die Meldung trennt jetzt „geräumt“ und „zusammengelegt“.
- `SAVE_FORMAT` bleibt 8.

**Browser:**

- Speichern → Laden: 50 von 50 Städten mit gleicher Kachel, gleichem Namen und gleichem Volk.
- Wimpel jetzt auch bei 16 px gut sichtbar (`review2-16px-markierung.png`).
- Flussstädte mit Namen bei 32 px (`review2-32px-fluss.png`: Zeum, Bain, Rohar am Fluss; Kados, Loin, Feum an der
  Küste).
- Flussstadt mit mittlerem Gebäude bei 48 px (`review2-flussstadt-48px.png`).
- Stadtebene bei 32 px: Median 0,1 ms, erstes Zusammensetzen 12 ms.

### Status der Befunde

| Befund | Status | Beleg |
|---|---|---|
| M1 Namen nach dem Laden | **behoben** | 38/38 (Node, mit Drift und Abspaltung), 50/50 (Browser), Übernahme bleibt; manipuliertes Feld wird verworfen |
| M2 Landanteil | **behoben** (Entscheidung 0,6 %) | max. 0,60–0,64 %, Ende 0,60–0,62 %. `CITY_LAND_CAP` rechnet mit dem nominellen Meeresanteil (`migration.ts:198`), daher leichtes Überschießen; die Probe lässt 0,65 % zu |
| M3 Konflikte | **behoben** | 4–10 in 2500 Ticks, höchstens 3–7 je 1000; größtes Volk 25–50 %; Ausgänge gemischt. Das alte §6-Fenster (2–12 in den ersten 1000 Ticks) ergäbe 0 / 1 / 2 / 4; die neue Messung muss der Nutzer bestätigen |
| M4 Seuchen | **behoben** | 1–16 je Lauf, höchstens 15 je 1000 Ticks (Eisenzeit). Eher selten; bei 12345 nur eine Seuche in 2500 Ticks |
| M5 Zeitalter-Tempo | **teilweise** | siehe unten |
| M6 Erkennbarkeit | **teilweise** | Wimpel bis 16 px und Flussstädte sind gelöst. Bei 16 px stehen weiter ~610 Tier-Icons neben 30 Städten im Bild; der Abstand der Herden ist unverändert 1 Feld |
| K1 Laden löscht einzelne Städte | **behoben** | Teppich räumt nur verbotene Felder in einer Gruppe; einzelne bleiben (Code `cities.ts:85`) |
| K2 Doppelte Namen | **behoben** | 0 Doppelte bei 38 Städten; `uniqueCityName` |
| K3 Bildspeicher | **behoben** | Aufräumen je Revision (`citylayer.ts:94–96`) |
| K4 `NaN` | **behoben** | `cap > 0` (`cities.ts:208`) |
| K5 Atomschlag | **behoben** | nicht während eines Konflikts, nach `calmUntil` (`conflict.ts:222`) |
| K6 Kriegsmeldung | **behoben** | „Krieg zwischen den A (Stadt) und den B (Stadt).“ |
| K7 Versunkene Städte | **behoben** | Abgleich gibt Städte auf Wasser auf (`cities.ts:170`) |
| K8 Kriegsbeginn in der Chronik | **behoben** | Schlüssel `civ:war-start:…` |
| K9 Probe | **behoben** | neue CHECKs für Landanteil, Städtezahl je Zeitalter, Konflikte über die ganze Laufzeit |

### Neue kleine Befunde

- **N1 – Siedlerwelle nach dem Laden** (`civsave.ts`, `c.settleAfter = world.ticks`): Alle Abklingzeiten fallen weg,
  und jede volle Stadt schickt sofort Siedler. 200 Ticks nach dem Laden hat der Planet 67 Städte statt 55 ohne Laden
  (+22 %). Vorschlag: `settleAfter` beim Laden auf `ticks + SETTLER_COOLDOWN[tech] · h`, mit h ∈ [0, 1) aus dem
  Kachel-Hash.
- **N2 – Seed 99 am Ende der Eisenzeit 27 Städte** (Ziel 8–25): Die Eisenzeit dauerte dort 508 Ticks. Eine
  Grenzüberschreitung, kein Fehlverhalten; entweder das Ziel auf 8–30 setzen oder hinnehmen.

### M5: Ist die verbleibende Streuung vertretbar?

- **Modell:** Jetzt würfelt der Planet als Ganzes. Die Wartezeit auf das nächste Zeitalter ist bei voll entwickelter
  Zivilisation exponentiell verteilt:
  - Mittel 1 / `TECH_ADVANCE[t]`, also etwa 170 Ticks für Bronze → Eisen und 250 Ticks für Eisen → Industrie.
- **Wahrscheinlichkeit kurzer Zeitalter:** Eine Eisenzeit unter 15 Ticks hat gut 5 % (1 − e^(−15/250)); jedes
  zwanzigste Spiel.
- **Meine 4 Läufe:** Bronze 87–298, Eisen 103–508 Ticks. Die 13 Ticks des Leads liegen im erwarteten Rand.
- **Wirkung:** Zurückliegende Städte holen nur mit 2 % je Tick auf, Mittel 50 Ticks je Stufe. Ein Teil der Karte zeigt
  den Bausatz also trotzdem eine Weile. Die Leitstädte und die Chronik springen aber in wenigen Sekunden Spielzeit
  durch ein ganzes Zeitalter.
- **Urteil:** In dieser Form nicht ganz vertretbar. Der Nutzer will, dass die Stadtoptik mit dem Zeitalter wechselt,
  und ein Zeitalter von wenigen Sekunden ist für ihn praktisch übersprungen.
- **Kleinste Korrektur:** eine Mindestdauer je Zeitalter, nur im Arbeitsspeicher, etwa 6 Zeilen.
  - Feld `topSince` in `CivState`: der Tick, an dem die höchste Stufe des Planeten zuerst erreicht wurde. Nach dem
    Laden ist es der Ladetick; das ist unkritisch.
  - In `advanceCityTech` erfindet keine Stadt eine *neue* höchste Stufe, solange
    `world.ticks − topSince < TECH_MIN_AGE`, etwa 100 Ticks.
  - Wiederfinden einer bekannten Stufe, Austausch und Handel bleiben frei.
  - Das hebt das Mittel um 100 Ticks und schneidet nur den kurzen Rand ab. Die Verteilung auf die Völker bleibt, wie
    sie ist.
  - Bei Bedarf die Werte von `TECH_ADVANCE` leicht anheben, damit die mittlere Dauer gleich bleibt.
