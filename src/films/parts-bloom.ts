/* =============================================================================
 * SimEarth 2.0 — shared drawings for the bloom films
 * -----------------------------------------------------------------------------
 * Creatures and backdrops used by more than one film of this group.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /**
   * A flat pinnate frond as path data: length, half-width, droop of the tip;
   * pointing `deg` degrees above the horizontal, mirrored by sx = -1, from (ox, oy).
   */
  export function bloomFrond(len: number, w: number, droop: number, ox = 0, oy = 0, sx = 1, deg = 0): string {
    const a = (deg * Math.PI) / 180;
    const pt = (x: number, y: number): string => `${f(ox + sx * (x * Math.cos(a) + y * Math.sin(a)))} ${f(oy - x * Math.sin(a) + y * Math.cos(a))}`;
    const n = Math.max(6, Math.round(len / 4));
    const [top, bot]: string[][] = [[], []];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const hw = w * Math.min(1, t * 3) * (1 - t * 0.8) * (i % 2 ? 1 : 0.45);
      top.push(pt(len * t, droop * t * t - hw));
      bot.unshift(pt(len * t, droop * t * t + hw));
    }
    return `M${pt(0, 0)}L${top.join('L')}L${pt(len, droop)}L${bot.join('L')}Z`;
  }

  /** A conifer of height h and half-width w on (0, 0): straight trunk, regular whorls of drooping needle tiers. */
  export function bloomConifer(h: number, w: number, dark = '#264f3f', light = '#2d5c48'): string {
    const n = Math.max(4, Math.round(h / 22));
    let [even, odd] = ['', ''];
    for (let k = 0; k < n; k++) {
      const [y, hw] = [-h * (0.2 + (0.78 * k) / n), w * Math.pow(1 - k / n, 0.9) + 3];
      let d = `M${f(-hw)} ${f(y + 6)}Q${f(-hw * 0.4)} ${f(y - 3)} 0 ${f(y - 7)}Q${f(hw * 0.4)} ${f(y - 3)} ${f(hw)} ${f(y + 6)}`;
      const m = Math.max(3, Math.round(hw / 3.5));
      for (let i = m - 1; i > -m; i--) d += `L${f((hw * i) / m)} ${f(y + 2 + (4 * Math.abs(i)) / m + (i % 2 ? 4 : 0))}`;
      if (k % 2) odd += d + 'Z'; else even += d + 'Z';
    }
    return `<path d="M-3 0L-1 ${-h}L1 ${-h}L3 0Z" fill="#5d4130"/><path d="${even}" fill="${dark}"/><path d="${odd}" fill="${light}"/>` +
      `<path d="M-3 ${f(-h + 9)}L0 ${f(-h - 5)}L3 ${f(-h + 9)}Z" fill="${light}"/>`;
  }

  /** A small fly facing right around (0, 0); its wings whir (forever, or `n` beats from `from` s). */
  export function bloomFly(from = 0, n = 0): string {
    const whir = mo('flap', n ? { dur: 0.05, s: 0.3, delay: from, n, origin: '50% 100%' } : { dur: 0.05, s: 0.3, origin: '50% 100%' });
    return `<g${whir}><ellipse cx="-3" cy="-5" rx="5.5" ry="2.4" fill="rgba(230,245,255,0.85)" transform="rotate(-30 -3 -5)"/>` +
      `<ellipse cx="0" cy="-5" rx="5.5" ry="2.4" fill="rgba(210,230,245,0.85)" transform="rotate(-62 0 -5)"/></g>` +
      `<path d="M-2 2l-3 4M1 2.5l0 4.5M3 2l3 4" stroke="${PAL.ink}" stroke-width="0.8" fill="none"/>` +
      `<ellipse cx="-2.5" cy="0" rx="5.5" ry="3.2" fill="#3b4048"/><path d="M-5 -2.4v4.8M-2.5 -3v6" stroke="#5a606a" stroke-width="0.7"/>` +
      `<circle cx="4" cy="-0.5" r="2.9" fill="#4a4f58"/><circle cx="5" cy="-1" r="1.6" fill="#b04a30"/>`;
  }

  /** Snowflakes drifting down over the whole frame from `from` s on. */
  export function bloomSnow(n: number, seed: number, from: number): string {
    const rnd = seeded(seed);
    let out = '';
    for (let k = 0; k < n; k++) {
      out += `<g transform="translate(${f(rnd() * 500 - 10)} ${f(-10 + rnd() * 120)})"><circle r="${f(1 + rnd() * 1.4)}" fill="#ffffff"` +
        `${mo('rise', { dy: f(150 + rnd() * 80), dur: f(3.5 + rnd() * 2.5), delay: f(from + rnd() * 2), o: 0.95, ease: 'linear' })}/></g>`;
    }
    return out;
  }

  /** Streaks of wind blowing from left to right at the heights `ys`, from `from` s on. */
  export function bloomWind(ys: readonly number[], from: number, dur = 2.4): string {
    return ys.map((y, k) => `<g${mo('drift', { dx: 640, dy: -6, dur, delay: f(from + k * 0.7), ease: 'ease-in' })}>` +
      `<path d="M-130 ${y}q20 -7 40 0t40 0" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.7"/></g>`).join('');
  }

  /** Ellipses [x, y, rx, ry] as one path (stones, litter, clusters). */
  export function bloomBlobs(list: readonly (readonly number[])[]): string {
    return list.map(([x, y, rx, ry]) => `M${f(x - rx)} ${f(y)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0`).join('');
  }
}
