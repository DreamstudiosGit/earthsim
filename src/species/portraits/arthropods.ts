/* =============================================================================
 * SimEarth 2.0 — species portraits: Gliederfüßer des Meeres (arthropods)
 * -----------------------------------------------------------------------------
 * Sea arthropods in the style of the reference set
 * (docs/oekosystem-2026-10/portraitstil.md). The flat Palaeozoic forms are
 * seen from above like their map icons (trilobite level, the others turned
 * a little so each lies differently), the later ones from the side on the sea
 * floor, the crab from the front. Turned animals are drawn in a local frame:
 * u runs from tail to head, v towards the animal's upper (lit) side.
 * ========================================================================== */

namespace SE {
  const fill = (f: PortraitKey, d: string, o?: number): PortraitFill => (o === undefined ? { f, d } : { f, d, o });
  const line = (s: PortraitKey, w: number, d: string, o?: number): PortraitStroke => (o === undefined ? { s, w, d } : { s, w, d, o });
  const dot = (f: PortraitKey, cx: number, cy: number, r: number, o?: number): PortraitFill => fill(f, artCircle(cx, cy, r), o);
  const oval = (f: PortraitKey, cx: number, cy: number, rx: number, ry: number, o?: number): PortraitFill => fill(f, artEllipse(cx, cy, rx, ry), o);
  /** A patch of ground under a standing animal; translucent, so it casts no outline. */
  const ground = (f: PortraitKey, x0: number, x1: number): PortraitFill =>
    fill(f, `M${x0} 57.5 C${x0 + 10} 55.6 ${x1 - 10} 55.6 ${x1} 57.5 C${x1 - 10} 59.6 ${x0 + 10} 59.6 ${x0} 57.5 Z`, 0.3);

  type P = readonly [number, number];
  const n1 = (v: number): number => Math.round(v * 10) / 10;
  /** Kept inside the box the format allows for end points. */
  const pt = (x: number, y: number): string => `${n1(Math.min(63, Math.max(1, x)))} ${n1(Math.min(63, Math.max(1, y)))}`;
  const ptp = (p: P): string => pt(p[0], p[1]);

  /** A turned frame at (ox, oy), heading `deg` degrees (negative = nose up): u forwards, v to the upper side. */
  function frame(ox: number, oy: number, deg: number): (u: number, v: number) => P {
    const c = Math.cos((deg * Math.PI) / 180);
    const s = Math.sin((deg * Math.PI) / 180);
    return (u, v) => [ox + u * c + v * s, oy + u * s - v * c];
  }

  /** A smooth path near the points: quadratic pieces through their midpoints. */
  function smooth(p: readonly P[], cmd = 'M'): string {
    let d = `${cmd}${ptp(p[0])}`;
    for (let k = 1; k < p.length - 1; k++) d += ` Q${ptp(p[k])} ${pt((p[k][0] + p[k + 1][0]) / 2, (p[k][1] + p[k + 1][1]) / 2)}`;
    return `${d} L${ptp(p[p.length - 1])}`;
  }
  /** A closed smooth shape through the points. */
  const blob = (p: readonly P[]): string => `${smooth(p)} Z`;

  /** An ellipse whose long axis runs from a to b, `w` to either side. */
  function blade(a: P, b: P, w: number): string {
    const rx = n1(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2);
    const rot = n1((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI);
    return `M${ptp(a)} A${rx} ${w} ${rot} 1 0 ${ptp(b)} A${rx} ${w} ${rot} 1 0 ${ptp(a)} Z`;
  }
  /** A pointed spike from a base `w` wide at a to a point at b. */
  function spike(a: P, b: P, w: number): string {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = (-(b[1] - a[1]) / l) * (w / 2);
    const ny = ((b[0] - a[0]) / l) * (w / 2);
    return `M${pt(a[0] + nx, a[1] + ny)} L${ptp(b)} L${pt(a[0] - nx, a[1] - ny)} Z`;
  }
  /** The point of a cubic Bézier at t, and its unit normal (to the left of travel). */
  function cubicAt(c: readonly number[], t: number): { x: number; y: number; nx: number; ny: number } {
    const u = 1 - t;
    const x = u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6];
    const y = u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7];
    const dx = 3 * u * u * (c[2] - c[0]) + 6 * u * t * (c[4] - c[2]) + 3 * t * t * (c[6] - c[4]);
    const dy = 3 * u * u * (c[3] - c[1]) + 6 * u * t * (c[5] - c[3]) + 3 * t * t * (c[7] - c[5]);
    const l = Math.hypot(dx, dy) || 1;
    return { x, y, nx: dy / l, ny: -dx / l };
  }
  const cubicD = (c: readonly number[]): string => `M${pt(c[0], c[1])} C${pt(c[2], c[3])} ${pt(c[4], c[5])} ${pt(c[6], c[7])}`;
  /** Short strokes off one side (`s` = ±1) of a cubic, like the setae of a comb. */
  function comb(c: readonly number[], s: number, t0: number, t1: number, n: number, len: number, lean: number): string {
    let d = '';
    for (let k = 0; k < n; k++) {
      const a = cubicAt(c, t0 + ((t1 - t0) * k) / Math.max(1, n - 1));
      const tx = -a.ny;
      const ty = a.nx;
      d += `M${pt(a.x + a.nx * s * 0.6, a.y + a.ny * s * 0.6)} L${pt(a.x + a.nx * s * len + tx * lean, a.y + a.ny * s * len + ty * lean)} `;
    }
    return d.trim();
  }

  // 1 · Trilobite — from above, head to the right, mirrored about y = 32.
  const ty = (s: number, dy: number): number => 32 - s * dy;
  const TRI_SEG = Array.from({ length: 9 }, (_, k) => 41.2 - k * 2.45);
  const triEdge = (x: number): number => 14.4 - ((43 - x) * 2) / 22;
  const triBoth = (f: (s: number) => string): string => `${f(1)} ${f(-1)}`;
  const triSpines = (s: number): string =>
    TRI_SEG.map((x) => {
      const e = triEdge(x);
      return `M${pt(x + 0.2, ty(s, e - 0.6))} L${pt(x - 2.9, ty(s, e + 1))} L${pt(x - 1.6, ty(s, e - 1.2))} Z`;
    }).join(' ');

  // 2 · Anomalocaris — from above, swimming up to the right.
  const ANO = frame(33, 33, -28);
  const anoHw = (u: number): number => (u > 14 ? 4.6 : 2.4 + (2.2 * (u + 22)) / 36);
  const ANO_FLAPS = Array.from({ length: 11 }, (_, k) => 12 - k * 3.1);
  const anoFw = (k: number): number => 3.6 + 3.8 * Math.sin((Math.PI * (k + 1.5)) / 13);
  function anoFlaps(s: number): { flaps: string; edges: string; ribs: string } {
    let flaps = '';
    let edges = '';
    let ribs = '';
    ANO_FLAPS.forEach((u, k) => {
      const hw = anoHw(u);
      const fw = anoFw(k);
      const F = (du: number, v: number): string => ptp(ANO(u + du, s * v));
      flaps += `M${F(-1.9, hw)} C${F(-3.2, hw + fw * 0.7)} ${F(-2.2, hw + fw * 1.08)} ${F(0.2, hw + fw)} C${F(2, hw + fw * 0.92)} ${F(2.6, hw + fw * 0.45)} ${F(2, hw)} Z `;
      edges += `M${F(-1.9, hw + 0.4)} C${F(-3.2, hw + fw * 0.7)} ${F(-2.2, hw + fw * 1.08)} ${F(0.2, hw + fw)} `;
      ribs += `M${F(0.2, hw + 0.6)} L${F(-0.4, hw + fw * 0.8)} M${F(1.2, hw + 0.6)} L${F(1, hw + fw * 0.55)} `;
    });
    return { flaps: flaps.trim(), edges: edges.trim(), ribs: ribs.trim() };
  }
  const ANO_UP = anoFlaps(1);
  const ANO_DOWN = anoFlaps(-1);
  /** The trunk and head outline (s = 1 upper edge first). */
  function anoBody(): string {
    const us = [-22, -18, -12, -6, 0, 6, 12, 16, 19.5];
    const up = us.map((u) => ANO(u, anoHw(u)));
    const down = us.slice().reverse().map((u) => ANO(u, -anoHw(u)));
    return `${smooth([ANO(-23.4, 0), ...up, ANO(22, 3.4), ANO(23.4, 0), ANO(22, -3.4), ...down, ANO(-23.4, 0)])} Z`;
  }
  /** A frontal appendage on side s as a cubic in screen space. */
  const anoArm = (s: number): number[] => [ANO(21.4, s * 2), ANO(25.4, s * 4.8), ANO(29.6, s * 4.4), ANO(29.6, s * 1.4)].flat();
  function anoArmSpines(s: number): string {
    const c = anoArm(s);
    let d = '';
    for (const t of [0.3, 0.45, 0.6, 0.75, 0.9]) {
      const a = cubicAt(c, t);
      const inward = s > 0 ? -1 : 1;
      d += spike([a.x, a.y], [a.x + a.nx * inward * 2.4, a.y + a.ny * inward * 2.4], 0.9) + ' ';
    }
    return d.trim();
  }
  function anoArmRings(s: number): string {
    const c = anoArm(s);
    let d = '';
    for (const t of [0.15, 0.3, 0.45, 0.6, 0.75, 0.9]) {
      const a = cubicAt(c, t);
      d += `M${pt(a.x + a.nx * 1.2, a.y + a.ny * 1.2)} L${pt(a.x - a.nx * 1.2, a.y - a.ny * 1.2)} `;
    }
    return d.trim();
  }

  // 3 · Eurypterid — from above, head to the right, the tail curving down.
  const EUR_C = [41.5, 32, 31, 32.2, 21, 33.8, 12.4, 37.4];
  const eurW = (t: number): number => (t < 0.25 ? 16 + 1.8 * (t / 0.25) : 17.8 - 13.2 * Math.pow((t - 0.25) / 0.75, 1.1));
  const eurSide = (t: number, f: number): P => {
    const a = cubicAt(EUR_C, t);
    const h = (eurW(t) / 2) * f;
    return [a.x - a.nx * h, a.y - a.ny * h];
  };
  /** Abdomen outline; the curve runs tail-wards, so its left normal points down. */
  function eurAbdomen(): string {
    const ts = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    const up = ts.map((t) => eurSide(t, 1));
    const down = ts.slice().reverse().map((t) => eurSide(t, -1));
    return `${smooth(up)} A2.2 2.2 0 0 0 ${ptp(down[0])} ${smooth(down, 'L')} Z`;
  }
  const eurStrip = (t0: number, t1: number, outer: number, inner: number): string => {
    const a: P[] = [];
    const b: P[] = [];
    for (let k = 0; k <= 10; k++) {
      const t = t0 + ((t1 - t0) * k) / 10;
      a.push(eurSide(t, outer));
      b.push(eurSide(t, outer + (inner - outer) * Math.sin((Math.PI * k) / 10)));
    }
    return `${smooth(a)} ${smooth(b.reverse(), 'L')} Z`;
  };
  const eurRings = (): string =>
    [0.07, 0.15, 0.23, 0.31, 0.39, 0.47, 0.55, 0.63, 0.71, 0.79, 0.87, 0.94].map((t) => `M${ptp(eurSide(t, 0.92))} L${ptp(eurSide(t, -0.92))}`).join(' ');
  /** Mirror a y about the eurypterid's axis. */
  const em = (s: number, y: number): number => (s > 0 ? y : 64 - y);

  // 4 · Horseshoe crab — from above, heading a little up to the right.
  const LIM = frame(35, 34.6, -16);
  const L = (u: number, v: number): string => ptp(LIM(u, v));
  const limSpines = (s: number): string =>
    [0, 1, 2, 3, 4, 5].map((k) => {
      const u = -1.6 - k * 1.8;
      const v = 10.6 - k * 0.66;
      return `M${L(u + 0.6, s * (v - 0.6))} L${L(u - 1.4, s * (v + 1.8))} L${L(u - 0.8, s * (v - 0.8))} Z`;
    }).join(' ');

  // 5 · Sea spider — hip, knee, ankle and foot of each leg, from the front leg backwards.
  type Leg = readonly [P, P, P, P];
  const PYC_NEAR: readonly Leg[] = [
    [[37.6, 29], [48, 14], [58, 30], [61.6, 56.4]],
    [[34.6, 29.6], [42, 9], [50, 34], [51.6, 56.6]],
    [[30.4, 29.6], [22, 9], [14, 34], [12.4, 56.6]],
    [[27.4, 29], [16, 14], [6, 30], [2.4, 56.4]],
  ];
  const PYC_FAR: readonly Leg[] = [
    [[36, 28], [45, 16.6], [53.6, 34], [56, 54.6]],
    [[33, 28], [37, 12], [43.4, 36], [44.6, 54.8]],
    [[31, 28], [27, 12], [20.6, 36], [19.4, 54.8]],
    [[28, 28], [19, 16.6], [10.4, 34], [8, 54.6]],
  ];
  const legD = (l: Leg): string => `M${ptp(l[0])} L${ptp(l[1])} L${ptp(l[2])} L${ptp(l[3])}`;
  // 6 · Decapod — a lobster-like early decapod on the sea floor.
  const DEC_ABD = [31, 35.6, 22, 33.4, 14.6, 36, 11.2, 43.4];
  const decSide = (t: number, f: number): P => {
    const a = cubicAt(DEC_ABD, t);
    const h = ((12.6 - 5.4 * t) / 2) * f;
    return [a.x - a.nx * h, a.y - a.ny * h];
  };
  function decAbdomen(): string {
    const ts = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1];
    return `${smooth(ts.map((t) => decSide(t, 1)))} L${ptp(decSide(1, -1))} ${smooth(ts.slice().reverse().map((t) => decSide(t, -1)), 'L')} Z`;
  }
  const DEC_SEG = [0.08, 0.24, 0.4, 0.56, 0.72, 0.88];
  function decPleura(): string {
    return DEC_SEG.map((t) => {
      const a = decSide(t - 0.06, -0.85);
      const b = decSide(t + 0.08, -0.85);
      const c = cubicAt(DEC_ABD, t + 0.02);
      const tip: P = [decSide(t + 0.02, -1)[0] + c.nx * 2 - 0.6, decSide(t + 0.02, -1)[1] + c.ny * 2];
      return `M${ptp(a)} Q${pt(tip[0] + 1, tip[1] - 0.4)} ${ptp(tip)} Q${pt(tip[0] - 1, tip[1] - 0.8)} ${ptp(b)} Z`;
    }).join(' ');
  }

  // 8 · Barnacles — cirri as cubics curling at the tip.
  const CIRRI: readonly (readonly number[])[] = [
    [30.6, 33, 25.4, 27, 19.6, 24.6, 17.6, 20],
    [31.2, 32.4, 28.6, 25.6, 26, 20.2, 26.4, 15.6],
    [32.2, 32.2, 33.2, 25.2, 35, 19.8, 38.2, 16.6],
    [32.8, 32.6, 36.6, 27.8, 41.4, 24.6, 46, 24],
    [33, 33.2, 37.4, 31.2, 42, 31, 46.4, 32.4],
  ];
  const CIRRI_CURL = ['C17 18 18.6 16.4 20 17.4', 'C26.6 13.8 28.4 13.6 28.8 15.2', 'C39.6 15.4 41.2 16.2 40.6 17.8', 'C47.6 23.8 48.2 25.2 47.2 26', 'C47.8 32.8 47.8 34.2 46.6 34.2'];

  SPECIES_PORTRAITS[Life.Arthropod] = [
    // 1 · Trilobiten — from above: three-lobed shield, crescent eyes, nine spined thorax segments, small tail shield.
    {
      name: 'Trilobiten', art: [
        line('greyDeep', 0.9, triBoth((s) => `M${pt(57.4, ty(s, 2.4))} Q${pt(61, ty(s, 5))} ${pt(62.6, ty(s, 10.4))}`), 0.45),
        fill('grey', `M44 ${ty(1, 14.6)} C40 ${ty(1, 16.4)} 34 ${ty(1, 18.4)} 26.6 ${ty(1, 19.8)} C32 ${ty(1, 16.6)} 37.6 ${ty(1, 14.4)} 42.4 ${ty(1, 12.4)} Z`),
        fill('greyDark', `M44 ${ty(-1, 14.6)} C40 ${ty(-1, 16.4)} 34 ${ty(-1, 18.4)} 26.6 ${ty(-1, 19.8)} C32 ${ty(-1, 16.6)} 37.6 ${ty(-1, 14.4)} 42.4 ${ty(-1, 12.4)} Z`),
        fill('grey', triSpines(1)),
        fill('greyDark', triSpines(-1)),
        fill('grey', `M43 ${ty(1, 14.4)} L21 ${ty(1, 12.4)} C13 ${ty(1, 11)} 7.4 ${ty(1, 6.4)} 7.4 32 C7.4 ${ty(-1, 6.4)} 13 ${ty(-1, 11)} 21 ${ty(-1, 12.4)} L43 ${ty(-1, 14.4)} Z`),
        fill('greyLight', `M42 ${ty(1, 13.2)} L22 ${ty(1, 11.2)} C16 ${ty(1, 10.2)} 11.6 ${ty(1, 7.4)} 9.6 ${ty(1, 3.6)} C13 ${ty(1, 6.6)} 17 ${ty(1, 8.4)} 22 ${ty(1, 8.8)} L42 ${ty(1, 10.6)} Z`),
        fill('ink', `M43 ${ty(-1, 6)} L21 ${ty(-1, 5.4)} C15 ${ty(-1, 5)} 9.6 ${ty(-1, 3)} 7.6 ${ty(-1, 0.6)} C7.6 ${ty(-1, 6.4)} 13 ${ty(-1, 11)} 21 ${ty(-1, 12.4)} L43 ${ty(-1, 14.4)} Z`, 0.2),
        line('greyDark', 0.8, triBoth((s) => TRI_SEG.map((x) => `M${pt(x + 0.3, ty(s, 4.4))} L${pt(x - 1.2, ty(s, triEdge(x) - 0.9))}`).join(' ')), 0.6),
        line('greyDark', 0.7, triBoth((s) => `M19 ${ty(s, 3.6)} C17 ${ty(s, 6)} 15.6 ${ty(s, 8.6)} 14.8 ${ty(s, 10.6)} M16.4 ${ty(s, 3)} C14 ${ty(s, 5)} 12 ${ty(s, 7)} 10.6 ${ty(s, 8.4)}`), 0.5),
        line('greyDark', 0.7, triBoth((s) => TRI_SEG.map((x) => `M${pt(x - 0.4, ty(s, 5.4))} L${pt(x - 1.6, ty(s, triEdge(x) - 2.6))}`).join(' ')), 0.5),
        line('greyLight', 0.8, `M20.4 ${ty(1, 10.6)} C14 ${ty(1, 9.6)} 10 ${ty(1, 6)} 9.2 32`, 0.6),
        fill('bone', `M42.8 ${ty(1, 4.6)} L21 ${ty(1, 3.4)} C15 ${ty(1, 3)} 12.6 ${ty(1, 1.8)} 12.6 32 C12.6 ${ty(-1, 1.8)} 15 ${ty(-1, 3)} 21 ${ty(-1, 3.4)} L42.8 ${ty(-1, 4.6)} Z`),
        fill('cream', `M42.6 ${ty(1, 4.1)} L21 ${ty(1, 3)} C17 ${ty(1, 2.8)} 15 ${ty(1, 2.2)} 14 ${ty(1, 1.2)} C17 ${ty(1, 1.6)} 20 ${ty(1, 1.8)} 22 ${ty(1, 1.8)} L42.6 ${ty(1, 2.4)} Z`),
        fill('ink', `M42.8 ${ty(-1, 1.6)} L21 ${ty(-1, 1.2)} C17 ${ty(-1, 1.2)} 14.4 ${ty(-1, 0.8)} 12.8 ${ty(-1, 0.4)} C13 ${ty(-1, 1.8)} 15 ${ty(-1, 3)} 21 ${ty(-1, 3.4)} L42.8 ${ty(-1, 4.6)} Z`, 0.18),
        line('boneDark', 0.8, [...TRI_SEG, 18.6, 16.4].map((x) => `M${pt(x + 0.3, ty(1, x > 20 ? 3.9 : 2.6))} Q${pt(x + 1, 32)} ${pt(x + 0.3, ty(-1, x > 20 ? 3.9 : 2.6))}`).join(' '), 0.6),
        fill('grey', `M43 ${ty(1, 15.4)} C50 ${ty(1, 16.6)} 56 ${ty(1, 12)} 58.4 ${ty(1, 6)} C59.4 ${ty(1, 2.6)} 59.4 ${ty(-1, 2.6)} 58.4 ${ty(-1, 6)} C56 ${ty(-1, 12)} 50 ${ty(-1, 16.6)} 43 ${ty(-1, 15.4)} C41.6 ${ty(-1, 10)} 41.6 ${ty(1, 10)} 43 ${ty(1, 15.4)} Z`),
        fill('greyLight', `M44 ${ty(1, 14.2)} C49 ${ty(1, 15.4)} 54 ${ty(1, 12)} 56.8 ${ty(1, 6.8)} C53.6 ${ty(1, 10)} 49 ${ty(1, 11.8)} 44.2 ${ty(1, 11.4)} Z`),
        fill('ink', `M44 ${ty(-1, 15)} C50 ${ty(-1, 16.2)} 56 ${ty(-1, 12)} 58.6 ${ty(-1, 5.4)} C56 ${ty(-1, 9.4)} 50 ${ty(-1, 12.4)} 44 ${ty(-1, 11.8)} Z`, 0.2),
        line('greyLight', 0.8, `M44.4 ${ty(1, 13.8)} C50 ${ty(1, 14.8)} 55 ${ty(1, 10.6)} 57 ${ty(1, 5.4)} C57.8 ${ty(1, 2.4)} 57.8 ${ty(-1, 2.4)} 57 ${ty(-1, 5.4)} C55 ${ty(-1, 10.6)} 50 ${ty(-1, 14.8)} 44.4 ${ty(-1, 13.8)}`, 0.6),
        line('greyDark', 0.7, triBoth((s) => `M55.8 ${ty(s, 10.6)} Q51.6 ${ty(s, 10.4)} 50.4 ${ty(s, 9.4)} M47.2 ${ty(s, 9.4)} Q45.4 ${ty(s, 11)} 44.6 ${ty(s, 13.8)}`), 0.55),
        fill('bone', `M43.6 ${ty(1, 4.8)} C46 ${ty(1, 6.8)} 52 ${ty(1, 6.6)} 54.6 ${ty(1, 4.2)} C56.2 ${ty(1, 2.4)} 56.2 ${ty(-1, 2.4)} 54.6 ${ty(-1, 4.2)} C52 ${ty(-1, 6.6)} 46 ${ty(-1, 6.8)} 43.6 ${ty(-1, 4.8)} Z`),
        fill('cream', `M44.6 ${ty(1, 4.4)} C47 ${ty(1, 6)} 51.6 ${ty(1, 6)} 54 ${ty(1, 3.8)} C51 ${ty(1, 4.4)} 47.6 ${ty(1, 4.4)} 44.6 ${ty(1, 3)} Z`),
        fill('ink', `M44 ${ty(-1, 4)} C47 ${ty(-1, 6)} 52 ${ty(-1, 6)} 55 ${ty(-1, 3)} C54 ${ty(-1, 5.8)} 50 ${ty(-1, 7)} 46 ${ty(-1, 6.6)} Z`, 0.18),
        line('boneDark', 0.8, `M44.8 ${ty(1, 4.8)} Q45.4 32 44.8 ${ty(-1, 4.8)} ${triBoth((s) => `M47.2 ${ty(s, 5.6)} L48.4 ${ty(s, 3.4)} M50.6 ${ty(s, 5.8)} L51.4 ${ty(s, 3.8)}`)}`, 0.55),
        line('greyLight', 0.9, triBoth((s) => `M47 ${ty(s, 10.4)} Q49 ${ty(s, 11.8)} 51 ${ty(s, 10.4)}`), 0.8),
        oval('ink', 49, ty(1, 9.2), 1.6, 1.1),
        oval('ink', 49, ty(-1, 9.2), 1.6, 1.1),
        dot('shine', 48.5, ty(1, 9.6), 0.5, 0.9),
        dot('shine', 48.5, ty(-1, 8.8), 0.45, 0.9),
      ],
    },
    // 2 · Anomalocariden — from above, swimming: a row of swimming flaps, stalked eyes, spiny grasping arms, fan tail.
    {
      name: 'Anomalocariden', art: [
        fill('rustDark', blade(ANO(-21.6, -1), ANO(-29.6, -7), 1.6)),
        fill('rustDark', blade(ANO(-22, -0.6), ANO(-31, -3.6), 1.6)),
        fill('rust', blade(ANO(-21.6, 1), ANO(-29.6, 7), 1.6)),
        fill('rust', blade(ANO(-22, 0.6), ANO(-31, 3.6), 1.6)),
        fill('coral', blade(ANO(-23, 1.6), ANO(-28.4, 5.6), 0.7), 0.8),
        line('coralDark', 0.7, `M${ptp(ANO(-22.6, 1.4))} L${ptp(ANO(-28.6, 6.2))} M${ptp(ANO(-23, 0.8))} L${ptp(ANO(-30, 3.2))} M${ptp(ANO(-22.6, -1.4))} L${ptp(ANO(-28.6, -6.2))} M${ptp(ANO(-23, -0.8))} L${ptp(ANO(-30, -3.2))}`, 0.6),
        fill('coralDark', ANO_DOWN.flaps),
        line('rust', 0.8, ANO_DOWN.edges, 0.6),
        line('rust', 0.7, ANO_DOWN.ribs, 0.55),
        fill('coral', ANO_UP.flaps),
        line('rust', 0.8, ANO_UP.edges, 0.6),
        line('rust', 0.7, ANO_UP.ribs, 0.55),
        line('rust', 1.8, `M${ptp(ANO(16.8, 2.4))} L${ptp(ANO(18.6, 8))} M${ptp(ANO(16.8, -2.4))} L${ptp(ANO(18.6, -8))}`),
        fill('rust', anoBody()),
        fill('coralDark', blob([ANO(-20, 1.2), ANO(-10, 3), ANO(4, 3.8), ANO(16, 4), ANO(20.6, 2.6), ANO(14, 2.4), ANO(0, 2), ANO(-14, 1.2), ANO(-20, 1.2)])),
        fill('ink', blob([ANO(-21, -1.4), ANO(-8, -3.4), ANO(8, -4.2), ANO(18, -4.4), ANO(22.4, -2), ANO(16, -2.2), ANO(0, -1.8), ANO(-16, -1), ANO(-21, -1.4)]), 0.22),
        line('rustDark', 0.75, ANO_FLAPS.map((u) => `M${ptp(ANO(u + 1.5, anoHw(u) * 0.85))} L${ptp(ANO(u + 1.5, -anoHw(u) * 0.85))}`).join(' '), 0.6),
        fill('rustDark', blob([ANO(14.6, 3.2), ANO(19, 3.6), ANO(22, 1.6), ANO(22, -1.6), ANO(19, -3.6), ANO(14.6, -3.2), ANO(14, 0), ANO(14.6, 3.2)]), 0.55),
        line('rustDark', 0.8, `M${ptp(ANO(-21, 0))} L${ptp(ANO(15, 0))}`, 0.5),
        line('coral', 2.4, cubicD(anoArm(1))),
        line('coralDark', 2.4, cubicD(anoArm(-1))),
        fill('cream', `${anoArmSpines(1)} ${anoArmSpines(-1)}`),
        line('rust', 0.7, `${anoArmRings(1)} ${anoArmRings(-1)}`, 0.6),
        dot('black', ANO(19, 8.6)[0], ANO(19, 8.6)[1], 2.3),
        dot('black', ANO(19, -8.6)[0], ANO(19, -8.6)[1], 2.3),
        dot('ink', ANO(19.2, 8.6)[0], ANO(19.2, 8.6)[1], 1.6),
        dot('ink', ANO(19.2, -8.6)[0], ANO(19.2, -8.6)[1], 1.6),
        fill('greyDark', `M${pt(ANO(19, 8.6)[0] - 1.7, ANO(19, 8.6)[1] + 0.4)} A1.8 1.8 0 0 1 ${pt(ANO(19, 8.6)[0] + 0.4, ANO(19, 8.6)[1] - 1.7)} A1.4 1.4 0 0 0 ${pt(ANO(19, 8.6)[0] - 1.7, ANO(19, 8.6)[1] + 0.4)} Z M${pt(ANO(19, -8.6)[0] - 1.7, ANO(19, -8.6)[1] + 0.4)} A1.8 1.8 0 0 1 ${pt(ANO(19, -8.6)[0] + 0.4, ANO(19, -8.6)[1] - 1.7)} A1.4 1.4 0 0 0 ${pt(ANO(19, -8.6)[0] - 1.7, ANO(19, -8.6)[1] + 0.4)} Z`, 0.7),
        dot('shine', ANO(19.2, 8.6)[0] - 0.5, ANO(19.2, 8.6)[1] - 0.5, 0.55, 0.9),
        dot('shine', ANO(19.2, -8.6)[0] - 0.5, ANO(19.2, -8.6)[1] - 0.5, 0.5, 0.9),
      ],
    },
    // 3 · Seeskorpione — from above: carapace with kidney eyes, twelve segments tapering to a spike, oar-like paddles.
    {
      name: 'Seeskorpione', art: [
        ...[1, -1].map((s) => line(s > 0 ? 'kelp' : 'furDark', 1.4, `M52.6 ${em(s, 25)} L55.6 ${em(s, 20.6)} L59 ${em(s, 19.4)} M50.4 ${em(s, 24.4)} L52.6 ${em(s, 18.6)} L55.4 ${em(s, 16)} M48.2 ${em(s, 24)} L48.8 ${em(s, 17.4)} L50.6 ${em(s, 13.6)}`)),
        line('furDark', 0.6, [1, -1].map((s) => `M56.2 ${em(s, 20.2)} L56.4 ${em(s, 18.6)} M53.2 ${em(s, 18)} L54.6 ${em(s, 17.6)} M49 ${em(s, 16.4)} L50.4 ${em(s, 16.2)}`).join(' '), 0.45),
        ...[1, -1].map((s) => line(s > 0 ? 'kelp' : 'furDark', 2.4, `M46 ${em(s, 25)} L42.4 ${em(s, 18.6)} L36.4 ${em(s, 14.2)}`)),
        fill('furDark', blade([36.8, em(-1, 14.4)], [25.4, em(-1, 10.2)], 3.2)),
        fill('kelp', blade([36.8, 14.4], [25.4, 10.2], 3.2)),
        fill('tan', blade([35.4, 13.2], [27, 10.2], 1.1), 0.85),
        fill('kelp', blade([35.4, 50.8], [27, 53.8], 0.9), 0.7),
        line('furDark', 0.7, 'M34 14 L32.4 11 M31 13 L29.4 10.2 M34 50 L32.4 53 M31 51 L29.4 53.8', 0.6),
        fill('furDark', 'M14.6 36.4 L2.6 40.6 L13.4 39.4 Z'),
        fill('kelp', blade([15.6, 36.4], [12.2, 38.6], 1.4)),
        line('kelp', 0.7, 'M13.6 37.4 L4.6 40.2', 0.6),
        fill('kelp', eurAbdomen()),
        fill('tan', eurStrip(0.03, 0.98, 0.9, 0.35)),
        fill('ink', eurStrip(0.03, 1, -1, -0.15), 0.22),
        line('furDark', 0.8, eurRings(), 0.6),
        fill('furDark', [0.11, 0.27, 0.43, 0.59, 0.75].map((t) => `${artCircle(n1(eurSide(t, 0.45)[0]), n1(eurSide(t, 0.45)[1]), 0.5)} ${artCircle(n1(eurSide(t, -0.45)[0]), n1(eurSide(t, -0.45)[1]), 0.5)}`).join(' '), 0.45),
        line('furDark', 1.2, 'M54.6 30.4 L57.6 29.6 L58.6 30.8 M54.6 33.6 L57.6 34.4 L58.6 33.2'),
        fill('kelp', 'M41 23.4 C46 22.4 51.4 22.8 54.2 26.2 C55.8 28.2 55.8 35.8 54.2 37.8 C51.4 41.2 46 41.6 41 40.6 C40.2 36 40.2 28 41 23.4 Z'),
        fill('tan', 'M42 24.6 C46 23.6 50.6 24 53.2 26.8 C53.8 27.6 54.2 28.6 54.4 29.6 C51.6 27.2 47 26.4 42 27 Z'),
        fill('ink', 'M41.2 36.4 C46 37.6 51 37.4 55.2 34.6 C55 36.4 54.6 37.6 54.2 37.8 C51.4 41.2 46 41.6 41 40.6 Z', 0.22),
        line('furDark', 0.8, 'M42.4 24.6 C46.6 23.8 51 24.2 53.4 27 C54.6 28.8 54.6 35.2 53.4 37 C51 39.8 46.6 40.2 42.4 39.4', 0.55),
        oval('ink', 51.4, 27, 1.6, 1.1),
        oval('ink', 51.4, 37, 1.6, 1.1),
        dot('shine', 50.9, 26.6, 0.5, 0.9),
        dot('shine', 50.9, 36.6, 0.45, 0.9),
        fill('ink', `${artCircle(48.4, 31.2, 0.5)} ${artCircle(48.4, 32.8, 0.5)}`),
        fill('furDark', `${artCircle(55.6, 20.6, 0.7)} ${artCircle(52.6, 18.6, 0.7)} ${artCircle(48.8, 17.4, 0.7)} ${artCircle(55.6, 43.4, 0.7)} ${artCircle(52.6, 45.4, 0.7)} ${artCircle(48.8, 46.6, 0.7)} ${artCircle(42.4, 18.6, 0.9)} ${artCircle(42.4, 45.4, 0.9)}`),
        fill('furDark', `${artCircle(44.4, 28, 0.45)} ${artCircle(46.6, 29.4, 0.45)} ${artCircle(44.4, 36, 0.45)} ${artCircle(46.6, 34.6, 0.45)} ${artCircle(43.4, 32, 0.45)}`, 0.5),
      ],
    },
    // 4 · Pfeilschwanzkrebse — from above: domed horseshoe shield, spined hind shield, long tail spike.
    {
      name: 'Pfeilschwanzkrebse', art: [
        dot('kelp', 12, 52, 0.6, 0.35),
        dot('furDark', 24, 56, 0.5, 0.35),
        dot('kelp', 50, 54, 0.7, 0.35),
        fill('furDark', `M${L(-13, 1.6)} L${L(-30, 0.3)} L${L(-30.4, 0)} L${L(-30, -0.3)} L${L(-13, -1.6)} Z`),
        line('kelp', 0.7, `M${L(-14, 0.5)} L${L(-28.4, 0.1)}`, 0.6),
        line('tan', 0.6, `M${L(-15, 0.9)} L${L(-24, 0.5)}`, 0.45),
        fill('furDeep', blade(LIM(-15.6, 0), LIM(-12.6, 0), 1.6)),
        fill('furDark', limSpines(-1)),
        fill('kelp', limSpines(1)),
        line('furDark', 0.8, `M${L(-1, 9.8)} L${L(-10.6, 6.4)} L${L(-13.8, 2.6)} M${L(-1, -9.8)} L${L(-10.6, -6.4)} L${L(-13.8, -2.6)}`, 0.55),
        fill('kelp', `M${L(0.8, 10.8)} L${L(-11, 7.2)} L${L(-15, 2.8)} L${L(-15.4, 0)} L${L(-15, -2.8)} L${L(-11, -7.2)} L${L(0.8, -10.8)} Z`),
        fill('tan', `M${L(-1, 10)} L${L(-10.8, 6.6)} L${L(-14, 2.6)} L${L(-10.4, 4.2)} L${L(-1, 7)} Z`),
        fill('ink', `M${L(0.8, -10.8)} L${L(-11, -7.2)} L${L(-15, -2.8)} L${L(-15.4, 0)} L${L(-10.4, -1.8)} L${L(-1, -3.8)} Z`, 0.22),
        line('furDark', 0.9, `M${L(-1, 0)} L${L(-14.6, 0)} M${L(-1, 4.6)} L${L(-12.6, 3.4)} M${L(-1, -4.6)} L${L(-12.6, -3.4)}`, 0.6),
        fill('furDark', [-3, -6, -9, -12].map((u) => `${artCircle(n1(LIM(u, 5.8)[0]), n1(LIM(u, 5.8)[1]), 0.5)} ${artCircle(n1(LIM(u, -5.8)[0]), n1(LIM(u, -5.8)[1]), 0.5)}`).join(' '), 0.55),
        fill('kelp', `M${L(-7, 18)} C${L(-2, 20.6)} ${L(10, 19.4)} ${L(17.6, 12.4)} C${L(22.6, 7.4)} ${L(22.6, -7.4)} ${L(17.6, -12.4)} C${L(10, -19.4)} ${L(-2, -20.6)} ${L(-7, -18)} C${L(-4, -15.4)} ${L(-0.6, -12)} ${L(0.6, -9.6)} L${L(1, 0)} L${L(0.6, 9.6)} C${L(-0.6, 12)} ${L(-4, 15.4)} ${L(-7, 18)} Z`),
        fill('tan', `M${L(-5.4, 18.2)} C${L(0, 19.6)} ${L(10, 18.4)} ${L(16.6, 12)} C${L(11, 15.4)} ${L(3, 16.4)} ${L(-3.4, 16)} Z`),
        fill('ink', `M${L(1, -1.6)} L${L(22, -1.6)} C${L(22.2, -4.6)} ${L(20.4, -9.6)} ${L(17.6, -12.4)} C${L(10, -19.4)} ${L(-2, -20.6)} ${L(-7, -18)} C${L(-4, -15.4)} ${L(-0.6, -12)} ${L(0.6, -9.6)} Z`, 0.2),
        fill('furDark', `M${L(17.6, -12.4)} C${L(10, -19.4)} ${L(-2, -20.6)} ${L(-7, -18)} C${L(-2, -19.2)} ${L(9, -18)} ${L(16.6, -11.6)} Z`),
        line('kelp', 0.7, `M${L(-4.6, 17.4)} C${L(1, 18.8)} ${L(10, 17.6)} ${L(16.4, 11.4)}`, 0.6),
        line('tan', 0.8, `M${L(18.2, 10.6)} C${L(21.4, 6.4)} ${L(21.6, -2)} ${L(20.6, -5.6)}`, 0.6),
        line('furDark', 0.9, `M${L(1.6, 0)} L${L(18.6, 0)} M${L(1.4, 7.6)} Q${L(9, 10)} ${L(16.6, 5.6)} M${L(1.4, -7.6)} Q${L(9, -10)} ${L(16.6, -5.6)}`, 0.6),
        line('furDark', 0.8, `M${L(0.6, 9.6)} L${L(1, 0)} L${L(0.6, -9.6)}`, 0.6),
        fill('furDark', `${[4, 8.6, 13.2].map((u) => artCircle(n1(LIM(u, 0)[0]), n1(LIM(u, 0)[1]), 0.6)).join(' ')} ${[[5, 13], [11, 13.6], [4, -13], [11, -13.6], [14, 9], [14, -9]].map(([u, v]) => artCircle(n1(LIM(u, v)[0]), n1(LIM(u, v)[1]), 0.45)).join(' ')}`, 0.6),
        fill('shine', `M${L(4, 16.6)} C${L(7, 17.2)} ${L(10.6, 16.4)} ${L(13, 14.6)} C${L(10.4, 15.4)} ${L(7, 16)} ${L(4, 16.6)} Z`, 0.55),
        fill('ink', blade(LIM(6.4, 9.2), LIM(10, 9), 1.05)),
        fill('ink', blade(LIM(6.4, -9.2), LIM(10, -9), 1.05)),
        dot('shine', LIM(7.6, 9.5)[0], LIM(7.6, 9.5)[1], 0.4, 0.9),
        dot('shine', LIM(7.6, -8.8)[0], LIM(7.6, -8.8)[1], 0.35, 0.9),
        fill('ink', `${artCircle(n1(LIM(18, 0.7)[0]), n1(LIM(18, 0.7)[1]), 0.45)} ${artCircle(n1(LIM(18, -0.7)[0]), n1(LIM(18, -0.7)[1]), 0.45)}`),
      ],
    },
    // 5 · Asselspinnen — a sea spider stalking on eight long jointed legs, a male carrying his egg balls.
    {
      name: 'Asselspinnen', art: [
        ground('sandDark', 2, 62),
        line('coralDark', 1.6, PYC_FAR.map(legD).join(' ')),
        line('rustDark', 0.7, PYC_FAR.map((l) => { const [x, y] = l[3]; const out = x > 32 ? 1 : -1; return `M${pt(x, y)} Q${pt(x + out * 1.4, y - 0.6)} ${pt(x + out * 2, y + 0.4)}`; }).join(' ')),
        fill('rustDark', PYC_FAR.map((l) => `${artCircle(l[1][0], l[1][1], 1)} ${artCircle(l[2][0], l[2][1], 1)}`).join(' ')),
        ...PYC_NEAR.map((l) => line('coral', 2.2, legD(l))),
        line('skinPink', 0.8, PYC_NEAR.map((l) => `M${pt(l[0][0] - 0.3, l[0][1] - 0.5)} L${pt(l[1][0] - 0.3, l[1][1] - 0.4)}`).join(' '), 0.6),
        line('rust', 0.7, PYC_NEAR.map((l) => [0.3, 0.5, 0.7].map((q) => {
          const x = l[1][0] + (l[2][0] - l[1][0]) * q;
          const y = l[1][1] + (l[2][1] - l[1][1]) * q;
          const out = l[2][0] > l[1][0] ? 1 : -1;
          return `M${pt(x, y)} L${pt(x + out * 1.8, y - 0.6)}`;
        }).join(' ')).join(' '), 0.55),
        fill('rust', PYC_NEAR.map((l) => `${artCircle(l[1][0], l[1][1], 1.3)} ${artCircle(l[2][0], l[2][1], 1.3)}`).join(' ')),
        line('rustDark', 0.8, PYC_NEAR.map((l) => {
          const [x, y] = l[3];
          const out = l[3][0] > 32 ? 1 : -1;
          return `M${pt(x, y)} Q${pt(x + out * 1.8, y - 0.8)} ${pt(x + out * 2.6, y + 0.4)}`;
        }).join(' ')),
        line('coral', 1.1, 'M36.6 31 Q38 35 35.8 37.4 M33.4 31 Q32.6 35 30.6 37'),
        fill('cream', [[36, 38.2], [37.8, 38.8], [34.6, 39.4], [36.4, 40.2], [38.2, 40.6], [35.2, 41.4], [37, 42], [29.8, 38.2], [31.6, 38.6], [28.6, 39.6], [30.6, 40.2], [29.4, 41.4], [31.4, 41.8]].map(([x, y]) => artCircle(x, y, 1)).join(' ')),
        fill('creamDark', [[34.6, 39.4], [36.4, 40.2], [38.2, 40.6], [35.2, 41.4], [37, 42], [28.6, 39.6], [30.6, 40.2], [29.4, 41.4], [31.4, 41.8]].map(([x, y]) => artCircle(x + 0.3, y + 0.3, 0.6)).join(' '), 0.8),
        fill('shine', [[35.8, 37.9], [37.6, 38.5], [29.6, 37.9], [31.4, 38.3]].map(([x, y]) => artCircle(x, y, 0.35)).join(' '), 0.8),
        fill('coral', 'M23.4 26.6 C22.8 24.6 23.4 23.2 24.6 23.4 C25.8 23.6 26.6 25 26.6 26.6 Z'),
        fill('coral', 'M25 28.4 C25 25.6 28 24.6 32 24.6 L39 24.6 C41 24.8 42 26.2 42 28 C42 29.8 41 31.2 39 31.4 L32 31.4 C28 31.4 25 30.8 25 28.4 Z'),
        fill('coral', 'M41 26 C44 25.6 47 26 49.4 27.4 C50.4 28 50.4 29.4 49.4 29.8 C47 30.8 44 31 41 30.6 Z'),
        fill('skinPink', 'M26.4 26.6 C28 25.6 31 25.2 34 25.4 L39.4 25.4 C40.6 25.6 41.2 26.2 41.4 27 C38 26.6 32 26.6 26.4 26.6 Z'),
        fill('skinPink', 'M42 26.8 C44.6 26.6 47.4 27 49.2 27.8 C46.6 27.6 44 27.6 42 27.8 Z'),
        fill('ink', 'M25.2 29 C28 30.4 34 30.8 40 30.4 C41 30.2 41.8 29.4 42 28.4 C42 29.8 41 31.2 39 31.4 L32 31.4 C28 31.4 25.4 30.8 25.2 29 Z', 0.22),
        line('coralDark', 0.75, 'M29 25 Q29.6 28 29 31.2 M32.4 24.8 Q33 28 32.4 31.4 M35.8 24.8 Q36.4 28 35.8 31.4', 0.6),
        fill('coralDark', 'M48.8 27.4 C49.8 27.4 50.6 28 50.6 28.6 C50.6 29.2 49.8 29.8 48.8 29.8 Z'),
        line('coralDark', 0.9, 'M42.6 30.8 L45 35 L48.4 36.2'),
        line('coral', 1, 'M42 25.6 Q44 23 46.4 23.4 M42.2 30.4 Q44.4 33.2 47 33.6'),
        fill('coral', 'M34.4 25 C34.2 22 35.2 20.4 36.6 20.4 C38 20.4 39 22 38.8 25 Z'),
        fill('skinPink', 'M34.8 23.6 C34.8 22 35.6 21 36.6 21 C36 21.6 35.6 22.6 35.6 23.8 Z'),
        dot('ink', 37.2, 22.2, 1.1),
        dot('shine', 37.5, 21.9, 0.35, 0.9),
      ],
    },
    // 6 · Zehnfußkrebse — a lobster-like early decapod: rostrum, stalked eye, long antennae, small claws, tail fan.
    {
      name: 'Zehnfußkrebse', art: [
        ground('sandDark', 2, 62),
        line('orange', 0.9, 'M52.6 31.2 Q34 2 5 14.4 M51.6 31.8 Q30 9 9.6 23', 0.45),
        line('orange', 0.8, 'M55.2 32.4 L59.6 27 M55.6 32.8 L61.6 30.2', 0.45),
        line('rustDark', 1.3, 'M36 41.6 L37.6 47.4 L39.2 54.6 M39.4 41.8 L41 47.6 L42.8 54.6 M42.8 41.6 L44.4 47.2 L46.4 54.4 M46 41.2 L48.6 46.4 L51 54.2'),
        line('rustDark', 1.8, 'M47.4 40.4 L52 43.4'),
        fill('rustDark', blade([51.4, 43.2], [58, 43.6], 1.4)),
        fill('orange', blade([12.4, 43.4], [2.6, 41.2], 2)),
        fill('orange', blade([12, 44.6], [3.4, 49.4], 2.2)),
        fill('chitin', blade([12.2, 45.4], [6.6, 53], 2)),
        line('rust', 0.7, 'M11 43.2 L4.6 41.6 M10.6 44.8 L5 48.4 M10.8 45.8 L7.4 51.6', 0.6),
        fill('coral', decPleura()),
        fill('rust', decAbdomen()),
        fill('coral', smooth([decSide(0.02, 0.9), decSide(0.3, 0.92), decSide(0.6, 0.9), decSide(0.92, 0.85), decSide(0.6, 0.4), decSide(0.3, 0.45), decSide(0.02, 0.9)]) + ' Z'),
        fill('ink', smooth([decSide(0.02, -1), decSide(0.3, -1), decSide(0.6, -1), decSide(0.98, -1), decSide(0.6, -0.4), decSide(0.3, -0.35), decSide(0.02, -1)]) + ' Z', 0.22),
        line('rustDark', 0.8, DEC_SEG.map((t) => `M${ptp(decSide(t - 0.06, 0.95))} Q${ptp(decSide(t - 0.02, 0))} ${ptp(decSide(t - 0.06, -0.95))}`).join(' '), 0.6),
        line('coral', 0.7, DEC_SEG.slice(0, 5).map((t) => { const [x, y] = decSide(t + 0.02, -1); return `M${pt(x, y)} L${pt(x - 0.6, y + 2.2)} M${pt(x + 0.8, y)} L${pt(x + 0.4, y + 2)}`; }).join(' '), 0.5),
        fill('rust', 'M30 33.6 C34 28.6 44 27.6 50 29 C53.6 29.8 55.8 31 57.4 32.2 L62.4 31.6 L57.6 33.8 C57 36.6 55.6 39.6 52 41.2 C46 43.4 36 43.6 31 41.6 C29 39.6 28.8 36 30 33.6 Z'),
        fill('coral', 'M31.6 32.6 C35.6 29.6 44 28.8 50 30 C53 30.6 55.4 31.6 57 32.6 C51 31.6 44 31.2 38 32 C35 32.4 33 33 31.6 32.6 Z'),
        fill('ink', 'M30.4 38 C36 41 46 41.4 53 39 C55 38.2 56.6 37 57.4 35.6 C56.6 38.2 55 40 52 41.2 C46 43.4 36 43.6 31 41.6 Z', 0.22),
        line('rustDark', 0.8, 'M41 29 C40.4 33 41.4 37.6 44 41.6 M45.4 29.2 C44.6 31 44.6 32.6 45.4 34', 0.6),
        fill('rustDark', `${artCircle(35, 35.4, 0.5)} ${artCircle(37.6, 37.6, 0.5)} ${artCircle(48, 35, 0.5)} ${artCircle(50.4, 37.4, 0.5)} ${artCircle(33.4, 38.6, 0.5)}`, 0.55),
        ...[0, 1, 2, 3].map((k) => line('rust', 1.7, `M${pt(34 + k * 3.4, 41.8)} L${pt(36.2 + k * 3.4, 47.6)} L${pt(35 + k * 3.6 + (k - 1.5) * 1.2, 56)}`)),
        line('orange', 1.2, [0, 1, 2, 3].map((k) => `M${pt(35.2 + k * 3.6 + (k - 1.5) * 1.2, 53.6)} L${pt(35 + k * 3.6 + (k - 1.5) * 1.2, 56.6)}`).join(' ')),
        line('rust', 2, 'M48.6 41 L53.2 45.2'),
        fill('rust', blade([52.2, 45], [59, 46.6], 1.8)),
        fill('orange', spike([58, 45.6], [62, 45.4], 1.4)),
        fill('orange', spike([57.6, 47.4], [61.4, 48.4], 1.2)),
        line('rust', 1.6, 'M53.2 31.6 L54.8 30.2'),
        dot('ink', 55.2, 29.8, 1.3),
        dot('shine', 54.8, 29.4, 0.45, 0.9),
      ],
    },
    // 7 · Krabben — from the front: wide shell, two raised claws (the left a crusher), stalked eyes, spiky legs.
    {
      name: 'Krabben', art: [
        ground('sandDark', 2, 62),
        ...[1, -1].map((s) => {
          const x = (v: number): number => (s > 0 ? v : 64 - v);
          return line('rustDark', 1.9, `M${pt(x(48.6), 33.4)} Q${pt(x(55), 25)} ${pt(x(58.6), 26)} L${pt(x(61.4), 49.6)} M${pt(x(49.2), 35.2)} Q${pt(x(56.6), 28)} ${pt(x(60.2), 29.4)} L${pt(x(62.2), 53.2)}`);
        }),
        ...[1, -1].map((s) => {
          const x = (v: number): number => (s > 0 ? v : 64 - v);
          return line('rust', 2.2, `M${pt(x(48.6), 37.4)} Q${pt(x(55.4), 31)} ${pt(x(58.2), 32.6)} L${pt(x(59.8), 55.6)} M${pt(x(47.6), 39.4)} Q${pt(x(53.4), 34.6)} ${pt(x(55.4), 36.4)} L${pt(x(55.6), 56.8)}`);
        }),
        fill('rustDark', [58.6, 60.2, 58.2, 55.4].map((x, k) => `${artCircle(x, [26, 29.4, 32.6, 36.4][k], 1)} ${artCircle(64 - x, [26, 29.4, 32.6, 36.4][k], 1)}`).join(' ')),
        line('cream', 0.9, 'M61.4 49.6 L61.8 51.4 M62.2 53.2 L62.4 54.8 M59.8 55.6 L59.9 57.2 M55.6 56.8 L55.6 58 M2.6 49.6 L2.2 51.4 M1.8 53.2 L1.6 54.8 M4.2 55.6 L4.1 57.2 M8.4 56.8 L8.4 58'),
        line('rustDark', 0.7, 'M59.6 40 L61 39.4 M60.8 46 L62.2 45.6 M57 44 L58.6 43.6 M4.4 40 L3 39.4 M3.2 46 L1.8 45.6 M7 44 L5.4 43.6', 0.6),
        fill('orange', 'M8.6 33.4 C8.2 26.6 18 22.4 32 22.4 C46 22.4 55.8 26.6 55.4 33.4 C55 39.4 46 43.6 32 43.6 C18 43.6 9 39.4 8.6 33.4 Z'),
        fill('orange', 'M9.4 29.4 L7.2 27.6 L10.4 27.2 Z M12.6 26.2 L11.4 23.8 L14.6 24.4 Z M54.6 29.4 L56.8 27.6 L53.6 27.2 Z M51.4 26.2 L52.6 23.8 L49.4 24.4 Z'),
        fill('orangeLight', 'M10.4 30.6 C11.6 26.4 19 23.8 30 23.6 C24 25 16.6 27.4 12.6 31.6 Z'),
        fill('rust', 'M9.4 36 C14 40.4 22 42.4 32 42.4 C42 42.4 50 40.4 54.6 36 C53 40.6 44.6 43.6 32 43.6 C19.4 43.6 11 40.6 9.4 36 Z'),
        fill('ink', 'M33 42.6 C42 42.4 50 40 54.6 35.6 C55.4 34 55.6 32.4 55.2 31 C55.4 37 48 41.4 36 42.2 Z', 0.22),
        fill('rust', `${artCircle(18, 29, 0.6)} ${artCircle(22, 27, 0.6)} ${artCircle(42, 27, 0.6)} ${artCircle(46, 29, 0.6)} ${artCircle(15, 33, 0.6)} ${artCircle(49, 33, 0.6)} ${artCircle(26, 25.4, 0.5)} ${artCircle(38, 25.4, 0.5)}`, 0.55),
        line('rustDark', 0.8, 'M12 30.2 C18 25.6 26 24 32 24 C38 24 46 25.6 52 30.2', 0.55),
        fill('rust', 'M30 23.2 L32 25.4 L34 23.2 Z', 0.7),
        line('orange', 0.8, 'M31 24.4 L29.6 19.6 M33 24.4 L34.4 19.6', 0.45),
        line('orange', 1.8, 'M28.8 24.2 L27.8 20.4 M35.2 24.2 L36.2 20.4'),
        dot('ink', 27.6, 19.6, 1.4),
        dot('ink', 36.4, 19.6, 1.4),
        dot('shine', 27.1, 19.1, 0.45, 0.9),
        dot('shine', 35.9, 19.1, 0.45, 0.9),
        line('orange', 3.2, 'M15.4 34.6 L8.6 30.6 L8.4 25'),
        line('orange', 2.6, 'M48.6 34.6 L55.4 30.6 L55.8 26'),
        line('rust', 0.75, 'M14.6 33 L9.6 30 M49.4 33 L54.4 30', 0.55),
        fill('orange', 'M9 11.6 C10.4 7.4 14 4.6 19.8 5.2 C17.6 6.6 15.4 8.6 14 11 Z'),
        fill('orange', 'M16.2 13.4 C18 10.8 20.4 9.4 22.6 9.6 C21.4 11.4 19.6 13.4 17.2 15 Z'),
        fill('cream', 'M14.6 9.4 L15.8 9.6 L15.4 8.4 Z M16.6 7.8 L17.8 7.8 L17.2 6.8 Z M18.2 12 L19.2 12.2 L18.6 11 Z'),
        fill('furDeep', 'M18.4 5.2 C18.9 5.1 19.4 5.1 19.8 5.2 C19.4 5.6 18.9 6 18.4 6.3 Z M21.6 9.6 C22 9.5 22.3 9.5 22.6 9.6 C22.4 10.1 22.1 10.5 21.8 10.9 Z'),
        fill('orange', 'M3.8 21.4 C3.4 15.8 6.6 11.6 11.2 11 C14.6 10.6 17 12.6 17.4 15.4 C17.8 18.6 16.4 22.6 14 25.4 C11.4 28.2 6 27.6 3.8 21.4 Z'),
        fill('orangeLight', 'M5.2 19.6 C5.2 15.6 7.4 12.8 10.8 12.2 C8.6 13.8 7.2 16.4 7.2 19.8 Z'),
        fill('ink', 'M17.2 17.4 C16.8 20.4 15.6 23.2 14 25.4 C11.4 28.2 6 27.6 3.8 21.4 C8 25 14 23.6 17.2 17.4 Z', 0.2),
        line('rust', 0.75, 'M11 13 C13.4 14.6 14.4 17.6 13.8 20.6 M7.6 15 C9.2 16.6 9.8 19 9.4 21.4', 0.55),
        fill('rust', `${artCircle(6.4, 18.4, 0.5)} ${artCircle(8.4, 23.8, 0.5)} ${artCircle(15.6, 17, 0.45)}`, 0.6),
        fill('orange', 'M55.8 14.6 C54.8 11.2 52 9 47.6 9.4 C49.4 10.6 51 12.2 52 14.2 Z'),
        fill('orange', 'M50.2 16.2 C48.8 14 47 12.8 45.2 12.8 C46 14.4 47.4 16 49.4 17.4 Z'),
        fill('cream', 'M51.2 12.6 L50.2 12.6 L50.6 11.6 Z M48 15 L47.2 15 L47.6 14 Z'),
        fill('furDeep', 'M48.8 9.4 C48.4 9.3 48 9.3 47.6 9.4 C48 9.8 48.4 10.1 48.8 10.4 Z M46.2 12.8 C45.8 12.7 45.5 12.7 45.2 12.8 C45.4 13.2 45.7 13.6 46 13.9 Z'),
        fill('orange', 'M60.4 22.6 C60.8 18 58.2 14.6 54.4 14.2 C51.6 13.9 49.6 15.6 49.4 18 C49 20.6 50.2 23.6 52.2 25.8 C54.4 28 58.8 27.6 60.4 22.6 Z'),
        fill('orangeLight', 'M50.6 20.4 C50.4 17.8 51.8 15.6 54 15.2 C52.6 16.4 51.8 18.2 52 20.6 Z'),
        fill('ink', 'M60.4 20.4 C60.6 24 58.6 26.8 55.6 27 C54.2 27 53 26.6 52.2 25.8 C55.4 26.4 58.6 24.6 60.4 20.4 Z', 0.2),
        line('rust', 0.75, 'M55 15.4 C53.6 17.2 53 19.6 53.4 22', 0.55),
      ],
    },
    // 8 · Seepocken — acorn barnacles on a rock, the largest sweeping its feathery cirri out of the opening.
    {
      name: 'Seepocken', art: [
        fill('greyDark', 'M2 62 C2 54 6 48.4 14 46.6 C24 44.8 40 45 50 46.8 C57 48.2 62 53 62 62 Z'),
        fill('grey', 'M4.6 52.6 C7.6 49.4 13 47.8 22 47 C32 46.4 44 46.6 52 48.6 C44 48.2 32 48.2 22 49 C14.6 49.6 9 50.8 4.6 52.6 Z'),
        fill('ink', 'M32 62 C42 59 54 57 61.8 55 L62 62 Z', 0.22),
        line('greyDeep', 0.8, 'M14 53.6 L18 56.6 L16.6 60.6 M46 53 L43.4 56 L46 59.4', 0.55),
        fill('white', 'M47.4 51.6 C48 49 49.6 46.8 51.2 45.6 L57 45.6 C58.6 46.8 60.2 49 60.8 51.6 C56.6 52.8 51.6 52.8 47.4 51.6 Z M51.2 45.8 L52 44.2 L53 45.6 Z M55.2 45.6 L56.2 44.2 L57 45.8 Z'),
        fill('greyLight', 'M55.4 45.6 L57 45.6 C58.6 46.8 60.2 49 60.8 51.6 C59 52 57.2 52.2 55.4 52.2 Z'),
        line('grey', 0.7, 'M52.4 46.2 C51.4 48 50.8 50 50.6 52 M54.1 46 L54.1 52.4', 0.6),
        fill('grey', 'M51.6 45.8 L54.1 44.6 L56.6 45.8 L54.1 46.6 Z'),
        fill('white', 'M3.4 51.2 C4 48 6.2 45.4 8.2 44 L14.4 44 C16.4 45.4 18.6 48 19.2 51.2 C14.6 52.6 8 52.6 3.4 51.2 Z M8.2 44.2 L9 42.4 L10.2 44 Z M12.4 44 L13.6 42.4 L14.4 44.2 Z'),
        fill('greyLight', 'M12.8 44 L14.4 44 C16.4 45.4 18.6 48 19.2 51.2 C17.2 51.8 15.2 52 12.8 52 Z'),
        line('grey', 0.75, 'M8.8 44.8 C7.4 46.6 6.6 48.8 6.4 51.2 M11.3 44.6 L11.3 52.2 M13.8 44.8 C15.2 46.6 16 48.8 16.4 51.2', 0.6),
        fill('grey', 'M8.6 44.2 L11.3 42.8 L14 44.2 L11.3 45.2 Z'),
        line('greyDark', 0.7, 'M11.3 43.2 L11.3 45 M9.2 44.2 L13.4 44.2', 0.6),
        oval('white', 32, 33.8, 7.8, 2.2),
        oval('greyDeep', 32, 34, 6.6, 1.5),
        ...CIRRI.map((c, k) => line(k % 2 ? 'furDark' : 'fur', 1.5, `${cubicD(c)} ${CIRRI_CURL[k]}`)),
        line('cream', 0.6, CIRRI.map((c, k) => comb(c, k < 2 ? -1 : 1, 0.3, 0.95, 8, 2.4, 0.7)).join(' '), 0.45),
        fill('white', 'M14 49.4 C15.6 43 20 37 24.2 33.8 C27 35.4 37 35.4 39.8 33.8 C44 37 48.4 43 50 49.4 C41 52.4 23 52.4 14 49.4 Z'),
        fill('white', 'M24.2 34.2 L24.6 31.6 L26.6 35 Z M28.2 35.2 L29.4 32.6 L30.8 35.6 Z M33.2 35.6 L34.6 32.6 L35.8 35.2 Z M37.4 35 L39.4 31.6 L39.8 34.2 Z'),
        fill('shine', 'M16.4 47.6 C18 42.4 21.2 37.6 25 34.8 C25.8 35.2 26.6 35.4 27.4 35.6 C24.2 39 21.8 43.6 20.4 48.8 Z', 0.7),
        fill('greyLight', 'M36.6 35.4 C37.8 35.2 38.8 34.6 39.8 33.8 C44 37 48.4 43 50 49.4 C46.4 50.6 42.6 51.2 38.8 51.4 C39.6 45 38.8 40 36.6 35.4 Z'),
        fill('ink', 'M43.4 50.8 C45.8 50.4 48 50 50 49.4 C48.4 43 44 37 39.8 33.8 C42.4 39.6 43.8 45 43.4 50.8 Z', 0.2),
        line('greyDark', 0.8, 'M25.2 35.4 C22.4 40 19.6 45.4 18.2 50.6 M29.4 35.8 C28 40.8 27 46 26.4 51.6 M34.6 35.8 C36 40.8 37 46 37.6 51.6 M38.8 35.4 C41.6 40 44.4 45.4 45.8 50.6', 0.6),
        line('greyLight', 0.7, 'M22.4 39.4 C20.8 42.4 19.4 45.6 18.6 48.6 M27.2 37.8 C25.8 41.6 24.6 45.8 24 50.4 M31.2 36.4 L31 51.4 M33.2 36.4 L33.4 51.4 M36.8 37.8 C38.2 41.6 39.4 45.8 40 50.4 M41.6 39.4 C43.2 42.4 44.6 45.6 45.4 48.6', 0.6),
        line('grey', 0.7, 'M17.4 45.4 C22 46.8 27 47.4 32 47.4 C37 47.4 42 46.8 46.6 45.4 M20.4 40.4 C24 41.6 28 42 32 42 C36 42 40 41.6 43.6 40.4', 0.5),
        fill('greyLight', 'M26.4 34 L28.8 29.4 L31.2 34.2 Z'),
        fill('grey', 'M37.6 34 L35.2 29.4 L32.8 34.2 Z'),
        line('greyDark', 0.7, 'M28.8 29.6 L29 33.8 M35.2 29.6 L35 33.8', 0.6),
      ],
    },
  ];
}
