/* =============================================================================
 * SimEarth 2.0 — species art: Wale (whales)
 * -----------------------------------------------------------------------------
 * The walk from land to sea: a four-legged shore hunter, a long-jawed walker, a
 * paddler, the serpent whale, then baleen whale, sperm whale, dolphin and the
 * great whale with its spout. Side views facing right, swimmers around
 * y ≈ 16, fur browns fading to sea greys and blues; the outline is the
 * renderer's (see docs/oekosystem-2026-10/grafikstil.md).
 * ========================================================================== */

namespace SE {
  /** A limb, tusk or jaw line as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });
  const r1 = (v: number): number => Math.round(v * 10) / 10;

  /**
   * A smooth body along a spine of [x, y, half-width] points, for the bent
   * swimmers (serpent whale, leaping dolphin).
   */
  function tube(spine: readonly (readonly [number, number, number])[]): string {
    const n = spine.length;
    const below: [number, number][] = [];
    const above: [number, number][] = [];
    spine.forEach(([x, y, w], k) => {
      const [ax, ay] = spine[Math.max(0, k - 1)];
      const [bx, by] = spine[Math.min(n - 1, k + 1)];
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const nx = -(by - ay) / len;
      const ny = (bx - ax) / len;
      below.push([x + nx * w, y + ny * w]);
      above.push([x - nx * w, y - ny * w]);
    });
    const pts = [...above, ...below.reverse()];
    const m = pts.length;
    const at = (k: number): [number, number] => pts[(k + m) % m];
    let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
    for (let k = 0; k < m; k++) {
      const [p0, p1, p2, p3] = [at(k - 1), at(k), at(k + 1), at(k + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
    }
    return `${d} Z`;
  }

  SPECIES[Life.Cetacean] = {
    stages: [
      // 1 · Urwale — vor 50 Mio. J. (Pakicetus (~50 Ma, Pakistan), early cetacean (Archaeoceti)).
      //   A wolf-sized four-legged mammal with a long snout, eyes high on the head and a long thick
      //   tail, standing at a shore. Farben: grey-brown fur, pale belly.
      {
        name: 'Urwale', ma: 50, art: [
          { f: 'grey', d: 'M9.5 15 C6.5 15.5 4 18 2.5 23.5 C4.5 22 7 20.5 9.5 19.5 Z' },
          line('greyDark', 2.4, 'M12.5 19 L13 28'),
          line('greyDark', 2.4, 'M22.5 18.5 L23.5 28'),
          { f: 'grey', d: 'M8.5 16.5 C8.5 13.5 11.5 12.5 15 12.5 C18 12.5 20.5 12.8 22.5 13.5 C24 14.2 24.2 17.5 23 19 C21.5 20.5 18.5 21 15 21 C11.5 21 8.5 20 8.5 16.5 Z' },
          { f: 'cream', d: 'M10.5 19.6 C13.5 21 19 21.2 22.6 19.2 C21 20.6 18.5 21 15 21 C13 21 11.5 20.6 10.5 19.6 Z' },
          line('grey', 2.6, 'M10 19 L8.5 28'),
          line('grey', 2.6, 'M20 19.5 L19.5 28'),
          { f: 'grey', d: 'M22.8 11.4 L23 8.6 L24.8 10.8 Z' },
          { f: 'grey', d: 'M21 14 C21.5 11.5 23.5 10 25.5 10.5 C27 11 27.8 12.2 28.5 13 L30.5 14.8 C30.5 15.8 29.6 16.4 28.5 16.4 L25.5 16.6 C23.5 17.5 21.5 17 21 14 Z' },
          { f: 'ink', d: artCircle(25.4, 12, 1.2) },
        ],
      },
      // 2 · Wandelwale — vor 49 Mio. J. (Ambulocetus natans (~49 Ma)). A crocodile-like long-jawed
      //   body on short sprawling legs with huge paddle feet (no water drawn: it hid the legs at 16 px).
      //   Farben: dark brown-grey, pale jaw line.
      {
        name: 'Wandelwale', ma: 49, art: [
          line('black', 2.6, 'M13.5 20 L12.8 25.5'),
          { f: 'black', d: 'M10.8 24.6 C12.8 24.4 14.6 24.8 16 25.8 C16 26.8 15.4 27.6 14.6 27.6 L10.8 27.6 Z' },
          line('black', 2.6, 'M22 20 L23 25.5'),
          { f: 'black', d: 'M21.5 24.6 C23.5 24.4 25.5 24.8 27 25.8 C27 26.8 26.4 27.6 25.6 27.6 L21.5 27.6 Z' },
          { f: 'furDark', d: 'M9 16.5 C6 17.5 3.5 20 1.8 24 C4.5 23 7.5 22 10 21.4 Z' },
          { f: 'furDark', d: 'M7.5 19 C7.5 16.2 11 15.2 14.5 15.2 C17 15.2 19 15.6 20.5 16.2 L21 20.5 C19.5 22 17 22.4 14 22.4 C10.5 22.4 7.5 21.4 7.5 19 Z' },
          { f: 'furDark', d: 'M18.5 16.8 C19.8 15.8 21.4 15.3 22.6 15.1 C23 13.8 24.8 13.5 25.4 14.7 C27 15.3 29 16.2 30.5 17.2 C30.7 18.2 30.2 18.9 29.3 19.1 L24 20.2 C21.5 20.8 19.5 20.4 18.5 19.4 Z' },
          { f: 'fur', d: 'M9 17 C10.5 15.9 12.5 15.6 15 15.6 C17.5 15.6 20.5 15.8 23 15.8 C19 16.5 14 16.4 9 17 Z' },
          line('cream', 1.6, 'M29.6 18.3 L24.6 19.2'),
          line('furDark', 2.8, 'M10.5 20.5 L9.8 25.5'),
          { f: 'furDark', d: 'M7.8 24.6 C9.8 24.4 11.6 24.8 13 25.8 C13 26.8 12.4 27.6 11.6 27.6 L7.8 27.6 Z' },
          line('furDark', 2.8, 'M19 20.5 L20 25.5'),
          { f: 'furDark', d: 'M18.5 24.6 C20.5 24.4 22.5 24.8 24 25.8 C24 26.8 23.4 27.6 22.6 27.6 L18.5 27.6 Z' },
          { f: 'ink', d: artCircle(24.1, 15.1, 1.1) },
        ],
      },
      // 3 · Paddelwale — vor 47 Mio. J. (Protocetidae (Rodhocetus, Maiacetus ~47 Ma); descriptive
      //   name). A seal-like swimmer stretched out horizontally, four short limbs turned into broad
      //   paddles, long tail without fluke. Farben: grey with lighter belly.
      {
        name: 'Paddelwale', ma: 47, art: [
          { f: 'black', d: 'M15.5 18 C13.5 20.5 11.5 22.5 9 24.5 C12 25 14.8 23 17 20 Z' },
          { f: 'black', d: 'M25 16.5 C24.6 19 23.6 21 22 22.8 C24.6 23 26.4 21 27.2 17.8 Z' },
          { f: 'greyDark', d: 'M10 14 C7 14.5 4 15 1.8 15.8 C4 16.6 7 17.5 10 18.5 Z' },
          { f: 'greyDark', d: 'M8 16 C8 13.5 12 12 17 12 C21 12 24 12.6 26 13.5 L30.5 15.3 C30.5 16.5 29.5 17.3 28 17.3 L25.5 17.6 C23 19.5 19 20.3 15 20.3 C11 20.3 8 18.5 8 16 Z' },
          { f: 'grey', d: 'M9.5 18 C13 19.8 20 20 25.5 17.6 C23 19.5 19 20.3 15 20.3 C12.5 20.3 10.5 19.4 9.5 18 Z' },
          { f: 'greyDark', d: 'M11 18 C8.5 20.5 5.5 22.5 2.5 24 C6 25 9.5 23.5 12.5 20.5 Z' },
          { f: 'greyDark', d: 'M21 18.5 C20 21.5 18 24 15.5 26 C19 26 21.5 24 23 20.5 Z' },
          { f: 'ink', d: artCircle(24.5, 14.2, 1.2) },
        ],
      },
      // 4 · Basilosaurier — vor 41 Mio. J. (Basilosaurus, Dorudon (~41-34 Ma), fully marine with
      //   tiny hind legs). A very long serpent-like whale with front flippers, a small fluke and two
      //   tiny hind legs near the tail. Farben: slate blue-grey, pale belly.
      {
        name: 'Basilosaurier', ma: 41, art: [
          { f: 'navy', d: 'M4.5 15 L1.8 11 L2.8 15.2 L1.8 19.5 Z' },
          line('grey', 1.6, 'M9.5 13.4 L8.6 16.4'),
          { f: 'navy', d: tube([[3, 15.2, 0.7], [5.5, 13.2, 1.2], [9, 12, 1.7], [12.5, 13.8, 2.1], [16, 17.2, 2.4], [20, 18.6, 2.7], [24, 17.2, 2.9], [27.5, 15.6, 2.5], [30.1, 15.8, 0.8]]) },
          line('grey', 1.8, 'M13.8 17.2 C15.5 19.3 18 20.6 20.5 20.6 C22.5 20.6 24.3 19.6 25.5 18.6'),
          { f: 'navy', d: 'M23 19.5 C22.5 21.5 21 23.2 18.6 24.5 C22 24.6 24.3 23 25.6 20.2 Z' },
          { f: 'ink', d: artCircle(26.8, 14.8, 1) },
        ],
      },
      // 5 · Bartenwale — vor 36 Mio. J. (Mysticeti, Mystacodon selenensis (~36 Ma, Peru); true
      //   baleen later). A stout whale with a large head and long, gently arched mouth line, small
      //   dorsal fin and fluke. Farben: dark grey with mottled white patches.
      {
        name: 'Bartenwale', ma: 36, art: [
          { f: 'greyDark', d: 'M6 15 L2.5 10.5 C2.4 12.5 2.8 14.2 3.6 15.4 C2.6 16.6 2 18 1.8 19.5 L6 16.8 Z' },
          { f: 'greyDark', d: 'M10 12.6 L12.8 9.4 L13.8 11.6 Z' },
          { f: 'greyDark', d: 'M30.3 16 C30 12.5 26.5 10 20.5 10 C15 10 10.5 11.5 7.5 13.5 L4.5 14.8 L5 16.4 L7.5 17 C10 19.5 14 22.8 20 22.8 C26 22.8 30.4 20 30.3 16 Z' },
          { f: 'grey', d: 'M30.3 16.2 C28 14.6 23.5 14.6 20.5 18.2 C18.5 20.5 15 21.5 11.5 21 C14 22.3 16.5 22.8 20 22.8 C26 22.8 30.4 20 30.3 16.2 Z' },
          line('black', 1.6, 'M30 16.2 C27.5 14.9 23.5 15 20.6 18.2'),
          { f: 'black', d: 'M21.5 21 C20 23.5 18 25.3 15.5 26.3 C18.3 26.6 21 25 23 22 Z' },
          { f: 'white', d: artEllipse(14.5, 13.2, 1.7, 1.1), o: 0.7 },
          { f: 'white', d: artEllipse(19.2, 12.2, 1.3, 0.9), o: 0.7 },
          { f: 'white', d: artEllipse(10.8, 15.4, 1.1, 0.9), o: 0.7 },
          { f: 'white', d: artCircle(24, 12.4, 0.9), o: 0.7 },
          { f: 'ink', d: artCircle(21.4, 16, 1) },
        ],
      },
      // 6 · Pottwale — vor 25 Mio. J. (Physeteroidea, Ferecetotherium (Late Oligocene ~28-23 Ma)).
      //   A massive box-shaped head taking a third of the body, narrow lower jaw, wrinkled back with
      //   a hump instead of a fin. Farben: dark brown-grey, pale mouth.
      {
        name: 'Pottwale', ma: 25, art: [
          { f: 'furDark', d: 'M6 15.5 L2 11.5 C2.2 13.5 2.8 15 3.8 16.2 C2.8 17.4 2.2 19 2 21 L6 17.2 Z' },
          { f: 'cream', d: 'M28.5 19.5 C28.5 20.8 26.5 21.8 22.5 21.8 L17.5 21.2 L18 19 Z' },
          { f: 'furDark', d: 'M30.5 11 L30.5 17.5 C30.5 18.6 29.6 19.4 28.5 19.4 L20 19.6 C16 21.5 12 21 8 18.5 L4.5 16.6 L4.5 14.8 L8 13.5 C9.5 12.5 11 11.2 12.5 11.2 C13.5 11.2 14 12 15 11.8 L18 10 C19 9.5 20 9.3 21 9.3 L29 9.3 C30 9.3 30.5 10 30.5 11 Z' },
          { f: 'black', d: 'M21 9.4 L29 9.4 C30 9.4 30.5 10 30.5 11 L30.5 17.5 C30.5 18.6 29.6 19.4 28.5 19.4 L21 19.5 Z', o: 0.25 },
          { f: 'ink', d: artCircle(21.5, 16, 1) },
        ],
      },
      // 7 · Delfine — vor 11 Mio. J. (Delphinidae, from Late Miocene ~11 Ma). A sleek dolphin
      //   leaping in an arc with a short beak, curved dorsal fin and fluke. Farben: blue-grey back,
      //   white belly.
      {
        name: 'Delfine', ma: 11, art: [
          { f: 'sky', d: 'M5.5 22.5 L1.8 21.2 C2.8 22.4 3.4 23.6 3.6 24.8 C3.2 26 3.2 27.4 3.8 28.8 Z' },
          { f: 'sky', d: tube([[4, 24.5, 0.8], [7, 20, 1.6], [11, 15.5, 2.6], [16.5, 12.5, 3.2], [22, 12.5, 3], [26.5, 14.5, 2.2], [29.7, 17.4, 0.8]]) },
          { f: 'white', d: 'M9 19 C12.5 15.5 17 14.6 21.5 15.4 C24.5 16 27 17 29 18.2 C26 16.5 22 15.8 18 16.2 C14.5 16.6 11.5 17.8 9 19 Z' },
          { f: 'sky', d: 'M14.5 10 C14.5 7.5 15.5 5.5 18.5 4 C17.8 6 18 8 19 10 Z' },
          { f: 'blue', d: 'M20.5 15.5 C20 18 18.5 20 16 21.5 C19.5 21.5 22 19.5 23 16 Z' },
          { f: 'ink', d: artCircle(25.4, 13.6, 1) },
        ],
      },
      // 8 · Großwale — vor 4.5 Mio. J. (Baleen whale gigantism (blue whale size) only since ~4.5-3
      //   Ma (Slater et al. 2017, Proc. R. Soc. B)). A huge, long streamlined whale with throat
      //   grooves, tiny dorsal fin far back and a water spout from the blowhole. Farben: blue-grey
      //   with light mottling, white spout.
      {
        name: 'Großwale', ma: 4.5, art: [
          { f: 'white', d: 'M22.6 15 C22.6 12.5 22.4 10.5 21.5 9 C20.5 8 19 8 17.5 9.5 C17.8 6.7 20 5.1 22.4 5.7 L23.5 3 L24.6 5.7 C27 5.1 29.2 6.7 29.5 9.5 C28 8 26.5 8 25.5 9 C24.6 10.5 24.4 12.5 24.4 15 Z' },
          { f: 'blue', d: 'M6 18 L2 13.5 C2 15.5 2.6 17.2 3.4 18.4 C2.6 19.6 2 21.2 1.8 23 L6 19.8 Z' },
          { f: 'blue', d: 'M30.5 19 C30.4 16.2 27.5 14.8 22 14.8 C15 14.8 9 16.2 5 18 L4.5 19.6 C9 21.8 15 24.6 22 24.6 C27 24.6 30.5 22.5 30.5 19 Z' },
          { f: 'navy', d: 'M30.5 19 C30.4 16.2 27.5 14.8 22 14.8 L22 24.6 C27 24.6 30.5 22.5 30.5 19 Z', o: 0.3 },
          { f: 'sky', d: 'M30.4 19.8 C27 20.5 21 20.5 15 22.6 C17 23.8 19.5 24.6 22 24.6 C27 24.6 30.3 22.6 30.4 19.8 Z' },
          line('blue', 1.6, 'M28.5 21.9 C25.5 22.4 22 22.6 19 23.6'),
          { f: 'blue', d: 'M9.5 17.3 L11.5 15 L12.3 16.8 Z' },
          { f: 'navy', d: 'M22 23.5 C20.5 25.5 18.5 27 16 28 C19 28.3 22 27 24 24.5 Z' },
          { f: 'sky', d: artCircle(12.5, 18.6, 0.8), o: 0.7 },
          { f: 'sky', d: artCircle(15.5, 17.4, 0.8), o: 0.7 },
          { f: 'sky', d: artCircle(18.5, 16.9, 0.7), o: 0.7 },
          { f: 'ink', d: artCircle(25.5, 19.4, 1) },
        ],
      },
    ],
    specialists: [
      // Narwale — Eis, ab Unterart 8 (Monodon monoceros; Monodontidae from ~10-9 Ma (Denebola)). A
      //   mottled whale without dorsal fin and a long, straight, spiralled tusk pointing forward
      //   (right), under an ice edge. Farben: grey-white mottled, ivory tusk, white ice.
      {
        name: 'Narwale', biome: Biome.Arctic, minStage: 7, art: [
          { f: 'white', d: 'M1.5 1.8 L30.5 1.8 L30.5 5.5 L26 6.8 L21 5.4 L15.5 7.2 L9.5 5.6 L4.5 6.9 L1.5 5.8 Z' },
          line('bone', 2, 'M21 16.4 L29.8 14.3'),
          { f: 'grey', d: 'M6.5 17 L2 12.8 C2 14.8 2.6 16.4 3.4 17.6 C2.6 18.8 2 20.4 1.8 22.2 L6.5 18.6 Z' },
          { f: 'grey', d: 'M22.4 17.4 C22.4 14.2 19.8 12.6 15.5 12.6 C11 12.6 8 14.6 5.5 16.8 L5.5 18.4 C8 20.4 11.5 22.2 15.5 22.2 C19.6 22.2 22.4 20.4 22.4 17.4 Z' },
          { f: 'white', d: 'M8 19.6 C11 21 14.5 21.4 18 21 C20 20.8 21.6 20 22.2 18.8 C21.6 21 19.2 22.2 15.5 22.2 C12.5 22.2 10 21.2 8 19.6 Z' },
          { f: 'greyDark', d: artCircle(10.5, 16.6, 1), o: 0.6 },
          { f: 'greyDark', d: artCircle(13.8, 15, 0.9), o: 0.6 },
          { f: 'greyDark', d: artCircle(15.6, 18, 1), o: 0.6 },
          { f: 'greyDark', d: artCircle(18.6, 14.6, 0.8), o: 0.6 },
          { f: 'greyDark', d: 'M16.5 20.5 C15.5 22.5 14 24 12 25 C14.5 25.2 17 24 18.3 21.2 Z' },
          { f: 'ink', d: artCircle(19.6, 16.6, 0.9) },
        ],
      },
    ],
  };
}
