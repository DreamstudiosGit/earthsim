/* =============================================================================
 * SimEarth 2.0 — information windows: history, report, examine, glossary, chronicle
 * ========================================================================== */

namespace SE {
  /* --------------------------------------------------------------- history -- */

  export interface HistorySeries {
    readonly label: string;
    readonly color: Rgb;
    readonly data: number[];
    /** Value range mapped onto the chart height — below zero included. */
    readonly min: number;
    readonly max: number;
    /** A sample as the History window prints it. */
    readonly format: (v: number) => string;
    /** For histories saved before this series existed: its value from the air's O2 then. */
    readonly backfill?: (airO2: number) => number;
  }

  /** Developed groups that still live somewhere on the planet. */
  export function livingGroups(world: WorldState): number {
    let alive = 0;
    for (const id of world.evo.developed.keys()) {
      const n = evoNode(id);
      const count = n.life !== undefined ? world.lifeCounts[n.life] : n.flora !== undefined ? world.floraCounts[n.flora] : 0;
      if (count > 0) alive++;
    }
    return alive;
  }

  /** Index of the air's oxygen among the recorded series. */
  const AIR_O2 = 2;

  /** Records the planet's vital signs so the History window can graph them. */
  export class HistoryRecorder {
    private static readonly LIMIT = 400;
    private static readonly INTERVAL = 8;
    /** Planet age at each sample, for the time axis. */
    readonly years: number[] = [];

    readonly series: HistorySeries[] = [
      { label: 'Temperatur', color: [255, 122, 107], data: [], min: -20, max: 40, format: (v) => `${fmt.one(v)} °C` },
      { label: 'CO₂', color: [200, 160, 120], data: [], min: 0, max: 2000, format: (v) => `${fmt.int(v)} ppm` },
      { label: 'Sauerstoff Luft', color: [127, 224, 240], data: [], min: 0, max: 30, format: (v) => `${fmt.one(v)} %` },
      { label: 'Wasserdampf', color: [110, 160, 255], data: [], min: 0, max: 1, format: (v) => fmt.pct(v) },
      { label: 'Pflanzendecke', color: [138, 209, 111], data: [], min: 0, max: 0.4, format: (v) => fmt.pct(v) },
      { label: 'Belebte Fläche', color: [242, 163, 92], data: [], min: 0, max: 0.8, format: (v) => fmt.pct(v) },
      { label: 'Städte', color: [246, 196, 83], data: [], min: 0, max: 60, format: (v) => fmt.one(v) },
      { label: 'Lebende Gruppen', color: [180, 140, 255], data: [], min: 0, max: EVO_NODES.length, format: (v) => fmt.int(v) },
      {
        label: 'Sauerstoff Meer', color: [76, 182, 214], data: [], min: 0, max: 120,
        format: (v) => `${fmt.int(v)} % der heutigen Sättigung`, backfill: (o2) => seaFromAir(o2).oxygen,
      },
      {
        label: 'Gelöstes Eisen', color: [196, 106, 72], data: [], min: 0, max: 1,
        format: (v) => fmt.pct(v), backfill: (o2) => seaFromAir(o2).iron,
      },
      { label: 'Kohlevorrat', color: [150, 140, 128], data: [], min: 0, max: 25000, format: (v) => `${fmt.int(v)} Gt` },
    ];

    sample(world: WorldState): void {
      if (world.ticks % HistoryRecorder.INTERVAL !== 0) return;
      const values = [
        world.globalTemp, world.co2, world.o2, world.vapor,
        world.vegetationCoverage, world.lifeCover, world.totalCityPop, livingGroups(world),
        world.oceanO2, world.oceanIron, world.coal,
      ];
      this.series.forEach((s, i) => {
        s.data.push(values[i]);
        if (s.data.length > HistoryRecorder.LIMIT) s.data.shift();
      });
      this.years.push(world.absoluteYears);
      if (this.years.length > HistoryRecorder.LIMIT) this.years.shift();
    }

    reset(): void {
      for (const s of this.series) s.data.length = 0;
      this.years.length = 0;
    }

    /** For the save file: the samples and the planet age of each. */
    toJSON(): { years: number[]; series: number[][] } {
      return {
        years: this.years.slice(),
        series: this.series.map((s) => s.data.map((v) => Math.round(v * 1000) / 1000)),
      };
    }

    /**
     * Restore what `toJSON` wrote, skipping anything malformed. Histories
     * saved before a series existed lack its column, which is backfilled.
     */
    fromJSON(raw: unknown): void {
      if (!raw || typeof raw !== 'object') return;
      const r = raw as { years?: unknown; series?: unknown };
      if (!Array.isArray(r.years) || !Array.isArray(r.series)) return;
      const n = Math.min(r.years.length, HistoryRecorder.LIMIT);
      const ok = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
      if (!r.years.slice(0, n).every(ok)) return;
      const series = r.series as unknown[];
      if (series.length > this.series.length || series.length <= AIR_O2) return;
      for (let k = 0; k < series.length; k++) {
        const col = series[k];
        if (!Array.isArray(col) || col.length !== r.years.length || !col.slice(0, n).every(ok)) return;
      }
      this.reset();
      for (let i = 0; i < n; i++) this.years.push(r.years[i] as number);
      this.series.forEach((s, k) => {
        for (let i = 0; i < n; i++) {
          const air = (series[AIR_O2] as number[])[i];
          s.data.push(k < series.length ? (series[k] as number[])[i] : s.backfill ? s.backfill(air) : 0);
        }
      });
    }
  }

  /* -------------------------------------------------------------- glossary -- */

  /** Term, explanation, and the asset (under assets/, without .svg) that pictures it. */
  export const GLOSSARY: readonly [string, string, string][] = [
    ['Abstammung', 'Aus welcher Gruppe eine neue Gruppe hervorgeht – im Evolutionsbaum eine durchgezogene Linie. Die Vorgänger verschwinden dabei nicht: Heutige Moose werden nicht zu Farnen.', 'ui/link-lineage'],
    ['Lebensraum', 'Die Umweltbedingungen, die eine Gruppe braucht: Meer, Ufer, Feuchtgebiet, trockenes Land, Kälte, genug Sauerstoff.', 'ui/link-habitat'],
    ['Ökologische Beziehung', 'Was eine Gruppe von anderen Lebewesen braucht: Nahrung, einen Partner (z. B. Blüten für Bienen) oder Boden. Im Baum gestrichelt – eine Futterpflanze ist kein Vorfahr.', 'ui/link-food'],
    ['Evolutionspunkte (EP)', 'Entstehen aus der Vielfalt lebender Gruppen. Je mehr Gruppen auf dem Planeten leben, desto schneller wachsen sie. Damit entwickelst du neue Schritte im Evolutionsbaum.', 'resources/ep'],
    ['Energie (Ω)', 'Dein Budget für Eingriffe mit den Werkzeugen. Sie füllt sich nur, während die Simulation läuft.', 'resources/energy'],
    ['Süßwasser-Grünalgen', 'Eine Grünalgen-Linie, die Flüsse und feuchte Böden besiedelte. Aus ihren Verwandten gingen die Landpflanzen hervor – nicht aus den Meeresalgen insgesamt.', 'evolution/freshwaterAlgae'],
    ['Bestäuber', 'Tiere, die Pollen von Blüte zu Blüte tragen. Die ersten Blüten besuchten Käfer und Fliegen; spezialisierte Bestäuber wie Bienen kamen später.', 'evolution/pollinators'],
    ['Biom', 'Die Struktur eines Ortes: Offenland, Wald, Regenwald, Sumpf, Tundra … Es ergibt sich aus dem Klima und den Pflanzen, die dort wachsen.', 'ui/layer-biomes'],
    ['Gaia', 'Der Planet als sich selbst regulierender Organismus. Ihr Gesicht zeigt, wie es der Biosphäre geht.', 'ui/gaia'],
    ['Albedo', 'Wie viel Sonnenlicht eine Oberfläche zurückwirft. Eis reflektiert am meisten – deshalb können Eiskappen sich selbst verstärken.', 'ui/model-albedo'],
    ['Treibhauseffekt', 'Erwärmung, weil CO₂ und Wasserdampf ausgehende Wärme zurückhalten.', 'ui/model-greenhouse'],
    ['Kontinentaldrift', 'Platten tragen die Kruste – und alles, was darauf lebt – über lange Zeit seitwärts.', 'ui/map-drift'],
    ['Zeitalter', 'Geologie, Evolution, Zivilisation und Technologie. Jedes lässt die Uhr unterschiedlich schnell laufen.', 'events/timescale'],
    ['Intelligenz', 'Mehrere Tiergruppen können Intelligenz entwickeln und Städte gründen – nicht nur Säugetiere.', 'events/sentience'],
    ['Terraformer', 'Maschinen, die die Atmosphäre direkt verändern: Sauerstoff, CO₂ oder Wasserdampf.', 'ui/terra-oxygen'],
    ['Monolith', 'Erweckt die örtliche Art zur Intelligenz. Teuer und selten subtil.', 'ui/terra-monolith'],
    ['Carnifern', 'Im Original eine erfundene, wandernde fleischfressende Pflanze. Hier gibt es dafür echte fleischfressende Pflanzen wie den Sonnentau.', 'evolution/carnivorous'],
    ['Trichordat', 'Im Original eine erfundene Tierlinie. Ältere Spielstände führen sie als Landgliederfüßer weiter.', 'evolution/landArthropods'],
  ];

  export function buildGlossary(host: HTMLElement): void {
    host.innerHTML = '';
    const dl = make('dl', 'gloss');
    for (const [term, text, icon] of GLOSSARY) {
      const item = make('div', 'gloss-item');
      const dt = make('dt');
      dt.append(img(`assets/${icon}.svg`, 'gloss-icon'), make('span', undefined, term));
      item.append(dt, make('dd', undefined, text));
      dl.appendChild(item);
    }
    host.appendChild(dl);
    // The tree's background and sources ship with the game.
    const more = document.createElement('a');
    more.className = 'gloss-more';
    more.href = 'docs/ueberarbeitung-2026-10/evolution.md';
    more.target = '_blank';
    more.rel = 'noopener';
    more.append(img(uiIcon('external'), 'ico'), make('span', undefined, 'Hintergrund und Quellen zum Evolutionsbaum (öffnet in neuem Tab)'));
    host.appendChild(more);
  }

  /* ------------------------------------------------------------- chronicle -- */

  /** Every reported development and happening, newest first. */
  export class ChroniclePanel {
    private count = -1;
    onOpenNode: ((id: string) => void) | null = null;

    constructor(private readonly host: HTMLElement) {}

    update(world: WorldState, force = false): void {
      const list = world.evo.chronicle;
      if (!force && list.length === this.count) return;
      this.count = list.length;
      this.host.innerHTML = '';
      if (list.length === 0) {
        const empty = make('div', 'empty-state');
        empty.append(img(uiIcon('chronicle'), 'empty-art'), make('p', undefined, 'Die Chronik ist noch leer. Jede Entwicklung und jedes besondere Ereignis wird hier festgehalten.'));
        this.host.appendChild(empty);
        return;
      }
      const ol = make('ol', 'chronicle');
      for (let k = list.length - 1; k >= 0; k--) {
        const e = list[k];
        const li = make('li', `chron kind-${e.kind}${e.major ? ' major' : ''}`);
        li.appendChild(img(e.icon, 'chron-art'));
        const body = make('div', 'chron-body');
        body.append(
          make('div', 'chron-when', `${formatEarthDate(e.years)} · ${eraAt(e.years).name}`),
          make('div', 'chron-title', e.title),
          make('p', 'chron-text', e.text),
        );
        if (e.spontaneous) body.insertBefore(make('span', 'showcase-spont chron-spont', 'Von selbst entstanden'), body.children[1]);
        if (e.change) body.appendChild(make('p', 'chron-change', e.change));
        if (e.nodeId) {
          const id = e.nodeId;
          body.appendChild(button({ label: 'Im Evolutionsbaum ansehen', icon: uiIcon('evolution'), cls: 'btn btn-small btn-ghost', onClick: () => this.onOpenNode?.(id) }));
        }
        li.appendChild(body);
        ol.appendChild(li);
      }
      this.host.appendChild(ol);
    }
  }
}
