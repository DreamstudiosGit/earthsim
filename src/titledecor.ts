/* =============================================================================
 * SimEarth 2.0 — title screen decoration
 * -----------------------------------------------------------------------------
 * Everything around the controls that is only there to look at: the starry
 * sky with its asteroids, the cyan HUD marks, the orbit around the logo, the
 * orbits and moons around the globe, the info card and the quote. All of it is
 * hidden from screen readers except the info card and the quote.
 * ========================================================================== */

namespace SE {
  /**
   * The version from package.json, written into simulation.js by
   * tools/stamp-version.js after every build; 'dev' in a bare `tsc` build.
   */
  export const APP_VERSION: string = 'dev';

  function titleArt(name: string): string {
    return `assets/title/${name}.svg`;
  }

  function decor(cls: string): HTMLElement {
    const node = make('div', cls);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  /** Twinkling stars: x %, y %, size in px, delay in s. */
  const SPARKS: readonly (readonly [number, number, number, number])[] = [
    [4, 13, 7, 0], [27, 3, 5, 1.7], [41, 41, 5, 3.1], [47, 12, 9, 0.6], [53, 63, 7, 2.4],
    [57, 7, 5, 4.2], [62, 54, 9, 1.1], [68, 88, 5, 3.6], [74, 28, 7, 0.3], [83, 4, 5, 2.8],
    [88, 47, 7, 1.9], [94, 30, 9, 4.6], [97, 72, 5, 0.9], [36, 92, 5, 3.3],
  ];

  /**
   * Asteroids: asset, left %, bottom %, width in px, depth 0 (far) .. 2 (near).
   * They drift along the left edge and below the middle, clear of the footer text.
   */
  const ROCKS: readonly (readonly [string, number, number, number, number])[] = [
    ['asteroid-a', -2.6, 12, 112, 2], ['asteroid-b', 0.6, 27, 40, 1], ['asteroid-c', -0.4, 36, 20, 0],
    ['asteroid-a', 45, -6, 100, 2], ['asteroid-b', 52, 2, 46, 1], ['asteroid-c', 57, 8, 22, 0],
    ['asteroid-b', 49, 9, 22, 0], ['asteroid-c', 61, 0.5, 30, 1],
  ];

  /** Sky, nebula, sparkles and asteroids, behind everything. */
  export function titleSky(): HTMLElement {
    const sky = decor('title-sky');
    sky.append(make('div', 'title-stars'), make('div', 'title-nebula'));
    for (const [x, y, size, delay] of SPARKS) {
      const s = make('span', 'title-spark');
      s.style.cssText = `left:${x}%;top:${y}%;--s:${size}px;animation-delay:${delay}s`;
      sky.appendChild(s);
    }
    for (const [name, x, y, w, depth] of ROCKS) {
      const rock = img(titleArt(name), `title-rock depth-${depth}`);
      rock.style.cssText = `left:${x}%;bottom:${y}%;width:${w}px`;
      sky.appendChild(rock);
    }
    return sky;
  }

  /** Crosshairs and thin lines in the corners of the screen. */
  export function titleHud(): HTMLElement {
    const hud = decor('title-hud');
    for (const where of ['tl', 'logo', 'globe-top', 'globe-bottom']) hud.appendChild(make('span', `title-cross title-cross-${where}`));
    hud.append(make('span', 'title-line title-line-top'), make('span', 'title-line title-line-foot'));
    return hud;
  }

  /** The orbit arc around the logo, with its light point. */
  export function logoOrbit(): HTMLElement {
    const box = decor('title-logo-orbit');
    box.innerHTML = `<svg viewBox="0 0 600 200" preserveAspectRatio="none">
      <defs><linearGradient id="title-orbit-fade" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#4fd6e0" stop-opacity="0.85"/><stop offset="0.45" stop-color="#4fd6e0" stop-opacity="0.15"/>
        <stop offset="0.7" stop-color="#4fd6e0" stop-opacity="0.2"/><stop offset="1" stop-color="#9ff6ff" stop-opacity="0.95"/>
      </linearGradient></defs>
      <path d="M70 196 C -40 150 40 40 250 18 C 380 4 480 6 520 14" fill="none" stroke="url(#title-orbit-fade)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
    </svg><span class="title-logo-light"></span>`;
    return box;
  }

  /** Orbits around the globe, with markers, and the moons on them. */
  export function globeOrbits(): HTMLElement[] {
    const rings = decor('title-orbits');
    const marks = [-90, 25, 160, 215]
      .map((deg) => {
        const a = (deg * Math.PI) / 180;
        return `<rect x="${(Math.cos(a) * 118 - 1.2).toFixed(1)}" y="${(Math.sin(a) * 118 - 1.2).toFixed(1)}" width="2.4" height="2.4"/>`;
      })
      .join('');
    rings.innerHTML = `<svg viewBox="-100 -100 200 200" overflow="visible">
      <circle r="118" class="title-orbit"/>
      <path d="M-98 -96 A152 140 0 0 0 -112 92" class="title-orbit title-orbit-far"/>
      <path d="M128 -60 A150 150 0 0 1 120 76" class="title-orbit title-orbit-far"/>
      <path d="M0 -136v14M0 122v14" class="title-orbit title-orbit-tick"/>
      <g class="title-orbit-marks">${marks}<rect x="-1.8" y="-139.6" width="3.6" height="3.6"/><rect x="-1.8" y="136" width="3.6" height="3.6"/></g>
    </svg>`;
    const moons = [
      img(titleArt('moon-large'), 'title-moon title-moon-large'),
      img(titleArt('moon-small'), 'title-moon title-moon-small'),
      img(titleArt('asteroid-c'), 'title-moon title-moon-tiny'),
    ];
    for (const m of moons) m.setAttribute('aria-hidden', 'true');
    return [rings, ...moons];
  }

  export function titleInfoCard(): HTMLElement {
    const card = make('aside', 'title-info');
    card.setAttribute('aria-label', 'Über das Spiel');
    const text = make('div', 'title-info-text');
    text.append(
      make('strong', undefined, 'SimEarth 2'),
      make('span', undefined, 'Planetensimulation'),
      make('span', 'title-info-ver', /^\d/.test(APP_VERSION) ? `v${APP_VERSION}` : 'Entwicklungsstand'),
      make('span', undefined, 'Eine lebende Welt'),
    );
    card.append(img(titleArt('satellite'), 'title-info-sat'), text, decor('title-info-signal'));
    return card;
  }

  export function titleQuote(): HTMLElement {
    const fig = make('figure', 'title-quote');
    const q = make('blockquote');
    q.appendChild(make('p', undefined, '»Ein Planet ist mehr als nur Land und Meer. Es ist eine Geschichte.«'));
    fig.append(q, decor('title-quote-arrow'));
    return fig;
  }
}
