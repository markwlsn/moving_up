// Debug overlay. Toggle with F3 or backtick (`).
// Debug-only keys (work only while overlay is visible): ] = skip 1 hour, - = drain energy.
export function createDebug(cfg) {
  const d = { visible: cfg.visibleOnStart };

  d.render = function (ctx, { fps, player, clock, camera, map, energy }) {
    if (!d.visible) return;
    const t = player.tile();
    const lines = [
      `FPS: ${fps.toFixed(0)}`,
      `Pos: ${player.x.toFixed(1)}, ${player.y.toFixed(1)} (${player.facing})`,
      `Tile: ${t.x}, ${t.y} [${map.tileAt(t.x, t.y)}]`,
      `Cam: ${camera.x}, ${camera.y}  Map: ${map.name}`,
      `Day ${clock.day}  ${clock.timeText()}${clock.paused ? ' (paused)' : ''}`,
      `Energy: ${energy.value}`,
      `] +1 hour   - drain energy   F3 hide`,
    ];
    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 8;
    ctx.fillStyle = cfg.panelColor;
    ctx.fillRect(2, 2, w, lines.length * 10 + 4);
    ctx.fillStyle = cfg.textColor;
    lines.forEach((l, i) => ctx.fillText(l, 6, 5 + i * 10));
  };

  return d;
}
