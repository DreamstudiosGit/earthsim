/* =============================================================================
 * SimEarth 2.0 — species portraits: Komplexe Zellen (eukaryotes)
 * -----------------------------------------------------------------------------
 * Single-celled eukaryotes as under the microscope, centred on y ≈ 32 (see
 * docs/oekosystem-2026-10/portraitstil.md). No eyes: each cell is told by its
 * outline (pseudopods, spines, collars, a shell, cilia, chambers, needles, a
 * coin) and modelled inside with nucleus, vacuoles, pores and growth lines.
 * Soft bodies are violet or green, shells sand, chalk or glass.
 * ========================================================================== */

namespace SE {
  const fill = (f: PortraitKey, d: string, o?: number): PortraitFill => (o === undefined ? { f, d } : { f, d, o });
  const line = (s: PortraitKey, w: number, d: string, o?: number): PortraitStroke => (o === undefined ? { s, w, d } : { s, w, d, o });
  const dot = (f: PortraitKey, cx: number, cy: number, r: number, o?: number): PortraitFill => fill(f, artCircle(cx, cy, r), o);

  const r1 = (v: number): number => Math.round(v * 10) / 10;

  /** The point `len` units from (x, y) towards `deg` (0 = right, 90 = down). */
  function toward(x: number, y: number, len: number, deg: number): [number, number] {
    const a = (deg * Math.PI) / 180;
    return [r1(x + len * Math.cos(a)), r1(y + len * Math.sin(a))];
  }

  /** A tapering lobe (pseudopod, spine) from (x, y) out along `deg`, with a round tip. */
  function lobe(x: number, y: number, deg: number, len: number, w0: number, w1: number): string {
    const [tx, ty] = toward(x, y, len, deg);
    const [ax, ay] = toward(x, y, w0 / 2, deg + 90);
    const [bx, by] = toward(tx, ty, w1 / 2, deg + 90);
    const [cx, cy] = toward(tx, ty, w1 / 2, deg - 90);
    const [dx, dy] = toward(x, y, w0 / 2, deg - 90);
    return `M${ax} ${ay} L${bx} ${by} A${w1 / 2} ${w1 / 2} 0 0 0 ${cx} ${cy} L${dx} ${dy} Z`;
  }

  /** An ellipse turned by `deg`. */
  function tilted(x: number, y: number, rx: number, ry: number, deg: number): string {
    const [ax, ay] = toward(x, y, rx, deg + 180);
    const [bx, by] = toward(x, y, rx, deg);
    return `M${ax} ${ay} A${rx} ${ry} ${deg} 1 0 ${bx} ${by} A${rx} ${ry} ${deg} 1 0 ${ax} ${ay} Z`;
  }

  /**
   * A sickle along the rim of an ellipse turned by `rot`, centred on the
   * ellipse angle `deg` (45 = lower right for shade, 225 = upper left for
   * light), `span` degrees to either side and `depth` × radius deep.
   */
  function crescent(cx: number, cy: number, rx: number, ry: number, rot: number, deg: number, span: number, depth: number): string {
    const a = (rot * Math.PI) / 180;
    const at = (t: number): [number, number] => {
      const p = (t * Math.PI) / 180;
      const u = rx * Math.cos(p);
      const v = ry * Math.sin(p);
      return [r1(cx + u * Math.cos(a) - v * Math.sin(a)), r1(cy + u * Math.sin(a) + v * Math.cos(a))];
    };
    const [x0, y0] = at(deg - span);
    const [x1, y1] = at(deg + span);
    const [mx, my] = at(deg);
    const qx = 2 * (cx + (mx - cx) * (1 - depth)) - (x0 + x1) / 2;
    const qy = 2 * (cy + (my - cy) * (1 - depth)) - (y0 + y1) / 2;
    return `M${x0} ${y0} A${rx} ${ry} ${rot} 0 1 ${x1} ${y1} Q${r1(qx)} ${r1(qy)} ${x0} ${y0} Z`;
  }
  const disc = (cx: number, cy: number, r: number, deg: number, span: number, depth: number): string => crescent(cx, cy, r, r, 0, deg, span, depth);

  /** Circles [x, y, r] as one multi-part path (granules, pores, dots of one colour). */
  const dots = (cs: readonly (readonly number[])[]): string => cs.map(([x, y, q]) => artCircle(x, y, q)).join(' ');

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

  // ---- Amöben: the cell outline, clockwise from the trailing end on the left.
  const AMOEBA = [
    [7, 36], [8.4, 31.6], [12, 28.4], [14.6, 25.2], [12.6, 21], [13.4, 16.8], [16.6, 15.6], [19.6, 18.4], [22, 22.6],
    [25.6, 22.8], [29.4, 21], [32, 16.4], [34.6, 11.6], [37.6, 8.6], [41, 9.2], [42, 12.4], [40, 17.2], [37.8, 22.4], [37.6, 25.6],
    [41.4, 26.6], [46.6, 26.4], [51.6, 26.8], [56, 27.4], [59, 29.4], [59.2, 32.8], [56.4, 34.6], [52, 35.2], [48, 36.2],
    [45.4, 38.6], [45, 41.6], [46.4, 45], [48, 48.4], [48.2, 51.8], [45.6, 54], [42.4, 52.8], [40, 49.2], [37.2, 46.2],
    [33, 46], [28.4, 46.6], [25.4, 48.6], [23.8, 52.4], [21.4, 55.6], [18, 55.6], [16.6, 52.4], [17.6, 48.4], [17, 45],
    [13.2, 43], [9.6, 40.2],
  ];
  /** The two lips of the food cup closing round the alga. */
  const AMOEBA_LIPS = [
    [[50, 35.6], [53.4, 36.4], [55.4, 38.6], [55, 40.6], [53.2, 40.2], [51.4, 38.6], [49, 38]],
    [[47.4, 44.6], [50.4, 45.6], [53.4, 45.2], [55, 46.4], [53.6, 48.4], [50.6, 48.8], [47.6, 48]],
  ];

  // ---- Wimpertierchen: a Paramecium slipper, blunt end forward, the oral groove pulling the underside in.
  /** Outline point of the slipper at parameter t (0 = front tip, π/2 = underside). */
  function slipper(t: number, grow = 0): [number, number] {
    const b = 10.5 + 2 * Math.cos(t);
    const dent = 1 - 0.16 * Math.exp(-(((t - 1.15) / 0.32) ** 2));
    return [33 + (25 + grow) * Math.cos(t), 32 + (b + grow) * Math.sin(t) * dent];
  }
  const SLIPPER = Array.from({ length: 30 }, (_, k) => slipper((k / 30) * 2 * Math.PI));
  /** Cilia between parameters t0 and t1: short strokes along the outward normal. */
  function cilia(t0: number, t1: number, n: number): string {
    const out: string[] = [];
    for (let k = 0; k < n; k++) {
      const t = t0 + ((t1 - t0) * (k + 0.5)) / n;
      const [x, y] = slipper(t);
      const [ax, ay] = slipper(t - 0.01);
      const [bx, by] = slipper(t + 0.01);
      const len = Math.hypot(bx - ax, by - ay);
      const nx = (by - ay) / len;
      const ny = -(bx - ax) / len;
      const bend = k % 2 === 0 ? 0.5 : -0.3;
      out.push(`M${r1(x - nx * 0.3)} ${r1(y - ny * 0.3)} L${r1(x + nx * 2.9 - ny * bend)} ${r1(y + ny * 2.9 + nx * bend)}`);
    }
    return out.join(' ');
  }
  /** A band along the slipper rim between t0 and t1, `depth` deep. */
  function rimBand(t0: number, t1: number, depth: number): string {
    const outer: string[] = [];
    const inner: string[] = [];
    for (let k = 0; k <= 12; k++) {
      const t = t0 + ((t1 - t0) * k) / 12;
      const taper = Math.sin((Math.PI * k) / 12);
      outer.push(slipper(t).map(r1).join(' '));
      inner.unshift(slipper(t, -depth * taper).map(r1).join(' '));
    }
    return `M${outer.join(' L')} L${inner.join(' L')} Z`;
  }
  /** A contractile vacuole: a star of feeder canals round a clear bladder. */
  function vacuole(x: number, y: number): PortraitShape[] {
    const canals = [0, 60, 120, 180, 240, 300].map((deg) => `M${toward(x, y, 1.4, deg + 15).join(' ')} L${toward(x, y, 4, deg + 15).join(' ')}`).join(' ');
    return [line('cyan', 0.8, canals, 0.85), dot('cyan', x, y, 1.8), dot('white', r1(x - 0.5), r1(y - 0.5), 0.6, 0.9)];
  }

  // ---- Foraminiferen: chambers [x, y, r] of a trochospiral test, oldest last so it sits on top.
  const FORAM = [[39.4, 33.5, 9.4], [32.2, 22.4, 7.2], [22, 22.8, 5.6], [18.5, 29.9, 4.3], [21.7, 34.9, 3.3], [26.4, 34.8, 2.5], [28, 31.5, 2], [26.5, 29.2, 1.5]];

  // ---- Strahlentierchen: lattice holes on the sphere (32, 32, 14.5), foreshortened towards the rim.
  const RADIO_R = 14.5;
  const LATTICE: number[][] = [];
  for (let j = -3; j <= 3; j++) {
    for (let i = -3; i <= 3; i++) {
      const x = i * 5 + (j % 2 === 0 ? 0 : 2.5);
      const y = j * 4.33;
      const rho = Math.hypot(x, y);
      if (rho < 12.4) LATTICE.push([x, y, rho]);
    }
  }
  function latticeHole([x, y, rho]: readonly number[], f: PortraitKey): PortraitFill {
    const squash = Math.sqrt(1 - (rho / RADIO_R) ** 2);
    const deg = rho < 0.1 ? 0 : (Math.atan2(y, x) * 180) / Math.PI + 90;
    return fill(f, tilted(r1(32 + x), r1(32 + y), 1.7, r1(1.7 * squash), r1(deg)));
  }
  /** A tapering silica needle from radius 11 to `len` round (32, 32). */
  function needle(deg: number, len: number, half: boolean): string {
    const [ax, ay] = toward(32, 32, 11, deg - 5.5);
    const [tx, ty] = toward(32, 32, len, deg);
    const [bx, by] = toward(32, 32, 11, deg + 5.5);
    const [mx, my] = toward(32, 32, 11, deg);
    return half ? `M${mx} ${my} L${tx} ${ty} L${bx} ${by} Z` : `M${ax} ${ay} L${tx} ${ty} L${bx} ${by} Z`;
  }
  const NEEDLES = [[22, 29.5], [66, 27], [113, 29], [158, 27], [204, 29.5], [248, 27], [292, 29], [338, 27]];

  // ---- Nummuliten: a coin seen at a slant, with a tight spiral of chambers.
  const COIN = { x: 33, y: 31, rx: 24, ry: 14.5, rot: -14 };
  const COIN_TURNS = 4.5;
  /** A point of the coin's spiral at angle `phi` (radians), on the coin face. */
  function coinSpiral(phi: number): [number, number] {
    const rr = 1.6 + (19.8 * phi) / (COIN_TURNS * 2 * Math.PI);
    const u = rr * Math.cos(phi);
    const v = rr * Math.sin(phi) * (COIN.ry / COIN.rx);
    const a = (COIN.rot * Math.PI) / 180;
    return [r1(COIN.x + u * Math.cos(a) - v * Math.sin(a)), r1(COIN.y + u * Math.sin(a) + v * Math.cos(a))];
  }
  const COIN_SPIRAL = `M${Array.from({ length: COIN_TURNS * 28 + 1 }, (_, k) => coinSpiral((k / 28) * 2 * Math.PI).join(' ')).join(' L')}`;
  /** Septa of whorl `w`: short walls from one turn of the spiral to the next, every `step` degrees. */
  function septa(w: number, step: number): string {
    const out: string[] = [];
    for (let deg = 0; deg < 360; deg += step) {
      const phi = w * 2 * Math.PI + (deg * Math.PI) / 180;
      out.push(`M${coinSpiral(phi).join(' ')} L${coinSpiral(phi + 2 * Math.PI).join(' ')}`);
    }
    return out.join(' ');
  }

  SPECIES_PORTRAITS[Life.Eukaryote] = [
    // 1 · Amöben — Amoeba proteus-like: blunt, flowing pseudopods, two of them closing round a green alga.
    {
      name: 'Amöben', art: [
        fill('leaf', artCircle(50.6, 42.2, 3.1)),
        fill('leafLight', disc(50.6, 42.2, 3.1, 225, 62, 0.35)),
        dot('leafDark', 51.4, 43, 0.9, 0.8),
        fill('violet', `${smooth(AMOEBA)} ${AMOEBA_LIPS.map(smooth).join(' ')}`),
        fill('violet', dots([[6.6, 33.4, 1.5], [6.2, 37, 1.6], [8, 40.2, 1.4]])),
        fill('violetLight', 'M9.6 33 C10.4 30 13 28 16 27.6 C19 27.4 22 25.6 25.6 24.6 C28.6 23.8 30.4 21.6 32.4 18 C31.6 22 29.6 25.4 26 26.8 C22.4 28 19 29.4 16 29.6 C13.4 29.8 11.4 31 9.6 33 Z'),
        line('violetLight', 1.2, 'M33.6 15.6 C35 13 36.6 11.2 38.4 10.2 M41.4 28.4 C46 28 51 28.2 56 29 M14.6 22.4 C14.6 20.4 15.4 18.4 16.8 17.6'),
        fill('violetLight', `${artCircle(39.2, 10.6, 1.9)} ${artCircle(57.2, 31, 2.1)} ${artCircle(45.6, 52.4, 1.8)} ${artCircle(19.6, 54, 1.7)} ${artCircle(15.4, 17.6, 1.5)}`, 0.85),
        fill('ink', 'M10.6 41 C13.6 43.4 17.4 44.8 21 45.2 C26 45.6 31 45.4 36.6 46 C32 44 26 43.8 21.4 43.6 C17 43.2 13.4 42.4 10.6 41 Z', 0.2),
        line('ink', 1.4, 'M41 33.6 C45 34.2 50 34 55.6 33.2 M41.2 49.4 C42.8 51.8 45 52.8 47.2 52.4 M18.8 49 C18.6 51 19 52.6 20 53.8', 0.2),
        fill('violetDark', artCircle(24, 36, 4.8)),
        fill('navy', artCircle(24, 36, 4), 0.7),
        fill('violetLight', disc(24, 36, 4, 225, 55, 0.22), 0.8),
        fill('violetLight', dots([[25.4, 37.4, 0.6], [23, 37.6, 0.5], [25.6, 35, 0.5]]), 0.6),
        dot('cyan', 13.8, 37.6, 2.3),
        dot('white', 13.2, 37, 0.8, 0.9),
        dot('kelp', 31.6, 40.6, 1.7, 0.75),
        dot('leafLight', 31.4, 40.4, 0.9, 0.8),
        dot('leaf', 33.4, 30.6, 1.3, 0.7),
        dot('olive', 27.4, 28.4, 1.1, 0.7),
        dot('leafLight', 41, 31, 1, 0.7),
        fill('violetDark', dots([[18, 31, 0.5], [28, 43, 0.5], [36.6, 36, 0.5], [38.6, 41.4, 0.5], [46, 30.4, 0.5], [21, 42.4, 0.5], [17, 25, 0.5], [31.4, 24.6, 0.5], [36, 15.6, 0.5]]), 0.55),
        line('violetDark', 0.8, 'M32 23.6 C33.6 19.8 35.4 16.6 37.4 14', 0.55),
        line('violetDark', 0.8, 'M41.4 30.8 C45.4 30.6 49.4 30.6 54 31.2', 0.55),
        line('violetDark', 0.8, 'M38.6 44.6 C40.6 46.6 42.4 48.8 44 51.2', 0.55),
        line('violetDark', 0.8, 'M21.4 46 C21 48.4 20.6 50.6 20 52.6', 0.55),
        dot('shine', 12.6, 30.6, 0.6, 0.9),
      ],
    },
    // 2 · Stachelzysten — a Tappania-like resting cyst: a hard ornamented ball with flared processes and one bulging neck.
    {
      name: 'Stachelzysten', art: [
        ...[-170, -142, -115, -88, -10, 14, 38, 62, 86, 110, 134, 158].map((deg): PortraitShape => {
          const lit = deg < -45 || deg > 135;
          const [tx, ty] = toward(31, 34, 21.6, deg);
          return fill(lit ? 'fur' : 'furDark', `${lobe(...toward(31, 34, 12, deg), deg, 9, 3.2, 1.3)} ${artCircle(tx, ty, 1.5)}`);
        }),
        ...[-115, -62, -15].map((deg): PortraitShape => {
          const [tx, ty] = toward(41, 25.6, 11.8, deg);
          return fill(deg < -45 ? 'fur' : 'furDark', `${lobe(...toward(41, 25.6, 5, deg), deg, 6.6, 2.8, 1.2)} ${artCircle(tx, ty, 1.3)}`);
        }),
        line('tan', 0.7, ['-170', '-142', '-115', '-88'].map((s) => {
          const deg = Number(s);
          return `M${toward(31, 34, 15.2, deg - 4).join(' ')} L${toward(31, 34, 20, deg - 3).join(' ')}`;
        }).join(' '), 0.6),
        fill('chitin', artCircle(41, 25.6, 6.6)),
        fill('chitinLight', disc(41, 25.6, 6.6, 240, 55, 0.3)),
        fill('ink', disc(41, 25.6, 6.6, 10, 55, 0.3), 0.2),
        fill('chitin', artCircle(31, 34, 14)),
        fill('chitinDark', artCircle(32, 35, 9.4), 0.3),
        fill('chitinLight', disc(31, 34, 14, 225, 65, 0.22)),
        fill('yellowPale', disc(31, 34, 14, 225, 40, 0.08), 0.8),
        fill('ink', disc(31, 34, 14, 45, 75, 0.3), 0.2),
        line('chitinDark', 0.8, 'M21.6 39 C25.4 42 31.4 43 36.8 40.6', 0.6),
        line('chitinDark', 0.8, 'M24.4 27.6 C27.4 29.4 29.4 32.4 29.6 36.4', 0.6),
        line('chitinDark', 0.8, 'M34 26.4 C36.4 28.6 38.4 31 39.4 34.4', 0.6),
        fill('chitinDark', dots([[25, 33, 0.55], [27.6, 38.4, 0.55], [33.4, 31.6, 0.55], [36.6, 37.6, 0.55], [31, 45, 0.55], [21, 33.6, 0.55], [38.6, 41.4, 0.55]]), 0.55),
        fill('chitinDark', dots([[40, 22.4, 0.5], [43.6, 25, 0.5], [41.4, 28.6, 0.5]]), 0.55),
        dot('shine', 23.4, 26.4, 0.9, 0.9),
      ],
    },
    // 3 · Kragengeißeltierchen — a rosette colony (Salpingoeca): five collared cells, flagella beating outward.
    {
      name: 'Kragengeißeltierchen', art: [
        dot('mint', 32, 33, 6, 0.35),
        ...[-90, -18, 54, 126, 198].map((a): PortraitShape => {
          const [bx, by] = toward(32, 33, 15, a);
          const c1 = toward(...toward(32, 33, 20, a), 2.6, a + 90);
          const c2 = toward(...toward(32, 33, 25, a), 2.6, a - 90);
          const [ex, ey] = toward(32, 33, 29, a + 4);
          return line('blueLight', 1.1, `M${bx} ${by} C${c1.join(' ')} ${c2.join(' ')} ${ex} ${ey}`);
        }),
        ...[-90, -18, 54, 126, 198].flatMap((a): PortraitShape[] => {
          const [ix, iy] = toward(32, 33, 10.4, a);
          const [ox, oy] = toward(32, 33, 17, a);
          const p = (x: number, y: number, w: number, side: number): string => toward(x, y, w, a + side).join(' ');
          return [
            fill('cyan', `M${p(ix, iy, 1.9, -90)} L${p(ox, oy, 4, -90)} L${p(ox, oy, 4, 90)} L${p(ix, iy, 1.9, 90)} Z`, 0.8),
            line('fishDark', 0.7, `M${p(ix, iy, 1.1, -90)} L${p(ox, oy, 2.6, -90)} M${p(ix, iy, 0, 0)} L${p(ox, oy, 0, 0)} M${p(ix, iy, 1.1, 90)} L${p(ox, oy, 2.6, 90)}`, 0.55),
          ];
        }),
        ...[-90, -18, 54, 126, 198].flatMap((a): PortraitShape[] => {
          const [cx, cy] = toward(32, 33, 7, a);
          const [nx, ny] = toward(32, 33, 7.8, a);
          const [fx, fy] = toward(cx, cy, 2, a + 120);
          return [
            fill('cream', tilted(cx, cy, 4.4, 3.5, a)),
            fill('white', crescent(cx, cy, 4.4, 3.5, a, 225 - a, 60, 0.3)),
            fill('ink', crescent(cx, cy, 4.4, 3.5, a, 45 - a, 65, 0.28), 0.2),
            dot('boneDark', nx, ny, 1.3),
            dot('kelp', fx, fy, 0.7, 0.6),
          ];
        }),
      ],
    },
    // 4 · Vasenamöben — a testate amoeba: a vase of glued sand grains, lobed pseudopods from the mouth.
    {
      name: 'Vasenamöben', art: [
        fill('violetDark', lobe(47.6, 37.4, 40, 8.4, 4, 2.8)),
        fill('violet', `${lobe(48, 30, -20, 11, 4.6, 3.2)} ${lobe(49, 34, 8, 9.4, 4.8, 3.4)}`),
        line('violetLight', 1, 'M48.4 28.4 L57.2 25.2 M49.4 32 L57 33', 0.9),
        fill('violetLight', `${artCircle(58.2, 26.2, 1.3)} ${artCircle(58, 35.2, 1.4)}`, 0.85),
        fill('sand', 'M44 25.4 C41.4 24.6 39 21 35.6 18 C30.6 13.6 20.4 13.6 14.2 18.2 C8 22.8 7.4 33.4 11.2 39.8 C14.8 45.8 24.4 48.2 32.2 45.6 C36.8 44 39.6 40.4 42.6 38.4 C44.4 37.6 46 38.4 48 39.8 C50.4 36.8 50.8 30 48.8 26 C47.4 24.6 45.8 25 44 25.4 Z'),
        fill('bone', disc(24, 31, 15, 220, 60, 0.2)),
        fill('bone', 'M38.4 21.6 C40.6 23.4 42.2 25.2 44 25.8 C45.6 25.4 47 25.2 48.2 26 C46.2 26.2 44.6 26.8 43 27 C41.2 26 39.6 24 38.4 21.6 Z', 0.9),
        fill('ink', 'M10.4 37.6 C14 45 24.4 48.2 32.2 45.6 C36.8 44 39.6 40.4 42.6 38.4 C38 40 33 42.6 27 43 C20 43.4 14 41.4 10.4 37.6 Z', 0.2),
        dot('kelp', 14, 26, 1.2),
        dot('tan', 18.6, 21.4, 1.1),
        dot('sandDark', 24, 19, 1.3),
        dot('kelp', 30.4, 18.4, 1),
        dot('tan', 13, 33.4, 1.3),
        dot('sandDark', 19.4, 29, 1.4),
        dot('kelp', 25.6, 25.4, 1),
        dot('tan', 31.4, 23.6, 1.2),
        dot('sandDark', 36, 25, 1),
        dot('kelp', 17.4, 38.4, 1.1),
        dot('tan', 24.4, 36, 1.3),
        dot('sandDark', 30, 31, 1.1),
        dot('kelp', 35.4, 33.6, 1),
        dot('tan', 39.4, 30.4, 0.9),
        dot('sandDark', 29.4, 41.4, 1.2),
        dot('kelp', 37.6, 39.4, 0.9),
        fill('furLight', dots([[16.4, 23.4, 0.7], [21.6, 33.4, 0.8], [28, 36.6, 0.7], [33.6, 28.6, 0.7], [22.4, 42.4, 0.7], [41.6, 33.8, 0.6]]), 0.9),
        line('kelp', 0.8, 'M20.6 25.6 L22.8 26.8 M27.4 29.6 L28.4 31.6 M33.2 37.4 L34.6 36 M15.6 30.2 L16 32.2', 0.55),
        fill('furDark', tilted(49.2, 32.9, 6.9, 2.3, 96)),
        fill('ink', tilted(49.6, 33.2, 5.4, 1.4, 96), 0.5),
        line('sand', 0.9, 'M47.2 26.6 C46.4 29 46.4 35 47.6 39', 0.9),
        dot('shine', 15.6, 21.4, 0.8, 0.9),
      ],
    },
    // 5 · Wimpertierchen — Paramecium: a ciliated slipper with oral groove, nuclei and star-shaped water pumps.
    {
      name: 'Wimpertierchen', art: [
        line('scaleLight', 0.7, cilia(Math.PI + 0.15, 2 * Math.PI - 0.15, 16)),
        line('scaleDark', 0.7, cilia(0.15, Math.PI - 0.15, 16)),
        line('scale', 0.7, `${cilia(-0.15, 0.15, 2)} ${cilia(Math.PI - 0.15, Math.PI + 0.15, 2)}`),
        fill('moss', smooth(SLIPPER)),
        fill('straw', rimBand(Math.PI + 0.35, 2 * Math.PI - 0.25, 3)),
        fill('ink', rimBand(0.25, Math.PI - 0.35, 3.4), 0.2),
        line('scaleDark', 0.7, 'M16 26 C21 30 25 35 28 40.4 M24 23.2 C29 28 33 34 35.4 41 M33 22.2 C37.6 27 41 33 42.6 39 M42 22.4 C46 26.6 49 31 50.6 36.2', 0.5),
        fill('olive', 'M58 30.6 C54 30.6 48.4 32.6 44.4 37.6 C43.4 38.8 42.4 38.4 42.8 37 C45 32 51 28.4 57.4 28 Z', 0.9),
        line('oliveDark', 0.9, 'M44 37.4 C41.6 37 39.6 35.6 38.6 33.6'),
        dot('oliveDark', 38.4, 33.4, 1.1),
        fill('olive', tilted(28.6, 31.6, 5.8, 3.4, -12), 0.8),
        fill('scaleLight', crescent(28.6, 31.6, 5.8, 3.4, -12, 225, 55, 0.3), 0.7),
        dot('oliveDark', 34.6, 29.4, 1.1),
        ...vacuole(18.6, 29),
        ...vacuole(46.6, 27.6),
        dot('kelp', 24, 36, 1.2, 0.75),
        dot('leafLight', 21, 33, 1, 0.75),
        dot('tan', 33.4, 37.6, 1.3, 0.75),
        dot('leaf', 37, 36.8, 0.9, 0.75),
        dot('kelp', 14, 34.4, 1, 0.75),
        dot('leafLight', 27.4, 26.6, 0.8, 0.75),
        dot('tan', 41.4, 31, 0.9, 0.75),
        line('oliveDark', 0.8, 'M10.6 36.6 C11.6 37.4 12.8 37.6 14 37.2', 0.6),
        dot('shine', 13.4, 26.6, 0.7, 0.9),
      ],
    },
    // 6 · Foraminiferen — a chalky test of eight chambers coiling outward, a net of granular threads streaming from its mouth.
    {
      name: 'Foraminiferen', art: [
        line('yellowPale', 0.7, 'M46 37 C51 33 56 28 61 22 M47.4 38.6 C52 37.4 57 35.4 62 34 M47 40.6 C51.6 43 56 45 61 48 M45 42.6 C48 48 51 54 54 61 M40.6 43.6 C40.6 50 39.6 56 38 62', 0.45),
        line('yellowPale', 0.6, 'M55 28.8 C56.2 31.4 57.4 33.4 58.6 34.6 M57.2 44.6 C56.4 41.4 57 39 58 36 M50.6 50.8 C52.6 48.6 54.6 47 56.4 46 M40.4 54.2 C44 54.2 47 54.8 50.8 56 M58.8 25.4 C59.4 28.4 59.6 30.8 59.4 33.6', 0.45),
        line('yellowPale', 0.6, 'M17 18 C14 14 11 10 7 7 M30 15 C30 11 30.6 7.4 31.6 3 M14.4 30 C10.6 30.6 7 31.6 2.6 33 M17 38 C13.6 42 10.6 46 8 51', 0.45),
        fill('yellowPale', dots([[52.4, 31.4, 0.6], [57, 26.6, 0.6], [55.4, 36, 0.6], [59, 34.4, 0.6], [51.4, 44.4, 0.6], [56.6, 46.6, 0.6], [49.2, 49.6, 0.6], [52.4, 55.6, 0.6], [40, 50, 0.6], [12.6, 14, 0.6], [30.4, 9.6, 0.6], [8.4, 31.6, 0.6], [11.6, 45.4, 0.6]]), 0.45),
        fill('gold', tilted(58, 40.8, 2.6, 1.2, 70), 0.45),
        line('chitin', 0.6, 'M57.6 38.6 L58.4 43', 0.45),
        ...FORAM.flatMap(([x, y, q], k): PortraitShape[] => [
          dot('greyLight', x, y, q),
          dot('cream', r1(x - q * 0.06), r1(y - q * 0.06), r1(q * 0.9)),
          ...(k < 5 ? [fill('coral', disc(r1(x - q * 0.06), r1(y - q * 0.06), r1(q * 0.9), 50, 80, 0.55), 0.2)] : []),
          ...(k < 6 ? [fill('white', disc(r1(x - q * 0.06), r1(y - q * 0.06), r1(q * 0.9), 225, 58, 0.24))] : []),
          ...(k < 4 ? [fill('ink', disc(x, y, q, 45, 70, 0.28), 0.2)] : []),
        ]),
        fill('boneDark', dots([[36, 31, 0.5], [40.4, 29, 0.5], [44.6, 31.6, 0.5], [45, 36.6, 0.5], [41, 39.6, 0.5], [36.4, 37, 0.5], [40.6, 34.4, 0.5]]), 0.6),
        fill('boneDark', dots([[29, 20, 0.5], [33.4, 18.6, 0.5], [36.6, 22.6, 0.5], [33, 25.6, 0.5], [29.4, 24, 0.45]]), 0.6),
        fill('boneDark', dots([[19.6, 20.6, 0.45], [23.6, 19.6, 0.45], [24.6, 24.4, 0.45], [20.4, 25, 0.4], [16.6, 28.4, 0.4], [19.4, 32.4, 0.4]]), 0.6),
        fill('furDark', tilted(46.8, 38.6, 2.4, 1, 125)),
      ],
    },
    // 7 · Strahlentierchen — a radiolarian: a glassy lattice ball with long tapering needles and fine axopodia.
    {
      name: 'Strahlentierchen', art: [
        dot('mint', 32, 32, 20.5, 0.2),
        line('cyan', 0.6, Array.from({ length: 16 }, (_, k) => {
          const deg = k * 22.5 + 11.25 + (k % 2) * 4;
          return `M${toward(32, 32, 14.6, deg).join(' ')} L${toward(32, 32, k % 2 ? 22 : 24.5, deg).join(' ')}`;
        }).join(' '), 0.45),
        fill('white', dots([[16, 20, 0.7], [47, 18.4, 0.6], [49.4, 46, 0.7], [14.6, 44.6, 0.6], [32, 13.6, 0.5], [51, 32.6, 0.5]]), 0.35),
        ...NEEDLES.map(([deg, len]): PortraitShape => fill('white', needle(deg, len, false))),
        fill('greyLight', NEEDLES.map(([deg, len]) => needle(deg, len, true)).join(' ')),
        fill('cyan', artCircle(32, 32, RADIO_R)),
        fill('white', disc(32, 32, RADIO_R, 225, 62, 0.13), 0.9),
        ...LATTICE.map((h) => latticeHole(h, h[0] + h[1] > 4 ? 'tealDark' : 'teal')),
        fill('ink', disc(32, 32, RADIO_R, 45, 75, 0.3), 0.2),
        line('tealLight', 0.7, 'M22.2 22.4 C24.6 20.2 27.6 18.8 31 18.4', 0.6),
        dot('shine', 23.6, 22.6, 0.9, 0.9),
      ],
    },
    // 8 · Nummuliten — a giant coin-shaped foraminifer, its face wound into a tight spiral of small chambers.
    {
      name: 'Nummuliten', art: [
        fill('kelp', tilted(50.4, 12.6, 11, 3.2, 14)),
        fill('tan', crescent(50.4, 12.6, 11, 3.2, 14, 270, 85, 0.55)),
        line('sandDark', 0.8, `M${toward(50.4, 12.6, 10, 194).join(' ')} L${toward(50.4, 12.6, 10, 14).join(' ')}`, 0.6),
        fill('kelp', tilted(12.4, 51.6, 7.8, 5, -8)),
        fill('tan', tilted(11.8, 50.4, 7.8, 5, -8)),
        fill('sand', crescent(11.8, 50.4, 7.8, 5, -8, 225, 50, 0.25), 0.8),
        line('kelp', 0.7, 'M11.8 50.4 C9 49 7 49 5 50.4 M11.8 50.4 C13 47.6 15 46.6 17 46.8 M11.8 50.4 C14.2 52 15.8 53.4 16.6 54.4 M11.8 50.4 C10.4 53 9 54.2 7.6 54.6', 0.55),
        dot('sandDark', 11.8, 50.4, 1),
        fill('tan', tilted(34.2, 34.6, COIN.rx, COIN.ry, COIN.rot)),
        fill('ink', tilted(34.6, 35.2, COIN.rx - 0.4, COIN.ry - 0.4, COIN.rot), 0.22),
        fill('sand', tilted(COIN.x, COIN.y, COIN.rx, COIN.ry, COIN.rot)),
        fill('yellowPale', crescent(COIN.x, COIN.y, COIN.rx, COIN.ry, COIN.rot, 225, 55, 0.2)),
        fill('ink', crescent(COIN.x, COIN.y, COIN.rx, COIN.ry, COIN.rot, 50, 62, 0.2), 0.2),
        line('sandDark', 0.9, tilted(COIN.x, COIN.y, COIN.rx - 1.2, COIN.ry - 1, COIN.rot), 0.6),
        line('kelp', 0.8, septa(0, 40), 0.6),
        line('kelp', 0.8, septa(1, 30), 0.6),
        line('kelp', 0.8, septa(2, 24), 0.6),
        line('kelp', 0.8, septa(3, 20), 0.6),
        line('furDark', 1.1, COIN_SPIRAL),
        fill('sandDark', dots([[24.6, 26, 0.6], [40.4, 24.2, 0.6], [43, 36.4, 0.6], [26, 37.6, 0.6]]), 0.6),
        fill('sandDark', dots([[33.6, 21.4, 0.6], [18.6, 31.4, 0.6], [48.6, 30, 0.6], [36.6, 39.6, 0.6]]), 0.6),
        fill('sandDark', dots([[29.4, 22.6, 0.5], [45.6, 25.6, 0.5], [21.4, 36.4, 0.5], [31, 41, 0.5]]), 0.6),
        line('yellowPale', 0.8, `M${crescent(COIN.x, COIN.y, COIN.rx - 0.6, COIN.ry - 0.6, COIN.rot, 225, 40, 0.01).split(' Q')[0].slice(1)}`, 0.6),
        dot('bone', COIN.x, COIN.y, 2.2),
        dot('yellowPale', 32.4, 30.4, 0.9),
        dot('shine', 19.4, 24, 0.9, 0.9),
      ],
    },
  ];
}
