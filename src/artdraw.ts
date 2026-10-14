/* =============================================================================
 * SimEarth 2.0 — drawing species art
 * -----------------------------------------------------------------------------
 * Turns the flat path data of species/types.ts into pictures: canvases for the
 * map, inline SVG for the windows. Both paint the same three passes — a soft
 * drop shadow, one uniform ink outline, then the colours — so a creature looks
 * the same on the map and in the Examine window, and every icon gets exactly
 * the same edge no matter who drew it.
 * ========================================================================== */

namespace SE {
  /** Shadowed art reaches one eighth of a tile further right and down. */
  export const SHADOW_SPAN = 9 / 8;
  /** Shadow offset in art units (of 32). */
  const SHADOW_OFFSET = 2;

  export interface ArtLook {
    /** Outline width in art units; 0 for none. */
    readonly outline: number;
    readonly outlineAlpha: number;
    /** Drop shadow opacity; 0 for none. */
    readonly shadow: number;
    /** Opacity of the whole icon. */
    readonly alpha: number;
  }

  export const CREATURE_LOOK: ArtLook = { outline: 3, outlineAlpha: 1, shadow: 0.35, alpha: 1 };
  export const TREE_LOOK: ArtLook = { outline: 2.2, outlineAlpha: 0.8, shadow: 0.3, alpha: 1 };
  export const PLANT_LOOK: ArtLook = { outline: 2, outlineAlpha: 0.65, shadow: 0, alpha: 1 };
  /** Kelp is seen through the water above it. */
  export const KELP_LOOK: ArtLook = { outline: 1.6, outlineAlpha: 0.5, shadow: 0, alpha: 0.45 };

  /*
   * Built on first use, never at load time: the bundle also runs in Node for
   * the tests and the probe, and Node has no Path2D.
   */
  const pathCache = new Map<string, Path2D>();
  function path(d: string): Path2D {
    let p = pathCache.get(d);
    if (!p) {
      p = new Path2D(d);
      pathCache.set(d, p);
    }
    return p;
  }

  /** Translucent details (a jellyfish bell, a highlight) cast no outline. */
  function solid(s: ArtShape): boolean {
    return (s.o ?? 1) >= 0.5;
  }

  function canvasOf(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('SimEarth: cannot draw species art');
    return { canvas, ctx };
  }

  /** Paint the art, or its ink silhouette widened by `outline`. */
  function paint(
    ctx: CanvasRenderingContext2D, art: Art, px: number, flip: boolean, silhouette: boolean, outline: number,
  ): void {
    ctx.save();
    if (flip) {
      ctx.translate(px, 0);
      ctx.scale(-1, 1);
    }
    ctx.scale(px / 32, px / 32);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of art) {
      const p = path(s.d);
      if (silhouette) {
        if (!solid(s)) continue;
        ctx.fillStyle = ctx.strokeStyle = ART_PALETTE.ink;
        if ('f' in s) {
          ctx.fill(p);
          if (outline > 0) {
            ctx.lineWidth = outline;
            ctx.stroke(p);
          }
        } else {
          ctx.lineWidth = s.w + outline;
          ctx.stroke(p);
        }
      } else {
        ctx.globalAlpha = s.o ?? 1;
        if ('f' in s) {
          ctx.fillStyle = ART_PALETTE[s.f];
          ctx.fill(p);
        } else {
          ctx.strokeStyle = ART_PALETTE[s.s];
          ctx.lineWidth = s.w;
          ctx.stroke(p);
        }
      }
    }
    ctx.restore();
  }

  /**
   * Rasterise art for a tile of `px` device pixels. With a shadow the canvas
   * is SHADOW_SPAN times larger; draw it at that multiple of the tile size.
   * `flip` mirrors the art to face left.
   */
  export function rasterArt(art: Art, px: number, look: ArtLook, flip = false): HTMLCanvasElement {
    const size = look.shadow > 0 ? Math.ceil(px * SHADOW_SPAN) : px;
    const { canvas, ctx } = canvasOf(size);
    if (look.shadow > 0 || look.outline > 0) {
      const sil = canvasOf(size);
      paint(sil.ctx, art, px, flip, true, look.outline);
      if (look.shadow > 0) {
        const off = (SHADOW_OFFSET * px) / 32;
        ctx.globalAlpha = look.shadow;
        ctx.drawImage(sil.canvas, off, off);
      }
      if (look.outline > 0) {
        ctx.globalAlpha = look.outlineAlpha;
        ctx.drawImage(sil.canvas, 0, 0);
      }
      ctx.globalAlpha = 1;
    }
    paint(ctx, art, px, flip, false, 0);
    if (look.alpha >= 1) return canvas;
    const faded = canvasOf(size);
    faded.ctx.globalAlpha = look.alpha;
    faded.ctx.drawImage(canvas, 0, 0);
    return faded.canvas;
  }

  /** The same picture as inline SVG markup, for the windows. */
  export function artSvg(art: Art, look: ArtLook, cls = 'art'): string {
    const span = look.shadow > 0 ? 32 * SHADOW_SPAN : 32;
    const op = (s: ArtShape): string => (s.o !== undefined && s.o < 1 ? ` opacity="${s.o}"` : '');
    const sil = art.filter(solid).map((s) => ('f' in s
      ? `<path d="${s.d}"${look.outline > 0 ? ` stroke-width="${look.outline}"` : ' stroke="none"'}/>`
      : `<path d="${s.d}" fill="none" stroke-width="${s.w + look.outline}"/>`)).join('');
    const ink = ART_PALETTE.ink;
    let body = '';
    if (look.shadow > 0) {
      body += `<g transform="translate(${SHADOW_OFFSET} ${SHADOW_OFFSET})" opacity="${look.shadow}" fill="${ink}" stroke="${ink}">${sil}</g>`;
    }
    if (look.outline > 0) body += `<g opacity="${look.outlineAlpha}" fill="${ink}" stroke="${ink}">${sil}</g>`;
    body += art.map((s) => ('f' in s
      ? `<path d="${s.d}" fill="${ART_PALETTE[s.f]}"${op(s)}/>`
      : `<path d="${s.d}" fill="none" stroke="${ART_PALETTE[s.s]}" stroke-width="${s.w}"${op(s)}/>`)).join('');
    const alpha = look.alpha < 1 ? ` opacity="${look.alpha}"` : '';
    return `<svg class="${cls}" viewBox="0 0 ${span} ${span}" stroke-linecap="round" stroke-linejoin="round"` +
      ` aria-hidden="true"${alpha}>${body}</svg>`;
  }
}
