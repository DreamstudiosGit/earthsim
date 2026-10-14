/* =============================================================================
 * SimEarth 2.0 — plant art: Moose (mosses)
 * -----------------------------------------------------------------------------
 * Yellow-green moss cushions with a knobbly top, lit from the upper left (the
 * lower right falls into olive shade), and spore capsules on thin red-brown
 * stalks. Specialists: pink-red peat-moss hummocks in the swamp, dark dry
 * tufts on cracked desert crust, hoary grey cushions on bare rock.
 * ========================================================================== */

namespace SE {
  const r = (v: number): number => Math.round(v * 10) / 10;

  type Pt = readonly [number, number];

  const poly = (pts: readonly Pt[]): string => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join(' L')} Z`;

  /**
   * Outline of a cushion standing on (cx, base), `w` wide and `h` tall, its
   * top rounded into `bumps` knobs `amp` deep (a fraction of the size).
   */
  function dome(cx: number, base: number, w: number, h: number, bumps: number, amp: number): Pt[] {
    const pts: Pt[] = [];
    const n = bumps * 6;
    for (let k = 0; k <= n; k++) {
      const phi = Math.PI * (1 - k / n);
      const rho = 1 - amp * (1 - Math.abs(Math.sin(bumps * phi)));
      pts.push([cx + (w / 2) * Math.cos(phi) * rho, base - h * Math.sin(phi) * rho]);
    }
    // A slightly sagging underside, so neighbouring tiles never line up into a band.
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      pts.push([pts[n][0] + (pts[0][0] - pts[n][0]) * t, base + 0.6 * Math.sin(Math.PI * t)]);
    }
    return pts;
  }

  /**
   * A cushion in `body` colour: the whole dome shaded with `shade`, then the
   * lit part — the dome shrunk towards its upper-left shoulder — painted over
   * it in `lit`, so the shade forms a crescent on the lower right. With
   * `shade` equal to `body` the crescent is plain `body`.
   */
  function cushion(
    cx: number, base: number, w: number, h: number, body: PaletteKey, shade: PaletteKey, bumps = 4, amp = 0.14,
    lit: PaletteKey = body,
  ): ArtShape[] {
    const pts = dome(cx, base, w, h, bumps, amp);
    const a: Pt = [cx - w * 0.3, base - h * 0.78];
    const top = pts.map(([x, y]): Pt => [a[0] + (x - a[0]) * 0.74, a[1] + (y - a[1]) * 0.72]);
    return [
      { f: body, d: poly(pts) },
      ...(shade === body ? [] : [{ f: shade, d: poly(pts), o: 0.6 }]),
      { f: lit, d: poly(top) },
    ];
  }

  /** Path data for an ellipse turned by `deg` degrees. */
  function tilted(cx: number, cy: number, rx: number, ry: number, deg: number): string {
    const c = Math.cos((deg * Math.PI) / 180);
    const s = Math.sin((deg * Math.PI) / 180);
    const x0 = r(cx - rx * c);
    const y0 = r(cy - rx * s);
    const x1 = r(cx + rx * c);
    const y1 = r(cy + rx * s);
    return `M${x0} ${y0} A${rx} ${ry} ${deg} 1 0 ${x1} ${y1} A${rx} ${ry} ${deg} 1 0 ${x0} ${y0} Z`;
  }

  /** A spore capsule nodding on a red-brown stalk rising `len` from (x, y), leaning by `lean`. */
  function capsule(x: number, y: number, len: number, lean: number): ArtShape[] {
    const tx = x + lean;
    const ty = y - len;
    const ang = (Math.atan2(-len * 0.4, lean * 0.8) * 180) / Math.PI;
    const nod = ang + (lean >= 0 ? 35 : -35);
    const cx = tx + 1.2 * Math.cos((nod * Math.PI) / 180);
    const cy = ty + 1.2 * Math.sin((nod * Math.PI) / 180);
    return [
      { s: 'rust', w: 1.6, d: `M${r(x)} ${r(y)} Q${r(x + lean * 0.2)} ${r(y - len * 0.6)} ${r(tx)} ${r(ty)}` },
      { f: 'chitin', d: tilted(r(cx), r(cy), 1.7, 1.1, Math.round(nod)) },
    ];
  }

  /** A star-shaped moss head (peat moss capitulum), `arms` points of radius `ro`. */
  function star(cx: number, cy: number, ro: number, arms = 5): string {
    const pts: Pt[] = [];
    for (let k = 0; k < arms * 2; k++) {
      const a = -Math.PI / 2 + (Math.PI * k) / arms;
      const rad = k % 2 === 0 ? ro : ro * 0.45;
      pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
    }
    return poly(pts);
  }

  /** A dry desert-moss tuft standing on (x, y): a fan of dark pointed leaves, olive where lit, with white hair tips. */
  function tuft(x: number, y: number, s: number): ArtShape[] {
    const fan = [-155, -122, -90, -58, -25];
    const len = [4, 5.4, 6.2, 5.4, 4];
    const along = (k: number, f: number): Pt => {
      const a = (fan[k] * Math.PI) / 180;
      return [x + len[k] * s * f * Math.cos(a), y + len[k] * s * f * Math.sin(a)];
    };
    const leaf = (k: number): string => {
      const a = (fan[k] * Math.PI) / 180;
      const nx = -Math.sin(a) * 1.3 * s;
      const ny = Math.cos(a) * 1.3 * s;
      return poly([[x + nx, y + ny], along(k, 1), [x - nx, y - ny]]);
    };
    const tip = (k: number): string => {
      const [x0, y0] = along(k, 0.8);
      const [x1, y1] = along(k, 0.96);
      return `M${r(x0)} ${r(y0)} L${r(x1)} ${r(y1)}`;
    };
    return [
      { f: 'black', d: artEllipse(x, y, 2.6 * s, 1.4 * s) },
      { f: 'black', d: [0, 1, 2, 3, 4].map(leaf).join(' ') },
      { f: 'olive', d: [leaf(0), leaf(1)].join(' ') },
      { s: 'white', w: 1.6, d: [1, 3].map(tip).join(' ') },
    ];
  }

  FLORA_ART[Flora.Mosses] = {
    // spärlich: A small cushion with a few spore capsules on thin red stalks.
    sparse: [
      ...capsule(12.5, 23, 4, -1.5),
      ...capsule(16.5, 22, 5.5, 0.4),
      ...capsule(20, 23, 4, 1.6),
      ...cushion(16, 29.4, 18, 8.5, 'moss', 'olive', 5, 0.18),
    ],
    // dicht: A thick moss carpet with many capsules. Farben: moss green, golden brown, red-brown
    //   stalks.
    dense: [
      ...capsule(12.5, 13, 4.5, -0.8),
      ...cushion(11.5, 21, 17, 9, 'moss', 'olive', 5, 0.18),
      ...capsule(24, 15, 4.5, 1.4),
      ...cushion(22.5, 22, 15, 8, 'moss', 'olive', 4, 0.18),
      ...capsule(8, 21.5, 4.5, -1.4),
      ...cushion(9.5, 27.6, 16, 8.5, 'moss', 'olive', 4, 0.18),
      ...capsule(20.5, 22, 5, 0.8),
      ...cushion(21.5, 29.4, 17, 9, 'moss', 'olive', 5, 0.18),
    ],
    specialists: [
      // Torfmoose — Sumpf (Sphagnum, forms raised bogs and peat). Domed hummocks of star-shaped
      //   moss heads. Farben: pale green to red-pink, brown peat.
      {
        name: 'Torfmoose', biome: Biome.Swamp, art: [
          { f: 'bark', d: 'M3.5 28.5 C5 25 10 24 16 24 C22 24 27.5 25 29 28.5 C24 30.2 9 30.2 3.5 28.5 Z' },
          ...cushion(12.5, 26.5, 17, 12.5, 'shell', 'bark', 6, 0.12),
          { f: 'leafLight', d: [star(9.5, 17.6, 2.2), star(14.6, 16.4, 2.2), star(11.6, 21.6, 2.2), star(17.2, 21, 2)].join(' '), o: 0.9 },
          ...cushion(23.5, 27.5, 11, 8, 'leafLight', 'bark', 4, 0.14),
          { f: 'shell', d: [star(22, 23.4, 1.8), star(25.6, 22.6, 1.6)].join(' '), o: 0.8 },
        ],
      },
      // Wüstenmoose — Wüste (Syntrichia caninervis, biological soil crusts; dries out completely
      //   and revives). Tiny dark dry tufts on cracked sand, with white hair tips. Farben: dark
      //   olive-black, white hair tips, sand.
      {
        name: 'Wüstenmoose', biome: Biome.Desert, art: [
          { f: 'sand', d: 'M3 26.5 L6 22.5 L13 22 L14 25.5 L10.5 29.5 L4.5 29.5 Z' },
          { f: 'sand', d: 'M15.2 25.5 L14.4 21.8 L21.5 21.2 L23 24.6 L19.5 27.4 Z' },
          { f: 'sand', d: 'M11.8 29.5 L15.4 26.8 L19.8 28.6 L24.2 25.6 L29 26.2 L28.5 29.5 Z' },
          ...tuft(8.5, 26.5, 1),
          ...tuft(18.5, 24.8, 0.85),
          ...tuft(23.5, 28.8, 0.95),
        ],
      },
      // Felsmoose — Fels (Grimmia, Andreaea, cushions on bare rock). Round grey cushions sitting
      //   on a bare rock slab. Farben: silver-grey, dark green core, grey rock.
      {
        name: 'Felsmoose', biome: Biome.Rock, art: [
          { f: 'greyDark', d: 'M3 28 L5 23.5 L12 21.5 L20 22.5 L26.5 21 L29.5 25.5 L27.5 29.5 L6 29.8 Z' },
          ...cushion(11.5, 24.5, 13, 7, 'forest', 'forest', 7, 0.17, 'grey'),
          { f: 'white', d: artEllipse(9.6, 20.6, 3.4, 1.8), o: 0.45 },
          ...cushion(21.5, 24, 9.5, 5.5, 'forest', 'forest', 5, 0.17, 'grey'),
          { f: 'white', d: artEllipse(20.2, 20.9, 2.4, 1.3), o: 0.45 },
        ],
      },
    ],
  };
}
