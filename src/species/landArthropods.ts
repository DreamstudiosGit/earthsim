/* =============================================================================
 * SimEarth 2.0 — species art: Landgliederfüßer (landArthropods)
 * -----------------------------------------------------------------------------
 * Myriapods, arachnids and woodlice. Side views facing right with feet on
 * y ≈ 28, except the centipede and the spiders best known from above (stage 5,
 * the orb weaver in its web, the tarantula), which are top views centred on
 * y = 16. Few, thick legs; the body shape carries each icon.
 * ========================================================================== */

namespace SE {
  const r1 = (v: number): number => Math.round(v * 10) / 10;
  /** A leg, antenna or thread as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });
  const dot = (f: PaletteKey, cx: number, cy: number, r: number): ArtFill => ({ f, d: artCircle(cx, cy, r) });

  /** Polyline through x,y pairs. */
  function poly(...p: number[]): string {
    let d = `M${p[0]} ${p[1]}`;
    for (let k = 2; k < p.length; k += 2) d += ` L${p[k]} ${p[k + 1]}`;
    return d;
  }

  /** The same polyline mirrored across y = 16 (the far side of an animal seen from above). */
  function polyFlip(...p: number[]): string {
    return poly(...p.map((v, k) => (k % 2 ? r1(32 - v) : v)));
  }

  /** A leg pair seen from above: the line and its mirror image. */
  function pair(s: PaletteKey, w: number, ...p: number[]): ArtStroke[] {
    return [line(s, w, poly(...p)), line(s, w, polyFlip(...p))];
  }

  /** The stretch of a base–knee–foot leg around its knee (a tarantula's leg band). */
  function knee(p: number[]): number[] {
    const [bx, by, kx, ky, fx, fy] = p;
    return [r1(kx + (bx - kx) * 0.15), r1(ky + (by - ky) * 0.15), kx, ky, r1(kx + (fx - kx) * 0.12), r1(ky + (fy - ky) * 0.12)];
  }

  /** An ellipse with short tufts all round: its radius alternates by `h`. */
  function hairy(cx: number, cy: number, rx: number, ry: number, n: number, h: number): string {
    const p: number[] = [];
    for (let k = 0; k < 2 * n; k++) {
      const a = (k / n) * Math.PI;
      const g = k % 2 ? h : 0;
      p.push(r1(cx + (rx + g) * Math.cos(a)), r1(cy + (ry + g) * Math.sin(a)));
    }
    return `${poly(...p)} Z`;
  }

  /** Millipede trunk: round segments along a gentle arch, each with a lighter ring. */
  function trunk(): Art {
    const seg: [number, number][] = [[4.2, 23], [7, 21.8], [9.8, 20.9], [12.6, 20.4], [15.4, 20.1], [18.2, 20], [21, 20.1], [23.8, 19.9]];
    return [
      ...seg.map(([x, y], k) => dot('furDark', x, y, k === 0 ? 2.5 : 2.9)),
      ...seg.slice(1).map(([x, y]) => line('fur', 1.6, poly(r1(x - 0.9), r1(y - 1.8), r1(x - 1.3), r1(y + 1.6)))),
    ];
  }

  /** Orb web around the centre: octagonal frame, eight radials, one spiral turn. */
  function web(): Art {
    const c = 16;
    const at = (deg: number, rad: number): [number, number] => [r1(c + rad * Math.cos(deg * Math.PI / 180)), r1(c + rad * Math.sin(deg * Math.PI / 180))];
    const frame = [0, 1, 2, 3, 4, 5, 6, 7, 8].flatMap((k) => at(22.5 + 45 * k, 14));
    const spokes = [0, 1, 2, 3].map((k) => poly(...at(45 * k, 12.9), ...at(45 * k + 180, 12.9)));
    const spiral = [0, 1, 2, 3, 4, 5, 6, 7, 8].flatMap((k) => at(45 * k - 90, 7.6 + k * 0.4));
    return [line('white', 1.6, poly(...frame)), ...spokes.map((d) => line('white', 1.6, d)), line('white', 1.6, poly(...spiral))];
  }

  SPECIES[Life.LandArthropod] = {
    stages: [
      // 1 · Tausendfüßer — vor 425 Mio. J. (Kampecaris obanensis (~425 Ma, Silurian, Scotland)). A
      //   long cylindrical segmented body, slightly arched, with many tiny legs underneath and short
      //   antennae. Farben: glossy dark brown, yellowish leg row.
      {
        name: 'Tausendfüßer', ma: 425, art: [
          ...[5.5, 8.7, 11.9, 15.1, 18.3, 21.5, 24.7].map((x) => line('sand', 1.6, poly(x, 22.5, r1(x - 1.2), 27.6))),
          line('bark', 1.8, poly(27, 17.2, 28.2, 13.6)),
          line('bark', 1.8, poly(28, 18.2, 29.8, 15.6)),
          ...trunk(),
          dot('bark', 26.4, 19.2, 3),
          { f: 'ink', d: artCircle(27.4, 18.6, 0.9) },
        ],
      },
      // 2 · Hundertfüßer — vor 420 Mio. J. (Chilopoda, Crussolum (Ludford Lane ~420 Ma)). A flat
      //   body with fewer but long legs splayed sideways, long antennae forward and hooked poison
      //   claws at the head. Farben: orange-red, darker head.
      {
        name: 'Hundertfüßer', ma: 420, art: [
          ...[7.5, 12.5, 17.5, 22.5].flatMap((x) => pair('orange', 1.8, x, 15, x - 1.5, 10, x - 4.5, 6.5)),
          ...pair('orange', 1.8, 5, 15.2, 2.4, 12.2),
          ...pair('rust', 1.6, 26.4, 14.2, 27.6, 10.5, 29.8, 6.6),
          line('orange', 4.2, poly(4.6, 16, 23.5, 16)),
          { f: 'rust', d: 'M4.6 16.4 L23.5 16.4 L23.5 18.1 L4.6 18.1 Z', o: 0.5 },
          { f: 'rust', d: artEllipse(25.4, 16, 2.8, 2.6) },
          ...pair('rust', 1.8, 26.6, 14.4, 29, 14.4, 29.6, 15.4),
        ],
      },
      // 3 · Weberknechte — vor 407 Mio. J. (Opiliones, Eophalangium sheari (Rhynie Chert ~407
      //   Ma)). A small round body held high on eight very long, thin, bent legs. Farben:
      //   beige-brown body, dark legs.
      {
        name: 'Weberknechte', ma: 407, art: [
          line('furDark', 1.6, 'M13 10.5 C11.5 4 8 2.6 6 4.4 L2.5 28'),
          line('furDark', 1.6, 'M19 10.5 C20.5 4 24 2.6 26 4.4 L29.5 28'),
          line('furDark', 1.6, 'M13.6 12.6 C12.6 8.6 10.8 7.4 9.6 8.6 L8.4 28'),
          line('furDark', 1.6, 'M18.4 12.6 C19.4 8.6 21.2 7.4 22.4 8.6 L23.6 28'),
          { f: 'tan', d: artEllipse(16, 10.8, 5.6, 4.2) },
          { f: 'furLight', d: 'M11.2 10.4 C11.6 8 13.8 7 16.4 7 C14.4 7.9 12.8 8.9 11.2 10.4 Z' },
          { f: 'fur', d: 'M21.2 11.4 C21 13.6 18.8 15 16 15 C18.2 14.2 20 13 21.2 11.4 Z' },
          { f: 'ink', d: artCircle(18, 8.6, 0.9) },
        ],
      },
      // 4 · Skorpione — vor 335 Mio. J. (Air-breathing scorpions with book lungs, Pulmonoscorpius
      //   (~335 Ma, East Kirkton); aquatic scorpions from ~435 Ma). A low body with two big pincers
      //   forward and a segmented tail curled up over the back ending in a stinger. Farben: sandy
      //   amber, darker stinger.
      {
        name: 'Skorpione', ma: 335, art: [
          line('fur', 2.2, poly(21.5, 18.5, 23, 14)),
          { f: 'fur', d: 'M22.4 12.4 C22.6 10.4 24.8 9.6 26.6 10.2 L29 11.2 L26.8 12 L28.6 13.6 C27.2 14.6 23.6 14.6 22.4 12.4 Z' },
          line('chitin', 2, poly(11, 22, 8, 24.5, 6.5, 28.2)),
          line('chitin', 2, poly(14.5, 22.5, 12.5, 25, 11.5, 28.2)),
          line('chitin', 2, poly(18, 22.5, 19.5, 25, 19.5, 28.2)),
          line('chitin', 2, poly(21, 22, 24, 24.5, 25, 28.2)),
          { f: 'chitin', d: 'M7.5 21.5 C8.5 18.6 12.5 17.8 16.5 18 L21.5 18.4 C23.6 18.8 24.6 21 23.8 22.8 C20 24.4 12.5 24.4 9.6 23.8 C8.4 23.4 7.5 22.6 7.5 21.5 Z' },
          dot('chitin', 8.6, 20.3, 2.5),
          dot('chitin', 6, 17.4, 2.4),
          dot('chitin', 4.9, 13.6, 2.3),
          dot('chitin', 5.6, 9.8, 2.2),
          dot('chitin', 8, 7, 2.1),
          dot('chitin', 11.4, 5.6, 2),
          dot('rust', 14.6, 6.4, 2),
          { f: 'rust', d: 'M15.6 5.4 C17.8 6 19 8.4 18.2 10.8 C17.2 9.2 16.2 8.4 14.8 8.2 Z' },
          { f: 'sand', d: 'M9.5 19.4 C12 18.4 16 18.2 21 18.6 C17 19.4 13 19.8 9.5 20.6 Z' },
          line('chitin', 2.6, poly(22.4, 19.8, 25, 18.4)),
          { f: 'chitin', d: 'M23.8 18.4 C23.8 15.8 26.2 14.8 28 15.4 L30.4 16.6 L28 17.4 L30.2 19.4 C28.6 20.8 25 20.6 23.8 18.4 Z' },
          { f: 'ink', d: artCircle(22.2, 19.6, 0.8) },
        ],
      },
      // 5 · Spinnen — vor 315 Mio. J. (Araneae, Mesothelae (Arthrolycosa, Late Carboniferous
      //   ~315-310 Ma)). A two-part body (small head, round abdomen) on eight bent legs, a short
      //   silk thread trailing from the rear. Farben: dark brown, white silk.
      {
        name: 'Spinnen', ma: 315, art: [
          line('white', 1.6, 'M7.5 16.4 C5.5 16.8 5.6 19 4 19.8 C3 20.3 2.4 21 2.4 22'),
          ...pair('furDark', 1.8, 20.8, 13.8, 24.6, 9, 29.8, 7.6),
          ...pair('furDark', 1.8, 19.4, 13.3, 21, 7, 23.8, 3),
          ...pair('furDark', 1.8, 18, 13.3, 15.8, 7.4, 12.6, 3.4),
          ...pair('furDark', 1.8, 16.8, 14, 13, 10, 5.4, 7.4),
          { f: 'furDark', d: artEllipse(11.8, 16, 5, 4.3) },
          { f: 'fur', d: artEllipse(11.2, 15, 3.4, 2.4), o: 0.7 },
          { f: 'furDark', d: artEllipse(19.2, 16, 3.6, 3) },
          { f: 'fur', d: artEllipse(18.8, 15.4, 2, 1.5), o: 0.7 },
          ...pair('furDark', 1.8, 22, 15, 24, 14.4),
        ],
      },
      // 6 · Radnetzspinnen — vor 140 Mio. J. (Orb weavers (Araneoidea/Deinopoidea), Early
      //   Cretaceous fossils ~140 Ma, orb-web silk in amber ~110 Ma; relatives from the Jurassic). A
      //   spider sitting in the centre of a round web (a few radial lines and one spiral). Farben:
      //   yellow-black striped spider, silver web.
      {
        name: 'Radnetzspinnen', ma: 140, art: [
          ...web(),
          ...pair('black', 2, 19.6, 14.8, 22.5, 11.4, 24.8, 7.2),
          ...pair('black', 2, 17.6, 14.6, 13.5, 11, 7.4, 8.6),
          { f: 'yellow', d: artEllipse(13.2, 16, 4.6, 3.6) },
          { f: 'black', d: 'M10.8 12.8 L12.4 12.5 L12.4 19.5 L10.8 19.2 Z' },
          { f: 'black', d: 'M14.2 12.5 L15.8 12.8 L15.8 19.2 L14.2 19.5 Z' },
          { f: 'grey', d: artCircle(19.3, 16, 2.4) },
        ],
      },
      // 7 · Landasseln — vor 105 Mio. J. (Oniscidea (woodlice), earliest diverse fauna in Albian
      //   amber, Spain (~105 Ma; Sánchez-García et al. 2021)). A low arched oval of seven
      //   overlapping segments, short bent antennae and many tiny legs, side view. Farben: slate
      //   grey, lighter segment edges.
      {
        name: 'Landasseln', ma: 105, art: [
          ...[7.5, 11.5, 15.5, 19.5, 23.5].map((x) => line('greyDark', 1.8, poly(x, 24, x - 0.8, 28))),
          line('greyDark', 1.8, poly(25.5, 21, 28, 17.5, 29.8, 21.5)),
          line('greyDark', 1.8, poly(5, 24.4, 2.4, 25.4)),
          { f: 'grey', d: 'M3.8 25.2 C3.8 18 9 14 15.5 14 C22 14 27 18 27 25.2 Z' },
          ...[8, 11.6, 15.2, 18.8, 22.4].map((x) => line('greyDark', 1.6, `M${x} 25 C${r1(x - 1.2)} 21 ${r1(x - 0.6)} 17 ${r1(x + 0.8)} 14.6`)),
          { f: 'white', d: 'M6 20 C7.5 16.5 11 14.8 15 14.6 C11.5 15.8 8.6 17.6 6 20 Z', o: 0.6 },
          { f: 'ink', d: artCircle(24.6, 21.2, 0.9) },
        ],
      },
      // 8 · Springspinnen — vor 44 Mio. J. (Salticidae, Baltic amber (Eocene ~44 Ma)). A compact
      //   furry spider in a jumping pose with two huge forward-facing eyes on a square head. Farben:
      //   black with white spots, iridescent green fangs.
      {
        name: 'Springspinnen', ma: 44, art: [
          line('black', 2.6, poly(11.5, 20, 6.5, 21.5, 3, 28)),
          line('black', 2.6, poly(15.5, 20.5, 12.5, 24, 11, 28.4)),
          line('black', 2.6, poly(19, 20.5, 19.5, 24.5, 18, 28.4)),
          line('black', 2.6, poly(23, 19.5, 28, 21, 29.2, 27.8)),
          { f: 'black', d: hairy(8.8, 16.4, 5.4, 4.2, 10, 0.8) },
          { f: 'greyDark', d: 'M4.2 15.4 C4.6 13 6.8 11.8 9.4 11.8 C7.4 12.8 5.8 13.8 4.2 15.4 Z' },
          { f: 'white', d: 'M7.4 15.4 L11.6 15.4 L9.5 18.4 Z' },
          { f: 'black', d: 'M14.6 12.4 C14.6 9.4 16.6 8.4 19.6 8.4 L26 8.6 C28.4 8.8 29.8 10.4 29.8 12.8 L29.6 18.4 C29.4 20.6 27.6 21.6 25.6 21.6 L18 21.6 C15.6 21.6 14.6 20 14.6 18 Z' },
          { f: 'teal', d: 'M20.6 20.6 L28 20.6 C28 23 27 24.6 25.8 25 L24.4 23 L22.8 25 C21.4 24.6 20.6 23 20.6 20.6 Z' },
          dot('white', 21.4, 13.6, 2.9),
          dot('white', 26.6, 13.6, 2.6),
          { f: 'ink', d: artCircle(21.8, 13.8, 2) },
          { f: 'ink', d: artCircle(26.9, 13.8, 1.8) },
          dot('white', 21.1, 13, 0.7),
          dot('white', 26.3, 13, 0.6),
        ],
      },
    ],
    specialists: [
      // Walzenspinnen — Wüste, ab Unterart 6 (Solifugae (camel spiders), Protosolpuga (~308 Ma);
      //   typical desert hunters today). A hairy, big-headed arachnid with huge jaw pincers in front
      //   and long leg-like palps, running. Farben: sandy tan, pale hairs.
      {
        name: 'Walzenspinnen', biome: Biome.Desert, minStage: 5, art: [
          line('tan', 2, poly(10, 19.5, 6, 21.5, 2.5, 27.8)),
          line('tan', 2, poly(14, 19.5, 11.5, 24, 9.5, 28.2)),
          line('sand', 2, poly(16.5, 19.5, 18, 24, 16.5, 28.2)),
          line('sand', 2.2, poly(20.5, 19, 25, 21, 29.8, 27.6)),
          { f: 'sand', d: artEllipse(9, 16.8, 6.4, 4) },
          ...[6.6, 9.6, 12.6].map((x) => line('tan', 1.6, `M${x} 13.2 C${r1(x - 0.8)} 15.6 ${r1(x - 0.8)} 18.2 ${x} 20.6`)),
          dot('sand', 18.2, 15, 4.4),
          { f: 'sand', d: 'M19.4 11.4 C24 10.4 28.4 11 30.4 13.6 L27.8 13.8 L28.4 15.2 C26.4 14.8 24.2 15.2 21 15.6 Z' },
          { f: 'tan', d: 'M20 16.4 L24.6 16.2 C26.6 16.4 28.6 17.4 29.8 19 L27.2 18.8 L27.4 20.2 C25.2 19.6 23 19.8 20.6 20 Z' },
          { f: 'cream', d: 'M14.8 13.2 C15.4 11.4 17.2 10.6 19 10.8 C17.2 11.8 16.2 12.6 14.8 13.2 Z' },
          { f: 'ink', d: artCircle(20.4, 13.2, 0.9) },
        ],
      },
      // Vogelspinnen — Regenwald, ab Unterart 7 (Theraphosidae (tarantulas), molecular origin ~120
      //   Ma). A large, heavy-bodied, very hairy spider with thick legs. Farben: black-brown with
      //   orange leg bands.
      {
        name: 'Vogelspinnen', biome: Biome.Jungle, minStage: 6, art: [
          ...[
            [21.6, 14, 25.4, 10.2, 29.2, 10.8],
            [20.2, 13.2, 22.6, 6.6, 26.2, 3.4],
            [18.6, 13.2, 17, 6.2, 14.6, 3.2],
            [17.4, 14, 12.6, 8.8, 5, 5.6],
          ].flatMap((p) => [...pair('black', 2.4, ...p), ...pair('orange', 2.4, ...knee(p))]),
          { f: 'furDark', d: hairy(9.4, 16, 5.4, 4.6, 11, 1) },
          { f: 'fur', d: 'M5.4 14.6 C5.8 12.6 7.6 11.6 9.8 11.6 C8 12.4 6.6 13.4 5.4 14.6 Z' },
          { f: 'black', d: artEllipse(19.6, 16, 4, 3.4) },
          ...pair('black', 2.2, 23, 14.8, 24.6, 14.6),
        ],
      },
    ],
  };
}
