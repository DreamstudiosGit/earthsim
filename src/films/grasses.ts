/* =============================================================================
 * SimEarth 2.0 — evolution film: grasses
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * The Miocene dries out and the woods thin to an open plain; grass sweeps
 * across it. A horse bites a clump short — and the blades grow back from
 * their base, cut tips first. Then the wind carries the pollen.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The foreground clump: base line, where the horse cuts it, how far it grows back. */
  const [BASE, CUT, REGROW] = [214, 36, 34];

  /** Blades of a grass tuft of height h as one path, rooted at (x, y). */
  function tuft(x: number, y: number, h: number, seed: number): string {
    const rnd = seeded(seed);
    let d = '';
    for (let k = 0; k < 9; k++) {
      const a = -0.7 + (k / 8) * 1.4 + (rnd() - 0.5) * 0.2;
      const hh = h * (0.55 + rnd() * 0.45);
      d += `M${f(x + a * h * 0.25)} ${f(y)}Q${f(x + a * hh * 0.3)} ${f(y - hh * 0.6)} ${f(x + a * hh * 0.8)} ${f(y - hh)}`;
    }
    return d;
  }

  /** A row of grass tufts that sprout from left to right from t0 on, swaying in the wind. */
  function grassRow(y: number, sc: number, step: number, colors: readonly string[], t0: number, seed: number): string {
    let out = '';
    for (let x = (seed * 7) % step, k = 0; x < FILM_W + 10; x += step, k++) {
      out += `<g${once('grow', { delay: f(t0 + (x / FILM_W) * 2.4), dur: 0.9 })}><path d="${tuft(x, y + ((x * 13) % 5), 28 * sc, seed + x)}" stroke="${colors[k % colors.length]}" stroke-width="${f(0.8 + sc)}" fill="none" stroke-linecap="round"` +
        `${mo('sway', { rot: 5, dur: 1.2, delay: f(-((FILM_W - x) / 240) * 2.2), origin: '50% 100%' })}/></g>`;
    }
    return out;
  }

  /** A grazing Miocene horse's head, mouth at (0, 0), facing left; the lower jaw snaps shut at `bite`. */
  function horseHead(bite: number): string {
    return `<path d="M96 -26C130 -40 180 -40 240 -20L250 60C200 50 150 40 108 22Z" fill="#9a6a38"/>` +
      `<path d="M98 -30C130 -50 180 -52 240 -32L240 -20C180 -40 130 -38 100 -22Z" fill="#4a3020"/>` +
      `<g transform="translate(46 6)"><g${once('rotate', { rot: -20, delay: bite, dur: 0.15 }, 'bloom-hinge')}><g transform="rotate(20)">` +
      `<path d="M-44 -2C-40 6 -20 12 4 10L4 -2Z" fill="#7a5230"/></g></g></g>` +
      `<path d="M0 -4C2 -12 8 -16 20 -18C50 -24 80 -34 98 -36L104 -50L110 -34C116 -26 118 -6 112 12C100 26 70 24 50 14C30 8 10 6 2 4Z" fill="#a8743e"/>` +
      `<path d="M0 -4C2 -12 8 -16 20 -18L24 2C12 4 4 4 2 4Z" fill="#6e4a2a"/><ellipse cx="9" cy="-9" rx="3" ry="2" fill="#2c1c10"/>` +
      `<path d="M90 -36L96 -52L102 -38Z" fill="#7a5230"/>${eye(74, -20, 3.4)}`;
  }

  EVO_FILMS.grasses = (): string => {
    const id = 'grasses';
    const [s, glow] = [sky(id, '#5d9cc2', '#e8f0e4'), sun(id, 96, 64, 13)];
    const defs = s.defs + glow.defs + vgrad(`${id}-earth`, [[0, '#a7a36a'], [1, '#8a8650']]) + glowGrad(`${id}-base`, '#f4ff9a', 0.9) +
      `<linearGradient id="${id}-front"><stop offset="0" stop-color="#9fb055"/><stop offset="0.82" stop-color="#9fb055"/><stop offset="1" stop-color="#9fb055" stop-opacity="0"/></linearGradient>`;
    let body = s.body + glow.body;
    // The climate dries: the sky turns hazy gold, the ground pale.
    body += `<rect width="${FILM_W}" height="${FILM_H}" fill="#f0c97a"${once('fade', { delay: 0.4, dur: 2.2, o: 0.4 })}/>`;
    body += hills(150, 10, '#b9b08a', 41, 0.7);
    body += `<path d="M0 156Q160 150 320 155T480 152V270H0Z" fill="url(#${id}-earth)"/>` +
      `<path d="M0 156Q160 150 320 155T480 152V270H0Z" fill="#d8bf86"${once('fade', { delay: 0.6, dur: 2, o: 0.75 })}/>`;
    // The woodland thins out, tree by tree; two flat-topped trees stay at the edges.
    const rnd = seeded(12);
    for (const [x, y, r, k] of [[150, 170, 26, 1], [214, 166, 30, 4], [276, 172, 24, 2], [336, 168, 28, 5], [100, 164, 22, 3], [392, 166, 24, 0]] as const) {
      body += during(0, 0.9 + k * 0.32, `<g transform="translate(${x} ${y})"><path d="M-3 0L-1.5 -${r}H1.5L3 0Z" fill="#6a4b33"/>` +
        `<path d="${bloomBlobs([[0, -r - 8, r * 0.75, r * 0.6], [-r * 0.45, -r + 2, r * 0.5, r * 0.4], [r * 0.45, -r + 2, r * 0.5, r * 0.4]])}" fill="${k % 2 ? '#5d8f4a' : '#6a9a52'}"/></g>`, 0.7);
    }
    for (const [x, sc] of [[44, 1], [446, 0.85]] as const) {
      body += `<g transform="translate(${x} 166) scale(${sc})"><path d="M0 0V-22M0 -14L-9 -24M0 -16L9 -25" stroke="#6c5a3c" stroke-width="2.4"/><ellipse cy="-27" rx="22" ry="6" fill="#6f7f44"/></g>`;
    }
    // Grass sweeps across the plain from left to right.
    body += `<g${once('move', { dx: 620, delay: 2.4, dur: 3.1, ease: 'linear' })}><rect x="-740" y="152" width="740" height="118" fill="url(#${id}-front)"/></g>`;
    body += grassRow(160, 0.38, 16, ['#8fa04c', '#a1ac56'], 3, 1) + grassRow(176, 0.55, 22, ['#8aa24a', '#9fae56'], 3.1, 2) +
      grassRow(196, 0.78, 30, ['#7f9a40', '#94a94c'], 3.2, 3);
    // The foreground clump: tips that the horse bites off, stubble that grows back from the base.
    let [tips, stubs] = ['', ''];
    for (let i = 0; i < 7; i++) {
      const [x0, lean, H] = [229 + i * 3.6, (i - 3) * 0.1, 92 + ((i * 37) % 5) * 5];
      const [cx, cy, tx, ty] = [x0 + lean * CUT, BASE - CUT, x0 + lean * H, BASE - H];
      const n = Math.hypot(tx - cx, ty - cy);
      const [nx, ny] = [((ty - cy) / n) * 2.8, (-(tx - cx) / n) * 2.8];
      const col = ['#6f9a3a', '#7aa642', '#86b04a'][i % 3];
      tips += `<path d="M${f(cx + nx)} ${f(cy + ny)}Q${f((cx + tx) / 2 + nx * 0.6)} ${f((cy + ty) / 2 + ny * 0.6)} ${f(tx)} ${f(ty)}Q${f((cx + tx) / 2 - nx * 0.6)} ${f((cy + ty) / 2 - ny * 0.6)} ${f(cx - nx)} ${f(cy - ny)}Z" fill="${col}"/>`;
      stubs += `<path d="M${x0} ${BASE}L${f(x0 + lean * REGROW)} ${BASE - REGROW}" stroke="#b6e05a" stroke-width="5.6"${once('draw', { len: REGROW + 2, delay: 6.9, dur: 1.4, ease: 'linear' })}/>` +
        `<g${once('move', { dx: f(lean * REGROW), dy: -REGROW, delay: 6.9, dur: 1.4, ease: 'linear' })}><path d="M${x0} ${BASE}L${f(cx)} ${f(cy)}" stroke="${col}" stroke-width="5.6"/>` +
        `<path d="M${f(cx - 2.8)} ${f(cy)}H${f(cx + 2.8)}" stroke="#d9e8a0" stroke-width="1.6"${once('fade', { delay: 6.25, dur: 0.3 })}/></g>`;
    }
    body += during(6.6, 9.6, `<ellipse cx="240" cy="${BASE - 4}" rx="34" ry="12" fill="url(#${id}-base)"${mo('pulse', { dur: 0.8, s: 1.15 })}/>`, 0.5);
    const sway = mo('sway', { rot: 2, dur: 1.4, origin: '50% 100%' });
    body += `<g${once('grow', { delay: 4.0, dur: 1, origin: '50% 100%' })}><g${sway}>${stubs}</g>` +
      `<g${once('move', { dx: 280, dy: -230, delay: 6.4, dur: 1.0, ease: 'ease-in' })}><g${sway}>${tips}</g></g></g>`;
    // The horse: in from above, bites, and lifts away with the tips.
    body += `<g transform="translate(242 ${BASE - CUT - 2})"><g${once('move', { dx: 280, dy: -230, delay: 6.4, dur: 1.0, ease: 'ease-in' })}>` +
      `<g${once('enter', { dx: 150, dy: -130, delay: 5.2, dur: 0.9 })}><g transform="rotate(-38)">${horseHead(6.15)}</g></g></g></g>`;
    body += sparkle(240, BASE - 8, '#f6ffc0', 7.0, 1);
    // Wind: flowering stems shed pollen over the waving plain.
    body += bloomWind([120, 150, 176], 8.9, 2.2);
    for (let k = 0; k < 6; k++) {
      const [x, y] = [70 + k * 70 + (k % 2) * 14, 208 - (k % 2) * 30];
      body += `<g transform="translate(${x} ${y})"><g${once('grow', { delay: f(8.7 + k * 0.1), dur: 0.8 })}><g${mo('sway', { rot: 7, dur: 1.2, delay: -k * 0.3, origin: '50% 100%' })}>` +
        `<path d="M0 0Q3 -30 2 -54" stroke="#a8ad5c" stroke-width="1.8" fill="none"/><path d="M2 -54l4 -5m-4 10l-4 -5m4 10l4 -5m-4 10l-4 -5" stroke="#d4c06a" stroke-width="2.6" stroke-linecap="round"/></g></g></g>`;
      for (let p = 0; p < 3; p++) {
        body += `<g transform="translate(${x + 4} ${y - 48}) rotate(${f(72 + p * 8)})"><path d="${bloomBlobs([[0, 0, 5, 4], [6, -3, 4, 3.4], [-5, -4, 3.4, 3], [2, -8, 3, 2.6]])}" fill="rgba(246,220,114,0.75)"` +
          `${mo('rise', { dy: f(-70 - rnd() * 40), dur: f(2.2 + rnd()), delay: f(9.4 + rnd() * 1.4), o: 0.9, ease: 'ease-out' })}/></g>`;
      }
    }
    body += during(0, 9.4, tag(280, BASE - 6, 'wächst von unten', 7.1, 'start'), 0.5);
    return film(id, defs, body);
  };
}
