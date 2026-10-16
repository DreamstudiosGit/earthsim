/* Fast-forward a fresh planet to a living one, for screenshots.
 * URL parameters (all optional): ticks=3000, seed=<n>, epoch=<id> (see
 * src/epochs.ts), zoom=<px per tile>, x=<tile> y=<tile> (centre),
 * terrain=legacy (read by the renderer).
 * `previewAdvance(n)` plays n more ticks the same way, for an age series. */
window.addEventListener('load', () => {
  const app = SE.app;
  const q = new URLSearchParams(location.search);
  // Straight to the planet: the title screen would cover the screenshot.
  if (app.title) app.title.close();
  if (q.has('seed')) app.world.seed = Number(q.get('seed')) >>> 0;
  // Not saved: the settings only reach storage when the player changes one.
  if (SE.isEpochId(q.get('epoch'))) app.settings.epoch = q.get('epoch');
  if (q.has('seed') || q.has('epoch')) app.newPlanet({ quiet: true, keepSeed: true });
  // Play the evolution tree the way an eager player would: develop the
  // cheapest available step every few ticks.
  window.previewAdvance = (n) => {
    for (let t = 0; t < n; t++) {
      app.tick();
      if (t % 5 !== 0) continue;
      app.evolution.refresh(app.world, app.params, true);
      const ids = app.evolution.availableIds().sort((a, b) => SE.evoNode(a).cost - SE.evoNode(b).cost);
      if (ids.length) app.developNode(ids[0]);
    }
    app.editView.markDirty();
  };
  app.developNode('cells');
  window.previewAdvance(q.has('ticks') ? Number(q.get('ticks')) : 3000);
  if (q.has('zoom')) app.editView.tilePx = Number(q.get('zoom'));
  app.editView.centerOn(q.has('x') ? Number(q.get('x')) : SE.GRID_W * 0.35 | 0, q.has('y') ? Number(q.get('y')) : SE.GRID_H * 0.42 | 0);
  document.title = 'ready';
});
