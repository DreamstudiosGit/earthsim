/* =============================================================================
 * SimEarth 2.0 — plant art: Gräser (grasses)
 * -----------------------------------------------------------------------------
 * Arching tapered blades, light green on the lit left and olive on the right,
 * all with dry straw tips; the meadow is small three-blade sprigs, so it tiles
 * calmly across a whole steppe. Specialists: reeds with nodding brown plumes
 * in the swamp, jointed bamboo in the rainforest, spiky spinifex hummocks on
 * red desert sand.
 * ========================================================================== */

namespace SE {
  type Pt = readonly [number, number];
  const r = (v: number): number => Math.round(v * 10) / 10;
  const at = (p: Pt): string => `${r(p[0])} ${r(p[1])}`;
  const mix = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  /** Point at t on the quadratic curve from a over c to b. */
  const onCurve = (a: Pt, c: Pt, b: Pt, t: number): Pt => mix(mix(a, c, t), mix(c, b, t), t);

  /**
   * A blade tapering from base `b` (`w` wide) over control `c` to `tip`, or
   * with `from` > 0 only its outer part (the dry tip). Every blade winds the
   * same way, so many can share one fill without cancelling where they cross.
   */
  function blade(b: Pt, c: Pt, tip: Pt, w: number, from = 0): string {
    const len = Math.hypot(tip[0] - b[0], tip[1] - b[1]);
    const nx = ((b[1] - tip[1]) / len) * (w / 2);
    const ny = ((tip[0] - b[0]) / len) * (w / 2);
    let p0: Pt = [b[0] + nx, b[1] + ny];
    let p1: Pt = [b[0] - nx, b[1] - ny];
    let c0: Pt = [c[0] + nx / 2, c[1] + ny / 2];
    let c1: Pt = [c[0] - nx / 2, c[1] - ny / 2];
    if (from > 0) {
      p0 = onCurve(p0, c0, tip, from);
      c0 = mix(c0, tip, from);
      p1 = onCurve(p1, c1, tip, from);
      c1 = mix(c1, tip, from);
    }
    return `M${at(p0)} Q${at(c0)} ${at(tip)} Q${at(c1)} ${at(p1)} Z`;
  }

  /** A pointed lens around the curved spine a–c–b, `w` wide: a nodding plume. */
  function plume(a: Pt, c: Pt, b: Pt, w: number): string {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = ((a[1] - b[1]) / len) * w;
    const ny = ((b[0] - a[0]) / len) * w;
    return `M${at(a)} Q${at([c[0] + nx, c[1] + ny])} ${at(b)} Q${at([c[0] - nx, c[1] - ny])} ${at(a)} Z`;
  }

  /** A straight pointed spindle from a to b, `w` wide: a spikelet, a bamboo leaf. */
  const spindle = (a: Pt, b: Pt, w: number): string => plume(a, mix(a, b, 0.5), b, w);

  /** One blade of a tuft, around its base: base dx, control dx dy, tip dx dy, lit. */
  type BladeRow = readonly [number, number, number, number, number, boolean];

  /** A full tuft: the controls sit high, so the blades rise and then arch outwards. */
  const TUFT: readonly BladeRow[] = [
    [-1.5, -3, -14, -11, -11, true],
    [-0.8, -2, -19, -7, -18.5, true],
    [0, 0, -16, 1.5, -21.5, true],
    [0.8, 2.5, -18, 7.5, -16.5, false],
    [1.5, 3.5, -13, 11, -9.5, false],
  ];

  /** A small meadow tuft: three blades that part right at the ground, readable at 16 px. */
  const SPRIG: readonly BladeRow[] = [
    [-0.8, -3, -9, -8, -14, true],
    [0, 0.3, -10, 1.2, -18, true],
    [0.8, 3, -8.5, 8, -12.5, false],
  ];

  interface Sward {
    readonly lit: string[];
    readonly shade: string[];
    readonly dry: string[];
  }

  /** Adds the blades of `rows` standing on (x, y), scaled by s, `w` wide at the base. */
  function tuft(g: Sward, rows: readonly BladeRow[], x: number, y: number, s: number, w: number): void {
    for (const [bx, cx, cy, tx, ty, lit] of rows) {
      const b: Pt = [x + bx * s, y];
      const c: Pt = [x + cx * s, y + cy * s];
      const tip: Pt = [x + tx * s, y + ty * s];
      (lit ? g.lit : g.shade).push(blade(b, c, tip, w));
      g.dry.push(blade(b, c, tip, w, 0.55));
    }
  }

  /** The collected blades as three fills: lit, shaded, and the dry tips over both. */
  function sward(build: (g: Sward) => void): ArtShape[] {
    const g: Sward = { lit: [], shade: [], dry: [] };
    build(g);
    return [
      { f: 'leafLight', d: g.lit.join(' ') },
      { f: 'olive', d: g.shade.join(' ') },
      { f: 'straw', d: g.dry.join(' ') },
    ];
  }

  /** A seed stalk from the ground to `top`, ending in an ear of spikelets. */
  function seedStalk(base: Pt, c: Pt, top: Pt): ArtShape[] {
    const ear: string[] = [];
    const foot = onCurve(base, c, top, 0.7);
    const dx = top[0] - foot[0];
    const dy = top[1] - foot[1];
    const len = Math.hypot(dx, dy);
    [0.1, 0.4, 0.7].forEach((t, k) => {
      const p: Pt = [foot[0] + dx * t, foot[1] + dy * t];
      const turn = ((k % 2 === 0 ? 1 : -1) * 32 * Math.PI) / 180;
      const ux = (dx * Math.cos(turn) - dy * Math.sin(turn)) / len;
      const uy = (dx * Math.sin(turn) + dy * Math.cos(turn)) / len;
      ear.push(spindle(p, [p[0] + ux * 3.8, p[1] + uy * 3.8], 2));
    });
    ear.push(spindle(mix(foot, top, 0.6), top, 2));
    return [
      { s: 'straw', w: 1.8, d: `M${at(base)} Q${at(c)} ${at(top)}` },
      { f: 'straw', d: ear.join(' ') },
    ];
  }

  /** A hummock of needle grass: a spiky dome on `base`, `n` spikes over the top. */
  function hummock(cx: number, base: number, rx: number, ry: number, n: number): string {
    const pts: string[] = [];
    for (let k = 0; k <= 2 * n; k++) {
      const a = Math.PI + (k * Math.PI) / (2 * n);
      const d = k % 2 === 1 ? 1 : 0.8;
      pts.push(at([cx + Math.cos(a) * rx * d, base + Math.sin(a) * ry * d]));
    }
    return `M${at([cx - rx * 0.8, base])} L${pts.join(' L')} L${at([cx + rx * 0.8, base])} Z`;
  }

  /** Light needles fanning out from the foot of a hummock. */
  function needles(cx: number, base: number, rx: number, ry: number, angles: readonly number[]): string {
    return angles.map((deg) => {
      const a = (deg * Math.PI) / 180;
      return `M${at([cx, base - 1])} L${at([cx + Math.cos(a) * rx, base - Math.sin(a) * ry])}`;
    }).join(' ');
  }

  FLORA_ART[Flora.Grasses] = {
    // spärlich: A single tuft of arching grass blades with straw tips and two seed ears.
    sparse: [
      ...seedStalk([15, 27.5], [13, 15], [10.5, 4]),
      ...seedStalk([17, 27.5], [19.5, 16], [22, 5]),
      ...sward((g) => tuft(g, TUFT, 16, 29, 1.12, 3)),
    ],
    // dicht: A wide meadow of staggered small tufts with straw tips that tiles without a visible
    //   grid. Farben: light green and olive, straw tips.
    dense: sward((g) => {
      tuft(g, SPRIG, 8.5, 18, 0.85, 2.6);
      tuft(g, SPRIG, 23.5, 16.5, 0.75, 2.6);
      tuft(g, SPRIG, 15, 29.5, 0.8, 2.6);
      tuft(g, SPRIG, 26, 29.5, 0.5, 2.4);
    }),
    specialists: [
      // Schilf — Sumpf (Phragmites australis (common reed, Poaceae)). Tall dense reed stems with
      //   feathery brown plume heads standing in water. Farben: green-gold stems, brown-violet
      //   plumes.
      {
        name: 'Schilf', biome: Biome.Swamp, art: [
          { s: 'sky', w: 2, d: 'M6 29 L26.5 29' },
          { s: 'straw', w: 2, d: 'M8 28.5 Q8 20 9 13 M14 28.5 Q14 18 15 9 M19.5 28.5 Q19.5 20 20.5 11.5 M25 28.5 Q25 22 26 16.5' },
          { f: 'leafLight', d: `${blade([8.5, 22], [5, 18.5], [2.5, 17], 2.4)} ${blade([20, 22.5], [24, 19.5], [28.5, 20], 2.4)}` },
          {
            f: 'fur', d: [
              plume([9, 13.5], [9.5, 4], [14, 7], 4), plume([15, 9], [15.5, 1], [20, 4], 4),
              plume([20.5, 11.5], [21, 4], [25, 7.5], 3.6), plume([26, 16.5], [26.5, 10], [29.5, 13], 3.2),
            ].join(' '),
          },
        ],
      },
      // Bambus — Regenwald (Bambusoideae (bamboos, Poaceae)). Tall jointed straight stems with
      //   leaf tufts at the nodes. Farben: yellow-green stems, dark green leaves.
      {
        name: 'Bambus', biome: Biome.Jungle, art: [
          { s: 'moss', w: 3, d: 'M10 29 L10 3.5 M17 29 L17 7 M23.5 29 L23.5 13' },
          { s: 'olive', w: 1.8, d: 'M8.5 10 L11.5 10 M8.5 17.5 L11.5 17.5 M8.5 25 L11.5 25 M15.5 14 L18.5 14 M15.5 21.5 L18.5 21.5 M22 20 L25 20 M22 26.5 L25 26.5' },
          {
            f: 'forest', d: [
              spindle([10, 10], [3, 13], 2.6), spindle([10, 10], [4.5, 6], 2.4),
              spindle([17, 14], [24, 10.5], 2.6), spindle([17, 14], [23.5, 16.5], 2.4),
              spindle([23.5, 20], [29.5, 17], 2.4), spindle([10, 17.5], [4, 21.5], 2.4),
            ].join(' '),
          },
        ],
      },
      // Spinifexgras — Wüste (Triodia (spinifex hummock grass, Poaceae), Australian deserts).
      //   Round spiky hummocks of needle-like grass on red sand. Farben: grey-green, red sand.
      {
        name: 'Spinifexgras', biome: Biome.Desert, art: [
          { f: 'rust', d: artEllipse(16, 28.2, 14, 2.1) },
          { f: 'olive', d: `${hummock(25.5, 28.3, 4.6, 7, 4)} ${hummock(13.5, 27.8, 12, 15, 9)}` },
          { s: 'straw', w: 1.8, d: needles(13.5, 27.8, 8.5, 10.5, [30, 60, 90, 120, 150]) },
        ],
      },
    ],
  };
}
