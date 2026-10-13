/* =============================================================================
 * SimEarth 2.0 — the Edit window's tile cache
 * -----------------------------------------------------------------------------
 * Every tile graphic the map draws, rasterised once and found by number:
 * grounds with their relief already shaded in, sea tiles with their ripple,
 * creatures, trees and cities with their drop shadow. One blit per layer
 * instead of up to three, and no string built per tile — a full redraw of a
 * large screen touches fifteen thousand tiles and more.
 * ========================================================================== */

namespace SE {
  /** Rasterisation scale: the 8x8 sprites become 16x16 canvases. */
  const SCALE = 2;
  /** Shadowed sprites reach one sprite pixel further right and down. */
  export const SHADOW_SPAN = 9 / 8;
  /** Relief steps either side of flat, as the Edit window quantises them. */
  export const RELIEF_STEPS = 16;
  /** Ground tiles marked with this index are perpetual snow, not a biome. */
  export const SNOW_GROUND = BIOME_COUNT;

  const SHADOW_ALPHA = { life: 0.35, city: 0.4, tree: 0.3 };
  const RIPPLE_ALPHA = { coast: 0.2, ocean: 0.12 };
  const SURF_ALPHA = 0.55;
  /** Kelp is seen through the water above it. */
  const KELP_ALPHA = 0.45;

  function blank(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('SimEarth: cannot rasterise a tile');
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  /** Sprite art drawn at an opacity, as one canvas. */
  function faded(rows: SpriteRows, alpha: number): HTMLCanvasElement {
    const { canvas, ctx } = blank(8 * SCALE, 8 * SCALE);
    ctx.globalAlpha = alpha;
    ctx.drawImage(drawPixelArt(rows, SCALE), 0, 0);
    return canvas;
  }

  /** Sprite art over its own silhouette, offset one sprite pixel down-right. */
  function withShadow(rows: SpriteRows, alpha: number): HTMLCanvasElement {
    const { canvas, ctx } = blank(9 * SCALE, 9 * SCALE);
    ctx.globalAlpha = alpha;
    ctx.drawImage(drawPixelArt(rows.map((r) => r.replace(/[^.]/g, 'k')), SCALE), SCALE, SCALE);
    ctx.globalAlpha = 1;
    ctx.drawImage(drawPixelArt(rows, SCALE), 0, 0);
    return canvas;
  }

  export class TileCache {
    private readonly grounds: HTMLCanvasElement[] = [];
    private readonly seas: HTMLCanvasElement[] = [];
    private readonly creatures: HTMLCanvasElement[] = [];
    private readonly cities: HTMLCanvasElement[] = [];
    private readonly plants: HTMLCanvasElement[] = [];
    private readonly rivers: HTMLCanvasElement[] = [];
    private readonly surfs: HTMLCanvasElement[] = [];
    private readonly events: HTMLCanvasElement[] = [];
    private riverAlgaeTile: HTMLCanvasElement | null = null;

    /**
     * A land ground — a Biome, or SNOW_GROUND — in one of four variants, with
     * the relief `step` (−RELIEF_STEPS..RELIEF_STEPS) shaded in as `wash`.
     */
    ground(ground: number, variant: number, step: number, wash: string | null): HTMLCanvasElement {
      const k = (ground * 4 + variant) * (2 * RELIEF_STEPS + 1) + step + RELIEF_STEPS;
      let tile = this.grounds[k];
      if (!tile) {
        const rows = ground === SNOW_GROUND ? SNOW_VARIANTS[variant] : GROUND_VARIANTS[ground][variant];
        const { canvas, ctx } = blank(8 * SCALE, 8 * SCALE);
        ctx.drawImage(drawPixelArt(rows, SCALE), 0, 0);
        if (wash) {
          ctx.fillStyle = wash;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        tile = this.grounds[k] = canvas;
      }
      return tile;
    }

    /** Open water at a depth step (see depthStep) with its ripple. */
    sea(depth: number, coast: boolean, variant: number): HTMLCanvasElement {
      const k = (depth * 2 + (coast ? 1 : 0)) * 4 + variant;
      let tile = this.seas[k];
      if (!tile) {
        const { canvas, ctx } = blank(8 * SCALE, 8 * SCALE);
        ctx.fillStyle = depthStyleAt(depth);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = coast ? RIPPLE_ALPHA.coast : RIPPLE_ALPHA.ocean;
        ctx.drawImage(drawPixelArt(GROUND_VARIANTS[coast ? Biome.Coast : Biome.Ocean][variant], SCALE), 0, 0);
        tile = this.seas[k] = canvas;
      }
      return tile;
    }

    /** A creature with its shadow; draw it SHADOW_SPAN times the tile size. */
    life(c: Life, stage: number): HTMLCanvasElement {
      const k = c * SUBSPECIES_PER_CLASS + stage;
      return this.creatures[k] ?? (this.creatures[k] = withShadow(LIFE_SPRITES[c][stage], SHADOW_ALPHA.life));
    }

    /** A city with its shadow; draw it SHADOW_SPAN times the tile size. */
    city(t: Tech): HTMLCanvasElement {
      return this.cities[t] ?? (this.cities[t] = withShadow(CITY_SPRITES[t], SHADOW_ALPHA.city));
    }

    /**
     * A plant group's cover. Trees come with a shadow (draw them SHADOW_SPAN
     * times the tile size); kelp comes faded by the water above it.
     */
    plant(g: Flora, dense: number): HTMLCanvasElement {
      const k = g * 2 + dense;
      let tile = this.plants[k];
      if (!tile) {
        const rows = FLORA_SPRITES[g][dense];
        tile = this.plants[k] = FLORA[g].woody ? withShadow(rows, SHADOW_ALPHA.tree)
          : FLORA[g].realm === 'sea' ? faded(rows, KELP_ALPHA) : faded(rows, 1);
      }
      return tile;
    }

    river(wide: number, mask: number): HTMLCanvasElement {
      const k = wide * 16 + mask;
      return this.rivers[k] ?? (this.rivers[k] = faded(RIVER_SPRITES[wide][mask], 1));
    }

    riverAlgae(): HTMLCanvasElement {
      return this.riverAlgaeTile ?? (this.riverAlgaeTile = faded(FLORA_SPRITES[Flora.FreshwaterAlgae][0], 1));
    }

    surf(mask: number): HTMLCanvasElement {
      return this.surfs[mask] ?? (this.surfs[mask] = faded(SURF_SPRITES[mask], SURF_ALPHA));
    }

    event(k: EventKind): HTMLCanvasElement {
      return this.events[k] ?? (this.events[k] = faded(EVENT_SPRITES[k], 1));
    }
  }
}
