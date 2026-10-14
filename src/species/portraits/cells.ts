/* =============================================================================
 * SimEarth 2.0 — species portraits: Erste Zellen (cells)
 * -----------------------------------------------------------------------------
 * Microbes as seen under the microscope, and the structures they build, after
 * docs/oekosystem-2026-10/portraitstil.md: free cells float mid-box, reefs
 * and mats rest on a translucent sea floor near y ≈ 57. No eyes; detail
 * comes from membranes, strands, granules and layers. Round bodies are lit
 * from the upper left with flat sickles of light and shade.
 * ========================================================================== */

namespace SE {
  const fill = (f: PortraitKey, d: string, o?: number): PortraitFill => (o === undefined ? { f, d } : { f, d, o });
  const line = (s: PortraitKey, w: number, d: string, o?: number): PortraitStroke => (o === undefined ? { s, w, d } : { s, w, d, o });
  const dot = (f: PortraitKey, cx: number, cy: number, r: number, o?: number): PortraitFill => fill(f, artCircle(cx, cy, r), o);
  const oval = (f: PortraitKey, cx: number, cy: number, rx: number, ry: number, o?: number): PortraitFill => fill(f, artEllipse(cx, cy, rx, ry), o);
  /** A patch of ground under a standing animal; translucent, so it casts no outline. */
  const ground = (f: PortraitKey, x0: number, x1: number): PortraitFill =>
    fill(f, `M${x0} 57.5 C${x0 + 10} 55.6 ${x1 - 10} 55.6 ${x1} 57.5 C${x1 - 10} 59.6 ${x0 + 10} 59.6 ${x0} 57.5 Z`, 0.3);

  const r1 = (v: number): number => Math.round(v * 10) / 10;

  /** The point `len` units from (x, y) towards `deg` (0 = right, 90 = down). */
  function toward(x: number, y: number, len: number, deg: number): [number, number] {
    const a = (deg * Math.PI) / 180;
    return [r1(x + len * Math.cos(a)), r1(y + len * Math.sin(a))];
  }

  /**
   * A sickle along the rim of a circle, centred on the direction `deg`
   * (45 = lower right for shade, 225 = upper left for light), reaching `span`
   * degrees to either side and `depth` × radius into the disc.
   */
  function crescent(cx: number, cy: number, rad: number, deg: number, span: number, depth: number): string {
    const [x0, y0] = toward(cx, cy, rad, deg - span);
    const [x1, y1] = toward(cx, cy, rad, deg + span);
    const [qx, qy] = toward(cx, cy, 2 * rad * (1 - depth) - rad * Math.cos((span * Math.PI) / 180), deg);
    return `M${x0} ${y0} A${rad} ${rad} 0 0 1 ${x1} ${y1} Q${qx} ${qy} ${x0} ${y0} Z`;
  }

  /** An ellipse turned by `deg`. */
  function tilted(x: number, y: number, rx: number, ry: number, deg: number): string {
    const [ax, ay] = toward(x, y, rx, deg + 180);
    const [bx, by] = toward(x, y, rx, deg);
    return `M${ax} ${ay} A${rx} ${ry} ${deg} 1 0 ${bx} ${by} A${rx} ${ry} ${deg} 1 0 ${ax} ${ay} Z`;
  }

  /**
   * Overlapping circles [x, y, radius] as one lobed shape, optionally shifted
   * and shrunk. Every circle winds the same way, so the fill is their union.
   */
  function lobes(cs: readonly (readonly number[])[], dx = 0, dy = 0, dr = 0): string {
    return cs.map(([x, y, q]) => artCircle(r1(x + dx), r1(y + dy), r1(q - dr))).join(' ');
  }

  /** Short strokes from radius `from` to `to` round a circle, every `stepDeg` between two directions. */
  function ticks(cx: number, cy: number, from: number, to: number, deg0: number, deg1: number, stepDeg: number): string {
    const out: string[] = [];
    for (let a = deg0; a <= deg1 + 0.01; a += stepDeg) {
      const [ax, ay] = toward(cx, cy, from, a);
      const [bx, by] = toward(cx, cy, to, a);
      out.push(`M${ax} ${ay} L${bx} ${by}`);
    }
    return out.join(' ');
  }

  /** Points [x, y, heading°] every `step` units along a chain of cubic Beziers [x0 y0 x1 y1 x2 y2 x3 y3]. */
  function along(curves: readonly (readonly number[])[], step: number): number[][] {
    const pts: number[][] = [];
    let run = step;
    let px = curves[0][0];
    let py = curves[0][1];
    for (const p of curves) {
      for (let k = 0; k <= 240; k++) {
        const t = k / 240;
        const u = 1 - t;
        const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
        const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
        const dx = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
        const dy = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
        run += Math.hypot(x - px, y - py);
        px = x;
        py = y;
        if (run >= step) {
          pts.push([x, y, (Math.atan2(dy, dx) * 180) / Math.PI]);
          run = 0;
        }
      }
    }
    return pts;
  }

  /** Path data of a chain of cubic Beziers, shifted by (dx, dy). */
  function bez(curves: readonly (readonly number[])[], dx = 0, dy = 0): string {
    const q = (k: number, v: number): number => r1(v + (k % 2 === 0 ? dx : dy));
    return curves.map((p, n) => `${n === 0 ? `M${q(0, p[0])} ${q(1, p[1])} ` : ''}C${p.slice(2).map((v, k) => q(k, v)).join(' ')}`).join(' ');
  }

  /** A gas or oxygen bubble: translucent, so it stays out of the silhouette. */
  function bubble(x: number, y: number, rad: number): PortraitShape[] {
    return [
      dot('white', x, y, rad, 0.25),
      line('white', 0.7, artCircle(x, y, rad), 0.45),
      dot('shine', r1(x - rad * 0.4), r1(y - rad * 0.4), r1(rad * 0.3), 0.45),
    ];
  }

  // Sulfolobus-like lobed archaeon, centre ≈ (38, 31).
  const ARCHAEON = [[37, 31, 11], [31, 23, 8], [41, 20.5, 7.5], [48, 27, 8], [47, 37.5, 8], [38, 41.5, 8], [29, 37, 8], [27.5, 29, 7]];
  // Clotted thrombolite mound on the floor at y 57.5.
  const THROMBOLITE = [[10, 51, 6], [15, 44, 6.5], [20, 37, 7], [26, 30, 7], [33, 26, 7.5], [40, 28, 7], [46, 33, 7], [51, 40, 6.5], [55, 48, 6], [30, 40, 10], [40, 42, 9], [22, 47, 8], [48, 50, 7], [33, 50.5, 7], [16, 52, 5.5]];

  // Cyanobacteria: an Anabaena-like bead chain and an Oscillatoria trichome behind it.
  const CHAIN = [[5, 47, 6, 30, 20, 14, 31, 24], [31, 24, 38, 31, 44, 44, 59, 33]];
  const TRICHOME = [[6, 60, 18, 52, 30, 55, 40, 44], [40, 44, 47, 36, 51, 23, 61, 17]];
  const BEADS = along(CHAIN, 5.6);
  const HETEROCYST = 7;

  // Iron bacteria under the microscope: twisted Gallionella stalks [x0 y0 x1 y1 x2 y2 x3 y3], a Leptothrix sheath.
  const GAL_TRUNK = [[6, 41, 11, 37, 15, 31, 21, 27]];
  const GAL_A = [[21, 27, 24, 21, 21, 15, 26, 8.5]];
  const GAL_B = [[21, 27, 29, 25, 35, 25.5, 41, 19.5]];
  const GAL_C = [[33, 45, 41, 42, 46, 36, 54, 31]];
  /** The old, iron-crusted part of the sheath, then the young part that still shows its cell chain. */
  const SHEATH_OLD = [[4, 56, 11, 52.6, 18, 51, 26, 53]];
  const SHEATH_NEW = [[26, 53, 34, 55, 42, 53.6, 51, 49]];
  const SHEATH = [...SHEATH_OLD, ...SHEATH_NEW];

  /**
   * A kidney bean of half length `len` round (x, y), its long axis along `deg`
   * and its dented side towards `deg` + 90, where the stalk leaves the cell.
   */
  function kidney(x: number, y: number, len: number, deg: number): string {
    const a = (deg * Math.PI) / 180;
    const h = len * 0.7;
    const at = (u: number, v: number): string => `${r1(x + u * Math.cos(a) - v * Math.sin(a))} ${r1(y + u * Math.sin(a) + v * Math.cos(a))}`;
    return `M${at(-len, 0.3)} C${at(-len, -h * 1.35)} ${at(len, -h * 1.35)} ${at(len, 0.3)} `
      + `C${at(len, h * 1.05)} ${at(len * 0.45, h * 1.1)} ${at(0, h * 0.72)} C${at(-len * 0.45, h * 1.1)} ${at(-len, h * 1.05)} ${at(-len, 0.3)} Z`;
  }

  /** A small bean cell at a stalk tip (x, y) reached along `heading`: barely wider than the stalk, so it reads as a cell, not a cap. */
  function ironCell(x: number, y: number, heading: number, turn: number): PortraitShape[] {
    const [cx, cy] = toward(x, y, 1.2, heading);
    const deg = heading + 90 + turn;
    return [
      fill('furDark', kidney(cx, cy, 2.5, deg)),
      fill('fur', kidney(r1(cx - 0.2), r1(cy - 0.3), 1.9, deg)),
      fill('furLight', tilted(r1(cx - 0.6), r1(cy - 0.8), 1.1, 0.5, r1(deg))),
      dot('furDark', ...toward(cx, cy, 0.5, deg + 90), 0.45, 0.6),
    ];
  }

  /**
   * A twisted ribbon of half width `hw` along a chain of Beziers, half a turn
   * every `half` units. Seen a little from the side, its two edges run as
   * helices, so every half turn is a skewed lens; faces turned towards the
   * viewer and away from it are kept apart, plus a gloss strip on the near ones.
   */
  function ribbon(curves: readonly (readonly number[])[], hw: number, half: number): { front: string; back: string; gloss: string } {
    const step = 0.5;
    const pts = along(curves, step).map(([x, y, h], j) => [x, y, h, (Math.PI * j * step) / half]);
    const segs: number[][][] = [];
    pts.forEach((p, j) => {
      const n = Math.floor((j * step) / half);
      if (!segs[n]) {
        segs[n] = [];
        if (n > 0) segs[n - 1].push(p);
      }
      segs[n].push(p);
    });
    const edge = ([x, y, h, phi]: number[], f: number): string => {
      const [mx, my] = toward(x, y, f * 0.5 * Math.cos(phi), h);
      return toward(mx, my, f * hw * Math.sin(phi), h - 90).join(' ');
    };
    const lens = (seg: number[][], from: number, to: number): string =>
      `M${seg.map((p) => edge(p, from)).join(' L')} L${seg.map((p) => edge(p, to)).reverse().join(' L')} Z`;
    const front: string[] = [];
    const back: string[] = [];
    const gloss: string[] = [];
    segs.forEach((seg, n) => {
      if (seg.length < 2) return;
      (n % 2 === 0 ? front : back).push(lens(seg, 1, -1));
      if (n % 2 === 0 && seg.length > 4) gloss.push(lens(seg.slice(1, -1), 0.8, 0.25));
    });
    return { front: front.join(' '), back: back.join(' '), gloss: gloss.join(' ') };
  }
  const GAL = [GAL_TRUNK, GAL_A, GAL_B, GAL_C].map((c) => ribbon(c, 1.8, 3.8));

  /** A crinkled growth layer from (x0, y0) to (x1, y1), arched up by `arch`. */
  function layer(x0: number, x1: number, y0: number, arch: number, y1 = y0): string {
    const pts: string[] = [];
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      const wob = k % 2 === 0 ? 0 : (k % 4 === 1 ? 0.45 : -0.45);
      pts.push(`${r1(x0 + (x1 - x0) * t)} ${r1(y0 + (y1 - y0) * t - arch * Math.sin(Math.PI * t) + wob)}`);
    }
    return `M${pts.join(' L')}`;
  }

  // Microbial mat in section: a carpet of laminae on a low sand bank in shallow water, sampled from x 2 to 62.
  const MAT_XS = Array.from({ length: 41 }, (_, k) => 2 + k * 1.5);
  const matArc = (x: number): number => Math.max(0, Math.sin((Math.PI * (x - 2)) / 60));
  /** The sand surface the mat grows on. */
  const matBase = (x: number): number => 51 - 4 * matArc(x) + 0.6 * Math.sin(0.7 * x);
  /** The bottom of the sand bank under the mat, drawn translucent. */
  const matSand = (x: number): number => matBase(x) + 9.6 * matArc(x) ** 0.5;
  /** The mat surface: pustules and a gas blister at x 42; the mat peters out at both ends. */
  function matTop(x: number): number {
    const a = matArc(x) ** 0.4;
    return matBase(x) - Math.max(0.2, 14 * a + Math.min(1, 4 * a) * (0.7 * Math.sin(x * 1.3) + 0.6 * Math.sin(x * 0.5 + 1) + 2.8 * Math.exp(-(((x - 42) / 3.2) ** 2))));
  }
  const matDepth = (x: number): number => matBase(x) - matTop(x);
  const matWave = (x: number, a: number, k: number, ph: number): number => a * Math.min(1, matDepth(x) / 5) * Math.sin(k * x + ph);
  /** Lower edges of the green, pink and violet layers, waving and folding independently; the dark layer reaches down to the sand. */
  const matGreen = (x: number): number => Math.min(matBase(x), matTop(x) + 0.32 * matDepth(x) + matWave(x, 0.8, 0.62, 1));
  const matPink = (x: number): number => Math.min(matBase(x), matGreen(x) + 0.24 * matDepth(x) + matWave(x, 0.9, 0.45, 2.4));
  const matViolet = (x: number): number => Math.min(matBase(x), matPink(x) + 0.1 * matDepth(x));

  /** A smooth path near the points: quadratic pieces through their midpoints. */
  function smoothPts(p: readonly (readonly number[])[], cmd: string): string {
    let d = `${cmd}${r1(p[0][0])} ${r1(p[0][1])}`;
    for (let k = 1; k < p.length - 1; k++) d += ` Q${r1(p[k][0])} ${r1(p[k][1])} ${r1((p[k][0] + p[k + 1][0]) / 2)} ${r1((p[k][1] + p[k + 1][1]) / 2)}`;
    return `${d} L${r1(p[p.length - 1][0])} ${r1(p[p.length - 1][1])}`;
  }
  /** The band of the mat between two edge curves, over x from x0 to x1. */
  function matBand(upper: (x: number) => number, lower: (x: number) => number, x0 = 2, x1 = 62): string {
    const xs = MAT_XS.filter((x) => x >= x0 && x <= x1);
    return `${smoothPts(xs.map((x) => [x, upper(x)]), 'M')} ${smoothPts(xs.slice().reverse().map((x) => [x, lower(x)]), 'L')} Z`;
  }
  /** A thin lamina at fraction f between two edge curves, over x from x0 to x1. */
  function matLine(upper: (x: number) => number, lower: (x: number) => number, f: number, wave: number, x0: number, x1: number): string {
    const xs = MAT_XS.filter((x) => x >= x0 && x <= x1);
    return smoothPts(xs.map((x) => [x, upper(x) + (lower(x) - upper(x)) * f + wave * Math.sin(0.9 * x + f * 7)]), 'M');
  }
  /** Gas pockets [x, y, rx, ry]: one under the blister, the rest trapped between laminae. */
  const MAT_VOIDS: readonly (readonly number[])[] = [
    [42, r1(matTop(42) + 2.6), 2.8, 1.3],
    [15, r1((matTop(15) + matGreen(15)) / 2 + 0.3), 1.6, 0.9],
    [27, r1((matGreen(27) + matPink(27)) / 2), 1.8, 0.9],
    [48, r1((matTop(48) + matGreen(48)) / 2 + 0.4), 1.4, 0.8],
    [21, r1((matViolet(21) + matBase(21)) / 2), 1.3, 0.8],
  ];
  /** Sand grains [x, y, r] in the bank under the mat. */
  const MAT_GRAINS = MAT_XS.filter((x) => x > 6 && x < 58).map((x, k) => [r1(x + (k % 3) * 0.6), r1(matBase(x) + (matSand(x) - matBase(x)) * (0.3 + 0.4 * (k % 2))), 0.5 + 0.2 * (k % 3)]);

  SPECIES_PORTRAITS[Life.Prokaryote] = [
    // 1 · Urzellen — a protocell: double membrane, a folded RNA strand, a daughter vesicle budding off.
    {
      name: 'Urzellen', art: [
        dot('mint', 32, 31, 27, 0.22),
        dot('teal', 49.5, 47, 7.4),
        dot('mint', 49.5, 47, 6),
        dot('teal', 49.5, 47, 5.1),
        dot('cyan', 49.3, 46.8, 4.2),
        fill('white', crescent(49.3, 46.8, 4.2, 225, 62, 0.3), 0.85),
        line('shell', 1.2, 'M47.4 48 C47.8 45.6 50.6 45.6 50.8 47.6 C51 49 49.6 49.6 49 48.8'),
        fill('ink', crescent(49.5, 47, 7.4, 45, 70, 0.3), 0.2),
        dot('teal', 31, 31, 22),
        dot('mint', 31, 31, 20),
        dot('teal', 31, 31, 18.2),
        dot('cyan', 31, 31, 17),
        fill('tealLight', crescent(31, 31, 22, 225, 62, 0.07)),
        fill('white', crescent(31, 31, 17, 225, 62, 0.2)),
        line('tealDark', 0.8, ticks(31, 31, 18.5, 19.7, 0, 85, 8.5), 0.55),
        line('tealDark', 0.8, ticks(31, 31, 18.5, 19.7, 95, 175, 8), 0.55),
        line('tealDark', 0.8, ticks(31, 31, 18.5, 19.7, 185, 265, 8), 0.55),
        line('tealDark', 0.8, ticks(31, 31, 18.5, 19.7, 275, 355, 8), 0.55),
        line('yellow', 0.8, 'M21.5 37.5 L23.3 39.3 M23.3 35.7 L25.1 37.5 M25.1 33.9 L26.9 35.7 M26.9 32.1 L28.7 33.9 M28.7 30.3 L30.5 32.1 M30.5 28.5 L32.3 30.3', 0.7),
        line('shell', 1.6, 'M17.4 34.6 C18.2 36 19 37 20.1 38.1 L32.1 26.1 A2.35 2.35 0 1 1 33.9 27.9 L21.9 39.9 C22.8 43 26.5 44.5 29 42.6 C31.5 40.7 34 41.5 35 44 C35.8 46 38 46 39.5 44'),
        line('shellLight', 0.7, 'M23.4 42.2 C25.4 43.4 27.4 43 28.8 41.8 C30.8 40.2 33.2 40.4 34.6 42.4', 0.8),
        line('shellDark', 1.4, 'M37 19.5 C40 18.5 43 20.5 42 23.5 C41.2 26 43.5 28 45.5 26.5'),
        dot('yellow', 24, 24, 0.8),
        dot('gold', 27.5, 20.5, 0.7),
        dot('yellow', 42.5, 33.5, 0.8),
        dot('gold', 39.5, 37.5, 0.7),
        dot('yellow', 19.5, 29, 0.7),
        dot('gold', 35, 22, 0.6),
        fill('ink', crescent(31, 31, 22, 45, 75, 0.32), 0.2),
        dot('shine', 16.9, 16.9, 1.1, 0.9),
        dot('shine', 46.6, 43.8, 0.6, 0.9),
      ],
    },
    // 2 · Archaeen — a lobed Sulfolobus-like cell with a tuft of archaella and rising methane bubbles.
    {
      name: 'Archaeen', art: [
        ...bubble(17, 14, 2.8),
        ...bubble(10, 20, 1.8),
        ...bubble(22.5, 7.5, 2),
        line('rustDark', 1.4, 'M27 37 C22 39.5 19 42.5 15 41 C11.5 39.8 9.5 43 6 44.5'),
        line('rust', 1.7, 'M24 31 C19 27.5 16 27.5 13.5 31 C11 34.5 8 34.6 6 31.5 C4.6 29.4 3.2 29 2 29.8'),
        line('orangeLight', 0.6, 'M45.5 15 C47 12.5 49 11.5 50.5 9.5 M52.5 19.5 C55 17.5 57 17.5 59 15.5 M55.6 30.5 C58 30 60 31 62 30', 0.45),
        fill('rust', lobes(ARCHAEON)),
        fill('orange', lobes(ARCHAEON, -0.4, -0.4, 1.4)),
        fill('orangeLight', crescent(30.6, 22.6, 6.6, 225, 62, 0.3)),
        fill('orangeLight', crescent(27.1, 28.6, 5.6, 210, 55, 0.28)),
        fill('orangeLight', crescent(40.6, 20.1, 6.1, 240, 55, 0.28)),
        fill('ink', crescent(48, 27, 6.6, 30, 60, 0.28), 0.2),
        fill('ink', crescent(47, 37.5, 6.6, 45, 65, 0.3), 0.2),
        fill('ink', crescent(38, 41.5, 6.6, 70, 60, 0.3), 0.2),
        line('rustDark', 0.8, 'M44.6 15.8 L45.4 17.4 M48.8 20.6 L49.6 22 M52.6 25.6 L53.8 26.4', 0.55),
        line('rustDark', 0.8, 'M53.4 35 L52 35.8 M51.4 42.6 L50.2 41.8 M43.4 47 L42.8 45.6', 0.55),
        line('rustDark', 0.8, 'M24.4 33.6 L25.8 34 M26 40.6 L27.2 39.6 M33 47 L33.4 45.6', 0.55),
        line('yellowPale', 0.9, 'M30 30 C32 27 35 28.4 36.4 26.4 C37.8 24.4 41 24.6 42 27 M33.6 35.4 C36 33.2 38.4 35.8 41 34 C43.4 32.4 45.4 33.4 46.4 35.6 M28.6 36 C29.4 38.4 32.2 39.4 34.6 38.6 M38.6 30 C40.4 29.4 42.2 30.2 43.4 31.4 M34.4 31.6 C35.4 32.4 36.6 32.2 37.4 31.2', 0.85),
        fill('rustDark', `${artCircle(30, 26, 0.6)} ${artCircle(44, 24, 0.6)} ${artCircle(45, 33, 0.6)} ${artCircle(31, 38, 0.6)} ${artCircle(42, 40, 0.6)} ${artCircle(35, 22, 0.6)}`, 0.5),
        dot('yellowPale', 31.4, 24.4, 1.3),
        dot('yellowPale', 40.6, 41.2, 1.1),
        dot('white', 47.6, 25.6, 0.9),
      ],
    },
    // 3 · Stromatolithen — knobbly layered columns in shallow water, capped by a living film of cyanobacteria.
    {
      name: 'Stromatolithen', art: [
        ground('sandDark', 2, 62),
        line('sky', 0.9, 'M2 6.5 C8 5 12 8 18 6.5 C24 5 28 8 34 6.5 C40 5 44 8 50 6.5 C56 5 60 7.6 62 6.5', 0.4),
        fill('sandDark', 'M44 57 C44.6 52 44.6 47 44 43 C43.2 39 42.2 35.6 42.4 32 C41.6 29.6 42 26.6 44 25 C44.8 22.8 47.4 21.6 50 22.2 C52.8 21.6 55.6 23 56.2 25.4 C58 27 58.4 30 57.6 32.4 C57.6 35.6 56.8 38.6 56 43 C55.4 47 55.6 52 56 57 Z'),
        fill('oliveDark', 'M42.3 30 C42 27.6 42.6 26 44 25 C44.8 22.8 47.4 21.6 50 22.2 C52.8 21.6 55.6 23 56.2 25.4 C57.6 26.6 58.2 28.4 58 30 C56 28.6 54.4 29.2 52.4 28.2 C50.4 27.4 48 28.6 46 28 C44.6 27.8 43.4 28.8 42.3 30 Z'),
        line('kelp', 0.9, [layer(43.4, 56.8, 33.6, 1.8), layer(43.6, 56.6, 37, 1.8), layer(44.2, 56, 40.5, 1.6), layer(44.6, 55.6, 44, 1.6), layer(44.8, 55.4, 47.6, 1.6), layer(44.8, 55.4, 51.2, 1.6), layer(44.8, 55.6, 54.6, 1.4)].join(' '), 0.55),
        fill('ink', 'M57.6 32.4 C57.6 35.6 56.8 38.6 56 43 C55.4 47 55.6 52 56 57 L52.4 57 C52 52 52 47 52.8 43 C53.8 38.6 54.8 35 54.8 30 Z', 0.2),
        fill('sand', 'M7 57 C7.6 53 7.6 49.5 7 46 C6.2 42.6 5.2 39.4 5.4 36 C4.6 33.6 5.2 30.6 7.4 29.4 C8.6 27.6 11 26.8 13.2 27.4 C15.6 26.8 18.4 27.8 19.2 29.8 C21 31 21.4 33.6 20.8 35.8 C20.8 39.4 20.2 42.4 19.6 46 C19.2 49.5 19.4 53 20 57 Z'),
        fill('yellowPale', 'M5.4 35 C5.8 38.6 7 42 7.8 45 C8.6 48.6 8.6 52.6 8.2 56.6 L7 57 C7.6 53 7.6 49.5 7 46 C6.2 42.6 5.2 39.4 5.4 36 Z'),
        fill('olive', 'M5.2 34.4 C5 32.4 5.8 30.4 7.4 29.4 C8.6 27.6 11 26.8 13.2 27.4 C15.6 26.8 18.4 27.8 19.2 29.8 C20.4 30.8 21 32.4 21 34 C19.4 32.8 18 33.4 16.4 32.6 C14.6 31.8 12.6 33 10.6 32.4 C8.6 31.8 6.8 33 5.2 34.4 Z'),
        fill('moss', 'M7 31.8 C7.6 29.8 9.6 28.4 12.2 28.2 C10.2 29.2 8.8 30.4 8.2 32.2 Z'),
        line('chitin', 0.9, [layer(6, 20, 37.6, 1.8), layer(6.4, 19.8, 41, 1.8), layer(7, 19.4, 44.4, 1.6), layer(7.6, 19, 48, 1.6), layer(7.8, 19, 51.6, 1.6), layer(7.8, 19.2, 55, 1.4)].join(' '), 0.6),
        fill('ink', 'M20.8 35.8 C20.8 39.4 20.2 42.4 19.6 46 C19.2 49.5 19.4 53 20 57 L16.6 57 C16.2 53 16.2 49.5 16.8 46 C17.6 42.5 18.4 39 18.2 34 C18.8 33 19.8 33.4 20.8 35.8 Z', 0.2),
        fill('sand', 'M22.4 57 C23.4 52 23.8 47 23.4 43 C22.8 40 21.6 37.5 21.4 34 C20.4 31.6 20.6 28.6 21.4 26.4 C21 22.4 22.8 18.4 25.8 16.6 C26.6 13.6 29.4 11.8 32.4 12.2 C35.4 11.6 38.4 13.2 39 16 C42 17.8 43.6 21.6 43 25.6 C43.8 28.4 43.6 31.6 42.6 34 C42.2 37.6 41 40 40.6 43 C40.2 47 40.6 52 41.6 57 Z'),
        fill('yellowPale', 'M21.6 27.4 C21.2 29.6 21.6 32 22.6 34.4 C23.8 37.4 25 40 25.2 43 C25.6 46.6 25.2 50.4 24.2 54.4 L22.8 55.6 C23.6 51 23.8 47 23.4 43 C22.8 40 21.6 37.5 21.4 34 C20.6 31.6 20.8 29.2 21.6 27.4 Z'),
        fill('olive', 'M21.4 26.4 C21 22.4 22.8 18.4 25.8 16.6 C26.6 13.6 29.4 11.8 32.4 12.2 C35.4 11.6 38.4 13.2 39 16 C42 17.8 43.6 21.6 43 25.6 C41 24.2 39 24.8 36.6 23.6 C34.2 22.6 31.4 24 29 23.2 C26.4 22.6 23.8 24.4 21.4 26.4 Z'),
        fill('moss', 'M23.4 21.6 C24 18.8 25.6 16.8 27.2 16 C28 14 30 12.8 32 12.8 C29.6 14.2 28.4 15.6 27.8 17.4 C26 18.4 24.6 19.8 23.4 21.6 Z'),
        line('oliveDark', 0.8, 'M28.6 19.6 C30 18.8 31.2 19.4 32.6 18.8 M35.4 17.6 C36.6 17.2 37.6 17.8 38.6 17.4 M25.4 22.6 C26.4 21.8 27.4 22.2 28.4 21.6', 0.5),
        line('chitin', 0.9, [layer(22, 42.2, 28.8, 2.6), layer(21.8, 42.4, 32.2, 2.6), layer(22.8, 41.6, 35.6, 2.4), layer(23.2, 41, 39, 2.2), layer(23.8, 40.6, 42.4, 2)].join(' '), 0.6),
        line('kelp', 0.9, [layer(24.2, 39.8, 45.8, 2), layer(24.2, 39.8, 49.2, 2), layer(23.8, 40.2, 52.6, 2), layer(23.4, 40.8, 55.8, 1.8)].join(' '), 0.55),
        fill('ink', 'M43 25.6 C43.8 28.4 43.6 31.6 42.6 34 C42.2 37.6 41 40 40.6 43 C40.2 47 40.6 52 41.6 57 L37 57 C36.8 51 37 46 37.8 42 C38.6 38 40 34 40.2 29.6 C40.4 27.4 41.4 25.4 43 25.6 Z', 0.2),
        ...bubble(36, 9.5, 1.2),
        ...bubble(14, 22.5, 1.3),
        ...bubble(51, 16.5, 1.1),
      ],
    },
    // 4 · Mikrobenmatten — a mat cut open under shallow water: green, pink-violet and black laminae, gas pockets, sand grains.
    {
      name: 'Mikrobenmatten', art: [
        fill('sand', matBand(matBase, matSand), 0.3),
        line('sky', 0.9, 'M2 9 C10 7.6 16 10.2 24 8.8 C32 7.4 38 10.2 46 8.8 C54 7.4 58 9.8 62 8.6', 0.45),
        line('white', 0.7, 'M8 12.6 C11 11.8 14 13 17 12.4 M40 12.8 C43 12 46 13.2 49 12.6', 0.3),
        ...bubble(21, 22, 1.6),
        ...bubble(24, 14.5, 1.1),
        ...bubble(44, 19, 1.3),
        ...bubble(29, 30.5, 0.9),
        fill('greyDeep', matBand(matTop, matBase)),
        fill('violet', matBand(matTop, matViolet)),
        fill('shellLight', matBand(matTop, matPink)),
        fill('olive', matBand(matTop, matGreen)),
        fill('scale', matBand(matTop, (x) => matTop(x) + 1.2, 4, 60)),
        fill('scaleLight', matBand(matTop, (x) => matTop(x) + 0.8 * Math.max(0, 1 - Math.abs(x - 18) / 14), 4, 32)),
        line('oliveDark', 0.8, matLine(matTop, matGreen, 0.62, 0.3, 6, 58), 0.55),
        line('shell', 0.8, matLine(matGreen, matPink, 0.55, 0.35, 8, 56), 0.6),
        line('black', 0.8, `${matLine(matViolet, matBase, 0.3, 0.6, 8, 56)} ${matLine(matViolet, matBase, 0.68, 0.5, 10, 54)}`, 0.6),
        fill('black', [[14, 0.5], [25, 0.4], [33, 0.6], [41, 0.45], [50, 0.5]].map(([x, f]) => artCircle(x, r1(matViolet(x) + (matBase(x) - matViolet(x)) * f), 0.5)).join(' '), 0.7),
        fill('bone', [[18, 0.2], [30, 0.82], [38, 0.25], [46, 0.75], [10, 0.6], [53, 0.4]].map(([x, f]) => artCircle(x, r1(matViolet(x) + (matBase(x) - matViolet(x)) * f), 0.6)).join(' ')),
        fill('sand', [[12, 0.5], [24, 0.4], [35, 0.6], [50, 0.45]].map(([x, f]) => artCircle(x, r1(matGreen(x) + (matPink(x) - matGreen(x)) * f), 0.55)).join(' ')),
        fill('sand', MAT_GRAINS.filter((_, k) => k % 2 === 0).map(([x, y, q]) => artCircle(x, y, q)).join(' '), 0.45),
        fill('sandDark', MAT_GRAINS.filter((_, k) => k % 2 === 1).map(([x, y, q]) => artCircle(x, y, q)).join(' '), 0.45),
        fill('white', MAT_VOIDS.map(([x, y, rx, ry]) => artEllipse(x, y, rx, ry)).join(' ')),
        fill('cyan', MAT_VOIDS.map(([x, y, rx, ry]) => artEllipse(r1(x + rx * 0.15), r1(y + ry * 0.2), r1(rx * 0.7), r1(ry * 0.6))).join(' '), 0.7),
        fill('shine', MAT_VOIDS.map(([x, y, rx, ry]) => artCircle(r1(x - rx * 0.45), r1(y - ry * 0.3), r1(Math.min(0.5, ry * 0.4)))).join(' '), 0.9),
        fill('ink', matBand((x) => matBase(x) - Math.min(matDepth(x), 0.6 + (2.6 * (x - 2)) / 60), matBase), 0.22),
      ],
    },
    // 5 · Cyanobakterien — a bead chain with one pale heterocyst and a resting spore, a smooth trichome behind.
    {
      name: 'Cyanobakterien', art: [
        line('tealDark', 5, bez(TRICHOME)),
        line('teal', 1.2, bez(TRICHOME, -0.9, -0.9), 0.9),
        line('navyDeep', 0.7, along(TRICHOME, 2.2).slice(1, -1).map(([x, y, h]) => {
          const [ax, ay] = toward(x, y, 2.2, h - 90);
          const [bx, by] = toward(x, y, 2.2, h + 90);
          return `M${ax} ${ay} L${bx} ${by}`;
        }).join(' '), 0.5),
        line('mint', 10, bez(CHAIN), 0.2),
        ...BEADS.flatMap(([x, y], k): PortraitShape[] => (k === HETEROCYST || k === HETEROCYST + 1 ? [] : [
          dot('teal', r1(x), r1(y), 3.2),
          dot('clubmoss', r1(x - 0.6), r1(y - 0.6), 2.4),
        ])),
        line('ink', 2, bez(CHAIN, 1.3, 1.3), 0.2),
        line('tealDark', 0.8, BEADS.slice(0, -1).filter((_, k) => k !== HETEROCYST - 1 && k !== HETEROCYST && k !== HETEROCYST + 1).map(([x, y, h], k) => {
          const [mx, my] = toward(x, y, 2.8, h);
          const [ax, ay] = toward(mx, my, 1.6, h - 90);
          const [bx, by] = toward(mx, my, 1.6, h + 90);
          return `M${ax} ${ay} L${bx} ${by}`;
        }).join(' '), 0.6),
        fill('olive', tilted(r1(BEADS[HETEROCYST + 1][0]), r1(BEADS[HETEROCYST + 1][1]), 4.4, 3.4, r1(BEADS[HETEROCYST + 1][2]))),
        fill('scaleLight', tilted(r1(BEADS[HETEROCYST + 1][0] - 0.8), r1(BEADS[HETEROCYST + 1][1] - 0.8), 3, 2, r1(BEADS[HETEROCYST + 1][2]))),
        fill('oliveDark', `${artCircle(r1(BEADS[HETEROCYST + 1][0] + 1), r1(BEADS[HETEROCYST + 1][1] + 0.6), 0.6)} ${artCircle(r1(BEADS[HETEROCYST + 1][0] - 1.2), r1(BEADS[HETEROCYST + 1][1] + 1), 0.6)} ${artCircle(r1(BEADS[HETEROCYST + 1][0] + 2), r1(BEADS[HETEROCYST + 1][1] - 0.8), 0.5)}`, 0.6),
        dot('gold', r1(BEADS[HETEROCYST][0]), r1(BEADS[HETEROCYST][1]), 3.7),
        dot('yellow', r1(BEADS[HETEROCYST][0] - 0.4), r1(BEADS[HETEROCYST][1] - 0.4), 3),
        dot('yellowPale', r1(BEADS[HETEROCYST][0] - 1.2), r1(BEADS[HETEROCYST][1] - 1.2), 1.3),
        fill('white', `${artCircle(...toward(BEADS[HETEROCYST][0], BEADS[HETEROCYST][1], 2.9, BEADS[HETEROCYST][2]), 0.8)} ${artCircle(...toward(BEADS[HETEROCYST][0], BEADS[HETEROCYST][1], 2.9, BEADS[HETEROCYST][2] + 180), 0.8)}`),
        dot('shine', r1(BEADS[2][0] - 1.2), r1(BEADS[2][1] - 1.2), 0.5, 0.9),
        dot('shine', r1(BEADS[5][0] - 1.2), r1(BEADS[5][1] - 1.2), 0.5, 0.9),
        ...bubble(40, 14, 2),
        ...bubble(47, 8.5, 1.4),
        ...bubble(12, 9, 1.6),
      ],
    },
    // 6 · Schwefelbakterien — three giant pearly cells (Thiomargarita) in a slime sheath, studded with sulfur.
    {
      name: 'Schwefelbakterien', art: [
        fill('cyan', lobes([[15, 39, 13.2], [32, 29, 14.6], [49, 38, 13.2]]), 0.22),
        ...[[15, 39, 10], [49, 38, 10], [32, 29, 11.5]].flatMap(([x, y, q]): PortraitShape[] => [
          dot('grey', x, y, q),
          dot('white', r1(x - q * 0.08), r1(y - q * 0.08), r1(q * 0.88)),
          dot('cyan', r1(x + q * 0.12), r1(y + q * 0.14), r1(q * 0.52), 0.3),
          dot('gold', ...toward(x, y, q * 0.7, 200), r1(q * 0.13)),
          dot('gold', ...toward(x, y, q * 0.72, 260), r1(q * 0.12)),
          dot('gold', ...toward(x, y, q * 0.68, 320), r1(q * 0.14)),
          dot('gold', ...toward(x, y, q * 0.72, 20), r1(q * 0.12)),
          dot('gold', ...toward(x, y, q * 0.7, 140), r1(q * 0.12)),
          dot('gold', ...toward(x, y, q * 0.45, 95), r1(q * 0.1)),
          fill('yellowPale', `${artCircle(...toward(...toward(x, y, q * 0.7, 200), q * 0.06, 225), r1(q * 0.05))} ${artCircle(...toward(...toward(x, y, q * 0.72, 260), q * 0.06, 225), r1(q * 0.05))} ${artCircle(...toward(...toward(x, y, q * 0.68, 320), q * 0.06, 225), r1(q * 0.05))}`),
          fill('shine', crescent(r1(x - q * 0.08), r1(y - q * 0.08), r1(q * 0.88), 225, 55, 0.12), 0.9),
          fill('ink', crescent(x, y, q, 45, 72, 0.28), 0.2),
          line('greyDark', 0.8, `M${toward(x, y, q * 0.8, 20).join(' ')} A${r1(q * 0.8)} ${r1(q * 0.8)} 0 0 1 ${toward(x, y, q * 0.8, 80).join(' ')}`, 0.55),
          oval('shine', r1(x - q * 0.42), r1(y - q * 0.46), r1(q * 0.16), r1(q * 0.1), 0.9),
        ]),
      ],
    },
    // 7 · Eisenbakterien — under the microscope: twisted Gallionella stalks tipped by bean cells, a Leptothrix sheath, rust flocs.
    {
      name: 'Eisenbakterien', art: [
        dot('mint', 32, 32, 29, 0.12),
        fill('orange', lobes([[8, 15, 2.4], [10.6, 13.4, 1.8], [11, 16.6, 1.6], [6.4, 17.4, 1.3]]), 0.4),
        fill('orange', lobes([[51, 9, 2], [53.6, 10.4, 1.7], [49.4, 11, 1.3]]), 0.4),
        fill('orange', lobes([[57, 58, 2], [54.6, 59.4, 1.5], [59.2, 56.2, 1.3]]), 0.4),
        fill('rust', `${artCircle(9, 15.4, 0.7)} ${artCircle(52, 9.8, 0.6)} ${artCircle(56.6, 58.4, 0.6)} ${artCircle(16, 46, 0.5)} ${artCircle(31, 36, 0.5)} ${artCircle(60, 24, 0.5)}`, 0.45),
        ...bubble(36, 8, 1.6),
        ...bubble(58, 16, 1.1),
        line('rustDark', 6.6, bez(SHEATH)),
        line('chitinDark', 5, bez(SHEATH)),
        line('yellowPale', 2.4, bez(SHEATH_NEW)),
        ...along(SHEATH_NEW, 2.9).slice(1, -1).flatMap(([x, y, h]): PortraitShape[] => [
          fill('fur', tilted(r1(x), r1(y), 1.25, 0.8, r1(h))),
        ]),
        fill('furLight', along(SHEATH_NEW, 2.9).slice(1, -1).map(([x, y, h]) => tilted(r1(x - 0.3), r1(y - 0.3), 0.6, 0.3, r1(h))).join(' ')),
        line('orange', 0.9, bez(SHEATH, -0.4, -2.2)),
        line('ink', 1.3, bez(SHEATH, 0.5, 2.3), 0.22),
        fill('rust', `${artCircle(7, 53, 1.3)} ${artCircle(11.6, 51, 1.2)} ${artCircle(16, 50.2, 1.1)} ${artCircle(20.4, 50.6, 1)} ${artCircle(9.6, 57.4, 1)} ${artCircle(15, 54.6, 0.9)}`),
        fill('orange', `${artCircle(6.6, 52.6, 0.6)} ${artCircle(11.2, 50.6, 0.6)} ${artCircle(15.6, 49.8, 0.5)}`),
        fill('rustDark', `${artCircle(13, 55.4, 0.5)} ${artCircle(19, 54.4, 0.5)} ${artCircle(23.4, 52.6, 0.4)}`, 0.6),
        fill('rustDark', tilted(51, 49, 1.5, 3.2, -30)),
        fill('yellowPale', tilted(51.2, 48.9, 0.9, 1.9, -30)),
        fill('fur', tilted(55.6, 46.4, 1.3, 0.8, -32)),
        fill('fur', tilted(59.2, 42.8, 1.3, 0.8, -50)),
        line('furDark', 0.6, 'M56.8 45.6 C58 44.8 57.6 43.6 58.6 43 M60.4 41.8 C61.4 40.6 60.8 39.4 61.8 38.6', 0.45),
        line('rustDark', 1, `${bez(GAL_C)} ${bez(GAL_TRUNK)} ${bez(GAL_A)} ${bez(GAL_B)}`),
        fill('rust', `${GAL[3].back} ${GAL[0].back} ${GAL[1].back} ${GAL[2].back}`),
        fill('orange', `${GAL[3].front} ${GAL[0].front} ${GAL[1].front} ${GAL[2].front}`),
        fill('orangeLight', `${GAL[3].gloss} ${GAL[0].gloss} ${GAL[1].gloss} ${GAL[2].gloss}`),
        ...ironCell(26, 8.5, -60, -20),
        ...ironCell(41, 19.5, -45, 15),
        ...ironCell(54, 31, -32, -15),
        fill('orange', lobes([[5.4, 41.6, 2.2], [8, 43.4, 1.8], [4.4, 44.4, 1.4]]), 0.45),
        fill('orange', lobes([[32.4, 45.6, 2], [34.8, 47, 1.5], [30.6, 47.6, 1.3]]), 0.45),
      ],
    },
    // 8 · Thrombolithen — a clotted, cauliflower-like limestone mound with tufts of microbial shrubs on top.
    {
      name: 'Thrombolithen', art: [
        ground('greyDark', 2, 62),
        line('bone', 1.4, 'M26 25 L25.4 19.8 M25.6 21.8 L22.4 18.4 M25.6 21.8 L28.6 18.8 M25.4 19.8 L24.4 16 M25.4 19.8 L27 16.4'),
        line('bone', 1.4, 'M40.5 23 L41.2 17.6 M41 19.6 L38.2 16.4 M41 19.6 L44 16.8 M41.2 17.6 L40.8 13.8'),
        line('bone', 1.4, 'M15.5 39.5 L14.3 35.1 M14.7 36.7 L11.9 34.5 M14.7 36.7 L16.9 33.9'),
        line('bone', 1.2, 'M51.5 35 L52.6 31.4 M52.2 32.6 L54.6 31'),
        fill('leafLight', `${artCircle(22.4, 18.4, 1.1)} ${artCircle(28.6, 18.8, 1.1)} ${artCircle(24.4, 16, 1.1)} ${artCircle(27, 16.4, 1.1)}`),
        fill('leafLight', `${artCircle(38.2, 16.4, 1.1)} ${artCircle(44, 16.8, 1.1)} ${artCircle(40.8, 13.8, 1.1)}`),
        fill('leafLight', `${artCircle(14.3, 35.1, 1.1)} ${artCircle(11.9, 34.5, 1.1)} ${artCircle(16.9, 33.9, 1.1)}`),
        fill('leafLight', `${artCircle(52.6, 31.4, 1)} ${artCircle(54.6, 31, 1)}`),
        fill('grey', `${lobes(THROMBOLITE)} M5 51 L4.4 57.5 L60.6 57.5 L60 51 Z`),
        fill('bone', `${lobes(THROMBOLITE, -0.5, -0.6, 1.2)} M6 51 L5.4 56.6 L59.4 56.6 L59 51 Z`),
        fill('cream', crescent(14.5, 43.4, 5.3, 225, 60, 0.3)),
        fill('cream', crescent(19.5, 36.4, 5.8, 225, 60, 0.3)),
        fill('cream', crescent(25.5, 29.4, 5.8, 230, 60, 0.3)),
        fill('cream', crescent(32.5, 25.4, 6.3, 240, 55, 0.28)),
        fill('cream', crescent(29.5, 39.4, 8.8, 225, 40, 0.18)),
        fill('ink', crescent(46, 33, 5.8, 20, 55, 0.3), 0.2),
        fill('ink', crescent(51, 40, 5.3, 30, 60, 0.32), 0.2),
        fill('ink', crescent(55, 48, 4.8, 40, 60, 0.32), 0.2),
        fill('ink', crescent(48, 50, 5.8, 60, 50, 0.3), 0.2),
        fill('ink', crescent(40, 42, 7.8, 50, 40, 0.2), 0.2),
        fill('furDark', lobes([[22, 44, 1.8], [23.4, 45.4, 1.3], [21, 45.6, 1]]), 0.85),
        fill('furDark', lobes([[30, 36, 1.6], [31.4, 35, 1.1]]), 0.85),
        fill('furDark', lobes([[38, 44, 2], [39.6, 45.2, 1.2], [37.4, 46, 0.9]]), 0.85),
        fill('furDark', lobes([[45, 36.6, 1.5], [46, 38, 1]]), 0.85),
        fill('furDark', lobes([[15, 50, 1.6], [16.4, 49, 1.1]]), 0.85),
        fill('furDark', lobes([[29, 50.6, 1.8], [30.6, 51.6, 1.2], [28, 52.4, 0.9]]), 0.85),
        fill('furDark', lobes([[50, 47.6, 1.4], [51, 48.8, 1]]), 0.85),
        fill('furDark', lobes([[35, 28.4, 1.3], [36.2, 29.4, 0.9]]), 0.85),
        fill('furDark', lobes([[20.6, 37.4, 1.2], [21.6, 38.4, 0.8]]), 0.85),
        fill('furDark', lobes([[42, 31.6, 1.1], [43, 32.6, 0.8]]), 0.85),
        fill('furDark', lobes([[10.6, 52, 1.1], [11.6, 53, 0.7]]), 0.85),
        fill('kelp', `${artCircle(26, 33, 1)} ${artCircle(33.4, 42.6, 1.2)} ${artCircle(33, 47, 1.1)} ${artCircle(18, 46, 0.9)} ${artCircle(55, 45, 0.9)} ${artCircle(43.6, 50.4, 1)} ${artCircle(25.6, 39.4, 0.8)} ${artCircle(48.4, 40.6, 0.9)}`, 0.7),
        fill('boneDark', lobes([[25, 47, 2.6], [27.4, 48.6, 2], [24.6, 50, 1.6]]), 0.6),
        fill('boneDark', lobes([[41, 36, 2.2], [43, 34.8, 1.8]]), 0.6),
        fill('boneDark', lobes([[33.6, 39.8, 2], [35.6, 41, 1.5]]), 0.6),
        fill('boneDark', lobes([[13, 46, 1.8], [14.6, 47.4, 1.4]]), 0.6),
        line('greyDark', 0.8, 'M18.6 41.4 C19.6 42 20.6 41.8 21.4 41 M36.6 33 C37.6 33.6 38.8 33.4 39.4 32.6 M45.6 44 C46.6 44.6 47.8 44.4 48.4 43.6', 0.55),
        fill('ink', 'M4.6 55 C20 56 44 56 60.6 54.6 L60.6 57.5 L4.4 57.5 Z', 0.2),
      ],
    },
  ];
}
