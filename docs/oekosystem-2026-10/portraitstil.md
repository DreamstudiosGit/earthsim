# Stil der Arten-Portraits (Lexikon)

Gilt für alle Dateien in `src/species/portraits/`. Die Portraits zeigen jede Unterart groß in der Infobox und im Lexikon. Sie sprechen dieselbe Sprache wie die Kartensymbole (`grafikstil.md`): flache Farbflächen, eine Tintenkontur vom Renderer, Licht von links oben, Blick nach rechts. Sie sind aber viel detaillierter und naturnah gezeichnet. Referenz: `src/species/portraits/mammals.ts`.

## Format

- **Datei:** `src/species/portraits/<gruppe>.ts` mit `SPECIES_PORTRAITS[Life.X] = [ … ]`, genau 8 Einträge `{ name, art }`.
  - Reihenfolge und Namen wie in `src/species/<gruppe>.ts`. Der Test vergleicht die Namen.
- **Feld:** 64 × 64 Einheiten. Formen wie bei den Symbolen:
  - gefüllt: `{ f, d, o? }`
  - Linie: `{ s, w, d, o? }`
- **Hilfsfunktionen:** `fill`, `line`, `dot`, `oval`, `ground` stehen lokal in jeder Datei. Kopiervorlage ist der Kopf von `mammals.ts`.
- **Pfade:** nur absolute Befehle `M L H V C S Q T A Z`.
  - Endpunkte zwischen 1 und 63
  - Kurvengriffe zwischen −8 und 72
- **Farben:** nur Schlüssel aus `PORTRAIT_PALETTE` (`src/species/portraits/types.ts`). Das ist die Symbolpalette plus je ein heller und ein tiefer Ton pro Material, z. B. `fur`/`furPale`/`furDeep`, `scale`/`scaleLight`/`scaleDeep`.
  - Keine Hex-Werte, keine Verläufe, keine Filter.

## Was der Renderer hinzufügt (nicht zeichnen!)

- **Kontur:** Tinte, 2 Einheiten breit, um die ganze Silhouette. Zur Silhouette gehören alle Formen mit Deckkraft ≥ 0,5.
- **Schatten:** 2,5 Einheiten nach rechts unten, 25 % Deckkraft.
- **Silhouette für unentdeckte Arten:** entsteht automatisch aus denselben Daten, nur aus Formen mit Deckkraft ≥ 0,5.
  - Requisiten mit voller Deckkraft (Ast, Baumstumpf) gehören zur Silhouette.
  - Boden, Wasserflächen und Grashalme deshalb immer durchscheinend zeichnen (Deckkraft unter 0,5).

## Aufbau, von hinten nach vorn

1. **Umgebung, sparsam:**
   - durchscheinender Bodenfleck (`ground(…)`, 0,3) oder Wasserlinie
   - höchstens ein Requisit (Ast, Stumpf, Blatt)
   - höchstens 3 Grashalme (0,45)
2. **Ferne Gliedmaßen, Flügel, Flossen** im tiefen Ton (`furDeep`, `greyDeep`, `scaleDeep` …).
3. **Schwanz**, dann der **Körper** im Grundton der Gruppe. Er bleibt derselbe wie beim Kartensymbol, damit man das Tier wiedererkennt.
4. **Lichtfläche** oben links im hellen Ton, deckend.
5. **Bauch oder Unterseite** in der Bauchfarbe.
6. **Schattenfläche** unten rechts: `ink` mit Deckkraft 0,18–0,25.
7. **Struktur:** kurze Striche für Fell, Schuppen, Federn oder Segmente.
   - Breite 0,7–0,9, Deckkraft 0,5–0,65, mindestens 3 Striche
8. **Nahe Gliedmaßen** im Grundton, Pfoten oder Zehen in Hautfarbe.
9. **Kopf:**
   - Grundform, Lichtfläche, Schnauze oder Schnabel, Ohr mit Innenfläche
   - **Auge:** `ink`, Radius 1,1–1,6, plus Glanzpunkt `shine`, Radius 0,3–0,6, Deckkraft 0,9
   - Nase oder Nasenloch
10. **Feine Anhänge zuletzt:** Schnurrhaare, Fühler, Flossenstrahlen.
    - Breite ≥ 0,6
    - Deckkraft 0,45, wenn sie außerhalb des Körpers liegen, sonst bekämen sie eine dicke Kontur.

## Lesbarkeit und Realismus

- **Lage im Feld:**
  - Landtiere stehen mit den Füßen bei y ≈ 56–57,5.
  - Schwimmer und Mikroben liegen mittig (y ≈ 32), Flieger dürfen höher stehen.
  - Das Tier füllt 60–90 % des Feldes.
- **Körperbau:** Proportionen wie beim echten Vorbild. Die Kommentare über jeder Stufe in `src/species/<gruppe>.ts` nennen Taxon und Merkmale.
- **Haltung:** jede Unterart klar anders als ihre Nachbarn: anderer Körperbau, andere Haltung, anderes Kennzeichen. Nur Umfärben reicht nicht.
- **Detailgrad:** 25–45 Formen. Die Mindestzahl prüft der Test.
- **Pflicht:**
  - eine Lichtfläche
  - eine Schattenfläche
  - Strukturstriche
  - ein Auge mit Glanzpunkt, außer bei Tieren ohne sichtbare Augen (Schwämme, Würmer, Mikroben)
- **Silhouette:** Das Tier muss schon als schwarze Silhouette in 72 px erkennbar sein. Das Kontaktblatt zeigt sie.
- **Verboten:**
  - Text
  - Kleidung und Anachronismen
  - vermenschlichte Gesichter
  - Linien unter 0,6
  - Verläufe und Filter

## Ablauf für Zeichner

1. Entwurf im Scratchpad zeichnen, dann prüfen:
   `node tools/portrait-sheet.js <gruppe> --file <entwurf.ts> --out <bild.png>`
   - Das Blatt zeigt jedes Portrait groß auf dunklem Grund, mittelgroß auf hellem Grund, als 72-px-Vorschau, als Silhouette und daneben das Kartensymbol.
   - Davor druckt das Werkzeug jede Regelverletzung als `PROBLEM …`.
2. Erst wenn das Blatt keine `PROBLEM`-Zeile mehr zeigt und das Bild stimmt, die Datei nach `src/species/portraits/<gruppe>.ts` schreiben.
3. Namen, Reihenfolge und Grundfarben sind vorgegeben. Abweichungen vorschlagen, nicht selbst ändern.
