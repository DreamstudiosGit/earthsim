/* =============================================================================
 * SimEarth 2.0 — evolution film: firstTrees (wood and deep roots)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. A Devonian plain of low
 * green and bare ground; a lens shows a trunk disc gaining ring after ring
 * while a young trunk beside it thickens; Archaeopteris grows tall with its
 * fern-like leafy branches, roots reach deep and the brown soil thickens;
 * then a forest, drawing grey CO2 molecules out of a sky that turns cooler.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** Ground surface, the hero tree's base and its full height. */
  const GY = 172;
  const HX = 250;
  const H = 120;

  /**
   * An early leafless land plant, base at the origin: green stems forking in
   * two, a spore capsule on every tip (Cooksonia, Rhynia and their kin).
   */
  function forkPlant(h: number, seed: number, stem = '#5f9e4a', capsule = '#d2a23e'): string {
    const rnd = seeded(seed);
    let stems = '';
    let tips = '';
    const fork = (x: number, y: number, a: number, len: number, lvl: number): void => {
      const x1 = x + Math.sin(a) * len;
      const y1 = y - Math.cos(a) * len;
      stems += `M${f(x)} ${f(y)}Q${f(x + Math.sin(a) * len * 0.5 - 1)} ${f(y - Math.cos(a) * len * 0.5)} ${f(x1)} ${f(y1)}`;
      if (lvl === 0) tips += `<ellipse cx="${f(x1)}" cy="${f(y1 - 1.6)}" rx="${f(h * 0.05 + 1)}" ry="${f(h * 0.035 + 1)}" fill="${capsule}"/>`;
      else for (const s of [-1, 1]) fork(x1, y1, a + s * (0.32 + rnd() * 0.18), len * 0.72, lvl - 1);
    };
    fork(0, 0, (rnd() - 0.5) * 0.2, h * 0.42, 2);
    return `<path d="${stems}" stroke="${stem}" stroke-width="${f(Math.max(1.2, h * 0.045))}" fill="none" stroke-linecap="round"/>${tips}`;
  }

  /**
   * A flat pinnate leafy branch as path data: length, half-width, droop of
   * the tip; pointing `deg` degrees above the horizontal, mirrored by sx = -1.
   */
  function leafy(len: number, w: number, droop: number, ox: number, oy: number, sx: number, deg = 0): string {
    const a = (deg * Math.PI) / 180;
    const pt = (x: number, y: number): string => `${f(ox + sx * (x * Math.cos(a) + y * Math.sin(a)))} ${f(oy - x * Math.sin(a) + y * Math.cos(a))}`;
    const n = Math.max(6, Math.round(len / 4));
    const top: string[] = [];
    const bot: string[] = [];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const hw = w * Math.min(1, t * 3) * (1 - t * 0.8) * (i % 2 ? 1 : 0.45);
      top.push(pt(len * t, droop * t * t - hw));
      bot.unshift(pt(len * t, droop * t * t + hw));
    }
    return `M${pt(0, 0)}L${top.join('L')}L${pt(len, droop)}L${bot.join('L')}Z`;
  }

  /** Archaeopteris's woody trunk, base at the origin. */
  const trunk = (w: number): string =>
    `<path d="M${-w} 0Q${f(-w * 0.55)} ${f(-H * 0.5)} -1.6 ${-H}L1.6 ${-H}Q${f(w * 0.55)} ${f(-H * 0.5)} ${w} 0Z" fill="#6b4a30"/>` +
    `<path d="M${f(w * 0.25)} -6L0.6 ${f(-H * 0.8)}" stroke="#8d6a47" stroke-width="1.2"/>`;

  /**
   * Archaeopteris as two defs, base at the origin: the crown — tiers of flat,
   * fern-like leafy branches — and the whole tree, trunk and crown.
   */
  function archaeopterisDef(defId: string): string {
    let out = `<g id="${defId}-crown">`;
    for (let k = 0; k < 7; k++) {
      const y = -H * (0.3 + 0.1 * k);
      const len = (s: number): number => (12 + H * 0.42 * (1 - k / 7)) * ((k + s + 3) % 3 ? 1 : 0.8);
      const [l, r] = [len(-1), len(1)];
      out += `<path d="M0 ${f(y)}l${f(-l * 0.8)} ${f(4 + l * 0.1)}M0 ${f(y - 5)}l${f(r * 0.8)} ${f(4 + r * 0.1)}" stroke="#5e4029" stroke-width="1.4"/>`;
      out += `<path d="${leafy(l, 4 + l * 0.13, 4 + l * 0.12, 0, y, -1) + leafy(r, 4 + r * 0.13, 4 + r * 0.12, 0, y - 5, 1)}" fill="${k % 2 ? '#3d774a' : '#4f8f56'}"/>`;
    }
    return out + `<path d="${leafy(16, 4, 0, 0, -H + 3, 1, 90)}" fill="#4f8f56"/></g>` +
      `<g id="${defId}">${trunk(6)}<use href="#${defId}-crown"/></g>`;
  }

  /** Roots spreading down from (0, 0) into the cut-away ground, drawing in from `d` s. */
  function roots(depth: number, spread: number, d: number, seed: number): string {
    const rnd = seeded(seed);
    const lines: [string, number, number][] = [[`M0 0Q${f(spread * 0.12)} ${f(depth * 0.5)} ${f(-spread * 0.06)} ${f(depth)}`, depth + 8, 3]];
    for (const side of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        const [y0, ex] = [2 + k * depth * 0.28, side * spread * (0.6 + rnd() * 0.4) * (1 - k * 0.35)];
        const ey = y0 + depth * (0.3 + rnd() * 0.4);
        lines.push([`M0 ${f(y0)}Q${f(ex * 0.55)} ${f(y0 + 3)} ${f(ex)} ${f(ey)}`, Math.hypot(ex, ey - y0) * 1.25, 2.2 - k * 0.6]);
        lines.push([`M${f(ex * 0.6)} ${f(y0 + (ey - y0) * 0.3)}q${f(side * 4)} ${f(depth * 0.12)} ${f(side * 2)} ${f(depth * 0.25)}`, depth * 0.35, 1]);
      }
    }
    return lines.map(([p, len, w], k) =>
      `<path d="${p}" stroke="#ead9b0" stroke-width="${f(w)}" fill="none" stroke-linecap="round"${once('draw', { len: Math.ceil(len), delay: f(d + k * 0.15), dur: 1.4 })}/>`).join('');
  }

  /** The lens: a slice of trunk; the slice widens and ring after ring is added. */
  function trunkDisc(): string {
    let rings = '';
    for (let k = 1; k <= 6; k++) {
      rings += `<circle r="${k * 6.2}" fill="none" stroke="#b07f45" stroke-width="1.8"${once('pop', { delay: f(3.5 + k * 0.38), dur: 0.4 })}/>`;
    }
    return `<rect x="-60" y="-60" width="120" height="120" fill="#cfe2d8"/>` +
      `<g transform="scale(0.3)"><g${once('scale', { s: 3.33, delay: 3.4, dur: 2.5, ease: 'linear' })}>` +
      `<circle r="44" fill="#6b4a30"/><circle r="40" fill="#ecd3a0"/>${rings}<circle r="2.6" fill="#8d6a47"/>` +
      `<path d="M-30 -18Q-14 -28 4 -34" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.4"/></g></g>`;
  }

  /** A grey CO2 molecule: carbon between two oxygens. */
  const co2 = (): string =>
    `<circle cx="-6" r="3" fill="#a9b0b4" stroke="#6d7478" stroke-width="0.8"/><circle cx="6" r="3" fill="#a9b0b4" stroke="#6d7478" stroke-width="0.8"/><circle r="3.8" fill="#5d6468"/>`;

  EVO_FILMS.firstTrees = (): string => {
    const id = 'firstTrees';
    const s = sky(id, '#a7b7ae', '#efe2c4');
    const glow = sun(id, 404, 56, 14, '#fff0b8');
    const zoom = lens(`${id}-lens`, 140, 118, 54, trunkDisc(), 3.2, 6.1);
    const defs = s.defs + glow.defs + zoom.defs + archaeopterisDef(`${id}-tree`) + vgrad(`${id}-plain`, [[0, '#b0a57a'], [1, '#8f8a5c']]) +
      vgrad(`${id}-rock`, [[0, '#968777'], [1, '#5c5249']]) + vgrad(`${id}-cool`, [[0, '#7fbde6'], [1, 'rgba(127,189,230,0.15)']]);
    let body = s.body;
    // Beat 4: the sky turns cooler and bluer as forests draw down CO2.
    body += `<rect width="${FILM_W}" height="${GY}" fill="url(#${id}-cool)"${once('fade', { delay: 9.6, dur: 2, o: 0.75 })}/>`;
    body += glow.body + hills(140, 16, '#a9a690', 21, 0.6);
    // Beat 4, far away: the forest spreads over the plain.
    for (const [x, sc, d] of [[36, 0.36, 9.3], [186, 0.32, 9.9], [330, 0.34, 9.5], [466, 0.36, 10.1], [112, 0.3, 10.3], [404, 0.3, 10.5]] as const) {
      body += `<g opacity="0.6" transform="translate(${x} 156) scale(${sc})"><g${once('grow', { delay: d, dur: 1.6 })}><use href="#${id}-tree"/></g></g>`;
    }
    body += `<path d="M0 150Q120 146 240 150T480 148L480 ${GY + 2}L0 ${GY + 2}Z" fill="url(#${id}-plain)"/>`;
    // Beat 1: the low flora — forking stems, small clubmosses and ferns — with bare ground between.
    const low: readonly (readonly [number, number, number, number])[] = [[34, 171, 1.3, 0], [74, 160, 0.7, 1], [118, 172, 1.4, 2], [178, 161, 0.7, 0], [208, 172, 1.3, 1],
      [306, 172, 1.4, 2], [340, 160, 0.7, 0], [384, 171, 1.3, 1], [430, 161, 0.7, 2], [462, 172, 1.2, 0]];
    low.forEach(([x, y, sc, kind], k) => {
      const plant = kind === 0 ? forkPlant(30, k + 3) : kind === 1 ? greenClubmoss(22) : greenFernClump(0.42);
      body += `<g transform="translate(${x} ${y}) scale(${sc})"><g${mo('sway', { rot: 3, dur: f(2.6 + (k % 4) * 0.5), delay: f(-k * 0.4) })}>${plant}</g></g>`;
    });
    // Beat 4: the forest closes in.
    for (const [x, sc, d] of [[78, 0.72, 9.1], [400, 0.8, 9.3], [452, 0.6, 9.8], [150, 0.62, 9.6]] as const) {
      body += `<g transform="translate(${x} ${GY}) scale(${sc})"><g${once('grow', { delay: d, dur: 1.6, ease: 'cubic-bezier(.3,1.1,.5,1)' })}>` +
        `<g${mo('sway', { rot: 0.8, dur: f(4 + x / 200), origin: '50% 100%' })}><use href="#${id}-tree"/></g></g></g>`;
    }
    // The hero: a sapling at 3 s whose trunk thickens; at 6 s it shoots up into a tall tree.
    body += `<g transform="translate(${HX} ${GY}) scale(0.6)"><g${once('grow', { delay: 2.9, dur: 0.8, ease: 'ease-out' })}>` +
      `<g${once('scale', { s: 1.667, delay: 6, dur: 1.6, origin: '50% 100%', ease: 'cubic-bezier(.3,1.1,.5,1)' })}><g${mo('sway', { rot: 0.6, dur: 5, origin: '50% 100%' })}>` +
      `<g${once('widen', { s: 0.3, delay: 3.4, dur: 2.5, origin: '50% 100%', ease: 'linear' }, 'green-widen')}>${trunk(9)}</g><use href="#${id}-tree-crown"/></g></g></g></g>`;
    // Cut-away ground: a thin soil over rock that the roots deepen.
    const lip = `M0 ${GY}Q120 ${GY - 2} 240 ${GY + 1}T480 ${GY - 1}`;
    const rnd = seeded(5);
    let stones = '';
    for (let k = 0; k < 9; k++) {
      const [x, y, rx, ry] = [20 + k * 52 + rnd() * 20, GY + 22 + rnd() * 30, 4 + rnd() * 5, 2.5 + rnd() * 2.5];
      stones += `M${f(x - rx)} ${f(y)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0`;
    }
    body += `<path d="${lip}L480 270L0 270Z" fill="url(#${id}-rock)"/><path d="${stones}" fill="#a79a8b" opacity="0.6"/>` +
      `<path d="M0 ${GY + 30}Q160 ${GY + 26} 300 ${GY + 32}T480 ${GY + 28}" stroke="#4e463e" stroke-width="1.4" fill="none" opacity="0.5"/>`;
    body += `<g${once('squash', { s: 6, delay: 6.3, dur: 2.4, origin: '50% 0%', ease: 'ease-out' }, 'green-squash')}><rect y="${GY - 1}" width="${FILM_W}" height="7" fill="#5e4430"/></g>` +
      `<path d="${lip}" stroke="#b9a173" stroke-width="2.5" fill="none"/>`;
    body += `<g transform="translate(${HX} ${GY + 1})">${roots(48, 80, 6.4, 2)}</g><g transform="translate(78 ${GY + 1})">${roots(34, 50, 9.6, 1)}</g><g transform="translate(400 ${GY + 1})">${roots(36, 54, 9.8, 3)}</g>`;
    body += tag(HX + 78, GY + 40, 'tiefe Wurzeln', 7.2, 'start');
    body += sparkle(HX, GY - H + 8, '#fff3c4', 6.9, 1.1);
    // Beat 2: the lens shows the trunk slice gaining rings.
    body += during(3.2, 6.1, `<path d="M${HX} ${GY - 22}L156 66.5L113 164.5Z" fill="#ffffff" opacity="0.25"/><circle cx="${HX}" cy="${GY - 18}" r="8" fill="none" stroke="${PAL.cream}" stroke-width="1.5"/>`, 0.5);
    body += zoom.body + during(3.6, 6.1, tag(120, 190, 'Holz', 3.6), 0.4);
    // Beat 4: CO2 molecules drift out of the sky into the crowns.
    const crowns = [[HX, 80], [78, 116], [400, 108], [150, 128]];
    let gas = '';
    for (let k = 0; k < 16; k++) {
      const [tx, ty] = crowns[k % 4];
      const [sx, sy] = [Math.min(450, Math.max(220, tx + (rnd() - 0.3) * 200)), 64 + rnd() * 30];
      gas += `<g transform="translate(${f(sx)} ${f(sy)})"><g${mo('travel', { dx: f(tx + (rnd() - 0.5) * 30 - sx), dy: f(ty - sy), dur: f(2.4 + rnd()), delay: f(9.4 + rnd() * 2), ease: 'ease-in' }, 'green-travel')}>${co2()}</g></g>`;
    }
    body += gas + tag(336, 62, 'CO₂', 9.8);
    return film(id, defs, body);
  };
}
