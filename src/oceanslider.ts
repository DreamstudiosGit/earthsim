/* =============================================================================
 * SimEarth 2.0 — sea share slider
 * -----------------------------------------------------------------------------
 * How much of a new planet lies under the sea, chosen on the title screen and
 * in the "Neuer Planet" dialog. It reads in both shares at once — "58 % Meer ·
 * 42 % Land" — with a small bar of the true proportions beside it, and a notch
 * on the track where an Earth-like planet sits.
 * ========================================================================== */

namespace SE {
  export interface OceanSlider {
    readonly el: HTMLElement;
    readonly input: HTMLInputElement;
    /** The chosen sea share, 0..1. */
    readonly value: number;
  }

  export function oceanShareText(share: number): string {
    const sea = Math.round(share * 100);
    return `${sea} % Meer · ${100 - sea} % Land`;
  }

  let oceanSliderSeq = 0;

  /** `onInput` fires on every step of the knob, with the new sea share. */
  export function buildOceanSlider(initial: number, onInput?: (share: number) => void): OceanSlider {
    const id = `ocean-slider-${++oceanSliderSeq}`;
    const lo = Math.round(OCEAN_SHARE_MIN * 100);
    const hi = Math.round(OCEAN_SHARE_MAX * 100);
    const pos = (percent: number): number => (percent - lo) / (hi - lo);
    const def = pos(Math.round(OCEAN_FRACTION * 100));

    const host = make('div', 'ocean-slider');
    const head = make('div', 'ocean-slider-head');
    const label = make('label', 'ocean-slider-label', 'Meer und Land');
    label.htmlFor = id;
    const bar = make('span', 'ocean-slider-bar');
    bar.setAttribute('aria-hidden', 'true');
    const out = make('output', 'ocean-slider-value');
    out.setAttribute('for', id);
    // Bar and words wrap as one, so on a narrow screen they keep together.
    const reading = make('span', 'ocean-slider-reading');
    reading.append(bar, out);
    head.append(label, reading);

    const track = make('div', 'slider-track ocean-slider-track');
    track.style.setProperty('--def', String(def));
    const input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.min = String(lo);
    input.max = String(hi);
    input.step = '1';
    input.value = String(Math.round(clamp(initial, OCEAN_SHARE_MIN, OCEAN_SHARE_MAX) * 100));
    track.appendChild(input);

    const ends = make('div', 'ocean-slider-ends');
    ends.setAttribute('aria-hidden', 'true');
    ends.append(make('span', undefined, 'Mehr Land'), make('span', undefined, 'Mehr Meer'));
    host.append(head, track, ends);

    const paint = (): void => {
      const percent = Number(input.value);
      const text = oceanShareText(percent / 100);
      out.textContent = text;
      input.setAttribute('aria-valuetext', text);
      bar.style.setProperty('--sea', String(percent / 100));
      const p = pos(percent);
      input.style.setProperty('--lo', String(Math.min(p, def)));
      input.style.setProperty('--hi', String(Math.max(p, def)));
    };
    input.addEventListener('input', () => {
      paint();
      onInput?.(Number(input.value) / 100);
    });
    paint();

    return {
      el: host,
      input,
      get value() { return Number(input.value) / 100; },
    };
  }
}
