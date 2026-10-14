/* =============================================================================
 * SimEarth 2.0 — species art: Weichtiere (molluscs)
 * -----------------------------------------------------------------------------
 * From the first capped snail to the cone snail, plus a giant squid and a sea
 * angel: side views facing right (the chiton from above), crawlers low, swimmers
 * around y ≈ 16; shells lit from the upper left with a darker lower half, soft
 * parts (foot, arms, tentacles) as separate flat shapes.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;
  /** An arm, tentacle or growth line as a round-capped line. */
  const line = (s: PaletteKey, w: number, d: string): ArtStroke => ({ s, w, d });

  /** A spiral line from radius `r0` (inside) to `r1`, ending at angle `end`. */
  function spiral(cx: number, cy: number, r0: number, r1: number, turns: number, end: number): string {
    const n = Math.round(turns * 18);
    const start = end - turns * 2 * Math.PI;
    const pts: string[] = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const a = start + t * turns * 2 * Math.PI;
      const rad = r0 + (r1 - r0) * t;
      pts.push(`${k ? 'L' : 'M'}${r(cx + rad * Math.cos(a))} ${r(cy + rad * Math.sin(a))}`);
    }
    return pts.join(' ');
  }

  /** `n` radial ribs between radius `r0` and `r1`, from angle `a0` to `a1`. */
  function ribs(cx: number, cy: number, r0: number, r1: number, n: number, a0: number, a1: number): string {
    const out: string[] = [];
    for (let k = 0; k < n; k++) {
      const a = a0 + ((a1 - a0) * k) / (n - 1);
      out.push(`M${r(cx + r0 * Math.cos(a))} ${r(cy + r0 * Math.sin(a))} L${r(cx + r1 * Math.cos(a))} ${r(cy + r1 * Math.sin(a))}`);
    }
    return out.join(' ');
  }

  /** Outline of a clam valve: the umbo first, then cubic control points round the margin. */
  const CLAM = [
    [14.5, 6.6], [11, 7.9], [6.5, 10.4], [4.8, 13.8], [3.2, 17.2], [4.6, 20.6], [8.5, 22.3],
    [12.5, 24], [19.5, 24], [24, 22.3], [28, 20.6], [29.5, 17.6], [28.8, 14.7],
    [28, 11.7], [24.5, 9.6], [20, 8.4], [17.5, 7.9], [16, 7.3], [14.5, 6.6],
  ];

  /**
   * The valve outline shrunk by `s` towards the umbo, as growth lines are: the
   * whole valve (closed) or only its lower margin (a growth ring).
   */
  function clam(s: number, ring: boolean, dx = 0, dy = 0): string {
    const [ux, uy] = CLAM[0];
    const p = CLAM.map(([x, y]) => `${r(ux + (x - ux) * s + dx)} ${r(uy + (y - uy) * s + dy)}`);
    const pts = ring ? p.slice(3, 13) : p;
    let d = `M${pts[0]}`;
    for (let k = 1; k + 2 < pts.length; k += 3) d += ` C${pts[k]} ${pts[k + 1]} ${pts[k + 2]}`;
    return ring ? d : `${d} Z`;
  }

  /**
   * A chiton's eight plates seen from above, inside an oval of rx × ry: each a
   * tile with a gap to the next, its rear edge bowed backwards like a roof tile.
   */
  const CHITON = { cx: 16, cy: 17, rx: 11.6, ry: 6 };
  function chitonPlates(): string[] {
    const { cx, cy, rx, ry } = CHITON;
    const w = (2 * rx) / 8;
    const half = (x: number): number => 0.94 * ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
    const plates: string[] = [];
    for (let k = 0; k < 8; k++) {
      const a = cx - rx + w * k + (k ? 0.4 : 0.6);
      const b = cx - rx + w * (k + 1) - (k < 7 ? 0.4 : 0.6);
      const xs = [0, 0.25, 0.5, 0.75, 1].map((t) => a + (b - a) * t);
      const top = xs.map((x) => `${r(x)} ${r(cy - half(x))}`);
      const bot = xs.map((x) => `${r(x)} ${r(cy + half(x))}`).reverse();
      const front = k < 7 ? ` L${r(b - 1.1)} ${cy}` : '';
      const rear = k > 0 ? ` L${r(a - 1.1)} ${cy}` : '';
      plates.push(`M${top.join(' L')}${front} L${bot.join(' L')}${rear} Z`);
    }
    return plates;
  }

  /** A band around a straight cone with its tip at (tx, cy). */
  function coneBand(tx: number, cy: number, slope: number, x0: number, x1: number): string {
    const h0 = (x0 - tx) * slope;
    const h1 = (x1 - tx) * slope;
    return `M${r(x0)} ${r(cy - h0)} L${r(x1)} ${r(cy - h1)} L${r(x1)} ${r(cy + h1)} L${r(x0)} ${r(cy + h0)} Z`;
  }

  /** The first snail's creeping foot, its head raised at the right. */
  const FOOT = 'M3 26 C3 24.3 4.8 23.5 7.5 23.5 L22 23.5 C24 23.5 25 22.5 26 21.3 C27 20.3 28.8 20.4 29.4 21.6 C30 23 29.5 25 28.5 26.2 C27.8 27.2 26.5 27.8 24.5 27.8 L7.5 27.8 C4.8 27.8 3 27.3 3 26 Z';

  SPECIES[Life.Mollusc] = {
    stages: [
      // 1 · Urschnecken — vor 530 Mio. J. (Helcionellids and Aldanella, early Cambrian small
      //   shelly fauna (~535-530 Ma); snail affinity debated). A small curved cap-shaped shell (like
      //   a Phrygian cap) tipped to the right on a soft creeping foot. Farben: pale yellow-cream
      //   shell, grey-pink foot.
      {
        name: 'Urschnecken', ma: 530, art: [
          line('grey', 2, 'M27.4 21 L29.4 16.8'),
          { f: 'grey', d: FOOT },
          { f: 'pink', d: FOOT, o: 0.55 },
          { f: 'cream', d: 'M5.5 24 C5.5 17 8.5 11 13.5 8.5 C17 6.8 21.5 7 23.5 9.8 C24.2 10.9 24 12.2 23.2 12.7 C22.3 11.6 20.8 11.3 19.6 12 C20.2 15.5 20.8 19.5 21.8 24 Z' },
          { f: 'sand', d: 'M14 8.3 C17.3 6.9 21.6 7.1 23.5 9.8 C24.2 10.9 24 12.2 23.2 12.7 C22.3 11.6 20.8 11.3 19.6 12 C20.2 15.5 20.8 19.5 21.8 24 L15 24 C15.6 18 15.4 12.5 14 8.3 Z' },
          line('tan', 1.8, 'M7.6 19.6 C10.5 18.6 15.5 18.5 20.4 19.4'),
          line('tan', 1.8, 'M9.6 14.6 C12 13.8 15.5 13.7 19.6 14.4'),
          { f: 'ink', d: artCircle(27.4, 23.2, 0.8) },
        ],
      },
      // 2 · Muscheln — vor 525 Mio. J. (Bivalvia, Pojetaia and Fordilla (~530-520 Ma)). A
      //   two-valved shell from the side with concentric growth lines, slightly open, a tongue-like
      //   foot digging into sand. Farben: beige-brown shell with darker growth rings, pink foot.
      {
        name: 'Muscheln', ma: 525, art: [
          { f: 'coral', d: 'M20.5 23 C24 23.6 27 25.5 28.6 28 C28.8 29.2 27.6 29.8 26.2 29.6 C23.4 29.1 21 27.6 19.6 25.4 Z' },
          { f: 'fur', d: clam(1, false, 1.2, 2.6) },
          { f: 'tan', d: clam(1, false) },
          { f: 'sand', d: clam(0.5, false) },
          line('fur', 1.8, clam(0.8, true)),
          line('fur', 1.8, clam(0.6, true)),
          line('fur', 1.8, clam(0.38, true)),
        ],
      },
      // 3 · Käferschnecken — vor 500 Mio. J. (Polyplacophora (chitons), Late Cambrian ~500 Ma
      //   (Matthevia)). A low arched oval with eight overlapping shell plates like roof tiles,
      //   framed by a scaly girdle. Farben: olive-green plates, tan girdle.
      {
        name: 'Käferschnecken', ma: 500, art: [
          { f: 'tan', d: artEllipse(16, 17, 14, 8.5) },
          { f: 'forest', d: artEllipse(CHITON.cx, CHITON.cy, CHITON.rx, CHITON.ry) },
          ...chitonPlates().map((d): ArtShape => ({ f: 'scale', d })),
          { f: 'olive', d: `M${CHITON.cx - CHITON.rx} ${CHITON.cy} A${CHITON.rx} ${CHITON.ry} 0 0 0 ${CHITON.cx + CHITON.rx} ${CHITON.cy} Z`, o: 0.55 },
        ],
      },
      // 4 · Orthoceren — vor 480 Mio. J. (Straight-shelled nautiloids (Endocerida, Orthocerida;
      //   Ordovician, Endoceras several metres long); first cephalopods ~500 Ma (Plectronoceras)). A
      //   long straight cone shell pointing left with banding, a short bunch of tentacles and an eye
      //   at the open right end. Farben: cream shell with red-brown bands, pinkish tentacles.
      {
        name: 'Orthoceren', ma: 480, art: [
          line('coral', 2, 'M23.5 13.5 C26 11.5 28 10.6 30 11'),
          line('coral', 2, 'M24.5 16 L30.4 16.2'),
          line('coral', 2, 'M23.5 18.5 C26 20.5 28 21.4 30 21'),
          { f: 'cream', d: 'M2 16 L20 11.2 C20.8 12.5 21.2 14.2 21.2 16 C21.2 17.8 20.8 19.5 20 20.8 Z' },
          { f: 'sand', d: 'M2 16 L21.2 16 C21.2 17.8 20.8 19.5 20 20.8 Z' },
          { f: 'rust', d: coneBand(2, 16, 4.8 / 18, 5.5, 7.1) },
          { f: 'rust', d: coneBand(2, 16, 4.8 / 18, 9.5, 11.2) },
          { f: 'rust', d: coneBand(2, 16, 4.8 / 18, 13.5, 15.3) },
          { f: 'rust', d: coneBand(2, 16, 4.8 / 18, 17.3, 19.2) },
          { f: 'coral', d: artEllipse(22.3, 16, 2.8, 3.6) },
          { f: 'ink', d: artCircle(22.6, 14.8, 0.9) },
        ],
      },
      // 5 · Ammoniten — vor 407 Mio. J. (Ammonoidea from Early Devonian ~410-407 Ma, extinct 66
      //   Ma). A tightly coiled ribbed spiral shell, its opening facing right with tentacles and an
      //   eye. Farben: golden-brown shell, darker ribs, pink tentacles.
      {
        name: 'Ammoniten', ma: 407, art: [
          line('coral', 2, 'M25.5 18 C27.5 16.5 29 16 30.3 16.4'),
          line('coral', 2, 'M26.3 20.3 L30.4 21'),
          line('coral', 2, 'M25 22 C26.5 24.5 28 25.5 29.8 25.4'),
          { f: 'gold', d: artCircle(13, 15.5, 10.5) },
          { f: 'fur', d: 'M20.4 8.1 A10.5 10.5 0 0 1 5.6 22.9 Z', o: 0.5 },
          line('fur', 1.6, ribs(13, 15.5, 7.6, 10, 14, 0, 2 * Math.PI * 13 / 14)),
          line('furDark', 1.8, spiral(13, 15.5, 0.6, 7, 2.2, 0.4)),
          { f: 'coral', d: artEllipse(24.3, 19.5, 2.8, 3.2) },
          { f: 'ink', d: artCircle(24.5, 18.5, 0.9) },
        ],
      },
      // 6 · Belemniten — vor 200 Mio. J. (Belemnitida ('Donnerkeile'), latest Triassic/Early
      //   Jurassic ~200 Ma, extinct 66 Ma). A squid-like torpedo with fins near the rear, the rear
      //   tipped by a pointed bullet-shaped guard, ten short hooked arms at the right. Farben:
      //   reddish-violet body, honey-amber guard.
      {
        name: 'Belemniten', ma: 200, art: [
          line('shell', 2, 'M24.5 14 C26.5 12.8 28.3 12.4 29.8 13.4'),
          line('shell', 2, 'M25.2 16.1 L30.2 16.2'),
          line('shell', 2, 'M24.5 18.2 C26.5 19.4 28.3 19.8 29.8 18.8'),
          { f: 'rust', d: 'M8.5 13.8 C9 10.5 10.5 8.2 13.5 7.8 C14 9.8 14.8 11.3 16.5 12.2 Z' },
          { f: 'rust', d: 'M8.5 18.2 C9 21.5 10.5 23.8 13.5 24.2 C14 22.2 14.8 20.7 16.5 19.8 Z' },
          { f: 'chitin', d: 'M2 16 C3.2 14.3 5.5 13.7 9.5 13.6 L9.5 18.4 C5.5 18.3 3.2 17.7 2 16 Z' },
          { f: 'gold', d: 'M2 16 C3.2 14.3 5.5 13.7 9.5 13.6 L9.5 16 Z' },
          { f: 'shell', d: 'M8 16 C8 13 10.5 12 15 11.8 L21 12 C22.3 12.6 22.8 14.2 22.8 16 C22.8 17.8 22.3 19.4 21 20 L15 20.2 C10.5 20 8 19 8 16 Z' },
          { f: 'rust', d: 'M8 16 L22.8 16 C22.8 17.8 22.3 19.4 21 20 L15 20.2 C10.5 20 8 19 8 16 Z', o: 0.5 },
          { f: 'shell', d: artEllipse(23.2, 16, 2.4, 3.2) },
          { f: 'ink', d: artCircle(23.6, 15, 1) },
        ],
      },
      // 7 · Kraken — vor 95 Mio. J. (Octopoda, Late Cretaceous ~95 Ma (Keuppia, Palaeoctopus;
      //   Lebanon)). A bulbous mantle with a big eye and eight arms curling below and to the right.
      //   Farben: red-orange, lighter suckers.
      {
        name: 'Kraken', ma: 95, art: [
          line('orange', 2.8, 'M13.5 19 C10.5 21 7.5 23 6.5 26 C6 28 8 29.2 9.5 28'),
          line('orange', 2.8, 'M16.5 20.5 C16 23.5 16.5 27 19.5 28.3 C21.5 29 22.6 27 21.2 26'),
          line('orange', 2.8, 'M20.5 20 C23 22.5 26.5 24 29 22.5 C30.3 21.5 29.6 19.5 28 20.2'),
          line('orange', 2.8, 'M22.5 16.8 C25 16.5 27.5 15 28.5 12.5 C29 11 28 9.5 26.6 10.3'),
          { f: 'orange', d: 'M4.5 11.5 C4 6.5 7.5 3 12.5 3.2 C17 3.5 20 6.5 19.8 10.5 C19.6 13.5 17.5 15.8 14.5 16.4 C10 17.2 5.2 15.5 4.5 11.5 Z' },
          { f: 'rust', d: 'M19.8 10.5 C19.6 13.5 17.5 15.8 14.5 16.4 C10 17.2 5.2 15.5 4.5 11.5 C8 13.5 15 13.5 19.8 10.5 Z', o: 0.5 },
          { f: 'orange', d: artEllipse(18, 16.5, 5, 4.2) },
          { f: 'cream', d: artCircle(25.2, 23.6, 0.6) },
          { f: 'cream', d: artCircle(27.4, 23.6, 0.6) },
          { f: 'cream', d: artCircle(16.3, 24.2, 0.6) },
          { f: 'cream', d: artCircle(17.6, 27, 0.6) },
          { f: 'cream', d: artCircle(20, 15, 1.8) },
          { f: 'ink', d: artCircle(20.4, 15, 0.9) },
        ],
      },
      // 8 · Kegelschnecken — vor 55 Mio. J. (Conidae (Conus), from early Eocene ~55 Ma; venomous
      //   predators). A cone shell lying on its side (tip left) with a bold tent/spot pattern, a
      //   thin siphon and harpoon proboscis reaching right. Farben: cream with brown tent pattern,
      //   orange siphon.
      {
        name: 'Kegelschnecken', ma: 55, art: [
          line('orange', 2.4, 'M24.4 16 C25.4 13.6 26 11.6 27.6 9.8'),
          line('orange', 1.8, 'M25.4 18.4 L30.4 19.6'),
          { f: 'cream', d: 'M3.5 17.5 L7.2 11.3 C7.6 10.7 8.3 10.4 9 10.5 L24.2 15.7 C25.2 16.1 25.6 16.8 25.6 17.5 C25.6 18.2 25.2 18.9 24.2 19.3 L9 24.5 C8.3 24.6 7.6 24.3 7.2 23.7 Z' },
          { f: 'sand', d: 'M3.5 17.5 L25.6 17.5 C25.6 18.2 25.2 18.9 24.2 19.3 L9 24.5 C8.3 24.6 7.6 24.3 7.2 23.7 Z' },
          { f: 'furDark', d: 'M11 11.2 L14.5 12.4 L13.2 15 L14.8 17.5 L13.2 20 L14.5 22.6 L11 23.8 L12.3 20 L10.7 17.5 L12.3 15 Z' },
          { f: 'furDark', d: 'M17.5 13.4 L20.5 14.4 L19.5 16 L20.7 17.5 L19.5 19 L20.5 20.6 L17.5 21.6 L18.4 19 L17.2 17.5 L18.4 16 Z' },
          line('furDark', 1.6, 'M8.2 11.2 L8.2 23.8'),
        ],
      },
    ],
    specialists: [
      // Riesenkalmare — Hochsee, ab Unterart 7 (Architeuthis dux (deep sea); decabrachian squids
      //   since the Mesozoic). A long torpedo squid with a pointed tail fin, a huge eye and two
      //   extra-long tentacles trailing among shorter arms. Farben: deep red, silver eye.
      {
        name: 'Riesenkalmare', biome: Biome.Ocean, minStage: 6, art: [
          line('red', 1.8, 'M20.5 15.2 C23.5 14 26 12.5 28.2 12'),
          line('red', 1.8, 'M20.5 16.8 C23.5 18 26 19.5 28.2 20'),
          { f: 'red', d: artEllipse(28.9, 11.9, 1.5, 1.1) },
          { f: 'red', d: artEllipse(28.9, 20.1, 1.5, 1.1) },
          { f: 'rust', d: 'M19.5 14 C22.5 13.4 25 13.6 26.8 14.6 L25.6 16 L26.8 17.4 C25 18.4 22.5 18.6 19.5 18 Z' },
          { f: 'rust', d: 'M2 16 L6 10.5 L9.5 16 L6 21.5 Z' },
          { f: 'red', d: 'M4 16 C5 13.8 8 13 11.5 12.8 L16 13 C17 13.6 17.4 14.7 17.4 16 C17.4 17.3 17 18.4 16 19 L11.5 19.2 C8 19 5 18.2 4 16 Z' },
          { f: 'rust', d: 'M4 16 L17.4 16 C17.4 17.3 17 18.4 16 19 L11.5 19.2 C8 19 5 18.2 4 16 Z', o: 0.55 },
          { f: 'red', d: artEllipse(18.6, 16, 2.4, 2.9) },
          { f: 'white', d: artCircle(18.8, 15.4, 1.9) },
          { f: 'ink', d: artCircle(19.1, 15.4, 1) },
        ],
      },
      // Seeengel — Eis, ab Unterart 8 (Clione limacina (sea angel, Gymnosomata, Arctic); pteropods
      //   from ~56 Ma). A small translucent angel shape: upright body with two wing-like flaps and a
      //   glowing orange core. Farben: glassy clear body, orange-red core.
      {
        name: 'Seeengel', biome: Biome.Arctic, minStage: 7, art: [
          { f: 'cyan', d: 'M13.5 13 C10 10 6 9.5 4 11 C3.5 13 6 15.5 9.5 16.5 C11 17 12.5 16.8 13.5 16 Z' },
          { f: 'cyan', d: 'M18.5 13 C22 10 26 9.5 28 11 C28.5 13 26 15.5 22.5 16.5 C21 17 19.5 16.8 18.5 16 Z' },
          { f: 'cyan', d: 'M16 5 C18.5 5 20 7 19.5 9.5 C19.3 10.5 19 11.2 18.8 12 C20 15 20.5 19 19.5 22.5 C18.8 25 17.5 27.5 16 28.5 C14.5 27.5 13.2 25 12.5 22.5 C11.5 19 12 15 13.2 12 C13 11.2 12.7 10.5 12.5 9.5 C12 7 13.5 5 16 5 Z' },
          { f: 'white', d: 'M16 5 C14 5 12.5 6.5 12.5 8.5 C13.5 7 15 6.5 16.5 6.5 Z' },
          { f: 'orange', d: artEllipse(16, 18.5, 2.3, 4) },
          { f: 'red', d: artCircle(16, 9, 1.6) },
        ],
      },
    ],
  };
}
