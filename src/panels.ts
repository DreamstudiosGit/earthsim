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

  /** Records the planet's vital signs so the History window can graph them. */
  export class HistoryRecorder {
    private static readonly LIMIT = 400;
    private static readonly INTERVAL = 8;
    /** Planet age at each sample, for the time axis. */
    readonly years: number[] = [];

    readonly series: HistorySeries[] = [
      { label: 'Temperatur', color: [255, 122, 107], data: [], min: -20, max: 40, format: (v) => `${fmt.one(v)} °C` },
      { label: 'CO₂', color: [200, 160, 120], data: [], min: 0, max: 2000, format: (v) => `${fmt.int(v)} ppm` },
      { label: 'Sauerstoff', color: [127, 224, 240], data: [], min: 0, max: 30, format: (v) => `${fmt.one(v)} %` },
      { label: 'Wasserdampf', color: [110, 160, 255], data: [], min: 0, max: 1, format: (v) => fmt.pct(v) },
      { label: 'Pflanzendecke', color: [138, 209, 111], data: [], min: 0, max: 0.4, format: (v) => fmt.pct(v) },
      { label: 'Belebte Fläche', color: [242, 163, 92], data: [], min: 0, max: 0.8, format: (v) => fmt.pct(v) },
      { label: 'Städte', color: [246, 196, 83], data: [], min: 0, max: 60, format: (v) => fmt.one(v) },
      { label: 'Lebende Gruppen', color: [180, 140, 255], data: [], min: 0, max: EVO_NODES.length, format: (v) => fmt.int(v) },
    ];

    sample(world: WorldState): void {
      if (world.ticks % HistoryRecorder.INTERVAL !== 0) return;
      const values = [
        world.globalTemp, world.co2, world.o2, world.vapor,
        world.vegetationCoverage, world.lifeCover, world.totalCityPop, livingGroups(world),
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

    /** Restore what `toJSON` wrote, skipping anything malformed. */
    fromJSON(raw: unknown): void {
      if (!raw || typeof raw !== 'object') return;
      const r = raw as { years?: unknown; series?: unknown };
      if (!Array.isArray(r.years) || !Array.isArray(r.series)) return;
      const n = Math.min(r.years.length, HistoryRecorder.LIMIT);
      const ok = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
      if (!r.years.slice(0, n).every(ok)) return;
      const series = r.series as unknown[];
      if (series.length !== this.series.length) return;
      for (let k = 0; k < series.length; k++) {
        const col = series[k];
        if (!Array.isArray(col) || col.length !== r.years.length || !col.slice(0, n).every(ok)) return;
      }
      this.reset();
      for (let i = 0; i < n; i++) this.years.push(r.years[i] as number);
      this.series.forEach((s, k) => {
        for (let i = 0; i < n; i++) s.data.push((series[k] as number[])[i]);
      });
    }
  }

  /* --------------------------------------------------------------- examine -- */

  /** The Examine readout: ground, plants and animals of one tile. */
  export class ExaminePanel {
    private readonly portraits = new SpriteAtlas(8);
    private selected: Life = Life.None;
    private signature = '';
    onShowInTree: ((id: string) => void) | null = null;

    constructor(private readonly host: HTMLElement) {}

    select(c: Life): void {
      this.selected = c;
      this.signature = '';
    }

    /** Forget the cached digest so the next update rebuilds. */
    invalidate(): void {
      this.signature = '';
    }

    update(world: WorldState, x: number, y: number): void {
      const i = idx(x, y);
      const species = world.speciesOn(i);
      if (species.indexOf(this.selected) < 0) this.selected = species.length > 0 ? species[0] : Life.None;
      const cls = this.selected;

      // Everything shown is in the digest — the altitude too, which the old
      // one left out, so a terraformed tile kept reporting its old height.
      const sig = [
        i, world.biome[i], world.flora[i], world.floraTop[i], cls, cls === Life.None ? 0 : world.stage(i, cls),
        species.join(','), Math.round(world.tileBiomass[i] * 50), Math.round(world.vegetation[i] * 50),
        Math.round(world.temperature[i]), Math.round(world.moisture[i] * 50), world.altitudeMeters(i),
        world.riverLevel[i] > 0 ? 1 : 0, world.tech[i], world.eventTtl[i] > 0 ? world.eventKind[i] : -1,
        // Figures that creep are part of the digest only as shown: rounded.
        cls === Life.None ? 0 : Math.round((world.lifeCounts[cls] / TILE_COUNT) * 1000),
        cls === Life.None ? 0 : ExaminePanel.roughAge(world, cls),
      ].join('|');
      if (sig === this.signature) return;
      this.signature = sig;

      // A rebuild must not throw the keyboard out of the window.
      const active = document.activeElement as HTMLElement | null;
      const focusKey = active && this.host.contains(active) ? active.dataset.focusKey ?? null : null;
      this.host.innerHTML = '';
      const cols = make('div', 'ex-cols');
      cols.append(this.groundCard(world, i, y), this.plantCard(world, i), this.animalCard(world, i, cls));
      this.host.append(cols, this.speciesStrip(world, i, species), this.footer(world, i, x, y));
      if (focusKey) this.host.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus({ preventScroll: true });
    }

    /** A group's age to two significant figures — what the window shows. */
    private static roughAge(world: WorldState, c: Life): number {
      const born = world.lifeFirstSeen[c];
      if (born < 0) return -1;
      const age = world.absoluteYears - born;
      return age > 0 ? Number(age.toPrecision(2)) : 0;
    }

    private card(title: string, icon: string): { el: HTMLElement; body: HTMLElement } {
      const el = make('section', 'ex-card');
      const head = make('div', 'ex-card-head');
      head.append(img(icon, 'ico'), make('h3', undefined, title));
      const body = make('div', 'ex-card-body');
      el.append(head, body);
      return { el, body };
    }

    private grid(rows: readonly (readonly [string, string])[]): HTMLElement {
      const g = make('dl', 'ex-grid');
      for (const [k, v] of rows) g.append(make('dt', undefined, k), make('dd', undefined, v));
      return g;
    }

    private groundCard(world: WorldState, i: number, y: number): HTMLElement {
      const biome = world.biome[i] as Biome;
      const { el, body } = this.card('Lebensraum', uiIcon('layer-biomes'));
      const hero = make('div', 'ex-hero');
      const text = make('div', 'ex-hero-text');
      text.append(make('div', 'ex-title', BIOME_NAMES[biome]), make('div', 'ex-sub', LifeSystem.biomeStatusLabel(world, i)));
      hero.append(img(habitatAsset(BIOME_ICONS[biome]), 'ex-hero-img'), text);
      body.appendChild(hero);
      const wind = ClimateSystem.airCurrent(y);
      const rows: [string, string][] = [
        ['Temperatur', `${fmt.int(world.temperature[i])} °C`],
        ['Niederschlag', `${fmt.int(world.rainfallCm(i))} cm/Jahr`],
        ['Höhe', `${fmt.int(world.altitudeMeters(i))} m`],
        ['Wind nach', `${wind.dy > 0 ? 'S' : 'N'}${wind.dx > 0 ? 'O' : 'W'}`],
      ];
      if (world.riverLevel[i] > 0) rows.push(['Fluss', `${fmt.int(RiverSystem.discharge(world, i))} m³/s`]);
      body.appendChild(this.grid(rows));
      return el;
    }

    private plantCard(world: WorldState, i: number): HTMLElement {
      const { el, body } = this.card('Pflanzen', uiIcon('tool-plant'));
      const mask = world.flora[i];
      if (mask === 0) {
        body.appendChild(make('p', 'ex-empty', world.isWater(i)
          ? 'Keine Algen. Meeresalgen wachsen im flachen Küstenmeer.'
          : 'Keine Pflanzen. Entwickle Pflanzengruppen im Evolutionsbaum oder pflanze sie mit dem Werkzeug „Pflanzen“.'));
        return el;
      }
      body.appendChild(make('div', 'ex-sub', `Bedeckung ${fmt.pct(world.vegetation[i])}`));
      const list = make('ul', 'ex-plant-list');
      for (let g = 1; g < FLORA_COUNT; g++) {
        if (!(mask & (1 << g))) continue;
        const n = nodeForFlora(g as Flora);
        if (!n) continue;
        const lead = g === world.floraTop[i];
        const li = make('li', lead ? 'lead' : '');
        const b = button({ label: n.name, icon: evoIcon(n.id), cls: 'chip-btn', title: 'Im Evolutionsbaum ansehen', onClick: () => this.onShowInTree?.(n.id) });
        b.dataset.focusKey = `plant:${n.id}`;
        li.appendChild(b);
        if (lead) li.appendChild(make('span', 'ex-lead', 'prägt das Feld'));
        list.appendChild(li);
      }
      body.appendChild(list);
      return el;
    }

    private animalCard(world: WorldState, i: number, cls: Life): HTMLElement {
      const { el, body } = this.card('Tiere & Einzeller', uiIcon('tool-life'));
      if (cls === Life.None) {
        body.appendChild(make('p', 'ex-empty', 'Hier lebt noch nichts.'));
        return el;
      }
      const stage = world.stage(i, cls);
      const hero = make('div', 'ex-hero');
      const text = make('div', 'ex-hero-text');
      text.append(make('div', 'ex-title', SUBSPECIES[cls][stage]), make('div', 'ex-sub', `${LIFE[cls].name} · Unterart ${stage + 1} von ${SUBSPECIES_PER_CLASS}`));
      hero.append(this.blit(this.portraits.get(`l${cls}_${stage}`, LIFE_SPRITES[cls][stage]), 'ex-portrait'), text);
      body.appendChild(hero);
      const density = world.density(i, cls);
      const age = ExaminePanel.roughAge(world, cls);
      body.appendChild(this.grid([
        ['Bestand', `${LifeSystem.habitatLabel(density)} (${fmt.int(density * 100)} %)`],
        ['Verbreitung', fmt.pct(world.lifeCounts[cls] / TILE_COUNT)],
        ['Alter der Gruppe', age < 0 ? '—' : formatYears(age)],
      ]));
      const n = nodeForLife(cls);
      if (n) {
        const b = button({ label: 'Im Evolutionsbaum', icon: uiIcon('evolution'), cls: 'btn btn-small btn-ghost', onClick: () => this.onShowInTree?.(n.id) });
        b.dataset.focusKey = 'tree';
        body.appendChild(b);
      }

      // How this class fares in each habitat — why it lives here and not
      // there — with the names on screen, not only in a tooltip.
      const suit = LIFE[cls].suit;
      const list = make('div', 'ex-suit');
      const none: string[] = [];
      for (let b = 0; b < BIOME_COUNT; b++) {
        const v = suit[b];
        if (v <= 0) { none.push(BIOME_NAMES[b]); continue; }
        const item = make('div', 'ex-suit-item');
        item.title = `${BIOME_NAMES[b]}: ${this.verdict(v)}`;
        const bar = make('span', 'ex-suit-bar');
        bar.style.setProperty('--v', String(v));
        item.append(img(habitatAsset(BIOME_ICONS[b])), make('span', undefined, `${BIOME_NAMES[b]} – ${this.verdict(v)}`), bar);
        list.appendChild(item);
      }
      body.append(make('div', 'ex-sub', 'Eignung der Lebensräume'), list);
      if (none.length > 0) body.appendChild(make('div', 'ex-suit-none', `Kann nicht leben in: ${none.join(', ')}`));
      return el;
    }

    private verdict(suit: number): string {
      if (suit <= 0) return 'kann hier nicht leben';
      if (suit <= 0.30) return 'überlebt knapp';
      if (suit <= 0.55) return 'kommt zurecht';
      if (suit <= 0.80) return 'gedeiht';
      return 'ideal';
    }

    private speciesStrip(world: WorldState, i: number, species: readonly Life[]): HTMLElement {
      const strip = make('div', 'ex-species');
      if (species.length === 0) return strip;
      strip.appendChild(make('span', 'ex-species-label', 'Auf diesem Feld:'));
      const total = world.tileBiomass[i] || 1;
      for (const c of species) {
        const share = (world.density(i, c) / total) * 100;
        const chip = button({ label: `${LIFE[c].name} ${fmt.int(share)} %`, cls: 'chip-btn', onClick: () => this.select(c) });
        chip.dataset.focusKey = `species:${c}`;
        const dot = make('span', 'chip-dot');
        dot.style.background = rgbCss(LIFE[c].color);
        chip.prepend(dot);
        setPressed(chip, c === this.selected);
        strip.appendChild(chip);
      }
      return strip;
    }

    private footer(world: WorldState, i: number, x: number, y: number): HTMLElement {
      const foot = make('div', 'ex-foot');
      const lat = latitudeDeg(y);
      foot.append(
        make('span', undefined, `Feld ${x} / ${y} · ${fmt.int(Math.abs(lat))}° ${lat >= 0 ? 'N' : 'S'}`),
        make('span', undefined, `Magma ${fmt.int(world.magma[i] * 30)} cm/Jahr`),
      );
      if (world.tech[i] !== Tech.None) foot.appendChild(make('span', undefined, `${TECH_NAMES[world.tech[i]]}-Stadt, ${fmt.int(world.cityPop[i] * 100)} %`));
      if (world.eventTtl[i] > 0) foot.appendChild(make('span', 'ex-event', `Ereignis: ${EVENT_NAMES[world.eventKind[i]]}`));
      return foot;
    }

    /** Copy a cached atlas sprite into a fresh canvas (cloneNode leaves it blank). */
    private blit(src: HTMLCanvasElement, cls: string): HTMLCanvasElement {
      const c = make('canvas', cls);
      c.width = src.width;
      c.height = src.height;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(src, 0, 0);
      }
      return c;
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
          make('div', 'chron-when', `Planetenalter ${formatYears(e.years)}`),
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
