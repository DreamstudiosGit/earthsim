/* =============================================================================
 * SimEarth 2.0 — evolution film: earlyAnimals
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * Collar cells gather into a rosette; over generations a sponge, pumping water
 * through its pores; then a jellyfish whose nerve net fires as a wave of light
 * before its bell contracts; a stinging cell harpoons a small prey animal.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** A collar-flagellate cell, collar up: oval body, collar of microvilli, beating flagellum. */
  function choano(): string {
    return `<path d="M-3.5 -6L-8 -18L8 -18L3.5 -6Z" fill="#f6ead0" opacity="0.2"/>` +
      `<path d="M-3.5 -6L-8 -18M-1.2 -6.5L-2.8 -19M1.2 -6.5L2.8 -19M3.5 -6L8 -18" stroke="#f6ead0" stroke-width="1" opacity="0.9"/>` +
      `<g${mo('twist', { dur: 0.22 })}><path d="M0 -6q3 -4 0 -8t0 -8t0 -8" fill="none" stroke="#fff6dc" stroke-width="1.3" stroke-linecap="round"/></g>` +
      `<ellipse rx="6.5" ry="7.5" fill="#f2c08e" stroke="#c98a56" stroke-width="1.1"/><circle cy="1" r="2.4" fill="#b98ad8"/>`;
  }

  /** Six collar cells swim in, body first, and join as a rosette around (0, 0). */
  function rosette(): string {
    const rnd = seeded(4);
    let cells = '';
    for (let k = 0; k < 6; k++) {
      const a = k * 60 - 90;
      cells += seaAt(Math.cos(a * Math.PI / 180) * 11, Math.sin(a * Math.PI / 180) * 11,
        `<g${once('enter', { dx: f((rnd() - 0.5) * 50), dy: f(-70 - rnd() * 40), dur: 2.4, delay: f(rnd() * 0.3), ease: 'cubic-bezier(.4,.1,.4,1)' })}>${choano()}</g>`, ` rotate(${a + 90})`);
    }
    return seaPivot(mo('spin', { dur: 26 }), cells, 140);
  }

  /** A point on the left wall of the sponge (h tall, top w wide), s from 0 at the foot to 1 at the rim. */
  function wall(h: number, w: number, s: number): readonly [number, number] {
    const t = w / 2, u = 1 - s;
    return [u * u * u * -6 + 3 * u * u * s * -0.7 * t + 3 * u * s * s * -0.95 * t + s * s * s * -t, 3 * u * u * s * -0.25 * h + 3 * u * s * s * -0.6 * h + s * s * s * -h];
  }
  /** Pores along the left (-1) and right (1) wall, as [side, s]. */
  const PORES = [[-1, 0.38], [-1, 0.58], [-1, 0.78], [1, 0.46], [1, 0.66], [1, 0.86]] as const;

  /** A vase sponge standing on (0, 0): pores in the wall, an open top. */
  function sponge(h: number, w: number): string {
    const t = w / 2;
    let pores = '';
    for (const [side, s] of PORES) {
      const [x, y] = wall(h, w, s);
      pores += `<ellipse cx="${f(-side * x * 0.84)}" cy="${f(y)}" rx="3" ry="3.8" fill="#8f5530"/>`;
    }
    for (const [x, y] of [[-6, -40], [8, -58], [-4, -78], [10, -30]] as const) pores += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="3.2" fill="#a8683c" opacity="0.8"/>`;
    return `<path d="M-6 0C${f(-t * 0.7)} ${f(-h * 0.25)} ${f(-t * 0.95)} ${f(-h * 0.6)} ${-t} ${-h}L${t} ${-h}C${f(t * 0.95)} ${f(-h * 0.6)} ${f(t * 0.7)} ${f(-h * 0.25)} 6 0Z" fill="#f1c48f"/>` +
      `<path d="M1 0C${f(t * 0.4)} ${f(-h * 0.25)} ${f(t * 0.5)} ${f(-h * 0.6)} ${f(t * 0.55)} ${-h}L${t} ${-h}C${f(t * 0.95)} ${f(-h * 0.6)} ${f(t * 0.7)} ${f(-h * 0.25)} 6 0Z" fill="#d89a62" opacity="0.5"/>` +
      `<ellipse cy="${-h}" rx="${f(t + 1)}" ry="5.5" fill="#f6d3a4"/><ellipse cy="${f(-h + 0.5)}" rx="${f(t - 3.5)}" ry="3.4" fill="#7a4526"/>` + pores;
  }

  /** Water drawn in through the pores in the wall and pushed out of the top. */
  function spongeFlow(h: number, w: number): string {
    let out = '';
    PORES.forEach(([side, s], k) => {
      const [x, y] = wall(h, w, s);
      for (let j = 0; j < 3; j++) {
        out += seaAt(-side * x * 0.84, y, `<circle cy="-30" r="2.4" fill="#ffffff"${mo('rise', { dy: 28, dur: 1.3, delay: f(4.0 + k * 0.13 + j * 0.45), ease: 'linear', o: 1 })}/>`, ` rotate(${side * 90})`);
      }
    });
    for (let k = 0; k < 6; k++) out += `<circle cx="${f((k - 2.5) * 6)}" cy="${-h - 2}" r="2.6" fill="#ffffff"${mo('rise', { dy: -50, dur: 1.5, delay: f(4.3 + k * 0.26), o: 1 })}/>`;
    const arrows = `M-68 -66Q-52 -66 -40 -57M-46 -63L-39 -57L-48 -54M68 -70Q52 -70 42 -61M48 -67L41 -61L50 -58M0 ${-h - 12}L0 ${-h - 36}M-6 ${-h - 29}L0 ${-h - 37}L6 ${-h - 29}`;
    return out + `<path d="${arrows}" fill="none" stroke="#eafcff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"${once('fade', { delay: 4.2, dur: 0.6, o: 0.8 })}/>`;
  }

  /** The bell of a moon jelly with its rim at y 0, 120 wide. */
  const BELL = 'M-60 0C-62 -30 -32 -52 0 -52C32 -52 62 -30 60 0Q30 -7 0 0Q-30 -7 -60 0Z';

  /** The nerve net on the bell: it fires as a wave from the left rim, then rests, once a second. */
  function nerveNet(): string {
    const rnd = seeded(19);
    const rows = [[-8, 7], [-20, 6], [-32, 5], [-43, 3]] as const;
    const nodes = rows.map(([y, n]) => {
      const half = 55 * Math.sqrt(1 - (y / 53) ** 2);
      return Array.from({ length: n }, (_, k) => [-half + (2 * half * (k + 0.5)) / n + (rnd() - 0.5) * 5, y + (rnd() - 0.5) * 4] as const);
    });
    let out = '';
    nodes.forEach((row, r) => row.forEach(([x, y], k) => {
      let d = '';
      if (k + 1 < row.length) d += `M${f(x)} ${f(y)}L${f(row[k + 1][0])} ${f(row[k + 1][1])}`;
      for (const [nx, ny] of nodes[r + 1] ?? []) if (Math.abs(nx - x) < 22) d += `M${f(x)} ${f(y)}L${f(nx)} ${f(ny)}`;
      const delay = f(6.2 + 0.5 * Math.hypot(x + 58, y + 4) / 110);
      out += `<g${mo('twinkle', { dur: 1, delay }, 'earlyAnimals-flash')}>` +
        (d ? `<path d="${d}" stroke="#eafcff" stroke-width="1.6" fill="none"/>` : '') + `<circle cx="${f(x)}" cy="${f(y)}" r="2" fill="#ffffff"/></g>`;
    }));
    return out;
  }

  function jelly(): string {
    let tent = '';
    for (let k = 0; k < 8; k++) {
      tent += seaAt(-49 + k * 14, -2, `<path d="M0 0q-5 20 0 40t0 40" fill="none" stroke="#f6d4ec" stroke-width="1.3" opacity="0.85"${mo('sway', { rot: 7, dur: f(1.6 + (k % 3) * 0.35), origin: '50% 0%' })}/>`);
    }
    const arms = `<path d="M-6 -2q-9 18 -1 34q4 8 -2 16M6 -2q9 18 1 34q-4 8 2 16" fill="none" stroke="#e7a3d0" stroke-width="4" stroke-linecap="round" opacity="0.85"/>`;
    const gonads = [-26, -9, 9, 26].map((x) => `<path d="M${x - 6} -16a6 6 0 0 1 12 0" fill="none" stroke="#e48cc0" stroke-width="2.2" opacity="0.7"/>`).join('');
    const rim = [-58, -30, 0, 30, 58].map((x) => `<circle cx="${x}" cy="${x === 0 ? 0 : -2}" r="1.8" fill="#fff4c8"/>`).join('');
    const bell = `<path d="${BELL}" fill="#f6cfe8" opacity="0.62" stroke="#fff0f8" stroke-width="1.6"/>` + gonads + nerveNet() + rim;
    return tent + arms + `<g${mo('pulse', { dur: 1, delay: 6.45, origin: '50% 100%' }, 'earlyAnimals-bell')}>${bell}</g>`;
  }

  /** A small soft prey animal, a wriggling larva, facing left. */
  function larva(): string {
    return `<path d="M-9 0Q-8 -4 0 -4Q8 -4 10 0Q8 4 0 4Q-8 4 -9 0Z" fill="#f3c9a2" stroke="#c98d62" stroke-width="0.8"/>` +
      `<path d="M-3 -3.6v7.2M2 -3.8v7.6M6 -3v6" stroke="#c98d62" stroke-width="0.7"/><circle cx="-6" cy="-1" r="0.9" fill="${PAL.ink}"/>`;
  }

  /** Inside the lens: three stinging cells on the tentacle fire their harpoons into the prey. */
  function stingers(): string {
    let out = `<rect x="-60" y="-60" width="120" height="120" fill="#123a4a"/>` +
      `<path d="M-60 -60L-14 -60Q-6 0 -14 60L-60 60Z" fill="#f2c4e2"/><path d="M-14 -60Q-6 0 -14 60" fill="none" stroke="#fff0f8" stroke-width="2"/>` +
      `<path d="M22 -60Q12 0 22 60L60 60L60 -60Z" fill="#f3c9a2"/><path d="M19 -30L60 -34M16 0L60 0M19 30L60 34" stroke="#c98d62" stroke-width="1.4" fill="none"/>`;
    [-28, 0, 28].forEach((y, k) => {
      const t = 9.9 + k * 0.18;
      out += seaAt(-30, y, `<ellipse rx="11" ry="7" fill="#fff8f0" stroke="#c770a8" stroke-width="1.4"/>` +
        `<path d="M-6 0a3 3 0 1 1 6 0a5 5 0 1 1 -10 0a7 7 0 1 1 14 0" fill="none" stroke="#a04a88" stroke-width="1.1"${once('fadeout', { delay: t, dur: 0.2 })}/>` +
        `<path d="M11 0l7 -4" stroke="#a04a88" stroke-width="1.2"${once('fadeout', { delay: t, dur: 0.2 })}/>` +
        `<path d="M11 0L${f(54 - Math.abs(y) * 0.1)} ${f(y * 0.12)}" stroke="#a04a88" stroke-width="1.6"${once('draw', { len: 46, delay: t, dur: 0.18, ease: 'linear' })}/>` +
        seaAt(54 - Math.abs(y) * 0.1, y * 0.12, `<path d="M-4 -4L0 0L-4 4" fill="none" stroke="#a04a88" stroke-width="1.6"${once('fade', { delay: t + 0.15, dur: 0.1 })}/>`));
    });
    return out;
  }

  EVO_FILMS.earlyAnimals = (): string => {
    const id = 'earlyAnimals';
    const water = underwater(id, 0.2);
    let body = water.body + hills(206, 12, '#3f8794', 6, 0.4) +
      `<path d="M0 270L0 214Q120 206 240 212T480 210L480 270Z" fill="#c9b080"/>` +
      `<path d="M0 214Q120 206 240 212T480 210" fill="none" stroke="#8e9a60" stroke-width="4" opacity="0.7"/>`;

    // Beats 1–2: collar cells join as a colony; over generations it becomes a sponge.
    const colony = seaAt(200, 124, `<g${once('move', { dy: 40, delay: 2.7, dur: 1 })}>${seaAt(0, 0, rosette(), ' scale(1.5)')}</g>`);
    const sponge1 = seaAt(200, 214, sponge(104, 74) + spongeFlow(104, 74));
    body += during(0, 6, morph([colony, sponge1], [3.3], 0.7), 0.6);
    body += timelapse(330, 80, ['Generationen', 'Jahrmillionen'], [3.1, 4.3], 5.8);

    // Beat 3: a jellyfish; its nerve net fires, then the bell squeezes and lifts it.
    const jx = 250, jy = 132;
    body += seaAt(jx, jy, `<g${once('enter', { dy: 70, dx: 0, delay: 5.6, dur: 1 })}><g${once('move', { dy: -24, delay: 6.7, dur: 0.8, ease: 'cubic-bezier(.2,.8,.3,1)' })}>` +
      `<g${mo('float', { amp: 2, dur: 2.2, delay: 7.8 })}>${jelly()}</g></g></g>`);
    body += sparkle(jx - 14, jy - 28, '#eafcff', 6.4);
    body += tag(186, 96, 'Nervennetz', 6.8, 'end');

    // Beat 4: a larva brushes a tentacle; the stinging cells fire and it is hauled in.
    body += seaAt(jx + 48, jy - 26 + 82, `<g${once('enter', { dx: 120, dy: 10, delay: 8.4, dur: 1 })}><g${once('move', { dx: -40, dy: -70, delay: 10.8, dur: 1.2 })}>` +
      `<g${mo('sway', { rot: 18, dur: 0.3, delay: 8.4, n: 6, origin: '50% 50%' })}>${seaAt(0, 0, larva(), ' scale(1.8)')}</g></g></g>`);
    const glass = lens(`${id}-lens`, 392, 118, 50, stingers(), 9.4);
    body += glass.body + tag(372, 186, 'Nesselzelle', 10.3);

    return film(id, water.defs + glass.defs, body);
  };
}
