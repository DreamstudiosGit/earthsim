/* =============================================================================
 * SimEarth 2.0 — title screen
 * -----------------------------------------------------------------------------
 * The first thing the player sees: their freshly formed planet turning in
 * space, the name of the game, and the ways in — continue the last world,
 * begin this one (or let another one form), or pick a save. The simulation
 * stays paused until the player chooses.
 * ========================================================================== */

namespace SE {
  export interface TitleHooks {
    world(): WorldState;
    /** The automatic save to offer, if there is one. */
    readonly autosave: SaveMeta | null;
    /** Load the automatic save; true on success. */
    continueGame(): Promise<boolean>;
    /** Replace the waiting planet with a new one. */
    reroll(): void;
    /** Sea share new planets are made with, 0..1. */
    readonly oceanShare: number;
    /** Remake the waiting planet from its own seed with another sea share. */
    reshape(oceanShare: number): void;
    /** The Saves dialog; true if a planet was loaded from it. */
    openSaves(): Promise<boolean>;
    /** The title is gone: start playing. */
    start(): void;
  }

  /** Radians the title globe turns per frame drawn. */
  const SPIN_STEP = 0.004;
  const FRAME_MS = 33;
  /**
   * Remaking a planet takes about 30 ms, so a dragged sea slider remakes it at
   * most this often; the share it ends on is always applied.
   */
  const RESHAPE_MS = 90;

  export class TitleScreen {
    private readonly root: HTMLElement;
    private readonly canvas: HTMLCanvasElement;
    private globe: MapView;
    private last = 0;
    private closed = false;
    private reshapeTimer = 0;
    private pendingShare = 0;

    constructor(host: HTMLElement, private readonly hooks: TitleHooks) {
      this.root = make('div', 'title-screen');
      this.root.setAttribute('role', 'dialog');
      this.root.setAttribute('aria-modal', 'true');
      this.root.setAttribute('aria-labelledby', 'title-name');

      const stage = make('div', 'title-globe');
      this.canvas = make('canvas', 'title-globe-canvas');
      this.canvas.setAttribute('aria-hidden', 'true');
      stage.appendChild(this.canvas);
      this.globe = this.makeGlobe();

      const panel = make('div', 'title-panel');
      const name = make('h1', 'title-name');
      name.id = 'title-name';
      name.append(make('span', undefined, 'SimEarth'), make('span', 'title-ver', '2.0'));
      const tag = make('p', 'title-tag', 'Der lebende Planet');
      const lead = make('p', 'title-lead', 'Lass aus den ersten Zellen einen lebendigen Planeten wachsen. Entwickle Pflanzen und Tiere, lenke Klima und Atmosphäre – und begleite vielleicht eines Tages eine Zivilisation.');

      const actions = make('div', 'title-actions');
      const resume = hooks.autosave ? this.continueCard(hooks.autosave) : null;
      if (resume) actions.appendChild(resume);
      const start = button({
        label: hooks.autosave ? 'Diesen neuen Planeten beginnen' : 'Planet erwecken', icon: uiIcon('play'),
        cls: `btn ${hooks.autosave ? '' : 'btn-primary '}btn-wide title-start`, onClick: () => this.begin(),
      });
      const sea = buildOceanSlider(hooks.oceanShare, (share) => this.reshape(share));
      const row = make('div', 'title-row');
      row.append(
        button({ label: 'Anderer Planet', icon: uiIcon('new-planet'), cls: 'btn btn-ghost', title: 'Einen neuen Planeten aus Staub und Gas formen', onClick: () => this.reroll() }),
        button({ label: 'Spielstände …', icon: uiIcon('slot'), cls: 'btn btn-ghost', onClick: () => void this.saves() }),
      );
      actions.append(sea.el, start, row);

      const keys = make('ul', 'title-keys');
      for (const [key, what] of [['E', 'Evolutionsbaum'], ['M', 'Übersichtskarte'], ['Leertaste', 'Pause']]) {
        const li = make('li');
        li.append(make('kbd', undefined, key), make('span', undefined, what));
        keys.appendChild(li);
      }
      panel.append(name, tag, lead, actions, keys);
      const credit = make('p', 'title-credit', 'Ein moderner Nachfolger von SimEarth: The Living Planet (Maxis, 1990).');
      this.root.append(stage, panel, credit);
      host.appendChild(this.root);
      // The game behind stays out of reach of Tab and screen readers; the
      // dialog layer does not, because the Saves dialog opens from here.
      this.setBackgroundInert(true);
      window.requestAnimationFrame(this.loop);
      (resume ?? start).focus({ preventScroll: true });
    }

    private makeGlobe(): MapView {
      const view = new MapView(this.canvas);
      view.globe = true;
      view.space = false;
      view.pixelScale = 0.5;
      view.mode = MapMode.Terrain;
      view.spin = 2.4;
      return view;
    }

    private continueCard(meta: SaveMeta): HTMLElement {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'title-continue';
      const text = make('div', 'title-continue-text');
      text.append(make('span', 'title-continue-kicker', 'Weiterspielen'), ...saveSummary(meta));
      b.append(saveThumb(meta, true), text, img(uiIcon('chevron-right'), 'ico title-continue-go'));
      b.addEventListener('click', () => void this.continueGame());
      return b;
    }

    private async continueGame(): Promise<void> {
      if (await this.hooks.continueGame()) this.close();
    }

    private async saves(): Promise<void> {
      if (await this.hooks.openSaves()) this.close();
    }

    private reshape(share: number): void {
      this.pendingShare = share;
      if (this.reshapeTimer) return;
      this.reshapeTimer = window.setTimeout(() => {
        this.reshapeTimer = 0;
        if (!this.closed) this.hooks.reshape(this.pendingShare);
      }, RESHAPE_MS);
    }

    /** Apply a sea share still waiting out the throttle, so it is not lost. */
    private flushReshape(): void {
      if (!this.reshapeTimer) return;
      window.clearTimeout(this.reshapeTimer);
      this.reshapeTimer = 0;
      this.hooks.reshape(this.pendingShare);
    }

    private begin(): void {
      this.flushReshape();
      this.close();
    }

    private reroll(): void {
      this.flushReshape();
      this.hooks.reroll();
      const spin = this.globe.spin;
      this.globe = this.makeGlobe();
      this.globe.spin = spin;
    }

    private loop = (now: number): void => {
      if (this.closed) return;
      if (now - this.last >= FRAME_MS) {
        this.last = now;
        this.globe.spin += SPIN_STEP;
        this.globe.render(this.hooks.world());
      }
      window.requestAnimationFrame(this.loop);
    };

    private setBackgroundInert(on: boolean): void {
      document.querySelectorAll<HTMLElement>('#topbar, #desktop').forEach((el) => { el.inert = on; });
    }

    close(): void {
      if (this.closed) return;
      this.closed = true;
      // A loaded save must not be overwritten by a slider move still pending.
      window.clearTimeout(this.reshapeTimer);
      this.setBackgroundInert(false);
      this.root.classList.add('leaving');
      window.setTimeout(() => this.root.remove(), 480);
      this.hooks.start();
    }
  }
}
