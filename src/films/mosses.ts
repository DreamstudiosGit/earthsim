/* =============================================================================
 * SimEarth 2.0 — evolution film: mosses (drying out and coming back)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. A plump moss cushion on a
 * bare boulder, every little shoot with its spread leaves; the sun blazes and
 * the cushion shrinks, its leaves curl tight against the stems and it turns
 * brown-grey; rain falls and within seconds it swells and is green again;
 * then spore capsules rise on thin stalks, their lids pop and spores puff out.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** The hero cushion sits on the boulder top at (CX, CY). */
  const CX = 240;
  const CY = 170;
  const HALF = 78;

  /** One leaf as path data: from (x, y) along angle a (0 = up), length l, half-width w, bent by `bend`. */
  function leaf(x: number, y: number, a: number, l: number, w: number, bend = 0): string {
    const [dx, dy] = [Math.sin(a), -Math.cos(a)];
    const [px, py] = [-dy, dx];
    const [mx, my] = [x + dx * l * 0.5 + px * bend, y + dy * l * 0.5 + py * bend];
    const [tx, ty] = [x + dx * l + px * bend * 1.6, y + dy * l + py * bend * 1.6];
    return `M${f(x)} ${f(y)}Q${f(mx + px * w)} ${f(my + py * w)} ${f(tx)} ${f(ty)}Q${f(mx - px * w)} ${f(my - py * w)} ${f(x)} ${f(y)}Z`;
  }

  /**
   * A moss cushion of half-width w and height h on (0, 0), in one state: a
   * dome whose surface is a mosaic of shoot tips. Wet, every tip is a little
   * star of spread leaves; dry, the leaves twist into a tight knot with pale
   * hair-points.
   */
  function cushion(w: number, h: number, wet: boolean): string {
    const d = w / 5.2;
    const pts: [number, number][] = [];
    for (let row = 0, y = -h + d * 0.35; y < -d * 0.3; row++, y += d * 0.8) {
      const half = w * Math.sqrt(1 - (y / h) ** 2) - d * 0.15;
      const n = Math.max(1, Math.round((2 * half) / d));
      for (let k = 0; k <= n; k++) pts.push([-half + (2 * half * k) / n + (k > 0 && k < n && row % 2 ? d * 0.2 : 0), y]);
    }
    const rnd = seeded(Math.round(w));
    let bumps = '';
    let leaves = '';
    let hairs = '';
    for (const [x, y] of pts) {
      const r = d * (wet ? 0.5 : 0.38);
      bumps += `M${f(x - r)} ${f(y + 1)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;
      const spin = rnd() * 6;
      if (wet) {
        for (let k = 0; k < 6; k++) {
          const a = spin + (k * Math.PI * 2) / 6;
          leaves += leaf(x, y, Math.PI / 2 - a, d * 0.62, d * 0.13);
        }
      } else {
        for (const a of [-0.35, 0, 0.35]) {
          const lean = a + (rnd() - 0.5) * 0.3;
          leaves += leaf(x, y + 1, lean, d * 0.42, d * 0.08, (rnd() - 0.5) * 2);
          hairs += `M${f(x + Math.sin(lean) * d * 0.4)} ${f(y + 1 - Math.cos(lean) * d * 0.4)}l${f(Math.sin(lean) * d * 0.2)} ${f(-Math.cos(lean) * d * 0.2)}`;
        }
      }
    }
    const [dome, bump, fill] = wet ? ['#2c6421', '#3f7f2c', '#8ccf50'] : ['#4f4637', '#62574a', '#a3946c'];
    return `<path d="M${-w} 0A${w} ${h} 0 0 1 ${w} 0Z" fill="${dome}"/><path d="${bumps}" fill="${bump}"/>` +
      `<path d="${leaves}" fill="${fill}" stroke="${wet ? '#5a9a34' : '#7d6f52'}" stroke-width="0.5"/>` +
      (hairs ? `<path d="${hairs}" stroke="#ece6d4" stroke-width="1" stroke-linecap="round"/>` : '');
  }

  /** Wet, then dry from 3.4 s (shrunk), then wet again from 6.5 s (swollen back). */
  function drying(wet: string, dry: string): string {
    return `<g${once('squash', { s: 0.8, delay: 3.4, dur: 1.5 }, 'green-squash')}><g${once('squash', { s: 1.25, delay: 6.5, dur: 0.9 }, 'green-squash')}>` +
      during(0, 3.6, wet, 1.2) + during(3.6, 6.6, dry, 1.2) + during(6.6, Infinity, wet, 0.8) + '</g></g>';
  }

  /** A moss sporophyte: a thin red-brown stalk, a nodding capsule; its lid pops at `pop`, spores puff out. */
  function sporophyte(x: number, y: number, h: number, lean: number, grow: number, pop: number, seed: number): string {
    const tilt = 55 + lean * 2;
    const [cx, cy] = [x + lean, y - h];
    const rad = (tilt * Math.PI) / 180;
    const [mx, my] = [cx + Math.sin(rad) * 14, cy - Math.cos(rad) * 14];
    const rnd = seeded(seed);
    let spores = '';
    for (let k = 0; k < 12; k++) {
      spores += `<circle cx="${f(mx)}" cy="${f(my)}" r="${f(1.6 + rnd() * 1)}" fill="#d6b24e" stroke="#8a6a24" stroke-width="0.5"` +
        `${mo('travel', { dx: f(30 + rnd() * 70), dy: f(-30 - rnd() * 50), dur: f(1.6 + rnd() * 1.2), delay: f(pop + 0.15 + rnd() * 1.4), ease: 'ease-out' }, 'green-travel')}/>`;
    }
    return `<g transform="translate(${x} ${y})"><g${once('grow', { delay: grow, dur: 1.3, origin: '50% 100%', ease: 'ease-out' })}>` +
      `<path d="M0 0Q${f(lean * 0.2)} ${f(-h * 0.6)} ${f(lean)} ${f(-h)}" stroke="#a4502a" stroke-width="1.8" fill="none"/>` +
      `<g transform="translate(${f(lean)} ${f(-h)}) rotate(${f(tilt)})"><ellipse cy="-6.5" rx="4.4" ry="7.6" fill="#a8682a"/><ellipse cx="-1.5" cy="-7" rx="1.4" ry="4.6" fill="#d39a4c"/>` +
      `<g${once('fadeout', { delay: pop + 0.2, dur: 0.4 })}><g${once('move', { dx: 4, dy: -12, delay: pop, dur: 0.4 })}><path d="M-3.8 -13Q0 -20 3.8 -13Z" fill="#ecd072"/></g></g></g></g></g>` + spores;
  }

  EVO_FILMS.mosses = (): string => {
    const id = 'mosses';
    const s = sky(id, '#93b2c0', '#dde6e4');
    const defs = s.defs + vgrad(`${id}-rock`, [[0, '#8f9b9d'], [1, '#5c6668']]) + glowGrad(`${id}-mist`, '#ffffff', 0.5) +
      glowGrad(`${id}-blaze`, '#fff1b0', 0.9) +
      `<g id="${id}-wet">${cushion(HALF, 50, true)}</g><g id="${id}-dry">${cushion(HALF, 50, false)}</g>`;
    let body = s.body;
    // Beat 2: a blazing sun and hot air.
    body += during(3, 6.6, `<rect width="${FILM_W}" height="${FILM_H}" fill="#ffc46e" opacity="0.32"/>` +
      `<circle cx="392" cy="70" r="80" fill="url(#${id}-blaze)"${mo('pulse', { dur: 1.6, s: 1.1 })}/><circle cx="392" cy="70" r="20" fill="#fff5c4"/>`, 1);
    // Beat 3: rain clouds darken the sky.
    body += during(5.8, 9.4, `<rect width="${FILM_W}" height="${FILM_H}" fill="#56687a" opacity="0.32"/>` +
      `<path d="M0 0H480V50Q420 70 360 56Q300 76 240 58Q170 78 110 58Q50 74 0 56Z" fill="#8c9aa6"/>`, 0.8);
    // A cool, misty slope of bare stone.
    body += hills(118, 22, '#a7b8be', 2, 0.7) + greenMist(`${id}-mist`, 240, 132, 320, 22, 11) + hills(150, 14, '#8a9ca2', 9, 0.85);
    body += `<path d="M0 270L0 204Q120 196 240 202T480 198L480 270Z" fill="#6c787a"/>`;
    for (const [x, y, w, h] of [[30, 210, 26, 14], [448, 206, 30, 16], [150, 218, 16, 8], [330, 214, 20, 10]] as const) {
      body += greenRock(x, y, w, h, '#7f8b8d', '#a9b3b4');
    }
    // The boulder the hero cushion grows on, and two rocks with small cushions.
    body += `<ellipse cx="${CX}" cy="222" rx="132" ry="8" fill="#3f4a4c" opacity="0.5"/>` +
      `<path d="M118 220Q112 188 150 175Q190 165 240 165Q292 165 330 175Q368 188 362 220Q240 232 118 220Z" fill="url(#${id}-rock)"/>` +
      `<path d="M150 180Q190 170 236 170" stroke="#b6c0c1" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>`;
    body += greenRock(86, 214, 44, 26, '#7a8688', '#a5afb0') + greenRock(398, 212, 50, 30, '#7a8688', '#a5afb0');
    const cushions = drying(`<use href="#${id}-wet"/>`, `<use href="#${id}-dry"/>`);
    body += `<g transform="translate(86 192) scale(0.42 0.44)">${cushions}</g><g transform="translate(398 186) scale(0.5 0.52)">${cushions}</g>`;
    body += `<g transform="translate(${CX} ${CY})">${cushions}</g>`;
    // Heat shimmer while it dries.
    body += during(3.6, 6.2, [190, 250, 300].map((x, k) =>
      `<path d="M${x} 112q4 -6 0 -12t0 -12t0 -12" stroke="rgba(255,250,230,0.8)" stroke-width="1.6" fill="none"${mo('rise', { dy: -46, dur: 1.5, delay: 3.6 + k * 0.4, o: 0.8 })}/>`).join(''), 0.4);
    // Beat 3: rain; big drops hit the cushion and splash.
    body += during(5.9, 8.8, greenRain(46, 0, 480, 40, 150, 90, 9, 'rgba(232,242,250,0.9)', 8), 0.4);
    let drops = '';
    for (const [x, d] of [[200, 6.1], [262, 6.4], [228, 6.7], [292, 7.0], [180, 7.3], [248, 7.6]] as const) {
      const top = CY - 44 + Math.abs(x - CX) * 0.3;
      drops += during(d - 0.1, d + 0.45, `<g${once('move', { dy: top - 50, delay: d, dur: 0.5, ease: 'ease-in' })}><ellipse cx="${x}" cy="50" rx="2.6" ry="4" fill="#dff3ff" stroke="#6f9fbf" stroke-width="0.8"/></g>`, 0.1) +
        `<g transform="translate(${x} ${f(top)})"><ellipse rx="9" ry="3.2" fill="none" stroke="#e6f6ff" stroke-width="1.6"${once('burst', { delay: d + 0.5, s: 2, dur: 0.7 })}/></g>`;
    }
    body += drops;
    // Water beads glisten on the revived leaves.
    let beads = '';
    for (const [x, y] of [[-40, -30], [-12, -46], [16, -44], [44, -28], [-58, -14], [62, -12], [2, -26]] as const) {
      beads += `<circle cx="${CX + x}" cy="${CY + y}" r="1.8" fill="#ffffff"${mo('twinkle', { dur: 1.2, delay: 7 + (x + 60) / 80, o: 0.3 })}/>`;
    }
    body += during(7.1, 10.5, beads, 0.6);
    body += sparkle(CX, CY - 44, '#f2ffc0', 7.0);
    // Beat 4: spore capsules rise on thin stalks, the lids pop and spores puff out.
    body += sporophyte(CX - 34, CY - 36, 46, 6, 9.1, 10.3, 1) + sporophyte(CX + 6, CY - 44, 58, 8, 9.3, 10.6, 2) +
      sporophyte(CX + 44, CY - 34, 42, 10, 9.5, 10.9, 3) + sporophyte(398, 170, 34, 6, 9.6, 11.0, 4) + sporophyte(86, 178, 30, 5, 9.7, 11.2, 5);
    body += greenMist(`${id}-mist`, 120, 250, 220, 16, 10);
    return film(id, defs, body);
  };
}
