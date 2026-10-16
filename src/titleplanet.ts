/* =============================================================================
 * SimEarth 2.0 — title screen: which planet
 * -----------------------------------------------------------------------------
 * The two mode buttons ("Erde", "Zufallsplanet") and the "Planet anpassen"
 * panel below them: for the Earth its epochs, for a random planet the arrows
 * that leaf through new planets and the sea share. The arrows also go back:
 * every planet seen on this title is remembered by its seed.
 * ========================================================================== */

namespace SE {
  export interface TitlePlanetHooks {
    readonly epoch: EpochId;
    readonly oceanShare: number;
    /** The waiting planet's seed. */
    seed(): number;
    chooseEpoch(id: EpochId): void;
    reshape(share: number): void;
    /** Form a planet never seen before. */
    reroll(): void;
    /** Form the planet of an earlier seed again. */
    remake(seed: number): void;
  }

  export interface TitlePlanet {
    readonly earth: HTMLButtonElement;
    readonly random: HTMLButtonElement;
    readonly panel: HTMLElement;
  }

  const RANDOM_NOTE = 'Ein neuer Planet aus Staub und Gas. Jedes Mal anders.';

  function seedCode(seed: number): string {
    const hex = (seed >>> 0).toString(16).toUpperCase().padStart(8, '0');
    return `${hex.slice(0, 4)}·${hex.slice(4)}`;
  }

  /** A mode button: lit square on the right when chosen, not just another colour. */
  function modeButton(label: string, icon: string, onClick: () => void): HTMLButtonElement {
    const b = button({ label, icon, cls: 'btn title-btn title-mode', onClick });
    const led = make('span', 'title-mode-led');
    led.setAttribute('aria-hidden', 'true');
    b.appendChild(led);
    return b;
  }

  export function buildTitlePlanet(hooks: TitlePlanetHooks): TitlePlanet {
    let epoch = hooks.epoch;
    let lastEarth: EpochId = epoch === 'random' ? 'today' : epoch;
    const seeds = [hooks.seed()];
    let at = 0;

    const earth = modeButton('Erde', uiIcon('globe'), () => pick(lastEarth));
    const random = modeButton('Zufallsplanet', uiIcon('dice'), () => pick('random'));

    const panel = make('section', 'title-custom');
    panel.setAttribute('aria-labelledby', 'title-custom-head');
    const head = make('h2', 'title-custom-head', 'Planet anpassen');
    head.id = 'title-custom-head';
    const body = make('div', 'title-custom-body');
    const choose = make('div', 'title-custom-choose');
    const side = make('div', 'title-custom-side');
    body.append(choose, side);
    panel.append(head, body);

    const browse = make('div', 'title-browse');
    browse.setAttribute('role', 'group');
    browse.setAttribute('aria-label', 'Planeten durchblättern');
    const prev = button({ label: 'Voriger Planet', icon: uiIcon('chevron-right'), cls: 'title-arrow title-arrow-prev', showLabel: false, onClick: () => step(-1) });
    const next = button({ label: 'Nächster Planet', icon: uiIcon('chevron-right'), cls: 'title-arrow', showLabel: false, onClick: () => step(1) });
    const what = make('div', 'title-browse-what');
    what.setAttribute('aria-live', 'polite');
    const kind = make('span', 'title-browse-kind');
    const nr = make('strong', 'title-browse-nr');
    const code = make('span', 'title-browse-code');
    code.title = 'Kennung des Planeten';
    what.append(kind, nr, code);
    browse.append(prev, what, next);

    const epochs = make('div', 'title-epochs');
    epochs.setAttribute('role', 'group');
    epochs.setAttribute('aria-label', 'Epoche');
    const cards = new Map<EpochId, HTMLButtonElement>();
    for (const e of EPOCHS) {
      if (e.id === 'random') continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'title-epoch';
      b.append(make('span', 'title-epoch-name', e.name), make('span', 'title-epoch-when', e.when));
      b.addEventListener('click', () => pick(e.id));
      cards.set(e.id, b);
      epochs.appendChild(b);
    }

    const sea = buildOceanSlider(hooks.oceanShare, (share) => hooks.reshape(share));
    const note = make('div', 'title-note');
    const noteText = make('p', undefined);
    noteText.setAttribute('aria-live', 'polite');
    note.append(img(uiIcon('new-planet')), noteText);

    /** Re-inserting a node blurs it, so leave a host alone that already holds these. */
    const place = (host: HTMLElement, ...kids: HTMLElement[]): void => {
      if (kids.length === host.children.length && kids.every((k, i) => host.children[i] === k)) return;
      host.replaceChildren(...kids);
    };

    const paint = (): void => {
      const e = epochOf(epoch);
      const onEarth = epoch !== 'random';
      setPressed(earth, onEarth);
      setPressed(random, !onEarth);
      for (const [id, b] of cards) setPressed(b, id === epoch);
      panel.classList.toggle('earth', onEarth);
      if (onEarth) {
        place(choose, epochs);
        place(side, ...(e.varies ? [note, browse] : [note]));
      } else {
        place(choose, browse);
        place(side, sea.el, note);
      }
      sea.el.hidden = !e.playerSea;
      noteText.textContent = onEarth ? e.blurb : RANDOM_NOTE;
      kind.textContent = onEarth ? e.name : 'Zufallsplanet';
      nr.textContent = `Nr. ${at + 1}`;
      code.textContent = `#${seedCode(seeds[at])}`;
      const prevHadFocus = document.activeElement === prev;
      prev.disabled = at === 0;
      if (prev.disabled && prevHadFocus) next.focus();
    };

    const pick = (id: EpochId): void => {
      if (id === epoch) return;
      epoch = id;
      if (id !== 'random') lastEarth = id;
      hooks.chooseEpoch(id);
      paint();
    };

    const step = (dir: -1 | 1): void => {
      if (dir < 0) {
        if (at === 0) return;
        at--;
        hooks.remake(seeds[at]);
      } else if (at < seeds.length - 1) {
        at++;
        hooks.remake(seeds[at]);
      } else {
        hooks.reroll();
        seeds.push(hooks.seed());
        at++;
      }
      paint();
    };

    paint();
    return { earth, random, panel };
  }
}
