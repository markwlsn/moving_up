// Tile map: loaded from data/maps/<id>.json. Rows are strings; each character maps
// to a tile type via the map's legend; tile types (color, solid) come from data/tiles.json.
export function createMap(mapData, tileDefs) {
  const { width, height, tileSize, legend, rows } = mapData;

  // Validate early so bad data fails loudly instead of rendering garbage.
  if (rows.length !== height) throw new Error(`Map ${mapData.id}: expected ${height} rows, got ${rows.length}`);
  const grid = rows.map((row, y) => {
    if (row.length !== width) throw new Error(`Map ${mapData.id}: row ${y} has ${row.length} chars, expected ${width}`);
    return [...row].map((ch, x) => {
      const name = legend[ch];
      if (!name || !tileDefs[name]) throw new Error(`Map ${mapData.id}: unknown tile '${ch}' at ${x},${y}`);
      return name;
    });
  });

  const map = {
    id: mapData.id,
    name: mapData.name,
    width, height, tileSize,
    pixelWidth: width * tileSize,
    pixelHeight: height * tileSize,
    spawn: mapData.spawn,
    warps: mapData.warps || [],
  };

  map.warpAt = (tx, ty) => (map.warps.find((w) => w.tileX === tx && w.tileY === ty) || null);

  map.tileAt = (tx, ty) => (tx < 0 || ty < 0 || tx >= width || ty >= height ? null : grid[ty][tx]);

  // Optional "action" defined on the tile type (e.g. "sleep"), or null.
  map.tileAction = (tx, ty) => {
    const t = map.tileAt(tx, ty);
    return t ? tileDefs[t].action || null : null;
  };

  map.isTillable = (tx, ty) => {
    const t = map.tileAt(tx, ty);
    return !!(t && tileDefs[t].tillable);
  };

  // Outside the map counts as solid so the player can never leave it.
  map.isSolidTile = (tx, ty) => {
    const t = map.tileAt(tx, ty);
    return t === null || tileDefs[t].solid;
  };

  // True if any solid tile overlaps the given rectangle (pixel coords).
  map.rectHitsSolid = (x, y, w, h) => {
    const x0 = Math.floor(x / tileSize), x1 = Math.floor((x + w - 0.001) / tileSize);
    const y0 = Math.floor(y / tileSize), y1 = Math.floor((y + h - 0.001) / tileSize);
    for (let ty = y0; ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++)
        if (map.isSolidTile(tx, ty)) return true;
    return false;
  };

  // Draw only the tiles visible to the camera.
  map.render = (ctx, cam) => {
    const tx0 = Math.max(0, Math.floor(cam.x / tileSize));
    const ty0 = Math.max(0, Math.floor(cam.y / tileSize));
    const tx1 = Math.min(width - 1, Math.floor((cam.x + cam.width) / tileSize));
    const ty1 = Math.min(height - 1, Math.floor((cam.y + cam.height) / tileSize));
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const def = tileDefs[grid[ty][tx]];
        const px = tx * tileSize - cam.x, py = ty * tileSize - cam.y;
        ctx.fillStyle = def.altColor && (tx + ty) % 2 ? def.altColor : def.color;
        ctx.fillRect(px, py, tileSize, tileSize);
        if (def.detailColor) {
          // Simple placeholder detail so solid tiles read as "objects"
          ctx.fillStyle = def.detailColor;
          ctx.fillRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
        }
      }
    }
  };

  return map;
}
