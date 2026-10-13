/* =============================================================================
 * SimEarth 2.0 — evolution film: marineAlgae
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A cell engulfs a cyanobacterium, which turns into its chloroplast and makes
 * sugar from light; the cell's daughters stay together as a red filament
 * (Bangiomorpha) held to the rock by a holdfast; then a meadow of red and
 * green algae breathes out oxygen.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  const ROSE = '#ec8f86';
  const ROSE_EDGE = '#b44f58';
  const PLASTID = '#a63a50';

  function mitochondrion(): string {
    return `<path d="M-8 -1C-8 -5 -2 -5.5 0 -3.4C2 -5.5 8 -5 8 -1C8 4.4 -8 4.4 -8 -1Z" fill="#f4a65e" stroke="#c46e34" stroke-width="1"/>` +
      `<path d="M-5.5 0l1.4 -2.2l1.4 4l1.4 -4l1.4 4l1.4 -4l1.4 4l1.4 -2.2" fill="none" stroke="#a5521e" stroke-width="0.9" stroke-linejoin="round"/>`;
  }

  /** The host: a cell with nucleus and mitochondria, radius 46 around (0, 0). */
  function host(id: string): string {
    const rnd = seeded(41);
    let granules = '';
    for (let k = 0; k < 9; k++) {
      const a = rnd() * 6.28, r = 12 + rnd() * 28;
      granules += `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="${f(0.8 + rnd() * 1.2)}" fill="#fff8e0" opacity="0.55"/>`;
    }
    return `<circle r="46" fill="url(#${id}-cyto)" stroke="${PAL.cream}" stroke-width="2.6" stroke-opacity="0.9"/>` + granules +
      seaAt(-16, -10, `<circle r="14" fill="${PAL.violet}" stroke="#e4d6ff" stroke-width="1.6"/><circle cx="3" cy="-3" r="4.6" fill="#6f4bc0"/>` +
        `<path d="M-8 5q2.5 -3 5 0t5 0" stroke="#7d58cc" stroke-width="1" fill="none"/>`) +
      seaAt(-2, -34, mitochondrion(), ' rotate(-12) scale(0.8)') + seaAt(37, -16, mitochondrion(), ' rotate(30) scale(0.7)');
  }

  /** A cyanobacterium: blue-green, thylakoid membranes running round inside. */
  function cyano(): string {
    return `<ellipse rx="14" ry="11" fill="#2fa597" stroke="#1d7a72" stroke-width="1.6"/>` +
      `<ellipse rx="10" ry="7.4" fill="none" stroke="#a6eadb" stroke-width="1.1" opacity="0.8"/>` +
      `<ellipse rx="5.8" ry="3.8" fill="none" stroke="#a6eadb" stroke-width="1.1" opacity="0.8"/>`;
  }

  /** The chloroplast it becomes: green, a double membrane, thylakoid membranes inside. */
  function chloroplast(): string {
    return `<ellipse rx="16" ry="11" fill="#72cc5a" stroke="#eaffd8" stroke-width="1.5"/>` +
      `<ellipse rx="13.4" ry="8.6" fill="none" stroke="#3f9a3a" stroke-width="1"/>` +
      `<path d="M-10 -4Q0 -6 10 -4M-11.5 0Q0 -2 11.5 0M-10 4Q0 2 10 4" fill="none" stroke="#2f7a2f" stroke-width="1.5" stroke-linecap="round"/>`;
  }

  /** One cell of the red filament, w × h around (0, 0), with its star-shaped plastid. */
  function redCell(w: number, h: number): string {
    return `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${w}" height="${h}" rx="${f(h * 0.4)}" fill="${ROSE}" stroke="${ROSE_EDGE}" stroke-width="1.4"/>` +
      `<path d="M-6 0L-2 -2L0 -${f(h * 0.3)}L2 -2L6 0L2 2L0 ${f(h * 0.3)}L-2 2Z" fill="${PLASTID}"/><circle r="1.6" fill="#f6c6c0"/>`;
  }

  /** The meadow: red filament tufts and branched green algae, rooted at (0, 0). */
  function redTuft(h: number): string {
    let out = '';
    for (const [dx, bend] of [[-3, -9], [0, 1], [3, 9]] as const) {
      out += `<path d="M${dx} 0Q${dx + bend} ${f(-h * 0.5)} ${f(dx + bend * 0.7)} ${-h}"/>`;
    }
    return `<g fill="none" stroke="#d46a6a" stroke-width="3" stroke-dasharray="4 1.3" stroke-linecap="round">${out}</g>`;
  }

  function greenFrond(h: number): string {
    let side = '';
    for (let k = 1; k < 5; k++) {
      const y = -h * k / 5, s = k % 2 ? 1 : -1;
      side += `<path d="M0 ${f(y)}q${s * 5} -3 ${s * 9} -${f(h * 0.16)}"/>`;
    }
    return `<g fill="none" stroke="#5fb04a" stroke-width="2.6" stroke-linecap="round"><path d="M0 0Q-3 ${f(-h / 2)} 0 ${-h}"/>${side}</g>`;
  }

  EVO_FILMS.marineAlgae = (): string => {
    const id = 'marineAlgae';
    const water = underwater(id, 0.05);
    let body = water.body;

    /* Beat 4, drawn behind everything: the meadow, faded in after 9 s. */
    const rnd = seeded(12);
    let meadow = hills(176, 14, '#3a8d92', 9, 0.4) +
      `<path d="M0 270L0 200Q120 190 240 198T480 194L480 270Z" fill="#c7b17e"/>` +
      `<path d="M0 200Q120 190 240 198T480 194" fill="none" stroke="#7f9a5a" stroke-width="4" opacity="0.7"/>`;
    for (const [x, w, h] of [[66, 54, 24], [418, 62, 28]] as const) {
      let rings = '';
      for (let k = 1; k < 4; k++) rings += `<path d="M${f(x - w / 2 + k * 5)} 200Q${x} ${f(200 - h * 2 + k * 14)} ${f(x + w / 2 - k * 5)} 200"/>`;
      meadow += `<path d="M${x - w / 2} 201Q${x} ${200 - h * 2} ${x + w / 2} 201Z" fill="#a89470"/><g fill="none" stroke="#8a7656" stroke-width="1.4">${rings}</g>`;
    }
    for (let x = 34; x < 460; x += 32) {
      if (Math.abs(x - 240) < 18) continue;
      const h = 34 + rnd() * 30, red = Math.round(x / 32) % 2 === 0;
      meadow += seaAt(x + rnd() * 8, 199 + rnd() * 6, `<g${mo('sway', { rot: 5, dur: f(2.6 + rnd() * 1.6), delay: f(-rnd() * 3) })}>${red ? redTuft(h) : greenFrond(h)}</g>`);
    }
    for (const [x, y, k] of [[112, 160, 1], [196, 158, 2], [300, 156, 3], [352, 160, 4], [430, 164, 5]] as const) {
      meadow += bubbles(4, x, y, 14, 110, 9.3 + k * 0.15, 30 + k, 'rgba(235,255,250,0.9)');
    }
    body += during(9.0, Infinity, meadow, 0.8);

    /* Beats 1–3: a rock surface, close up, where the filament will grow. */
    let micro = `<path d="M110 270L118 226Q132 206 186 203L292 200Q336 202 352 226L364 270Z" fill="url(#${id}-rock)"/>` +
      `<path d="M150 236Q186 228 214 240M268 230Q300 224 330 238" fill="none" stroke="#5a5246" stroke-width="2" opacity="0.5"/>`;
    // The holdfast: the bottom cell turns pale and grips the rock with rhizoids.
    const rhizoids = ['M232 199q-7 7 -16 9', 'M240 201q1 9 -4 17', 'M248 199q7 7 15 8'].map((d) =>
      `<path d="${d}" fill="none" stroke="#f4d6c8" stroke-width="3" stroke-linecap="round"${once('draw', { len: 24, delay: 7.4, dur: 0.8 })}/>`).join('');
    micro += rhizoids + during(5.9, 7.5, seaAt(240, 190, redCell(30, 22)), 0.4) +
      during(7.4, Infinity, seaAt(240, 190, `<rect x="-15" y="-11" width="30" height="22" rx="9" fill="#f6d8cc" stroke="${ROSE_EDGE}" stroke-width="1.4"/>`), 0.5);
    // The daughters stay joined: cell after cell, inside one sheath.
    micro += `<g${once('grow', { delay: 6.1, dur: 2.4, ease: 'linear', origin: '50% 100%' }, 'marineAlgae-up')}>` +
      `<rect x="222" y="74" width="36" height="128" rx="15" fill="${ROSE}" fill-opacity="0.14" stroke="#f6b8ae" stroke-opacity="0.7" stroke-width="1.4"/></g>`;
    for (let k = 1; k <= 6; k++) {
      micro += seaAt(240, 179 - 17 * k + 8.5, `<g${once('grow', { delay: f(6.15 + (k - 1) * 0.36), dur: 0.5, origin: '50% 100%' })}>${redCell(30, 16)}</g>`);
    }
    body += seaAt(240, 201, seaPivot(once('scale', { s: 0.3, delay: 9, dur: 1.4 }), seaAt(-240, -201, micro), 210));
    body += sparkle(240, 180, '#fff2d6', 6.3);
    body += during(0, 9, tag(262, 196, 'Haftzelle', 7.6, 'start'), 0.4);
    body += tag(318, 90, 'O₂', 10, 'start');

    /* Beats 1–2: the host cell engulfs the cyanobacterium. */
    const arms = ['M24 -38Q62 -48 74 -12Q75 -4 67 -6Q58 -23 38 -16', 'M24 36Q62 46 74 10Q75 2 67 4Q58 21 38 14'].map((d) =>
      `<g${once('fadeout', { delay: 2.5, dur: 0.6 })}><g${once('grow', { delay: 1.1, dur: 0.9, origin: '0% 50%' })}><path d="${d}Z" fill="${PAL.cream}" fill-opacity="0.22"/>` +
      `<path d="${d}" fill="none" stroke="${PAL.cream}" stroke-opacity="0.9" stroke-width="2.4" stroke-linecap="round"/></g></g>`).join('');
    const symbiont = seaAt(62, -1, `<g${once('enter', { dx: 120, dy: -46, dur: 1.4, delay: 0.1 })}><g${once('move', { dx: -42, dy: 7, delay: 2, dur: 0.9 })}>` +
      during(3.4, Infinity, `<circle r="24" fill="url(#${id}-glow)"${mo('pulse', { dur: 1.4, s: 1.2 })}/>`, 0.8) +
      during(0, 3.8, cyano(), 0.8) + during(3.2, Infinity, chloroplast(), 0.8) + '</g></g>');
    // Sugar: little hexagons leave the chloroplast and spread through the cell.
    let sugar = '';
    for (const [x, y, d] of [[4, 31, 4.0], [24, -28, 4.3], [-32, 20, 4.6], [-10, 24, 4.9], [-33, -21, 5.1]] as const) {
      sugar += seaAt(x, y, `<g${once('enter', { dx: 20 - x, dy: 6 - y, delay: d, dur: 0.6 })}>` +
        `<path d="${seaHex(0, 0, 6)}" fill="#fff2b8" fill-opacity="0.7" stroke="${PAL.gold}" stroke-width="1.8"/></g>`);
    }
    const tint = `<circle r="46" fill="${ROSE}" stroke="${ROSE_EDGE}" stroke-width="4"${once('fade', { delay: 5.5, dur: 0.6 })}/>`;
    body += during(0, 6.1, seaAt(240, 118, `<g${once('move', { dy: 72, delay: 5.1, dur: 0.9 })}>` +
      seaPivot(once('scale', { s: 0.34, delay: 5.1, dur: 0.9 }), `<g${mo('float', { amp: 2, dur: 3 })}>${host(id)}${arms}${symbiont}${sugar}${tint}</g>`, 190) + '</g>'), 0.4);
    body += during(0, 5.1, tag(298, 128, 'Chloroplast', 3.8, 'start'), 0.4);

    // Sunlight: packets of light run down three beams into the chloroplast.
    let light = '';
    for (const [x0, d0] of [[206, 3.6], [262, 3.9], [322, 3.75]] as const) {
      const dx = 260 - x0, dy = 124, len = Math.hypot(dx, dy), a = Math.atan2(-dx, dy) * 180 / Math.PI;
      let packets = `<path d="M0 0L0 ${f(len - 16)}" stroke="#ffe9a0" stroke-width="7" opacity="0.18" stroke-linecap="round"/>`;
      for (let k = 0; k < 3; k++) {
        packets += `<ellipse rx="1.8" ry="5.5" fill="#fff0b0"${mo('rise', { dy: f(len - 18), dur: 1.1, delay: f(d0 + k * 0.37), ease: 'linear', o: 1 })}/>`;
      }
      light += seaAt(x0, 0, packets, ` rotate(${f(a)})`);
    }
    body += during(3.5, 5.2, light, 0.5);

    const defs = water.defs + glowGrad(`${id}-glow`, '#d8ff9a', 0.7) +
      `<radialGradient id="${id}-cyto"><stop offset="0.5" stop-color="${PAL.cream}" stop-opacity="0.14"/><stop offset="1" stop-color="${PAL.cream}" stop-opacity="0.45"/></radialGradient>` +
      vgrad(`${id}-rock`, [[0, '#9a8f7c'], [1, '#5f574b']]);
    return film(id, defs, body);
  };
}
