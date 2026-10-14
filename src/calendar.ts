/* =============================================================================
 * SimEarth 2.0 — the Earth calendar
 * -----------------------------------------------------------------------------
 * The clock of the geologic and evolution time scales follows Earth's history:
 * the planet forms 4,6 Mrd. years ago, the long microbial eras pass in big
 * steps and the Phanerozoic in fine ones, so a whole tree takes about as many
 * ticks as before but lands near the real dates. A date is the planet age
 * (years since formation, as `world.absoluteYears` counts it) read as
 * "vor X Jahren". Pure and DOM-free: the simulation, tests and probe use it.
 * ========================================================================== */

namespace SE {
  /** Years from the planet's formation to the present. */
  export const PLANET_AGE = 4.6e9;

  export interface GeoEra {
    readonly name: string;
    /** For narrow screens. */
    readonly short: string;
    /** Start and end, in million years before the present. */
    readonly fromMa: number;
    readonly toMa: number;
    /** Years one tick advances while the planet is in this era. */
    readonly yearsPerTick: number;
  }

  /**
   * Oldest first, contiguous from formation to the present. The steps add up to
   * about 4 880 ticks: ~425 for the four billion years before the Ediacarium,
   * ~4 460 for the 635 million years since.
   */
  export const GEO_ERAS: readonly GeoEra[] = [
    { name: 'Hadaikum', short: 'Hadaikum', fromMa: 4600, toMa: 4000, yearsPerTick: 25e6 },
    { name: 'Archaikum', short: 'Archaikum', fromMa: 4000, toMa: 2500, yearsPerTick: 20e6 },
    { name: 'Paläoproterozoikum', short: 'Paläoprot.', fromMa: 2500, toMa: 1600, yearsPerTick: 15e6 },
    { name: 'Mesoproterozoikum', short: 'Mesoprot.', fromMa: 1600, toMa: 1000, yearsPerTick: 5e6 },
    { name: 'Tonium', short: 'Tonium', fromMa: 1000, toMa: 720, yearsPerTick: 2.5e6 },
    { name: 'Cryogenium', short: 'Cryogen.', fromMa: 720, toMa: 635, yearsPerTick: 2.5e6 },
    { name: 'Ediacarium', short: 'Ediacar.', fromMa: 635, toMa: 539, yearsPerTick: 4e5 },
    { name: 'Kambrium', short: 'Kambrium', fromMa: 539, toMa: 485, yearsPerTick: 125e3 },
    { name: 'Ordovizium', short: 'Ordoviz.', fromMa: 485, toMa: 444, yearsPerTick: 125e3 },
    { name: 'Silur', short: 'Silur', fromMa: 444, toMa: 419, yearsPerTick: 125e3 },
    { name: 'Devon', short: 'Devon', fromMa: 419, toMa: 359, yearsPerTick: 125e3 },
    { name: 'Karbon', short: 'Karbon', fromMa: 359, toMa: 299, yearsPerTick: 125e3 },
    { name: 'Perm', short: 'Perm', fromMa: 299, toMa: 252, yearsPerTick: 125e3 },
    { name: 'Trias', short: 'Trias', fromMa: 252, toMa: 201, yearsPerTick: 150e3 },
    { name: 'Jura', short: 'Jura', fromMa: 201, toMa: 145, yearsPerTick: 150e3 },
    { name: 'Kreide', short: 'Kreide', fromMa: 145, toMa: 66, yearsPerTick: 150e3 },
    { name: 'Paläogen', short: 'Paläogen', fromMa: 66, toMa: 23, yearsPerTick: 150e3 },
    { name: 'Neogen', short: 'Neogen', fromMa: 23, toMa: 2.6, yearsPerTick: 150e3 },
    // The last era also runs on past the present.
    { name: 'Quartär', short: 'Quartär', fromMa: 2.6, toMa: 0, yearsPerTick: 10e3 },
  ];

  /**
   * When each tree step happened on Earth, in million years before the present.
   * The first appearance of the group the step stands for, matching the dates
   * in the stories and docs/ueberarbeitung-2026-10/quellenpruefung.md.
   */
  export const EARTH_DATES_MA: Readonly<Record<string, number>> = {
    cells: 3800, eukaryotes: 1800,
    marineAlgae: 1000, freshwaterAlgae: 540, landPlants: 470, vascular: 430, clubmosses: 420,
    mosses: 410, ferns: 390, firstTrees: 385, seedPlants: 365, conifers: 300, flowering: 130,
    broadleaf: 100, carnivorous: 45, grasses: 20,
    earlyAnimals: 600, bilaterians: 560, molluscs: 530, arthropods: 520, fish: 518,
    landArthropods: 425, insects: 400, amphibians: 375, reptiles: 312, dinosaurs: 230,
    mammals: 200, birds: 150, pollinators: 100, grazers: 55, whales: 50,
  };

  /** Years before the present at a planet age; negative once past it. */
  export function yearsAgo(age: number): number {
    return PLANET_AGE - age;
  }

  /** Planet age at a point given in million years before the present. */
  function ageOfMa(ma: number): number {
    return PLANET_AGE - Math.round(ma * 1e6);
  }

  export function eraIndexAt(age: number): number {
    const ago = yearsAgo(age);
    for (let k = 0; k < GEO_ERAS.length - 1; k++) {
      if (ago > Math.round(GEO_ERAS[k].toMa * 1e6)) return k;
    }
    return GEO_ERAS.length - 1;
  }

  export function eraAt(age: number): GeoEra {
    return GEO_ERAS[eraIndexAt(age)];
  }

  export function yearsPerTickAt(age: number): number {
    return eraAt(age).yearsPerTick;
  }

  /**
   * Planet age after `tick` calendar steps from formation — exactly what
   * stepping `age += yearsPerTickAt(age)` gives, since every step and border
   * is a whole number of years.
   */
  export function ageAtTick(tick: number): number {
    let age = 0;
    let left = Math.max(0, Math.floor(tick));
    for (let k = 0; k < GEO_ERAS.length && left > 0; k++) {
      const step = GEO_ERAS[k].yearsPerTick;
      const steps = k === GEO_ERAS.length - 1
        ? left
        : Math.min(left, Math.max(0, Math.ceil((ageOfMa(GEO_ERAS[k].toMa) - age) / step)));
      age += steps * step;
      left -= steps;
    }
    return age;
  }

  /** "3,8 Mrd.", "530 Mio.", "12.000" — three significant digits from a million up. */
  export function formatYearsAmount(years: number): string {
    const sig = (v: number): string => v.toLocaleString('de-DE', { maximumSignificantDigits: 3 });
    if (years >= 999.5e6) return `${sig(years / 1e9)} Mrd.`;
    if (years >= 999.5e3) return `${sig(years / 1e6)} Mio.`;
    return Math.round(years).toLocaleString('de-DE');
  }

  /**
   * A planet age as an Earth date: "vor 3,8 Mrd. Jahren", "vor 12.000 Jahren",
   * past the present "Gegenwart + 1.200 Jahre". `short` writes "J." instead.
   */
  export function formatEarthDate(age: number, short = false): string {
    const ago = yearsAgo(age);
    const whole = Math.round(Math.abs(ago));
    if (whole === 0) return 'Gegenwart';
    const amount = formatYearsAmount(Math.abs(ago));
    if (ago > 0) {
      if (short) return `vor ${amount} J.`;
      return whole === 1 ? 'vor einem Jahr' : `vor ${amount} Jahren`;
    }
    return `Gegenwart + ${amount} ${short ? 'J.' : whole === 1 ? 'Jahr' : 'Jahre'}`;
  }
}
