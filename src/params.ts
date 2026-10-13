/* =============================================================================
 * SimEarth 2.0 — model parameters
 * -----------------------------------------------------------------------------
 * Every slider on the four Model Control Panels writes into this object, and
 * every simulation system reads its tuning from here rather than from a hard
 * constant. Each slider runs 0..1 with 0.5 as the calibrated default, so
 * `mul(0.5) === 1` leaves the balance exactly where it was tuned.
 * ========================================================================== */

namespace SE {
  /** Convert a 0..1 slider position into a 0..2 multiplier centred on 1. */
  export function mul(v: number): number {
    return v * 2;
  }

  /* ------------------------------------------- calibrated base constants -- */
  /* These are the values the climate was tuned to; the sliders scale them.   */

  /** Peak solar energy term (equator, zero albedo), in degrees of forcing. */
  export const SOLAR_INPUT_BASE = 90;
  /** Baseline radiative loss to space. */
  export const RADIATIVE_OFFSET = 59;
  /** Greenhouse forcing per doubling of CO2 above the reference. */
  export const GH_CO2 = 9;
  /** Greenhouse forcing at full water-vapour saturation. */
  export const GH_VAPOR = 11;
  /** Pressure broadening per percentage point of N2 off baseline. */
  export const GH_N2 = 0.02;
  /** CO2 reference concentration (ppm) for the logarithmic forcing curve. */
  export const CO2_REF = 280;

  export const OCEAN_INERTIA = 0.05;
  export const LAND_INERTIA = 0.22;
  /** Lateral heat exchange with neighbours (winds and currents, lumped). */
  export const TEMP_DIFFUSION_BASE = 0.17;
  /**
   * How many lateral mixing passes the temperature field takes per tick.
   *
   * Diffusion per pass is a fraction of the gap to the four *neighbours*, so it
   * smooths a fixed number of tiles, not a fixed distance. Halving the tile size
   * therefore halves how far heat spreads, which steepens the pole-to-equator
   * gradient. Two passes restore the reach; raising the coefficient instead
   * would have to go past the 0.24 clamp and makes the explicit scheme ring.
   */
  export const TEMP_DIFFUSION_PASSES = 2;
  /** How fast moisture chases its advected target. */
  export const MOISTURE_RATE = 0.25;
  /**
   * Fraction of upwind moisture that survives one step over land — the single
   * knob controlling how far inland rain reaches, and so how much of the planet
   * is desert. Under the capacity-ceiling model in `ClimateSystem` the decay is
   * exactly this per tile, giving an e-folding length of 1/(1-t) tiles: 12.5 at
   * 0.92, or roughly a third of the way across a typical continent.
   *
   * Measured over three planets at 256x128 after 600 ticks, as a share of land:
   *
   *   t      arid (<0.16)   mid       wet (>=0.5)
   *   0.84    29-38%        49-58%    11-15%
   *   0.87    20-27%        54-63%    15-19%
   *   0.90    10-15%        61-66%    20-24%     <- Earth-like
   *   0.92     4-7%         65-67%    26-30%     <- barely a desert anywhere
   *
   * Earth is about a quarter arid, and a planet wants a little less than that
   * so the player has somewhere to fix. Note the figure sits lower than a bare
   * decay length would suggest because the mountain ranges wring rain out on
   * their windward flanks — this was calibrated with the orogeny in place.
   *
   * It also cannot be read against the old 0.95: before the ceiling fix the
   * humidity gates multiplied in on every step as well, costing ~18% a tile on
   * top of this, which made the value almost irrelevant.
   */
  export const MOISTURE_TRANSMISSION = 0.90;

  /**
   * Base plate speed in tiles per tick. Tiles, so it doubled with the grid:
   * a plate crosses the planet in the same time, not in the same tile count.
   */
  export const DRIFT_SPEED_BASE = 1 / 450;
  /** Number of independent horizontal plates. */
  export const PLATE_COUNT = 4;
  /** Per-tick relaxation of land toward the local mean elevation. */
  export const EROSION_RATE_BASE = 0.0003;
  /**
   * Per-tick tectonic uplift along the orogenic belts, as a fraction of
   * `WorldState.uplift`.
   *
   * Without it erosion is the only vertical process, and it runs one way: a
   * planet planes its ranges down over geological time and the rivers lose
   * their headwaters with them. Real mountains instead sit where uplift and
   * erosion cancel, and this is that balance point — measured, because erosion
   * here is a curvature relaxation and its strength at a crest is not something
   * you can read off the constant.
   *
   * Over 12,000 ticks on a seeded planet, land above the tree line and land
   * above the snow line:
   *
   *   rate     mountain        peak
   *   0        20.3 -> 19.0%   3.7 -> 2.6%    ranges wearing away
   *   3e-5     20.3 -> 20.1%   3.7 -> 3.6%    <- balanced
   *   6e-5     20.3 -> 21.8%   3.7 -> 5.2%
   *   1e-4     20.3 -> 22.6%   3.7 -> 6.4%
   *   4e-4     20.3 -> 28.1%   3.7 -> 12.8%   the whole map turning to alps
   */
  export const UPLIFT_RATE_BASE = 3e-5;

  /* ------------------------------------------------------ grid calibration -- */

  /**
   * The grid a handful of absolute figures elsewhere were calibrated against.
   *
   * Most of the model is expressed per tile or as a share of the planet and so
   * does not care how finely the world is cut up. A few quantities are counts —
   * total industrial energy demand, how many nuclear powers it takes to start a
   * war — and those quietly scale with the grid: the same civilization on a
   * finer map is simply counted more times.
   *
   * Going from 128x64 to 256x128 therefore quadrupled industrial output for an
   * unchanged planet. Measured before this existed: soot drove atmospheric dust
   * to 0.67, blocking three quarters of the sunlight, and every long game ended
   * in a permanent industrial winter at -7C with the biosphere wiped out.
   */
  export const REFERENCE_TILE_COUNT = 8192;

  /** How many tiles the current grid uses for one tile of the reference grid. */
  export const GRID_REFINEMENT = TILE_COUNT / REFERENCE_TILE_COUNT;

  /**
   * Restate a count calibrated on the reference grid so it still means the same
   * share of the planet here.
   */
  export function scaledCount(referenceCount: number): number {
    return referenceCount * GRID_REFINEMENT;
  }

  /* -------------------------------------------------- atmospheric chemistry -- */

  /**
   * How many "chemistry steps" the atmosphere takes per simulation tick.
   *
   * Every rate below, and the biosphere's gas exchange, was calibrated when the
   * loop ran ~33 ticks a second. At the current 2.5 the oxygen curve took half
   * an hour of wall clock to reach the 17% that mammals need, which reads as
   * "nothing ever evolves". Sources and sinks all carry this factor, so every
   * equilibrium is untouched and only the time to reach one shortens.
   *
   * This deliberately does NOT extend to the temperature and moisture
   * relaxations above: those are per-tick approach rates, and scaling them past
   * 1 makes the integrator overshoot and ring instead of converging.
   */
  export const CHEM_RATE = 8;

  /** CO2 (ppm) added per tick by background volcanism. */
  export const VOLCANIC_CO2 = 0.45 * CHEM_RATE;
  /** Fraction of suspended dust that settles out each tick. */
  export const DUST_SETTLING = 0.004;
  /** Free oxygen lost to surface oxidation each tick. */
  export const OXIDATION = 0.00024 * CHEM_RATE;
  /** Silicate weathering: warm, wet, rocky worlds scrub CO2. */
  export const WEATHERING = 0.0012 * CHEM_RATE;

  /* ------------------------------------------------------------ interfaces -- */

  export interface GeoParams {
    drift: number;
    coreHeat: number;
    volcanoes: number;
    erosion: number;
    meteors: number;
    axialTilt: number;
  }

  export interface AtmoParams {
    solarInput: number;
    greenhouse: number;
    cloudAlbedo: number;
    surfaceAlbedo: number;
    thermalTransfer: number;
    rainfall: number;
  }

  export interface BioParams {
    evolutionRate: number;
    mutationRate: number;
    reproductionRate: number;
    tolerance: number;
    co2Absorption: number;
  }

  /** Where a civilization's energy comes from. These are shares, not levels. */
  export interface CivEnergyParams {
    solarWind: number;
    hydroGeo: number;
    fossilFuel: number;
    nuclear: number;
  }

  /** What a civilization spends its energy on. */
  export interface CivAllocParams {
    agriculture: number;
    medicine: number;
    artMedia: number;
    science: number;
    philosophy: number;
    military: number;
  }

  export interface SliderDef<K> {
    readonly key: K;
    readonly label: string;
    /** One line on what the slider does in this simulation. */
    readonly hint: string;
  }

  export const GEO_SLIDERS: readonly SliderDef<keyof GeoParams>[] = [
    { key: 'drift', label: 'Kontinentaldrift', hint: 'Wie schnell sich die Platten verschieben.' },
    { key: 'coreHeat', label: 'Kernwärme', hint: 'Hebung der Gebirge und Magma-Aktivität.' },
    { key: 'volcanoes', label: 'Vulkanismus', hint: 'Häufigkeit von Ausbrüchen und vulkanisches CO₂.' },
    { key: 'erosion', label: 'Erosion', hint: 'Wie schnell Wasser das Gelände abträgt.' },
    { key: 'meteors', label: 'Meteoriten', hint: 'Häufigkeit von Einschlägen.' },
    { key: 'axialTilt', label: 'Achsneigung', hint: 'Verteilt Sonnenlicht gleichmäßiger auf Pole und Äquator.' },
  ];

  export const ATMO_SLIDERS: readonly SliderDef<keyof AtmoParams>[] = [
    { key: 'solarInput', label: 'Sonneneinstrahlung', hint: 'Energie, die der Planet von seiner Sonne erhält.' },
    { key: 'greenhouse', label: 'Treibhauseffekt', hint: 'Wie stark CO₂ und Wasserdampf Wärme halten.' },
    { key: 'cloudAlbedo', label: 'Wolken-Rückstrahlung', hint: 'Wie viel Sonnenlicht Wolken ins All zurückwerfen.' },
    { key: 'surfaceAlbedo', label: 'Boden-Rückstrahlung', hint: 'Wie hell Eis, Wüsten und Wälder reflektieren.' },
    { key: 'thermalTransfer', label: 'Wärmeaustausch Luft/Meer', hint: 'Wie stark Winde und Strömungen Wärme verteilen.' },
    { key: 'rainfall', label: 'Niederschlag', hint: 'Wie weit Regen ins Landesinnere reicht.' },
  ];

  export const BIO_SLIDERS: readonly SliderDef<keyof BioParams>[] = [
    { key: 'evolutionRate', label: 'Evolutionstempo', hint: 'Wie schnell Evolutionspunkte entstehen.' },
    { key: 'mutationRate', label: 'Mutationsrate', hint: 'Wie schnell neue Unterarten (Varianten einer Gruppe) auftreten.' },
    { key: 'reproductionRate', label: 'Vermehrung', hint: 'Wachstum von Pflanzendecke und Tierbeständen.' },
    { key: 'tolerance', label: 'Toleranz', hint: 'Wie breit die Temperaturbereiche aller Arten sind.' },
    { key: 'co2Absorption', label: 'CO₂-Aufnahme', hint: 'Wie viel CO₂ die Photosynthese bindet.' },
  ];

  export const CIV_ENERGY_SLIDERS: readonly SliderDef<keyof CivEnergyParams>[] = [
    { key: 'solarWind', label: 'Sonne / Wind', hint: 'Saubere Energie ohne Emissionen.' },
    { key: 'hydroGeo', label: 'Wasser / Erdwärme', hint: 'Saubere Energie ohne Emissionen.' },
    { key: 'fossilFuel', label: 'Fossile Brennstoffe', hint: 'Setzt CO₂ und etwas Ruß frei, wärmt den Planeten.' },
    { key: 'nuclear', label: 'Kernkraft', hint: 'Emissionsfrei; Anteil am Energiemix.' },
  ];

  export const CIV_ALLOC_SLIDERS: readonly SliderDef<keyof CivAllocParams>[] = [
    { key: 'agriculture', label: 'Landwirtschaft', hint: 'Wie viele Menschen ein Standort ernährt.' },
    { key: 'medicine', label: 'Medizin', hint: 'Bevölkerungswachstum und Schutz vor Seuchen.' },
    { key: 'artMedia', label: 'Kunst / Medien', hint: 'Fördert das Städtewachstum leicht und dämpft Konflikte.' },
    { key: 'science', label: 'Wissenschaft', hint: 'Tempo des technischen Fortschritts.' },
    { key: 'philosophy', label: 'Philosophie', hint: 'Dämpft die Kriegsgefahr deutlich.' },
    { key: 'military', label: 'Militär', hint: 'Erhöht die Gefahr eines Atomkriegs.' },
  ];

  /* ----------------------------------------------------------------- state -- */

  /** The live parameter set. Reset alongside the world. */
  export class ModelParams {
    readonly geo: GeoParams = {
      drift: 0.5, coreHeat: 0.5, volcanoes: 0.5,
      erosion: 0.5, meteors: 0.5, axialTilt: 0.5,
    };

    readonly atmo: AtmoParams = {
      solarInput: 0.5, greenhouse: 0.5, cloudAlbedo: 0.5,
      surfaceAlbedo: 0.5, thermalTransfer: 0.5, rainfall: 0.5,
    };

    readonly bio: BioParams = {
      evolutionRate: 0.5, mutationRate: 0.5, reproductionRate: 0.5,
      tolerance: 0.5, co2Absorption: 0.5,
    };

    // Fossil fuel dominates at the start, which is exactly why an industrial
    // civilization warms its own planet until the player intervenes.
    readonly civEnergy: CivEnergyParams = {
      solarWind: 0.1, hydroGeo: 0.2, fossilFuel: 0.6, nuclear: 0.1,
    };

    readonly civAlloc: CivAllocParams = {
      agriculture: 0.5, medicine: 0.5, artMedia: 0.4,
      science: 0.5, philosophy: 0.3, military: 0.3,
    };

    /**
     * Restore the calibrated defaults *in place*. The slider panels hold
     * references to these objects; replacing them (as this once did) left
     * every slider writing into an orphaned copy the simulation never read.
     */
    reset(): void {
      const fresh = new ModelParams();
      Object.assign(this.geo, fresh.geo);
      Object.assign(this.atmo, fresh.atmo);
      Object.assign(this.bio, fresh.bio);
      Object.assign(this.civEnergy, fresh.civEnergy);
      Object.assign(this.civAlloc, fresh.civAlloc);
    }

    /** The five groups by name, for saving and validated loading. */
    groups(): Record<string, Record<string, number>> {
      return {
        geo: this.geo as unknown as Record<string, number>,
        atmo: this.atmo as unknown as Record<string, number>,
        bio: this.bio as unknown as Record<string, number>,
        civEnergy: this.civEnergy as unknown as Record<string, number>,
        civAlloc: this.civAlloc as unknown as Record<string, number>,
      };
    }

    /** Share of energy demand met by each source, normalised to sum to 1. */
    energyMix(): CivEnergyParams {
      const e = this.civEnergy;
      const total = e.solarWind + e.hydroGeo + e.fossilFuel + e.nuclear;
      if (total <= 0) return { solarWind: 0.25, hydroGeo: 0.25, fossilFuel: 0.25, nuclear: 0.25 };
      return {
        solarWind: e.solarWind / total,
        hydroGeo: e.hydroGeo / total,
        fossilFuel: e.fossilFuel / total,
        nuclear: e.nuclear / total,
      };
    }
  }
}
