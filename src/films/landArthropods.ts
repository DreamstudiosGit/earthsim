/* =============================================================================
 * SimEarth 2.0 — evolution film: landArthropods
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md
 * A Silurian shore: a millipede crawls out of the shallows between the first
 * plant cushions; the lens shows breathing holes opening on its flank and air
 * streaming in; then it feeds on dead green while a trigonotarbid hunts.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);

  /** A cushion of the first land plants (liverwort-like), ankle-high. */
  function mat(x: number, y: number, w: number, h: number, seed: number, dead = false): string {
    const rnd = seeded(seed);
    const n = Math.round(w / 11);
    const cols = dead ? ['#8a6a3a', '#a07c46', '#7a5a32'] : ['#5f9e4a', '#4f8d40', '#76b55a'];
    let lumps = '';
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n - 0.5;
      lumps += `<ellipse cx="${f(u * w * 0.9)}" cy="${f(2 - h * 0.8 * (1 - 3.4 * u * u))}" rx="${f(6 + rnd() * 4)}" ry="${f(3.6 + rnd() * 2)}" fill="${cols[k % 3]}"/>`;
    }
    return `<g transform="translate(${x} ${y})"><path d="M${f(-w / 2)} 1C${f(-w / 2)} ${f(-h)} ${f(w / 2)} ${f(-h)} ${f(w / 2)} 1Z" fill="${dead ? '#6a4c2a' : '#3f7a38'}"/>${lumps}</g>`;
  }

  /** Cooksonia: a leafless forked stalk with a spore capsule on each tip. */
  function cooksonia(x: number, y: number, h: number, d: number): string {
    return `<g transform="translate(${x} ${y})"><g${mo('sway', { rot: 5, dur: d })}>` +
      `<path d="M0 0L0 ${-h}L-4 ${-h - 6}M0 ${-h}L4 ${-h - 7}" stroke="#6fae58" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<ellipse cx="-4" cy="${-h - 7.5}" rx="2.6" ry="1.9" fill="#c9a24a"/><ellipse cx="4" cy="${-h - 8.5}" rx="2.6" ry="1.9" fill="#c9a24a"/></g></g>`;
  }

  /**
   * A millipede facing right, head at the origin, feet on y = 0. Every body ring
   * carries two pairs of legs (one of each pair shows); the legs beat in waves
   * from tail to head until `stop` s; the head nods (chewing) from `chew` s.
   */
  function millipede(rings: number, stop: number, chew: number): string {
    let legs = '', body = '';
    for (let k = 0; k < rings * 2; k++) {
      const delay = -(rings * 2 - k) * 0.05;
      legs += `<g transform="translate(${f(-6 - k * 3)} -4.4)"><g${mo('sway', { rot: 24, dur: 0.3, delay: f(delay), n: Math.round((stop - delay) / 0.3), origin: '50% 0%' })}>` +
        `<path d="M0 0L1 2.6L0.4 4.6" stroke="#4a2810" stroke-width="1.15" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
    }
    for (let k = rings - 1; k >= 0; k--) {
      const x = -4.6 - k * 6;
      body += `<path d="M${f(x - 6.6)} -5Q${f(x - 7)} -14.6 ${f(x - 3.2)} -14.6Q${f(x + 0.6)} -14.6 ${f(x + 0.4)} -5Z" fill="${k % 2 ? '#8a4c22' : '#96552a'}" stroke="#4a2810" stroke-width="0.7"/>` +
        `<path d="M${f(x - 5.4)} -12.2Q${f(x - 3.2)} -13.8 ${f(x - 1)} -12.2" stroke="#e0a066" stroke-width="1.2" fill="none" opacity="0.7" stroke-linecap="round"/>`;
    }
    const head = `<ellipse cx="-0.6" cy="-8.6" rx="4.8" ry="5" fill="#6a3a18"/><path d="M3 -12q3 -5 7.5 -4.6M1.6 -13q2 -6 6 -7.6" stroke="#4a2810" stroke-width="1.1" fill="none" stroke-linecap="round"/>` +
      `<path d="M3.4 -5.4l1.6 2.4" stroke="#4a2810" stroke-width="1.2" stroke-linecap="round"/>` + eye(1.6, -9.6, 1.3);
    return legs + body + `<g${mo('sway', { rot: 7, dur: 0.36, delay: chew, origin: '30% 90%' })}>${head}</g>`;
  }

  /** A trigonotarbid facing right, feet on y = 0: armoured, segmented abdomen, small front body, eight legs, no web. */
  function trigonotarbid(): string {
    const legs = (dx: number, col: string, w: number): string => {
      let d = '';
      for (const [ax, kx, fx] of [[10, 16, 21], [7, 10, 12], [4, 1, -2], [1, -6, -12]] as const) d += `M${ax + dx} -8L${kx + dx} -15L${fx + dx} 0`;
      return `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    };
    return legs(3, '#6a4a30', 1.4) + `<ellipse cx="-9" cy="-9.5" rx="13" ry="9" fill="#5e3418"/><ellipse cx="-11" cy="-14" rx="7" ry="2.4" fill="#a8693a" opacity="0.55"/>` +
      `<path d="M-17 -16.6Q-15 -10 -17 -3M-11.4 -18.2Q-9.4 -10 -11.4 -1.2M-5.6 -17.6Q-3.6 -10 -5.6 -1.6" stroke="#2e1a0a" stroke-width="1.1" fill="none" opacity="0.8"/>` +
      `<ellipse cx="6" cy="-9" rx="7" ry="5.6" fill="#7e4a24"/><path d="M11.6 -7.6q4.6 0.6 5.4 6" stroke="#4a2a12" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
      eye(8.4, -12.4, 1.3) + legs(0, '#3a2210', 2);
  }

  /** A springtail, facing left, feet on y = 0, hopping on the spot. */
  function springtail(): string {
    return `<g${mo('landArthropods-hop', { amp: 6, dur: 0.9 })}><ellipse cx="0" cy="-3" rx="4.6" ry="2.2" fill="#9aa6b8"/><circle cx="-4.8" cy="-3.6" r="2" fill="#7f8ba0"/>` +
      `<path d="M-5.6 -5l-3 -3M-5 -5l-1.5 -4M2 -1.4l1.2 1.4M-0.5 -1.3v1.3M-2.6 -1.4l-1 1.4" stroke="#55607a" stroke-width="0.8" stroke-linecap="round"/></g>`;
  }

  /**
   * The lens: the flank of the millipede close up, five rings with two legs
   * each. At the leg bases the breathing holes open, air streams in and runs
   * up the tracheae (seen as if through the shell); the shell shines.
   */
  function closeUp(): string {
    let out = `<rect x="-60" y="-60" width="120" height="120" fill="#d6e6de"/><rect x="-60" y="34" width="120" height="26" fill="#c2a676"/>`;
    for (let k = 0; k < 4; k++) {
      const x = -64 + k * 32;
      for (const lx of [x + 9, x + 23]) out += `<path d="M${lx} 10L${lx + 4} 22L${lx + 1} 35" stroke="#4a2810" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      out += `<path d="M${x} 13V-20Q${x} -28 ${x + 7} -28H${x + 25}Q${x + 32} -28 ${x + 32} -20V13Z" fill="${k % 2 ? '#8a4c22' : '#9a582c'}" stroke="#4a2810" stroke-width="1.4"/>` +
        `<path d="M${x + 1} 2H${x + 31}V13H${x + 1}Z" fill="#c08a52"/><path d="M${x + 5} -22H${x + 27}" stroke="#eab27a" stroke-width="3" opacity="0.7" stroke-linecap="round"/>`;
    }
    // Breathing holes at the leg bases: closed slits that open, one after another.
    [-46, -14, 18, 50].forEach((x, k) => {
      const d = 6.1 + k * 0.15;
      out += `<path d="M${x - 2.5} 7h5" stroke="#3a1e0a" stroke-width="1.3" stroke-linecap="round"/>` +
        `<g transform="translate(${x} 7)"><g${once('grow', { delay: d, dur: 0.5, origin: '50% 50%' })}><ellipse rx="5.4" ry="4.2" fill="#f6dcae"/><ellipse rx="3.6" ry="2.7" fill="#1a0c04"/></g></g>`;
      // A trachea: a pale tube from the hole up into the body, filling with air.
      out += `<path d="M${x} 4Q${x - 3} -8 ${x + 2} -18M${x - 1} -6l-6 -7M${x} -11l6 -6" stroke="rgba(185,232,255,0.9)" stroke-width="1.8" fill="none" stroke-linecap="round"${once('draw', { len: 44, delay: d + 0.7, dur: 0.9 })}/>`;
      for (let j = 0; j < 2; j++) {
        out += `<g transform="translate(${x} 7) rotate(${-35 + j * 50})"><circle cy="15" r="1.9" fill="#c8ecff"${mo('rise', { dy: -15, dur: 0.9, delay: f(d + 0.3 + j * 0.45), o: 1 })}/></g>`;
      }
    });
    // The shell catches the light: a gleam sweeps across the backs.
    out += `<g${once('move', { dx: 170, delay: 7.2, dur: 1.3, ease: 'ease-in-out' })}><path d="M-88 -30L-78 -30L-92 12L-102 12Z" fill="#ffffff" opacity="0.5"/></g>`;
    return out;
  }

  EVO_FILMS.landArthropods = (): string => {
    const id = 'landArthropods';
    const s = sky(id, '#5a92ad', '#f0dfbc');
    const glow = sun(id, 396, 70, 11, '#fff1c6');
    const far = sea(id, 124);
    const lx = 214, ly = 114;
    const lensView = lens(`${id}-lens`, lx, ly, 54, closeUp(), 6.0, 9.0);
    let body = s.body + glow.body + far.body;
    // A bare rocky headland across the bay: nothing on land grows higher than an ankle yet.
    body += `<path d="M300 126Q330 104 362 108Q402 88 440 96Q464 100 480 98L480 128L300 128Z" fill="#938b7c" opacity="0.7"/>`;
    // The shore: a sandy bottom under the shallows, a slope, then the land.
    body += `<path d="M0 212L150 212L214 182Q224 180 244 180Q300 179 360 181Q420 184 480 178L480 270L0 270Z" fill="url(#${id}-ground)"/>` +
      `<path d="M214 182Q224 180 244 180Q300 179 360 181Q420 184 480 178" stroke="#d6bb88" stroke-width="2" fill="none"/>`;
    for (const [x, y, r] of [[50, 218, 5], [100, 216, 3.5], [250, 198, 4], [462, 200, 6], [366, 210, 3]] as const) {
      body += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f(r * 0.6)}" fill="#8b8173"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.25}" rx="${f(r * 0.45)}" ry="${f(r * 0.2)}" fill="#b4aa98"/>`;
    }
    body += mat(262, 182, 44, 10, 3) + mat(440, 180, 64, 13, 5) + cooksonia(254, 177, 8, 3.4) + cooksonia(270, 176, 11, 4.1) + cooksonia(434, 172, 12, 3.8) + cooksonia(450, 173, 9, 4.4);
    // Dead green: a wilted cushion and fallen stalks, the first food on land.
    body += `<g transform="translate(348 182)"><g${once('scale', { s: 0.3, delay: 9.6, dur: 2.2, origin: '20% 100%' })}>${mat(0, 0, 20, 7, 9, true)}` +
      `<path d="M-6 -2L6 -9M6 -9l3 -3M6 -9l4 0M-2 -1L-10 -6" stroke="#9a7444" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="9.4" cy="-12.4" r="1.8" fill="#8a6a3a"/></g></g>`;
    // The millipede: on the bottom of the shallows, then up the slope onto land.
    body += `<g transform="translate(130 212) scale(1.55)"><g${once('landArthropods-crawl', { dur: 6, delay: 0, ease: 'linear', origin: '87% 100%' })}>${millipede(11, 6, 9.4)}</g></g>`;
    body += during(0, 4.2, bubbles(5, 120, 202, 40, 16, 0.2, 7));
    // The shallows in front of it: tinted water down to the sand, a bright surface line.
    body += `<path d="M0 186L205.5 186L150 212L0 212Z" fill="url(#${id}-water)"/>` +
      `<g${mo('wave', { dx: -40, dur: 3 })}><path d="${wavePath(-40, 206, 186, 1.6)}" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.5"/></g>`;
    // Plant cushions in front, between which it walks.
    body += mat(300, 216, 80, 16, 7) + mat(430, 218, 60, 13, 8) + cooksonia(282, 208, 15, 3.6) + cooksonia(314, 206, 19, 4.2) + cooksonia(422, 211, 14, 3.9) + cooksonia(434, 208, 17, 4.6);
    // Beat 4: a springtail hops in; the trigonotarbid creeps up and pounces.
    body += `<g transform="translate(400 183) scale(1.5)"><g${once('enter', { dx: 24, dy: 0, delay: 9.1, dur: 0.8 })}><g${once('fadeout', { delay: 10.85, dur: 0.15 })}>${springtail()}</g></g></g>`;
    body += `<g transform="translate(452 184) scale(-1.5 1.5)"><g${once('enter', { dx: -34, dy: 0, delay: 9.3, dur: 1 })}>` +
      `<g${once('move', { dx: 26, dy: 0, delay: 10.6, dur: 0.3, ease: 'ease-in' })}><g${mo('float', { amp: 0.6, dur: 0.7 })}>${trigonotarbid()}</g></g></g></g>`;
    body += lensView.body + during(0, 9.0, tag(lx - 1, ly + 46, 'Atemloch', 6.5), 0.5) + sparkle(lx - 14, ly + 7, '#fff3c4', 6.6, 0.8);
    body += motes(id, 8, 'rgba(240,220,150,0.8)', 260, 470, 120, 200, 4, 1.1);
    const defs = s.defs + glow.defs + far.defs + lensView.defs + vgrad(`${id}-ground`, [[0, '#d2ba8c'], [0.3, '#9a8360'], [1, '#5c4834']]) +
      vgrad(`${id}-water`, [[0, 'rgba(150,215,225,0.3)'], [1, 'rgba(70,140,165,0.45)']]);
    return film(id, defs, body);
  };
}
