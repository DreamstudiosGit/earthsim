/* =============================================================================
 * SimEarth 2.0 — shared drawings for the green films
 * -----------------------------------------------------------------------------
 * Creatures and backdrops used by more than one film of this group:
 * rocks, rain, mist, clubmoss shoots and fern fronds.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** A rounded rock of width 2w and height h standing on (x, y), lit from the upper left. */
  export function greenRock(x: number, y: number, w: number, h: number, color: string, light: string): string {
    return `<path d="M${f(x - w)} ${f(y)}Q${f(x - w * 0.95)} ${f(y - h)} ${f(x)} ${f(y - h)}Q${f(x + w * 0.95)} ${f(y - h)} ${f(x + w)} ${f(y)}Z" fill="${color}"/>` +
      `<path d="M${f(x - w * 0.62)} ${f(y - h * 0.6)}Q${f(x - w * 0.45)} ${f(y - h * 0.9)} ${f(x)} ${f(y - h * 0.92)}" stroke="${light}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  }

  /** Falling streaks over an area, each fading in and out as it falls. */
  export function greenRain(n: number, x0: number, x1: number, y0: number, y1: number, fall: number, seed: number, color: string, len: number): string {
    const rnd = seeded(seed);
    let out = '';
    for (let k = 0; k < n; k++) {
      out += `<path d="M${f(x0 + rnd() * (x1 - x0))} ${f(y0 + rnd() * (y1 - y0))}l${f(-len * 0.3)} ${f(len)}" stroke="${color}" stroke-width="1.3" stroke-linecap="round"` +
        `${mo('rise', { dy: fall, dur: f(0.7 + rnd() * 0.5), delay: f(-rnd() * 1.4), o: 0.95 })}/>`;
    }
    return out;
  }

  /** A soft band of mist (a glowGrad def) drifting sideways: a sway around a pivot far below. */
  export function greenMist(fill: string, x: number, y: number, rx: number, ry: number, dur: number): string {
    return `<g transform="translate(${x} ${y})"><g${mo('sway', { rot: 1.6, dur, origin: '50% 2400%' })}><ellipse rx="${rx}" ry="${ry}" fill="url(#${fill})"/></g></g>`;
  }

  /** A clubmoss shoot, base at the origin: a bottle brush of small scale leaves, a cone at the tip. */
  export function greenClubmoss(h: number, stem = '#3f7a3a', leaf = '#5c9a4a'): string {
    let leaves = '';
    for (let y = -3; y > -h + 3; y -= 2.6) {
      const l = 4.6 - (2 * -y) / h;
      leaves += `M0 ${f(y)}l${f(-l)} ${f(-l * 0.7)}M0 ${f(y)}l${f(l)} ${f(-l * 0.7)}`;
    }
    return `<path d="M0 0Q-1.5 ${f(-h / 2)} 0 ${-h}" stroke="${stem}" stroke-width="2.2" fill="none"/><path d="${leaves}" stroke="${leaf}" stroke-width="1.3" stroke-linecap="round"/>` +
      `<ellipse cy="${f(-h - 4)}" rx="2.6" ry="5.5" fill="#c8b060"/>`;
  }

  /**
   * A fern frond rising from its base at the origin and arching over to the
   * right. `curl` 0 is fully open; towards 1 the upper half rolls into a
   * fiddlehead and the leaflets fold in. `sori` dots the leaflets with spore
   * clusters, as seen from below.
   */
  export function greenFrond(L: number, curl: number, sori = false, light = '#7cbf5a', dark = '#4f8f40'): string {
    // Walk along the rachis: a gentle arch of about 60°, plus the coil near the tip.
    const n = 26;
    const ds = L / n;
    const pts: [number, number, number][] = [];
    let [x, y, a] = [0, 0, -1.32];
    for (let k = 0; k <= n; k++) {
      pts.push([x, y, a]);
      const s = k / n;
      a += ds * ((1.1 / L) * (0.5 + s) + curl * (9 / L) * 3 * s * s);
      x += Math.cos(a) * ds;
      y += Math.sin(a) * ds;
    }
    const rachis = `M0 0${pts.slice(1).map(([px, py]) => `L${f(px)} ${f(py)}`).join('')}`;
    const open = Math.pow(1 - curl, 0.8);
    let top = '';
    let under = '';
    let dots = '';
    for (let k = 6; k < n; k += 1.25) {
      const [px, py, pa] = pts[Math.round(k)];
      const s = k / n;
      const len = (L * 0.34 * Math.pow(1 - s, 0.5) + 2.5) * (0.25 + 0.75 * open);
      for (const side of [-1, 1]) {
        const b = pa + side * (0.35 + 0.8 * open);
        const ux = Math.cos(b);
        const uy = Math.sin(b);
        const w = len * 0.24;
        const mx = px + ux * len * 0.5;
        const my = py + uy * len * 0.5;
        const d = `M${f(px)} ${f(py)}Q${f(mx - uy * w)} ${f(my + ux * w)} ${f(px + ux * len)} ${f(py + uy * len)}Q${f(mx + uy * w)} ${f(my - ux * w)} ${f(px)} ${f(py)}Z`;
        if (side < 0) top += d;
        else under += d;
        if (sori && len > 7) {
          for (const [q, o] of [[0.3, 0.32], [0.5, -0.32], [0.7, 0.3]]) {
            const [sx, sy] = [px + ux * len * q - uy * w * o, py + uy * len * q + ux * w * o];
            dots += `M${f(sx - 1.8)} ${f(sy)}a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0`;
          }
        }
      }
    }
    return `<path d="${under}" fill="${dark}"/><path d="${top}" fill="${light}"/>` +
      `<path d="${rachis}" stroke="#3f6f30" stroke-width="${f(Math.max(1.4, L * 0.022))}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      (dots ? `<path d="${dots}" fill="#8a5524"/>` : '');
  }

  /** A clump of three small open fronds (a low fern), base at the origin. */
  export function greenFernClump(sc: number): string {
    return `<g transform="scale(${-sc} ${sc}) rotate(-8)">${greenFrond(46, 0, false, '#6fae52', '#477f3a')}</g>` +
      `<g transform="scale(${sc}) rotate(-12)">${greenFrond(52, 0, false, '#7cbf5a', '#4f8f40')}</g>` +
      `<g transform="scale(${f(sc * 0.9)}) rotate(-48)">${greenFrond(40, 0, false, '#6fae52', '#477f3a')}</g>`;
  }
}
