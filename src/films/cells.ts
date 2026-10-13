/* =============================================================================
 * SimEarth 2.0 — evolution film: cells (the first cell)
 * -----------------------------------------------------------------------------
 * Storyboard: docs/grafik-2026-10/drehbuecher.md. At a hot vent, building
 * blocks line up into a strand, a partner strand pairs with it, the pair
 * twists, unzips and is copied; fat molecules close around the copies — a
 * cell — which divides, one daughter carrying a copying error that thrives.
 * ========================================================================== */

namespace SE {
  /** Base colours, A U G C, and which pairs with which. */
  const BASES = ['#f6c453', '#ff7a6b', '#b48cff', '#5ccfd0'] as const;
  const PARTNER = [1, 0, 3, 2] as const;
  const STRAND = [0, 2, 3, 1, 2, 0] as const;
  const BACKBONE = '#efe6c8';
  const CX = 240;
  const CY = 135;
  const ROW = 12;
  const SPREAD = 34;
  /** The row whose copy goes wrong, and the base that lands there instead. */
  const SLIP = 3;
  const SLIP_BASE = 0;

  /** One half of a base pair, around the pair's centre: backbone bead and base. */
  function half(color: string, side: -1 | 1, scale = 1): string {
    const s = (v: number): string => (v * scale).toFixed(1);
    return `<path d="M${s(side * 14)} ${s(-6)}V${s(6)}" stroke="${BACKBONE}" stroke-width="${s(2)}"/>` +
      `<rect x="${s(side < 0 ? -12 : 1)}" y="${s(-3.5)}" width="${s(11)}" height="${s(7)}" rx="${s(2.5)}" fill="${color}"/>` +
      `<circle cx="${s(side * 14)}" r="${s(3.4)}" fill="${BACKBONE}"/>`;
  }

  const rowY = (k: number): number => CY - ((STRAND.length - 1) * ROW) / 2 + k * ROW;

  /** The first strand gathers from the water, its partner pairs up, the pair twists and unzips. */
  function replicator(rnd: () => number): string {
    let out = '';
    STRAND.forEach((b, k) => {
      // The building blocks come from the vent, where the warm water makes them.
      const left = `<g${once('move', { dx: -SPREAD, delay: 5.3, dur: 0.6, ease: 'cubic-bezier(0.3, 0, 0.2, 1)' })}>` +
        `<g${once('enter', { dx: (-110 - rnd() * 60).toFixed(0), dy: (-20 + (rnd() - 0.5) * 90).toFixed(0), delay: (0.3 + k * 0.32).toFixed(2), dur: 1.5 })}>${half(BASES[b], -1)}</g></g>`;
      const right = `<g${once('move', { dx: SPREAD, delay: 5.3, dur: 0.6, ease: 'cubic-bezier(0.3, 0, 0.2, 1)' })}>` +
        `<g${once('enter', { dx: 60 + k * 6, dy: -10, delay: (3.0 + k * 0.12).toFixed(2), dur: 0.8 })}>${half(BASES[PARTNER[b]], 1)}</g></g>`;
      out += `<g transform="translate(${CX} ${rowY(k).toFixed(1)})"><g${mo('twist', { dur: 0.45, n: 2, delay: (4.05 + k * 0.07).toFixed(2) })}>${left}${right}</g></g>`;
    });
    return out;
  }

  /** Each separated strand gathers a new partner: two copies, one with a slip. */
  function copies(): string {
    let out = '';
    STRAND.forEach((b, k) => {
      const delay = (5.75 + k * 0.06).toFixed(2);
      out += `<g transform="translate(${CX - SPREAD} ${rowY(k).toFixed(1)})"><g${once('enter', { dx: 18, delay, dur: 0.5 })}>${half(BASES[PARTNER[b]], 1)}</g></g>`;
      const copied = k === SLIP ? SLIP_BASE : b;
      out += `<g transform="translate(${CX + SPREAD} ${rowY(k).toFixed(1)})"><g${once('enter', { dx: -18, delay, dur: 0.5 })}>${half(BASES[copied], -1)}</g></g>`;
    });
    // The copying error glints where it happened.
    out += `<g transform="translate(${CX + SPREAD - 7} ${rowY(SLIP)})"><g${once('pop', { delay: 6.25, dur: 0.5 })}>` +
      `<path d="M0 -9L2 -2L9 0L2 2L0 9L-2 2L-9 0L-2 -2Z" fill="#ffffff"${mo('twinkle', { dur: 0.8, o: 0.3 })}/></g></g>`;
    return out;
  }

  /** Fat molecules: a head that likes water and two tails that do not. */
  function lipid(angle: number, r: number, inward: boolean): string {
    const x = CX + Math.cos(angle) * r;
    const y = CY + Math.sin(angle) * r;
    const deg = (angle * 180) / Math.PI + (inward ? 180 : 0);
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})">` +
      `<path d="M-2 -1.3H-8.5M-2 1.3H-8.5" stroke="#d7c49a" stroke-width="1.3" stroke-linecap="round"/>` +
      `<circle r="3" fill="#7fe0d6"/></g>`;
  }

  /** The membrane assembling around both copies: the first cell. */
  function membrane(rnd: () => number): string {
    let out = `<circle cx="${CX}" cy="${CY}" r="68" fill="url(#cells-inside)"${once('fade', { delay: 6.6, dur: 0.8 })}/>`;
    for (const [r, n, inward] of [[74, 36, false], [57, 28, true]] as const) {
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const from = 70 + rnd() * 90;
        out += `<g${once('enter', { dx: (Math.cos(a) * from).toFixed(0), dy: (Math.sin(a) * from).toFixed(0), delay: (6.0 + rnd() * 0.6).toFixed(2), dur: 0.9 })}>${lipid(a, r, inward)}</g>`;
      }
    }
    return out;
  }

  /** A small cell with its double strand, for the divisions. */
  function daughter(r: number, tint: string, slip: boolean): string {
    let helix = '';
    for (let k = 0; k < 4; k++) {
      const b = STRAND[k + 1];
      const other = slip && k + 1 === SLIP ? SLIP_BASE : PARTNER[b];
      helix += `<g transform="translate(0 ${(-13.5 + k * 9).toFixed(1)})"><g${mo('twist', { dur: 1.6, delay: -k * 0.3 })}>${half(BASES[b], -1, 0.7)}${half(BASES[other], 1, 0.7)}</g></g>`;
    }
    return `<circle r="${r}" fill="${tint}" fill-opacity="0.22"/>` +
      `<circle r="${r}" fill="none" stroke="#7fe0d6" stroke-width="4" stroke-dasharray="1.5 4.2" stroke-linecap="round"/>` +
      `<circle r="${r - 6}" fill="none" stroke="#7fe0d6" stroke-width="3" stroke-dasharray="1.5 4.2" stroke-linecap="round" opacity="0.7"/>` + helix;
  }

  /** The cell divides; the daughter with the slip divides again sooner. */
  function division(): string {
    const plain = `<g transform="translate(${CX - SPREAD} ${CY})"><g${once('move', { dx: -62, delay: 9.4, dur: 1.1 })}>` +
      `<g${mo('pulse', { dur: 2.2, s: 1.04 })}>${daughter(42, '#5ccfd0', false)}</g></g></g>`;
    const variant = (dy: number, delay: number): string =>
      `<g${once('move', { dy, delay, dur: 0.9 })}><g${mo('pulse', { dur: 1.8, s: 1.05 })}>${daughter(34, '#f6c453', true)}</g></g>`;
    const thriving = `<g transform="translate(${CX + SPREAD} ${CY})"><g${once('move', { dx: 66, delay: 9.4, dur: 1.1 })}>` +
      during(0, 10.7, `<g${mo('pulse', { dur: 1.8, s: 1.05 })}>${daughter(42, '#f6c453', true)}</g>`, 0.5) +
      during(10.6, Infinity, variant(-40, 10.7) + variant(40, 10.7), 0.5) + '</g></g>';
    return during(9.0, Infinity, plain + thriving, 0.6);
  }

  /** The hot vent: a chimney, its glow and dark plumes rising. */
  function vent(rnd: () => number): string {
    let plumes = '';
    for (let k = 0; k < 7; k++) {
      plumes += `<circle cx="${(70 + (rnd() - 0.5) * 14).toFixed(1)}" cy="118" r="${(9 + rnd() * 8).toFixed(1)}" fill="#3a3a3c"` +
        `${mo('rise', { dy: -130, dur: (4 + rnd() * 2).toFixed(1), delay: (-rnd() * 6).toFixed(1), o: 0.55, ease: 'ease-out' })}/>`;
    }
    // Building blocks keep forming in the warm water at the vent's mouth.
    let born = '';
    for (let k = 0; k < 8; k++) {
      born += `<rect x="68" y="120" width="6" height="4" rx="1.5" fill="${BASES[k % 4]}"` +
        `${mo('drift', { dx: (90 + rnd() * 110).toFixed(0), dy: (-50 + rnd() * 60).toFixed(0), dur: (3.5 + rnd() * 2).toFixed(1), delay: (-rnd() * 4).toFixed(1), ease: 'ease-out' })}/>`;
    }
    return plumes + during(0, 6.5, born, 0.8) +
      `<circle cx="70" cy="122" r="46" fill="url(#cells-glow)"${mo('pulse', { dur: 2.6, s: 1.12 })}/>` +
      `<path d="M44 236L52 170L58 150L62 126L78 126L82 152L90 176L100 236Z" fill="#3b2f29"/>` +
      `<path d="M58 160L66 150M84 176L74 166M60 196L70 186" stroke="#ff9a52" stroke-width="2" stroke-linecap="round"${mo('twinkle', { dur: 1.4, o: 0.35 })}/>` +
      `<ellipse cx="70" cy="126" rx="9" ry="3" fill="#ffb066"/>`;
  }

  EVO_FILMS.cells = (): string => {
    const rnd = seeded(31);
    const defs = vgrad('cells-water', [[0, '#16465a'], [0.55, '#0f3044'], [1, '#081a26']]) +
      glowGrad('cells-glow', '#ff9a52', 0.55) +
      `<radialGradient id="cells-inside"><stop offset="0.6" stop-color="#5ccfd0" stop-opacity="0.08"/><stop offset="1" stop-color="#5ccfd0" stop-opacity="0.32"/></radialGradient>`;
    let drifting = '';
    for (let k = 0; k < 12; k++) {
      const x = 130 + rnd() * 330;
      const y = 60 + rnd() * 160;
      drifting += `<g${mo('drift', { dx: (rnd() * 30 - 15).toFixed(0), dy: (rnd() * 20 - 10).toFixed(0), dur: (5 + rnd() * 4).toFixed(1), delay: (-rnd() * 6).toFixed(1) })}>` +
        `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="6" height="4" rx="1.5" fill="${BASES[k % 4]}" opacity="0.45"/></g>`;
    }
    const body = `<rect width="${FILM_W}" height="${FILM_H}" fill="url(#cells-water)"/>` +
      motes('cells-dust', 22, 'rgba(255,190,120,0.45)', 0, FILM_W, 30, 230, 7, 1.1) +
      hills(236, 10, '#1d1a19', 4) + vent(rnd) + during(0, 9, drifting, 0.8) +
      during(0, 9.4, replicator(rnd) + copies() + membrane(rnd), 0.6) +
      during(3.6, 6.2, tag(CX + 34, CY - 50, 'Erbmolekül', 3.6), 0.4) +
      during(7.0, 8.8, tag(CX + 82, CY - 52, 'Hülle', 7.0, 'start'), 0.4) +
      sparkle(CX, CY, PAL.origin, 6.8, 1.6) +
      division() + tag(CX + SPREAD + 66 + 40, CY + 4, 'Variante', 11.0, 'start');
    return film('cells', defs, body);
  };
}
