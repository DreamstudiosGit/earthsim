/* =============================================================================
 * SimEarth 2.0 — the sub-species strip
 * -----------------------------------------------------------------------------
 * The eight sub-species of an animal class as a row of portraits in the tree's
 * detail panel: the stages the class has reached lit, the later ones dimmed,
 * each with its name and when it first appeared on Earth.
 * ========================================================================== */

namespace SE {
  /** Highest sub-species stage any population of the class stands at, or -1. */
  export function highestStage(world: WorldState, c: Life): number {
    for (let s = SUBSPECIES_PER_CLASS - 1; s >= 0; s--) {
      if (world.lifeStageCounts[c * SUBSPECIES_PER_CLASS + s] > 0) return s;
    }
    return -1;
  }

  export function speciesStrip(c: Life, reached: number): HTMLElement {
    const strip = make('div', 'species-strip');
    SPECIES[c]?.stages.forEach((st, s) => {
      const item = make('figure', `species-stage${s <= reached ? ' reached' : ''}`);
      const when = st.ma >= 1000
        ? `${(st.ma / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mrd.`
        : `${st.ma.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mio.`;
      item.title = `Unterart ${s + 1} von ${SUBSPECIES_PER_CLASS}: ${st.name} – auf der Erde erstmals vor ${when} Jahren`;
      const pic = make('div', 'species-pic');
      pic.innerHTML = artSvg(st.art, CREATURE_LOOK);
      item.append(pic, make('figcaption', undefined, st.name));
      strip.appendChild(item);
    });
    return strip;
  }
}
