/* =============================================================================
 * SimEarth 2.0 — what the simulation says about an animal group
 * -----------------------------------------------------------------------------
 * The game values of the species info box as plain German text, read from
 * the same tables the simulation uses (LIFE, the flora constants, the tree):
 * food, enemies, habitats, effects on the planet and the rule a sub-species
 * arises by. All of it belongs to the whole group — the eight sub-species of
 * a class share their values. No DOM: the tests can check it in Node.
 * ========================================================================== */

namespace SE {
  export function faunaNum(v: number): string {
    return v.toLocaleString('de-DE', { maximumFractionDigits: 3 });
  }

  export function faunaPlantNames(mask: number): string {
    if (mask === LAND_FLORA_MASK) return 'alle Landpflanzen';
    if (mask === VASCULAR_FLORA_MASK) return 'alle Gefäßpflanzen';
    const names: string[] = [];
    for (let g = 1; g < FLORA_COUNT; g++) if (mask & (1 << g)) names.push(FLORA[g as Flora].name);
    return names.join(', ');
  }

  export function faunaLifeNames(list: readonly Life[]): string {
    return list.map((p) => LIFE[p].name).join(', ');
  }

  export function faunaPredators(c: Life): Life[] {
    const out: Life[] = [];
    for (let p = 1; p < LIFE_COUNT; p++) if (LIFE[p as Life].diet.prey?.includes(c)) out.push(p as Life);
    return out;
  }

  /** What the class eats, as the food function in LifeSystem reads its diet. */
  export function faunaFoodText(c: Life): string {
    const d = LIFE[c].diet;
    if (d.selfFeeding) return 'braucht keine – ernährt sich selbst';
    const parts: string[] = [];
    if (d.plankton) parts.push('Plankton');
    if (d.algae) parts.push(FLORA[Flora.MarineAlgae].name);
    const plants = d.plants ?? [];
    const top = Math.max(0, ...plants.map(([, w]) => w));
    let seen = 0;
    for (const [mask, w] of plants) {
      const rest = mask & ~seen;
      seen |= mask;
      if (rest) parts.push(w < top ? `auch ${faunaPlantNames(rest)} (weniger ergiebig)` : faunaPlantNames(rest));
    }
    if (d.prey?.length) parts.push('Beutetiere (siehe „Beute“)');
    return parts.length > 0 ? parts.join('; ') : '—';
  }

  /** Mirrors the temperature window in `LifeSystem.prepare`. */
  export function faunaTempWindow(c: Life, params: ModelParams): readonly [number, number] {
    const tolerance = clamp(mul(params.bio.tolerance), 0.2, 2);
    const [lo, hi] = LIFE[c].temp;
    const mid = (lo + hi) / 2;
    const half = ((hi - lo) / 2) * tolerance;
    return [mid - half, mid + half];
  }

  /** Biomes the class can live in, best first: preferred (suit ≥ 0.8) and the rest. */
  export function faunaBiomesBySuit(c: Life): { best: number[]; more: number[] } {
    const suit = LIFE[c].suit;
    const order = Array.from({ length: BIOME_COUNT }, (_, b) => b).filter((b) => suit[b] > 0).sort((a, b) => suit[b] - suit[a]);
    return { best: order.filter((b) => suit[b] >= 0.8), more: order.filter((b) => suit[b] < 0.8) };
  }

  /** How the group acts on the planet — only what the simulation code does. */
  export function faunaEffects(c: Life, params: ModelParams): string[] {
    const out: string[] = [];
    if (c === Life.Prokaryote || c === Life.Eukaryote) {
      const eaters: Life[] = [];
      for (let k = 1; k < LIFE_COUNT; k++) if (LIFE[k as Life].diet.plankton) eaters.push(k as Life);
      out.push(`Bildet das Plankton: Grundlage der Fotosynthese im Meer, die Sauerstoff liefert, und Nahrung der Planktonfresser (${faunaLifeNames(eaters)}).`);
    } else {
      out.push(LIFE[c].realm === 'sea' ? 'Atmet den im Meerwasser gelösten Sauerstoff und gibt CO₂ ab.' : 'Atmet Sauerstoff aus der Luft und gibt CO₂ ab.');
    }
    if (c === Life.Pollinator) {
      out.push(`Bestäubung: Wo sie leben, wachsen ${faunaPlantNames(POLLINATED_MASK)} dichter (×${faunaNum(POLLINATION_COVER)}) und breiten sich häufiger aus (×${faunaNum(POLLINATION_SPREAD)}).`);
    }
    if (c === Life.Insect) out.push(`${FLORA[Flora.Carnivorous].name} wachsen dort, wo Insekten leben, dichter.`);
    if (c === Life.Avian) {
      out.push(`Samenverbreitung: Sobald Vögel mehr als ${ECO_MIN_TILES * 4} Felder besiedeln, gelangen ${faunaPlantNames(BIRD_DISPERSED_MASK)} häufiger über weite Strecken (×${faunaNum(BIRD_DISPERSAL)}).`);
    }
    out.push(`Solange die Gruppe lebt, bringt sie +${faunaNum(EP_PER_GROUP * mul(params.bio.evolutionRate))} Evolutionspunkte je Zeitschritt.`);
    return out;
  }

  /** The real rule that produced (`known`) or will produce this sub-species. */
  export function faunaOriginRule(world: WorldState, params: ModelParams, dex: FaunaDex, c: Life, stage: number, known: boolean): string {
    const group = LIFE[c].name;
    if (stage === 0) {
      if (!known) return `Entsteht, sobald die Gruppe „${group}“ im Evolutionsbaum entwickelt ist: Ihre ersten Populationen gehören zu dieser Unterart.`;
      const rec = world.evo.developed.get(LIFE[c].id);
      const how = !rec ? `Die ersten Populationen der Gruppe „${group}“ gehören immer zu dieser Unterart.`
        : rec.migrated ? `Die Gruppe „${group}“ stammt aus einem älteren Spielstand; ihre ersten Populationen gehören zu dieser Unterart.`
          : rec.spontaneous ? `Die Gruppe „${group}“ ist ${formatEarthDate(rec.years)} von selbst entstanden, ohne dass du Evolutionspunkte ausgegeben hast. Ihre ersten Populationen gehören zu dieser Unterart.`
            : `Du hast die Gruppe „${group}“ ${formatEarthDate(rec.years)} im Evolutionsbaum entwickelt. Ihre ersten Populationen gehören zu dieser Unterart.`;
      return `${how} Auch jede neue Population – durch Ausbreitung oder Ansiedeln – beginnt hier.`;
    }
    const prev = dex.isDiscovered(c, stage - 1) ? `„${subspeciesName(c, stage - 1)}“` : `Unterart ${stage}`;
    const mutation = fmt.int(mul(params.bio.mutationRate) * 100);
    return (known
      ? `Auf deinem Planeten stieg eine Population von ${prev} zu dieser Unterart auf, als sie ihr Feld fast vollständig besiedelt hatte. `
      : `Eine Population von ${prev} steigt zu dieser Unterart auf, sobald sie ihr Feld fast vollständig besiedelt hat. `) +
      `Das geschieht per Zufall; der Regler „Mutationsrate“ (Modell Biosphäre, derzeit ${mutation} %) beschleunigt es. ` +
      `Neue Populationen dieser Unterart entstehen nur, solange weniger als ${fmt.int(STAGE_MAX_SHARE[stage] * 100)} % der Gruppe auf dieser oder einer höheren Stufe stehen.`;
  }
}
