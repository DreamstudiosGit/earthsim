/* =============================================================================
 * SimEarth 2.0 — evolution film: conifers
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * The late Carboniferous turns cold and dry: broad-leaved plants lose their
 * water and wilt; a conifer's waxy needle keeps it (lens); a cone closes in
 * the frost and opens in dry sun; its winged seeds spin down the slope.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The slope rises from left to right. */
  const slope = (x: number): number => 206 - (x / 480) * 44;

  /** A cordaite-like tree on (0, 0): a slim trunk, a crown of long strap leaves; `wilt` lets them hang. */
  function strapTree(h: number, leaf: string, wilt: number): string {
    let d = '';
    for (let k = 0; k < 9; k++) {
      const side = k < 4 ? -1 : k > 4 ? 1 : 0;
      const a = ((-90 + (k - 4) * 21 + side * wilt * 70) * Math.PI) / 180;
      const [c, sn] = [Math.cos(a), Math.sin(a)];
      const p = (u: number, v: number): string => `${f(u * c - v * sn)} ${f(-h + u * sn + v * c)}`;
      d += `M0 ${-h}Q${p(22, -9)} ${p(50, 0)}Q${p(22, 9)} 0 ${-h}Z`;
    }
    return `<path d="M-3 0L-1.5 ${-h}H1.5L3 0Z" fill="#6b5236"/><path d="${d}" fill="${leaf}"/>`;
  }

  /** One cone scale on its hinge (0, 0), pointing along +x, a winged seed on its upper face. */
  function scale(len: number, r: number, open: number): string {
    return `<path d="M0 -6C${f(len * 0.4)} -13 ${f(len * 0.9)} -12 ${f(len)} -2C${f(len * 0.9)} 8 ${f(len * 0.4)} 9 0 6Z" fill="${r % 2 ? '#9a6532' : '#a8723a'}" stroke="#5e3a1c" stroke-width="0.9"/>` +
      `<path d="M${f(len * 0.74)} -6L${f(len)} -2L${f(len * 0.74)} 4L${f(len * 0.62)} -1Z" fill="#6e4422"/>` +
      `<g${once('fade', { delay: open, dur: 0.6 })}><path d="M${f(len * 0.16)} -8Q${f(len * 0.5)} -17 ${f(len * 0.8)} -11Q${f(len * 0.5)} -7 ${f(len * 0.16)} -8Z" fill="#ecdcb4"/>` +
      `<ellipse cx="${f(len * 0.18)}" cy="-7.6" rx="4.4" ry="3" fill="#4e3018"/></g>`;
  }

  /** The cone close up, axis from (0, 0) up: scales half open, shut in the frost at `shut`, open wide at `open`. */
  function cone(shut: number, open: number): string {
    let out = `<path d="M0 8V-104" stroke="#5e3a1c" stroke-width="6" stroke-linecap="round"/>`;
    // Top rows first: each lower scale overlaps the one above, as on a real cone.
    for (let r = 5; r >= 0; r--) {
      const len = 20 + 24 * Math.sin(((r + 0.6) / 6.4) * Math.PI);
      for (const side of [-1, 1]) {
        out += `<g transform="translate(0 ${-r * 17}) scale(${side} 1) rotate(-48)"><g${once('rotate', { rot: -14, delay: shut, dur: 0.5 }, 'bloom-hinge')}>` +
          `<g${once('rotate', { rot: 52, delay: f(open + r * 0.1), dur: 1.1 }, 'bloom-hinge')}>${scale(len, r + (side > 0 ? 1 : 0), open + 0.3 + r * 0.1)}</g></g></g>`;
      }
    }
    return out + `<path d="M-6 -98Q0 -120 6 -98Z" fill="#8b5a2b"/>`;
  }

  /** A needle tip, much enlarged: green inside, a shining coat of wax, the water held in. */
  function needle(): string {
    const shape = 'M-120 -26H10Q50 -26 74 0Q50 26 10 26H-120Z';
    let drops = '';
    for (const [x, y, d] of [[-50, -4, 0], [-18, 6, 0.6], [14, -6, 1.1], [42, 2, 0.3], [-34, 8, 1.4]] as const) {
      drops += `<g transform="translate(${x} ${y})"><path d="M0 -6Q4 -1 4 2A4 4 0 1 1 -4 2Q-4 -1 0 -6Z" fill="#6cc2ef"${mo('float', { amp: 7, dur: 1.3, delay: -d })}/></g>`;
    }
    return `<g transform="translate(-10 4)"><path d="${shape}" fill="#3d7a52"/><path d="M-110 -12H20M-110 12H20" stroke="#2f6442" stroke-width="2" stroke-dasharray="4 7"/>` +
      `${drops}<path d="${shape}" fill="none" stroke="#d6eef6" stroke-width="6"/>` +
      `<path d="M-70 -24H10" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"${mo('twinkle', { dur: 1.2, o: 0.4 })}/></g>`;
  }

  EVO_FILMS.conifers = (): string => {
    const id = 'conifers';
    const [s, glow] = [sky(id, '#7fa6b8', '#e6eadf'), sun(id, 250, 66, 11, '#f6f1dc')];
    const l = lens(`${id}-l`, 196, 122, 60, needle(), 3.8, 5.6);
    const defs = s.defs + glow.defs + l.defs + vgrad(`${id}-ground`, [[0, '#9a9a6e'], [1, '#6f7150']]) + vgrad(`${id}-close`, [[0, '#9fb7c6'], [1, '#e7e2cf']]) +
      glowGrad(`${id}-warm`, '#ffd88a', 0.85);
    let body = s.body + glow.body;
    // It gets cold: a grey-blue hush, snowy mountains, frost on the ground.
    body += `<rect width="${FILM_W}" height="${FILM_H}" fill="#4f6d88"${once('fade', { delay: 0.4, dur: 2.2, o: 0.32 })}/>`;
    body += `<path d="M0 168L60 128L104 152L170 104L232 150L290 118L352 148L414 110L480 140V200H0Z" fill="#a7b8c6"/>` +
      `<path d="M60 128L72 138L60 136L50 134ZM170 104L188 120L174 116L160 120L154 114ZM290 118L304 130L292 128L280 128ZM414 110L430 126L416 122L404 124Z" fill="#f4f8fb"${once('fade', { delay: 0.6, dur: 2 })}/>`;
    body += `<path d="M0 ${slope(0)}L480 ${slope(480)}V270H0Z" fill="url(#${id}-ground)"/>` +
      `<path d="M0 ${slope(0)}L480 ${slope(480)}V270H0Z" fill="#eef4f8"${once('fade', { delay: 1, dur: 2, o: 0.55 })}/>`;
    const rnd = seeded(31);
    let frost = '';
    for (let k = 0; k < 8; k++) {
      const x = 20 + rnd() * 440;
      const y = slope(x) + 6 + rnd() * 18;
      frost += `<g transform="translate(${f(x)} ${f(y)})"><path d="M0 -4V4M-4 0H4" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round"${mo('twinkle', { dur: f(0.8 + rnd()), delay: f(-rnd() * 2), o: 0 })}/></g>`;
    }
    body += during(1.2, Infinity, frost);
    // Broad-leaved trees lose water from their leaves, wilt, and give way.
    let wilting = '';
    for (const [x, h] of [[118, 82], [210, 70]] as const) {
      const pos = `translate(${x} ${f(slope(x) + 2)})`;
      wilting += during(0, 2.0, `<g transform="${pos}">${strapTree(h, '#4f8f4a', 0)}</g>`, 0.8) + during(1.7, Infinity, `<g transform="${pos}">${strapTree(h, '#a48a4e', 1)}</g>`, 0.8);
      for (let k = 0; k < 4; k++) {
        const [dx, dy] = [-30 + k * 18 + rnd() * 6, -14 + rnd() * 12];
        wilting += `<g transform="translate(${f(x + dx)} ${f(slope(x) - h + dy)})"><path d="M0 -4Q3 0 3 2A3 3 0 1 1 -3 2Q-3 0 0 -4Z" fill="#7cc8ee"` +
          `${mo('rise', { dy: -34, dur: 1.4, delay: f(0.3 + k * 0.3 + rnd() * 0.3), n: 2, o: 0.95 })}/></g>`;
      }
    }
    body += during(0, 3.6, wilting);
    // The conifer: the lens looks into one of its needles.
    const [cx, cy] = [372, slope(372) + 2];
    body += `<g transform="translate(${cx} ${f(cy)})"><g${once('grow', { delay: 2.9, dur: 1.5, ease: 'cubic-bezier(.3,1.1,.5,1)' })}><g${mo('sway', { rot: 1, dur: 4.5 })}>${bloomConifer(114, 40)}<path d="${bloomBlobs([[-30, -63, 3.4, 6], [26, -78, 3.2, 5.6], [-18, -88, 3, 5]])}" fill="#8b5a2b"/></g></g></g>`;
    body += during(3.7, 5.6, `<circle cx="344" cy="115" r="8" fill="none" stroke="${PAL.cream}" stroke-width="2"/><path d="M336 116L258 121" stroke="${PAL.cream}" stroke-width="1.4" stroke-dasharray="3 4" opacity="0.8"/>`, 0.4);
    // Spinning seeds land on the slope; seedlings and then a forest follow.
    const spots = [300, 246, 196, 146, 96, 52];
    spots.forEach((x, k) => {
      const [x0, y0] = [cx - 20 + k * 3, 112 + k * 4];
      const [x1, y1] = [x, slope(x) + 6];
      const t = 9.0 + k * 0.12;
      const dur = 0.9 + k * 0.1;
      body += during(t - 0.2, t + dur + 0.2, `<g transform="translate(${f(x0)} ${f(y0)})"><g${once('move', { dx: f(x1 - x0), dy: f(y1 - y0), delay: f(t), dur: f(dur), ease: 'ease-in-out' })}>` +
        `<g${mo('spin', { dur: 0.35, delay: f(t) })}><path d="M0 0Q14 -8 26 -1Q15 4 0 0Z" fill="#ecdcb4"/><ellipse rx="4.6" ry="3.2" fill="#4e3018"/></g></g></g>`, 0.3);
      body += `<g transform="translate(${x} ${f(y1)})"><g${once('grow', { delay: f(t + dur), dur: 1.4, ease: 'cubic-bezier(.3,1.1,.5,1)' })}>${bloomConifer(20 + k * 3, 8 + k)}</g></g>`;
    });
    for (let k = 0; k < 7; k++) {
      const x = 30 + k * 66 + rnd() * 16;
      const h = 28 + rnd() * 10;
      body += `<g transform="translate(${f(x)} ${f(152 + (k % 3) * 4)})"><g${once('grow', { delay: f(10.3 + rnd() * 1.4), dur: 1.2 })}>` +
        `<path d="M-1.5 0V-6H-11L-3 ${f(-h * 0.4)}H-8L-2 ${f(-h * 0.7)}H-5L0 ${f(-h)}L5 ${f(-h * 0.7)}H2L8 ${f(-h * 0.4)}H3L11 -6H1.5V0Z" fill="#3f6656" opacity="0.75"/></g></g>`;
    }
    body += l.body + during(0, 5.6, tag(196, 84, 'Wachs', 4.4), 0.4);
    // Close up: the cone shuts in the frost and opens in the dry sun.
    let close = `<rect width="${FILM_W}" height="${FILM_H}" fill="url(#${id}-close)"/>` +
      `<g opacity="0.3"><g transform="translate(70 250)">${bloomConifer(220, 70, '#4d7564', '#557d6b')}</g><g transform="translate(430 260)">${bloomConifer(250, 80, '#4d7564', '#557d6b')}</g></g>` +
      `<circle cx="400" cy="70" r="120" fill="url(#${id}-warm)"${once('fade', { delay: 6.4, dur: 0.8 })}/>` +
      `<path d="M240 206Q330 200 500 176" stroke="#5d4130" stroke-width="10" fill="none" stroke-linecap="round"/>` +
      `<path d="${bloomFrond(54, 6, 4, 300, 201, 1, 40)}${bloomFrond(54, 6, 4, 380, 193, 1, 50)}${bloomFrond(50, 6, 8, 340, 198, -1, 150)}${bloomFrond(46, 6, 10, 430, 188, -1, 140)}" fill="#2d5c48"/>`;
    close += `<g transform="translate(240 200)">${cone(6.0, 6.7)}</g>`;
    close += during(5.9, 6.6, bloomSnow(12, 4, 5.8) + `<g transform="translate(240 140)">${[[-22, -40], [18, -20], [-16, 10], [20, 30], [0, -64]].map(([x, y], k) =>
      `<path d="M${x} ${y - 4}V${y + 4}M${x - 4} ${y}H${x + 4}" stroke="#ffffff" stroke-width="1.6"${mo('twinkle', { dur: 0.7, delay: -k * 0.2, o: 0.1 })}/>`).join('')}</g>`, 0.4);
    body += during(5.8, 9.0, close + sparkle(240, 118, '#fff3c4', 7.3, 1) + tag(300, 102, 'Zapfen', 6.5, 'start'), 0.5);
    return film(id, defs, body);
  };
}
