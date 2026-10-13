/* =============================================================================
 * SimEarth 2.0 — evolution film: freshwaterAlgae (surviving the dry)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. A pond in cut-away with
 * Spirogyra-like threads; two threads pair up, bridges (the "yoke") grow
 * between their cells and the contents of one cell move across; the pond
 * dries, the threads wither and only dark, thick-walled resting spores are
 * left on the cracked mud; rain fills the pond and they sprout new threads.
 * ========================================================================== */

namespace SE {
  const f = (v: number): string => v.toFixed(1);
  /** Cell length, thread width and cell count of the two pairing threads. */
  const CELL = 32;
  const W = 16;
  const N = 6;
  /** Left end of the paired threads, the lower thread's centre, the gap between the centres. */
  const X0 = 144;
  const BY = 180;
  const GAP = 30;
  /** How far the lower thread sinks when the pond drains: its spores land on the mud. */
  const SINK = 20;
  const BASIN = 'M60 112C66 178 104 211 164 211L316 211C376 211 414 178 420 112';

  /** One cell's spiral chloroplast band around (0, 0): dark front strands over light back strands. */
  function band(cl: number, w: number): string {
    const r = w / 2 - 2.4;
    const p = (cl - 3) / 3;
    let front = '';
    let back = '';
    for (let k = 0; k < 3; k++) {
      const x = -cl / 2 + 1.5 + k * p;
      front += `M${f(x)} ${f(-r)}C${f(x + p * 0.2)} ${f(-r)} ${f(x + p * 0.3)} ${f(r)} ${f(x + p * 0.5)} ${f(r)}`;
      back += `M${f(x + p * 0.5)} ${f(r)}C${f(x + p * 0.7)} ${f(r)} ${f(x + p * 0.8)} ${f(-r)} ${f(x + p)} ${f(-r)}`;
    }
    return `<path d="${back}" stroke="#93d277" stroke-width="${f(w * 0.13)}" fill="none" stroke-linecap="round"/>` +
      `<path d="${front}" stroke="#2c7a2c" stroke-width="${f(w * 0.2)}" fill="none" stroke-linecap="round"/>`;
  }

  /** A cell's living content: a pale green body with its spiral band. */
  const protoplast = (cl: number, w: number): string =>
    `<rect x="${f(-cl / 2 + 1.5)}" y="${f(-w / 2 + 1.8)}" width="${f(cl - 3)}" height="${f(w - 3.6)}" rx="${f(w / 2 - 2)}" fill="#bfe8a2"/>` + band(cl, w);

  /** The clear tube of a thread along +x from the origin, with its cross walls. */
  function tube(n: number, cl: number, w: number): string {
    let walls = '';
    for (let k = 1; k < n; k++) walls += `M${f(k * cl)} ${f(-w / 2 + 0.7)}V${f(w / 2 - 0.7)}`;
    return `<rect x="0" y="${f(-w / 2)}" width="${f(n * cl)}" height="${f(w)}" rx="${f(w / 2)}" fill="#e8f8da" fill-opacity="0.85" stroke="#5f9f4f" stroke-width="1.3"/>` +
      `<path d="${walls}" stroke="#5f9f4f" stroke-width="1.2"/>`;
  }

  /** A whole living thread: tube and cell contents. */
  function thread(n: number, cl: number, w: number): string {
    let out = tube(n, cl, w);
    for (let k = 0; k < n; k++) out += `<g transform="translate(${f(k * cl + cl / 2)} 0)">${protoplast(cl, w)}</g>`;
    return out;
  }

  /** The resting spore: dark, with a thick layered wall and a glint. */
  const spore = (glint: number): string =>
    `<ellipse rx="8.6" ry="6.8" fill="#5c3b1e" stroke="#24160a" stroke-width="2.8"/>` +
    `<ellipse rx="5.2" ry="3.8" fill="none" stroke="#8e6236" stroke-width="1.1"/>` +
    `<ellipse cx="-3.4" cy="-2.6" rx="2.6" ry="1.5" fill="#fff6dc"${mo('twinkle', { dur: 1.1, delay: glint, o: 0.25 })}/>`;

  /** A drifting rain cloud. */
  const cloud = (x: number, y: number, sc: number, d: number): string =>
    `<g transform="translate(${x} ${y}) scale(${sc})"><g${once('enter', { dx: 90, delay: d, dur: 1.4 })}>` +
    `<path d="M-46 10Q-50 -6 -32 -8Q-26 -24 -6 -20Q6 -32 24 -20Q44 -22 46 -4Q58 4 48 12Z" fill="#c3ced6"/>` +
    `<path d="M-44 10Q0 18 48 12" stroke="#9eabb5" stroke-width="4" fill="none" stroke-linecap="round"/></g></g>`;

  EVO_FILMS.freshwaterAlgae = (): string => {
    const id = 'freshwaterAlgae';
    const s = sky(id, '#9cc7d8', '#efe6c8');
    const glow = sun(id, 386, 58, 12, '#fff0bd');
    const defs = s.defs + glow.defs + vgrad(`${id}-water`, [[0, '#a6dcd2'], [1, '#478e9a']]) +
      vgrad(`${id}-pit`, [[0, '#d5bc94'], [1, '#a98a63']]) + vgrad(`${id}-soil`, [[0, '#8f6d4a'], [1, '#5b432e']]) +
      glowGrad(`${id}-heat`, '#fff3c0', 0.85) + `<clipPath id="${id}-basin"><path d="${BASIN}Z"/></clipPath>` +
      `<g id="${id}-cell">${protoplast(CELL, W)}</g><g id="${id}-drift">${thread(3, 20, 10)}</g><g id="${id}-sprout">${thread(3, 19, 11)}</g>`;
    let body = s.body;
    // Beat 3: the sky turns hot and the sun blazes; beat 4: grey rain light.
    body += during(5.6, 9, `<rect width="${FILM_W}" height="114" fill="#ffbf70" opacity="0.34"/><circle cx="386" cy="58" r="70" fill="url(#${id}-heat)"/>`, 0.8);
    body += glow.body + hills(98, 16, '#b9a88e', 5, 0.6);
    body += during(8.6, Infinity, `<rect width="${FILM_W}" height="114" fill="#5d6d7c" opacity="0.26"/>`, 0.8);
    // The far shore: bare ground, nothing grows on land yet.
    body += `<path d="M0 104Q120 99 240 104T480 103L480 114L0 114Z" fill="#ab926f"/>`;
    // The pit of the pond in cut-away, with its muddy floor.
    body += `<path d="${BASIN}Z" fill="url(#${id}-pit)"/>` +
      `<path d="${BASIN}" stroke="#5a4129" stroke-width="12" fill="none"/>` +
      during(6.8, 9.8, `<path d="${BASIN}" stroke="#b58f62" stroke-width="12" fill="none"/>`, 0.8);
    // Beat 3: the mud dries into curled plates with cracks between them.
    const floorY = (x: number): number => 205 - Math.pow(Math.max(0, 164 - x, x - 316) / 36, 2) * 4.5;
    let cracks = '';
    let plates = '';
    for (let x = 128; x < 352; x += 23.5) {
      const [y0, y1] = [floorY(x), floorY(x + 20)];
      plates += `M${f(x)} ${f(y0 - 6.5)}Q${f(x + 10)} ${f((y0 + y1) / 2 - 2)} ${f(x + 20)} ${f(y1 - 6.5)}L${f(x + 19)} ${f(y1 + 0.5)}L${f(x + 1)} ${f(y0 + 0.5)}Z`;
      cracks += `M${f(x + 20)} ${f(y1 - 1)}L${f(x + 21.7)} ${f(y1 + 9)}L${f(x + 23.5)} ${f(y1 - 1)}Z`;
    }
    body += during(6.9, 9.9, `<path d="${cracks}" fill="#3a2817"/><path d="${plates}" fill="#e4c591" stroke="#6e4c2c" stroke-width="1.3"/>`, 0.5);
    // The water drains at 6 s and comes back with the rain.
    let water = `<rect x="40" y="112" width="400" height="160" fill="url(#${id}-water)" opacity="0.74"/>` +
      `<g${mo('wave', { dx: -40, dur: 3 })}><path d="${wavePath(20, 470, 113, 1.4)}" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" fill="none"/></g>`;
    for (const [y, d] of [[134, 2.2], [162, 2.8], [190, 2.4]] as const) {
      water += `<g${mo('wave', { dx: 40, dur: d })}><path d="M20 ${y}H460" stroke="rgba(255,255,255,0.3)" stroke-width="1.3" stroke-dasharray="12 28" stroke-linecap="round"/></g>`;
    }
    body += `<g clip-path="url(#${id}-basin)"><g${once('move', { dy: 100, delay: 6, dur: 1.5 })}><g${once('move', { dy: -100, delay: 9.5, dur: 1.8 })}>${water}</g></g></g>`;
    // Beat 1: threads in the pond; the two small ones in the back wither in the drought.
    for (const [x, y, rot, d] of [[78, 166, -14, 3.4], [350, 140, 9, 4.1]] as const) {
      body += during(0, 6.3, `<g transform="translate(${x} ${y}) rotate(${rot})"><g${mo('sway', { rot: 3, dur: d, origin: '0% 50%' })}><use href="#${id}-drift" opacity="0.7"/></g></g>`, 0.9);
    }
    // The upper thread drifts in and sinks onto the lower one; its moves wrap every part of it.
    const upper = (inner: string): string =>
      `<g transform="translate(${X0 - 16} ${BY - GAP - 26})"><g${once('move', { dx: 16, delay: 0.3, dur: 2.7 })}><g${once('move', { dy: 26, delay: 3, dur: 0.8 })}>${inner}</g></g></g>`;
    const lower = (inner: string): string =>
      `<g transform="translate(${X0} ${BY})"><g${once('move', { dy: SINK, delay: 6.1, dur: 1.2 })}>${inner}</g></g>`;
    body += lower(during(0, 6.5, tube(N, CELL, W), 0.7));
    body += during(0, 6, upper(tube(N, CELL, W)), 0.6);
    // Beat 2: bridges grow between facing cells — the "yoke".
    let bridges = '';
    for (let k = 0; k < N; k++) {
      const cx = k * CELL + CELL / 2;
      bridges += `<g${once('grow', { delay: f(3.8 + k * 0.06), dur: 0.45, origin: '50% 50%', ease: 'ease-out' })}><rect x="${f(cx - 4.5)}" y="-23.2" width="9" height="17" fill="#e8f8da"/>` +
        `<path d="M${f(cx - 4.5)} -21.6v14.2M${f(cx + 4.5)} -21.6v14.2" stroke="#5f9f4f" stroke-width="1.2"/></g>`;
    }
    body += lower(during(0, 6, bridges, 0.5));
    // The lower cells round up; the upper cells' contents shrink and cross over.
    let stay = '';
    let cross = '';
    let zygotes = '';
    for (let k = 0; k < N; k++) {
      const cx = k * CELL + CELL / 2;
      stay += `<g transform="translate(${cx} 0)"><g${once('fadeout', { delay: 5.3, dur: 0.3 })}><g${once('scale', { s: 0.6, delay: 4.3, dur: 0.5 })}><use href="#${id}-cell"/></g></g></g>`;
      // The upper cell's content balls up and squeezes through the bridge.
      cross += `<g transform="translate(${cx} 0)"><g${once('fadeout', { delay: 4.45, dur: 0.25 })}><g${once('scale', { s: 0.45, delay: 4.2, dur: 0.4 })}><use href="#${id}-cell"/></g></g>` +
        during(4.35, 5.35, `<g${once('move', { dy: GAP, delay: f(4.6 + k * 0.04), dur: 0.7 })}><ellipse rx="4.6" ry="5.6" fill="#3f8a32" stroke="#24561d" stroke-width="1.2"/>` +
          `<ellipse cx="-1.6" cy="-2.2" rx="1.4" ry="1.1" fill="#cdf2ad"/></g>`, 0.2) + '</g>';
      // The fused cell: first green, then it hardens into the dark resting spore.
      zygotes += `<g transform="translate(${cx} 0)"><g${once('pop', { delay: f(5.2 + k * 0.04), dur: 0.5 })}>` +
        `<ellipse rx="8.6" ry="6.8" fill="#3d7f2e" stroke="#2a5a20" stroke-width="1.6"/><ellipse cx="-3" cy="-2.5" rx="2.4" ry="1.3" fill="#d6f5b8"/></g>` +
        during(6.6 + k * 0.05, Infinity, spore(7.2 + k * 0.13), 0.6) +
        // Beat 4: the spore splits open and a new thread grows out of it.
        during(10 + k * 0.08, Infinity, `<path d="M-5.5 -5.2Q0 -9.4 5.5 -5.2" stroke="#a6e07e" stroke-width="2.6" fill="none" stroke-linecap="round"/>`, 0.3) +
        `<g transform="translate(0 -5) rotate(${-62 - (k % 3) * 9})"><g${once('grow', { delay: f(10.2 + k * 0.12), dur: 1.3, origin: '0% 50%', ease: 'ease-out' })}>` +
        `<use href="#${id}-sprout"/></g></g></g>`;
    }
    body += lower(stay) + upper(cross) + lower(zygotes);
    body += during(7.0, 9.6, tag(X0 + CELL * 3, BY + SINK - 18, 'Dauerspore', 7.0), 0.5);
    body += sparkle(X0 + CELL * 2.5, BY + SINK, '#fff1c8', 7.1);
    // Heat shimmer over the drying pond.
    body += during(6.2, 8.8, [150, 240, 330].map((x, k) =>
      `<path d="M${x} 150q4 -6 0 -12t0 -12t0 -12" stroke="rgba(255,250,230,0.7)" stroke-width="1.6" fill="none"${mo('rise', { dy: -50, dur: 1.6, delay: 6.2 + k * 0.4, o: 0.8 })}/>`).join(''), 0.4);
    // The ground in cut-away around the pond, with its strata.
    body += `<path d="M0 112H60C66 178 104 211 164 211L316 211C376 211 414 178 420 112H480V270H0Z" fill="url(#${id}-soil)"/>` +
      `<path d="M0 150Q30 146 64 152M0 196Q50 190 92 200M416 152Q446 146 480 150M388 200Q430 190 480 196M110 250Q240 262 370 250" stroke="#4c3825" stroke-width="2" fill="none" opacity="0.5"/>` +
      `<path d="M0 112H60M420 112H480" stroke="#c9b08a" stroke-width="2"/>`;
    // Beat 4: clouds, rain, and a green film creeps out onto the damp shore.
    body += cloud(300, 46, 1.15, 8.5) + cloud(410, 64, 0.9, 8.7) + cloud(196, 76, 0.85, 8.9);
    body += during(9, 11.4, greenRain(26, 40, 450, 40, 100, 112, 5, 'rgba(226,238,248,0.9)', 9), 0.4);
    let fringe = `<path d="M66 111.5H414" stroke="#6fbf52" stroke-width="3" stroke-linecap="round"${once('draw', { len: 350, delay: 10.2, dur: 1.4 })}/>`;
    for (const d of ['M60 111Q40 107 16 110', 'M420 111Q440 107 464 110']) {
      fringe += `<path d="${d}" stroke="#6fbf52" stroke-width="5" stroke-linecap="round" fill="none"${once('draw', { len: 50, delay: 10.4, dur: 1.2 })}/>`;
    }
    for (const [x, y, rx, d] of [[44, 107, 12, 10.8], [28, 105, 9, 11.1], [436, 107, 12, 10.9], [452, 105, 9, 11.2], [120, 103, 10, 11.3], [362, 103, 10, 11.4]] as const) {
      fringe += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="2.6" fill="#7cc95c"${once('grow', { delay: d, dur: 0.8, origin: '50% 50%' })}/>`;
    }
    body += fringe;
    return film(id, defs, body);
  };
}
