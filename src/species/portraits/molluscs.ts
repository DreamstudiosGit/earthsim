/* =============================================================================
 * SimEarth 2.0 — species portraits: Weichtiere (molluscs)
 * -----------------------------------------------------------------------------
 * Molluscs in the style of the reference set
 * (docs/oekosystem-2026-10/portraitstil.md): crawlers on the sea floor, the
 * chiton from above on its rock, the cephalopods swimming mid-water facing
 * right. Shells carry the structure (growth lines, ribs, plates, colour
 * bands); soft parts are flat shapes with a light and a shaded side.
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
  const circles = (r: number, ps: readonly P[]): string => ps.map(([x, y]) => artCircle(n1(x), n1(y), r)).join(' ');

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
  const poly = (p: readonly P[]): string => `M${p.map(ptp).join(' L')} Z`;
  /** Turns a path of point pairs (no arcs) by `deg` about (cx, cy) and moves that centre to (ox, oy). */
  function turn(d: string, cx: number, cy: number, deg: number, ox: number, oy: number): string {
    const c = Math.cos((deg * Math.PI) / 180);
    const s = Math.sin((deg * Math.PI) / 180);
    const tok = d.match(/[A-Za-z]|-?\d+(?:\.\d+)?/g) || [];
    const out: string[] = [];
    for (let k = 0; k < tok.length; k++) {
      if (/[A-Za-z]/.test(tok[k])) {
        out.push(tok[k]);
        continue;
      }
      const x = parseFloat(tok[k]) - cx;
      const y = parseFloat(tok[++k]) - cy;
      out.push(pt(ox + x * c - y * s, oy + x * s + y * c));
    }
    return out.join(' ');
  }

  /** A point of a centre line and its unit normal, which points up for a body heading right. */
  interface Station { readonly x: number; readonly y: number; readonly nx: number; readonly ny: number }
  type Spine = (t: number) => Station;
  type Width = (t: number) => number;
  function bezSpine(c: readonly number[]): Spine {
    const at = (t: number): P => {
      const u = 1 - t;
      return [
        u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6],
        u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7],
      ];
    };
    return (t) => {
      const [x, y] = at(t);
      const [xa, ya] = at(t - 0.001);
      const [xb, yb] = at(t + 0.001);
      const l = Math.hypot(xb - xa, yb - ya);
      return { x, y, nx: (yb - ya) / l, ny: -(xb - xa) / l };
    };
  }
  function side(s: Spine, w: Width, t: number, f: number): P {
    const a = s(t);
    const h = (w(t) / 2) * f;
    return [a.x + a.nx * h, a.y + a.ny * h];
  }
  /** An arm tapering along its centre line, round at the base and the tip. */
  function tube(s: Spine, w: Width, n = 12): string {
    const up: P[] = [];
    const down: P[] = [];
    for (let k = 0; k <= n; k++) {
      up.push(side(s, w, k / n, 1));
      down.push(side(s, w, k / n, -1));
    }
    const h0 = n1(w(0) / 2);
    const h1 = n1(w(1) / 2);
    return `${smooth(up)} A${h1} ${h1} 0 0 1 ${ptp(down[n])} ${smooth(down.slice().reverse(), 'L')} A${h0} ${h0} 0 0 1 ${ptp(up[0])} Z`;
  }
  /** A crescent along a body from `outer` towards `inner` (in half-widths), pointed at both ends. */
  function strip(s: Spine, w: Width, t0: number, t1: number, outer: number, inner: number, n = 10): string {
    const a: P[] = [];
    const b: P[] = [];
    for (let k = 0; k <= n; k++) {
      const t = t0 + ((t1 - t0) * k) / n;
      a.push(side(s, w, t, outer));
      b.push(side(s, w, t, outer + (inner - outer) * Math.sin((Math.PI * k) / n)));
    }
    return `${smooth(a)} ${smooth(b.reverse(), 'L')} Z`;
  }

  // 2 · Bivalve — the map icon's valve outline, scaled up: umbo first, then cubic control points.
  const CLAM: readonly P[] = [
    [14.5, 6.6], [11, 7.9], [6.5, 10.4], [4.8, 13.8], [3.2, 17.2], [4.6, 20.6], [8.5, 22.3],
    [12.5, 24], [19.5, 24], [24, 22.3], [28, 20.6], [29.5, 17.6], [28.8, 14.7],
    [28, 11.7], [24.5, 9.6], [20, 8.4], [17.5, 7.9], [16, 7.3], [14.5, 6.6],
  ].map(([x, y]) => [1.9 * x + 1, 1.9 * y + 4] as const);
  /** The clam is drawn level, then tilted foot-down as it digs. */
  const clamTurn = (d: string): string => turn(d, 32, 33, 12, 32, 30);
  const CLAM_UMBO = turn('M29.6 19.4', 32, 33, 12, 32, 30).split(' ').slice(1).map(Number);
  /** The valve shrunk by `s` towards the umbo, as growth lines are: closed, or only its free margin. */
  function clam(s: number, ring: boolean, dx = 0, dy = 0): string {
    const [ux, uy] = CLAM[0];
    const p = CLAM.map(([x, y]) => pt(ux + (x - ux) * s + dx, uy + (y - uy) * s + dy));
    const pts = ring ? p.slice(3, 13) : p;
    let d = `M${pts[0]}`;
    for (let k = 1; k + 2 < pts.length; k += 3) d += ` C${pts[k]} ${pts[k + 1]} ${pts[k + 2]}`;
    return ring ? d : `${d} Z`;
  }

  // 3 · Chiton — from above, head to the upper right: eight plates overlapping like roof tiles
  // (each laps over the one behind it), inside a granular girdle that bulges beside every plate.
  const CH = frame(32, 32.5, -10);
  const CH_RU = 22.6;
  const CH_W = (2 * CH_RU) / 8;
  const chAt = (u: number, v: number): string => ptp(CH(u, v));
  /** Half width of the plate field: a blunt oblong, so the animal does not taper like a leaf. */
  const chHv = (u: number): number => 11 * Math.max(0, 1 - Math.abs(u / CH_RU) ** 2.6) ** (1 / 2.6);
  /** Rear edge of plate k (0 = tail, 7 = head). */
  const chB = (k: number): number => -CH_RU + k * CH_W;
  /** How far plate k reaches sideways at u: tucked in at its corners, so a notch shows at every suture. */
  function chSide(k: number, u: number): number {
    const s = (u - chB(k)) / CH_W;
    const f = (k === 0 && s < 0.45) || (k === 7 && s > 0.45) ? 1 : 0.84 + 0.16 * Math.sin(Math.PI * Math.min(1, Math.max(0, s / 0.92)));
    return chHv(u) * f;
  }
  /** Corner half width of the arched rear edge of plate k. */
  const chCorner = (k: number): number => chSide(k, chB(k) + 0.8);
  /** The rear edge of plate k with its beak, from the upper to the lower corner (or back), shifted back by `du`. */
  function chRear(k: number, du = 0, shrink = 1, back = false): string {
    const u = chB(k) - du;
    const c = chCorner(k) * shrink;
    const ps: [number, number][] = [[u + 0.8, c], [u - 0.2, c * 0.5], [u - 0.5, 1.4], [u - 1.9, 0], [u - 0.5, -1.4], [u - 0.2, -c * 0.5], [u + 0.8, -c]];
    const q = back ? ps.reverse() : ps;
    return `${back ? 'L' : 'M'}${chAt(...q[0])} Q${chAt(...q[1])} ${chAt(...q[2])} L${chAt(...q[3])} L${chAt(...q[4])} Q${chAt(...q[5])} ${chAt(...q[6])}`;
  }
  function chPlate(k: number): string {
    const u0 = k === 0 ? -CH_RU : chB(k) + 0.8;
    const u1 = k === 7 ? CH_RU : chB(k) + CH_W + 1.6;
    const n = 10;
    const lower: P[] = [];
    const upper: P[] = [];
    for (let j = 0; j <= n; j++) {
      // Denser samples towards a rounded end cap.
      const t = k === 0 ? 1 - Math.cos((Math.PI / 2) * (j / n)) : k === 7 ? Math.sin((Math.PI / 2) * (j / n)) : j / n;
      const u = u0 + (u1 - u0) * t;
      lower.push(CH(u, -chSide(k, u)));
      upper.push(CH(u, chSide(k, u)));
    }
    const rear = k === 0 ? `M${ptp(lower[0])}` : chRear(k);
    return `${rear} ${smooth(lower, 'L')} ${smooth(upper.slice().reverse(), 'L')} Z`;
  }
  /** A band just in front of a suture (k = 1..7): the rising tile behind it lies in shade there. */
  const chShade = (k: number): string =>
    `${chRear(k, 2.2, 0.94)} ${chRear(k, 0, 0.94, true)} Z`;
  /** The lit rim along the rear edge of plate k. */
  const chRim = (k: number): string =>
    `${chRear(k)} ${chRear(k, -1.2, 0.9, true)} Z`;
  /** The girdle rim: a blunt oval of radii a, b, sampled at n points from angle 0. */
  function chOval(a: number, b: number, n: number): P[] {
    const ps: P[] = [];
    for (let j = 0; j < n; j++) {
      const t = (j / n) * 2 * Math.PI;
      const c = Math.cos(t);
      const s = Math.sin(t);
      ps.push([a * Math.sign(c) * Math.abs(c) ** (2 / 2.4), b * Math.sign(s) * Math.abs(s) ** (2 / 2.4)]);
    }
    return ps;
  }
  /** The girdle outline: notched at every suture, with a bead of height `bump` between every two rim points. */
  function chBeads(bump: number): string {
    const ps = chOval(27.4, 12.4, 56).map(([u, v]): P => {
      const fade = Math.max(0, Math.min(1, (CH_RU - 2 - Math.abs(u)) / 4));
      return [u, v + Math.sign(v) * fade * 2.8 * Math.abs(Math.sin((Math.PI * (u - chB(0))) / CH_W))];
    });
    let d = `M${ptp(CH(ps[0][0], ps[0][1]))}`;
    for (let j = 0; j < ps.length; j++) {
      const [u0, v0] = ps[j];
      const [u1, v1] = ps[(j + 1) % ps.length];
      const l = Math.hypot(u1 - u0, v1 - v0);
      d += ` Q${chAt((u0 + u1) / 2 + ((v1 - v0) / l) * bump * 2, (v0 + v1) / 2 - ((u1 - u0) / l) * bump * 2)} ${chAt(u1, v1)}`;
    }
    return `${d} Z`;
  }
  /** Part of the girdle ring between the angles t0 and t1, from the rim inwards to the plates. */
  function chRing(t0: number, t1: number): string {
    const out: P[] = [];
    const inner: P[] = [];
    for (let j = 0; j <= 12; j++) {
      const t = t0 + ((t1 - t0) * j) / 12;
      const c = Math.cos(t);
      const s = Math.sin(t);
      const u = 26.4 * Math.sign(c) * Math.abs(c) ** (2 / 2.4);
      out.push(CH(u, 11.9 * Math.sign(s) * Math.abs(s) ** (2 / 2.4)));
      inner.push(CH(u * 0.84, Math.sign(s) * chHv(u * 0.84) * 0.9));
    }
    return `${smooth(out)} ${smooth(inner.reverse(), 'L')} Z`;
  }
  /** Points in the middle of the girdle ring, every `step` radians from `t0`. */
  const chMid = (t0: number, step: number, scale: number): P[] => {
    const ps: P[] = [];
    for (let t = t0; t < t0 + 2 * Math.PI - 0.01; t += step) {
      const c = Math.cos(t);
      const s = Math.sin(t);
      ps.push(CH(24.8 * scale * Math.sign(c) * Math.abs(c) ** (2 / 2.4), 12.2 * scale * Math.sign(s) * Math.abs(s) ** (2 / 2.4)));
    }
    return ps;
  };

  // 4 · Orthocerid — a straight cone shell rising slightly to the right.
  const OR = frame(30, 33, -6);
  const orR = (u: number): number => (7.2 * (u + 28)) / 40;
  const orBand = (a: number, b: number): string => poly([OR(a, orR(a)), OR(b, orR(b)), OR(b, -orR(b)), OR(a, -orR(a))]);
  /** A cephalopod arm from the head at (x0, y0) to its tip, bowed by (bx, by), curling at the tip. */
  const arm = (x0: number, y0: number, x1: number, y1: number, bx: number, by: number, curl: number): string =>
    `M${pt(x0, y0)} Q${pt((x0 + x1) / 2 + bx, (y0 + y1) / 2 + by)} ${pt(x1, y1)} Q${pt(x1 + 1.6, y1 + curl * 0.4)} ${pt(x1 + 0.8, y1 + curl)}`;

  // 5 · Ammonite — a ribbed spiral shell, the opening to the right.
  const AM_C: P = [26, 30.6];
  const AM_R = 21.6;
  const am = (r: number, a: number): P => [AM_C[0] + r * Math.cos(a), AM_C[1] + r * Math.sin(a)];
  const AM_AP = 0.18;
  function amSpiral(): string {
    const pts: string[] = [];
    const turns = 2.4;
    const n = Math.round(turns * 24);
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const a = AM_AP - (1 - t) * turns * 2 * Math.PI;
      const r = 1 + 11.4 * Math.pow(t, 1.15);
      const [x, y] = am(r, a);
      pts.push(`${k ? 'L' : 'M'}${pt(x, y)}`);
    }
    return pts.join(' ');
  }
  function amRibs(r0: number, r1: number, n: number, skip: number, sway: number): string {
    let d = '';
    for (let k = 0; k < n; k++) {
      const a = AM_AP + skip + ((2 * Math.PI - 2 * skip) * k) / (n - 1);
      d += `M${ptp(am(r0, a))} Q${ptp(am((r0 + r1) / 2, a - sway))} ${ptp(am(r1, a + sway * 0.4))} `;
    }
    return d.trim();
  }

  // 7 · Octopus — tapering arms with suckers along their lower edge.
  interface Arm { readonly s: Spine; readonly w: Width; readonly curl: string }
  const octArm = (c: readonly number[], w0: number, w1: number, curl: string): Arm => ({ s: bezSpine(c), w: (t) => w0 + (w1 - w0) * t, curl });
  const OCT_FAR: readonly Arm[] = [
    octArm([35, 36, 44, 35, 51, 30.6, 55, 24.6], 3.6, 0.9, 'Q56.6 21.4 54.4 20.6'),
    octArm([26.6, 39, 20, 41, 13, 45, 8.6, 49], 3.4, 0.9, 'Q6.4 51.6 7.6 53'),
  ];
  const OCT_NEAR: readonly Arm[] = [
    octArm([36.6, 39, 44, 45, 53, 49, 58, 42.6], 4.4, 1, 'Q60.8 39.6 58.6 37.8'),
    octArm([33.6, 40.6, 38, 50, 46, 56, 55.6, 56.2], 4.4, 1, 'Q59.6 56 60 53.4'),
    octArm([29.6, 40.6, 29, 48, 26, 55, 18, 56.4], 4.2, 1, 'Q14 56.6 13.6 54.2'),
    octArm([26, 38.4, 20, 44, 13, 52, 5, 54.6], 3.8, 0.9, 'Q2.4 53.6 3.4 51.2'),
  ];
  const octTip = (a: Arm): string => {
    const e = a.s(1);
    return `M${pt(e.x, e.y)} ${a.curl}`;
  };
  function octSuckers(a: Arm): P[] {
    const out: P[] = [];
    for (let t = 0.12; t < 0.9; t += 0.09) out.push(side(a.s, a.w, t, -0.62));
    return out;
  }

  // 8 · Cone snail — drawn level, then tipped so the aperture along its underside rests flat on the foot.
  const coneTurn = (d: string): string => turn(d, 27.5, 32, 19, 27.5, 38);
  const coneTop = (x: number): number => 17 + ((x - 15.4) * (28.4 - 17)) / 33;
  const coneBot = (x: number): number => 47 - ((x - 15.4) * (47 - 35.6)) / 33;
  /** Sizes of the tent marks, irregular like the real pattern. */
  const CONE_TENT = [1, 0.6, 1.3, 0.8, 0.5, 1.2, 0.9, 0.7, 1.1];
  function coneTents(f: number, shift: number): string {
    let d = '';
    CONE_TENT.forEach((k, i) => {
      const x = 18 + i * 3.3 + shift;
      const top = coneTop(x);
      const y = top + (coneBot(x) - top) * f;
      const s = (0.9 + 1.3 * ((coneBot(x) - top) / 30)) * k;
      d += `M${pt(x - s, y + s * 0.7)} L${pt(x, y - s)} L${pt(x + s, y + s * 0.7)} Z `;
    });
    return coneTurn(d.trim());
  }
  const coneLine = (f: number): string => {
    const a = (x: number): number => coneTop(x) + (coneBot(x) - coneTop(x)) * f;
    return `M${pt(16.4, a(16.4))} L${pt(47.6, a(47.6))}`;
  };

  SPECIES_PORTRAITS[Life.Mollusc] = [
    // 1 · Urschnecken — a helcionellid: a cap shell hooked forward over the head, on a broad creeping foot.
    {
      name: 'Urschnecken', art: [
        ground('sandDark', 4, 62),
        line('white', 1.6, 'M3 57.6 C6 57.2 8.6 57.6 10.6 57.3', 0.25),
        dot('kelp', 22, 58.6, 0.5, 0.4),
        dot('kelp', 40, 58.8, 0.6, 0.4),
        dot('furDeep', 52, 59, 0.5, 0.35),
        line('skinDark', 1.3, 'M57.8 43 Q59.6 39.4 62.2 37.4'),
        fill('grey', 'M8 55.2 C8 51.4 11 49 18 48.6 L44 48.2 C48 48 51.4 46 53.6 43.6 C55.8 41.4 59.6 41.8 60.6 44.6 C61.6 47.6 60.4 51.6 58 53.8 C55.6 56 51 57 46 57.2 L13 57.4 C10 57.4 8 56.8 8 55.2 Z'),
        fill('skinPink', 'M8 55.2 C8 51.4 11 49 18 48.6 L44 48.2 C48 48 51.4 46 53.6 43.6 C55.8 41.4 59.6 41.8 60.6 44.6 C61.6 47.6 60.4 51.6 58 53.8 C55.6 56 51 57 46 57.2 L13 57.4 C10 57.4 8 56.8 8 55.2 Z', 0.55),
        fill('blossom', 'M54.2 44.6 C55.8 42.6 58.8 42.4 59.8 44.4 C58.2 44.2 56.4 44.6 55 45.8 Z', 0.8),
        fill('ink', 'M9 55.4 C14 56 40 56 47 55.6 C52 55.4 56.4 53.8 59.4 50.6 C58.6 54 53.6 56.8 46 57.2 L13 57.4 C10.4 57.4 9 56.8 9 55.4 Z', 0.22),
        line('skinDark', 0.7, 'M15 55.4 L15.8 56.9 M21 55.6 L21.8 57 M27 55.7 L27.8 57.1 M33 55.7 L33.8 57.1 M39 55.6 L39.8 57 M45 55.4 L45.6 56.8 M51 54.6 L51.4 56', 0.55),
        fill('cream', 'M11.6 50.4 C11 41 15 32 22.6 26.4 C29 21.6 38 19.6 44.6 21.4 C49.4 22.8 51.6 26 50.6 28.8 C49.6 27.4 47.6 26.8 45.8 27.4 C45.4 33 46.4 41 48.8 49.8 C36 51.2 22 51.2 11.6 50.4 Z'),
        fill('white', 'M14.2 46 C13.8 39 16.6 32.4 22.6 28 C28 24 35.6 21.8 42.6 22 C35.6 23.6 29 26.4 24.4 30.4 C19.8 34.4 17.2 40 16.8 46.4 Z', 0.9),
        fill('creamDark', 'M37 21.4 C40.6 20.6 43 20.8 44.6 21.4 C49.4 22.8 51.6 26 50.6 28.8 C49.6 27.4 47.6 26.8 45.8 27.4 C45.4 33 46.4 41 48.8 49.8 C44.6 50.4 41.4 50.6 38.4 50.8 C39.4 40 39.6 29 37 21.4 Z'),
        fill('ink', 'M45.8 27.4 C45.4 33 46.4 41 48.8 49.8 C46.8 50 44.6 50.2 42.6 50.4 C42.2 40 42.8 32 45.8 27.4 Z', 0.18),
        line('tan', 0.8, 'M12 45 C22 46 36 45.8 47.4 44.6', 0.6),
        line('tan', 0.8, 'M12.6 39.4 C22 40.2 34 40 46.4 38.8', 0.6),
        line('tan', 0.8, 'M14.4 33.8 C22.6 34.6 33.6 34.4 45.8 33', 0.6),
        line('tan', 0.8, 'M18.6 28.8 C25 29.4 34 29.2 45.6 28', 0.6),
        line('tan', 0.8, 'M26 24.4 C31.6 24.6 37.6 24.2 44.8 23.2', 0.6),
        fill('shine', 'M41.6 21.6 C44.8 21 48 22 49.8 24.2 C47.4 23 44.8 22.2 41.6 21.6 Z', 0.6),
        fill('skinPink', 'M12 51 C22 51.8 38 51.6 48.6 50.6 L48.4 49.4 C38 50.4 22 50.6 12 49.8 Z'),
        fill('blossom', 'M12 49.6 C24 50.4 40 50.2 50.4 49.4 C52.2 49.2 53.6 47.6 54.8 46.2 C53.6 48.4 52 50.2 49.6 50.6 C40 51.4 24 51.4 12 50.6 Z', 0.6),
        line('skinDark', 0.75, 'M13 50.8 C24 51.6 38 51.4 48 50.6', 0.55),
        line('skinPink', 1.6, 'M56.4 43.6 Q57 38.6 59.6 35.4'),
        fill('blossom', `${artCircle(59.6, 35.4, 0.7)} ${artCircle(62.2, 37.4, 0.6)}`, 0.85),
        dot('ink', 57.2, 44.4, 1.1),
        dot('shine', 57.5, 44.1, 0.35, 0.9),
        line('skinDark', 0.8, 'M59.4 49 Q60.4 48.6 60.8 47.6', 0.7),
      ],
    },
    // 2 · Muscheln — an early bivalve from the side: growth rings, the valves agape, the foot digging into the sand.
    {
      name: 'Muscheln', art: [
        fill('sandDark', 'M2 54 C8 48.4 24 47 36 48.4 C48 49.8 58 49.4 62 52 C60 58.6 50 61 32 61 C14 61 4 59 2 54 Z', 0.3),
        dot('kelp', 12, 56, 0.6, 0.4),
        dot('kelp', 30, 58, 0.5, 0.4),
        dot('furDeep', 20, 59.4, 0.5, 0.35),
        fill('white', `${artCircle(60, 44, 0.8)} ${artCircle(58.6, 40.6, 0.5)}`, 0.3),
        fill('coral', clamTurn('M45 45.6 C49.6 46.2 55 47.8 58.8 50.6 C60 51.6 59.4 53.4 57.8 53.4 C54 53.2 49.6 50.8 46.4 48.6 Z')),
        fill('skinPink', clamTurn('M47 46.6 C50.6 47.2 54.6 48.6 57.6 50.6 C54.4 49.6 50.6 48.6 47 48 Z'), 0.85),
        fill('ink', clamTurn('M59.2 52.4 C59 53.2 58.6 53.4 57.8 53.4 C54 53.2 49.6 50.8 46.4 48.6 C50.6 50.6 55 52.2 59.2 52.4 Z'), 0.22),
        fill('furDark', clamTurn(clam(1, false, 0.8, 1.8))),
        line('skinPink', 1.4, clamTurn(clam(1, true, 0.4, 0.9))),
        line('skinPink', 0.6, clamTurn('M20 48.4 L19.6 49.6 M26 49.6 L25.8 50.8 M32 50 L32 51.2 M38 49.8 L38.2 51 M44 48.4 L44.4 49.6'), 0.6),
        fill('tan', clamTurn(clam(1, false))),
        fill('furPale', clamTurn('M28.4 17.4 C22 20 14.6 24.6 11.6 30.6 C9.6 34.6 9.6 38.6 11 41.6 C11.6 36.6 13.8 31.6 18 27.6 C21.6 24.2 25 21.6 28.4 17.4 Z')),
        fill('ink', clamTurn('M55.7 31.9 C57 37.4 54.2 43.1 46.6 46.4 C38 49.6 24.8 49.6 17.2 46.4 C26 47.4 38 46.8 46 43.6 C52 41 55.4 37 55.7 31.9 Z'), 0.22),
        line('furDark', 1.8, clamTurn(clam(0.74, true)), 0.35),
        line('furDark', 1.6, clamTurn(clam(0.48, true)), 0.3),
        line('fur', 0.85, clamTurn(clam(0.88, true)), 0.6),
        line('fur', 0.85, clamTurn(clam(0.78, true)), 0.6),
        line('fur', 0.85, clamTurn(clam(0.66, true)), 0.6),
        line('fur', 0.85, clamTurn(clam(0.54, true)), 0.6),
        line('fur', 0.85, clamTurn(clam(0.42, true)), 0.6),
        line('fur', 0.8, clamTurn(clam(0.3, true)), 0.55),
        line('furDark', 0.8, clamTurn(clam(0.98, true)), 0.6),
        fill('shine', clamTurn('M16 27 C18.4 24.4 21.6 22.2 25 20.6 C22.6 22.8 20.2 25 18.4 27.6 Z'), 0.5),
        oval('sand', CLAM_UMBO[0], CLAM_UMBO[1], 3.2, 2.2),
        fill('cream', clamTurn('M27.2 19 C27.6 17.8 29 17.2 30.6 17.4 C29.6 18 28.6 18.6 28 19.6 Z'), 0.9),
        line('furDeep', 1.1, clamTurn('M27.4 17.2 C25.4 18.2 23.4 19 21.6 20'), 0.8),
        line('furPale', 0.8, clamTurn('M31.4 18 C35 19.2 39 20.2 42.6 21.4'), 0.6),
        fill('coralDark', clamTurn('M56.6 50.6 C58 51.2 59 51.8 58.8 52.8 C58.6 53.4 58 53.4 57.6 53.4 C56.4 53.2 55.4 52.6 54.6 52 Z'), 0.8),
        fill('sandDark', 'M47 53.6 C50.6 52.2 56 52 59.6 53.4 C56 55.4 50.6 55.6 47 53.6 Z', 0.45),
      ],
    },
    // 3 · Käferschnecken — a chiton from above on a rock: eight shell plates lapping like roof tiles in a granular girdle.
    {
      name: 'Käferschnecken', art: [
        fill('greyDark', 'M4 21 Q5 12 11 9.4 L23 6.4 Q29 5.4 34 7.6 L45 5.2 Q55 5.6 59 12 L61.6 25 Q60 32 61 39 L61.4 49 Q60 56.6 51 57.6 L37 56.4 Q30 59.6 22 59 L10 55.6 Q3.6 52 3.4 43 L5.2 32 Q3 27 4 21 Z', 0.3),
        fill('grey', 'M6 22 Q7 13.6 12 11.4 L23 8.6 Q16 13 11 23 Z', 0.2),
        fill('greyDeep', `${artCircle(10, 14, 0.9)} ${artCircle(20, 8.6, 0.7)} ${artCircle(47, 56, 0.8)} ${artCircle(58, 28, 0.7)} ${artCircle(6, 34, 0.6)}`, 0.35),
        line('greyDeep', 0.8, 'M5.4 44 C9 45.6 11 49 15.6 50 M47 8.4 C49.4 11.6 53.6 12.4 56 16 M57 37 C58.6 40 58.4 43 60 45', 0.4),
        fill('leafDark', `${artCircle(13, 53.4, 0.9)} ${artCircle(15.2, 54.6, 0.7)} ${artCircle(57.4, 20, 0.8)}`, 0.35),
        fill('tan', chBeads(0.45)),
        fill('sand', chRing(Math.PI * 0.3, Math.PI * 1.1)),
        fill('ink', chRing(Math.PI * 1.25, Math.PI * 2.05), 0.22),
        fill('furDark', [1, 2, 3, 4, 5, 6, 7].map((k) => [1, -1].map((s) => {
          const u = chB(k);
          const gv = (x: number): number => 12 * Math.max(0, 1 - Math.abs(x / 26.8) ** 2.4) ** (1 / 2.4);
          return poly([CH(u - 0.6, s * chHv(u) * 0.84), CH(u + 1.2, s * chHv(u) * 0.84), CH(u + 1.8, s * gv(u + 1.8)), CH(u - 0.2, s * gv(u - 0.2))]);
        }).join(' ')).join(' '), 0.45),
        fill('sand', circles(0.62, chMid(0.08, 0.165, 1)), 0.85),
        fill('furDark', circles(0.42, chMid(0.16, 0.33, 0.92)), 0.5),
        ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => fill('oliveDark', chPlate(k))),
        fill('ink', [1, 2, 3, 4, 5, 6, 7].map(chShade).join(' '), 0.24),
        line('scaleDeep', 0.7, [1, 2, 3, 4, 5, 6].flatMap((k) => [chRear(k, -2.2, 0.84), chRear(k, -3.6, 0.7)]).join(' '), 0.5),
        fill('olive', [1, 2, 3, 4, 5, 6, 7].map(chRim).join(' ')),
        fill('scale', `M${chAt(-CH_RU + 0.2, 1)} Q${chAt(-CH_RU + 1, 8.4)} ${chAt(chB(1) - 0.4, chHv(chB(1)) * 0.84)} L${chAt(chB(1) - 1.4, chHv(chB(1)) * 0.6)} Q${chAt(-CH_RU + 2.6, 6)} ${chAt(-CH_RU + 1.6, 0.6)} Z`),
        line('black', 0.9, [1, 2, 3, 4, 5, 6, 7].map((k) => chRear(k)).join(' ')),
        fill('scale', [1, 2, 3, 4, 5, 6, 7].map((k) => {
          const u = chB(k);
          const c = chCorner(k);
          return poly([CH(u + 0.7, c * 0.94), CH(u - 0.2, c * 0.5), CH(u - 0.5, 1.4), CH(u - 1.5, 0.2), CH(u - 0.2, 1.4), CH(u + 0.5, c * 0.5), CH(u + 1.5, c * 0.88)]);
        }).join(' '), 0.85),
        fill('scaleDeep', circles(0.38, [1, 2, 3, 4, 5, 6].flatMap((k): P[] => [1.3, 2.7].flatMap((du): P[] => [CH(chB(k) + du, -chHv(chB(k)) * 0.5), CH(chB(k) + du + 0.4, -chHv(chB(k)) * 0.74)]))), 0.6),
        line('scaleDeep', 0.7, [-0.5, -0.17, 0.17, 0.5].map((a) => `M${chAt(CH_RU - 3.4 + 2.2 * Math.cos(a), 6.2 * Math.sin(a))} L${chAt(CH_RU - 0.6 + 0.6 * Math.cos(a), 8.8 * Math.sin(a))}`).join(' '), 0.5),
        fill('ink', (() => {
          const a: P[] = [];
          const b: P[] = [];
          for (let j = 0; j <= 12; j++) {
            const u = -CH_RU + 1 + ((2 * CH_RU - 2) * j) / 12;
            a.push(CH(u, -chHv(u) * 0.96));
            b.push(CH(u, -chHv(u) * 0.32));
          }
          return `${smooth(a)} ${smooth(b.reverse(), 'L')} Z`;
        })(), 0.2),
        fill('cream', circles(0.5, chMid(0.9, 0.42, 1).filter(([x, y]) => y < 33 || x < 20)), 0.8),
      ],
    },
    // 4 · Orthoceren — a straight-shelled nautiloid: banded cone, big eye, a bunch of arms at the open end.
    {
      name: 'Orthoceren', art: [
        dot('white', 9, 46, 0.9, 0.3),
        dot('white', 12.6, 50, 0.6, 0.3),
        dot('white', 15.4, 53.4, 0.5, 0.3),
        line('coralDark', 1.2, [arm(50.6, 30.4, 61, 22.6, 0, -1, 1.6), arm(50.8, 33.4, 62, 31.4, 0, -0.6, 1.4), arm(50.4, 36.4, 59.6, 41.4, 1, 0, -1.4)].join(' ')),
        fill('cream', `M${ptp(OR(-28, 0.3))} L${ptp(OR(12, 7.2))} L${ptp(OR(12, -7.2))} L${ptp(OR(-28, -0.3))} Z`),
        ...[-22, -15.6, -9.2, -2.8].map((u) => fill('rust', orBand(u, u + 2.6))),
        fill('rust', orBand(3.6, 5.4)),
        line('creamDark', 0.7, [-25, -19, -12.6, -6.2, 0.4, 7.4].map((u) => `M${ptp(OR(u, orR(u) * 0.92))} Q${ptp(OR(u + 0.6, 0))} ${ptp(OR(u, -orR(u) * 0.92))}`).join(' '), 0.55),
        fill('white', poly([OR(-26, 0.4), OR(11.6, 6.6), OR(11.6, 3.6), OR(-26, 0.2)]), 0.45),
        line('creamDark', 0.7, `M${ptp(OR(-24, -0.2))} L${ptp(OR(11, -2.4))}`, 0.5),
        fill('ink', poly([OR(-27, -0.3), OR(11.8, -7), OR(11.8, -2.8), OR(-27, -0.1)]), 0.22),
        line('creamDark', 0.7, `M${ptp(OR(9.4, orR(9.4) * 0.95))} L${ptp(OR(9.4, -orR(9.4) * 0.95))} M${ptp(OR(10.8, orR(10.8) * 0.95))} L${ptp(OR(10.8, -orR(10.8) * 0.95))}`, 0.6),
        fill('creamDark', `M${ptp(OR(12, 7.2))} A1.8 7.2 -6 0 1 ${ptp(OR(12, -7.2))} A1.2 7.2 -6 0 0 ${ptp(OR(12, 7.2))} Z`),
        line('coralDark', 1.8, `M${ptp(OR(15.4, -4.6))} L${ptp(OR(18.6, -7.6))}`),
        fill('coralDark', `M${ptp(OR(12.4, 6.4))} C${ptp(OR(16, 7.4))} ${ptp(OR(19.4, 5.4))} ${ptp(OR(20, 2.4))} L${ptp(OR(13, 1))} Z`),
        fill('coral', `M${ptp(OR(12.4, 4.6))} C${ptp(OR(15, 5.6))} ${ptp(OR(19.6, 4.2))} ${ptp(OR(20.4, 0.6))} C${ptp(OR(20.6, -2.6))} ${ptp(OR(18, -5.4))} ${ptp(OR(13.2, -5.6))} Z`),
        fill('ink', `M${ptp(OR(13.2, -2))} C${ptp(OR(16, -2.4))} ${ptp(OR(19.2, -1.6))} ${ptp(OR(20.4, -0.4))} C${ptp(OR(20.2, -3))} ${ptp(OR(17.6, -5.4))} ${ptp(OR(13.2, -5.6))} Z`, 0.2),
        line('coral', 1.5, arm(50.6, 31.8, 60.6, 26.2, 0.4, -1.2, -1.4)),
        line('coral', 1.5, arm(50.8, 33, 62, 34.6, 0, 0.4, -1.2)),
        line('coral', 1.5, arm(50.4, 35, 58.6, 44.4, 1.6, 0.2, 1.4)),
        line('coral', 1.4, arm(50, 29.2, 57.2, 20.2, -1, 0, 1.2)),
        fill('cream', circles(0.45, [[53.6, 30.6], [56.4, 29], [54.2, 33.8], [57.4, 34], [53.6, 37.4], [55.8, 40]]), 0.75),
        dot('greyDeep', OR(16.4, 1.6)[0], OR(16.4, 1.6)[1], 2.2),
        dot('ink', OR(16.7, 1.6)[0], OR(16.7, 1.6)[1], 1.4),
        line('coralDark', 0.9, `M${ptp(OR(14.4, 3.6))} Q${ptp(OR(16.4, 4.6))} ${ptp(OR(18.6, 3.4))}`, 0.7),
        dot('shine', OR(16.7, 1.6)[0] - 0.45, OR(16.7, 1.6)[1] - 0.45, 0.5, 0.9),
      ],
    },
    // 5 · Ammoniten — a coiled ribbed shell, inner whorls showing, the animal looking out of the opening.
    {
      name: 'Ammoniten', art: [
        dot('white', 54, 14, 0.9, 0.3),
        dot('white', 57.6, 10.4, 0.6, 0.3),
        dot('white', 59.4, 6.6, 0.5, 0.3),
        line('coralDark', 1.2, [arm(50.4, 30.2, 60.4, 23.8, 0, -1, 1.4), arm(50.8, 33.2, 62, 31.6, 0, -0.6, 1.2), arm(50.4, 36.6, 59.4, 42.2, 1, 0, -1.4)].join(' ')),
        dot('gold', AM_C[0], AM_C[1], AM_R),
        fill('yellowPale', `M${ptp(am(20.4, 3.4))} A20.4 20.4 0 0 1 ${ptp(am(20.4, 4.9))} A15 17 0 0 0 ${ptp(am(20.4, 3.4))} Z`, 0.9),
        fill('fur', `M${ptp(am(AM_R, -0.6))} A${AM_R} ${AM_R} 0 0 1 ${ptp(am(AM_R, 2.55))} A28 28 0 0 0 ${ptp(am(AM_R, -0.6))} Z`, 0.45),
        fill('ink', `M${ptp(am(AM_R, 0.1))} A${AM_R} ${AM_R} 0 0 1 ${ptp(am(AM_R, 2.1))} A26 26 0 0 0 ${ptp(am(AM_R, 0.1))} Z`, 0.18),
        line('fur', 0.7, `M${ptp(am(20.6, 0.6))} A20.6 20.6 0 1 1 ${ptp(am(20.6, 5.9))}`, 0.5),
        line('fur', 0.85, amRibs(13, 21, 26, 0.32, 0.12), 0.65),
        line('fur', 0.75, amRibs(5.2, 11.6, 18, 0.2, 0.1), 0.55),
        line('furDark', 1, amSpiral(), 0.75),
        line('furDark', 1.6, `M${ptp(am(13.4, -2.2))} Q${ptp(am(17.6, -2.36))} ${ptp(am(21, -2.2))} M${ptp(am(13.4, 1.4))} Q${ptp(am(17.6, 1.24))} ${ptp(am(21, 1.4))}`, 0.6),
        dot('ink', AM_C[0], AM_C[1], 1.6, 0.3),
        fill('shine', `M${ptp(am(19.6, 3.75))} A19.6 19.6 0 0 1 ${ptp(am(19.6, 4.35))} A17 17 0 0 0 ${ptp(am(19.6, 3.75))} Z`, 0.55),
        line('coralDark', 0.7, 'M44.4 26.6 L47.4 25.8 M45.4 28 L48.6 27.2', 0.55),
        line('creamDark', 1.3, `M${ptp(am(12.6, AM_AP + 0.05))} Q${ptp(am(17, AM_AP + 0.14))} ${ptp(am(21.4, AM_AP + 0.05))}`),
        line('coralDark', 1.8, 'M45.4 38.6 L48.6 42.4'),
        fill('coralDark', 'M42.6 25.6 C45.6 24 49 24.6 50.8 27 L44 30.4 Z'),
        fill('coral', 'M43 27.6 C45.4 26 49.2 26.4 51 29 C52.6 31.6 52.6 35.6 50.8 37.6 C48.8 39.6 45.2 39.6 43.2 37.8 Z'),
        fill('ink', 'M43.2 35.4 C45.4 36.6 48.6 36.8 51.4 35.4 C51.2 36.4 51 37 50.8 37.6 C48.8 39.6 45.2 39.6 43.2 37.8 Z', 0.2),
        line('coral', 1.5, arm(50.8, 31.6, 60.6, 26.4, 0.4, -1.2, -1.4)),
        line('coral', 1.5, arm(51.2, 33, 62, 35, 0, 0.4, -1.2)),
        line('coral', 1.5, arm(50.6, 35, 58.4, 44.4, 1.6, 0.2, 1.4)),
        fill('cream', circles(0.45, [[53.8, 30.4], [56.6, 29], [54.6, 33.8], [57.6, 34.4], [53.6, 37.4], [55.6, 40]]), 0.75),
        dot('greyDeep', 46.6, 31.6, 2.2),
        dot('ink', 46.9, 31.6, 1.4),
        line('coralDark', 0.9, 'M44.2 29.6 Q46.6 28.2 49 29.4', 0.7),
        dot('shine', 46.4, 31.1, 0.5, 0.9),
      ],
    },
    // 6 · Belemniten — a squid-like belemnite: amber guard at the rear, fins, big eye, ten hooked arms.
    {
      name: 'Belemniten', art: [
        dot('white', 6, 22, 0.8, 0.3),
        dot('white', 9, 18.6, 0.6, 0.3),
        dot('white', 4.6, 44, 0.6, 0.3),
        line('shellDark', 1.2, 'M52.4 29 Q57 25.4 61.4 24.4 M52.6 32.6 Q57.6 31.4 62.4 30.6 M52.4 35.4 Q57.4 37.4 61.6 38.8'),
        fill('shellDark', 'M12 37.6 C13 43.4 16 46.4 20.4 47 C21.6 43.4 22.2 40.6 22 38 Z'),
        fill('shell', 'M12 26.4 C13 20.6 16 17.6 20.4 17 C21.6 20.6 22.2 23.4 22 26 Z'),
        line('shellDark', 0.6, 'M14 25.6 L16.2 20.2 M17 25.8 L18.8 19.6 M19.8 25.8 L20.6 19.8 M14 38.4 L16.2 43.8 M17 38.2 L18.8 44.4 M19.8 38.2 L20.6 44.2', 0.5),
        fill('chitin', 'M2.4 32 C4 30.4 8 29 14 28.8 L14 35.2 C8 35 4 33.6 2.4 32 Z'),
        fill('gold', 'M3.6 31.6 C5.6 30.4 9 29.6 13.6 29.4 L13.6 31 C9 31 6 31.2 3.6 31.6 Z'),
        fill('ink', 'M3 32.4 C5 33.4 9 34.2 13.8 34.4 L14 35.2 C8 35 4 33.6 3 32.4 Z', 0.22),
        line('chitinDark', 0.7, 'M5 32.6 C7.6 33.2 10.6 33.6 13.6 33.8', 0.55),
        fill('shell', 'M10.4 32 C10.4 27 14 25 20 24.4 L40 23.8 C44 23.8 46.6 26 47 28.4 L47 35.6 C46.6 38 44 40.2 40 40.2 L20 39.6 C14 39 10.4 37 10.4 32 Z'),
        fill('shellLight', 'M12.4 29.4 C13.6 26.6 16.6 25.6 20 25.4 L40 24.8 C42.6 24.8 44.6 25.8 45.6 27.4 C43 26.6 40 26.6 36 26.8 L20 27.4 C16.4 27.6 14 28.4 12.4 29.4 Z'),
        fill('ink', 'M10.8 33.6 C12 36.4 15.6 37.8 20 38 L40 38.2 C43.6 38.2 45.8 37.4 47 35.6 C46.6 38 44 40.2 40 40.2 L20 39.6 C14.4 39 11.4 36.8 10.8 33.6 Z', 0.22),
        fill('shellDark', circles(0.5, [[18, 29], [22, 28.4], [26.4, 29.4], [30, 28.2], [34.6, 29], [38.6, 28.4], [24, 31.8], [32, 32], [40, 31.6], [20, 33.6], [36, 34.4]]), 0.55),
        line('shellDark', 0.8, 'M46.2 25.4 C45.2 29.4 45.2 34.6 46.2 38.6', 0.6),
        line('shellDark', 0.8, 'M14 27.6 C22 25.8 34 25.4 44 25.8', 0.5),
        fill('cream', circles(0.35, [[56, 31.4], [58.6, 30.8], [56.4, 35.2], [59, 35.2]]), 0.7),
        fill('shell', 'M45.6 27.2 C48 25.6 51 25.8 52.6 27.6 C53.6 29 53.6 35 52.6 36.4 C51 38.2 48 38.4 45.6 36.8 Z'),
        fill('shellLight', 'M46.4 27.6 C48.4 26.6 50.8 26.8 52 28 C50 27.6 48.2 27.8 46.6 28.8 Z'),
        fill('shellDark', 'M45 38 C46.6 38.4 48.4 39.4 49.4 40.8 L47.4 41.4 C46.6 40.4 45.6 39.6 44.4 39.2 Z'),
        line('shell', 1.5, 'M52.4 30.4 Q57.4 27.6 62.2 27.2'),
        line('shell', 1.5, 'M52.6 33.8 Q57.8 34.4 62.6 33.6'),
        line('shell', 1.5, 'M52.2 36 Q56.6 39.6 60.2 42.6'),
        line('shell', 1.4, 'M52 28.4 Q55.6 24.6 59.4 21.6'),
        line('furDeep', 0.6, 'M54.6 29.6 L55.2 30.4 M57 28.4 L57.6 29.2 M59.4 27.8 L60 28.6 M55 34.6 L55.4 35.4 M57.6 34.8 L58 35.6 M60.2 34.4 L60.6 35.2 M54.6 38 L54.6 38.9 M56.8 39.6 L56.8 40.5', 0.8),
        dot('greyLight', 49.2, 30.4, 2.2),
        dot('ink', 49.5, 30.4, 1.4),
        line('shellDark', 0.9, 'M46.8 28.4 Q49.2 27 51.6 28.4', 0.7),
        dot('shine', 49, 29.9, 0.5, 0.9),
      ],
    },
    // 7 · Kraken — an octopus on the sea floor: bulbous mantle, big eye, eight arms with suckers.
    {
      name: 'Kraken', art: [
        ground('sandDark', 2, 62),
        ...OCT_FAR.map((a) => fill('rust', tube(a.s, a.w))),
        line('rust', 0.9, OCT_FAR.map(octTip).join(' ')),
        fill('creamDark', OCT_FAR.map((a) => octSuckers(a).map(([x, y], k) => artCircle(n1(x), n1(y), n1(0.7 - k * 0.05))).join(' ')).join(' '), 0.8),
        fill('orange', 'M8 27.6 C4.6 20 7.6 10.6 16 7.2 C24 4 32.6 7.6 34.6 15.4 C36 21 34 27.4 29.6 31.6 C25.6 35.2 18 35.4 12.6 32.4 C10.6 31.2 9 29.6 8 27.6 Z'),
        fill('orangeLight', 'M9.4 22.6 C8.6 16 12 10.4 17.6 8.4 C22 6.8 26.4 7.4 29.4 9.6 C24 9 18 10.6 14.4 14.6 C11.8 17.4 10.2 20 9.4 22.6 Z'),
        fill('ink', 'M34.4 18 C34.6 23 32.4 28 29.6 31.6 C25.6 35.2 18 35.4 12.6 32.4 C20 33 27.6 30.4 31.6 25.4 C33.2 23.2 34 20.6 34.4 18 Z', 0.22),
        fill('rust', circles(0.55, [[14, 18], [18, 14.6], [23, 12.4], [21, 19.6], [26.6, 17.6], [16.6, 25], [24, 24.4], [29.6, 22]]), 0.55),
        fill('orangeLight', circles(0.45, [[16, 21], [20.4, 16.6], [24.4, 20.6], [19.4, 27.4]]), 0.7),
        line('rust', 0.8, 'M23.4 33.6 C24.8 29.6 27.8 26.8 31.4 25.4', 0.55),
        fill('orange', 'M24 30 C25 25.4 30.4 23.2 35.4 24.6 C39.6 25.8 41.4 30 40.2 34.4 C39 38.6 34.4 41 29.4 40.4 C25.4 39.8 23.2 34.6 24 30 Z'),
        ...OCT_NEAR.map((a) => fill('orange', tube(a.s, a.w))),
        ...OCT_NEAR.map((a) => fill('orangeLight', strip(a.s, a.w, 0.05, 0.92, 0.85, 0.2))),
        line('orange', 1, OCT_NEAR.map(octTip).join(' ')),
        fill('cream', OCT_NEAR.map((a) => octSuckers(a).map(([x, y], k) => artCircle(n1(x), n1(y), n1(0.85 - k * 0.05))).join(' ')).join(' ')),
        fill('ink', 'M25.4 36.2 C28 38.6 33.4 39.4 37.6 37.4 C36 39.8 32.6 41 29.4 40.4 C27.4 40 26 38.4 25.4 36.2 Z', 0.2),
        fill('orangeLight', 'M30.6 27.8 C32.4 25.8 35.6 25.6 37.2 27.4 C35.4 27 33.4 27.4 31.8 28.8 Z'),
        fill('orange', 'M30.6 29.8 C30.4 26.4 32.4 24.6 34.6 24.8 C36.8 25 38.4 27 38 29.8 Z'),
        fill('orangeLight', 'M31.4 28.4 C31.6 26.6 32.8 25.6 34.4 25.6 C33.2 26.4 32.4 27.4 32.2 28.8 Z', 0.85),
        dot('amber', 34.2, 30.2, 2.4),
        oval('ink', 34.4, 30.2, 1.5, 1.1),
        dot('shine', 33.8, 29.6, 0.5, 0.9),
      ],
    },
    // 8 · Kegelschnecken — a cone snail on its foot: tent-patterned shell, raised siphon, harpoon proboscis.
    {
      name: 'Kegelschnecken', art: [
        ground('sandDark', 2, 62),
        dot('kelp', 6, 58.4, 0.6, 0.4),
        dot('kelp', 30, 59, 0.5, 0.4),
        line('skinPink', 1.1, 'M50.6 48 Q52.6 45.2 54.4 43.4'),
        line('skinPink', 1.2, 'M51.6 49.8 Q57 49.6 60.8 47.8'),
        fill('white', 'M60.4 48.2 L62.8 46.8 L61.2 48.8 Z'),
        fill('skinPink', 'M54.6 48.4 C56.6 47.6 58.8 48 59.6 49.6 C58.2 49.2 56.4 49.2 55 49.8 Z'),
        fill('skinPink', 'M9.4 52 C9.4 49.8 12.4 48.4 18 48.4 L47 48.2 C52 48 56.4 48.6 58.2 50.4 C59.4 51.8 58.6 53.8 56 54.8 C51.6 56 42 56.2 34 56.2 L15 56.4 C11.4 56.4 9.4 55 9.4 52 Z'),
        fill('skinDark', circles(0.6, [[14, 51.6], [20, 53.8], [26, 51.2], [32, 54], [38, 51], [44, 53.6], [50, 50.8], [55, 52.4]]), 0.5),
        fill('ink', 'M9.8 53.8 C14 55.2 40 55.2 47 54.8 C52 54.4 56 53.4 58.6 51.4 C58 53.8 53.4 55.8 46 56.2 L15 56.4 C11.6 56.4 10 55.4 9.8 53.8 Z', 0.22),
        fill('cream', coneTurn('M3.4 32 L11.6 18.6 C12.4 17.4 13.8 16.8 15.4 17 L48.4 28.4 C50.6 29.2 51.6 30.6 51.6 32 C51.6 33.4 50.6 34.8 48.4 35.6 L15.4 47 C13.8 47.2 12.4 46.6 11.6 45.4 Z')),
        fill('white', coneTurn('M3.8 32 L11.4 19.6 C12 18.6 12.8 18.2 13.4 18.4 L12.6 31.4 Z'), 0.8),
        line('fur', 0.8, coneTurn('M5.6 28.6 Q6.4 32 5.6 35.4 M8 24.8 Q9.2 32 8 39.2 M10.4 21 Q12 32 10.4 43'), 0.55),
        line('fur', 1.6, coneTurn(`${coneLine(0.36)} ${coneLine(0.64)}`), 0.45),
        fill('furDark', coneTents(0.2, 0)),
        fill('fur', coneTents(0.5, 1.6)),
        fill('furDark', coneTents(0.8, 0.6)),
        fill('fur', coneTurn(CONE_TENT.map((k, i) => {
          const x = 19.6 + i * 3.3;
          const y = coneTop(x) + (coneBot(x) - coneTop(x)) * 0.36;
          return `M${pt(x - 0.6, y)} L${pt(x, y - 0.8 * k)} L${pt(x + 0.6, y)} Z`;
        }).join(' ')), 0.8),
        line('creamDark', 0.8, coneTurn('M12.4 19.4 L15.6 18.2 M12 45 L15.4 46.2'), 0.6),
        fill('white', coneTurn('M12.4 19.8 C13 18.4 14.2 17.8 15.4 18 L47.6 29 C40 27.6 26 23.8 16.6 21.2 C14.8 20.8 13.4 20.4 12.4 19.8 Z'), 0.85),
        fill('ink', coneTurn('M11.6 40.4 L48.2 33.2 C50 32.8 51 32.4 51.6 32 C51.6 33.4 50.6 34.8 48.4 35.6 L15.4 47 C13.8 47.2 12.4 46.6 11.6 45.4 Z'), 0.2),
        line('furDeep', 1, coneTurn('M15.8 46.2 L48 35'), 0.8),
        line('orange', 2.2, 'M48.8 42.6 C52.8 41 55.2 36.6 56.6 30.6'),
        line('orangeLight', 0.7, 'M49.2 41.6 C52.2 40 54.2 36.6 55.4 32', 0.6),
        line('rust', 0.7, 'M50.4 41.6 L51.4 43 M52.6 39.8 L53.8 40.8 M54.4 37 L55.8 37.8 M55.6 34 L57 34.6', 0.55),
        oval('orangeLight', 57.2, 30, 1.9, 1.1),
        oval('rustDark', 57.2, 30, 1, 0.5),
        dot('ink', 54.6, 43.2, 1.1),
        dot('shine', 54.9, 42.9, 0.35, 0.9),
      ],
    },
  ];
}
