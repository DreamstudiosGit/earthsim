/* =============================================================================
 * SimEarth 2.0 — save slots as cards
 * -----------------------------------------------------------------------------
 * A save shows the planet it holds: a small picture of its habitats, its name
 * and age, how far its evolution has come and when it was saved. Used by the
 * Saves dialog and by the title screen's "continue" card.
 * ========================================================================== */

namespace SE {
  /** The planet picture of a save, or a placeholder when it has none. */
  export function saveThumb(meta: SaveMeta | null, exists: boolean): HTMLElement {
    const box = make('div', 'save-thumb');
    // Meta comes from browser storage: only ever show an inline image from it.
    const thumb = meta?.thumb;
    if (typeof thumb === 'string' && /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(thumb)) {
      box.appendChild(img(thumb, 'save-thumb-img'));
    } else {
      box.appendChild(img(uiIcon(exists ? 'globe' : 'slot'), 'ico'));
    }
    return box;
  }

  /** What a save holds, in two lines and a progress bar. */
  export function saveSummary(meta: SaveMeta): HTMLElement[] {
    const bar = make('div', 'save-progress');
    const fill = make('span');
    fill.style.width = `${Math.round((meta.developed / Math.max(1, meta.totalNodes)) * 100)}%`;
    bar.appendChild(fill);
    return [
      // Saves from before the Earth calendar store no tick count, and their
      // years ran on the old scale; they are re-dated only when loaded.
      make('div', 'save-name', meta.ticks === undefined ? `${meta.name} · älterer Spielstand` : `${meta.name} · ${formatEarthDate(meta.years)}`),
      bar,
      make('div', 'save-meta', `${meta.developed} von ${meta.totalNodes} entwickelt · ${formatDate(meta.savedAt)}`),
    ];
  }

  /** One slot of the Saves dialog. */
  export function saveSlotCard(o: {
    readonly title: string;
    readonly exists: boolean;
    readonly meta: SaveMeta | null;
    readonly legacy: boolean;
    readonly actions: readonly HTMLElement[];
  }): HTMLElement {
    const row = make('div', `save-row${o.exists ? '' : ' empty'}`);
    const info = make('div', 'save-info');
    info.appendChild(make('div', 'save-title', o.title));
    if (!o.exists) info.appendChild(make('div', 'save-meta', 'Leer – hier ist Platz für einen Planeten.'));
    else if (o.meta) info.append(...saveSummary(o.meta));
    else info.appendChild(make('div', 'save-meta', o.legacy ? 'Wird beim Laden in das neue Format übernommen. Die Originaldaten bleiben erhalten.' : 'Vorhanden'));
    const actions = make('div', 'save-actions');
    actions.append(...o.actions);
    row.append(saveThumb(o.meta, o.exists), info, actions);
    return row;
  }
}
