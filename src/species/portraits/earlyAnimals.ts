/* =============================================================================
 * SimEarth 2.0 — species portraits: Schwämme & Nesseltiere (earlyAnimals)
 * -----------------------------------------------------------------------------
 * From the first sponges to reef corals, after
 * docs/oekosystem-2026-10/portraitstil.md: sessile forms stand on a
 * translucent sea floor at y ≈ 57, jellies drift mid-box with bodies opaque
 * enough (o ≥ 0.5) to keep the ink outline. No eyes: detail comes from pores,
 * branches, segments, comb rows, canals and growth wrinkles.
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

  /** An ellipse turned by `deg`. */
  function tilted(x: number, y: number, rx: number, ry: number, deg: number): string {
    const [ax, ay] = toward(x, y, rx, deg + 180);
    const [bx, by] = toward(x, y, rx, deg);
    return `M${ax} ${ay} A${rx} ${ry} ${deg} 1 0 ${bx} ${by} A${rx} ${ry} ${deg} 1 0 ${ax} ${ay} Z`;
  }

  /** A point on an ellipse (cx, cy, rx, ry) turned by `rot`, at ellipse angle `t` degrees. */
  function onEllipse(cx: number, cy: number, rx: number, ry: number, rot: number, t: number): [number, number] {
    const a = (rot * Math.PI) / 180;
    const p = (t * Math.PI) / 180;
    const u = rx * Math.cos(p);
    const v = ry * Math.sin(p);
    return [r1(cx + u * Math.cos(a) - v * Math.sin(a)), r1(cy + u * Math.sin(a) + v * Math.cos(a))];
  }

  /**
   * A sickle along the rim of an ellipse turned by `rot`, centred on the
   * ellipse angle `deg` (45 = lower right for shade, 225 = upper left for
   * light), `span` degrees to either side and `depth` × radius deep.
   */
  function crescent(cx: number, cy: number, rx: number, ry: number, rot: number, deg: number, span: number, depth: number): string {
    const [x0, y0] = onEllipse(cx, cy, rx, ry, rot, deg - span);
    const [x1, y1] = onEllipse(cx, cy, rx, ry, rot, deg + span);
    const [mx, my] = onEllipse(cx, cy, rx, ry, rot, deg);
    const qx = 2 * (cx + (mx - cx) * (1 - depth)) - (x0 + x1) / 2;
    const qy = 2 * (cy + (my - cy) * (1 - depth)) - (y0 + y1) / 2;
    return `M${x0} ${y0} A${rx} ${ry} ${rot} 0 1 ${x1} ${y1} Q${r1(qx)} ${r1(qy)} ${x0} ${y0} Z`;
  }

  /** A point on the cubic Bezier [x0 y0 x1 y1 x2 y2 x3 y3] at t, with its heading in degrees. */
  function onCurve(p: readonly number[], t: number): [number, number, number] {
    const u = 1 - t;
    const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
    const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
    const dx = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
    const dy = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
    return [x, y, (Math.atan2(dy, dx) * 180) / Math.PI];
  }
  const curve = (p: readonly number[]): string => `M${p[0]} ${p[1]} C${p.slice(2).join(' ')}`;

  /** Side threads every `step` (in t) along a tentacle, all to one side: tentilla. */
  function tentilla(p: readonly number[], n: number, side: number): string {
    const out: string[] = [];
    for (let k = 1; k <= n; k++) {
      const [x, y, h] = onCurve(p, k / (n + 1));
      const [ex, ey] = toward(x, y, 2.6, h + side * 70);
      const [cx, cy] = toward(x, y, 1.6, h + side * 40);
      out.push(`M${r1(x)} ${r1(y)} Q${cx} ${cy} ${ex} ${ey}`);
    }
    return out.join(' ');
  }

  /** A closed curve smoothly through `pts` (Catmull-Rom as cubic Beziers). */
  function smooth(pts: readonly (readonly number[])[]): string {
    const n = pts.length;
    let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
    for (let k = 0; k < n; k++) {
      const p0 = pts[(k + n - 1) % n];
      const p1 = pts[k];
      const p2 = pts[(k + 1) % n];
      const p3 = pts[(k + 2) % n];
      d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
    }
    return `${d} Z`;
  }

  /** A fixed scatter in −0.5..0.5 for item k, so hand-placed rows look grown rather than drilled. */
  const jitter = (k: number): number => (((k * 7919) % 23) / 23) - 0.5;

  // ---- Schwämme: half width of the barrel at height y (top rim at 15, foot at 57).
  function barrel(y: number): number {
    const rows = [[15, 14.2], [21, 15.4], [27, 16.4], [33, 16.8], [39, 16.8], [45, 16], [51, 14.4], [57, 12]];
    for (let k = 1; k < rows.length; k++) {
      if (y <= rows[k][0]) {
        const t = (y - rows[k - 1][0]) / (rows[k][0] - rows[k - 1][0]);
        return rows[k - 1][1] + (rows[k][1] - rows[k - 1][1]) * t;
      }
    }
    return 12;
  }
  /** A row of ostia round the barrel at height y, smaller and flatter towards the sides. */
  function ostia(y: number, shift: number): string {
    const out: string[] = [];
    let k = Math.round(y * 3);
    for (let u = -0.78 + shift; u < 0.8; u += 0.31) {
      const uu = u + jitter(k) * 0.12;
      const s = Math.sin((uu * Math.PI) / 2);
      const c = Math.cos((uu * Math.PI) / 2);
      const size = 0.95 + jitter(k + 5) * 0.5;
      out.push(artEllipse(r1(32 + barrel(y) * s * 0.9), r1(y + jitter(k + 11) * 1.8), r1(size * c), r1(size)));
      k += 1;
    }
    return out.join(' ');
  }
  /** The wavy lip of the osculum, as points round the ellipse (32, 15, 14.4, 4.2). */
  const LIP = Array.from({ length: 16 }, (_, k) => {
    const a = (k / 16) * 2 * Math.PI;
    const f = 1 + jitter(k + 3) * 0.08;
    return [32 + 14.4 * f * Math.cos(a), 15 + 4.2 * f * Math.sin(a)];
  });
  /** A vertical ridge on the barrel at angle u (-1 left rim … 1 right rim). */
  function ridge(u: number): string {
    const pts: string[] = [];
    for (let y = 19; y <= 54; y += 5) pts.push(`${r1(32 + barrel(y) * Math.sin((u * Math.PI) / 2) * 0.9)} ${y}`);
    return `M${pts.join(' L')}`;
  }

  // ---- Ediacara-Wedel: primary branch borders of the Charnia frond, [x0 y0 x1 y1] from the zigzag midline out.
  const CHARNIA_LEFT = [[31, 41.6, 23.6, 37.4], [31, 34.8, 21.8, 30.2], [31, 28, 21.4, 23.2], [31.2, 21.2, 22.4, 16.4], [31.4, 14.4, 25, 10]];
  const CHARNIA_RIGHT = [[33, 38.2, 40.6, 34.2], [33, 31.4, 42.4, 27], [33, 24.6, 42.6, 20], [32.8, 17.8, 41.2, 13.4], [32.6, 11, 37.8, 8.2]];
  /** Fine secondary furrows between neighbouring primary borders. */
  function pinnules(borders: readonly (readonly number[])[]): string {
    const out: string[] = [];
    for (let k = 0; k + 1 < borders.length; k++) {
      const a = borders[k];
      const b = borders[k + 1];
      for (const t of [0.25, 0.5, 0.75]) {
        const x0 = a[0] + (a[2] - a[0]) * t;
        const y0 = a[1] + (a[3] - a[1]) * t;
        const x1 = b[0] + (b[2] - b[0]) * t;
        const y1 = b[1] + (b[3] - b[1]) * t;
        out.push(`M${r1(x0 + (x1 - x0) * 0.2)} ${r1(y0 + (y1 - y0) * 0.2)} L${r1(x0 + (x1 - x0) * 0.8)} ${r1(y0 + (y1 - y0) * 0.8)}`);
      }
    }
    return out.join(' ');
  }

  // ---- Dickinsonien: the quilted body, lying on a microbial mat.
  const DICK = { x: 33, y: 40, rx: 23, ry: 12, rot: -4 };
  /** A point of the body in its own frame: u along the midline, v across it. */
  function dick(u: number, v: number): string {
    const a = (DICK.rot * Math.PI) / 180;
    return `${r1(DICK.x + u * Math.cos(a) - v * Math.sin(a))} ${r1(DICK.y + u * Math.sin(a) + v * Math.cos(a))}`;
  }
  /** One body segment from the midline at u out to the rim on `side` (−1 upper, 1 lower), bending towards the nearer end. */
  function segment(u: number, side: number): string {
    const end = u + 2.4 * (u / DICK.rx);
    const v = DICK.ry * Math.sqrt(Math.max(0, 1 - (end / DICK.rx) ** 2)) * 0.93 * side;
    return `M${dick(u, 0)} Q${dick(u, v * 0.6)} ${dick(end, v)}`;
  }
  const SEGMENTS = Array.from({ length: 13 }, (_, k) => -18 + k * 3);

  // ---- Becherschwämme: three double-walled cones [rim x, rim y, half width, tilt, body path].
  const CUPS: readonly (readonly [number, number, number, number, string])[] = [
    [14, 24, 7, -20, 'M7.4 26.4 C10 36 18 46 25.6 53.6 L28.4 52.6 C25 44 21.8 32 20.6 21.6 Z'],
    [50.4, 21, 7.4, 18, 'M43.4 18.7 C42.4 29 39 43 35.6 52.6 L38.4 53.6 C46 46 54.6 36 57.4 23.3 Z'],
    [32, 13, 9, 0, 'M23 13 C23.4 25 27.6 41 30.4 53 L33.6 53 C36.4 41 40.6 25 41 13 Z'],
  ];
  /** The open top of an archaeocyath: outer wall, the ring between the walls crossed by septa, inner wall, central hollow. */
  function cupTop(x: number, y: number, w: number, rot: number): PortraitShape[] {
    const h = w * 0.36;
    const septa: string[] = [];
    for (let t = 0; t < 360; t += 30) {
      const [ax, ay] = onEllipse(x, y, w * 0.86, h * 0.84, rot, t);
      const [bx, by] = onEllipse(x, y, w * 0.58, h * 0.58, rot, t);
      septa.push(`M${ax} ${ay} L${bx} ${by}`);
    }
    return [
      fill('cream', tilted(x, y, w, r1(h), rot)),
      fill('boneDark', tilted(x, r1(y + 0.2), r1(w * 0.86), r1(h * 0.84), rot)),
      line('grey', 0.7, septa.join(' '), 0.8),
      fill('bone', tilted(x, r1(y + 0.3), r1(w * 0.58), r1(h * 0.58), rot)),
      fill('greyDeep', tilted(x, r1(y + 0.5), r1(w * 0.44), r1(h * 0.42), rot)),
    ];
  }

  // ---- Rippenquallen: one comb row bowing `bow` sideways, its plates as short dashes in three colours.
  function combRow(bow: number, plate: number): PortraitShape[] {
    const keys: PortraitKey[] = ['pink', 'gold', 'mint'];
    return keys.map((key, part) => {
      const out: string[] = [];
      for (let k = 0; k < 6; k++) {
        const t = 0.15 + (part * 6 + k) * 0.039;
        const x = 32 + 4 * bow * t * (1 - t);
        const y = 10 + 34 * t;
        out.push(`M${r1(x - plate)} ${r1(y)} L${r1(x + plate)} ${r1(y + 0.4)}`);
      }
      return line(key, 0.8, out.join(' '), 0.9);
    });
  }
  const CTENO_LEFT = [22, 31, 15, 33, 10, 38, 11, 44];
  const CTENO_LEFT2 = [11, 44, 12, 50.6, 16.6, 53.6, 12.6, 59.6];
  const CTENO_RIGHT = [42, 31, 48, 32, 52.4, 36, 50.4, 40.6];
  const CTENO_RIGHT2 = [50.4, 40.6, 48.8, 44.4, 44.4, 43.6, 45.4, 40.4];

  // ---- Quallen: marginal tentacles [x at the rim, sway, length].
  const MEDUSA_TENTACLES = [[11.4, -2, 18], [16, 2, 24], [20.6, -2, 20], [25.4, 2, 25], [38.6, -2, 25], [43.4, 2, 20], [48, -2, 24], [52.6, 2, 18]];

  // ---- Runzelkorallen: the horn's outer (left) and inner (right) edges, both from the calyx down to the tip.
  const HORN_OUT = [26.3, 18.1, 18, 26, 13, 40, 19.4, 56.6];
  const HORN_IN = [50.7, 12.9, 44, 32, 30, 46, 22.6, 56.8];
  /** A growth wrinkle across the horn at depth t, sagging like the rim of the cup above it. */
  function wrinkle(t: number, dy: number): string {
    const [lx, ly] = onCurve(HORN_OUT, t);
    const [rx, ry] = onCurve(HORN_IN, t);
    const sag = Math.hypot(rx - lx, ry - ly) * 0.2;
    return `M${r1(lx + 0.6)} ${r1(ly + dy)} Q${r1((lx + rx) / 2)} ${r1((ly + ry) / 2 + sag + dy)} ${r1(rx - 0.6)} ${r1(ry + dy)}`;
  }
  /** Tentacles round the oral disc of the polyp, either the far half or the near half. */
  function crown(far: boolean): string {
    const out: string[] = [];
    for (let t = 0; t < 360; t += 30) {
      const isFar = t > 180;
      if (isFar !== far) continue;
      const [x, y] = onEllipse(38.6, 15, 9.2, 3, -12, t);
      const lean = -90 + 38 * Math.cos((t * Math.PI) / 180);
      const [ex, ey] = toward(x, y, far ? 5 : 5.8, lean);
      const [cx, cy] = toward(x, y, 3, lean - 14);
      out.push(`M${x} ${y} Q${cx} ${cy} ${ex} ${ey}`);
    }
    return out.join(' ');
  }
  function crownTips(): string {
    const out: string[] = [];
    for (let t = 0; t <= 180; t += 30) {
      const [x, y] = onEllipse(38.6, 15, 9.2, 3, -12, t);
      const [ex, ey] = toward(x, y, 5.8, -90 + 38 * Math.cos((t * Math.PI) / 180));
      out.push(artCircle(ex, ey, 1));
    }
    return out.join(' ');
  }

  // ---- Steinkorallen: staghorn branches [x0 y0 x1 y1 x2 y2 x3 y3, width], trunk first.
  const STAG: readonly (readonly number[])[] = [
    [32, 57, 32, 53, 31.6, 49, 31.5, 46, 6],
    [31.5, 46, 28.4, 43, 26, 40.4, 24, 38, 5],
    [24, 38, 21, 34.6, 18, 31.6, 16, 28, 4.4],
    [16, 28, 13.4, 23.6, 11.6, 19.4, 11, 15, 3.6],
    [24, 38, 19.6, 37.4, 13, 35.6, 6, 31, 3.6],
    [16, 28, 19, 24, 21.6, 18, 22, 9.4, 3.4],
    [31.5, 46, 34.6, 43, 37.6, 40.4, 40, 37, 5],
    [40, 37, 43, 33.6, 46, 30, 48, 26, 4.4],
    [48, 26, 50.6, 21.6, 53, 17.4, 54, 13, 3.6],
    [40, 37, 45, 37, 52, 35.6, 58, 31, 3.4],
    [48, 26, 45, 22, 42.4, 17, 41.4, 8.4, 3.4],
  ];
  const STAG_TIPS = [[11, 15], [6, 31], [22, 9.4], [54, 13], [58, 31], [41.4, 8.4]];
  /** Little corallite cups along the branches, alternating sides. */
  function corallites(inner: boolean): string {
    const out: string[] = [];
    STAG.slice(1).forEach((b, n) => {
      for (const t of [0.3, 0.62, 0.9]) {
        const [x, y, h] = onCurve(b, t);
        const side = (n + Math.round(t * 10)) % 2 === 0 ? 1 : -1;
        const [cx, cy] = toward(x, y, b[8] / 2 + (inner ? 0.2 : -0.1), h + side * 90);
        out.push(artCircle(cx, cy, inner ? 0.45 : 1.25));
      }
    });
    return out.join(' ');
  }
  const shifted = (b: readonly number[], dx: number, dy: number): string => curve(b.slice(0, 8).map((v, k) => r1(v + (k % 2 === 0 ? dx : dy))));

  SPECIES_PORTRAITS[Life.Radiate] = [
    // 1 · Schwämme — a barrel sponge on the sea floor: pores all over, water leaving through the wide top opening.
    {
      name: 'Schwämme', art: [
        ground('sandDark', 3, 61),
        fill('chitin', 'M8.6 57 C7.4 53 7.4 48.6 8.8 45.4 L15.4 45.4 C16.6 48.6 16.6 53 15.4 57 Z'),
        fill('ink', 'M12.6 45.6 L15.4 45.4 C16.6 48.6 16.6 53 15.4 57 L12.8 57 C13.8 53 13.8 49 12.6 45.6 Z', 0.2),
        oval('chitinLight', 12.1, 45.4, 3.4, 1.3),
        oval('kelpDark', 12.1, 45.6, 2.3, 0.8),
        fill('gold', 'M20.4 57 C17.4 51 15.2 44 15.6 37 C15.8 33 14.6 29 15.4 24.6 C15.8 21 16.8 17.6 17.8 15 L46.2 15 C47.4 18.4 48.4 22.4 48.4 27 C48.4 31 49.6 35 49 40 C48.4 46 46.6 51.4 43.6 57 Z'),
        fill('yellow', 'M17.8 16.4 C16.8 19.6 15.8 22.4 15.8 25 C15.4 29 16.4 33 16.2 37 C16 44 18.2 50.4 21.4 56.6 L24.6 56.6 C21.8 49 20.4 41 20.4 33.4 C20.4 27 21 21.4 22 16.4 Z'),
        line('yellowPale', 1.2, 'M18.4 21 C17.6 26 17.4 31 17.8 36', 0.9),
        fill('ink', 'M46.2 15 C47.4 18.4 48.4 22.4 48.4 27 C48.4 31 49.6 35 49 40 C48.4 46 46.6 51.4 43.6 57 L38.6 57 C41.6 49 43.2 39 42.6 28.6 C42.2 23 41.6 18.6 40.8 15.6 Z', 0.22),
        line('chitin', 0.8, ridge(-0.62), 0.6),
        line('chitin', 0.8, ridge(-0.31), 0.6),
        line('chitin', 0.8, ridge(0.0), 0.6),
        line('chitin', 0.8, ridge(0.31), 0.6),
        line('chitin', 0.8, ridge(0.62), 0.6),
        fill('kelpDark', ostia(21.5, 0), 0.85),
        fill('kelpDark', ostia(27, 0.155), 0.85),
        fill('kelpDark', ostia(32.5, 0), 0.85),
        fill('kelpDark', ostia(38, 0.155), 0.85),
        fill('kelpDark', ostia(43.5, 0), 0.85),
        fill('kelpDark', ostia(49, 0.155), 0.85),
        fill('kelpDark', ostia(54, 0), 0.85),
        fill('yellow', smooth(LIP)),
        fill('yellowPale', 'M18.6 14.4 C21 12.4 25.4 11.2 30 11 C25.6 11.8 22 13 19.6 15 Z', 0.9),
        oval('chitin', 32, 15.3, 12, 3.2),
        oval('kelpDark', 32, 16.3, 10.6, 2.3),
        line('kelp', 0.8, 'M19.4 19.6 C20.6 18.4 22 18.6 23 19.6 M41.4 19.8 C42.6 18.6 44 18.8 45 19.8', 0.55),
        dot('cyan', 31.4, 8, 1.2, 0.4),
        dot('cyan', 28.4, 4.6, 0.9, 0.4),
        dot('cyan', 35.6, 5.2, 1, 0.4),
        line('white', 0.6, `${artCircle(31.4, 8, 1.2)} ${artCircle(35.6, 5.2, 1)}`, 0.45),
      ],
    },
    // 2 · Ediacara-Wedel — Charnia: a feathery frond with a zigzag midline, anchored by a disc in the microbial mat.
    {
      name: 'Ediacara-Wedel', art: [
        ground('olive', 2, 62),
        line('oliveDark', 0.8, 'M6 58 C9 57.2 11 58.6 14 57.8 M48 58.2 C51 57.4 53 58.8 56 58', 0.4),
        line('shellDark', 1.6, 'M13 45 L13.6 53'),
        oval('shellDark', 13.8, 54.4, 4, 1.6),
        fill('shellDark', 'M13 46.6 C9 44.4 7.6 39 8 33 C8.4 28 10.4 24.6 13 22 C15.6 24.6 17.4 28 17.8 33 C18.2 39 17 44.4 13 46.6 Z'),
        line('shell', 0.8, 'M13 45 L12.8 24.6 M12.9 41 L9.4 37.6 M12.9 35.6 L8.8 32 M12.9 30.2 L9.8 26.8 M12.9 38.4 L16.6 35 M12.9 33 L17 29.4 M12.9 27.6 L15.6 24.6', 0.55),
        line('shell', 3, 'M32 46 L32.4 52.4'),
        line('shellLight', 0.9, 'M31.2 46.8 L31.4 51.8', 0.8),
        oval('shell', 32.6, 54.6, 8.6, 3.2),
        oval('shellLight', 31.8, 53.8, 6.2, 1.8),
        line('shellDark', 0.8, `${artEllipse(32.6, 54.8, 5.6, 1.9)} ${artEllipse(32.6, 54.9, 2.8, 0.9)}`, 0.55),
        fill('blossom', 'M32 47 C24 44 20.6 35 21 25 C21.4 16 25.6 9 31.4 4.6 C37.6 9 42.4 16 42.8 25 C43.2 35 40 44 32 47 Z'),
        fill('cream', 'M21.4 26 C21.6 17 25.4 10.4 30.6 5.6 C27.2 10.6 25 16.6 24.4 23.4 C24 29 24.4 35 26 40 C23.2 36 21.2 31.6 21.4 26 Z', 0.75),
        fill('shellLight', 'M31.4 4.6 C37.6 9 42.4 16 42.8 25 C43.2 35 40 44 32 47 C33.6 38 34 28 33.6 18 C33.4 12 32.6 8 31.4 4.6 Z', 0.5),
        fill('ink', 'M42.8 25 C43.2 35 40 44 32 47 C35.6 43 38.6 37 39.6 30 C40.2 26 40 22 39.4 18.6 C41.6 20.6 42.6 22.8 42.8 25 Z', 0.2),
        line('shell', 0.7, `${pinnules(CHARNIA_LEFT)} ${pinnules(CHARNIA_RIGHT)}`, 0.55),
        ...CHARNIA_LEFT.map(([x0, y0, x1, y1]) => line('shellDark', 0.9, `M${x0} ${y0} Q${r1((x0 + x1) / 2)} ${r1(y0 - 0.4)} ${x1} ${y1}`, 0.8)),
        ...CHARNIA_RIGHT.map(([x0, y0, x1, y1]) => line('shellDark', 0.9, `M${x0} ${y0} Q${r1((x0 + x1) / 2)} ${r1(y0 - 0.4)} ${x1} ${y1}`, 0.8)),
        line('shellDark', 1, 'M32 45 L31 41.6 L33 38.2 L31 34.8 L33 31.4 L31 28 L33 24.6 L31.2 21.2 L32.8 17.8 L31.4 14.4 L32.6 11 L31.8 7.6'),
      ],
    },
    // 3 · Dickinsonien — seen from above: a flat oval quilt of many paired segments on the microbial mat, beside its last resting trace.
    {
      name: 'Dickinsonien', art: [
        fill('olive', 'M2 41 C2 31 14 27 32 27 C50 27 62 31 62 41 C62 51 50 55 32 55 C14 55 2 51 2 41 Z', 0.3),
        line('oliveDark', 0.8, 'M6 46 C8 45 10 46.4 12 45.4 M50 50 C52 49 54 50.4 56 49.4 M54 31.6 C56 30.6 58 32 60 31', 0.4),
        fill('oliveDark', tilted(14.6, 30, 11, 5.4, -6), 0.3),
        line('oliveDark', 0.8, 'M5 31 L24 29', 0.35),
        fill('fur', tilted(33.2, 41.8, DICK.rx, DICK.ry, DICK.rot)),
        fill('tan', tilted(DICK.x, DICK.y, DICK.rx, DICK.ry, DICK.rot)),
        fill('furPale', crescent(DICK.x, DICK.y, DICK.rx, DICK.ry, DICK.rot, 230, 55, 0.22)),
        fill('ink', crescent(DICK.x, DICK.y, DICK.rx, DICK.ry, DICK.rot, 50, 65, 0.24), 0.2),
        ...SEGMENTS.map((u) => line('furDark', 0.8, segment(u, -1), 0.6)),
        ...SEGMENTS.map((u) => line('furDark', 0.8, segment(u + 1.5, 1), 0.6)),
        line('furDark', 1.1, `M${dick(-20.4, 0)} L${dick(20.6, 0)}`),
        line('furPale', 0.7, `M${dick(-19, -0.9)} L${dick(19, -0.9)}`, 0.6),
      ],
    },
    // 4 · Becherschwämme — Archaeocyatha: three ribbed, porous double-walled cones on a shared holdfast.
    {
      name: 'Becherschwämme', art: [
        ground('greyDark', 4, 60),
        line('greyDark', 1.2, 'M25 56 C21 56.6 18 56.2 14.6 57.2 M39 56 C43 56.4 46 56 49.6 57.2'),
        ...CUPS.flatMap(([x, y, w, rot, body], k): PortraitShape[] => {
          const front = k === 2;
          const [lx, ly] = onEllipse(x, y, w, w * 0.36, rot, 180);
          const [rx, ry] = onEllipse(x, y, w, w * 0.36, rot, 0);
          const tip: [number, number] = k === 0 ? [27, 53] : k === 1 ? [37, 53] : [32, 53];
          const rib = (f: number): string => {
            const sx = lx + (rx - lx) * f;
            const sy = ly + (ry - ly) * f + w * 0.3;
            return `M${r1(sx)} ${r1(sy)} Q${r1(sx + (tip[0] - sx) * 0.45 + (f - 0.5) * 2)} ${r1(sy + (tip[1] - sy) * 0.5)} ${r1(tip[0] + (f - 0.5) * 2)} ${r1(tip[1] - 2)}`;
          };
          const pores: string[] = [];
          for (const f of [0.15, 0.38, 0.62, 0.85]) {
            for (const t of [0.12, 0.3, 0.48]) {
              const sx = lx + (rx - lx) * f;
              const sy = ly + (ry - ly) * f + w * 0.3;
              const px = sx + (tip[0] - sx) * t;
              const py = sy + (tip[1] - sy) * t;
              pores.push(artCircle(r1(px), r1(py), r1(0.55 - t * 0.4)));
            }
          }
          return [
            fill(front ? 'cream' : 'bone', body),
            fill('white', `M${lx} ${ly} Q${r1(lx + (tip[0] - lx) * 0.5 - 0.6)} ${r1(ly + (tip[1] - ly) * 0.5)} ${tip[0] - 1} ${tip[1]} L${tip[0]} ${tip[1]} Q${r1(lx + (tip[0] - lx) * 0.5 + 1.8)} ${r1(ly + (tip[1] - ly) * 0.5)} ${r1(lx + (rx - lx) * 0.2)} ${r1(ly + (ry - ly) * 0.2 + 0.8)} Z`, 0.8),
            fill('ink', `M${rx} ${ry} Q${r1(rx + (tip[0] - rx) * 0.5 + 0.6)} ${r1(ry + (tip[1] - ry) * 0.5)} ${tip[0] + 1} ${tip[1]} L${tip[0]} ${tip[1]} Q${r1(rx + (tip[0] - rx) * 0.5 - 1.8)} ${r1(ry + (tip[1] - ry) * 0.5)} ${r1(lx + (rx - lx) * 0.75)} ${r1(ly + (ry - ly) * 0.75 + 0.8)} Z`, 0.2),
            line('grey', 0.8, `${rib(0.25)} ${rib(0.5)} ${rib(0.75)}`, 0.6),
            fill('boneDark', pores.join(' '), 0.7),
            ...cupTop(x, y, w, rot),
          ];
        }),
        fill('grey', 'M24 57.4 C24.6 53.6 27.6 51 32 51 C36.4 51 39.4 53.6 40 57.4 Z'),
        fill('greyLight', 'M25.4 55 C26.4 53 28.8 51.8 31.4 51.6 C29.4 52.6 27.6 53.8 26.6 55.6 Z'),
        fill('ink', 'M40 57.4 C39.4 53.6 36.4 51 32 51 C35 52.6 36.6 55 37 57.4 Z', 0.2),
      ],
    },
    // 5 · Rippenquallen — a sea gooseberry: glassy oval body, eight rows of shimmering comb plates, two fringed tentacles.
    {
      name: 'Rippenquallen', art: [
        line('pink', 1.3, `${curve(CTENO_LEFT)} C${CTENO_LEFT2.slice(2).join(' ')}`),
        line('pink', 1.3, `${curve(CTENO_RIGHT)} C${CTENO_RIGHT2.slice(2).join(' ')}`),
        line('pink', 0.6, `${tentilla(CTENO_LEFT, 6, -1)} ${tentilla(CTENO_LEFT2, 4, -1)}`, 0.45),
        line('pink', 0.6, `${tentilla(CTENO_RIGHT, 4, 1)} ${tentilla(CTENO_RIGHT2, 2, 1)}`, 0.45),
        oval('cyan', 32, 27, 12.5, 17, 0.72),
        oval('white', 31, 25.6, 9.4, 13.6, 0.35),
        fill('mint', crescent(32, 27, 12.5, 17, 0, 15, 70, 0.4), 0.45),
        fill('white', crescent(32, 27, 12.5, 17, 0, 220, 55, 0.12)),
        fill('ink', crescent(32, 27, 12.5, 17, 0, 50, 65, 0.22), 0.2),
        fill('blossom', tilted(32, 34.6, 7.6, 2, 90), 0.55),
        line('shellLight', 0.8, 'M32 41.4 L32 28.6', 0.6),
        fill('pink', `${tilted(25.4, 29.6, 2.6, 1.3, 70)} ${tilted(38.6, 29.6, 2.6, 1.3, 110)}`, 0.7),
        line('pink', 0.8, 'M24.4 31.4 L22.4 31.2 M39.6 31.4 L41.6 31.2', 0.7),
        line('mint', 0.6, 'M24.6 13.4 C20 20 19.6 34 24.6 40.6 M39.4 13.4 C44 20 44.4 34 39.4 40.6', 0.45),
        ...combRow(-9.6, 0.5),
        ...combRow(9.6, 0.5),
        ...combRow(-3.8, 0.9),
        ...combRow(3.8, 0.9),
        dot('gold', 32, 11.4, 1.2),
        dot('yellowPale', 31.7, 11.1, 0.5),
        line('shellDark', 1, 'M30.2 43.2 C31.4 43.9 32.6 43.9 33.8 43.2'),
        dot('shine', 25.2, 16, 1, 0.9),
      ],
    },
    // 6 · Quallen — a moon-jelly-like medusa: scalloped bell, four gonads glowing through it, frilled oral arms, fine tentacles.
    {
      name: 'Quallen', art: [
        ...MEDUSA_TENTACLES.map(([x, sway, len]): PortraitShape => line('pink', 0.9, `M${x} 31.6 C${r1(x + sway)} ${r1(31.6 + len * 0.35)} ${r1(x - sway)} ${r1(31.6 + len * 0.65)} ${r1(x + sway * 0.6)} ${r1(31.6 + len)}`)),
        fill('blossom', 'M28.4 32 C27 38 29 42 26.6 48 C25.6 51 27 53.6 25.8 56.4 C28.6 54.6 29.6 51.4 30 48.4 C31 43 30.2 38 31 32 Z'),
        fill('pink', 'M30.4 32 C30.4 38 33.6 43 31.8 49 C31 52.4 32.4 55.4 31.6 58.6 C34 56.4 34.6 52.4 34.6 49.2 C35 43 33 38 33.6 32 Z'),
        fill('blossom', 'M33.2 32 C35 38 34.8 42 37.4 47.6 C38.4 50.6 37.8 53.4 38.8 56 C36.4 54.6 35.4 51.6 35 48.6 C34 43 32.6 38 32 32 Z'),
        line('shell', 0.9, 'M27.4 36 C26.6 38.6 28.4 41 27.2 44 C26.4 46.4 27.2 48.6 26.4 51 M35 36 C36 39 35.6 42 37 45 C37.8 47 37.4 49 38 51.6', 0.6),
        line('shellDark', 0.8, 'M32 35 C33.2 39 32.2 43 33 47 C33.4 50 32.6 53 33 56', 0.55),
        fill('violet', 'M10 31 C9.6 18 19 8 32 8 C45 8 54.4 18 54 31 Q51.8 34.4 49.6 31 Q47.4 34.4 45.2 31 Q43 34.4 40.8 31 Q38.6 34.4 36.4 31 Q34.2 34.4 32 31 Q29.8 34.4 27.6 31 Q25.4 34.4 23.2 31 Q21 34.4 18.8 31 Q16.6 34.4 14.4 31 Q12.2 34.4 10 31 Z'),
        fill('violetLight', 'M13.6 24 C14.6 15.6 21.6 10 30 9.6 C24 12 18.6 17 16.6 24.6 Z'),
        line('violetDark', 0.8, 'M30.4 11.6 Q20 15 14.4 30.4 M31 11.4 Q24.6 17 23.2 30.6 M32 11.2 L32 30.6 M33 11.4 Q39.4 17 40.8 30.6 M33.6 11.6 Q44 15 49.6 30.4', 0.55),
        line('pink', 1.6, 'M22.4 23.4 C21 20 23.4 17.2 26 17.6 C28.4 18 29 20.8 27.6 22.8', 0.75),
        line('pink', 1.6, 'M36.4 22.8 C35 19.8 37.6 17.4 40 17.8 C42.4 18.4 43 21.2 41.6 23.2', 0.75),
        line('pink', 1.4, 'M29.4 15.4 C29.8 13.4 33.6 13 34.6 15', 0.7),
        fill('ink', 'M11 27 C22 30 42 30 53 27 C53.6 28.4 54 29.6 54 31 C44 33 20 33 10 31 C10 29.6 10.4 28.4 11 27 Z', 0.2),
        fill('ink', 'M45.6 12 C50.6 15.6 53.8 21.4 54 28 C51.4 25.6 49.6 20 45.6 12 Z', 0.2),
        line('violetLight', 0.8, 'M12.4 31.6 Q14.4 33.6 16.4 31.6 M21.2 31.6 Q23.2 33.6 25.2 31.6 M30 31.6 Q32 33.6 34 31.6 M38.8 31.6 Q40.8 33.6 42.8 31.6 M47.6 31.6 Q49.6 33.6 51.6 31.6', 0.6),
        line('violetDark', 0.8, 'M12 29.4 C22 31.6 42 31.6 52 29.4', 0.55),
        fill('gold', `${artCircle(14.4, 31.4, 0.8)} ${artCircle(23.2, 31.4, 0.8)} ${artCircle(32, 31.4, 0.8)} ${artCircle(40.8, 31.4, 0.8)} ${artCircle(49.6, 31.4, 0.8)}`),
        dot('shine', 21.6, 13.6, 1, 0.9),
        dot('shine', 24.4, 11.8, 0.5, 0.9),
      ],
    },
    // 7 · Runzelkorallen — a solitary horn coral: a curved, wrinkled cup set in the mud, its polyp crowned with tentacles.
    {
      name: 'Runzelkorallen', art: [
        ground('sandDark', 6, 42),
        line('coralDark', 2, crown(true)),
        fill('grey', `M26.3 18.1 C18 26 13 40 19.4 56.6 C20 57.8 21.8 57.8 22.6 56.8 C30 46 44 32 50.7 12.9 Z`),
        fill('greyLight', 'M25.4 20 C18.6 27 14.8 39 19.4 54.6 L20.8 55 C17.6 41 21 28.4 29 20.6 Z'),
        fill('ink', 'M50.7 12.9 C44 32 30 46 22.6 56.8 L21.2 55.2 C28 45.6 38.6 31 45.6 14.4 Z', 0.2),
        line('greyDark', 0.7, 'M31 19.4 Q24 34 21.2 54', 0.5),
        line('greyDark', 0.7, 'M37.6 19 Q30 36 21.8 55', 0.5),
        line('greyDark', 0.7, 'M44.6 17.4 Q35.6 36 22.2 55.6', 0.5),
        ...[0.14, 0.27, 0.4, 0.53, 0.66, 0.79].map((t) => line('greyLight', 0.8, wrinkle(t, -0.9), 0.6)),
        ...[0.14, 0.27, 0.4, 0.53, 0.66, 0.79].map((t) => line('kelp', 1, wrinkle(t, 0), 0.65)),
        fill('bone', tilted(38.5, 15.5, 12.5, 4.4, -12)),
        fill('kelp', tilted(38.6, 15.9, 10.8, 3.4, -12)),
        fill('orangeLight', tilted(38.6, 15.2, 9.4, 2.8, -12)),
        fill('orange', crescent(38.6, 15.2, 9.4, 2.8, -12, 60, 70, 0.4), 0.8),
        line('rustDark', 1, 'M36.6 15.8 C37.8 15.2 39 15 40.4 14.8'),
        line('orange', 2.2, crown(false)),
        fill('orangeLight', crownTips()),
      ],
    },
    // 8 · Steinkorallen — a staghorn coral colony: antler-like branches studded with polyp cups, pale growing tips.
    {
      name: 'Steinkorallen', art: [
        ground('sandDark', 6, 58),
        line('coralDark', 3.6, 'M31.5 46 C30.6 40 31.4 34 33 29 C34 25.6 34.6 22 34 17 M33 29 C30.4 26 28.6 22.4 28.2 18.4'),
        fill('coralDark', `${artCircle(34, 17, 1.8)} ${artCircle(28.2, 18.4, 1.6)}`),
        fill('coralDark', `${artCircle(29.6, 40.6, 1.1)} ${artCircle(33.4, 35, 1.1)} ${artCircle(31, 31.4, 1)} ${artCircle(35.8, 24, 1)} ${artCircle(29.4, 23.6, 1)}`),
        fill('coral', corallites(false)),
        ...STAG.map((b) => line('coral', b[8], curve(b.slice(0, 8)))),
        line('orangeLight', 1.1, STAG.map((b) => shifted(b, -b[8] * 0.22, -b[8] * 0.12)).join(' '), 0.9),
        line('ink', 1.4, STAG.map((b) => shifted(b, b[8] * 0.24, b[8] * 0.14)).join(' '), 0.2),
        fill('cream', corallites(true), 0.8),
        ...STAG_TIPS.map(([x, y]) => dot('cream', x, y, 1.7)),
        fill('coral', STAG_TIPS.map(([x, y]) => artCircle(x, r1(y + 0.1), 0.55)).join(' '), 0.7),
        line('cream', 0.6, 'M22 9.4 L20.6 6.6 M22 9.4 L22.4 6 M22 9.4 L24 7 M41.4 8.4 L40 5.6 M41.4 8.4 L41.8 5 M41.4 8.4 L43.4 6', 0.45),
        line('kelp', 0.8, 'M28.6 55.4 L29.6 50.6 M34.6 55.2 L33.6 50.2', 0.55),
      ],
    },
  ];
}
