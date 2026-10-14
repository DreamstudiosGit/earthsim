# Grafikstil der Tier- und Pflanzensymbole

Gilt für alle Dateien in `src/species/` (Tiere) und `src/floraart/` (Pflanzen). Ziel: Symbole aus vielen Händen, die wie ein Satz aussehen und schon in 16 px erkennbar sind.

## Format

- Ein Symbol ist eine Liste von Formen (`Art`) in einem Feld von **32 × 32 Einheiten**. Gezeichnet wird es auf der Karte in 10–48 px pro Feld, im Untersuchen-Fenster in 64 px.
- **Gefüllte Form:** `{ f: 'fur', d: '…' }`. **Linie:** `{ s: 'ink', w: 2, d: '…' }`. Beide sind optional mit Deckkraft, z. B. `o: 0.6`.
- **Pfade:** `d` ist SVG-Pfadsyntax, aber nur mit absoluten Befehlen `M L H V C S Q T A Z`, keine Kleinbuchstaben.
  - Für Kreise und Ellipsen gibt es `artCircle(cx, cy, r)` und `artEllipse(cx, cy, rx, ry)`.
  - Lokale Hilfsfunktionen in der eigenen Datei sind erlaubt, nicht exportiert (siehe `floraart/conifers.ts`).
- **Farben:** nur Schlüssel aus `ART_PALETTE` (`src/species/types.ts`), keine Hex-Werte.
- **Rand:** Alle Endpunkte liegen zwischen 1,5 und 30,5, weil die Kontur 1,5 Einheiten über die Form hinausragt. Der Test prüft 0,5 bis 31,5.

## Was der Renderer selbst hinzufügt (nicht zeichnen!)

- **Kontur:** in Tinte (`ink`) um die ganze Silhouette.
  - Tiere: 3 Einheiten
  - Bäume: 2,2 Einheiten, 80 % Deckkraft
  - übrige Pflanzen: 2 Einheiten, 65 % Deckkraft
  - Meeresalgen: 1,6 Einheiten, 50 % Deckkraft
- **Schatten:** nach rechts unten (2 Einheiten), bei Tieren und Bäumen.
- **Meeresalgen** werden zusätzlich mit 45 % Deckkraft gezeichnet, weil man sie durchs Wasser sieht.
- **Spiegelung:** Für Tiere, die nach links laufen, spiegelt der Renderer das Symbol. Deshalb schaut jedes Tier **nach rechts**.

## Regeln für Lesbarkeit

1. **Die Silhouette zählt am meisten.** Das Tier muss schon an seinem schwarzen Umriss erkennbar sein: Buckel, langer Hals, Flossen, Rüssel, Fühler, Panzer. Details im Inneren gehen in 16 px unter.
2. **Mindestgröße:** Formen und Linien mindestens ~2,5 Einheiten breit.
   - Lücken zwischen Teilen (zwischen den Beinen, unter dem Bauch) mindestens ~3 Einheiten, sonst füllt die Kontur sie zu.
   - Beine als Linie `{ s, w: 2–2,6 }` oder schmale Formen.
3. **Farben:** 2–4 Farben je Symbol.
   - Grundfarbe, eine hellere Oberseite oder ein Bauch, ein dunkler Akzent, das Auge.
   - Licht kommt von links oben: hellere Flächen oben links, dunklere unten rechts.
   - Flächige Schattierung wie bei den Nadelbäumen: die rechte Hälfte als dunklere Fläche mit `o` 0,5–0,6.
4. **Auge:** ein Punkt `ink`, Radius 1,2–1,6. Bei sehr kleinen Tieren darf es fehlen.
5. **Größe und Lage:**
   - Landtiere stehen mit den Füßen bei y ≈ 27–29.
   - Schwimmer und Mikroben liegen mittig (y ≈ 16).
   - Vögel dürfen höher stehen.
   - Spätere Unterarten dürfen größer sein, alle füllen aber 45–90 % des Feldes.
6. **Abgrenzung:** Jede Unterart unterscheidet sich klar von ihren Nachbarn: anderer Körperbau, andere Haltung, anderes Merkmal. Nur Umfärben genügt nicht.
7. **Spezialisten** (z. B. Eisbär, Fennek, Kaktus) folgen denselben Regeln. Sie tragen das Merkmal ihres Bioms deutlich: Weiß auf Eis, große Ohren in der Wüste, Säulenform beim Kaktus.
8. **Verboten:** Text, Verläufe, Filter, sehr dünne Linien (< 1,6), naturalistische Kleinteile.

## Pflanzen

- **„spärlich“:** eine einzelne Pflanze, unten mittig (Fuß bei y ≈ 28–30).
- **„dicht“:** 2–3 Pflanzen oder ein geschlossener Bestand, der den größten Teil des Feldes deckt.
- Gruppen unterscheiden sich in Wuchsform **und** Grünton. Der Ton steht in der Palette, z. B. `moss`, `clubmoss`, `spruce`, `jungle`, `straw`.
- Bäume (`woody`) bekommen automatisch einen Schatten. Bodennahe Pflanzen bleiben flach und ruhig, damit Tiere darauf lesbar bleiben.

## Ablauf für Zeichner

1. Zuerst im Scratchpad zeichnen und dann prüfen:
   `node tools/species-sheet.js <id> --file <entwurf.ts> --out <bild.png>`
   Das Werkzeug kompiliert nur die Registry und deine Datei und zeigt jedes Symbol in 16 und 24 px auf echten Bodenfarben, groß und gespiegelt.
2. Erst wenn der Entwurf fehlerfrei kompiliert, die Datei in `src/species/` bzw. `src/floraart/` ersetzen. So baut der Hauptbaum immer.
3. Namen, Daten, Biome und `minStage` sind vorgegeben. Wer Änderungen für nötig hält, schlägt sie vor und ändert sie nicht selbst.
4. **Referenzen:** `src/species/mammals.ts`, `src/species/fish.ts`, `src/floraart/conifers.ts`.
