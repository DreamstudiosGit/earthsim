/* =============================================================================
 * SimEarth 2.0 — species portraits: Frühe Zweiseitentiere (bilaterians)
 * -----------------------------------------------------------------------------
 * Worms and other early bilaterians in the style of the reference set
 * (docs/oekosystem-2026-10/portraitstil.md). Most of them have no visible
 * eyes, so their detail comes from rings, segments, bristles, guts and tubes.
 * Soft bodies are laid out along a curved centre line (`tube`, `strip`, `ring`)
 * so light, shade and rings follow the body as it bends.
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
  /** A point of a centre line and its unit normal, which points up for a body heading right. */
  interface Station { readonly x: number; readonly y: number; readonly nx: number; readonly ny: number }
  type Spine = (t: number) => Station;
  type Width = (t: number) => number;

  const n1 = (v: number): number => Math.round(v * 10) / 10;
  /** Kept inside the box the format allows for end points. */
  const pt = (x: number, y: number): string => `${n1(Math.min(63, Math.max(1, x)))} ${n1(Math.min(63, Math.max(1, y)))}`;
  const ptp = (p: P): string => pt(p[0], p[1]);

  function curve(f: (t: number) => P): Spine {
    return (t) => {
      const [x, y] = f(t);
      const [xa, ya] = f(t - 0.001);
      const [xb, yb] = f(t + 0.001);
      const len = Math.hypot(xb - xa, yb - ya);
      return { x, y, nx: (yb - ya) / len, ny: -(xb - xa) / len };
    };
  }
  const bez = (c: readonly number[]) => (t: number): P => {
    const u = 1 - t;
    return [
      u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6],
      u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7],
    ];
  };

  /** A smooth path near the points: quadratic pieces through their midpoints. */
  function smooth(p: readonly P[], cmd = 'M'): string {
    let d = `${cmd}${ptp(p[0])}`;
    for (let k = 1; k < p.length - 1; k++) d += ` Q${ptp(p[k])} ${pt((p[k][0] + p[k + 1][0]) / 2, (p[k][1] + p[k + 1][1]) / 2)}`;
    return `${d} L${ptp(p[p.length - 1])}`;
  }

  /** The point `f` half-widths above the centre line (−1 = lower edge). */
  function side(s: Spine, w: Width, t: number, f: number): P {
    const a = s(t);
    const h = (w(t) / 2) * f;
    return [a.x + a.nx * h, a.y + a.ny * h];
  }

  /** The body outline; round ends unless `cap0`/`cap1` is false. */
  function tube(s: Spine, w: Width, cap0 = true, cap1 = true, n = 14): string {
    const up: P[] = [];
    const down: P[] = [];
    for (let k = 0; k <= n; k++) {
      up.push(side(s, w, k / n, 1));
      down.push(side(s, w, k / n, -1));
    }
    const h0 = n1(w(0) / 2);
    const h1 = n1(w(1) / 2);
    const head = cap1 ? `A${h1} ${h1} 0 0 1 ${ptp(down[n])}` : `L${ptp(down[n])}`;
    const tail = cap0 ? `A${h0} ${h0} 0 0 1 ${ptp(up[0])}` : `L${ptp(up[0])}`;
    return `${smooth(up)} ${head} ${smooth(down.slice().reverse(), 'L')} ${tail} Z`;
  }

  /** A crescent along the body from `outer` towards `inner` (in half-widths), pointed at both ends. */
  function strip(s: Spine, w: Width, t0: number, t1: number, outer: number, inner: number, n = 12): string {
    const a: P[] = [];
    const b: P[] = [];
    for (let k = 0; k <= n; k++) {
      const t = t0 + ((t1 - t0) * k) / n;
      a.push(side(s, w, t, outer));
      b.push(side(s, w, t, outer + (inner - outer) * Math.sin((Math.PI * k) / n)));
    }
    return `${smooth(a)} ${smooth(b.reverse(), 'L')} Z`;
  }

  /** A line along the body at `f` half-widths from the centre. */
  function along(s: Spine, w: Width, t0: number, t1: number, f: number, n = 12): string {
    const a: P[] = [];
    for (let k = 0; k <= n; k++) a.push(side(s, w, t0 + ((t1 - t0) * k) / n, f));
    return smooth(a);
  }

  /** A ring across the body at t, bowed towards the head by `bulge` half-widths. */
  function ring(s: Spine, w: Width, t: number, f0 = 0.92, f1 = -0.92, bulge = 0.25): string {
    const a = s(t);
    const h = w(t) / 2;
    const p0 = side(s, w, t, f0);
    const p1 = side(s, w, t, f1);
    const cx = (p0[0] + p1[0]) / 2 - a.ny * h * bulge * 2;
    const cy = (p0[1] + p1[1]) / 2 + a.nx * h * bulge * 2;
    return `M${ptp(p0)} Q${pt(cx, cy)} ${ptp(p1)}`;
  }

  /** The centre-line parameter where the spine crosses x (spine heading right). */
  function atX(s: Spine, x: number): number {
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (s(mid).x < x) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // 1 · Ikaria — a rice-grain body, thicker at the head, a wave of contraction running along it,
  // crawling out of the groove it has dug.
  const ikaria = curve(bez([16, 42.6, 27, 35.4, 41, 42.4, 54, 34]));
  const ikariaW: Width = (t) => (8 + 5 * t) * (1 - 0.14 * Math.exp(-(((t - 0.4) / 0.07) ** 2)) + 0.06 * Math.exp(-(((t - 0.54) / 0.07) ** 2)));
  const ikTrail = curve(bez([16, 44.2, 12, 47.4, 9, 43.6, 2.6, 47.2]));
  const ikTrailW: Width = () => 4.4;

  // 2 · Cloudina — tubes of funnels stacked cone in cone.
  interface Funnel { readonly xb: number; readonly yb: number; readonly xt: number; readonly yt: number; readonly wb: number; readonly wt: number }
  /** The open rims first, then `tip`, then the walls from the top down, so every funnel sits in the one below. */
  function cloudina(fs: readonly Funnel[], detail: boolean, tip: readonly PortraitShape[]): PortraitShape[] {
    const ry = 1.6;
    const out: PortraitShape[] = [];
    for (const f of fs) out.push(oval('white', f.xt, f.yt, f.wt, ry), oval('greyDeep', f.xt, f.yt + 0.3, f.wt - 0.9, ry - 0.6));
    out.push(...tip);
    for (let k = fs.length - 1; k >= 0; k--) {
      const f = fs[k];
      const ym = (f.yb + f.yt) / 2 + 1.4;
      const lip = (q: number): string => pt(f.xt + f.wt * q, f.yt + ry * Math.sqrt(1 - q * q));
      const lc = pt(f.xt - f.wt * 0.62, ym);
      const rc = pt(f.xt + f.wt * 0.62, ym);
      out.push(fill('white', `M${pt(f.xb - f.wb, f.yb)} Q${lc} ${pt(f.xt - f.wt, f.yt)} A${f.wt} ${ry} 0 0 0 ${pt(f.xt + f.wt, f.yt)} Q${rc} ${pt(f.xb + f.wb, f.yb)} Z`));
      out.push(fill('greyLight', `M${pt(f.xb + f.wb * 0.2, f.yb)} L${lip(0.3)} A${f.wt} ${ry} 0 0 0 ${pt(f.xt + f.wt, f.yt)} Q${rc} ${pt(f.xb + f.wb, f.yb)} Z`));
      if (detail) {
        out.push(fill('shine', `M${pt(f.xb - f.wb * 0.8, f.yb - 0.4)} Q${pt(f.xt - f.wt * 0.52, ym)} ${lip(-0.84)} Q${pt(f.xt - f.wt * 0.3, ym + 0.6)} ${pt(f.xb - f.wb * 0.3, f.yb - 0.4)} Z`, 0.8));
        out.push(line('grey', 0.75, `M${pt(f.xt - f.wt * 0.7, f.yt + 2)} A${n1(f.wt * 0.7)} 1.2 0 0 0 ${pt(f.xt + f.wt * 0.7, f.yt + 2)}`, 0.55));
        out.push(fill('ink', `M${pt(f.xb + f.wb * 0.55, f.yb)} L${lip(0.7)} A${f.wt} ${ry} 0 0 0 ${pt(f.xt + f.wt, f.yt)} Q${rc} ${pt(f.xb + f.wb, f.yb)} Z`, 0.18));
      }
    }
    return out;
  }

  // 3 · Ottoia — a ringed trunk rising from its burrow, the spiny introvert on top.
  const priTrunk = curve(bez([13, 56, 13, 43, 23, 33.6, 36.4, 30]));
  const priTrunkW: Width = (t) => 11 - 1.2 * t;
  const priHead = curve(bez([35, 30.6, 41.6, 26.4, 48.4, 21.6, 55, 17.2]));
  const priHeadW: Width = (t) => 9 + 4.6 * Math.sin(Math.PI * t) - 3 * t * t;

  function scalids(): string {
    let d = '';
    [0.18, 0.3, 0.42, 0.54, 0.66, 0.78].forEach((t, k) => {
      const a = priHead(t);
      const tx = -a.ny;
      const ty = a.nx;
      for (const f of k % 2 ? [-0.75, -0.32, 0.12, 0.55] : [-0.55, -0.1, 0.35, 0.75]) {
        const [x, y] = side(priHead, priHeadW, t, f);
        d += `M${pt(x + a.nx * 0.6, y + a.ny * 0.6)} L${pt(x - tx * 1.7, y - ty * 1.7)} L${pt(x - a.nx * 0.6, y - a.ny * 0.6)} Z `;
      }
    });
    return d.trim();
  }
  /** Hooked spines along one edge of the introvert (`f` = 1 upper, −1 lower). */
  function edgeSpines(f: number): string {
    let d = '';
    for (const t of [0.2, 0.36, 0.52, 0.68, 0.84]) {
      const a = priHead(t);
      const [x, y] = side(priHead, priHeadW, t - 0.05, f);
      d += `M${ptp(side(priHead, priHeadW, t - 0.04, f * 0.9))} L${pt(x + a.nx * f * 2.4 + a.ny * 1.2, y + a.ny * f * 2.4 - a.nx * 1.2)} L${ptp(side(priHead, priHeadW, t + 0.04, f * 0.9))} Z `;
    }
    return d.trim();
  }
  /** The mouth at the tip of the introvert, seen half from the side, and the teeth round its rim. */
  function priMouth(): { mouth: string; teeth: string } {
    const a = priHead(1);
    const tx = -a.ny;
    const ty = a.nx;
    const cx = a.x + tx * 1.4;
    const cy = a.y + ty * 1.4;
    const rx = 2.7;
    const ry = 1.2;
    const rot = n1((Math.atan2(a.ny, a.nx) * 180) / Math.PI);
    const rim = (q: number, s: number): P => [cx + a.nx * rx * s * Math.cos(q) + tx * ry * s * Math.sin(q), cy + a.ny * rx * s * Math.cos(q) + ty * ry * s * Math.sin(q)];
    const mouth = `M${ptp(rim(0, 1))} A${rx} ${ry} ${rot} 1 0 ${ptp(rim(Math.PI, 1))} A${rx} ${ry} ${rot} 1 0 ${ptp(rim(0, 1))} Z`;
    let teeth = '';
    for (let k = 0; k < 9; k++) {
      const q = (k / 9) * 2 * Math.PI;
      teeth += `M${ptp(rim(q - 0.22, 1))} L${ptp(rim(q, 0.45))} L${ptp(rim(q + 0.22, 1))} Z `;
    }
    return { mouth, teeth: teeth.trim() };
  }
  const PRI_MOUTH = priMouth();

  // 4 · Chaetognath — a glassy arrow seen from above.
  const sag = curve(bez([9, 32.8, 22, 33.4, 38, 32.6, 50, 31.8]));
  const sagW: Width = (t) => (t < 0.45 ? 2.8 + 3.2 * (t / 0.45) : 6 - 1.6 * ((t - 0.45) / 0.55));
  /** A grasping spine: `w` wide at its base (bx, by), bent through (cx, cy) to a point at (tx, ty). */
  function sickle(bx: number, by: number, cx: number, cy: number, tx: number, ty: number, w: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const nx = (-(ty - by) / len) * (w / 2);
    const ny = ((tx - bx) / len) * (w / 2);
    return `M${pt(bx + nx, by + ny)} Q${pt(cx + nx * 0.6, cy + ny * 0.6)} ${pt(tx, ty)} Q${pt(cx - nx * 0.6, cy - ny * 0.6)} ${pt(bx - nx, by - ny)} Z`;
  }
  const SAG_HOOKS: readonly (readonly number[])[] = [
    [53.4, 28.8, 55.4, 23.6, 61, 25.8],
    [54.6, 28.6, 57.4, 24.8, 61.8, 28],
    [55.6, 29.4, 58.6, 27.2, 61.8, 30.4],
  ];
  /** The upper hooks, or (mirrored about the head's axis) the lower ones. */
  const sagHooks = (lower: boolean): string[] =>
    SAG_HOOKS.map(([bx, by, cx, cy, tx, ty]) => (lower ? sickle(bx, 63.2 - by, cx, 63.2 - cy, tx, 63.2 - ty, 1.4) : sickle(bx, by, cx, cy, tx, ty, 1.4)));

  // 5 · Hallucigenia — a lobopodian on stubby legs under paired back spines.
  const halTrunk = curve(bez([7, 48, 9, 40, 24, 39.6, 46, 40]));
  const halTrunkW: Width = (t) => 3.4 + 3 * Math.sin(Math.PI * (0.08 + 0.8 * t));
  const halNeck = curve(bez([44.6, 40, 49, 40.2, 52.6, 41, 55.4, 42.8]));
  const halNeckW: Width = (t) => 4.2 - 1.6 * t;
  const HAL_X = [12.6, 17.6, 22.6, 27.6, 32.6, 37.6, 42.4];
  const HAL_H = [12, 15, 17.5, 18.5, 18, 16.5, 14];
  function halSpine(x: number, h: number, hw: number, dx: number, scale: number): string {
    const t = atX(halTrunk, x);
    const [bx, by] = side(halTrunk, halTrunkW, t, 0.7);
    const X = bx + dx;
    const H = h * scale;
    const lean = 3.4 * scale;
    return `M${pt(X - hw, by)} Q${pt(X - hw * 0.6 - lean * 0.35, by - H * 0.55)} ${pt(X - lean, by - H)} Q${pt(X + hw * 0.4 - lean * 0.45, by - H * 0.5)} ${pt(X + hw, by)} Z`;
  }
  function halSpineLights(): string {
    return HAL_X.map((x, k) => {
      const t = atX(halTrunk, x);
      const [bx, by] = side(halTrunk, halTrunkW, t, 0.7);
      const H = HAL_H[k];
      return `M${pt(bx - 0.6, by - 1.2)} Q${pt(bx - 1.4, by - H * 0.5)} ${pt(bx - 2.8, by - H + 2.6)}`;
    }).join(' ');
  }
  /** How far each foot is set forward (+) or back (−): a walking gait. */
  const HAL_SWING = [-1, 1.4, -0.8, 1.2, -1, 1.4, -0.6];
  /** Hip and foot of leg k; `far` legs hang half a step further on and end higher. */
  function halLegEnds(k: number, far: boolean): { hx: number; hy: number; fx: number; fy: number } {
    const t = atX(halTrunk, HAL_X[k] + (far ? 2.8 : 0.6));
    const [hx, hy] = side(halTrunk, halTrunkW, t, far ? -0.1 : -0.4);
    return { hx, hy, fx: hx + 1.2 + HAL_SWING[k] * (far ? -0.6 : 1), fy: far ? 54.6 : 55.8 };
  }
  function halLegs(far: boolean): string[] {
    return HAL_X.map((_, k) => {
      const { hx, hy, fx, fy } = halLegEnds(k, far);
      return `M${pt(hx, hy)} Q${pt((hx + fx) / 2 + 1.6, (hy + fy) / 2)} ${pt(fx, fy)}`;
    });
  }
  function halClaws(): string {
    return HAL_X.map((_, k) => {
      const { fx, fy } = halLegEnds(k, false);
      return `M${pt(fx, fy)} Q${pt(fx + 1.6, fy - 0.2)} ${pt(fx + 2, fy + 1.2)} M${pt(fx - 0.4, fy + 0.4)} Q${pt(fx + 0.6, fy + 0.8)} ${pt(fx + 0.6, fy + 1.8)}`;
    }).join(' ');
  }
  function halLegRings(): string {
    return HAL_X.map((_, k) => {
      const { hx, hy, fx, fy } = halLegEnds(k, false);
      return [0.35, 0.55, 0.75].map((q) => {
        const x = hx + (fx - hx) * q + 1.6 * 2 * q * (1 - q);
        const y = hy + (fy - hy) * q;
        return `M${pt(x - 0.8, y + 0.1)} L${pt(x + 0.8, y - 0.2)}`;
      }).join(' ');
    }).join(' ');
  }

  // 6 · Ragworm — a wavy segmented worm from above, bristle tufts on every segment.
  const rag = curve((t) => [6 + 46 * t, 37 - 7 * t + 6 * Math.sin(2 * Math.PI * 1.2 * t)]);
  const ragW: Width = (t) => 2.4 + 4.6 * Math.sqrt(Math.min(1, t / 0.35)) - (1.4 * Math.max(0, t - 0.75)) / 0.25;
  const RAG_SEGS = Array.from({ length: 16 }, (_, k) => 0.07 + (k * 0.86) / 15);
  /** Parapodia on one side (`sign` 1 = upper), and their bristle fans. */
  function parapodia(sign: number): { lobes: string; bristles: string } {
    let lobes = '';
    let bristles = '';
    for (const t of RAG_SEGS) {
      const a = rag(t);
      const k = Math.min(1, ragW(t) / 6);
      const nx = a.nx * sign;
      const ny = a.ny * sign;
      const tx = -a.ny;
      const ty = a.nx;
      const [ex, ey] = side(rag, ragW, t, 0.85 * sign);
      const at = (n: number, s: number): string => pt(ex + nx * n * k + tx * s * k, ey + ny * n * k + ty * s * k);
      lobes += `M${at(0, -1.9)} Q${at(1.8, -2.4)} ${at(2.7, -1.4)} Q${at(3, -0.2)} ${at(2.4, 0.8)} Q${at(1.4, 1.7)} ${at(0, 1.6)} Z `;
      for (const s of [-3.4, -2.4, -1.4, -0.4, 0.6, 1.5]) bristles += `M${at(2.4, -0.3)} L${at(5.6, s)} `;
    }
    return { lobes: lobes.trim(), bristles: bristles.trim() };
  }
  const ragUp = parapodia(1);
  const ragDown = parapodia(-1);
  const ragEnd = rag(1);
  /** A point near the ragworm's head: `a` along its heading, `n` towards its upper side. */
  const ragHead = (a: number, n: number): P => [ragEnd.x - ragEnd.ny * a + ragEnd.nx * n, ragEnd.y + ragEnd.nx * a + ragEnd.ny * n];

  // 7 · Serpulid — a chalk tube on a rock, a banded feather crown and the operculum.
  const serTube = curve(bez([7, 47.2, 18, 44.6, 32, 45.4, 35, 30.6]));
  const serTubeW: Width = (t) => 5 + 1.2 * t;
  const SER_M: P = [35.2, 29.6];
  /** One radiole of the crown: a quadratic from the mouth, its tip splayed outwards. */
  interface Radiole { readonly d: string; readonly at: (t: number) => P }
  function radiole(angle: number, len: number, bend: number): Radiole {
    const rad = (a: number): P => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];
    const [ux, uy] = rad(angle);
    const [cx, cy] = rad(angle + bend);
    const p0: P = [SER_M[0] + ux * 1.4, SER_M[1] + uy * 1.4];
    const c: P = [SER_M[0] + cx * len * 0.5, SER_M[1] + cy * len * 0.5];
    const p1: P = [SER_M[0] + ux * len, SER_M[1] + uy * len];
    const at = (t: number): P => {
      const u = 1 - t;
      return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
    };
    return { d: `M${ptp(at(0.08))} Q${ptp(c)} ${ptp(at(0.97))}`, at };
  }
  const SER_NEAR = [-148, -129, -110, -91, -72, -53, -34].map((a) => radiole(a, a === -91 ? 21.6 : 20.8, a < -91 ? 10 : a > -91 ? -10 : 0));
  const SER_FAR = [-138, -119, -100, -81, -62, -43].map((a) => radiole(a, 18.6, a < -91 ? 8 : -8));
  /** The translucent mesh of pinnules between the radioles. */
  function serHaze(): string {
    const first = SER_NEAR[0];
    const last = SER_NEAR[SER_NEAR.length - 1];
    const pts: P[] = [0, 0.25, 0.5, 0.75, 0.95].map((t) => first.at(t));
    for (let k = 1; k < SER_NEAR.length; k++) {
      const a = SER_NEAR[k - 1].at(0.9);
      const b = SER_NEAR[k].at(0.9);
      pts.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], SER_NEAR[k].at(0.95));
    }
    pts.push(...[0.75, 0.5, 0.25, 0].map((t) => last.at(t)));
    return `M${pts.map(ptp).join(' L')} Z`;
  }
  /** Colour bands (short stretches along each radiole) and pinnules on both sides of it. */
  function serDetail(rs: readonly Radiole[], ts: readonly number[], pin: number): { bands: string; pinnules: string } {
    let bands = '';
    let pinnules = '';
    for (const r of rs) {
      const dir = (t: number): P => {
        const [x0, y0] = r.at(t - 0.01);
        const [x1, y1] = r.at(t + 0.01);
        const l = Math.hypot(x1 - x0, y1 - y0);
        return [(x1 - x0) / l, (y1 - y0) / l];
      };
      for (const t of ts) {
        const [x, y] = r.at(t);
        const [ux, uy] = dir(t);
        bands += `M${pt(x - ux * 0.3, y - uy * 0.3)} L${pt(x + ux * 0.3, y + uy * 0.3)} `;
      }
      for (let t = 0.16; t < 0.97; t += 0.065) {
        const [x, y] = r.at(t);
        const [ux, uy] = dir(t);
        for (const s of [1, -1]) {
          pinnules += `M${pt(x - uy * s * 0.7, y + ux * s * 0.7)} L${pt(x - uy * s * pin + ux * pin * 0.6, y + ux * s * pin + uy * pin * 0.6)} `;
        }
      }
    }
    return { bands: bands.trim(), pinnules: pinnules.trim() };
  }
  const SER_NEAR_DETAIL = serDetail(SER_NEAR, [0.36, 0.6, 0.84], 1.8);
  const SER_FAR_DETAIL = serDetail(SER_FAR, [0.48, 0.72], 1.5);

  // 8 · Osedax — red feathery palps sprouting from a bone on the deep-sea floor.
  function palp(bx: number, by: number, tx: number, ty: number, w: number): string {
    const len = Math.hypot(tx - bx, ty - by);
    const ux = (tx - bx) / len;
    const uy = (ty - by) / len;
    const at = (a: number, s: number): string => pt(bx + ux * a - uy * s, by + uy * a + ux * s);
    return `M${at(0, -0.7)} C${at(len * 0.45, -w)} ${at(len + w * 0.3, -w * 0.9)} ${at(len + w * 0.35, 0)} C${at(len + w * 0.3, w * 0.9)} ${at(len * 0.45, w)} ${at(0, 0.7)} Z`;
  }
  interface Osedax { readonly bx: number; readonly by: number; readonly top: P; readonly tips: readonly P[]; readonly w: number }
  const OSEDAX: readonly Osedax[] = [
    { bx: 16.2, by: 42.4, top: [15.6, 38.2], tips: [[8.6, 28.6], [12.8, 26.2], [18.2, 27.2]], w: 1.7 },
    { bx: 47.6, by: 40.8, top: [48, 37.4], tips: [[45.2, 31.2], [48.6, 30], [51.8, 31.8]], w: 1.3 },
    { bx: 38, by: 42, top: [38.8, 36.4], tips: [[33.4, 24.8], [37.2, 21.6], [42.6, 22], [46.4, 26.4]], w: 2 },
    { bx: 26.4, by: 41.8, top: [27, 34.8], tips: [[17.4, 18.4], [22.8, 13.4], [30.4, 13.6], [36, 19.4]], w: 2.6 },
  ];
  function palpLines(): { ribs: string; pinnules: string } {
    let ribs = '';
    let pinnules = '';
    for (const o of OSEDAX) {
      for (const [tx, ty] of o.tips) {
        const len = Math.hypot(tx - o.top[0], ty - o.top[1]);
        const ux = (tx - o.top[0]) / len;
        const uy = (ty - o.top[1]) / len;
        ribs += `M${pt(o.top[0] + ux * 1.5, o.top[1] + uy * 1.5)} L${pt(tx - ux * 0.8, ty - uy * 0.8)} `;
        for (let a = len * 0.3; a < len; a += 1.5) {
          const half = o.w * (0.55 + 0.4 * (a / len));
          for (const s of [1, -1]) {
            const x = o.top[0] + ux * a - uy * s * half;
            const y = o.top[1] + uy * a + ux * s * half;
            pinnules += `M${pt(x, y)} L${pt(x - uy * s * 1.1 + ux * 0.7, y + ux * s * 1.1 + uy * 0.7)} `;
          }
        }
      }
    }
    return { ribs: ribs.trim(), pinnules: pinnules.trim() };
  }
  const osedaxLines = palpLines();

  SPECIES_PORTRAITS[Life.Bilateria] = [
    // 1 · Urwürmer — Ikaria wariootia: a rice-grain body crawling out of its burrow trail.
    {
      name: 'Urwürmer', art: [
        fill('sandDark', 'M2 46 C14 39.6 50 39.6 62 44.6 C50 52.6 14 53.4 2 46 Z', 0.3),
        line('furDeep', 4.4, along(ikTrail, ikTrailW, 0, 1, 0), 0.25),
        line('sand', 0.8, along(ikTrail, ikTrailW, 0, 1, 1), 0.45),
        line('sand', 0.8, along(ikTrail, ikTrailW, 0, 1, -1), 0.35),
        line('furDeep', 0.7, [0.2, 0.36, 0.52, 0.68, 0.84].map((t) => ring(ikTrail, ikTrailW, t, 0.75, -0.75, -0.4)).join(' '), 0.3),
        dot('kelp', 24, 48.5, 0.7, 0.4),
        dot('kelp', 37, 47.6, 0.5, 0.4),
        dot('kelp', 49, 46.6, 0.7, 0.4),
        dot('furDeep', 30, 49.6, 0.5, 0.35),
        dot('furDeep', 57, 47.4, 0.5, 0.35),
        fill('ink', 'M18 43.8 C30 46.4 46 45.4 58 40 C52 45.4 32 48 18 43.8 Z', 0.25),
        fill('shellLight', tube(ikaria, ikariaW)),
        fill('blossom', strip(ikaria, ikariaW, 0.04, 0.97, 0.9, 0.2)),
        fill('skinPink', strip(ikaria, ikariaW, 0.05, 0.98, -0.95, -0.5)),
        fill('ink', strip(ikaria, ikariaW, 0.1, 1, -1, -0.15), 0.2),
        fill('ink', strip(ikaria, ikariaW, 0.33, 0.47, 0.95, -0.95), 0.12),
        line('shellDark', 2.4, along(ikaria, ikariaW, 0.05, 0.93, -0.12), 0.3),
        fill('furDark', [0.16, 0.26, 0.37, 0.5, 0.6, 0.71, 0.8].map((t, k) => {
          const [x, y] = side(ikaria, ikariaW, t, k % 2 ? -0.02 : -0.22);
          return artCircle(n1(x), n1(y), k % 3 ? 0.5 : 0.65);
        }).join(' '), 0.5),
        ...[0.13, 0.22, 0.31, 0.4, 0.49, 0.58, 0.67, 0.76, 0.85].map((t) => line('shell', 0.8, ring(ikaria, ikariaW, t, 0.85, -0.85, 0.2), 0.55)),
        line('shell', 0.7, along(ikaria, ikariaW, 0.1, 0.9, 0.5), 0.4),
        fill('shine', strip(ikaria, ikariaW, 0.62, 0.92, 0.82, 0.55), 0.55),
        fill('shine', strip(ikaria, ikariaW, 0.16, 0.34, 0.8, 0.6), 0.45),
        line('shell', 0.8, ring(ikaria, ikariaW, 0.965, 0.6, -0.6, -0.3), 0.6),
        oval('shellDark', 58.4, 33.2, 0.7, 1.1, 0.75),
        dot('shellDark', 13.9, 42.2, 0.6, 0.7),
      ],
    },
    // 2 · Kalkröhrchen — Cloudina: chalk tubes of stacked funnels, a pink soft tip in the tallest.
    {
      name: 'Kalkröhrchen', art: [
        ground('sandDark', 4, 60),
        ...cloudina([
          { xb: 17, yb: 57.4, xt: 15.6, yt: 50, wb: 1.9, wt: 4 },
          { xb: 15.4, yb: 50.8, xt: 13.2, yt: 43.4, wb: 2, wt: 4.2 },
          { xb: 12.9, yb: 44.2, xt: 10, yt: 36.8, wb: 2.1, wt: 4.4 },
        ], false, []),
        ...cloudina([
          { xb: 33, yb: 57.2, xt: 33.6, yt: 48.4, wb: 2.4, wt: 5.2 },
          { xb: 33.8, yb: 49.4, xt: 34.6, yt: 40.4, wb: 2.5, wt: 5.4 },
          { xb: 34.8, yb: 41.4, xt: 36, yt: 32.4, wb: 2.6, wt: 5.6 },
          { xb: 36.3, yb: 33.4, xt: 37.8, yt: 24.4, wb: 2.7, wt: 5.8 },
          { xb: 38.2, yb: 25.4, xt: 40, yt: 16.4, wb: 2.8, wt: 6 },
        ], true, [
          fill('blossom', 'M35.4 17 C35 13.6 37.2 11.4 40.2 11.4 C43.2 11.4 45.2 13.6 44.8 17 Z'),
          fill('white', 'M36.6 15.4 C36.8 13.6 38.2 12.4 40 12.3 C38.8 13.2 38 14.2 37.6 15.6 Z', 0.6),
          fill('shell', 'M42.2 12 C44 12.8 45 14.6 44.8 17 L42.4 17 C42.8 15.2 42.8 13.4 42.2 12 Z', 0.55),
          oval('shellDark', 40.6, 12.6, 1.3, 0.55, 0.7),
        ]),
      ],
    },
    // 3 · Priapswürmer — Ottoia: a ringed trunk rising from its burrow, the spiny proboscis on top.
    {
      name: 'Priapswürmer', art: [
        fill('sandDark', 'M2 58.4 C4 53.4 16 51.8 28 53.6 C40 55.2 54 54.6 62 57.6 C56 61.6 12 62.4 2 58.4 Z', 0.3),
        oval('ink', 13, 56.2, 7.2, 2.3, 0.45),
        fill('tan', tube(priTrunk, priTrunkW, false, true)),
        fill('furPale', strip(priTrunk, priTrunkW, 0.02, 0.96, 0.9, 0.25)),
        fill('sand', strip(priTrunk, priTrunkW, 0.04, 0.98, -0.95, -0.55)),
        fill('ink', strip(priTrunk, priTrunkW, 0.08, 1, -1, -0.1), 0.22),
        ...[0.1, 0.17, 0.24, 0.31, 0.38, 0.45, 0.52, 0.59, 0.66, 0.73, 0.8, 0.87].map((t) => line('fur', 0.8, ring(priTrunk, priTrunkW, t, 0.9, -0.9, 0.22), 0.55)),
        fill('sandDark', 'M4.4 56.6 C8 58.4 18 58.4 21.6 56.4 C21 59.6 6 60 4.4 56.6 Z', 0.45),
        line('sand', 0.9, 'M5.4 57.8 C9 59 17 59 20.6 57.6', 0.45),
        fill('furDark', edgeSpines(1)),
        fill('furDeep', edgeSpines(-1)),
        fill('tan', tube(priHead, priHeadW)),
        fill('furPale', strip(priHead, priHeadW, 0.05, 0.95, 0.9, 0.2)),
        fill('ink', strip(priHead, priHeadW, 0.05, 1, -1, -0.15), 0.22),
        line('furDark', 1.4, ring(priHead, priHeadW, 0.05, 0.95, -0.95, 0.2), 0.7),
        fill('furDark', scalids()),
        fill('furDeep', PRI_MOUTH.mouth),
        fill('cream', PRI_MOUTH.teeth),
        dot('kelp', 30, 57.4, 0.6, 0.4),
        dot('kelp', 44, 57.8, 0.7, 0.4),
      ],
    },
    // 4 · Pfeilwürmer — a chaetognath from above: glassy arrow, fins, grasping spines.
    {
      name: 'Pfeilwürmer', art: [
        dot('cyan', 30, 14, 0.8, 0.3),
        dot('cyan', 44, 50, 0.6, 0.3),
        dot('cyan', 14, 48, 0.7, 0.3),
        fill('fishLight', 'M10.4 32.8 C7.6 29 3.6 27.6 2 28.8 C1.4 31 1.4 34.6 2 36.8 C3.6 38 7.6 36.6 10.4 32.8 Z'),
        fill('fishLight', 'M11.6 31.8 C14 29.4 20 27.4 26 27.6 C28.4 27.7 30.2 28.8 31 30.4 L11.6 32.6 Z'),
        fill('sky', 'M11.6 33.8 C14 36.4 20 38.6 26 38.6 C28.4 38.5 30.2 37.4 31 35.8 L11.6 33.2 Z'),
        fill('fishLight', 'M33 30 C35 28 39.6 26.8 43.4 27.6 C44.8 27.9 45.6 28.8 45.8 29.8 L33 30.8 Z'),
        fill('sky', 'M33 34.8 C35 36.8 39.6 38 43.4 37.2 C44.8 36.9 45.6 36 45.8 35 L33 34 Z'),
        line('sky', 0.6, 'M9 32.4 L3.4 30 M9 32.8 L2.6 32.8 M9 33.2 L3.4 35.6 M15 31 L15.8 29 M18.4 30.6 L19.4 28.2 M21.8 30.4 L22.8 27.8 M25.2 30.2 L26 27.9 M28.4 30.2 L28.8 28.4 M36 29.8 L36.8 28 M39 29.6 L39.8 27.6 M42 29.6 L42.6 28', 0.55),
        line('blue', 0.6, 'M15 34.8 L15.8 36.8 M18.4 35.4 L19.4 37.8 M21.8 35.6 L22.8 38.2 M25.2 35.8 L26 38.1 M28.4 35.8 L28.8 37.6 M36 35.2 L36.8 37 M39 35.4 L39.8 37.4 M42 35.4 L42.6 36.8', 0.5),
        fill('cyan', tube(sag, sagW)),
        fill('white', strip(sag, sagW, 0.04, 0.96, 0.9, 0.25), 0.6),
        fill('ink', strip(sag, sagW, 0.04, 0.98, -1, -0.25), 0.2),
        line('tealDark', 1.2, along(sag, sagW, 0.33, 0.98, -0.05), 0.4),
        line('teal', 0.7, ring(sag, sagW, 0.32, 0.9, -0.9, 0.1), 0.55),
        fill('mint', strip(sag, sagW, 0.36, 0.64, 0.7, 0.2), 0.6),
        fill('mint', strip(sag, sagW, 0.36, 0.64, -0.7, -0.2), 0.6),
        fill('white', `${artCircle(13, 32.4, 0.5)} ${artCircle(16, 33.6, 0.5)} ${artCircle(19.4, 32.6, 0.5)}`, 0.5),
        oval('tealLight', 47.6, 31.4, 1.8, 0.9, 0.7),
        dot('cyan', 53.6, 31.6, 4.2),
        fill('white', 'M50 30.4 C50.6 28.6 52.4 27.4 54.4 27.6 C52.6 28.4 51.2 29.4 50.4 31 Z', 0.65),
        fill('ink', 'M57.6 32.6 C57 35 55 36.2 52.6 35.6 C54.6 35.2 56.4 34.2 57.6 32.6 Z', 0.2),
        ...sagHooks(false).map((d) => fill('white', d)),
        ...sagHooks(true).map((d) => fill('cream', d)),
        dot('ink', 53.4, 29.9, 1.1),
        dot('shine', 53.7, 29.6, 0.35, 0.9),
        dot('ink', 53.4, 33.3, 1.1),
        dot('shine', 53.7, 33, 0.35, 0.9),
        oval('tealDark', 57.3, 31.6, 0.6, 1.2, 0.6),
      ],
    },
    // 5 · Stummelfüßer — Hallucigenia: a lobopodian on stubby clawed legs under tall paired spines.
    {
      name: 'Stummelfüßer', art: [
        ground('sandDark', 4, 62),
        fill('greyDeep', HAL_X.map((x, k) => halSpine(x, HAL_H[k], 1.1, 1.8, 0.9)).join(' ')),
        line('rust', 1.5, halLegs(true).join(' ')),
        line('rust', 1, 'M48.6 42 Q49.4 46.4 51.2 49.8 M51.4 42.4 Q52.6 46.4 54.6 49'),
        fill('orange', tube(halTrunk, halTrunkW)),
        fill('orange', tube(halNeck, halNeckW, false, true)),
        fill('orangeLight', strip(halTrunk, halTrunkW, 0.08, 0.98, 0.9, 0.2)),
        fill('orangeLight', strip(halNeck, halNeckW, 0.02, 0.9, 0.85, 0.2)),
        fill('chitinLight', strip(halTrunk, halTrunkW, 0.12, 0.98, -0.95, -0.5)),
        fill('ink', strip(halTrunk, halTrunkW, 0.05, 1, -1, -0.1), 0.22),
        line('rust', 0.75, [0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.92].map((t) => ring(halTrunk, halTrunkW, t, 0.85, -0.85, 0.15)).join(' '), 0.55),
        ...HAL_X.map((x, k) => fill('black', halSpine(x, HAL_H[k], 1.3, 0, 1))),
        line('greyDark', 0.7, halSpineLights(), 0.6),
        ...halLegs(false).map((d) => line('orange', 2, d)),
        line('rust', 0.7, halLegRings(), 0.55),
        line('furDeep', 0.7, halClaws()),
        line('orange', 1.1, 'M46.8 42.4 Q47 47 48.4 51'),
        line('orange', 1.1, 'M49.6 42.4 Q50.4 47 52.2 50.6'),
        line('orange', 1.1, 'M52.4 43 Q53.4 47.4 55.6 50'),
        fill('orange', 'M54 42.2 C55.4 40.8 58.4 40.8 60.4 42.2 C62 43.4 61.8 45.4 60 46.2 C58 47 55.2 46.6 54.2 45.4 Z'),
        fill('orangeLight', 'M54.8 42.6 C56 41.6 58.2 41.4 59.8 42.2 C58 42.2 56.4 42.6 55.2 43.6 Z', 0.85),
        fill('ink', 'M61.4 44.6 C60.8 46 58.6 46.8 56.2 46.4 C58.4 46.2 60.2 45.6 61.4 44.6 Z', 0.22),
        dot('ink', 58.2, 43, 1.1),
        dot('shine', 58.5, 42.7, 0.35, 0.9),
        dot('rustDark', 61.2, 44.4, 0.6),
      ],
    },
    // 6 · Ringelwürmer — a polychaete ragworm from above: segments, parapodia, jaws and four eyes.
    {
      name: 'Ringelwürmer', art: [
        fill('sandDark', 'M3 38 C8 26 50 20 62 30 C60 44 20 52 3 38 Z', 0.22),
        fill('rust', ragDown.lobes),
        line('yellowPale', 0.6, ragDown.bristles, 0.4),
        fill('coral', ragUp.lobes),
        line('yellowPale', 0.6, ragUp.bristles, 0.45),
        line('red', 0.7, [1, -1].map((s) => `M${ptp(ragHead(0.2, s * 2.8))} Q${ptp(ragHead(-1.6, s * 5.8))} ${ptp(ragHead(-4.2, s * 8.4))} M${ptp(ragHead(-0.8, s * 3))} Q${ptp(ragHead(-3, s * 4.8))} ${ptp(ragHead(-6.2, s * 6))}`).join(' '), 0.45),
        fill('red', tube(rag, ragW)),
        fill('coral', strip(rag, ragW, 0.04, 0.99, 0.9, 0.2)),
        line('gold', 0.8, along(rag, ragW, 0.1, 0.95, 0.5), 0.5),
        fill('ink', strip(rag, ragW, 0.03, 1, -1, -0.2), 0.22),
        ...RAG_SEGS.slice(0, -1).map((t, k) => line('rustDark', 0.75, ring(rag, ragW, (t + RAG_SEGS[k + 1]) / 2, 0.88, -0.88, 0), 0.55)),
        line('rustDark', 0.9, along(rag, ragW, 0.03, 0.99, 0), 0.4),
        fill('red', `M${ptp(ragHead(-0.6, 3.2))} C${ptp(ragHead(2.8, 4))} ${ptp(ragHead(6.2, 3))} ${ptp(ragHead(6.6, 0))} C${ptp(ragHead(6.2, -3))} ${ptp(ragHead(2.8, -4))} ${ptp(ragHead(-0.6, -3.2))} Z`),
        fill('coral', `M${ptp(ragHead(0, 2.8))} C${ptp(ragHead(2.6, 3.6))} ${ptp(ragHead(5, 2.8))} ${ptp(ragHead(5.8, 1))} C${ptp(ragHead(4, 2))} ${ptp(ragHead(2, 2.2))} ${ptp(ragHead(0, 2.8))} Z`),
        fill('ink', `M${ptp(ragHead(0, -2.8))} C${ptp(ragHead(2.6, -3.6))} ${ptp(ragHead(5, -2.8))} ${ptp(ragHead(5.8, -1))} C${ptp(ragHead(4, -2))} ${ptp(ragHead(2, -2.2))} ${ptp(ragHead(0, -2.8))} Z`, 0.22),
        ...[1, -1].map((s) => fill(s > 0 ? 'coral' : 'rust', `M${ptp(ragHead(4.4, s * 0.6))} C${ptp(ragHead(6.4, s * 0.8))} ${ptp(ragHead(8.6, s * 1.4))} ${ptp(ragHead(8.6, s * 2.4))} C${ptp(ragHead(8.6, s * 3.4))} ${ptp(ragHead(6.6, s * 3.6))} ${ptp(ragHead(4.8, s * 3))} Z`)),
        line('red', 0.7, `M${ptp(ragHead(6.2, 0.5))} L${ptp(ragHead(9.4, 0.9))} M${ptp(ragHead(6.2, -0.5))} L${ptp(ragHead(9.4, -0.9))}`, 0.45),
        dot('ink', ragHead(1.6, 1.2)[0], ragHead(1.6, 1.2)[1], 0.7),
        dot('ink', ragHead(1.6, -1.2)[0], ragHead(1.6, -1.2)[1], 0.7),
        dot('ink', ragHead(3.4, 1.6)[0], ragHead(3.4, 1.6)[1], 1.1),
        dot('ink', ragHead(3.4, -1.6)[0], ragHead(3.4, -1.6)[1], 1.1),
        dot('shine', ragHead(3.7, 1.9)[0], ragHead(3.7, 1.9)[1], 0.35, 0.9),
        dot('shine', ragHead(3.7, -1.3)[0], ragHead(3.7, -1.3)[1], 0.35, 0.9),
      ],
    },
    // 7 · Röhrenwürmer — a serpulid: chalk tube on a rock, banded feather crown, funnel-shaped lid.
    {
      name: 'Röhrenwürmer', art: [
        fill('greyDark', 'M2 62 C1.6 55 5.4 49.6 12.6 48 C22 46 38 46.4 49 48.2 C56.6 49.6 61.6 54 62 62 Z'),
        fill('grey', 'M4.4 53.2 C7.4 49.8 13.4 48.6 22 47.8 C32 47.2 44 47.6 52 49.4 C44 49 32 49 22 49.8 C14.6 50.4 9 51.4 4.4 53.2 Z'),
        fill('ink', 'M30 62 C40 59 52 57.4 61.8 55.8 L62 62 Z', 0.22),
        line('greyDeep', 0.8, 'M18 52.6 L22 56 L21 60.6 M44 51.8 L41.6 55.4 L44.4 59.4', 0.55),
        fill('white', tube(serTube, serTubeW, true, false)),
        fill('shine', strip(serTube, serTubeW, 0.04, 0.98, 0.9, 0.3), 0.75),
        fill('greyLight', strip(serTube, serTubeW, 0.04, 1, -0.95, -0.3)),
        fill('ink', strip(serTube, serTubeW, 0.1, 1, -1, -0.5), 0.18),
        line('greyLight', 0.8, along(serTube, serTubeW, 0.08, 0.95, 0.35), 0.6),
        line('grey', 0.75, [0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.92].map((t) => ring(serTube, serTubeW, t, 0.9, -0.9, 0.3)).join(' '), 0.55),
        oval('white', 35.4, 30.2, 3.9, 1.5),
        oval('greyDeep', 35.4, 30.4, 2.9, 0.9),
        fill('red', serHaze(), 0.28),
        line('rust', 0.6, SER_FAR_DETAIL.pinnules, 0.4),
        line('rust', 1.3, SER_FAR.map((r) => r.d).join(' ')),
        line('creamDark', 1.2, SER_FAR_DETAIL.bands),
        line('shellLight', 0.6, SER_NEAR_DETAIL.pinnules, 0.45),
        ...SER_NEAR.map((r, k) => line(k < 3 ? 'coral' : 'red', 1.7, r.d)),
        line('white', 1.5, SER_NEAR_DETAIL.bands),
        fill('red', 'M31.4 31.2 C32.4 28 38.2 28 39.4 31.2 C37.4 30.2 33.4 30.2 31.4 31.2 Z'),
        line('skinPink', 1.2, 'M36.8 29.2 Q45 27.6 50.4 22.6'),
        fill('red', 'M50.4 22.6 L50.7 19.1 L53.9 22.6 Z'),
        fill('coral', 'M50.7 19.1 A2.4 1 47.2 1 0 53.9 22.6 A2.4 1 47.2 1 0 50.7 19.1 Z'),
        line('rust', 0.6, 'M51.3 19.7 L53.3 22 M50.9 20.6 L53.6 21.1 M51.6 19.4 L52.9 22.2', 0.55),
      ],
    },
    // 8 · Knochenfresserwürmer — Osedax: red feathery palps sprouting from a bone on the deep-sea floor.
    {
      name: 'Knochenfresserwürmer', art: [
        ground('greyDeep', 2, 62),
        fill('bone', 'M5 45.4 C4.4 41 7.6 38.4 11.2 39.4 C13.4 40 14.4 41.8 16.6 42 C19 42.2 20.2 40.8 22.6 41.2 L42 41.6 C45.6 41.6 48 39.4 52 38.4 C57.4 37.2 61.6 40.8 61.4 45.6 C61.2 50.2 57.2 52.8 52.8 51.6 C49.4 50.8 46.4 49.8 42 50 L22 50.6 C19.6 50.8 18.2 52.6 15.6 53.4 C12.8 54.2 10.6 53.2 9.2 52 C6.2 51.6 4.4 49.6 5 45.4 Z'),
        fill('cream', 'M6.2 43.6 C6.6 40.6 9.4 39.6 11.6 40.6 C13.6 41.6 14.6 43.2 16.8 43.2 C19.2 43.2 20.4 42 22.6 42.4 L42 42.8 C46 42.8 48.4 40.8 52.2 39.8 C55.4 39 58.4 39.8 60 42 C57.4 40.8 54.8 41 52.6 41.8 C49 43 46.6 44.4 42 44.4 L22.6 44.6 C20.2 44.6 18.8 45 16.6 44.8 C14 44.6 12.6 42.8 10.8 42.4 C9 42 7.4 42.6 6.2 43.6 Z'),
        fill('boneDark', 'M6 49.4 C7.4 51.4 9.2 52 10.6 51.8 C12.6 52.4 14.4 52 16 51.4 C18.4 50.4 20 49.2 22 49.2 L42 48.6 C46.4 48.4 49.6 49.6 52.8 50.2 C56.4 50.8 59.4 49 60.8 46.8 C60.6 50.6 57 52.8 52.8 51.6 C49.4 50.8 46.4 49.8 42 50 L22 50.6 C19.6 50.8 18.2 52.6 15.6 53.4 C12.8 54.2 10.6 53.2 9.2 52 C7.6 51.6 6.6 50.6 6 49.4 Z'),
        fill('ink', 'M22 50.6 L42 50 C46.4 49.8 49.4 50.8 52.8 51.6 C56.6 52.6 59.8 50.8 61 48.2 C60 51.8 56.6 53.4 52.8 52.6 C49.4 51.8 46.4 50.8 42 51 L22 51.6 Z', 0.2),
        line('boneDark', 0.8, 'M5.6 47 C7.2 46.4 8.6 46.8 9.8 47.8', 0.6),
        line('boneDark', 0.7, 'M24 46.4 L28 46.8 L31 46.2 M50.4 45.6 L53.6 47.2 M56 42.8 C57.4 43.6 58.4 45 58.6 46.6', 0.55),
        fill('boneDark', `${artCircle(9.4, 44.4, 0.6)} ${artCircle(55.4, 45.4, 0.7)} ${artCircle(33, 47.6, 0.5)} ${artCircle(42.4, 47, 0.6)} ${artCircle(57.4, 49, 0.5)} ${artCircle(13, 49.6, 0.5)}`, 0.6),
        ...OSEDAX.map((o) => oval('furDeep', o.bx + 0.2, o.by + 0.6, o.w * 1.1, o.w * 0.45, 0.45)),
        ...OSEDAX.flatMap((o) => [line('skinPink', o.w * 1.1, `M${pt(o.bx, o.by)} Q${pt(o.bx + 0.2, (o.by + o.top[1]) / 2)} ${ptp(o.top)}`)]),
        line('blossom', 0.7, OSEDAX.map((o) => `M${pt(o.bx - o.w * 0.25, o.by - 0.4)} L${pt(o.top[0] - o.w * 0.25, o.top[1] + 0.8)}`).join(' '), 0.6),
        line('red', 0.6, osedaxLines.pinnules, 0.45),
        ...OSEDAX.flatMap((o) => o.tips.map(([tx, ty], k) => fill(k === 0 || k === o.tips.length - 1 ? 'rust' : 'red', palp(o.top[0], o.top[1], tx, ty, o.w)))),
        line('rustDark', 0.7, osedaxLines.ribs, 0.55),
      ],
    },
  ];
}
