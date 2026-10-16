/* =============================================================================
 * SimEarth 2.0 — the effect art contract
 * -----------------------------------------------------------------------------
 * Ids, boxes, frames and anchors of every disaster effect: sprites the effect
 * layer draws over the map, and seamless animated ground textures it lays
 * through the terrain's edge masks (lava, later flood water and embers).
 * One recipe file per family under tools/fx/ draws what is listed here;
 * src/fx*.ts reads the manifest the generator writes (src/fxatlas.ts).
 * Spec: docs/ereignisse-spec.md §2.4 · style: docs/ereignisse-2026-10/stil.md.
 *
 * Sprites:
 *   w × h     box in 8-px steps; `tile: true` marks a tile-bound object
 *             16 wide and 20 or 24 high, built like a tree or a city
 *   frames    animation frames (variants for a still sprite, fps 0)
 *   fps       8–12 for animations; `loop` frames repeat, the rest play once
 *   anchor    'foot': bottom centre stands on the tile's last row and the
 *             sprite grows upwards like a tree; 'center': centred on the tile
 *   layer     'object' (sorted by foot with the map's objects) or 'top'
 *   mirror    'generator' when a mirrored set exists (form mirrored, light
 *             re-applied from the upper left); 'runtime' only for sprites
 *             whose light is symmetric; absent: never mirrored
 *   directions  directed sprites: frames hold this many directions in the
 *             order of HAZARD_NX/HAZARD_NY, frames / directions each; every
 *             direction is drawn by the generator, never rotated
 * ========================================================================== */
'use strict';

/** Recipe files, one per family; a family without a file has no art yet. */
const FAMILIES = ['smoke', 'volcano', 'fire', 'impact', 'water', 'earth'];

const SPRITES = [
  { id: 'smoke_puff', name: 'Rauchwölkchen', family: 'smoke', w: 8, h: 8, frames: 4, fps: 8, anchor: 'center', layer: 'top' },
  { id: 'steam_puff', name: 'Dampfwolke', family: 'smoke', w: 16, h: 16, frames: 4, fps: 8, anchor: 'center', layer: 'top' },
  {
    id: 'volcano_column', name: 'Ausbruchssäule mit Lavafontäne', family: 'volcano', w: 32, h: 48, frames: 8, fps: 10,
    anchor: 'foot', layer: 'object',
  },
  {
    id: 'ash_cloud', name: 'Aschewolke', family: 'volcano', w: 48, h: 32, frames: 7, loop: 4, fps: 6,
    anchor: 'center', layer: 'top',
  },
  {
    id: 'vent_cone', name: 'Schlot mit Krater (aktiv, frisch, bewachsen)', family: 'volcano', w: 24, h: 24, frames: 3, fps: 0,
    anchor: 'foot', layer: 'object', mouth: [12, 7],
  },
  { id: 'lava_splash', name: 'Lavaspritzer', family: 'volcano', w: 8, h: 8, frames: 4, fps: 10, anchor: 'center', layer: 'object' },

  // Fire (Flächenbrand): flames stand on burning tiles, smoke drifts with the wind.
  { id: 'flame_small', name: 'Flamme, klein', family: 'fire', w: 16, h: 20, tile: true, frames: 6, fps: 10, anchor: 'foot', layer: 'object', mirror: 'runtime' },
  { id: 'flame_medium', name: 'Flamme, mittel', family: 'fire', w: 16, h: 20, tile: true, frames: 6, fps: 10, anchor: 'foot', layer: 'object', mirror: 'runtime' },
  { id: 'flame_large', name: 'Flamme, groß', family: 'fire', w: 16, h: 20, tile: true, frames: 6, fps: 10, anchor: 'foot', layer: 'object', mirror: 'runtime' },
  { id: 'smoke_plume', name: 'Rauchfahne, aufrecht', family: 'fire', w: 16, h: 32, frames: 6, fps: 8, anchor: 'foot', layer: 'top' },
  { id: 'smoke_plume_east', name: 'Rauchfahne, nach Osten geneigt', family: 'fire', w: 24, h: 32, frames: 6, fps: 8, anchor: 'foot', layer: 'top', mirror: 'generator' },
  { id: 'smoke_plume_west', name: 'Rauchfahne, nach Westen geneigt', family: 'fire', w: 24, h: 32, frames: 6, fps: 8, anchor: 'foot', layer: 'top', mirror: 'generator' },
  { id: 'charred_trunk', name: 'Verkohlter Stamm', family: 'fire', w: 8, h: 16, frames: 3, fps: 0, anchor: 'foot', layer: 'object' },

  // Impacts (Meteorit, Atomschlag).
  { id: 'meteor_streak', name: 'Feuerschweif', family: 'impact', w: 32, h: 32, frames: 4, fps: 12, anchor: 'center', layer: 'top' },
  { id: 'flash', name: 'Örtlicher Blitz (Frames 0, 1) und Feuerball ohne Weiß (2)', family: 'impact', w: 32, h: 32, frames: 3, fps: 12, anchor: 'center', layer: 'top' },
  { id: 'dust_cloud', name: 'Staubwolke', family: 'impact', w: 48, h: 48, frames: 8, fps: 6, anchor: 'center', layer: 'top' },
  { id: 'mushroom', name: 'Pilzwolke', family: 'impact', w: 32, h: 48, frames: 8, fps: 6, anchor: 'foot', layer: 'object' },
  { id: 'water_fountain', name: 'Wasserfontäne', family: 'impact', w: 16, h: 32, frames: 6, fps: 10, anchor: 'foot', layer: 'object' },
  { id: 'crater_rim', name: 'Kraterrand (frisch, verwittert)', family: 'impact', w: 24, h: 16, frames: 2, fps: 0, anchor: 'foot', layer: 'object' },
  { id: 'stump', name: 'Versengter Stumpf', family: 'impact', w: 8, h: 8, frames: 3, fps: 0, anchor: 'foot', layer: 'object' },

  // Water and wind (Flutwelle, Wirbelsturm).
  // Directed sprites hold 8 directions one after another (HAZARD_NX/NY order), each with its own frames.
  { id: 'wave_deep', name: 'Wellenkamm, tief: 8 Richtungen × 4 Frames', family: 'water', w: 16, h: 8, frames: 32, fps: 8, anchor: 'center', layer: 'object', mirror: 'generator', directions: 8 },
  { id: 'wave_coast', name: 'Wellenkamm, küstennah: 8 Richtungen × 4 Frames', family: 'water', w: 16, h: 16, frames: 32, fps: 8, anchor: 'center', layer: 'object', mirror: 'generator', directions: 8 },
  { id: 'wave_break', name: 'Brechende Welle: 8 Richtungen × 6 Frames', family: 'water', w: 16, h: 24, frames: 48, fps: 10, anchor: 'foot', layer: 'object', mirror: 'generator', directions: 8 },
  { id: 'hurricane', name: 'Wirbelsturm, Nordhalbkugel', family: 'water', w: 48, h: 48, frames: 8, fps: 8, anchor: 'center', layer: 'top', mirror: 'generator' },
  { id: 'hurricane_south', name: 'Wirbelsturm, Südhalbkugel', family: 'water', w: 48, h: 48, frames: 8, fps: 8, anchor: 'center', layer: 'top', mirror: 'generator' },
  { id: 'tornado', name: 'Tornado-Trichter', family: 'water', w: 16, h: 32, frames: 6, fps: 10, anchor: 'foot', layer: 'object' },
  { id: 'storm_small', name: 'Sich formender Sturm, Nordhalbkugel', family: 'water', w: 32, h: 32, frames: 2, fps: 4, anchor: 'center', layer: 'top', mirror: 'generator' },
  { id: 'storm_small_south', name: 'Sich formender Sturm, Südhalbkugel', family: 'water', w: 32, h: 32, frames: 2, fps: 4, anchor: 'center', layer: 'top', mirror: 'generator' },
  { id: 'fallen_tree', name: 'Umgestürzter Baum', family: 'water', w: 16, h: 8, frames: 3, fps: 0, anchor: 'foot', layer: 'object' },
  { id: 'driftwood', name: 'Treibgut', family: 'water', w: 8, h: 8, frames: 3, fps: 0, anchor: 'foot', layer: 'object' },

  // Earth (Erdbeben), and the ruins every disaster can leave.
  { id: 'dust_puff', name: 'Staubwölkchen', family: 'earth', w: 16, h: 16, frames: 5, fps: 10, anchor: 'center', layer: 'top' },
  { id: 'rubble', name: 'Trümmer über einer Stadt', family: 'earth', w: 16, h: 16, frames: 2, fps: 4, anchor: 'foot', layer: 'object' },
  { id: 'fissure', name: 'Erdriss, flach: 4 Richtungen (−, |, /, \\) × Mitte, Ende, Abzweigung', family: 'earth', w: 16, h: 16, frames: 12, fps: 0, anchor: 'center', layer: 'object' },
  { id: 'ruin', name: 'Ruine', family: 'earth', w: 16, h: 20, tile: true, frames: 3, fps: 0, anchor: 'foot', layer: 'object' },
];

/**
 * Seamless ground textures (`size` square), drawn per tile through the
 * terrain's frayed edge masks; `rim` outlines the layer where it meets
 * plain ground, so glowing lava always has a darker edge. A film (rim null)
 * is transparent where it shows nothing. Which tiles carry which texture,
 * and which draws over which, is GROUND_LAYERS in src/fxground.ts.
 */
const TEXTURES = [
  { id: 'lava_hot', name: 'Lava, glühend', family: 'volcano', size: 64, frames: 4, fps: 8, rim: 'red0' },
  { id: 'lava_dim', name: 'Lava, dunkelrot', family: 'volcano', size: 64, frames: 4, fps: 6, rim: 'soil0' },
  { id: 'lava_crust', name: 'Lavakruste mit Glutrissen', family: 'volcano', size: 64, frames: 2, fps: 3, rim: 'rock0' },
  { id: 'embers', name: 'Glut unter den Flammen', family: 'fire', size: 64, frames: 2, fps: 4, rim: 'soil0' },
  { id: 'ground_burnt', name: 'Verbrannte Erde', family: 'fire', size: 64, frames: 1, fps: 0, rim: 'soil0' },
  { id: 'ground_crater', name: 'Kraterboden', family: 'impact', size: 64, frames: 1, fps: 0, rim: 'rock0' },
  { id: 'ground_scorched', name: 'Versengter Boden', family: 'impact', size: 64, frames: 1, fps: 0, rim: 'soil0' },
  { id: 'ground_ash', name: 'Asche', family: 'impact', size: 64, frames: 1, fps: 0, rim: 'rock1' },
  { id: 'fallout_film', name: 'Fahler Schleier (Fallout)', family: 'impact', size: 64, frames: 1, fps: 0, rim: null },
  { id: 'flood_water', name: 'Flutwasser', family: 'water', size: 64, frames: 2, fps: 4, rim: 'water7' },
  { id: 'wet_ground', name: 'Nasser Boden (Pfützen)', family: 'water', size: 64, frames: 1, fps: 0, rim: null },
];

/** Colours one sprite frame or texture frame may use, shading included. */
const MAX_COLORS = 12;

module.exports = { FAMILIES, SPRITES, TEXTURES, MAX_COLORS };
