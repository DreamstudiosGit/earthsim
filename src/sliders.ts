/* =============================================================================
 * SimEarth 2.0 — model sliders
 * -----------------------------------------------------------------------------
 * The rows of the four model windows. Each slider shows where the calibrated
 * value sits (a notch), how far it has moved from there (a fill from notch to
 * knob) and what the setting means in words — "Stark · 140 %" — instead of a
 * bare 0..100. Energy sources are shares of a mix and read as such.
 * ========================================================================== */

namespace SE {
  /** Line icon per parameter key. */
  const SLIDER_ICONS: Readonly<Record<string, string>> = {
    drift: 'map-drift', coreHeat: 'overlay-magma', volcanoes: 'model-volcano',
    erosion: 'model-erosion', meteors: 'model-meteor', axialTilt: 'model-tilt',
    solarInput: 'model-sun', greenhouse: 'model-greenhouse', cloudAlbedo: 'layer-clouds',
    surfaceAlbedo: 'model-albedo', thermalTransfer: 'overlay-seaflow', rainfall: 'overlay-rain', zonalRain: 'overlay-rain',
    evolutionRate: 'evolution', mutationRate: 'model-dna', reproductionRate: 'tool-plant',
    tolerance: 'overlay-heat', co2Absorption: 'model-leaf',
    solarWind: 'energy-solar', hydroGeo: 'energy-hydro', fossilFuel: 'energy-fossil', nuclear: 'energy-nuclear',
    agriculture: 'alloc-farming', medicine: 'alloc-medicine', artMedia: 'alloc-art',
    science: 'alloc-science', philosophy: 'alloc-philosophy', military: 'alloc-military',
  };

  export interface SliderPanel {
    readonly el: HTMLElement;
    /** Move every slider to the value the simulation currently holds. */
    sync(): void;
  }

  export interface SliderPanelOptions {
    readonly heading?: string;
    /** The values are shares of one whole (the energy mix), not levels. */
    readonly share?: boolean;
    /** Called after the player moved any slider. */
    readonly onChange?: () => void;
  }

  /** A setting in words, from the 0..1 slider position. */
  function levelWord(v: number): string {
    if (v < 0.1) return 'Minimal';
    if (v < 0.4) return 'Schwach';
    if (v <= 0.6) return 'Normal';
    if (v <= 0.9) return 'Stark';
    return 'Maximal';
  }

  let sliderSeq = 0;

  /**
   * A stack of labelled sliders bound to one parameter object. The object is
   * reset in place (see ModelParams.reset), so the binding survives new
   * planets; `sync` moves the knobs after a load changed the values.
   */
  export function buildSliderPanel<T extends object>(
    target: T, defs: readonly SliderDef<keyof T>[], opts: SliderPanelOptions = {},
  ): SliderPanel {
    const values = target as unknown as Record<string, number>;
    const host = make('section', 'slider-stack');
    const head = make('div', 'slider-head');
    const status = make('span', 'slider-status');
    const reset = button({
      label: 'Standardwerte', icon: uiIcon('arrow-left'), cls: 'btn btn-small btn-ghost slider-reset',
      title: 'Alle Regler dieser Gruppe auf die kalibrierten Ausgangswerte setzen',
      onClick: () => {
        if (!defaultGroup) return;
        for (const d of defs) values[d.key as string] = defaultGroup[d.key as string];
        sync();
        opts.onChange?.();
      },
    });
    head.append(make('h3', 'panel-heading', opts.heading ?? 'Stellgrößen'), status, reset);
    host.appendChild(head);

    const rows: { input: HTMLInputElement; out: HTMLElement; key: string; row: HTMLElement }[] = [];
    const defaults = new ModelParams().groups();
    const defaultGroup = Object.values(defaults).find((g) => defs.every((d) => (d.key as string) in g));
    const isChanged = (key: string, v: number): boolean =>
      !!defaultGroup && Math.abs(v - defaultGroup[key]) > 0.001;

    const describe = (key: string): string => {
      const v = values[key];
      if (!opts.share) return `${levelWord(v)} · ${Math.round(mul(v) * 100)} %`;
      const total = defs.reduce((sum, d) => sum + values[d.key as string], 0);
      return total > 0 ? `${Math.round((v / total) * 100)} % des Mix` : '25 % des Mix';
    };

    /** Write a row's knob, fill, notch and words from the bound value. */
    const paint = (r: (typeof rows)[number]): void => {
      const v = values[r.key];
      const d = defaultGroup ? defaultGroup[r.key] : 0.5;
      r.input.value = String(Math.round(v * 100));
      r.input.style.setProperty('--lo', String(Math.min(v, d)));
      r.input.style.setProperty('--hi', String(Math.max(v, d)));
      r.row.style.setProperty('--def', String(d));
      r.input.setAttribute('aria-valuetext', describe(r.key));
      const text = describe(r.key);
      if (r.out.textContent !== text) r.out.textContent = text;
      r.row.classList.toggle('changed', isChanged(r.key, v));
    };

    const refreshStatus = (): void => {
      const changed = rows.filter((r) => isChanged(r.key, values[r.key])).length;
      status.textContent = changed === 0 ? 'Kalibriert' : `${changed} verändert`;
      status.classList.toggle('changed', changed > 0);
      reset.hidden = changed === 0;
    };

    for (const def of defs) {
      const id = `slider-${++sliderSeq}`;
      const key = def.key as string;
      const row = make('div', 'slider-row');
      const icon = img(uiIcon(SLIDER_ICONS[key] ?? 'menu-models'), 'slider-icon');
      const label = make('label', 'slider-label', def.label);
      label.htmlFor = id;
      const out = make('output', 'slider-value');
      out.setAttribute('for', id);
      const track = make('div', 'slider-track');
      const input = document.createElement('input');
      input.type = 'range';
      input.id = id;
      input.min = '0';
      input.max = '100';
      input.step = '1';
      input.setAttribute('aria-describedby', `${id}-hint`);
      track.appendChild(input);
      const hint = make('div', 'slider-hint', def.hint);
      hint.id = `${id}-hint`;
      const r = { input, out, key, row };
      input.addEventListener('input', () => {
        values[key] = Number(input.value) / 100;
        // Shares move together: one source up means every other's share down.
        if (opts.share) rows.forEach(paint);
        else paint(r);
        refreshStatus();
        opts.onChange?.();
      });
      // Double-click a slider to put just that one back.
      input.addEventListener('dblclick', () => {
        if (!defaultGroup) return;
        values[key] = defaultGroup[key];
        rows.forEach(paint);
        refreshStatus();
        opts.onChange?.();
      });
      row.append(icon, label, out, track, hint);
      host.appendChild(row);
      rows.push(r);
    }

    const sync = (): void => {
      rows.forEach(paint);
      refreshStatus();
    };
    sync();
    return { el: host, sync };
  }
}
