/* =============================================================================
 * SimEarth 2.0 — species art: Amphibien (amphibians)
 * -----------------------------------------------------------------------------
 * From the fish with limb-like fins to the tree frog: side views facing right,
 * feet on y ≈ 28 (Diplocaulus seen from above, its boomerang head being the
 * point), far limbs a shade darker, the outline left to the renderer.
 * ========================================================================== */

namespace SE {
  /** A limb, tail or stem as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  SPECIES[Life.Amphibian] = {
    stages: [
      // 1 · Tiktaalik — vor 375 Mio. J. (Tiktaalik roseae (~375 Ma), close relative of the
      //   tetrapod ancestors, not an ancestor itself). A flat-headed fish propped on two sturdy
      //   front fins in shallow water, with a visible neck and fish tail. Farben: olive green-brown,
      //   lighter belly.
      {
        name: 'Tiktaalik', ma: 375, art: [
          { f: 'kelp', d: 'M9.5 22.8 C7 21.4 4.6 20.4 2.2 20 C3.2 22 3.6 23.6 3.4 25 C3.2 26.2 2.8 27.2 2.2 28.2 C4.8 27.8 7.2 27 9.8 26 Z' },
          line('scaleDark', 2.6, 'M16.2 22.6 L16 27.8'),
          { f: 'olive', d: 'M7 23.8 C10 21 14 18.8 17.6 17.6 C18.8 17.2 19.8 16.9 20.8 16.8 C22.4 15.4 25 14.8 27 15.2 C28.6 15.5 29.9 16.3 30.3 17.2 C30.3 18 29.4 18.4 28.2 18.6 C25.8 19 23.2 19.4 21.2 20.2 C17.5 21.8 13.5 24.6 10 26.2 C8.4 26.8 7 26 7 23.8 Z' },
          { f: 'sand', d: 'M8 25.6 C12 24.2 16.5 21.4 20.5 19.6 C23.5 18.6 26.8 18.2 30.2 17.8 C29.9 18.3 29.2 18.5 28.2 18.6 C25.8 19 23.2 19.4 21.2 20.2 C17.5 21.8 13.5 24.6 10 26.2 C9 26.6 8.3 26.3 8 25.6 Z' },
          line('olive', 3, 'M19 20.8 L20.4 25.6'),
          { f: 'kelp', d: 'M19.4 25 C21.8 24.6 24.4 25.4 26.2 27.2 C26.2 28.2 25.4 28.6 24.4 28.6 L19.8 28.6 C18.8 27.6 18.6 26 19.4 25 Z' },
          { f: 'ink', d: artCircle(26.2, 16.4, 1.2) },
        ],
      },
      // 2 · Ichthyostega — vor 365 Mio. J. (Ichthyostega, Acanthostega (~365 Ma, Greenland)). A
      //   stocky four-legged animal with a broad head, short sprawling legs and a fish-like tail
      //   fin. Farben: brown-grey with dark blotches.
      {
        name: 'Ichthyostega', ma: 365, art: [
          line('greyDark', 2.4, 'M13.4 24 L13.8 28'),
          line('greyDark', 2.4, 'M19.4 24 L19.8 28'),
          { f: 'greyDark', d: 'M11 17.6 C8 16 4.5 16.4 2 18.6 L2 21.6 C4.5 23.6 7.5 24.4 10.5 24 Z' },
          { f: 'grey', d: 'M10.5 18.6 C7.5 18.8 4.5 19.4 2 20.2 C4.5 21.2 7.5 22 10.5 22.8 Z' },
          { f: 'grey', d: artEllipse(15.5, 20.7, 7.2, 4.2) },
          { f: 'grey', d: 'M20 17.8 C22.5 15.8 26 15.8 28.5 17.2 C29.8 18 30.4 19.4 30.2 20.8 C29.5 22.2 27.5 23 25 23 L20 22.8 Z' },
          line('grey', 3, 'M11.5 23 L8.8 25 L9 28 L7 28.3'),
          line('grey', 3, 'M21 22.5 L23.6 24.6 L23.4 28 L25.4 28.3'),
          { f: 'furDark', d: artCircle(11.5, 18.8, 1.4), o: 0.6 },
          { f: 'furDark', d: artCircle(15.8, 17.8, 1.3), o: 0.6 },
          { f: 'furDark', d: artCircle(19, 19.8, 1.3), o: 0.6 },
          { f: 'furDark', d: artCircle(14.5, 21.8, 1.1), o: 0.6 },
          { f: 'ink', d: artCircle(25.6, 18.2, 1.2) },
        ],
      },
      // 3 · Panzerlurche — vor 335 Mio. J. (Temnospondyli (Balanerpeton ~335 Ma; Eryops ~295 Ma)).
      //   A crocodile-like amphibian with a huge flat triangular head, short sprawling legs and a
      //   short tail. Farben: muddy olive, darker back plates.
      {
        name: 'Panzerlurche', ma: 335, art: [
          line('scaleDark', 2.6, 'M12.5 23.5 L13 27.8'),
          line('scaleDark', 2.6, 'M18 23.5 L18.6 27.8'),
          { f: 'olive', d: 'M8 19 C5.5 19.8 3.5 21.2 2 23.6 C4.5 24 6.5 23.8 8.5 23 Z' },
          { f: 'furDark', d: artCircle(9, 17.4, 1.6) },
          { f: 'furDark', d: artCircle(12.2, 16.2, 1.6) },
          { f: 'furDark', d: artCircle(15.4, 15.8, 1.6) },
          { f: 'olive', d: 'M6.5 21 C6.5 17.6 10 16.2 14 16 C16.5 15.9 18 16 19 16.4 L19 23.8 C15 24.8 10.5 24.8 8 23.8 C7 23.2 6.5 22.2 6.5 21 Z' },
          { f: 'olive', d: 'M16.5 16.6 C20 15.6 24 15.8 27.4 17.2 C29.2 18 30.4 18.9 30.5 19.8 C30.3 20.8 28.8 21.4 26.8 21.6 C23.5 22 19.5 22.8 16.5 23.6 Z' },
          { f: 'olive', d: artCircle(21.8, 16.5, 1.5) },
          { f: 'sand', d: 'M17 22.2 C21 21.2 25.5 20.5 30.4 20.2 C29.8 21 28.4 21.4 26.8 21.6 C23.5 22 19.5 22.8 17 23.5 Z' },
          line('olive', 3, 'M10 22.5 L7.4 25 L7.8 27.8 L6 28.2'),
          line('olive', 3, 'M19.5 22.5 L22.4 25 L22 27.8 L24 28.2'),
          { f: 'ink', d: artCircle(21.8, 16.4, 1.2) },
        ],
      },
      // 4 · Diplocaulus — vor 300 Mio. J. (Diplocaulus (Lepospondyli, ~306-255 Ma)). A
      //   salamander-like body with an unmistakable boomerang-shaped wide head. Farben: grey-green,
      //   pale head edges. Seen from above, like the ray among the fish.
      {
        name: 'Diplocaulus', ma: 300, art: [
          line('scaleDark', 2.2, 'M16.5 13.6 L15.2 11'),
          line('scaleDark', 2.2, 'M16.5 18.4 L15.2 21'),
          line('scaleDark', 2.2, 'M10 13.8 L8.8 11.4'),
          line('scaleDark', 2.2, 'M10 18.2 L8.8 20.6'),
          { f: 'olive', d: 'M8 14.2 C5.5 14.8 3.5 15.4 1.8 16 C3.5 16.6 5.5 17.2 8 17.8 Z' },
          { f: 'olive', d: artEllipse(15, 16, 8, 3) },
          { f: 'bone', d: 'M16.5 3 C21 5.5 26 9.5 28.8 13.5 C29.8 15 29.8 17 28.8 18.5 C26 22.5 21 26.5 16.5 29 C17.5 26 19.5 22 21.5 19.2 C21 17 21 15 21.5 12.8 C19.5 10 17.5 6 16.5 3 Z' },
          { f: 'olive', d: 'M18.8 7 C22 9.2 25.2 11.8 27 14.2 C27.6 15.3 27.6 16.7 27 17.8 C25.2 20.2 22 22.8 18.8 25 C19.8 22.8 21 20.6 22.4 18.8 C22 17 22 15 22.4 13.2 C21 11.4 19.8 9.2 18.8 7 Z' },
          { f: 'scaleDark', d: 'M7 16 L23 16 A8 3 0 0 1 7 16 Z', o: 0.55 },
          { f: 'scaleDark', d: 'M27.6 16 C27.6 16.7 27.4 17.3 27 17.8 C25.2 20.2 22 22.8 18.8 25 C19.8 22.8 21 20.6 22.4 18.8 C22.2 17.9 22.1 17 22.1 16 Z', o: 0.55 },
          { f: 'ink', d: artCircle(25, 14.2, 1.1) },
          { f: 'ink', d: artCircle(25, 17.8, 1.1) },
        ],
      },
      // 5 · Salamander — vor 230 Mio. J. (Stem salamander Triassurus sixtelae (~230 Ma,
      //   Kyrgyzstan; Schoch et al. 2020); Karaurus ~165 Ma). A slim lizard-shaped amphibian with
      //   smooth skin, four small legs and a long tail, head slightly raised. Farben: black with
      //   yellow spots.
      {
        name: 'Salamander', ma: 230, art: [
          line('greyDark', 2.2, 'M20.5 23.8 L19.4 28'),
          line('greyDark', 2.2, 'M14 24.2 L15.4 28'),
          { f: 'black', d: 'M10 20.9 C6 21.4 3.5 22.9 2.5 25.9 C2.2 27 2.8 27.9 3.8 27.4 C4.6 25.2 6.5 24 10.5 24.8 Z' },
          { f: 'black', d: 'M8 22.9 C8.5 21 12 20.2 16 20.2 C19 20.2 21 20 22.5 19.4 C24 18.4 26 18 27.8 18.4 C29.5 18.8 30.4 20 30.2 21.2 C29.8 22.2 28.3 22.7 26.5 22.7 C25 22.8 24 23.2 23 23.8 C20 25 13 25.4 10 24.8 C8.8 24.5 8 23.8 8 22.9 Z' },
          line('black', 2.4, 'M22.5 23.5 L25 25.2 L25.4 28'),
          line('black', 2.4, 'M12 24 L9.6 25.6 L9.2 28'),
          { f: 'yellow', d: artCircle(6.6, 23.4, 1.1) },
          { f: 'yellow', d: artCircle(12.6, 22, 1.3) },
          { f: 'yellow', d: artCircle(17, 21.8, 1.3) },
          { f: 'yellow', d: artCircle(20.8, 21.4, 1.2) },
          { f: 'yellow', d: artEllipse(24.6, 19.8, 1.6, 1.1) },
          { f: 'greyDark', d: artCircle(27.6, 20, 1.4) },
          { f: 'ink', d: artCircle(27.8, 20, 0.9) },
        ],
      },
      // 6 · Frösche — vor 190 Mio. J. (Prosalirus bitis (~190 Ma, Arizona), first frog with a
      //   jumping build). A squat tailless frog sitting with long folded hind legs, ready to jump.
      //   Farben: green with brown spots.
      {
        name: 'Frösche', ma: 190, art: [
          line('leaf', 2.2, 'M20 21.5 L19.8 27.8'),
          { f: 'frog', d: 'M7.5 23 C7 18 11 14.5 16.5 13.5 C19.5 13 22.5 13 24.8 13.8 C27.2 14.6 29.2 16.4 30 18.4 C29.5 19.8 27.8 20.6 25.8 20.8 C23 22.5 20.5 24.5 17 25.5 C13 26.5 8.5 26 7.5 23 Z' },
          { f: 'frog', d: artCircle(23, 13.6, 2.6) },
          { f: 'leaf', d: 'M10.5 26.6 L17.5 26.8 C18.8 27 18.8 28.6 17.5 28.6 L10.5 28.6 Z' },
          { f: 'leaf', d: 'M6 25.5 C5 21 8.5 18.5 12.5 19 C16 19.5 17.5 23 16.5 26 C15.5 28 8 28.5 6 25.5 Z' },
          line('frog', 2.6, 'M23 20 L23.8 27.8 L26 28'),
          { f: 'furDark', d: artCircle(12.5, 17.6, 1.2), o: 0.6 },
          { f: 'furDark', d: artCircle(16.8, 16, 1.1), o: 0.6 },
          { f: 'furDark', d: artCircle(11.6, 22.6, 1.2), o: 0.6 },
          { f: 'gold', d: artCircle(23.2, 13.4, 1.6) },
          { f: 'ink', d: artCircle(23.4, 13.4, 0.8) },
        ],
      },
      // 7 · Blindwühlen — vor 183 Mio. J. (Gymnophiona, Eocaecilia (~183 Ma); stem caecilian
      //   Chinlestegophis ~220 Ma (contested)). A legless worm-like body with ring folds, blunt head
      //   and tiny eyes, half emerging from soil. Farben: blue-grey to violet, pale rings.
      {
        name: 'Blindwühlen', ma: 183, art: [
          line('violet', 5.4, 'M6.5 27 C7.2 21.5 9.8 18.4 13 18.4 C16.6 18.4 17.6 24 21 24 C24 24 25.4 21.6 26.4 19.8'),
          { f: 'violet', d: artEllipse(26.8, 20.2, 3.4, 2.9) },
          { s: 'cream', w: 1.6, d: 'M10.2 22.9 L6 20.6', o: 0.55 },
          { s: 'cream', w: 1.6, d: 'M11.6 21.3 L8.8 17.3', o: 0.55 },
          { s: 'cream', w: 1.6, d: 'M13.1 20.8 L13.6 16', o: 0.55 },
          { s: 'cream', w: 1.6, d: 'M14.3 21.7 L17.9 18.4', o: 0.55 },
          { s: 'cream', w: 1.6, d: 'M16.5 24.2 L20 20.9', o: 0.55 },
          { s: 'cream', w: 1.6, d: 'M21.2 26.4 L21.1 21.6', o: 0.55 },
          { s: 'cream', w: 1.6, d: 'M25.4 24.4 L23 21.4', o: 0.55 },
          { f: 'bark', d: 'M1.5 29 C2.5 25.5 4.5 23.8 7.5 23.8 C10 23.8 11.5 25.5 12.5 29 Z' },
          { f: 'ink', d: artCircle(27.8, 19.4, 0.8) },
        ],
      },
      // 8 · Laubfrösche — vor 55 Mio. J. (Tree frogs (Hylidae s.l.), Litoria tylerantiqua (~55 Ma,
      //   Australia, 2025)). A slim frog clinging to a vertical stem with big round toe pads.
      //   Farben: bright leaf green, white belly.
      {
        name: 'Laubfrösche', ma: 55, art: [
          line('bark', 2.6, 'M9 30 C9.5 22 8.5 12 9.5 2'),
          { f: 'frog', d: 'M21 11.3 A7 4.5 -55 1 0 13 22.7 A7 4.5 -55 1 0 21 11.3 Z' },
          { f: 'white', d: 'M16.5 16.4 A3 1.6 -55 1 0 13.1 21.2 A3 1.6 -55 1 0 16.5 16.4 Z' },
          { f: 'frog', d: 'M18.5 11 C18.5 7.5 21 5.5 24 5.6 C27 5.7 29 7.5 29.6 9.6 C28.8 11.4 26.8 12.6 24.5 13 C21.5 13.6 18.5 13.5 18.5 11 Z' },
          line('frog', 2.4, 'M18.4 13.6 L15 14.4 L11.5 12.8'),
          line('frog', 2.6, 'M15 21 L21 25.5 L12 27.5'),
          { f: 'frog', d: artCircle(10.8, 12.6, 1.6) },
          { f: 'frog', d: artCircle(11, 27.4, 1.6) },
          { f: 'red', d: artCircle(23.2, 7.8, 2.1) },
          { f: 'ink', d: artEllipse(23.4, 7.8, 0.6, 1.2) },
        ],
      },
    ],
    specialists: [
      // Pfeilgiftfrösche — Regenwald, ab Unterart 8 (Dendrobatidae, molecular origin ~40 Ma). A
      //   tiny frog with bold warning colours sitting on a leaf. Farben: electric blue with black
      //   spots.
      {
        name: 'Pfeilgiftfrösche', biome: Biome.Jungle, minStage: 7, art: [
          { f: 'jungle', d: 'M2 26.5 C6 23 15 22 22 23 C25.5 23.5 28.5 24.8 30.5 26.5 C27 28.6 20 29.6 13 29.2 C8 28.9 4 28.2 2 26.5 Z' },
          { f: 'forest', d: 'M2 26.5 C8 26.8 20 26.6 30.5 26.5 C27 28.6 20 29.6 13 29.2 C8 28.9 4 28.2 2 26.5 Z', o: 0.55 },
          line('navy', 2.2, 'M19 18.5 L18.6 24.6'),
          { f: 'blue', d: artEllipse(12.6, 21.4, 3.6, 3) },
          line('navy', 2.2, 'M10 24.6 L16.4 24.8'),
          { f: 'blue', d: 'M10.4 21.5 C9.8 17 12.4 13.4 16.4 12.2 C18.4 11.6 20.6 11.4 22.4 11.8 C24.4 12.4 25.8 13.8 26.2 15.4 C25.6 16.6 24.2 17.2 22.6 17.4 C21.6 20 19.4 22.4 16.4 23.4 C13.4 24.2 10.8 23.6 10.4 21.5 Z' },
          { f: 'blue', d: artCircle(21.6, 11.8, 2.3) },
          line('navy', 2.6, 'M21 17 L22 24.4 L24 24.6'),
          { f: 'black', d: artCircle(14.4, 15.6, 1.4) },
          { f: 'black', d: artCircle(18, 14, 1) },
          { f: 'black', d: artCircle(13, 19.8, 1.2) },
          { f: 'black', d: artCircle(17.2, 18.6, 1) },
          { f: 'ink', d: artCircle(21.8, 11.6, 1.4) },
        ],
      },
      // Schaufelfußkröten — Wüste, ab Unterart 8 (Scaphiopodidae (spadefoot toads), burrow and
      //   wait for rain; fossils from the Paleogene). A plump toad half-buried in sand, only its
      //   back and big eyes showing, a dark spade on the hind foot. Farben: sandy grey-brown, gold
      //   eyes.
      {
        name: 'Schaufelfußkröten', biome: Biome.Desert, minStage: 7, art: [
          { f: 'grey', d: 'M6 25 C6.5 19.5 11 16.5 16.5 16.5 C20 16.5 22.5 17.5 24.5 19.5 C26 21 27 22.8 27.5 25 Z' },
          { f: 'black', d: 'M6.6 24.8 C7.2 23 9.2 22.2 11.2 22.8 C10.4 23.6 10.2 24.4 10.4 25.2 Z' },
          { f: 'grey', d: artCircle(21.5, 17.2, 2.8) },
          { f: 'greyDark', d: artCircle(11.5, 20, 1.3), o: 0.6 },
          { f: 'greyDark', d: artCircle(15.5, 18.6, 1.1), o: 0.6 },
          { f: 'greyDark', d: artCircle(16, 22.2, 1.2), o: 0.6 },
          { f: 'gold', d: artCircle(21.8, 16.9, 1.8) },
          { f: 'ink', d: artEllipse(21.9, 16.9, 0.55, 1.3) },
          { f: 'sand', d: 'M1.5 29.5 C3 25.5 8 23.5 16 23.5 C23 23.5 28.5 25.5 30.5 29.5 Z' },
          { f: 'tan', d: 'M16 25.5 C22 25.5 27.5 26.8 30.5 29.5 L12 29.5 C14 28.5 15 27 16 25.5 Z', o: 0.55 },
        ],
      },
    ],
  };
}
