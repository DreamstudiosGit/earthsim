/* =============================================================================
 * SimEarth 2.0 — species art: Bienen & Bestäuber (pollinators)
 * -----------------------------------------------------------------------------
 * Five bees in side view, told apart by build, pose and colour; the hawkmoth,
 * hoverfly and spread-winged butterflies seen from above, head to the right.
 * Pale opaque wings, stripes cut from the body ellipse, the outline left to the
 * renderer (see docs/oekosystem-2026-10/grafikstil.md).
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;
  /** A leg, antenna or tongue as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  /** Local point (x, y) of a frame centred on (cx, cy) and turned `deg` clockwise, as "X Y". */
  function at(cx: number, cy: number, deg: number, x: number, y: number): string {
    const t = (deg * Math.PI) / 180;
    return `${r(cx + x * Math.cos(t) - y * Math.sin(t))} ${r(cy + x * Math.sin(t) + y * Math.cos(t))}`;
  }

  /** An ellipse turned `deg` clockwise: an insect body segment. */
  function oval(cx: number, cy: number, rx: number, ry: number, deg: number): string {
    const a = at(cx, cy, deg, -rx, 0);
    const b = at(cx, cy, deg, rx, 0);
    return `M${a} A${rx} ${ry} ${deg} 1 0 ${b} A${rx} ${ry} ${deg} 1 0 ${a} Z`;
  }

  /** The slice of that ellipse between local x = a and x = b: a stripe across the body. */
  function band(cx: number, cy: number, rx: number, ry: number, deg: number, a: number, b: number): string {
    const h = (x: number): number => ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
    return `M${at(cx, cy, deg, a, -h(a))} A${rx} ${ry} ${deg} 0 1 ${at(cx, cy, deg, b, -h(b))} ` +
      `L${at(cx, cy, deg, b, h(b))} A${rx} ${ry} ${deg} 0 1 ${at(cx, cy, deg, a, h(a))} Z`;
  }

  /** An ellipse with a tufted rim of `n` bumps: a furry body. */
  function fuzz(cx: number, cy: number, rx: number, ry: number, n: number, amp: number): string {
    const p = (k: number, out: number): string => {
      const t = (2 * Math.PI * k) / n;
      return `${r(cx + (rx + out) * Math.cos(t))} ${r(cy + (ry + out) * Math.sin(t))}`;
    };
    let d = `M${p(0, 0)}`;
    for (let k = 0; k < n; k++) d += ` Q${p(k + 0.5, amp * 2)} ${p(k + 1, 0)}`;
    return `${d} Z`;
  }

  /** Moves every point of path data made of M, L, C, Q and Z only. */
  function mapPoints(d: string, f: (x: number, y: number) => string): string {
    return d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_m, x: string, y: string) => f(+x, +y));
  }

  /** A pointed leaf from (bx, by) to (tx, ty), `w` wide at the base. */
  function blade(bx: number, by: number, tx: number, ty: number, w: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const nx = (-(ty - by) / len) * (w / 2);
    const ny = ((tx - bx) / len) * (w / 2);
    return `M${r(bx + nx)} ${r(by + ny)} L${r(tx)} ${r(ty)} L${r(bx - nx)} ${r(by - ny)} Z`;
  }

  /** A pointy-topped hexagon: one honeycomb cell. */
  function hex(cx: number, cy: number, s: number): string {
    const pts = [0, 1, 2, 3, 4, 5].map((k) => at(cx, cy, 60 * k - 90, s, 0));
    return `M${pts.join(' L')} Z`;
  }

  /** A hanging bell flower, `top` its stalk end. */
  function bell(cx: number, top: number): string {
    return `M${cx - 2.2} ${top + 5} C${cx - 2.6} ${top + 1} ${cx - 1.4} ${top} ${cx} ${top} ` +
      `C${cx + 1.4} ${top} ${cx + 2.6} ${top + 1} ${cx + 2.2} ${top + 5} L${cx + 3} ${top + 6} L${cx - 3} ${top + 6} Z`;
  }

  /** A tiny stingless bee at (x, y), flying right. */
  function tinyBee(x: number, y: number): Art {
    return [
      { f: 'white', d: artEllipse(x - 1, y - 2.6, 2.6, 1.5) },
      { f: 'chitin', d: artEllipse(x, y, 3.3, 2) },
      { f: 'chitin', d: artCircle(x + 3.3, y - 0.3, 1.7) },
      { f: 'ink', d: artCircle(x + 3.7, y - 0.5, 0.7) },
    ];
  }

  /** The lower half of an ellipse turned `deg`: the shaded belly of a body segment. */
  function belly(cx: number, cy: number, rx: number, ry: number, deg: number): string {
    return `M${at(cx, cy, deg, -rx, 0)} A${rx} ${ry} ${deg} 0 0 ${at(cx, cy, deg, rx, 0)} Z`;
  }

  // Butterflies seen from above are drawn upright around (16, 16), head up, left wings
  // only; `spread` mirrors them, then scales and turns the whole insect into place.
  const FOREWING = 'M15 13 C12 9.5 7 5.5 3.5 5 C2.5 8 3.5 13.5 5.5 16.5 C9 17 12.5 16.5 15 15.5 Z';
  const HINDWING = 'M15 16 C11 15.5 7 17 5.5 20.5 C5 24 8 27.5 11.5 27.5 C13.5 26 15 21.5 15.5 18 Z';
  type Placer = (d: string) => string;
  const placer = (cx: number, cy: number, deg: number, s: number): Placer =>
    (d) => mapPoints(d, (x, y) => at(cx, cy, deg, (x - 16) * s, (y - 16) * s));
  const spread = (to: Placer, d: string): string[] => [to(d), to(mapPoints(d, (x, y) => `${32 - x} ${y}`))];
  const spot = (to: Placer, x: number, y: number, rad: number): string => {
    const [px, py] = to(`${x} ${y}`).split(' ').map(Number);
    return artCircle(px, py, rad);
  };
  const morpho = placer(15, 17, 25, 0.8);
  const yuccaMoth = placer(8, 8.5, 70, 0.42);

  SPECIES[Life.Pollinator] = {
    stages: [
      // 1 · Wildbienen — vor 125 Mio. J. (Anthophila, origin ~125-120 Ma from apoid wasps (Almeida
      //   et al. 2023); oldest fossil bee ~100 Ma (Melittosphex)). A slim dark bee with pale
      //   stripes, yellow pollen loads on the hind legs, wings over the back. Farben: black-brown,
      //   pale bands, yellow pollen.
      {
        name: 'Wildbienen', ma: 125, art: [
          line('furDark', 2, 'M16 21 L12.5 24.5 L11 28.5'),
          { f: 'yellow', d: artEllipse(12.6, 24.6, 2.6, 2.4) },
          line('furDark', 2, 'M19.5 21.5 L19 28.5'),
          line('furDark', 2, 'M23 21 L26 24.5 L27 28.5'),
          { f: 'furDark', d: oval(10, 17.5, 8, 4.2, -8) },
          { f: 'cream', d: band(10, 17.5, 8, 4.2, -8, -5.2, -3.4) },
          { f: 'cream', d: band(10, 17.5, 8, 4.2, -8, -1.6, 0.2) },
          { f: 'cream', d: band(10, 17.5, 8, 4.2, -8, 2, 3.8) },
          { f: 'furDark', d: artEllipse(20, 16.5, 4.4, 4.2) },
          { f: 'cyan', d: 'M19 13.5 C15.5 9.5 9 8.5 4.5 10 C6 12.5 12 14.5 19 15 Z' },
          { f: 'furDark', d: artEllipse(26, 17.5, 3, 3.5) },
          line('furDark', 1.8, 'M26.5 14.5 L27.5 10.5 L30 9.5'),
          { f: 'ink', d: artCircle(26.9, 16.6, 1.3) },
        ],
      },
      // 2 · Schmetterlinge — vor 100 Mio. J. (Butterflies (Papilionoidea), molecular origin ~100
      //   Ma (Kawahara et al. 2023); oldest fossils ~56 Ma; moths much older). A butterfly at rest
      //   with both wing pairs folded upright, club-tipped antennae and a curled proboscis. Farben:
      //   orange with black veins and white dots.
      {
        name: 'Schmetterlinge', ma: 100, art: [
          line('black', 1.6, 'M14.5 23.5 L13 28'),
          line('black', 1.6, 'M19.5 23.5 L21 28'),
          { f: 'black', d: artEllipse(15.5, 22.5, 6.5, 1.9) },
          { f: 'orange', d: 'M17.5 21.5 C14 14 9.5 9.5 7 10.5 C4 12 4 17.5 6 19.8 C8.5 22.4 13 22.6 17.5 21.5 Z' },
          { f: 'orange', d: 'M17.5 21.5 C19 15 21 8.5 23.5 3 C19 3 13.5 5 9.5 8.5 C12.5 13 15 17 17.5 21.5 Z' },
          line('black', 2.2, 'M23 4 C19 4.2 14 6 10.5 8.8'),
          line('black', 2.2, 'M7.5 11.2 C5 12.5 5 17.5 6.7 19.4 C8.6 21.4 12 21.8 15 21.5'),
          line('black', 1.6, 'M17.5 20.5 C17 15.5 16 11.5 14.5 7.5'),
          line('black', 1.6, 'M16.5 21 C13.5 18.5 11 16 8.5 13.5'),
          { f: 'white', d: artCircle(13.5, 6.4, 0.7) },
          { f: 'white', d: artCircle(18, 4.6, 0.7) },
          { f: 'white', d: artCircle(5.6, 15, 0.7) },
          { f: 'white', d: artCircle(9, 20.6, 0.7) },
          { f: 'black', d: artCircle(23, 21, 2.1) },
          line('black', 1.6, 'M23.5 19.2 L27.5 10.5'),
          { f: 'black', d: artCircle(27.7, 10, 1.4) },
          line('black', 1.6, 'M24.5 22.5 C26.5 23 27 25 25.6 25.6 C24.6 26 24 25 24.8 24.4'),
          { f: 'white', d: artCircle(23.6, 20.4, 0.7) },
        ],
      },
      // 3 · Stachellose Bienen — vor 70 Mio. J. (Meliponini, Cretotrigona prisca (Maastrichtian
      //   ~70-66 Ma, dating debated)). Three tiny bees around a short wax/resin entrance tube
      //   jutting out of a branch. Farben: amber-brown bees, dark resin tube.
      {
        name: 'Stachellose Bienen', ma: 70, art: [
          { f: 'bark', d: 'M24 1.5 L30.5 1.5 L30.5 30.5 L23.5 30.5 C24.6 25.5 23.2 20.5 24 15.5 C24.7 10.5 23.3 6 24 1.5 Z' },
          { s: 'black', w: 1.6, d: 'M27 3.5 C27.6 6.5 26.8 8.5 27.2 11', o: 0.6 },
          { s: 'black', w: 1.6, d: 'M27.6 21 C28.2 24 27.4 26 27.8 28.5', o: 0.6 },
          { f: 'black', d: 'M24.5 12.5 C22 13 20 12 18 10.5 L18 21.5 C20 20 22 19 24.5 19.5 Z' },
          { f: 'black', d: artEllipse(18, 16, 2.4, 5.8) },
          { f: 'ink', d: artEllipse(17.5, 16, 1.3, 4) },
          ...tinyBee(5.5, 6),
          ...tinyBee(9.5, 16.5),
          ...tinyBee(5, 26.5),
        ],
      },
      // 4 · Schwärmer — vor 50 Mio. J. (Sphingidae (hawkmoths): trace fossils early Eocene, nectar
      //   feeding ~44 Ma (molecular); no secure body fossils). A stout arrow-shaped moth hovering
      //   with blurred narrow wings, a very long proboscis reaching into a flower. Farben:
      //   grey-olive with pink hindwing flashes. Seen from above (the arrow shape), the flower
      //   from the side.
      {
        name: 'Schwärmer', ma: 50, art: [
          line('olive', 2, 'M29 17 C30 21.5 29.5 25.5 28 29'),
          { f: 'white', d: 'M25.5 13 L29.8 14.4 L29.8 16.6 L25.5 18 Z' },
          { f: 'white', d: artEllipse(25.5, 15.5, 1.8, 4.6) },
          line('olive', 1.6, 'M19.5 15 L25 15.3'),
          { f: 'pink', d: 'M13 13 C11 10 8.5 8.5 6 8.5 C6.5 10.5 9 12.5 12.5 14 Z' },
          { f: 'pink', d: 'M13 17 C11 20 8.5 21.5 6 21.5 C6.5 19.5 9 17.5 12.5 16 Z' },
          { f: 'grey', d: 'M16.5 13 C14.5 9 11 4.5 6.5 2 C5 1.6 4.2 2.8 5 4.2 C7 8 9.5 11 12.5 13.5 Z' },
          { f: 'grey', d: 'M16.5 17 C14.5 21 11 25.5 6.5 28 C5 28.4 4.2 27.2 5 25.8 C7 22 9.5 19 12.5 16.5 Z' },
          { f: 'olive', d: 'M2 15 C4.5 13 8.5 12.4 13 12.6 L13 17.4 C8.5 17.6 4.5 17 2 15 Z' },
          { f: 'pink', d: 'M6 13.5 L7.6 13.1 L7.6 16.9 L6 16.5 Z' },
          { f: 'pink', d: 'M9.6 12.8 L11.2 12.7 L11.2 17.3 L9.6 17.2 Z' },
          { f: 'olive', d: artEllipse(15.5, 15, 3.6, 3.2) },
          { f: 'olive', d: artEllipse(19, 15, 1.8, 2.2) },
          { f: 'ink', d: artCircle(19.5, 13.6, 0.8) },
          { f: 'ink', d: artCircle(19.5, 16.4, 0.8) },
        ],
      },
      // 5 · Schwebfliegen — vor 45 Mio. J. (Syrphidae, oldest reliable fossils Eocene (Baltic
      //   amber ~45 Ma); molecular ~100 Ma). A hovering fly with one pair of clear wings, big eyes
      //   and a wasp-like yellow-black striped abdomen without waist. Farben: yellow-black stripes,
      //   red-brown eyes. Seen from above, so stripes and both wings show.
      {
        name: 'Schwebfliegen', ma: 45, art: [
          { f: 'cyan', d: 'M19 14 C17 10 13.5 5.5 10 3.5 C7.5 2.5 6 4.5 7.5 7 C10 10.5 14 13.5 19 15 Z' },
          { f: 'cyan', d: 'M19 18 C17 22 13.5 26.5 10 28.5 C7.5 29.5 6 27.5 7.5 25 C10 21.5 14 18.5 19 17 Z' },
          { f: 'black', d: artEllipse(10.5, 16, 7.5, 3.8) },
          { f: 'yellow', d: band(10.5, 16, 7.5, 3.8, 0, -5, -3.4) },
          { f: 'yellow', d: band(10.5, 16, 7.5, 3.8, 0, -1.6, 0) },
          { f: 'yellow', d: band(10.5, 16, 7.5, 3.8, 0, 1.8, 3.4) },
          { f: 'black', d: artEllipse(19.5, 16, 3.4, 3.6) },
          { f: 'rust', d: artEllipse(24.5, 16, 2.6, 4) },
        ],
      },
      // 6 · Hummeln — vor 34 Mio. J. (Bombini, stem forms Late Eocene ~34 Ma (Calyptapis,
      //   Oligobombus); Bombus from the Oligocene). A round, very fuzzy bee with short wings, banded
      //   body and white tail tip. Farben: black-yellow bands, white tail.
      {
        name: 'Hummeln', ma: 34, art: [
          line('black', 2.4, 'M14 24 L12 26.5 L11 28.5'),
          line('black', 2.4, 'M19.5 23.5 L19 28.5'),
          line('black', 2.4, 'M24 22.5 L26.5 25.5 L27.5 28.5'),
          { f: 'black', d: fuzz(11, 18.5, 8, 7, 16, 1.2) },
          { f: 'yellow', d: band(11, 18.5, 8, 7, 0, -1.2, 2.4) },
          { f: 'white', d: band(11, 18.5, 8, 7, 0, -8, -4.2) },
          { f: 'black', d: fuzz(20.5, 16, 5.5, 5.5, 12, 1.2) },
          { f: 'yellow', d: band(20.5, 16, 5.5, 5.5, 0, 2, 5.5) },
          { f: 'cyan', d: 'M20 11 C17 8 12.5 7 10 8.5 C11.5 10.5 15.5 12 20 12.5 Z' },
          { f: 'black', d: artEllipse(26.5, 17.5, 2.8, 3.3) },
          line('black', 1.8, 'M27 14.5 L28 11 L30 10'),
        ],
      },
      // 7 · Honigbienen — vor 25 Mio. J. (Apis henshawi (Rott and Enspel, Germany, Late Oligocene
      //   ~25-24 Ma)). A golden-brown bee standing on a small piece of hexagonal honeycomb. Farben:
      //   golden with brown bands, honey-yellow comb.
      {
        name: 'Honigbienen', ma: 25, art: [
          ...[5.4, 10.6, 15.8, 21, 26.2].map((x): ArtFill => ({ f: 'yellow', d: hex(x, 26, 3.4) })),
          ...[5.4, 10.6, 15.8, 21, 26.2].map((x): ArtFill => ({ f: 'chitin', d: hex(x, 26, 2.2) })),
          line('furDark', 2, 'M16.5 19 L13 21 L11.5 23.5'),
          line('furDark', 2, 'M19.5 19.5 L19 23.5'),
          line('furDark', 2, 'M23 19 L25.5 21 L27 23.5'),
          { f: 'chitin', d: oval(10, 15, 8, 4.3, -10) },
          { f: 'furDark', d: band(10, 15, 8, 4.3, -10, -8, -6) },
          { f: 'furDark', d: band(10, 15, 8, 4.3, -10, -4.4, -2.8) },
          { f: 'furDark', d: band(10, 15, 8, 4.3, -10, -1.2, 0.4) },
          { f: 'furDark', d: artEllipse(20, 14, 4.2, 4) },
          { f: 'cyan', d: 'M19 11 C15.5 7 9 6 4.5 7.5 C6 10 12 12 19 12.5 Z' },
          { f: 'furDark', d: artEllipse(25.8, 14.8, 2.8, 3.3) },
          line('furDark', 1.8, 'M26.3 11.8 L27.3 7.8 L29.8 6.8'),
          { f: 'ink', d: artCircle(26.6, 13.9, 1.3) },
        ],
      },
      // 8 · Prachtbienen — vor 20 Mio. J. (Euglossini (orchid bees), Dominican amber ~20-15 Ma). A
      //   shiny metallic bee with a very long tongue folded under the body to the tail. Farben:
      //   metallic emerald green.
      {
        name: 'Prachtbienen', ma: 20, art: [
          { f: 'cyan', d: 'M19 10.5 C16 8.5 11.5 8 8.5 9 C10 10.8 14.5 11.8 19 11.5 Z' },
          line('jungle', 2, 'M22.5 16 L23.5 22'),
          line('jungle', 2.2, 'M16.5 18 L14.5 22.5 L11 24'),
          line('forest', 1.8, 'M27.5 16.5 C26.5 19 23 20 18 20 C12 20 6.5 19.5 2.5 17.5'),
          { f: 'jungle', d: oval(13, 14.5, 6.5, 4.6, -12) },
          { f: 'forest', d: belly(13, 14.5, 6.5, 4.6, -12), o: 0.55 },
          { f: 'mint', d: oval(12.2, 12.2, 3.6, 1.3, -12), o: 0.8 },
          { f: 'jungle', d: artCircle(21, 12.5, 4.2) },
          { f: 'mint', d: oval(20, 10.3, 1.9, 1.1, -20), o: 0.8 },
          { f: 'cyan', d: 'M21 9 C19.5 4.5 15 1.8 10.5 2 C9 2.8 9.5 5 11.5 6.5 C14 8.5 17.5 9.5 21 10 Z' },
          { f: 'jungle', d: artEllipse(26.5, 13.5, 2.6, 3.3) },
          { f: 'ink', d: artCircle(27.2, 12.6, 1.2) },
          line('jungle', 1.8, 'M27 10.5 L28 7 L30 6'),
        ],
      },
    ],
    specialists: [
      // Morphofalter — Regenwald, ab Unterart 7 (Morpho (Nymphalidae), Neotropical rainforest
      //   butterflies). A large butterfly with wings spread flat, broad shining blue wings with dark
      //   borders. Farben: iridescent electric blue, black border. Seen from above, tilted to fly
      //   up and right.
      {
        name: 'Morphofalter', biome: Biome.Jungle, minStage: 6, art: [
          ...[FOREWING, HINDWING].flatMap((d) => spread(morpho, d)).map((d): ArtFill => ({ f: 'black', d })),
          ...spread(morpho, 'M15 13.5 C12.5 10.5 8.5 7.5 5.5 7.2 C5 9.5 5.8 13 7.3 15.2 C10 15.6 12.8 15.3 15 14.8 Z')
            .map((d): ArtFill => ({ f: 'blue', d })),
          ...spread(morpho, 'M15 16.6 C11.5 16.5 8.5 18 7.5 20.8 C7.2 23.2 9 25.4 11.2 25.6 C12.8 24.3 14.2 21 14.8 18.2 Z')
            .map((d): ArtFill => ({ f: 'blue', d })),
          { f: 'sky', d: morpho('M14.5 13.8 C12.5 11.5 9.5 9.5 7.5 9.3 C8 11.5 10.5 13.3 14.5 14.3 Z') },
          line('black', 2.4, morpho('M16 9.5 L16 23.5')),
          { f: 'black', d: spot(morpho, 16, 8.2, 1.6) },
          line('black', 1.6, morpho('M15.5 7 L13 2.5')),
          line('black', 1.6, morpho('M16.5 7 L19 2.5')),
          { f: 'black', d: spot(morpho, 13, 2.5, 1.2) },
          { f: 'black', d: spot(morpho, 19, 2.5, 1.2) },
        ],
      },
      // Yuccamotten — Wüste, ab Unterart 6 (Tegeticula (Prodoxidae), obligate yucca pollinators,
      //   ~40 Ma (molecular)). A small white moth on a bell-shaped yucca flower above a spiky leaf
      //   rosette. Farben: white moth, cream flowers, blue-green leaves. The moth flies in from the
      //   left, apart from the flowers, so its own outline keeps it readable at 16 px.
      {
        name: 'Yuccamotten', biome: Biome.Desert, minStage: 5, art: [
          line('clubmoss', 2, 'M17 27 C18.5 20 19.5 12 20 4.5'),
          line('clubmoss', 1.6, 'M20 6 L24.5 5'),
          line('clubmoss', 1.6, 'M19.5 13.5 L24.5 12.5'),
          { f: 'cream', d: bell(25, 4.5) },
          { f: 'cream', d: bell(25, 12.5) },
          { f: 'teal', d: blade(16, 29.5, 7, 19.5, 3.4) },
          { f: 'teal', d: blade(16, 29.5, 25, 19.5, 3.4) },
          { f: 'clubmoss', d: blade(16, 29.5, 2, 24.5, 3.4) },
          { f: 'clubmoss', d: blade(16, 29.5, 11.5, 18.5, 3.4) },
          { f: 'clubmoss', d: blade(16, 29.5, 20.5, 18.5, 3.4) },
          { f: 'clubmoss', d: blade(16, 29.5, 30, 24.5, 3.4) },
          ...[FOREWING, HINDWING].flatMap((d) => spread(yuccaMoth, d)).map((d): ArtFill => ({ f: 'white', d })),
          line('cream', 2, yuccaMoth('M16 9 L16 22')),
          { f: 'cream', d: spot(yuccaMoth, 16, 8.2, 1.1) },
          line('cream', 1.6, yuccaMoth('M15.5 7 L13 2.5')),
          line('cream', 1.6, yuccaMoth('M16.5 7 L19 2.5')),
        ],
      },
    ],
  };
}
