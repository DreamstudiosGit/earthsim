/* =============================================================================
 * SimEarth 2.0 — evolution film: bilaterians
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * Seen from above, as the fossils are: a microbial mat with Dickinsonia. A
 * small worm shows its mirror axis and its front and back, crawls, and in an
 * x-ray view its nerve cords light up into a brain behind two eye spots; then
 * food passes through its gut, and it burrows a winding tunnel under the mat.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The worm's body: circles from tail to head, [x, radius], head to the right. */
  const SEGS = [5, 7, 8.5, 10, 11, 12, 12.5, 13, 13, 13, 12.5, 12, 11.5, 11].map((r, k) => [-66 + k * 10, r] as const);
  const NERVE = '#fff1a0';

  /** Dickinsonia from above: a quilted oval, segments either side of a midline. */
  function dickinsonia(rx: number, ry: number): string {
    let ribs = '';
    for (let k = -7; k <= 7; k++) {
      const x = (k / 8) * rx, h = ry * Math.sqrt(1 - (x / rx) ** 2);
      ribs += `M${f(x)} ${f(-h)}L${f(x + (k > 0 ? 1.5 : -1.5))} 0L${f(x)} ${f(h)}`;
    }
    return `<ellipse rx="${rx}" ry="${ry}" fill="#e2c69a" stroke="#b89366" stroke-width="1.4"/>` +
      `<path d="${ribs}M${-rx} 0L${rx} 0" fill="none" stroke="#b89366" stroke-width="1.1"/>`;
  }

  /** The worm's body; each segment sways sideways in turn while it crawls (from `t` s, `n` waves). */
  function segments(color: string, crawls: readonly (readonly [number, number])[]): string {
    return SEGS.map(([x, r], k) => {
      let seg = `<circle cx="${x}" r="${r}" fill="${color}"/>`;
      for (const [t, n] of crawls) seg = `<g${mo('float', { amp: 3, dur: 0.6, delay: f(t + (13 - k) * 0.05), n }, 'bilaterians-wiggle')}>${seg}</g>`;
      return seg;
    }).join('');
  }

  /** Light reaching the eye spots from ahead, as moving dashes. */
  function lightToEyes(): string {
    let out = '';
    for (const [y0, ey] of [[-34, -5], [34, 5], [-10, -5], [10, 5]] as const) {
      const dx = 64 - 112, dy = ey - y0, len = Math.hypot(dx, dy), a = Math.atan2(-dx, dy) * 180 / Math.PI;
      let dashes = '';
      for (let k = 0; k < 2; k++) dashes += `<ellipse rx="1.6" ry="4.5" fill="#fff6c0"${mo('rise', { dy: f(len - 8), dur: 0.9, delay: f(7 + k * 0.45 + Math.abs(y0) * 0.004), ease: 'linear', o: 1 })}/>`;
      out += seaAt(112, y0, dashes, ` rotate(${f(a)})`);
    }
    return out;
  }

  EVO_FILMS.bilaterians = (): string => {
    const id = 'bilaterians';
    const rnd = seeded(5);
    // The mat, seen from above: olive with wrinkles, light rippling over it.
    let bg = `<rect width="${FILM_W}" height="${FILM_H}" fill="url(#${id}-mat)"/>`;
    let wrinkles = '';
    for (let k = 0; k < 70; k++) {
      const x = rnd() * 480, y = rnd() * 270, a = rnd() * 3.14, l = 6 + rnd() * 8;
      wrinkles += `M${f(x)} ${f(y)}q${f(Math.cos(a) * l / 2 + 2)} ${f(Math.sin(a) * l / 2 - 2)} ${f(Math.cos(a) * l)} ${f(Math.sin(a) * l)}`;
    }
    bg += `<path d="${wrinkles}" fill="none" stroke="#5f6a3a" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>`;
    for (const [x, y, r] of [[60, 150, 40], [420, 60, 34], [300, 240, 46], [150, 40, 30]] as const) bg += `<circle cx="${x}" cy="${y}" r="${r}" fill="#9aa468" opacity="0.35"/>`;
    for (let k = 0; k < 4; k++) {
      bg += `<g${mo('float', { amp: 9, dur: 4.5, delay: -k * 1.1 })}><path d="M${-40 + k * 130} ${30 + k * 60}q30 -16 60 0t60 0t60 0" fill="none" stroke="#f4ffd8" stroke-width="3" opacity="0.13"/></g>`;
    }
    bg += seaAt(78, 92, dickinsonia(40, 26), ' rotate(-24)') + seaAt(404, 84, dickinsonia(32, 21), ' rotate(14)') + seaAt(388, 206, dickinsonia(44, 28), ' rotate(-8)') +
      seaAt(84, 214, `<circle r="15" fill="#d9bd8f" stroke="#b18e60" stroke-width="1.2"/><path d="M0 0q-4 -8 2 -13M0 0q9 1 11 7M0 0q-6 6 -11 3" fill="none" stroke="#a9845a" stroke-width="2.4" stroke-linecap="round"/>`);
    bg += motes(id, 10, 'rgba(240,255,230,0.5)', 0, 480, 0, 270, 9, 1.1);

    // Beat 2: its mirror axis, its front and its back; then it crawls on.
    const axis = `<g${once('grow', { delay: 3.6, dur: 0.6, origin: '0% 50%' })}><path d="M-88 0L90 0" stroke="${PAL.cream}" stroke-width="2" stroke-dasharray="7 5"/></g>` +
      `<g${once('pop', { delay: 3.9 })}><path d="M84 0L98 0M90 -7L99 0L90 7" fill="none" stroke="${PAL.gold}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g>` +
      `<g${once('pop', { delay: 4.1 })}><path d="M-80 0L-94 0M-87 -6L-95 0L-87 6" fill="none" stroke="${PAL.cream}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>` +
      `<g${once('pop', { delay: 4.4 })}><path d="M-8 -27Q-13 0 -8 27M-12.5 -21L-8 -28L-3.5 -22M-12.5 21L-8 28L-3.5 22" fill="none" stroke="${PAL.cream}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;

    // Beat 3: x-ray — nerve cords light up from the tail into a brain behind the eye spots.
    let ladder = '';
    for (let x = -50; x < 50; x += 12) ladder += `M${x} -4L${x} 4`;
    const xray = `<g opacity="0.85">${SEGS.map(([x, r]) => `<circle cx="${x}" r="${r + 1.3}" fill="#a8e4ff"/>`).join('')}${SEGS.map(([x, r]) => `<circle cx="${x}" r="${r}" fill="#1f4e6c"/>`).join('')}</g>` +
      `<path d="M-62 -2.5L56 -4M-62 2.5L56 4" stroke="${NERVE}" stroke-width="5" opacity="0.3" fill="none"${once('draw', { len: 120, delay: 6.05, dur: 0.6, ease: 'linear' })}/>` +
      `<path d="M-62 -2.5L56 -4M-62 2.5L56 4" stroke="${NERVE}" stroke-width="1.8" fill="none"${once('draw', { len: 120, delay: 6.05, dur: 0.6, ease: 'linear' })}/>` +
      `<path d="${ladder}" stroke="${NERVE}" stroke-width="1.2"${once('fade', { delay: 6.5, dur: 0.4 })}/>` +
      seaAt(57, 0, `<g${once('pop', { delay: 6.55, dur: 0.6 })}><circle r="14" fill="url(#${id}-glow)"${mo('pulse', { dur: 1.2, s: 1.25 })}/>` +
        `<circle cy="-4.5" r="4.6" fill="${NERVE}"/><circle cy="4.5" r="4.6" fill="${NERVE}"/></g>`) +
      during(6.9, Infinity, lightToEyes(), 0.4);
    // Beat 4: the gut, mouth to anus, with a bite of food passing through.
    const gut = `<path d="M74 0Q40 -3 10 1T-70 0" fill="none" stroke="#b07a42" stroke-width="7" stroke-linecap="round" opacity="0.9"/>` +
      `<path d="M72 0Q40 -3 10 1T-68 0" fill="none" stroke="#f0cf96" stroke-width="2.2" stroke-linecap="round"/>`;
    const food = seaAt(100, 0, `<g${once('move', { dx: -198, delay: 9.4, dur: 1.5, ease: 'linear' })}>` +
      during(0, 10.3, `<circle r="4" fill="#7ed957" stroke="#2f6b36" stroke-width="1.2"/>`, 0.3) + during(10.1, Infinity, `<ellipse rx="4.5" ry="3" fill="#6f5438"/>`, 0.3) + '</g>');
    const eyes = `<circle cx="65" cy="-5" r="2.4" fill="${PAL.ink}"/><circle cx="65" cy="5" r="2.4" fill="${PAL.ink}"/>` +
      `<circle cx="64.2" cy="-5.8" r="0.8" fill="#ffffff"/><circle cx="64.2" cy="4.2" r="0.8" fill="#ffffff"/>`;
    const worm = during(0, 10.9, segments('#efb48e', [[5, 2], [10.6, 2]]) + eyes, 0.5) +
      during(6, 10.6, xray + eyes, 0.5) + during(9, 10.6, gut, 0.4) + during(9, Infinity, food, 0.4);

    // The worm crawls in, rests for the axis, crawls on, rests for the x-ray, then dives under the mat.
    let wormBody = `<g${once('enter', { dx: -100, delay: 2.9, dur: 0.9, ease: 'ease-out' })}><g${once('move', { dx: 20, delay: 5, dur: 1, ease: 'linear' })}>` +
      during(3.5, 5.1, axis, 0.4) + `<g${once('move', { dx: 26, delay: 10.6, dur: 0.8, ease: 'linear' })}>${worm}</g></g></g>`;
    wormBody = during(2.9, Infinity, wormBody, 0.3);
    let body = bg + seaAt(180, 148, wormBody, ' scale(1.35)');
    // Its tunnel under the mat winds on; at its end the worm looks out again.
    const tunnel = 'M338 148C356 110 380 112 388 140S410 190 428 166S446 128 448 140';
    body += `<path d="${tunnel}" fill="none" stroke="#b69c6e" stroke-width="11" stroke-linecap="round"${once('draw', { len: 190, delay: 11.1, dur: 0.8, ease: 'linear' })}/>` +
      `<path d="${tunnel}" fill="none" stroke="#7d6748" stroke-width="3.5" stroke-linecap="round"${once('draw', { len: 190, delay: 11.1, dur: 0.8, ease: 'linear' })}/>`;
    body += seaAt(448, 140, `<g${once('pop', { delay: 11.7, dur: 0.4 })}><circle r="7" fill="#efb48e"/><circle cx="2" cy="-2.6" r="1.4" fill="${PAL.ink}"/><circle cx="2" cy="2.6" r="1.4" fill="${PAL.ink}"/></g>`, ' rotate(-70)');
    body += sparkle(284, 148, '#fff6c8', 6.6);
    body += during(0, 10.6, tag(284, 120, 'Gehirn', 6.9), 0.4) + during(0, 10.5, tag(300, 186, 'Augenflecken', 7.1, 'start'), 0.4) + during(0, 10.6, tag(190, 182, 'Darm', 9.6), 0.4);

    const defs = vgrad(`${id}-mat`, [[0, '#8a9460'], [1, '#6f7a4a']]) + glowGrad(`${id}-glow`, '#fff3a0', 0.85);
    return film(id, defs, body);
  };
}
