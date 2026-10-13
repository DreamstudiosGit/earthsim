/* =============================================================================
 * SimEarth 2.0 — evolution film: broadleaf
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * One tree through a year: leaves unfold in spring; in summer water rises
 * through the trunk and leaves the broad, veined leaves (lens); in autumn
 * they colour and fall and the water stays in the trunk; snow, then spring.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  const GROUND = 214;
  /** Twig tips of the crown and the direction each points (deg, 0 = right, -90 = up). */
  const TIPS = [[160, 96, -150], [186, 76, -110], [228, 68, -95], [264, 70, -70], [300, 80, -50], [324, 100, -25], [176, 122, -165], [306, 126, -10], [214, 94, -120], [272, 98, -60]] as const;

  /** A broad leaf of length L from its stalk at (x, y), pointing `deg` degrees from +x. */
  function leafPath(L: number, x = 0, y = 0, deg = 0): string {
    const [c, s] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
    const p = (u: number, v: number): string => `${f(x + u * c - v * s)} ${f(y + u * s + v * c)}`;
    return `M${p(0, 0)}C${p(L * 0.2, -L * 0.42)} ${p(L * 0.75, -L * 0.42)} ${p(L, 0)}C${p(L * 0.75, L * 0.42)} ${p(L * 0.2, L * 0.42)} ${p(0, 0)}Z`;
  }

  /** The bare tree: trunk with a see-through water channel, limbs and twigs. */
  function tree(): string {
    const limbs = 'M240 150L196 112L160 96M196 112L186 76M196 112L176 122M240 150L242 104L228 68M242 104L264 70M242 104L214 94M240 150L286 114L324 100M286 114L300 80M286 114L306 126M286 114L272 98';
    return `<path d="M231 ${GROUND}Q236 180 236 150L244 150Q244 180 249 ${GROUND}Z" fill="#6a4b33"/>` +
      `<path d="${limbs}" stroke="#6a4b33" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M240 ${GROUND - 2}V150" stroke="#cfe6ee" stroke-width="5" opacity="0.35"${once('fade', { delay: 3.2, dur: 0.8 })}/>`;
  }

  /** The lens view: a broad leaf with its fine, branching net of veins. */
  function veins(): string {
    let side = '';
    for (let k = 0; k < 5; k++) {
      const x = -48 + k * 22;
      side += `M${x} 0Q${x + 10} -14 ${x + 22} -30M${x} 0Q${x + 10} 14 ${x + 22} 30`;
    }
    let net = '';
    for (let k = 0; k < 9; k++) {
      const x = -40 + k * 11;
      net += `M${x} -10L${x + 6} -20L${x + 13} -14M${x} 10L${x + 6} 20L${x + 13} 14M${x + 6} -20L${x + 2} -30M${x + 6} 20L${x + 2} 30`;
    }
    return `<g transform="rotate(-18)"><path d="M-70 0C-40 -56 50 -56 80 0C50 56 -40 56 -70 0Z" fill="#5fae55"/>` +
      `<path d="${net}" stroke="#bfe39a" stroke-width="0.9" fill="none"${once('draw', { len: 40, delay: 4.6, dur: 1 })}/>` +
      `<path d="${side}" stroke="#d8f0a8" stroke-width="1.8" fill="none"${once('draw', { len: 40, delay: 4.1, dur: 0.8 })}/>` +
      `<path d="M-80 0H80" stroke="#e6f6be" stroke-width="3"${once('draw', { len: 160, delay: 3.8, dur: 0.6 })}/></g>`;
  }

  EVO_FILMS.broadleaf = (): string => {
    const id = 'broadleaf';
    const [s, glow] = [sky(id, '#3f8ab4', '#e8f2e0'), sun(id, 420, 84, 12)];
    const l = lens(`${id}-l`, 92, 128, 52, veins(), 3.5, 6.0);
    const defs = s.defs + glow.defs + l.defs + vgrad(`${id}-ground`, [[0, '#7c9a52'], [1, '#556f3a']]) +
      `<linearGradient id="${id}-ray" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.4"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>`;
    let body = s.body + glow.body;
    // Winter greys the sky, until spring.
    body += during(8.8, 10.9, `<rect width="${FILM_W}" height="${FILM_H}" fill="#5c6f84" opacity="0.45"/>`, 0.6);
    body += hills(176, 14, '#9cbca8', 14, 0.7);
    // Evergreen conifers on the hills keep their needles all year.
    for (const [x, h] of [[46, 46], [90, 34], [380, 40], [452, 52]] as const) body += `<g transform="translate(${x} 186)" opacity="0.7">${bloomConifer(h, 13, '#3d6e55', '#467a5e')}</g>`;
    body += `<path d="M0 ${GROUND - 6}Q120 ${GROUND - 14} 240 ${GROUND - 4}T480 ${GROUND - 8}V270H0Z" fill="url(#${id}-ground)"/>`;
    body += during(9.2, 10.9, `<path d="M0 ${GROUND - 6}Q120 ${GROUND - 14} 240 ${GROUND - 4}T480 ${GROUND - 8}V270H0Z" fill="#f2f6f8"/>`, 0.8);
    // Summer: sunbeams on the crown.
    body += during(3.0, 6.2, [[0, 60], [30, 110], [-30, 20]].map(([dx, w]) => `<path d="M${420 + dx} 84L${170 + w} 70L${200 + w} 150Z" fill="url(#${id}-ray)"${mo('twinkle', { dur: 1.6, o: 0.5 })}/>`).join(''), 0.6);
    body += tree();
    // Summer: water rises through the trunk and leaves the leaves as vapour.
    const rnd = seeded(17);
    let flow = '';
    for (let k = 0; k < 5; k++) flow += `<g transform="translate(240 ${GROUND - 4})"><circle r="2.4" fill="#6cc2ef"${mo('rise', { dy: -66, dur: 1.4, delay: f(3.2 + k * 0.28), o: 1, ease: 'linear' })}/></g>`;
    for (let k = 0; k < 9; k++) {
      const [x, y] = [TIPS[k][0] + (rnd() - 0.5) * 20, TIPS[k][1] - 6];
      flow += `<g transform="translate(${f(x)} ${f(y)})"><circle r="1.8" fill="#bfe6f6"${mo('rise', { dy: -30, dur: 1.6, delay: f(3.6 + rnd() * 1.2), o: 0.9 })}/></g>`;
    }
    body += during(3.1, 6.4, flow, 0.5);
    // Leaves unfold, turn yellow, orange and red, and fall; they lie on the ground until the snow.
    const fall = ['#f2c040', '#e8812e', '#c8402a', '#e9a23a', '#d65a2a'];
    let leaves = '';
    let k = 0;
    for (const [tx, ty, dir] of TIPS) {
      for (const spread of [-50, 0, 50]) {
        const [L, a] = [24 + rnd() * 6, dir + spread + (rnd() - 0.5) * 16];
        const [x, y] = [tx + (rnd() - 0.5) * 6, ty + (rnd() - 0.5) * 6];
        const t = 6.7 + rnd() * 1.5;
        leaves += `<g${once('move', { dx: f((rnd() - 0.3) * 50), dy: f(GROUND + 2 + rnd() * 8 - y), delay: f(t), dur: f(1.3 + rnd() * 0.6), ease: 'ease-in' })}>` +
          `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><g${once('grow', { delay: f(0.4 + rnd() * 1.8), dur: 1, origin: '0% 50%' })}><g${once('rotate', { rot: f(160 + rnd() * 200), delay: f(t), dur: 1.6 })}>` +
          `<path d="${leafPath(L)}" fill="${['#4f9a4a', '#5fae55', '#468c43'][k % 3]}"/><path d="${leafPath(L)}" fill="${fall[k % 5]}"${once('fade', { delay: f(6.0 + rnd() * 0.6), dur: 0.6 })}/></g></g></g></g>`;
        k++;
      }
    }
    body += during(0, 9.6, leaves, 0.8);
    // The water stays in the trunk.
    body += `<g transform="translate(240 180)"><g${once('pop', { delay: 7.2 })}><g${mo('pulse', { dur: 1.2, s: 1.15, delay: 7.8, origin: '50% 70%' })}>` +
      `<path d="M0 -10Q7 -1 7 4A7 7 0 1 1 -7 4Q-7 -1 0 -10Z" fill="#6cc2ef" stroke="#e8f8ff" stroke-width="1.4"/><circle cx="-2.4" cy="2" r="1.6" fill="#ffffff" opacity="0.8"/></g></g></g>`;
    body += sparkle(240, 182, '#e8f8ff', 7.6, 1);
    // Winter: snow on the bare limbs; then spring green again.
    body += during(9.3, 10.9, `<path d="M240 147L196 109L160 93M196 109L186 73M240 147L242 101L228 65M242 101L264 67M240 147L286 111L324 97M286 111L300 77" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      bloomSnow(16, 9, 8.9), 0.7);
    TIPS.forEach(([tx, ty, dir], j) => {
      body += `<path d="${[-45, 5, 50].map((sp) => leafPath(18, tx, ty, dir + sp)).join('')}" fill="#8fd46c"${once('pop', { delay: f(10.9 + j * 0.08), dur: 0.6 })}/>`;
    });
    body += l.body + during(0, 6.0, tag(92, 196, 'Blattadern', 4.2), 0.5) + during(0, 9.2, tag(340, 140, 'Laubwurf', 7.1, 'start'), 0.5);
    body += timelapse(318, 62, ['Frühling', 'Sommer', 'Herbst', 'Winter', 'Frühling'], [0.3, 3.0, 6.0, 9.0, 10.8]);
    return film(id, defs, body);
  };
}
