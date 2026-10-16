namespace SE {
  /** Reveal the selected field in the free map area; no jump when it is already visible. */
  export function installExamineDock(win: SimWindow, view: EditView, canvas: HTMLCanvasElement, tile: () => { x: number; y: number } | null): () => void {
    const reveal = (): void => {
      const t = tile();
      if (!win.visible || !t) return;
      if (!fitCanvas(canvas)) return;
      const map = canvas.getBoundingClientRect();
      const mobile = map.width <= NARROW_PX;
      // The south pole cannot scroll upwards beyond the map edge: put its sheet above it.
      win.root.classList.toggle('examine-top', mobile && t.y > GRID_H - view.rows / 2);
      const panel = win.root.getBoundingClientRect();
      const pad = view.tilePx / 2 + 12;
      const above = win.root.classList.contains('examine-top');
      const minX = mobile ? pad : panel.right - map.left + pad;
      const maxX = map.width - pad;
      const minY = mobile && above ? panel.bottom - map.top + pad : pad;
      const maxY = mobile && !above ? panel.top - map.top - pad : map.height - pad;
      const dx = ((t.x + 0.5 - view.scrollX + GRID_W / 2) % GRID_W + GRID_W) % GRID_W - GRID_W / 2;
      const px = dx * view.tilePx;
      const py = (t.y + 0.5 - view.scrollY) * view.tilePx;
      const targetX = clamp(px, minX, Math.max(minX, maxX));
      const targetY = clamp(py, minY, Math.max(minY, maxY));
      if (Math.abs(px - targetX) > 0.5 || Math.abs(py - targetY) > 0.5) {
        view.scrollBy((px - targetX) / view.tilePx, (py - targetY) / view.tilePx);
        view.markDirty();
      }
    };
    const observer = new ResizeObserver(reveal);
    observer.observe(win.root);
    observer.observe(canvas);
    return reveal;
  }
}
