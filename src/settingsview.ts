/* =============================================================================
 * SimEarth 2.0 — settings
 * -----------------------------------------------------------------------------
 * The player's lasting preferences, defined once and shown twice: as check
 * items in the "Optionen" menu, and as the "Einstellungen" dialog on the title
 * screen, where the menu bar is out of reach.
 * ========================================================================== */

namespace SE {
  export interface SettingOption {
    readonly label: string;
    readonly icon: string;
    readonly on: () => boolean;
    readonly choose: () => void;
  }

  /** A yes/no preference, or one choice among options. `group` starts a new block. */
  export type SettingDef = { readonly group?: boolean } & (
    | { readonly kind: 'toggle'; readonly label: string; readonly icon: string; readonly on: () => boolean; readonly toggle: () => void }
    | { readonly kind: 'choice'; readonly label: string; readonly options: readonly SettingOption[] }
  );

  /** The settings as check items of a menu, with separators between blocks. */
  export function settingMenuItems(defs: readonly SettingDef[]): MenuItem[] {
    const items: MenuItem[] = [];
    for (const d of defs) {
      if (d.group && items.length > 0) items.push({ separator: true, label: '' });
      if (d.kind === 'toggle') items.push({ label: d.label, icon: d.icon, action: d.toggle, checked: d.on });
      else for (const o of d.options) items.push({ label: o.label, icon: o.icon, action: o.choose, checked: o.on });
    }
    return items;
  }

  let settingSeq = 0;

  /** The "Einstellungen" dialog: every change applies at once, "Fertig" only closes it. */
  export async function openSettings(defs: readonly SettingDef[]): Promise<void> {
    const body = make('div', 'settings');
    const inputs: { input: HTMLInputElement; on: () => boolean }[] = [];
    const sync = (): void => { for (const i of inputs) i.input.checked = i.on(); };

    const row = (type: 'checkbox' | 'radio', label: string, icon: string, on: () => boolean, change: () => void, name?: string): HTMLElement => {
      const id = `setting-${++settingSeq}`;
      const input = document.createElement('input');
      input.type = type;
      input.id = id;
      if (name) input.name = name;
      input.addEventListener('change', () => { change(); sync(); });
      inputs.push({ input, on });
      const text = make('label', 'settings-label', label);
      text.htmlFor = id;
      const line = make('div', 'settings-row');
      line.append(input, img(icon), text);
      return line;
    };

    for (const d of defs) {
      if (d.kind === 'toggle') {
        const line = row('checkbox', d.label, d.icon, d.on, d.toggle);
        line.classList.toggle('settings-group', !!d.group);
        body.appendChild(line);
        continue;
      }
      const set = make('fieldset', `settings-choice${d.group ? ' settings-group' : ''}`);
      set.appendChild(make('legend', 'settings-legend', d.label));
      const name = `setting-choice-${++settingSeq}`;
      for (const o of d.options) set.appendChild(row('radio', o.label, o.icon, o.on, o.choose, name));
      body.appendChild(set);
    }
    sync();
    await Modal.show({ title: 'Einstellungen', icon: uiIcon('menu-options'), body, actions: [{ label: 'Fertig', value: 'ok', kind: 'primary' }] });
  }
}
