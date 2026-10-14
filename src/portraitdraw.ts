/* =============================================================================
 * SimEarth 2.0 — drawing species portraits
 * -----------------------------------------------------------------------------
 * Turns the portrait data of species/portraits/ into inline SVG for the
 * lexicon and the species info box, with the same three passes as the map
 * icons (artdraw.ts): a soft drop shadow, one ink outline round the whole
 * silhouette, then the colours. Undiscovered entries get only the silhouette,
 * filled with currentColor so the stylesheet decides how dark it reads.
 *
 * A class whose portraits are not drawn yet falls back to its map icon, so
 * the lexicon is complete from the first build on.
 * ========================================================================== */

namespace SE {
  export type PictureMode = 'full' | 'silhouette';

  /** Outline width and shadow of a portrait, in portrait units (of 64). */
  const PORTRAIT_OUTLINE = 2;
  const PORTRAIT_SHADOW = 0.25;
  const PORTRAIT_SHADOW_OFFSET = 2.5;

  interface Shape {
    readonly d: string;
    readonly o?: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly w?: number;
  }

  /** Translucent shading and highlights cast no outline (as in artdraw.ts). */
  function solid(s: Shape): boolean {
    return (s.o ?? 1) >= 0.5;
  }

  function svgOf(shapes: readonly Shape[], size: number, outline: number, shadow: number, offset: number, mode: PictureMode, cls: string): string {
    const span = size + offset;
    const sil = shapes.filter(solid).map((s) => (s.fill !== undefined
      ? `<path d="${s.d}" stroke-width="${outline}"/>`
      : `<path d="${s.d}" fill="none" stroke-width="${(s.w ?? 1) + outline}"/>`)).join('');
    const ink = mode === 'silhouette' ? 'currentColor' : ART_PALETTE.ink;
    let body = '';
    if (shadow > 0) {
      body += `<g transform="translate(${offset} ${offset})" opacity="${shadow}" fill="${ink}" stroke="${ink}">${sil}</g>`;
    }
    body += `<g fill="${ink}" stroke="${ink}">${sil}</g>`;
    if (mode === 'full') {
      const op = (s: Shape): string => (s.o !== undefined && s.o < 1 ? ` opacity="${s.o}"` : '');
      body += shapes.map((s) => (s.fill !== undefined
        ? `<path d="${s.d}" fill="${s.fill}"${op(s)}/>`
        : `<path d="${s.d}" fill="none" stroke="${s.stroke}" stroke-width="${s.w}"${op(s)}/>`)).join('');
    }
    return `<svg class="${cls}" viewBox="0 0 ${span} ${span}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  /** A portrait as inline SVG markup. */
  export function portraitSvg(art: readonly PortraitShape[], mode: PictureMode = 'full', cls = 'species-picture'): string {
    const shapes = art.map((s): Shape => ('f' in s
      ? { d: s.d, o: s.o, fill: PORTRAIT_PALETTE[s.f] }
      : { d: s.d, o: s.o, stroke: PORTRAIT_PALETTE[s.s], w: s.w }));
    return svgOf(shapes, PORTRAIT_SIZE, PORTRAIT_OUTLINE, PORTRAIT_SHADOW, PORTRAIT_SHADOW_OFFSET, mode, cls);
  }

  /**
   * The picture of a sub-species: its portrait, or its map icon while the
   * portrait is missing. '' for a class without art at all.
   */
  export function speciesPicture(c: Life, stage: number, mode: PictureMode = 'full', cls = 'species-picture'): string {
    const portrait = SPECIES_PORTRAITS[c]?.[stage];
    if (portrait) return portraitSvg(portrait.art, mode, cls);
    const art = SPECIES[c]?.stages[stage]?.art;
    if (!art) return '';
    if (mode === 'full') return artSvg(art, CREATURE_LOOK, `${cls} is-icon`);
    const shapes = art.map((s): Shape => ('f' in s ? { d: s.d, o: s.o, fill: '' } : { d: s.d, o: s.o, w: s.w }));
    return svgOf(shapes, 32, CREATURE_LOOK.outline, CREATURE_LOOK.shadow, 2, 'silhouette', `${cls} is-icon`);
  }
}
