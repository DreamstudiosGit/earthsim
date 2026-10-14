/* =============================================================================
 * SimEarth 2.0 — plant art: Fleischfressende Pflanzen (carnivorous)
 * -----------------------------------------------------------------------------
 * Glandular red on green: sundew rosettes of fringed red pads, slender trumpet
 * pitchers with red hooded mouths in the bog. Specialists: a speckled
 * Nepenthes jug on its curling tendril in the rainforest, an open toothed
 * Venus flytrap in the swamp.
 * ========================================================================== */

namespace SE {
  type Pt = readonly [number, number];
  const r = (v: number): number => Math.round(v * 10) / 10;
  const at = (p: Pt): string => `${r(p[0])} ${r(p[1])}`;
  const mix = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  /** Point at t on the quadratic curve from a over c to b. */
  const onCurve = (a: Pt, c: Pt, b: Pt, t: number): Pt => mix(mix(a, c, t), mix(c, b, t), t);

  /** A sundew pad: a disc fringed with `n` tentacles. Every pad winds the same way. */
  function pad(cx: number, cy: number, rad: number, n = 9): string {
    const pts: string[] = [];
    for (let k = 0; k < 2 * n; k++) {
      const a = (k * Math.PI) / n - Math.PI / 2;
      const d = k % 2 === 0 ? rad : rad * 0.72;
      pts.push(at([cx + Math.cos(a) * d, cy + Math.sin(a) * d]));
    }
    return `M${pts.join(' L')} Z`;
  }

  /** Pad centres of a sundew rosette, relative to its base. */
  const ROSETTE: readonly (readonly [number, number])[] = [[-10.5, -4.5], [-7.5, -13.5], [7.5, -13.5], [10.5, -4.5]];

  /** A sundew rosette standing on (x, y), scaled by s, pads `rad` wide, with or without dew. */
  function sundew(x: number, y: number, s: number, rad: number, dewy = true): ArtShape[] {
    const stalks: string[] = [];
    const pads: string[] = [];
    const dew: string[] = [];
    for (const [dx, dy] of ROSETTE) {
      const cx = x + dx * s;
      const cy = y + dy * s;
      stalks.push(`M${at([x + Math.sign(dx) * 0.8, y - 0.5])} Q${at([x + dx * s * 0.45, y + dy * s * 0.8])} ${at([cx, cy])}`);
      pads.push(pad(cx, cy, rad));
      dew.push(artCircle(r(cx - rad * 0.3), r(cy - rad * 0.3), r(Math.max(0.8, rad * 0.28))));
    }
    const shapes: ArtShape[] = [
      { s: 'leaf', w: 1.8, d: stalks.join(' ') },
      { f: 'red', d: pads.join(' ') },
    ];
    if (dewy) shapes.push({ f: 'white', d: dew.join(' '), o: 0.9 });
    return shapes;
  }

  /** An ellipse turned by `deg` degrees. */
  function tilted(cx: number, cy: number, rx: number, ry: number, deg: number): string {
    const a = (deg * Math.PI) / 180;
    const p0: Pt = [cx - Math.cos(a) * rx, cy - Math.sin(a) * rx];
    const p1: Pt = [cx + Math.cos(a) * rx, cy + Math.sin(a) * rx];
    return `M${at(p0)} A${rx} ${ry} ${deg} 1 0 ${at(p1)} A${rx} ${ry} ${deg} 1 0 ${at(p0)} Z`;
  }

  /**
   * A slender trumpet pitcher from its foot to a flared mouth `w` wide, red
   * at the top, under a darker hood.
   */
  function trumpet(foot: Pt, top: Pt, w: number): ArtShape[] {
    const h = w / 2;
    const lt: Pt = [top[0] - h, top[1]];
    const rt: Pt = [top[0] + h, top[1]];
    const lf: Pt = [foot[0] - 0.8, foot[1]];
    const rf: Pt = [foot[0] + 0.8, foot[1]];
    const axis = mix(foot, top, 0.7);
    const lc: Pt = [axis[0] - 0.9, axis[1]];
    const rc: Pt = [axis[0] + 0.9, axis[1]];
    const red = 0.4;
    return [
      { f: 'leafLight', d: `M${at(lt)} Q${at(lc)} ${at(lf)} L${at(rf)} Q${at(rc)} ${at(rt)} Z` },
      { f: 'red', d: `M${at(lt)} Q${at(mix(lt, lc, red))} ${at(onCurve(lt, lc, lf, red))} L${at(onCurve(rt, rc, rf, red))} Q${at(mix(rt, rc, red))} ${at(rt)} Z` },
      { f: 'rust', d: tilted(top[0] - h * 0.25, top[1] - 1.1, r(h + 0.3), 1.7, -18) },
    ];
  }

  /**
   * An open Venus flytrap hinged at `h`: two half-disc lobes reaching to `a`
   * and `b`, green outside, red inside, pale teeth pointing into the mouth.
   */
  function flytrap(h: Pt, a: Pt, b: Pt, bulge: number, teeth: readonly number[]): ArtShape[] {
    const lobe = (tip: Pt, other: Pt, depth: number): string => {
      const dx = tip[0] - h[0];
      const dy = tip[1] - h[1];
      const len = Math.hypot(dx, dy);
      const toOther = (dy * (other[0] - h[0]) - dx * (other[1] - h[1])) > 0;
      const deg = r((Math.atan2(dy, dx) * 180) / Math.PI);
      return `M${at(h)} A${r(len / 2)} ${depth} ${deg} 0 ${toOther ? 0 : 1} ${at(tip)} Z`;
    };
    const fringe = (tip: Pt, other: Pt): string => {
      const dx = tip[0] - h[0];
      const dy = tip[1] - h[1];
      const len = Math.hypot(dx, dy);
      const sign = (dy * (other[0] - h[0]) - dx * (other[1] - h[1])) > 0 ? 1 : -1;
      const nx = (sign * dy) / len;
      const ny = (-sign * dx) / len;
      return teeth.map((t) => {
        const p: Pt = [h[0] + dx * t, h[1] + dy * t];
        return `M${at(p)} L${at([p[0] + nx * 2.2, p[1] + ny * 2.2])}`;
      }).join(' ');
    };
    return [
      { f: 'leafLight', d: lobe(a, b, bulge) },
      { f: 'leafLight', d: lobe(b, a, bulge) },
      { f: 'red', d: lobe(a, b, bulge * 0.55) },
      { f: 'red', d: lobe(b, a, bulge * 0.55) },
      { s: 'cream', w: 1.6, d: `${fringe(a, b)} ${fringe(b, a)}` },
    ];
  }

  /** A leaf from a to b, `w` wide in the middle. */
  function leaf(a: Pt, b: Pt, w: number): string {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = ((a[1] - b[1]) / len) * w;
    const ny = ((b[0] - a[0]) / len) * w;
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    return `M${at(a)} Q${at([m[0] + nx, m[1] + ny])} ${at(b)} Q${at([m[0] - nx, m[1] - ny])} ${at(a)} Z`;
  }

  FLORA_ART[Flora.Carnivorous] = {
    // spärlich: A sundew rosette of red tentacled pads with glistening dew and a curling
    //   flower stalk.
    sparse: [
      { s: 'leaf', w: 1.8, d: 'M16 28 Q15.5 15 16.5 7.5 Q17.5 4 20.5 4.5' },
      { f: 'white', d: `${artCircle(16.6, 8, 1.7)} ${artCircle(20.6, 4.6, 1.5)}` },
      { f: 'leaf', d: artEllipse(16, 28.5, 4.5, 1.6) },
      ...sundew(16, 28, 1, 3.5),
    ],
    // dicht: A bog cluster of slender trumpet pitchers with red hooded mouths over a sundew
    //   rosette. Farben: red, light green.
    dense: [
      ...trumpet([7.5, 19.5], [6, 5.5], 5.6),
      ...trumpet([10, 19.5], [13.5, 9.5], 5.2),
      ...trumpet([24.5, 25], [25.5, 9.5], 5.4),
      ...sundew(13, 30, 0.62, 2.6, false),
    ],
    specialists: [
      // Kannenpflanzen — Regenwald (Nepenthes (tropical pitcher plants)). A hanging jug-shaped
      //   pitcher with a lid on a curling tendril. Farben: green with red speckles, red rim.
      {
        name: 'Kannenpflanzen', biome: Biome.Jungle, art: [
          { f: 'leaf', d: leaf([29.5, 7], [15.5, 4.5], 4.5) },
          { s: 'leaf', w: 1.8, d: 'M16 4.5 C8 4 5 14 8 21 C10 26 13 28.5 15.5 27.5' },
          { f: 'leaf', d: tilted(17.5, 8.6, 4.6, 2.3, -25) },
          { f: 'leafLight', d: 'M15.5 12.5 C15 17 13.5 19 13.5 23.5 C13.5 29.5 25.5 29.5 25.5 23.5 C25.5 19 24 17 23.5 12.5 Z' },
          { f: 'leaf', d: 'M22.5 12.5 C23 17 25.5 19 25.5 23.5 C25.5 27.5 22 29.5 19.5 29.5 C22.5 27 23 23 21.8 18.5 C21.2 16 21 14 21.3 12.5 Z', o: 0.55 },
          { f: 'red', d: `${artCircle(16.5, 18.8, 1.1)} ${artCircle(19.8, 21.8, 1.1)} ${artCircle(16.2, 25.2, 1.1)} ${artCircle(21.8, 25.8, 1.1)}` },
          { f: 'red', d: artEllipse(19.5, 12.5, 5, 1.9) },
          { f: 'forest', d: artEllipse(19.5, 12.4, 3.3, 0.9) },
        ],
      },
      // Venusfliegenfallen — Sumpf (Dionaea muscipula (bogs of the Carolinas)). Two hinged trap
      //   lobes with spiky teeth, open like a mouth, on a leaf stalk. Farben: green outside, red
      //   inside, pale teeth.
      {
        name: 'Venusfliegenfallen', biome: Biome.Swamp, art: [
          { f: 'leaf', d: `${leaf([13.5, 29.5], [12, 21.5], 3.6)} ${leaf([12.5, 29.5], [6.5, 21.5], 3.2)} ${leaf([14, 29.5], [23, 27], 3)}` },
          { f: 'leafLight', d: leaf([6.5, 21.5], [5.5, 10.5], 5.5) },
          { s: 'red', w: 1.6, d: 'M6.4 19.5 Q6.6 15.5 5.6 12' },
          { s: 'cream', w: 1.6, d: 'M3.6 12.2 L3 9.8 M5.6 10.5 L5.4 8.2 M7.6 12 L8.4 9.8' },
          ...flytrap([12, 21.5], [28.5, 18], [20, 4.5], 5, [0.4, 0.6, 0.8, 1]),
        ],
      },
    ],
  };
}
