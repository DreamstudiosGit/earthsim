/* Fast-forward a fresh planet to a living one, for screenshots. */
window.addEventListener('load', () => {
  const app = SE.app;
  // Straight to the planet: the title screen would cover the screenshot.
  if (app.title) app.title.close();
  // Play the evolution tree the way an eager player would: develop the
  // cheapest available step every few ticks.
  app.developNode('cells');
  for (let t = 0; t < 3000; t++) {
    app.tick();
    if (t % 5 !== 0) continue;
    app.evolution.refresh(app.world, app.params, true);
    const ids = app.evolution.availableIds().sort((a, b) => SE.evoNode(a).cost - SE.evoNode(b).cost);
    if (ids.length) app.developNode(ids[0]);
  }
  app.editView.centerOn(SE.GRID_W * 0.35 | 0, SE.GRID_H * 0.42 | 0);
  document.title = 'ready';
});
