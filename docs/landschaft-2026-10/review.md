# Review: Biome & Vegetation als Pixel-Landschaft (A7)

Stand: 14. 10. 2026 · unabhängige Prüfung gegen `docs/biomes-spec.md` (Abschnitte 3, 4, 6, 8) und `stil.md`.
Geprüft wurde der Build `simulation.js` vom 14. 10., 14:56. Am Code wurde nichts geändert.

## Urteil

**Bedingt abnahmereif.** Gegenüber dem alten Stand ist die Karte ein großer Schritt:
- keine Symbol-Tapete mehr, ausgefranste Übergänge, Flüsse als glatte Linien
- Laub- und Regenwälder mit überlappenden Kronen, sichtbare Sukzession
- pixelgenauer Zoom ohne Flimmern, Untersuchen-Fenster wie beschlossen

Vor der Abnahme offen sind vier Punkte:
1. der Beschluss „am Äquator immer Regenwald“
2. die Kohärenz-Zielwerte aus 3.7
3. kachelparallele Helligkeitskanten und die 4-Kachel-Wiederholung im Meereis
4. optisch unnatürliche Nachbarn (Sand an Eis)

Nadelwälder wirken außerdem nicht geschlossen.

## Vorgehen

- **Probe:**
  - `node tools/headless.js 4500 12345 777 2718 --life --biomes`
  - zusätzlich 4870 Ticks (≈ heute) für 777 und 2718
- **Tests:**
  - `node --test tests/landscape.test.js tests/terrain.test.js` gegen den vorhandenen Build: 17/17 bestanden
  - `node tools/terrain-atlas.js --check`: 0 Probleme, deterministisch
  - `npm test` lief nicht, weil es `simulation.js` neu baut.
- **Screenshots** in headless Chrome über das DevTools-Protokoll mit `_preview.html`:
  - Weltalter: Silur 430, Karbon 310, Kreide 100 und Neogen 20 Mio. Jahre (Ticks ≈ 1537 / 2497 / 3975 / 4508)
  - Seeds 777 und 2718 vollständig; 12345 nur bis Kreide, weil die Vorschau dort bei 140 Mio. J. in Zivilisation/Technologie wechselte und die Uhr stehen blieb
  - Desktop 1920 × 1080 bei 10, 16 und 48 px
  - Zoom 11, 13 und 24 px bei devicePixelRatio 1, 1,25, 2 und 3
  - Telefon 390 × 844 mit DPR 3 (CDP-Emulation)
  - Untersuchen-Fenster auf Wald, Sumpf und einer Mischkachel
  - Rodungsserie in der Technologie-Skala
  - `?terrain=legacy` mit derselben Welt (Prüfsumme identisch)
- **Datenabfragen** im Browser: Landschaft, Klima und Gruppen pro Kachel, Nachbarschaften.

## Messwerte (Probe, Lebensraum-Ebene)

| | Grenzkanten | Einzelkacheln | Regionen ≤ 3 | flächengew. Regiongröße |
|---|---|---|---|---|
| Ziel (3.7) | ≤ 8 % | ≤ 0,2 % | ≤ 100 | ≥ 1500 |
| Ausgangswert (1.5, 21 Mio.) | 18–20 % | ≈ 1 % | ≈ 400 | 432 / 751 |
| 777 · 21 Mio. / heute | 11,3 / 11,0 % | 0,32 / 0,33 % | 86 / 81 | 594 / 690 |
| 2718 · 21 Mio. / heute | 10,3 / 10,3 % | 0,23 / 0,27 % | 64 / 74 | 528 / 526 |
| 12345 · 21 Mio. (Sonderfall*) | 8,2 % | 0,06 % | 33 | 1083 |

\* In der Probe-Verdrahtung stagniert Seed 12345 bei 17 von 31 Schritten: Die Frühen Gefäßpflanzen sterben aus, die mittlere Pflanzendecke liegt bei 0,076. Die Werte beschreiben also einen kahlen Planeten.

Gegenprobe mit Seeds 1–5:
- Mit Zonenfaktor erreichen alle fünf 29–30 Schritte.
- Ohne Zonenfaktor (`zonalRain = 0`) bleibt Seed 5 bei 10 Schritten stehen.

Das Stagnieren ist also eine vorbestehende Schwäche und nicht dem Umbau zuzuordnen.

**Breitenprofil (Ziel 3.8), Probe 21 Mio. / heute:**

| Band | Ziel | 777 | 2718 |
|---|---|---|---|
| ±10° | Regenwald + Wald ≥ 40 % | 39 / 45 % (davon Regenwald 8 / 9 %, Tundra 17 %) | 54 / 57 % (Regenwald 4 / 22 %) |
| 15–35° | Wüste + Halbwüste + Savanne ≥ 40 % | 57 / 59 % | 52 / 53 % |
| 40–60° | Wald, Steppe, Wiese führen | 47 / 63 % | 15 / 21 % (Nadelwald 54–57 % führt) |
| > 60° | Nadelwald, Tundra, Eis führen | 94 / 96 % | 98 / 98 % |

**Weitere Werte:**
- **Unnatürliche Nachbarn** (Tabelle `LANDSCAPE_CLASH`): 0 an allen Messpunkten und Seeds.
- **Verdeckte Pflanzen** (Decke ≥ 0,3 als Fels, Rohboden oder Flechten): 0,3–1,4 %, im Karbon bis 5 %.
- **Tick-Kosten:**
  - Probe 13,6–14,1 ms pro Tick, im Spec stehen 8,7 ms. Darin stecken auch fremde Umbauten.
  - `BiomeSystem.step` einzeln instrumentiert: 1,94 ms pro Tick, davon kommt ein unbekannter Teil vom alten Klassifikator.
  - Das Ziel „≤ +1,5 ms“ ist damit nicht belegbar.
- **Zeichnen** (headless Chrome, 1920 × 1080, DPR 1):
  - volle Neuzeichnung mit gecachten Chunks: 0,5–1,2 ms
  - erstes Komponieren: 11 ms (48 px), 50 ms (16 px) und 124 ms (10 px, verteilt auf 2 Frames)
- **Verschiebetest** (1 Gerätepixel, volle Neuzeichnung):
  - mittlere RGB-Abweichung 0,001–0,044
  - höchstens 0,05 % der Pixel weichen um mehr als 24 ab
  - gemessen bei T = 11, 16, 16,25, 24, 26, 30 und 48 Gerätepixeln pro Kachel
- **Chunk-Nähte:** An senkrechten Chunkgrenzen ist die Kantenenergie nicht höher als bei Kontrollversätzen (Verhältnis 1,10–1,21 gegenüber 1,02–1,22). Erhöhte Zeilen liegen auf denselben Weltzeilen auch im Legacy-Bild, kommen also aus den Daten.

## Abnahmekriterien

| Kriterium | Urteil | Beleg |
|---|---|---|
| Große, klar erkennbare Klimazonen statt Flickenteppich | teilweise | `review-klimazonen.png` (2718, Neogen, 10 px): Regenwaldgürtel, Wüstengürtel, Nadelwald, Eis klar erkennbar. Kreide bei 777 ist noch ein Mosaik aus Fels, Rohboden und Farnflur. Grenzkanten und Regiongröße verfehlt (Tabelle oben); die flächengewichtete Regiongröße hat sich gegenüber dem Ausgangswert nicht verbessert. |
| Innerhalb eines Bioms keine Kachelgrenzen | teilweise | `review-kachelkanten.png`: gerade, kachelparallele Helligkeitskanten in Wüste und Fels (Relief- und Makro-Schattierung) sowie im Flachwasser (Tiefenstufen). Meereis zeigt eine deutliche 4-Kachel-Wiederholung. Keine Chunk-Nähte. |
| Keine harten Kanten zwischen Biomen und zu Wasser | teilweise | Ränder durchgehend ausgefranst, Schaum- und Nasssaum vorhanden, Flüsse als glatte Linien. Lange Grenzen folgen aber geraden Kachelzeilen bzw. Breitenkreisen (z. B. 777 Neogen, 16 px: Grenze über 80 Kacheln). |
| Sukzession sichtbar | erfüllt | Weltalter-Serie: Silur kahler Fels, Karbon Moosteppich, Kreide Farnflur und erste Wälder, Neogen Steppe, Savanne und Wald. `review-rodung.png`: gerodeter Regenwald wird über Rohboden, Savanne bzw. Farnflur und Gebüsch in ≈ 1000 Jahren wieder geschlossener Regenwald, vom Rand her. Test „Fels bis Wald ≥ 4 Stufen“ grün. |
| Wälder geschlossen, Ränder laufen aus | teilweise | `review-wald.png`: Regen- und Laubwald mit überlappenden Kronen, am Rand licht und klein. Nadelwald zeigt auch bei „Wald (dicht)“ viel braunen Boden zwischen schmalen Fichten. Kleine Waldinseln sind fast nur Rand und wirken licht. |
| Tiere auf allen Untergründen gut erkennbar | erfüllt | Eis, Sand, Fels, Wiese, Wasser: klar. Schwächer, aber dank Tintenkontur lesbar: grüne Saurier auf Regenwald, dunkelbraune Gliederfüßer auf Waldboden. |
| 6.1 Äquator immer Regenwald | **nicht erfüllt** | Browser 777, 20 Mio.: in ±10° 0 Kacheln Regenwald, Wald 0,5 %, dafür Steppe 39 %, Savanne 22 %, Tundra 16 %. Steppe und Tundra liegen dort hoch (mittlere Höhe 0,41 bzw. 0,56, 12 bzw. 7 °C). Probe 777 heute: Regenwald-Landschaft nur 9 %. 2718 erfüllt das Ziel (Browser: Regenwald + Wald ≈ 47 %). |
| 6.1 Nur natürliche Nachbarn, keine Wüste an Eis | teilweise | Tabelle 0, optisch aber nicht. `review-eis-neben-sand.png`: „Fels auf Sand“ wird als Sand gezeichnet und grenzt an Eis (Nachbarpaare, 8er-Nachbarschaft, Neogen: 777 38, 2718 150, 12345 13). Gipfelschnee fehlt in der Clash-Tabelle (Schnee an Wald oder Nadelwald: 3–8 Kanten). Wüste geht in 2–3 Kacheln über Farnflur und Gebüsch in Wald über (2718, ≈ 15° N). |
| 6.4 Zoom 10–48 ohne Flimmern und ungleiche Pixel | erfüllt (headless) | Ganzzahlige Vielfache scharf. Bei T = 26 und 30 gleich große, leicht weiche Pixel. Verschiebetest siehe Messwerte. |
| 6.5 Jede Pflanzengruppe immer sichtbar und erkennbar | teilweise | Atlas-Test und Kontaktblatt: jede Gruppe hat ein Objekt. Auf der Karte sind die niedrigen Objekte (Lebermoos, Moospolster, Urfarn, Grasbüschel, Blumen) bei 16 px kaum unterscheidbar. Nebengruppen erscheinen selten (Steppe 0,02–0,06 Büsche pro Kachel). Von den Kacheln mit einer Baumgruppe als prägender Gruppe und Decke ≥ 0,3 sind keine Wald-Landschaft: 68 % (777), 35 % (12345), 11 % (2718). Meist sind es Tundra über der Baumgrenze, Steppe, Savanne oder Wiese. |
| 4.9 Untersuchen-Fenster | erfüllt | `review-untersuchen.png`: 3 × 3-Ausschnitt ganzzahlig 6×, Landschaftsname, je Gruppe ein Sprite bzw. Ausschnitt, prägende Gruppe hervorgehoben. Ebenso geprüft auf Sumpf und auf einer Kachel mit 12 Gruppen. |
| 6.7 Übersichtskarte unverändert | erfüllt | Sichtprüfung des Fensters „Übersichtskarte“ |
| `file://` ohne Konsolenfehler | erfüllt | `index.html` direkt von der Platte, 20 s Lauf (133 Ticks): keine Fehler, nur die Autoplay-Warnung des AudioContext. Pixel-Terrain `ready`. |
| Leistung | teilweise | Zeichnen erfüllt. Tick-Ziel nicht belegbar (siehe Messwerte). |

## Mängel (nach Priorität)

| # | Schwere | Mangel | Wo | Vermutliche Ursache |
|---|---|---|---|---|
| 1 | hoch | Äquator ohne Regenwald, stattdessen Steppe, Savanne und Tropen-Tundra | 777 (Browser und Probe), allgemein bei hohem Äquatorland | Land am Äquator liegt hoch und ist zu kalt für `T_trop` und Feuchte ≥ 0,5. Der Spec schließt einen Umbau von Gelände und Temperatur aus, das steht im Zielkonflikt zu „immer“. Braucht eine Entscheidung, z. B. eine höhenkorrigierte Temperatur nur für die Einstufung. |
| 2 | hoch | Kohärenz-Ziele verfehlt: Grenzkanten 10–11 %, Einzelkacheln 0,23–0,33 %, Regiongröße 526–690 | Probe, alle Seeds mit Vegetation; sichtbar als Mosaik in der Kreide | Das Ziel ≥ 1500 ist ehrgeizig. Dass sich die Regiongröße gar nicht verbessert hat, ist trotzdem ein echter Befund (feinere Zonen, schmale Übergangsbänder). |
| 3 | mittel | Gerade, kachelparallele Helligkeitskanten in einheitlichen Flächen (Sand, Fels, Flachwasser) | `review-kachelkanten.png` links; Silur und Karbon bei 16 px | `landcompose.ts` `shade()`: kachelweise Shade-Werte, `terrace()` mit schmalem Band (`RELIEF_BAND` 0,3), daher Stufenkanten auf geraden Gitterlinien; Wassertiefe pro Kachel gestuft |
| 4 | mittel | Meereis wiederholt sich alle 4 Kacheln | Polarmeere, z. B. 2718 Neogen bei 16 px | Meereis-Textur nur 64 px groß (5.2), auffälliges Schollenmuster |
| 5 | mittel | Optisch Sand an Eis; Schnee an Wald | `review-eis-neben-sand.png`; Datenabfragen | Fels auf Sand zeichnet Sand-Material; die Clash-Prüfung (Probe und Mehrheitsfilter) arbeitet auf Landschafts-IDs, nicht auf gezeichneten Materialien; `Snow` fehlt in `CLASHES` |
| 6 | mittel | Nadelwald ohne geschlossenes Kronendach | `review-wald.png` rechts, Untersuchen-Ausschnitt | Schmale Fichten-Sprites; kleine Waldflächen bestehen fast nur aus Rand (`EDGE_FALLOFF`), nur kleine Größen; ohne Busch-Gruppe kein Mantel |
| 7 | mittel | Lange schnurgerade Zonengrenzen entlang Breitenkreisen; gerade Tiefen- und Küstenlinien im Meer | 777 Neogen 16 px (Zeilen 32/64), 2718 10 px, Telefon | Kommt aus den Weltdaten, im Legacy-Bild an denselben Zeilen. Wirkt in der ruhigen Pixelgrafik viel stärker. Ursache nicht eindeutig: breitenabhängige Klimaeingänge bzw. zeilenweise Plattendrift. |
| 8 | niedrig | Niedrige Pflanzenobjekte bei 16 px verwechselbar; Nebengruppen selten | Kontaktblatt `objects`, Karte | Objekte unterscheiden sich vor allem durch 1–2 Farbpunkte |
| 9 | niedrig | Wolken als blockige, halbtransparente Kachel-Rechtecke | `review-handy-wolken.png` | Wolkenebene unverändert; passt nicht mehr zum Pixelstil |
| 10 | niedrig | Tiere stehen in einem starren Raster | alle Ansichten mit Tieren | `herds.ts` (unverändert); fällt auf ruhigem Boden stärker auf |
| 11 | niedrig | Flüsse mit geraden Kanalstücken, rechtwinkligen Knicken und über Eisschilde | z. B. 777 Neogen, Eis bei 48 px | folgt `riverDown` auf dem Kachelgitter; Flüsse auf Eis kommen aus dem Flussmodell |
| 12 | niedrig | Einzeilige Streifen: eine Kachelreihe Flechten quer durch Moosteppich | 777 Karbon, Zeile 106 | Wahrscheinlich ein zeilenweiser Klima- oder Bodeneffekt; der Mehrheitsfilter greift bei langen Streifen nicht |
| 13 | niedrig | „Gebüsch (spärlich)“ auf einer Kachel ohne Pflanzen | Rodungstest, Mittelkachel bei +460 Jahren | Gruppen gelten über ≥ 3 Nachbarn als vorhanden, die Landschaft eilt der Flora voraus |
| 14 | Hinweis | Karbon ohne Bärlapp-Sumpfwälder (Sumpfwald 0–1 % bei 310 Mio.) | Weltalter-Serie | Evolutions- und Sukzessions-Zeitpunkte im gierigen Baum; prägendes Karbon-Bild fehlt |

## Nicht geprüft

- Andere Browser als headless Chrome mit Software-Rendering: Firefox, Safari, echte GPU.
- Echte Touch-Geräte:
  - Pinch-Zoom und die Zoom-Vorschau während der Geste
  - Flimmern während einer laufenden Zoom-Animation; geprüft wurden nur Standbilder und 1-px-Verschiebungen
- Leistung auf schwachen Telefonen, insbesondere das erste Komponieren (124 ms schon auf dem Desktop bei 10 px).
- Die volle Testsuite `npm test`, weil sie neu baut. Speicherstände Format 7 nur über die Tests in `landscape.test.js` (grün), nicht im Spiel.
- Vorher/Nachher nur für Seed 777. Seed 12345 im Browser nur bis 140 Mio. J., weil die Zivilisation die Uhr anhielt.
- Gesamtanteile der Lebensräume gegen den Ausgangswert (± 5 Prozentpunkte): Im Spec gibt es dafür keine Vergleichszahlen.
- Ton und Langzeitspiel.
