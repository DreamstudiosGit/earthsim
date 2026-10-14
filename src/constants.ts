/* =============================================================================
 * SimEarth 2.0 — constants, enums and the data tables that drive everything
 * -----------------------------------------------------------------------------
 * Terminology follows SimEarth: The Living Planet (Maxis, 1990) where the
 * original still holds up, and real biology where it does not. Player-facing
 * strings are German; identifiers and comments stay English.
 *
 * The evolution tree itself — which lineage descends from which, what habitat
 * and food each step needs, what it costs and what it does — lives in
 * evolution.ts. This file only carries the per-class simulation tuning.
 * ========================================================================== */

namespace SE {
  /* ---------------------------------------------------------------- world -- */

  /**
   * The planet is 256x128: X wraps (cylinder), Y is clamped at the poles.
   *
   * Every constant expressed *per tile* rather than per unit of planet has to be
   * re-derived when this changes — see MOISTURE_TRANSMISSION, DRIFT_SPEED_BASE
   * and the disaster brush radii, all of which carry a note saying so.
   */
  export const GRID_W = 256;
  export const GRID_H = 128;
  export const TILE_COUNT = GRID_W * GRID_H;

  /**
   * Fraction of the surface below sea level on a freshly generated planet,
   * unless the player picks another share. The mantle field is always cut at
   * this value so volcanism does not shift with the sea.
   */
  export const OCEAN_FRACTION = 0.58;
  /** The range the player may choose for a new planet's sea share. */
  export const OCEAN_SHARE_MIN = 0.30;
  export const OCEAN_SHARE_MAX = 0.85;

  /** Elevation 1.0 corresponds to this many kilometres above sea level. */
  export const ELEVATION_KM = 4.5;
  /** Degrees Celsius lost per kilometre of altitude. */
  export const LAPSE_RATE = 6.5;

  /**
   * Depth of the shelf break: water above this is Coast, below it open Ocean.
   * TerrainGenerator.normalize skews depths shallow, so -0.18 lands around a
   * quarter of the water on the shelf.
   */
  export const COAST_DEPTH = -0.18;

  /** Elevation above which a peak carries permanent snow (purely graphic). */
  export const SNOW_LINE = 0.78;

  /** Safety valve so a backgrounded tab cannot spiral on catch-up ticks. */
  export const MAX_TICKS_PER_FRAME = 64;

  /* --------------------------------------------------------------- colour -- */

  export type Rgb = readonly [number, number, number];

  /**
   * The standard 16-colour EGA palette, kept for the few UI colours that still
   * name it. The tile view's own palette is SPRITE_PALETTE in sprites.ts.
   */
  export const EGA = {
    black: [0, 0, 0] as Rgb,
    blue: [0, 0, 170] as Rgb,
    green: [0, 170, 0] as Rgb,
    cyan: [0, 170, 170] as Rgb,
    red: [170, 0, 0] as Rgb,
    magenta: [170, 0, 170] as Rgb,
    brown: [170, 85, 0] as Rgb,
    lightGray: [170, 170, 170] as Rgb,
    darkGray: [85, 85, 85] as Rgb,
    lightBlue: [85, 85, 255] as Rgb,
    lightGreen: [85, 255, 85] as Rgb,
    lightCyan: [85, 255, 255] as Rgb,
    lightRed: [255, 85, 85] as Rgb,
    lightMagenta: [255, 85, 255] as Rgb,
    yellow: [255, 255, 85] as Rgb,
    white: [255, 255, 255] as Rgb,
  };

  /* --------------------------------------------------------------- biomes -- */

  /**
   * Habitats. A biome is the *structure* of a place — wet, dry, wooded, open —
   * derived each tick from the tile's landscape (src/landscape.ts), which in
   * turn follows climate and the plant groups growing there.
   *
   * Water zones come first and stay contiguous, so "biome index below
   * WATER_BIOME_COUNT" is the test for wet. Tundra was appended last so that
   * every index a version-4 save wrote still means the same thing.
   */
  export enum Biome {
    Coast = 0,
    Ocean = 1,
    Rock = 2,
    Arctic = 3,
    Boreal = 4,
    Desert = 5,
    Grass = 6,
    Forest = 7,
    Jungle = 8,
    Swamp = 9,
    Tundra = 10,
  }
  export const BIOME_COUNT = 11;
  /** Biomes 0..N-1 are water. */
  export const WATER_BIOME_COUNT = 2;

  /**
   * "Grass" is shown as Offenland: open, low vegetation. Grasses proper are a
   * late flowering-plant group, and calling a moss-covered plain "grassland"
   * three hundred million years before grass existed would be exactly the kind
   * of contradiction the tree is meant to avoid.
   */
  export const BIOME_NAMES: readonly string[] = [
    'Küstenmeer', 'Hochsee', 'Fels', 'Eis', 'Nadelwald',
    'Wüste', 'Offenland', 'Wald', 'Regenwald', 'Sumpf', 'Tundra',
  ];

  /** File stem under assets/habitats/ for each biome. */
  export const BIOME_ICONS: readonly string[] = [
    'coast', 'ocean', 'rock', 'arctic', 'boreal',
    'desert', 'grass', 'forest', 'jungle', 'swamp', 'tundra',
  ];

  /** Base colour per biome, used by the Map window and legends. */
  export const BIOME_COLORS: readonly Rgb[] = [
    [48, 146, 182],  // Coast
    [24, 78, 136],   // Ocean
    [160, 155, 142], // Rock
    [232, 240, 240], // Arctic
    [36, 98, 78],    // Boreal
    [224, 198, 142], // Desert
    [124, 168, 84],  // Offenland
    [52, 120, 56],   // Forest
    [46, 150, 72],   // Jungle
    [98, 128, 62],   // Swamp
    [150, 156, 128], // Tundra
  ];

  /**
   * Shortwave reflectivity per biome — drives the ice-albedo feedback. The two
   * water figures average to 0.09 at the coast/open-water split COAST_DEPTH
   * produces, which is what the climate was calibrated against.
   */
  export const BIOME_ALBEDO: readonly number[] = [
    0.120, // Coast
    0.065, // Ocean
    0.25,  // Rock
    0.50,  // Arctic
    0.14,  // Boreal
    0.32,  // Desert
    0.20,  // Offenland
    0.16,  // Forest
    0.12,  // Jungle
    0.14,  // Swamp
    0.22,  // Tundra
  ];

  /* ----------------------------------------------- landscapes, succession -- */
  /*
   * The landscape of a land tile (src/landscape.ts) is read off its smoothed
   * climate on the matrix of docs/biomes-spec.md §3.4. Boundaries in °C
   * between frozen | cold | cool | warm | tropical, and in moisture between
   * dry | semi-arid | moderate | moderate-moist | humid | wet.
   */
  export const FROZEN_TEMP = -12;
  export const COLD_TEMP = 4;
  export const COOL_TEMP = 14;
  /**
   * Where warm becomes tropical (rainforest). Lower than Whittaker's ~20 °C
   * on purpose, so the wet equatorial lowland always qualifies once the
   * broadleaf trees are there: its smoothed temperature has a median of
   * 23-25 °C but a 5th percentile of only 16.6 °C (seeds 12345/777, 21 Ma),
   * because the 7×7 mean takes in the ~1 km high land around it.
   */
  export const TROPICAL_TEMP = 16;
  export const MOISTURE_BOUNDS: readonly number[] = [0.16, 0.24, 0.30, 0.38, 0.50];
  /** Above this elevation no trees grow: alpine tundra, lichen or rock. */
  export const TREE_LINE = 0.5;
  /** Standing water on flat ground: wetland (substrate Moor). */
  export const WETLAND_MOISTURE = 0.70;
  export const WETLAND_MAX_ELEVATION = 0.14;
  /** Plant cover below which land is bare (Fels, Rohboden or Wüste). */
  export const BARE_COVER = 0.12;
  /** Schmitt-trigger bands, each in favour of a tile's current class. */
  export const SCHMITT_TEMP = 1.5;
  export const SCHMITT_MOISTURE = 0.03;
  export const SCHMITT_ELEVATION = 0.02;
  export const SCHMITT_COVER = 0.04;
  /** Half-width of the box climate and plant cover are averaged over for the landscape (7×7). */
  export const LANDSCAPE_SMOOTH_RADIUS = 3;
  /** Plant cover at which open land turns medium and dense; forests use the upper one. */
  export const DENSITY_BOUNDS: readonly number[] = [0.30, 0.60];
  export const DENSITY_BAND = 0.04;
  /** Below this moisture and elevation bare lowland is sand. */
  export const SAND_MOISTURE = 0.24;
  export const SAND_MAX_ELEVATION = 0.15;

  /** Soil maturity (0..1) from which the ground counts as Erde. */
  export const SOIL_EARTH = 0.35;
  /**
   * What mosses and the first land plants build on their own: a thin crust.
   * Just above SOIL_EARTH so a moss carpet can follow lichen on rock.
   */
  export const SOIL_CRUST_MAX = 0.38;
  /** Soil built per tick at full plant cover (geologic ticks). */
  export const SOIL_BUILD_RATE = 0.08;
  /** Soil lost per tick on bare ground, before the slope adds to it. */
  export const SOIL_EROSION_RATE = 0.01;
  /** Erosion multiplier per unit of elevation difference to the steepest neighbour. */
  export const SOIL_SLOPE_FACTOR = 10;
  /** Soil an ice sheet scrapes off per tick. */
  export const SOIL_ICE_SCOUR = 0.05;
  /**
   * Years soil processes need to run their per-tick rates in full. Shorter
   * ticks (Civilization, Technology) scale the rates down, so soil forms
   * and wears in real years there.
   */
  export const SOIL_YEARS = 1000;
  /** Soil a migrated planet is assumed to have per unit of rooted plant cover. */
  export const SOIL_ROOT_FACTOR = 1.5;

  /** Minimum ticks a tile holds a stage before the next one (spec §6.3). */
  export const SUCCESSION_MIN_HOLD = 3;
  /** Extra ticks the per-tile hash adds to the minimum hold (0..this). */
  export const SUCCESSION_HOLD_SPREAD = 2;
  /** ± share by which the per-tile hash spreads holds measured in real years. */
  export const SUCCESSION_YEAR_SPREAD = 0.3;
  /** Neighbours already at the next stage that make a tile a front (halved hold). */
  export const SUCCESSION_FRONT = 3;
  /**
   * The landscape filters revisit every n-th row each tick besides the tiles
   * that just changed, so a lone tile is never left alone for long.
   */
  export const SUCCESSION_SWEEP_ROWS = 8;
  /**
   * Ticks between two recomputations of the climax targets in a running
   * game; stepping and the landscape filters run every tick. The climate
   * moves far slower than a hold of three or more ticks.
   */
  export const SUCCESSION_TARGET_INTERVAL = 2;
  /** Rounds of the mode filter on the targets. */
  export const SUCCESSION_MODE_PASSES = 2;

  /* ---------------------------------------------------------------- flora -- */

  /**
   * Plant groups. Plants are not individual populations like the animals:
   * each tile carries a bitmask of the groups growing there (`WorldState.flora`)
   * plus one continuous cover value (`vegetation`). Bit n is group n, so the
   * enum doubles as the bit index and must stay below 16.
   *
   * These are *stable identifiers* — a save stores the mask bits directly.
   * Append, never reorder.
   */
  export enum Flora {
    None = 0,
    MarineAlgae = 1,
    FreshwaterAlgae = 2,
    LandPlants = 3,
    Mosses = 4,
    Vascular = 5,
    Clubmosses = 6,
    Ferns = 7,
    FirstTrees = 8,
    SeedPlants = 9,
    Conifers = 10,
    Flowering = 11,
    Broadleaf = 12,
    Grasses = 13,
    Carnivorous = 14,
  }
  export const FLORA_COUNT = 15;

  /** Bit for one flora group in a tile mask. */
  export function floraBit(g: Flora): number {
    return 1 << g;
  }

  /** Where a plant group can grow at all. */
  export type FloraRealm = 'sea' | 'fresh' | 'land';

  export interface FloraDef {
    readonly id: string;
    readonly name: string;
    readonly realm: FloraRealm;
    /** Survivable mean temperature window, °C. */
    readonly temp: readonly [number, number];
    /**
     * Relative wetness (moisture over what the air could hold at that
     * temperature) where the group starts to grow and where it is at home.
     * Relative, so a cold tundra with little absolute water still reads as wet
     * for a moss, and a hot coast with plenty of water can still be too dry.
     */
    readonly wet: readonly [number, number];
    /**
     * How much the group depends on open water next door — a shore, a river
     * bank or a wetland. 1 means it cannot grow without it, 0 not at all.
     */
    readonly needsWater: number;
    /** Elevation (0..1) above which the group thins out. */
    readonly maxElevation: number;
    /** The densest cover the group sustains on its own, 0..1. */
    readonly stature: number;
    /** Forms woodland: lets a tile read as forest, taiga or rainforest. */
    readonly woody: boolean;
    /** Per-tick chance a tile hands the group to a suitable neighbour. */
    readonly spread: number;
    /** Long-range dispersal attempts per tick (spores, seeds, birds). */
    readonly jumps: number;
    /** Map colour of the group's cover on the Life/Flora map. */
    readonly color: Rgb;
  }

  /*
   * Envelopes are deliberately simple — a temperature window, a wetness ramp,
   * a dependence on water next door, an altitude ceiling — because the order
   * the planet greens in falls straight out of them: the first land plants
   * can only grow on wet shores, mosses where it stays damp, vascular plants
   * along rivers, and only seed plants, conifers and grasses reach the dry
   * interior. No special-case code anywhere decides that.
   */
  export const FLORA: Readonly<Record<Flora, FloraDef>> = {
    [Flora.None]: {
      id: 'none', name: 'Keine', realm: 'land', temp: [0, 0], wet: [1, 1], needsWater: 0,
      maxElevation: 0, stature: 0, woody: false, spread: 0, jumps: 0, color: [0, 0, 0],
    },
    [Flora.MarineAlgae]: {
      id: 'marineAlgae', name: 'Meeresalgen', realm: 'sea', temp: [-4, 34], wet: [0, 0],
      needsWater: 0, maxElevation: 0, stature: 0.8, woody: false, spread: 0.10, jumps: 2,
      color: [70, 150, 90],
    },
    [Flora.FreshwaterAlgae]: {
      id: 'freshwaterAlgae', name: 'Süßwasser-Grünalgen', realm: 'fresh', temp: [0, 38], wet: [0.55, 0.8],
      needsWater: 1, maxElevation: 0.6, stature: 0.14, woody: false, spread: 0.10, jumps: 2,
      color: [90, 190, 150],
    },
    [Flora.LandPlants]: {
      id: 'landPlants', name: 'Erste Landpflanzen', realm: 'land', temp: [0, 40], wet: [0.5, 0.8],
      needsWater: 1, maxElevation: 0.3, stature: 0.26, woody: false, spread: 0.08, jumps: 1,
      color: [120, 190, 90],
    },
    [Flora.Mosses]: {
      id: 'mosses', name: 'Moose', realm: 'land', temp: [-22, 32], wet: [0.5, 0.82],
      needsWater: 0.35, maxElevation: 0.9, stature: 0.36, woody: false, spread: 0.06, jumps: 2,
      color: [160, 196, 70],
    },
    [Flora.Vascular]: {
      id: 'vascular', name: 'Frühe Gefäßpflanzen', realm: 'land', temp: [0, 40], wet: [0.5, 0.78],
      needsWater: 0.6, maxElevation: 0.45, stature: 0.5, woody: false, spread: 0.06, jumps: 1,
      color: [96, 170, 80],
    },
    [Flora.Clubmosses]: {
      id: 'clubmosses', name: 'Bärlapppflanzen', realm: 'land', temp: [6, 40], wet: [0.66, 0.9],
      needsWater: 0.7, maxElevation: 0.25, stature: 0.86, woody: true, spread: 0.05, jumps: 1,
      color: [60, 130, 70],
    },
    [Flora.Ferns]: {
      id: 'ferns', name: 'Farne & Schachtelhalme', realm: 'land', temp: [2, 38], wet: [0.48, 0.78],
      needsWater: 0.15, maxElevation: 0.55, stature: 0.7, woody: false, spread: 0.05, jumps: 2,
      color: [80, 176, 110],
    },
    [Flora.FirstTrees]: {
      id: 'firstTrees', name: 'Urbäume', realm: 'land', temp: [4, 36], wet: [0.48, 0.74],
      needsWater: 0.1, maxElevation: 0.5, stature: 0.88, woody: true, spread: 0.035, jumps: 1,
      color: [50, 120, 70],
    },
    [Flora.SeedPlants]: {
      id: 'seedPlants', name: 'Samenpflanzen', realm: 'land', temp: [-2, 40], wet: [0.3, 0.6],
      needsWater: 0, maxElevation: 0.6, stature: 0.74, woody: true, spread: 0.045, jumps: 2,
      color: [110, 150, 60],
    },
    [Flora.Conifers]: {
      id: 'conifers', name: 'Nadelbäume', realm: 'land', temp: [-10, 34], wet: [0.28, 0.58],
      needsWater: 0, maxElevation: 0.72, stature: 0.9, woody: true, spread: 0.04, jumps: 2,
      color: [20, 100, 80],
    },
    [Flora.Flowering]: {
      id: 'flowering', name: 'Blütenpflanzen', realm: 'land', temp: [-6, 42], wet: [0.26, 0.6],
      needsWater: 0, maxElevation: 0.6, stature: 0.76, woody: false, spread: 0.06, jumps: 3,
      color: [210, 120, 170],
    },
    [Flora.Broadleaf]: {
      id: 'broadleaf', name: 'Laubbäume', realm: 'land', temp: [0, 40], wet: [0.42, 0.74],
      needsWater: 0, maxElevation: 0.5, stature: 1.0, woody: true, spread: 0.04, jumps: 2,
      color: [40, 150, 50],
    },
    [Flora.Grasses]: {
      id: 'grasses', name: 'Gräser', realm: 'land', temp: [-8, 42], wet: [0.16, 0.42],
      needsWater: 0, maxElevation: 0.6, stature: 0.62, woody: false, spread: 0.07, jumps: 3,
      color: [200, 200, 90],
    },
    [Flora.Carnivorous]: {
      id: 'carnivorous', name: 'Fleischfressende Pflanzen', realm: 'land', temp: [0, 36], wet: [0.72, 0.95],
      needsWater: 0.8, maxElevation: 0.4, stature: 0.34, woody: false, spread: 0.04, jumps: 1,
      color: [200, 80, 80],
    },
  };

  /** Every flora bit that is a land plant. */
  export const LAND_FLORA_MASK = (() => {
    let m = 0;
    for (let g = 1; g < FLORA_COUNT; g++) if (FLORA[g as Flora].realm === 'land') m |= 1 << g;
    return m;
  })();

  /** Every vascular land plant — the "real" vegetation larger animals eat. */
  export const VASCULAR_FLORA_MASK = LAND_FLORA_MASK &
    ~(floraBit(Flora.LandPlants) | floraBit(Flora.Mosses));

  /* ----------------------------------------------------------------- life -- */

  /**
   * Animal (and microbial) classes, each a population per tile.
   *
   * Indices are stable identifiers within a save format. Version 5 saves name
   * them by `LifeDef.id`, so this order may change again later; version 4
   * saves used the original numbers and `SaveSystem` maps them explicitly.
   * Slots 8 and 15 changed meaning in this rework (Trichordate and Carnifern
   * were replaced by real lineages); the migration handles both.
   */
  export enum Life {
    None = 0,
    Prokaryote = 1,
    Eukaryote = 2,
    Radiate = 3,
    Arthropod = 4,
    Mollusc = 5,
    Fish = 6,
    Cetacean = 7,
    LandArthropod = 8,
    Insect = 9,
    Amphibian = 10,
    Reptile = 11,
    Dinosaur = 12,
    Avian = 13,
    Mammal = 14,
    Bilateria = 15,
    Pollinator = 16,
    Grazer = 17,
  }
  export const LIFE_COUNT = 18;

  /**
   * Exactly one suitability per Biome, in enum order. The tuple length is the
   * guard: a row left too short reads back `undefined`, becomes NaN in the
   * Float32 suitability cache and quietly poisons every density it touches.
   */
  export type BiomeSuit = readonly [
    number, number, number, number, number, number,
    number, number, number, number, number,
  ];

  /**
   * What a class eats. The carrying capacity of a tile is multiplied by this,
   * and the evolution tree's food conditions are checked against the same
   * table, so what the tree promises and what the simulation does cannot drift.
   *
   *   plankton  share of the ambient marine plankton base the class lives on
   *   algae     weight of the marine algae growing on the tile
   *   plants    [flora mask, weight] pairs: cover of those groups on the tile
   *   prey      classes eaten, weighted by their density on the same tile
   */
  export interface Diet {
    readonly selfFeeding?: boolean;
    readonly plankton?: number;
    readonly algae?: number;
    readonly plants?: readonly (readonly [number, number])[];
    readonly prey?: readonly Life[];
    readonly preyWeight?: number;
  }

  export interface LifeDef {
    /** Stable string id, shared with the evolution node of the same name. */
    readonly id: string;
    readonly name: string;
    readonly realm: 'sea' | 'land';
    readonly color: Rgb;
    /** Survivable temperature window, degrees Celsius. */
    readonly temp: readonly [number, number];
    /** Minimum atmospheric oxygen, percent; full capacity three points above. */
    readonly o2Min: number;
    /** How many tiles of open water this class can be carried across. */
    readonly raft: number;
    /** How well the class does in each biome. */
    readonly suit: BiomeSuit;
    readonly diet: Diet;
    /** Can this class become sentient and found cities? */
    readonly sentient: boolean;
    /** Ω cost to place this class with the Place Life tool. */
    readonly cost: number;
  }

  const ANY_LAND_PLANT = LAND_FLORA_MASK;
  const SEED_FOOD = floraBit(Flora.SeedPlants) | floraBit(Flora.Conifers) |
    floraBit(Flora.Flowering) | floraBit(Flora.Broadleaf) | floraBit(Flora.Grasses);
  const FLOWERS = floraBit(Flora.Flowering) | floraBit(Flora.Broadleaf) | floraBit(Flora.Carnivorous);
  const BIG_PLANTS = floraBit(Flora.Ferns) | floraBit(Flora.Clubmosses) |
    floraBit(Flora.SeedPlants) | floraBit(Flora.Conifers) |
    floraBit(Flora.Flowering) | floraBit(Flora.Broadleaf);

  /*
   * Suitability columns:  Cst   Ocn  Rock  Arct  Bore  Dsrt  Offn  Wald  Rgnw  Sumpf Tund
   *
   * Every class needs at least one biome it clearly leads, or the competitive
   * edge decides everything and the planet homogenises. Sea classes score
   * zero on land and vice versa; Arctic covers sea ice and polar land both.
   */
  export const LIFE: Readonly<Record<Life, LifeDef>> = {
    [Life.None]: {
      id: 'none', name: 'Keine', realm: 'sea', color: EGA.black, temp: [0, 0], o2Min: 0, raft: 0,
      suit: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], diet: {}, sentient: false, cost: 0,
    },

    /* ---- sea ---- */
    [Life.Prokaryote]: {
      id: 'cells', name: 'Erste Zellen', realm: 'sea', color: [92, 207, 208], temp: [-20, 95], o2Min: 0, raft: 0,
      suit: [1.00, 0.80, 0, 0.25, 0, 0, 0, 0, 0, 0, 0], diet: { selfFeeding: true },
      sentient: false, cost: 50,
    },
    [Life.Eukaryote]: {
      id: 'eukaryotes', name: 'Komplexe Zellen', realm: 'sea', color: [170, 110, 220], temp: [-12, 60], o2Min: 0.5, raft: 0,
      suit: [1.00, 0.75, 0, 0.20, 0, 0, 0, 0, 0, 0, 0], diet: { selfFeeding: true },
      sentient: false, cost: 80,
    },
    [Life.Radiate]: {
      // Sponges, jellies and coral: filter feeders tied to sunlit shallows.
      id: 'earlyAnimals', name: 'Schwämme & Nesseltiere', realm: 'sea', color: [220, 130, 200], temp: [-4, 42], o2Min: 3, raft: 0,
      suit: [1.00, 0.45, 0, 0.10, 0, 0, 0, 0, 0, 0, 0], diet: { plankton: 1 },
      sentient: false, cost: 120,
    },
    [Life.Bilateria]: {
      // Worms in the sediment: the first animals with a front and a back.
      id: 'bilaterians', name: 'Frühe Zweiseitentiere', realm: 'sea', color: [230, 150, 120], temp: [-4, 40], o2Min: 4, raft: 0,
      suit: [1.00, 0.35, 0, 0.10, 0, 0, 0, 0, 0, 0, 0], diet: { plankton: 0.6, algae: 0.8 },
      sentient: false, cost: 150,
    },
    [Life.Arthropod]: {
      // Bottom-walkers. Almost nothing for them once the shelf drops away.
      id: 'arthropods', name: 'Gliederfüßer des Meeres', realm: 'sea', color: [210, 140, 60], temp: [-4, 40], o2Min: 5, raft: 0,
      suit: [1.00, 0.30, 0, 0.10, 0, 0, 0, 0, 0, 0, 0],
      diet: { plankton: 0.45, algae: 0.9, prey: [Life.Bilateria], preyWeight: 1.5 },
      sentient: false, cost: 200,
    },
    [Life.Mollusc]: {
      // Snails rasp algae off the rocks; cephalopods came later.
      id: 'molluscs', name: 'Weichtiere', realm: 'sea', color: [200, 100, 140], temp: [-3, 38], o2Min: 7, raft: 0,
      suit: [0.95, 0.55, 0, 0.10, 0, 0, 0, 0, 0, 0, 0], diet: { plankton: 0.25, algae: 1.4 },
      sentient: true, cost: 250,
    },
    [Life.Fish]: {
      // Strong in the shallows as well as offshore: every land vertebrate
      // descends from this row, and a descendant can only cross realms from a
      // tile that actually touches land.
      id: 'fish', name: 'Fische', realm: 'sea', color: [90, 170, 230], temp: [-3, 36], o2Min: 9, raft: 0,
      suit: [0.90, 1.00, 0, 0.15, 0, 0, 0, 0, 0, 0, 0],
      diet: { plankton: 0.35, prey: [Life.Arthropod, Life.Mollusc, Life.Bilateria], preyWeight: 2.0 },
      sentient: false, cost: 300,
    },
    [Life.Cetacean]: {
      id: 'whales', name: 'Wale', realm: 'sea', color: [60, 130, 200], temp: [-3, 32], o2Min: 12.5, raft: 0,
      suit: [0.30, 1.00, 0, 0.35, 0, 0, 0, 0, 0, 0, 0],
      diet: { plankton: 0.3, prey: [Life.Fish, Life.Arthropod], preyWeight: 2.0 },
      sentient: true, cost: 350,
    },

    /* ---- land ---- */
    [Life.LandArthropod]: {
      // Millipedes and arachnids: the first animals ashore, living in the
      // damp litter under the first plants. Bare highland is no home to them.
      id: 'landArthropods', name: 'Landgliederfüßer', realm: 'land', color: [180, 150, 110], temp: [-6, 42], o2Min: 8, raft: 6,
      suit: [0, 0, 0.30, 0.02, 0.60, 0.30, 0.70, 0.75, 0.80, 0.90, 0.55],
      diet: { plants: [[ANY_LAND_PLANT, 1.0]] },
      sentient: false, cost: 350,
    },
    [Life.Insect]: {
      id: 'insects', name: 'Insekten', realm: 'land', color: [200, 170, 50], temp: [-6, 45], o2Min: 10, raft: 14,
      suit: [0, 0, 0.15, 0.02, 0.55, 0.50, 0.80, 1.00, 0.90, 0.80, 0.40],
      diet: { plants: [[VASCULAR_FLORA_MASK, 1.0], [ANY_LAND_PLANT, 0.35]] },
      sentient: true, cost: 400,
    },
    [Life.Pollinator]: {
      // Bees and butterflies: wholly dependent on flowers for pollen and nectar.
      id: 'pollinators', name: 'Bienen & Bestäuber', realm: 'land', color: [250, 200, 60], temp: [-2, 42], o2Min: 12, raft: 14,
      suit: [0, 0, 0.10, 0, 0.45, 0.40, 1.00, 0.85, 0.80, 0.55, 0.35],
      diet: { plants: [[FLOWERS, 1.0]] },
      sentient: false, cost: 450,
    },
    [Life.Amphibian]: {
      // Wetland specialist; eats the invertebrates of the bank.
      id: 'amphibians', name: 'Amphibien', realm: 'land', color: [110, 190, 90], temp: [0, 40], o2Min: 11, raft: 0,
      suit: [0, 0, 0.05, 0.00, 0.35, 0.05, 0.45, 0.65, 0.85, 1.00, 0.20],
      diet: { prey: [Life.Insect, Life.LandArthropod], preyWeight: 2.6 },
      sentient: false, cost: 500,
    },
    [Life.Reptile]: {
      // The desert is theirs outright — nothing else tolerates it.
      id: 'reptiles', name: 'Reptilien', realm: 'land', color: [150, 180, 70], temp: [2, 48], o2Min: 12, raft: 10,
      suit: [0, 0, 0.25, 0.00, 0.25, 1.00, 0.85, 0.70, 0.90, 0.60, 0.05],
      diet: {
        prey: [Life.Insect, Life.LandArthropod, Life.Pollinator], preyWeight: 2.0,
        plants: [[floraBit(Flora.SeedPlants) | floraBit(Flora.Conifers) | floraBit(Flora.Ferns) | floraBit(Flora.Flowering), 0.5]],
      },
      sentient: true, cost: 550,
    },
    [Life.Dinosaur]: {
      // Herds on the open plain and in the fern forests.
      id: 'dinosaurs', name: 'Dinosaurier', realm: 'land', color: [130, 150, 60], temp: [6, 44], o2Min: 13, raft: 4,
      suit: [0, 0, 0.10, 0.00, 0.35, 0.45, 1.00, 0.85, 0.85, 0.65, 0.05],
      diet: {
        plants: [[BIG_PLANTS, 1.0]],
        prey: [Life.Reptile, Life.Amphibian, Life.Mammal, Life.Grazer], preyWeight: 1.0,
      },
      sentient: true, cost: 600,
    },
    [Life.Avian]: {
      // Seabirds own the polar shore; elsewhere strong without ruling anywhere.
      id: 'birds', name: 'Vögel', realm: 'land', color: [230, 190, 120], temp: [-25, 42], o2Min: 14, raft: 20,
      suit: [0, 0, 0.30, 0.60, 0.60, 0.40, 0.80, 0.80, 0.80, 0.65, 0.55],
      diet: {
        prey: [Life.Insect, Life.Pollinator, Life.LandArthropod], preyWeight: 2.0,
        plants: [[SEED_FOOD, 0.6]],
      },
      sentient: true, cost: 650,
    },
    [Life.Mammal]: {
      // Fur and warm blood: the only class that makes a real living on the ice.
      id: 'mammals', name: 'Säugetiere', realm: 'land', color: [210, 120, 90], temp: [-35, 44], o2Min: 14, raft: 8,
      suit: [0, 0, 0.25, 0.35, 0.95, 0.40, 0.80, 0.80, 0.65, 0.60, 0.70],
      diet: {
        prey: [Life.Insect, Life.LandArthropod], preyWeight: 1.5,
        plants: [[SEED_FOOD, 0.8]],
      },
      sentient: true, cost: 700,
    },
    [Life.Grazer]: {
      // Hoofed grazers: the open grasslands are what made them.
      id: 'grazers', name: 'Huftiere & Weidetiere', realm: 'land', color: [190, 140, 80], temp: [-20, 42], o2Min: 14, raft: 4,
      suit: [0, 0, 0.10, 0.05, 0.40, 0.45, 1.00, 0.55, 0.40, 0.35, 0.55],
      diet: { plants: [[floraBit(Flora.Grasses), 1.2], [floraBit(Flora.Flowering), 0.3]] },
      sentient: false, cost: 700,
    },
  };

  /* ----------------------------------------------------------- subspecies -- */

  /**
   * Every class runs through eight sub-species, oldest first — a lineage
   * settling in and diversifying over time. Names, dates and pictures live
   * in src/species/; the simulation only counts the stage index.
   */
  export const SUBSPECIES_PER_CLASS = 8;

  /** Largest share of a class that may stand at or above each stage. */
  export const STAGE_MAX_SHARE: readonly number[] = [1.0, 0.8, 0.62, 0.48, 0.36, 0.27, 0.2, 0.14];

  /** True for the marine classes. */
  export function isSeaLife(c: Life): boolean {
    return c !== Life.None && LIFE[c].realm === 'sea';
  }
  /** True for the terrestrial classes. */
  export function isLandLife(c: Life): boolean {
    return c !== Life.None && LIFE[c].realm === 'land';
  }

  /* --------------------------------------------------------- civilization -- */

  export enum Tech {
    None = 0,
    Stone = 1,
    Bronze = 2,
    Iron = 3,
    Industrial = 4,
    Atomic = 5,
    Information = 6,
    Nanotech = 7,
  }
  export const TECH_COUNT = 8;

  export const TECH_NAMES: readonly string[] = [
    'Keine', 'Steinzeit', 'Bronzezeit', 'Eisenzeit', 'Industriezeitalter',
    'Atomzeitalter', 'Informationszeitalter', 'Nanotech-Zeitalter',
  ];

  /** Ω cost of placing a city at each technology level. */
  export const TECH_COST: readonly number[] = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500];

  export const TECH_COLORS: readonly Rgb[] = [
    EGA.black, [120, 60, 40], [160, 100, 40], [190, 140, 60],
    [200, 60, 60], [230, 120, 60], [255, 200, 80], EGA.white,
  ];

  /** Energy demand per city at each tech level. */
  export const TECH_ENERGY: readonly number[] = [0, 0.1, 0.2, 0.4, 1.0, 1.6, 2.2, 3.0];

  /* ----------------------------------------------------------- time scale -- */

  export enum TimeScale {
    Geologic = 0,
    Evolution = 1,
    Civilized = 2,
    Technology = 3,
  }

  export const TIMESCALE_NAMES: readonly string[] = [
    'Geologie', 'Evolution', 'Zivilisation', 'Technologie',
  ];

  /** Simulated years advanced by one tick in each time scale. */
  export const YEARS_PER_TICK: readonly number[] = [500000, 10000, 100, 10];

  /* --------------------------------------------------------------- events -- */

  export enum EventKind {
    Hurricane = 0,
    TidalWave = 1,
    Meteor = 2,
    Volcano = 3,
    AtomicBomb = 4,
    Fire = 5,
    Earthquake = 6,
    Plague = 7,
  }
  export const EVENT_COUNT = 8;

  export const EVENT_NAMES: readonly string[] = [
    'Wirbelsturm', 'Flutwelle', 'Meteorit', 'Vulkanausbruch',
    'Atomschlag', 'Flächenbrand', 'Erdbeben', 'Seuche',
  ];

  /** File stem under assets/events/ for each disaster. */
  export const EVENT_ICONS: readonly string[] = [
    'hurricane', 'tidal-wave', 'meteor', 'volcano',
    'atomic-bomb', 'fire', 'earthquake', 'plague',
  ];

  /** What each disaster does, for the event palette. */
  export const EVENT_HINTS: readonly string[] = [
    'Durchnässt ein großes Gebiet und schädigt Leben im Zentrum.',
    'Überspült flache Küsten, schädigt Leben und Städte am Ufer.',
    'Krater, Staub in der Atmosphäre, schwere Schäden im Umkreis.',
    'Hebt Gelände an, setzt CO₂ und Staub frei, zerstört Leben am Krater.',
    'Vernichtet Städte und Leben im Umkreis, Staub verdunkelt den Himmel.',
    'Verbrennt Wälder und Vegetation; Pflanzen wachsen danach nach.',
    'Verschiebt Gelände leicht und beschädigt Städte.',
    'Trifft dichte Bevölkerungen und schwächt Tierbestände.',
  ];

  /** Every disaster costs the same 50 Ω in the original. */
  export const EVENT_COST = 50;

  /* ---------------------------------------------------------------- tools -- */

  export enum Tool {
    Examine = 0,
    Move = 1,
    SetAltitude = 2,
    PlantBiome = 3,
    PlaceLife = 4,
    TriggerEvent = 5,
  }

  export const TOOL_NAMES: readonly string[] = [
    'Untersuchen', 'Verschieben', 'Höhe ändern', 'Pflanzen', 'Leben ansiedeln', 'Ereignis auslösen',
  ];
  export const TOOL_ICONS: readonly string[] = [
    'tool-examine', 'tool-move', 'tool-altitude', 'tool-plant', 'tool-life', 'tool-event',
  ];
  export const TOOL_HINTS: readonly string[] = [
    'Tippe auf ein Feld, um Lebensraum, Arten und Klima zu sehen.',
    'Ziehe die Karte. Mausrad oder zwei Finger zoomen.',
    'Hebt oder senkt das Gelände in einem 5 × 5-Feld.',
    'Siedelt eine entwickelte Pflanzengruppe in einem 5 × 5-Feld an, wo sie wachsen kann.',
    'Siedelt eine entwickelte Tiergruppe, eine Stadt oder einen Terraformer an.',
    'Löst eine Naturkatastrophe am gewählten Ort aus.',
  ];

  export const EXAMINE_COST = 5;
  export const ALTITUDE_COST = 50;
  export const BIOME_COST = 50;
  /** Opening any of the four model control panels costs this much. */
  export const MODEL_PANEL_COST = 100;

  /** Terraforming devices, placed through the Place Life tool. */
  export enum Terraformer {
    OxygenGenerator = 0,
    CO2Generator = 1,
    VaporGenerator = 2,
    Monolith = 3,
  }
  export const TERRAFORMER_NAMES: readonly string[] = [
    'Sauerstoff-Generator', 'CO₂-Generator', 'Wasserdampf-Generator', 'Monolith',
  ];
  export const TERRAFORMER_ICONS: readonly string[] = [
    'terra-oxygen', 'terra-co2', 'terra-vapor', 'terra-monolith',
  ];
  export const TERRAFORMER_HINTS: readonly string[] = [
    '+1,5 % Sauerstoff in der Atmosphäre.',
    '+120 ppm CO₂ – wärmt den Planeten.',
    'Mehr Luftfeuchte und ein feuchteres 5 × 5-Feld.',
    'Erweckt die örtliche Art zur Intelligenz (nur an Land).',
  ];
  export const TERRAFORMER_COST: readonly number[] = [500, 500, 500, 2500];

  /* ------------------------------------------------------------- map modes -- */

  /** The twelve Map Window modes, in their five control-panel groups. */
  export enum MapMode {
    Terrain = 0,
    Events = 1,
    Drift = 2,
    Oceans = 3,
    OceanTemp = 4,
    OceanCurrents = 5,
    AirTemp = 6,
    Rainfall = 7,
    AirCurrents = 8,
    Biomes = 9,
    LifeMap = 10,
    Technology = 11,
  }

  export interface MapModeDef {
    readonly name: string;
    readonly group: string;
    readonly icon: string;
  }

  export const MAP_MODES: readonly MapModeDef[] = [
    { name: 'Gelände', group: 'Geosphäre', icon: 'map-terrain' },
    { name: 'Ereignisse', group: 'Geosphäre', icon: 'layer-events' },
    { name: 'Kontinentaldrift', group: 'Geosphäre', icon: 'map-drift' },
    { name: 'Meeresboden', group: 'Hydrosphäre', icon: 'layer-oceans' },
    { name: 'Meerestemperatur', group: 'Hydrosphäre', icon: 'overlay-seaheat' },
    { name: 'Meeresströmungen', group: 'Hydrosphäre', icon: 'overlay-seaflow' },
    { name: 'Lufttemperatur', group: 'Atmosphäre', icon: 'overlay-heat' },
    { name: 'Niederschlag', group: 'Atmosphäre', icon: 'overlay-rain' },
    { name: 'Winde', group: 'Atmosphäre', icon: 'overlay-wind' },
    { name: 'Lebensräume', group: 'Biosphäre', icon: 'layer-biomes' },
    { name: 'Leben', group: 'Biosphäre', icon: 'layer-life' },
    { name: 'Technologie', group: 'Zivilisation', icon: 'layer-cities' },
  ];

  /** The five groups labelled along the Map Window control panel. */
  export const MAP_GROUPS: readonly string[] = [
    'Geosphäre', 'Hydrosphäre', 'Atmosphäre', 'Biosphäre', 'Zivilisation',
  ];

  /* ------------------------------------------- edit window display layers -- */

  /** Additive layers — any combination may be switched on at once. */
  export const DATA_LAYERS: readonly string[] = [
    'Ozeane', 'Lebensräume', 'Städte', 'Leben', 'Ereignisse', 'Wolken',
  ];
  export const DATA_LAYER_ICONS: readonly string[] = [
    'layer-oceans', 'layer-biomes', 'layer-cities', 'layer-life', 'layer-events', 'layer-clouds',
  ];

  /** Mutually exclusive climate overlays; only one may be active. */
  export enum Overlay {
    None = -1,
    Heat = 0,
    Rainfall = 1,
    Winds = 2,
    SeaFlow = 3,
    SeaHeat = 4,
    Magma = 5,
  }
  export const OVERLAY_NAMES: readonly string[] = [
    'Wärme', 'Niederschlag', 'Winde', 'Meeresströmung', 'Meereswärme', 'Magma',
  ];
  export const OVERLAY_ICONS: readonly string[] = [
    'overlay-heat', 'overlay-rain', 'overlay-wind', 'overlay-seaflow', 'overlay-seaheat', 'overlay-magma',
  ];

  /* -------------------------------------------------------------- economy -- */

  export const OMEGA_MAX = 5000;
  export const OMEGA_START = 1500;
  /** Ω regenerated per tick, so a paused planet earns nothing. */
  export const OMEGA_REGEN = 1.6;

  /** Evolution points never pile up beyond this. */
  export const EP_MAX = 999;
}
