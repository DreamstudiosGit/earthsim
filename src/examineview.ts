/* =============================================================================
 * SimEarth 2.0 — the Examine window's look at the landscape
 * -----------------------------------------------------------------------------
 * A 3 × 3-tile cut of the map around the examined tile, from the same
 * compositor as the map and enlarged by a whole factor so every art pixel
 * stays square, and every plant group of the tile as the map draws it: its
 * object for this landscape, or the patch of ground it lives in
 * (docs/biomes-spec.md §4.9).
 * ========================================================================== */

namespace SE {
  const CROP_TILES = 3;
  /** Side of a plant group's picture, in art pixels. */
  const FIGURE = 24;
  const DENSITY_NAMES: readonly (readonly string[])[] = [[], [], ['licht', 'dicht'], ['spärlich', 'mittel', 'dicht']];

  /** "Wiese (dicht) auf Erde": a land tile's landscape as the Examine window names it. */
  export function landscapeLabel(world: WorldState, i: number): string {
    if (world.isWater(i)) return BIOME_NAMES[world.biome[i]];
    const ls = world.landscape[i] as Landscape;
    const dens = DENSITY_NAMES[LANDSCAPE_DENSITIES[ls]]?.[world.landscapeDensity[i]];
    const name = LANDSCAPE_NAMES[ls] + (dens ? ` (${dens})` : '');
    // Ice and snow are covers, not grounds: they lie on whatever is beneath.
    return ls === Landscape.Ice || ls === Landscape.Snow ? name : `${name} auf ${SUBSTRATE_NAMES[world.substrate[i]]}`;
  }

  /** What the landscape section shows, for the Examine window's digest. */
  export function landDigest(world: WorldState, x: number, y: number): string {
    const land = PixelTerrain.shared();
    if (TERRAIN_STYLE !== 'pixel' || !land.ready) return '';
    land.ensure(world);
    return String(land.field.signature(x - 1, y - 1, CROP_TILES, CROP_TILES, 0));
  }

  /**
   * The Examine window's landscape card: the map around the tile, the
   * landscape's name and every plant group as the map draws it. Null when
   * the map does not use the pixel terrain.
   */
  export function landSection(world: WorldState, x: number, y: number, wide: boolean): HTMLElement | null {
    const i = idx(x, y);
    const crop = landCropView(world, x, y, wide ? 6 : 4);
    if (!crop) return null;
    const el = make('section', 'ex-card ex-land');
    const head = make('div', 'ex-card-head');
    head.append(img(uiIcon('layer-biomes'), 'ico'), make('h3', undefined, 'Landschaft'));
    const info = make('div', 'ex-land-info');
    info.append(make('div', 'ex-title', landscapeLabel(world, i)), make('div', 'ex-sub', `Lebensraum ${BIOME_NAMES[world.biome[i]]}`));
    const list = make('ul', 'ex-land-plants');
    for (let g = 1; g < FLORA_COUNT; g++) {
      if ((world.flora[i] & floraBit(g as Flora)) === 0) continue;
      const figure = plantFigure(world, i, g as Flora, wide ? 3 : 2);
      if (!figure) continue;
      const li = make('li', g === world.floraTop[i] ? 'lead' : undefined);
      li.append(figure, make('span', undefined, FLORA[g as Flora].name));
      list.appendChild(li);
    }
    if (list.childElementCount > 0) info.appendChild(list);
    else info.appendChild(make('p', 'ex-empty', world.isWater(i) ? 'Keine Algen.' : 'Kein Bewuchs.'));
    const body = make('div', 'ex-land-body');
    body.append(crop, info);
    el.append(head, body);
    return el;
  }

  /** The map around tile (x, y), `scale` screen pixels per art pixel, the tile itself framed. */
  export function landCropView(world: WorldState, x: number, y: number, scale: number): HTMLElement | null {
    const land = PixelTerrain.shared();
    if (TERRAIN_STYLE !== 'pixel' || !land.ready) return null;
    land.ensure(world);
    const ty0 = clamp(y - 1, 0, GRID_H - CROP_TILES);
    const canvas = cropCanvas(land, x - 1, ty0, CROP_TILES, CROP_TILES);
    if (!canvas) return null;
    const side = CROP_TILES * 16 * scale;
    const box = make('div', 'ex-land-crop');
    box.style.width = box.style.height = `${side}px`;
    canvas.className = 'pixel-art';
    const frame = make('span', 'ex-land-frame');
    frame.style.left = `${16 * scale}px`;
    frame.style.top = `${(y - ty0) * 16 * scale}px`;
    frame.style.width = frame.style.height = `${16 * scale}px`;
    box.append(canvas, frame);
    return box;
  }

  /** Tiles [tx0, tx0 + tw) × [ty0, ty0 + th) composed at 1× on a canvas, as the map composes them. */
  function cropCanvas(land: PixelTerrain, tx0: number, ty0: number, tw: number, th: number): HTMLCanvasElement | null {
    const composer = land.composer;
    if (!composer) return null;
    const canvas = document.createElement('canvas');
    canvas.width = tw * 16;
    canvas.height = th * 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const image = ctx.createImageData(canvas.width, canvas.height);
    composer.compose(land.field, tx0, ty0, tw, th, 0, new Uint32Array(image.data.buffer), null);
    ctx.putImageData(image, 0, 0);
    return canvas;
  }

  /** A plant group as the map shows it on tile i, `scale` screen pixels per art pixel. */
  export function plantFigure(world: WorldState, i: number, g: Flora, scale: number): HTMLCanvasElement | null {
    const land = PixelTerrain.shared();
    const art = land.art;
    if (TERRAIN_STYLE !== 'pixel' || !art) return null;
    const group = art.manifest.groups[FLORA[g].id];
    if (!group) return null;
    const sprite = figureSprite(world, i, g, art);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = FIGURE;
    canvas.className = 'pixel-art';
    canvas.style.width = canvas.style.height = `${FIGURE * scale}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const image = ctx.createImageData(FIGURE, FIGURE);
    const out = new Uint32Array(image.data.buffer);
    const x = i % GRID_W;
    const y = (i / GRID_W) | 0;
    // A group that lives in the ground shows its patch of ground; an object
    // stands alone on the card's light backdrop, where every silhouette reads.
    const swatch = !sprite && group.swatch ? group.swatch : null;
    const ground = swatch ? swatchTex(art, swatch.material, swatch.density) : null;
    if (ground) {
      const sea = art.water[4];
      for (let py = 0; py < FIGURE; py++) {
        for (let px = 0; px < FIGURE; px++) {
          const v = ground.px[((y * 16 + py) & (ground.size - 1)) * ground.size + ((x * 16 + px) & (ground.size - 1))];
          out[py * FIGURE + px] = art.rgba[v || sea];
        }
      }
    }
    if (sprite) {
      // Small plants (moss cushions, early stems) twice as large, still in whole pixels.
      const f = Math.max(1, Math.min(2, Math.floor((FIGURE - 4) / Math.max(sprite.w, sprite.h))));
      const left = (FIGURE >> 1) - sprite.ax * f;
      const top = FIGURE - 2 - (sprite.ay + 1) * f;
      for (let oy = 0; oy < sprite.h * f; oy++) {
        for (let ox = 0; ox < sprite.w * f; ox++) {
          const v = sprite.px[Math.floor(oy / f) * sprite.w + Math.floor(ox / f)];
          const x0 = left + ox;
          const y0 = top + oy;
          if (v !== 0 && x0 >= 0 && y0 >= 0 && x0 < FIGURE && y0 < FIGURE) out[y0 * FIGURE + x0] = art.rgba[v];
        }
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  }

  /** The first object the group shows in this tile's scene, else its first object anywhere unless it has a ground patch. */
  function figureSprite(world: WorldState, i: number, g: Flora, art: LandArt): LandSprite | null {
    const T = LandTables.shared();
    const scene = world.isWater(i) ? LAND_SCENE_SEA : world.landscape[i];
    for (const kind of [LAND_KIND_TREE, LAND_KIND_BUSH, LAND_KIND_LOW, LAND_KIND_WATER]) {
      const list = T.choices(scene, g, kind);
      if (list.length > 0) return largest(art.sprites[list[0]]);
    }
    const group = art.manifest.groups[FLORA[g].id];
    if (group.swatch || group.objects.length === 0) return null;
    return largest(art.sprites[group.objects[group.objects.length - 1].id]);
  }

  function largest(vars: readonly LandSprite[] | undefined): LandSprite | null {
    if (!vars || vars.length === 0) return null;
    return vars.find((v) => v.size === 'l' && v.form === 0) ?? vars[0];
  }

  function swatchTex(art: LandArt, id: string, density: number): LandTex | null {
    const mat = art.manifest.materials[id];
    if (mat) return art.ground[mat.rank][Math.min(density, mat.densities.length - 1)];
    return id === 'algae_film' ? art.algae : null;
  }

}
