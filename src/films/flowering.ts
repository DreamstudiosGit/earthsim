/* =============================================================================
 * SimEarth 2.0 — evolution film: flowering
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * In an all-green world of conifers and ferns a bud swells, the sepals part
 * and the first flower opens petal by petal; a beetle dusted with pollen
 * carries it to the next flower, whose ovary swells into a fruit.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  const OPEN = [0, -26, 26, -52, 52, -78, 78];
  const SHUT = [0, -4, 4, -8, 8, -11, 11];

  /** A small fern of three arching fronds rooted at (x, y), swaying. */
  function fern(x: number, y: number, len: number, color: string, dur: number): string {
    const d = bloomFrond(len, len * 0.2, len * 0.35, x, y, -1, 55) + bloomFrond(len, len * 0.2, len * 0.35, x, y, 1, 60) + bloomFrond(len * 1.1, len * 0.2, len * 0.2, x, y, 1, 100);
    return `<path d="${d}" fill="${color}"${mo('sway', { rot: 3, dur })}/>`;
  }

  /** A shrub on (0, 0) whose stem ends at (0, -h): a few broad, simple leaves. */
  function shrub(h: number): string {
    let leaves = '';
    for (const [y, side, len] of [[0.25, -1, 30], [0.4, 1, 32], [0.58, -1, 26], [0.72, 1, 22]] as const) {
      const [x0, y0] = [0, -h * y];
      leaves += `<path d="M${x0} ${f(y0)}q${side * len * 0.5} ${-len * 0.45} ${side * len} ${-len * 0.2}q${-side * len * 0.45} ${len * 0.35} ${-side * len} ${len * 0.2}Z"/>`;
    }
    return `<path d="M0 0Q-6 ${f(-h / 2)} 0 ${-h}" stroke="#4f6e34" stroke-width="3.4" fill="none"/><g fill="#3f7a3c">${leaves}</g>`;
  }

  /**
   * A flower on its receptacle (0, 0), seen from the side: petals shut
   * like a bud until `open`, then fanning out one by one; stamens and the
   * green ovary in the middle. `fall` > 0 drops the petals at that time.
   */
  function flower(L: number, open: number, fall = 0): string {
    let petals = '';
    OPEN.forEach((a, k) => {
      let p = `<g transform="rotate(${SHUT[k]})"><g${once('rotate', { rot: a - SHUT[k], delay: f(open + k * 0.14), dur: 0.9, origin: '50% 100%' })}>` +
        `<path d="M0 0C${f(-L * 0.42)} ${f(-L * 0.3)} ${f(-L * 0.3)} ${f(-L)} 0 ${f(-L)}C${f(L * 0.3)} ${f(-L)} ${f(L * 0.42)} ${f(-L * 0.3)} 0 0Z" fill="url(#flowering-petal)" stroke="#e7a2bd" stroke-width="0.8"/></g></g>`;
      if (fall) p = during(0, fall + 0.9, `<g${once('move', { dx: f(a * 0.4), dy: 90, delay: f(fall + k * 0.07), dur: 1.3, ease: 'ease-in' })}>${p}</g>`, 0.5);
      petals += p;
    });
    let stamens = '';
    for (let k = 0; k < 9; k++) {
      const a = ((-62 + k * 15.5) * Math.PI) / 180;
      const [x, y] = [Math.sin(a) * L * 0.45, -Math.cos(a) * L * 0.42 - 2];
      stamens += `<path d="M0 -2L${f(x)} ${f(y)}" stroke="#f3e6c0" stroke-width="1.4"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="2.6" ry="3.4" fill="#f6c43a"/>`;
    }
    stamens = `<g${once('pop', { delay: open + 0.6, dur: 0.6 })}>${stamens}</g>`;
    if (fall) stamens = during(0, fall + 0.3, stamens);
    return petals + stamens + `<g${fall ? once('scale', { s: 3.2, delay: fall + 0.3, dur: 1.2, origin: '50% 100%' }) : ''}>` +
      `<ellipse cy="-7" rx="5" ry="7.5" fill="#7fb04c"/>${fall ? `<ellipse cy="-7" rx="5" ry="7.5" fill="#e0632f"${once('fade', { delay: fall + 0.8, dur: 1 })}/>` : ''}` +
      `<path d="M0 -14V-18" stroke="#c7d86a" stroke-width="2.4" stroke-linecap="round"/></g>`;
  }

  /** Two green sepals hugging the bud; they part at `part`. */
  function sepals(L: number, part: number): string {
    return [-1, 1].map((s) => `<g transform="rotate(${s * 11})"><g${once('rotate', { rot: s * 112, delay: part, dur: 1.6, origin: '50% 100%' })}>` +
      `<g${once('scale', { s: 0.45, delay: part + 0.5, dur: 1.2, origin: '50% 100%' })}>` +
      `<path d="M0 0C${f(-L * 0.5)} ${f(-L * 0.3)} ${f(-L * 0.3)} ${f(-L * 1.02)} 0 ${f(-L * 1.08)}C${f(L * 0.3)} ${f(-L * 1.02)} ${f(L * 0.5)} ${f(-L * 0.3)} 0 0Z" fill="#5e9a44" stroke="#4a8236" stroke-width="1"/></g></g></g>`).join('');
  }

  /** An early pollinator from above: a beetle, wings whirring while it flies (`flights` as [from, to]). */
  function beetle(flights: readonly (readonly [number, number])[], pollen: number, drop: number): string {
    const wings = `<g${mo('flap', { dur: 0.06, s: 0.2, origin: '50% 50%' })}><ellipse cx="-11" cy="-2" rx="12" ry="5" fill="rgba(230,245,255,0.8)" transform="rotate(-20 -11 -2)"/>` +
      `<ellipse cx="11" cy="-2" rx="12" ry="5" fill="rgba(230,245,255,0.8)" transform="rotate(20 11 -2)"/></g>`;
    let dots = '';
    [[-3, -2], [3, 1], [-2, 5], [4, -5], [0, 9], [-4, -7]].forEach(([x, y], k) => {
      dots += `<circle cx="${x}" cy="${y}" r="1.7" fill="#ffd84a"${once('pop', { delay: f(pollen + k * 0.1) })}/>`;
    });
    return `<path d="M-6 -6l-6 -3M-6 0l-7 1M-6 6l-6 4M6 -6l6 -3M6 0l7 1M6 6l6 4" stroke="${PAL.ink}" stroke-width="1.3" stroke-linecap="round"/>` +
      flights.map(([a, b]) => during(a, b, wings, 0.2)).join('') +
      `<ellipse rx="9" ry="12" fill="#2e5b3e"/><path d="M0 -10V12" stroke="#183626" stroke-width="1.4"/><path d="M-4 -6Q-3 -9 0 -9" stroke="#7fb58e" stroke-width="1.2" fill="none"/>` +
      `<circle cy="-13" r="4.6" fill="#24442f"/><path d="M-2 -16l-4 -6M2 -16l4 -6" stroke="${PAL.ink}" stroke-width="1.1" fill="none"/>` +
      during(0, drop, dots, 0.4);
  }

  EVO_FILMS.flowering = (): string => {
    const id = 'flowering';
    const [s, glow] = [sky(id, '#6aa3c0', '#e3efe2'), sun(id, 412, 74, 12)];
    const defs = s.defs + glow.defs + vgrad(`${id}-petal`, [[0, '#fff7f2'], [0.55, '#fbd3e2'], [1, '#e9739e']]) + glowGrad(`${id}-bloom`, '#ff9cc0', 0.75);
    let body = s.body + glow.body + hills(160, 16, '#8fb5a4', 5, 0.7);
    // The world before flowers: conifers and ferns, every shade of green.
    for (const [x, h, w] of [[40, 70, 20], [108, 52, 16], [300, 64, 18], [446, 76, 22], [236, 46, 14]] as const) {
      body += `<g transform="translate(${x} 176)" opacity="0.75">${bloomConifer(h, w, '#3d6e55', '#467a5e')}</g>`;
    }
    body += hills(190, 10, '#6f9f58', 8) + `<path d="M0 210Q120 202 240 208T480 204V270H0Z" fill="#5b8c48"/>`;
    for (const [x, y, len, d] of [[40, 232, 26, 3.2], [270, 226, 22, 3.8], [450, 234, 28, 3.5], [110, 240, 20, 4.1]] as const) body += fern(x, y, len, '#3f7f3c', d);
    // The first flower: the bud swells (the empty rect pins its scaling to the receptacle).
    const L = 36;
    body += `<g transform="translate(180 222)">${shrub(100)}</g>`;
    body += `<g transform="translate(180 122)">` + during(6.2, 9.4, `<circle cy="-14" r="44" fill="url(#${id}-bloom)"/>`, 0.8) +
      `<circle cy="-14" r="30" fill="none" stroke="#ffb3cf" stroke-width="3"${once('burst', { delay: 6.3, s: 2.4 })}/>` +
      `<g transform="scale(0.5)"><g${once('scale', { s: 2, delay: 3.1, dur: 2.2, origin: '50% 66.667%' })}><rect x="-80" y="-80" width="160" height="120" fill="none"/>` +
      `${flower(L, 6.0)}${sepals(L, 4.5)}</g></g></g>`;
    // The next flower opens too; there the petals will fall and the ovary will swell.
    body += `<g transform="translate(362 222)">${shrub(90)}</g><g transform="translate(362 132) scale(0.8)">${flower(L, 7.2, 10.5)}${sepals(L, 6.8)}</g>`;
    // Pollen floats up from the open stamens.
    body += during(6.9, Infinity, motes(id, 8, 'rgba(255,214,90,0.95)', 160, 200, 80, 110, 7, 1.3));
    // The beetle flies in, dusts itself, carries the pollen to the next flower, and leaves.
    const flights = [[7.0, 8.0], [9.0, 10.0], [10.6, 12]] as const;
    body += `<g transform="translate(180 112)"><g${once('move', { dx: 182, dy: 6, delay: 9.0, dur: 1.0 })}><g${once('move', { dx: 150, dy: -110, delay: 10.6, dur: 1.0, ease: 'ease-in' })}>` +
      `<g${once('enter', { dx: 230, dy: -70, delay: 7.0, dur: 1.0 })}><g transform="rotate(-10)">${beetle(flights, 8.2, 10.2)}</g></g></g></g></g>`;
    let given = '';
    for (const [x, y, k] of [[-3, -16, 0], [2, -17, 1], [0, -15, 2]] as const) {
      given += `<circle cx="${362 + x}" cy="${132 + y * 0.8}" r="1.8" fill="#ffd84a"${once('pop', { delay: 10.1 + k * 0.1 })}/>`;
    }
    body += during(0, 10.9, given, 0.4);
    body += sparkle(180, 108, '#fff1a8', 6.6, 1.1);
    body += tag(392, 118, 'Frucht', 11.0, 'start');
    return film(id, defs, body);
  };
}
