/* =============================================================================
 * SimEarth 2.0 — evolution film: pollinators
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A digger wasp hunts for its larva; over generations its kind becomes a
 * furry bee that feeds pollen instead. In a lens, the bee's own view: the
 * flower's ultraviolet target, and the bee lands dead centre. Then pollen
 * goes from flower to flower, fruits set, more flowers, more bees.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** Flower heads A, B (under the lens), C; the wasp's burrow. */
  const [A, B, C, NEST] = [[150, 136], [300, 128], [414, 146], [392, 190]] as const;

  /** A five-petalled flower head at (0, 0); `fall` > 0 drops the petals and swells a fruit. */
  function head(r: number, petal: string, fall = 0): string {
    let petals = '';
    for (let k = 0; k < 5; k++) petals += `<ellipse cy="${f(-r * 0.55)}" rx="${f(r * 0.42)}" ry="${f(r * 0.6)}" fill="${petal}" transform="rotate(${k * 72})"/>`;
    if (fall) petals = during(0, fall + 0.3, `<g${once('move', { dy: 26, delay: fall, dur: 1.0, ease: 'ease-in' })}>${petals}</g>`, 0.7);
    const fruit = fall ? `<g${once('scale', { s: 1.7, delay: fall + 0.3, dur: 1.2 })}><circle r="${f(r * 0.3)}" fill="#7fb04c"${once('fade', { delay: fall + 0.3, dur: 0.8 })}/></g>` : '';
    return petals + `<circle r="${f(r * 0.3)}" fill="#f08a2a"/><circle r="${f(r * 0.13)}" fill="#c25e18"/>` + fruit;
  }

  /** A flower on a stem from the ground (y = 214) up to (x, y). */
  function flower(x: number, y: number, r: number, fall = 0): string {
    return `<path d="M${x} 214Q${x - 6} ${f((214 + y) / 2)} ${x} ${y}" stroke="#4f8f45" stroke-width="3" fill="none"/>` +
      `<path d="M${x} ${f(y + (214 - y) * 0.55)}q12 -12 18 -4q-8 6 -18 4Z" fill="#5fa552"/><g transform="translate(${x} ${y})">${head(r, '#ffd84a', fall)}</g>`;
  }

  /** A digger wasp, side view facing right: wasp waist, banded sting, long legs; `prey` hangs in its legs. */
  function wasp(prey = ''): string {
    return `<path d="M1 3l-4 9M4 4l0 10M7 3l5 9" stroke="#2a2018" stroke-width="1.1" fill="none" stroke-linecap="round"/>${prey}` +
      `<g${mo('flap', { dur: 0.05, s: 0.25, origin: '50% 100%' })}><ellipse cx="-3" cy="-8" rx="12" ry="3" fill="rgba(225,240,255,0.8)" transform="rotate(-10 -3 -8)"/></g>` +
      `<path d="M-3 1Q-6 0 -9 2" stroke="#1d1a16" stroke-width="1.6"/><path d="M-9 1C-14 -3 -24 -1 -30 6C-24 9 -14 9 -9 4Z" fill="#f2c230"/>` +
      `<path d="M-13 0.4Q-12 4 -13 7.4M-19 0Q-18 4 -19.4 8.4M-25 2Q-24 5 -26 7.6" stroke="#1d1a16" stroke-width="2.2" fill="none"/>` +
      `<ellipse cx="2" cy="0" rx="6.4" ry="4.4" fill="#2a2420"/><path d="M0 -3h4" stroke="#f2c230" stroke-width="1.5"/>` +
      `<circle cx="11" cy="-1" r="4.2" fill="#2a2420"/><ellipse cx="12" cy="-1.6" rx="2.3" ry="3.1" fill="#4a5a6a"/>` +
      `<path d="M13 -4q4 -6 9 -6M12 -4.6q2 -7 7 -9" stroke="#2a2018" stroke-width="0.9" fill="none"/>`;
  }

  /**
   * A furry bee, side view facing right, standing on y = 8; pollen grains
   * stick in its fur from `pollen` s (0: already full); wings whir during `flights`.
   */
  function bee(pollen: number, flights: readonly (readonly [number, number])[] = [[0, Infinity]]): string {
    const spots = [[-4, -3], [2, -5], [-10, -2], [-6, 4], [0, 3], [-13, 2], [4, 1], [-8, -5], [-2, 6], [-15, -1], [-7, 7.6]];
    const grains = pollen ? spots.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="1.5" fill="#ffd23c" stroke="#c99a1a" stroke-width="0.4"${once('pop', { delay: f(pollen + k * 0.13), dur: 0.4 })}/>`).join('')
      : `<path d="${bloomBlobs(spots.map(([x, y]) => [x, y, 1.5, 1.5]))}" fill="#ffd23c" stroke="#c99a1a" stroke-width="0.4"/>`;
    const wings = `<g${mo('flap', { dur: 0.05, s: 0.2, origin: '50% 100%' })}><ellipse cx="-4" cy="-10" rx="9" ry="3.4" fill="rgba(235,245,255,0.8)" transform="rotate(-16 -4 -10)"/>` +
      `<ellipse cx="-8" cy="-7.4" rx="6.4" ry="2.6" fill="rgba(235,245,255,0.7)" transform="rotate(-26 -8 -7.4)"/></g>`;
    return `<path d="M5 3l2 5M1 4l-1 4.5M-3 3l-5 5l-3 1.5" stroke="#2a1c10" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<ellipse cx="-8" cy="1" rx="9" ry="6.5" fill="#e8a838"/>` +
      `<path d="M-6 -5.2Q-4 1 -6 7.2M-10.5 -5.4Q-8.5 1 -10.5 7.2M-14.6 -3.6Q-13 1 -14.6 5.4" stroke="#3a2614" stroke-width="2.2" fill="none"/>` +
      `<circle cx="1" cy="-1" r="5.8" fill="#9a6a30"/><path d="M-3 -6l-1 -2M0 -7v-2M3 -6.4l1 -2M5.6 -3l2 -1M-4.6 -3l-2 -1" stroke="#c49050" stroke-width="1" stroke-linecap="round"/>` +
      `<ellipse cx="7.6" cy="0.4" rx="3.8" ry="4.2" fill="#3a2a18"/><ellipse cx="8.4" cy="-0.6" rx="1.7" ry="2.5" fill="${PAL.ink}"/><circle cx="7.9" cy="-1.6" r="0.7" fill="#ffffff"/>` +
      `<path d="M9 -3.4l2 -5l4 -1M7.6 -3.8l1 -5.4l4 -2" stroke="#2a1c10" stroke-width="0.9" fill="none"/>${grains}` +
      flights.map(([a, b]) => during(a, b, wings, 0.1)).join('');
  }

  /** The flower as a bee sees it, enlarged around (0, 0): UV-bright tips, a dark target and stripes to the centre. */
  function uvFlower(): string {
    let [petals, guides] = ['', ''];
    for (let k = 0; k < 5; k++) {
      petals += `<ellipse cy="-24" rx="18" ry="26" fill="#d8c4ff" transform="rotate(${k * 72})"/>`;
      for (const off of [-12, 0, 12]) guides += `<path d="M${off * 0.4} -12L${off} -40" transform="rotate(${k * 72})"/>`;
    }
    return `<circle r="70" fill="#1d1236"/><g transform="scale(1.15)">${petals}<circle r="26" fill="#4a1f8a"/><g stroke="#4a1f8a" stroke-width="3.4" stroke-linecap="round">${guides}</g>` +
      `<circle r="14" fill="#2a0f5a"${mo('pulse', { dur: 0.9, s: 1.12 })}/><circle r="5" fill="#f6e08a"/></g>`;
  }

  EVO_FILMS.pollinators = (): string => {
    const id = 'pollinators';
    const [s, glow] = [sky(id, '#4f97c8', '#eef5dc'), sun(id, 410, 58, 12)];
    let inner = uvFlower();
    inner += `<g transform="translate(-2 -12) scale(1.5)"><g${once('enter', { dx: -46, dy: -38, delay: 6.4, dur: 0.9, ease: 'cubic-bezier(.3,.6,.4,1)' })}>${bee(0, [[0, 7.3]])}</g></g>`;
    const l = lens(`${id}-l`, B[0], B[1], 64, inner, 6.0, 9.0);
    const defs = s.defs + glow.defs + l.defs + vgrad(`${id}-ground`, [[0, '#7cb45c'], [1, '#5a9046']]);
    let body = s.body + glow.body + hills(170, 16, '#9cc6a6', 12, 0.7);
    // Cretaceous woods behind the meadow: conifers and the first broadleaf trees.
    for (let k = 0; k < 7; k++) {
      const x = 30 + k * 72 + (k % 2) * 12;
      body += k % 2 ? `<path d="M${x} 186L${x - 12} 186L${x} ${150 - (k % 3) * 8}L${x + 12} 186Z" fill="#3d7a55" opacity="0.7"/>`
        : `<g opacity="0.75"><path d="M${x} 188V168" stroke="#6b5a40" stroke-width="3"/><path d="${bloomBlobs([[x - 8, 164, 11, 10], [x + 7, 162, 12, 11], [x, 152, 11, 10]])}" fill="#78b260"/></g>`;
    }
    body += `<path d="M0 192Q120 184 240 190T480 186V270H0Z" fill="url(#${id}-ground)"/>`;
    // The burrow, in section: a larva waits in its chamber.
    body += during(0, 5.6, `<path d="M${NEST[0]} ${NEST[1]}q10 10 26 14" stroke="#4a3622" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="${NEST[0] + 30}" cy="${NEST[1] + 16}" rx="15" ry="9" fill="#4a3622"/>` +
      `<g transform="translate(${NEST[0] + 30} ${NEST[1] + 17})"><g${mo('sway', { rot: 8, dur: 0.7, origin: '50% 50%' })}><path d="M-9 0Q-8 -7 0 -6Q8 -5 8 1Q6 5 0 4Q-6 3 -9 0Z" fill="#f4ecd8"/>` +
      `<path d="M-4 -5v8M0 -6v10M4 -5v8" stroke="#d8ccb0" stroke-width="0.8"/></g></g><ellipse cx="${NEST[0]}" cy="${NEST[1]}" rx="9" ry="3.4" fill="#2c2014"/>`, 0.6);
    // Flowers: A (the bee's first), B (under the lens), C; each sets fruit later.
    body += flower(A[0], A[1], 24, 10.2) + flower(B[0], B[1], 24, 10.8) + flower(C[0], C[1], 20);
    // Beat 1: the wasp catches a fly and carries it to its larva.
    body += during(0, 1.35, `<g transform="translate(262 104)"><g${mo('float', { amp: 5, dur: 0.4 })}><g transform="scale(1.3)">${bloomFly()}</g></g></g>`, 0.1);
    const prey = during(1.3, Infinity, `<g transform="translate(4 15) rotate(20) scale(0.9)">${bloomFly(0, 1)}</g>`, 0.1);
    body += during(0, 2.7, `<g transform="translate(250 106)"><g${once('move', { dx: NEST[0] - 250, dy: NEST[1] - 112, delay: 1.5, dur: 1.0, ease: 'ease-in' })}>` +
      `<g${once('enter', { dx: -220, dy: 30, delay: 0.1, dur: 1.2 })}><g transform="scale(1.6)">${wasp(prey)}</g></g></g></g>`, 0.3);
    // Beat 2: over generations, wasps that fed their young pollen became bees. One flies to flower A.
    body += `<g transform="translate(${NEST[0]} ${NEST[1] - 10})"><g${once('move', { dx: A[0] - NEST[0] + 4, dy: A[1] - NEST[1] - 4, delay: 3.0, dur: 1.3 })}>` +
      during(2.9, 5.9, `<g transform="scale(-1.8 1.8)">${morph([wasp(), bee(4.5, [[0, 4.3]])], [3.4], 0.6)}</g>`, 0.2) + `</g></g>`;
    body += timelapse(250, 70, ['Grabwespe', 'Biene'], [3.0, 3.8], 5.6) + during(0, 6.0, tag(A[0] - 6, A[1] - 40, 'Pollen', 4.6), 0.3);
    // Beat 3 starts: the bee, now full of pollen, takes off for flower B and the lens.
    body += during(5.85, 6.45, `<g transform="translate(${A[0] + 4} ${A[1] - 14})"><g${once('move', { dx: 100, dy: -30, delay: 5.9, dur: 0.6, ease: 'ease-in' })}><g transform="scale(1.8)">${bee(0)}</g></g></g>`, 0.15);
    body += l.body + sparkle(B[0], B[1] - 4, '#f1e4ff', 7.3, 1.1) + during(0, 9.0, tag(B[0] + 70, B[1] - 50, 'UV-Muster', 6.9, 'start'), 0.4);
    // Beat 4: the bee carries pollen from B to C; fruits set; more flowers, more bees.
    body += during(8.9, Infinity, `<g transform="translate(${B[0] + 4} ${B[1] - 14})"><g${once('move', { dx: C[0] - B[0], dy: C[1] - B[1], delay: 9.6, dur: 0.8 })}>` +
      `<g transform="scale(1.8)">${bee(0, [[9.5, 10.5]])}</g></g></g>`, 0.3);
    for (const [[x, y], t] of [[B, 9.2], [C, 10.5]] as const) {
      body += during(0, t + 1.6, [[-5, 2], [4, -3], [1, 5]].map(([dx, dy], k) => `<circle cx="${x + dx}" cy="${y + dy}" r="2" fill="#ffd23c"${once('pop', { delay: t + k * 0.1 })}/>`).join(''), 0.4);
    }
    const rnd = seeded(23);
    for (let k = 0; k < 9; k++) {
      const [x, y] = [24 + k * 52 + rnd() * 16, 200 + rnd() * 18];
      body += `<g transform="translate(${f(x)} ${f(y)})"><g${once('pop', { delay: f(10.3 + rnd() * 1.4) })}><path d="${bloomBlobs([[0, -4, 3, 3.6], [4, 0, 3.6, 3], [-4, 0, 3.6, 3], [0, 4, 3, 3.6]])}" fill="${['#ffd84a', '#f6c6d8', '#fbe9f0'][k % 3]}"/><circle r="1.8" fill="#f08a2a"/></g></g>`;
    }
    for (const [y, d, sc] of [[96, 10.4, 1], [150, 11.0, 0.8]] as const) {
      body += `<g transform="translate(-30 ${y})"><g${mo('swim', { dx: 560, amp: 10, dur: 4.5, delay: d, ease: 'linear' })}><g transform="scale(${sc})">${bee(0)}</g></g></g>`;
    }
    return film(id, defs, body);
  };
}
