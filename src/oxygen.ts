namespace SE {
  export type OxygenMedium = 'air' | 'water';

  export interface OxygenNeed {
    readonly medium: OxygenMedium;
    readonly min: number;
    readonly full: number;
    readonly establish: number;
  }

  /** Sea animals breathe water; whales keep breathing air. */
  export function lifeOxygen(c: Life): OxygenNeed {
    if (c === Life.Eukaryote) {
      return { medium: 'water', min: EUKARYOTE_OCEAN_O2_MIN, full: EUKARYOTE_OCEAN_O2_FULL, establish: EUKARYOTE_OCEAN_O2_FOUND };
    }
    const def = LIFE[c];
    const water = def.realm === 'sea' && c !== Life.Cetacean;
    const scale = water ? 100 / O2_PRESENT : 1;
    return {
      medium: water ? 'water' : 'air', min: def.o2Min * scale,
      full: (def.o2Min + 3) * scale, establish: def.o2Min > 0 ? Math.ceil((def.o2Min + 1) * scale * 10) / 10 : 0,
    };
  }

  export function oxygenLevel(world: WorldState, medium: OxygenMedium): number {
    return medium === 'water' ? world.oceanO2 : world.o2;
  }

  export function oxygenUnit(medium: OxygenMedium): string {
    return medium === 'water' ? '% der heutigen Sauerstoffsättigung im Meer' : '% Sauerstoff in der Luft';
  }
}
