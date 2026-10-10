// Farm plots: tilled tiles that can be watered, planted, grown, and harvested.
// Plots are stored sparsely by "x,y". Unwatered crops simply don't grow (no dying; cozy pillar).
export function createFarm(map, crops, cfg) {
  const cropById = Object.fromEntries(crops.map((c) => [c.id, c]));
  const plots = new Map();
  const key = (x, y) => `${x},${y}`;
  const farm = { plots, cropById };

  farm.getPlot = (x, y) => plots.get(key(x, y)) || null;

  const ok = (msg) => ({ ok: true, msg });
  const no = (msg) => ({ ok: false, msg });

  farm.till = (x, y) => {
    if (farm.getPlot(x, y)) return no(null); // already tilled: silently ignore
    if (!map.isTillable(x, y)) return no("You can't dig here.");
    plots.set(key(x, y), { watered: false, crop: null });
    return ok(null);
  };

  farm.water = (x, y) => {
    const p = farm.getPlot(x, y);
    if (!p) return no(null);
    if (p.watered) return no(null);
    p.watered = true;
    return ok(null);
  };

  farm.plant = (x, y, cropId, partId, partName) => {
    const p = farm.getPlot(x, y);
    const c = cropById[cropId];
    if (!p) return no('Till the soil first.');
    if (p.crop) return no(null);
    if (!c.seasons.includes(partId)) return no(`${c.name} won't grow in ${partName}.`);
    p.crop = { id: cropId, growth: 0, ripe: false };
    return ok(null);
  };

  // Returns the crop def if harvested.
  farm.harvest = (x, y) => {
    const p = farm.getPlot(x, y);
    if (!p || !p.crop || !p.crop.ripe) return null;
    const c = cropById[p.crop.id];
    if (c.regrowDays) {
      p.crop.growth = c.growDays - c.regrowDays;
      p.crop.ripe = false;
    } else {
      p.crop = null;
    }
    return c;
  };

  farm.isRipe = (x, y) => !!farm.getPlot(x, y)?.crop?.ripe;

  // Sickle: clears a crop from a plot.
  farm.clear = (x, y) => {
    const p = farm.getPlot(x, y);
    if (!p || !p.crop) return no(null);
    p.crop = null;
    return ok(null);
  };

  // Called once per new day (overnight): watered crops grow, then all soil dries.
  farm.advanceDay = () => {
    for (const p of plots.values()) {
      if (p.crop && p.watered && !p.crop.ripe) {
        p.crop.growth++;
        if (p.crop.growth >= cropById[p.crop.id].growDays) p.crop.ripe = true;
      }
      p.watered = false;
    }
  };

  farm.waterAll = () => { for (const p of plots.values()) p.watered = true; };

  farm.render = (ctx, cam) => {
    const ts = map.tileSize;
    for (const [k, p] of plots) {
      const [tx, ty] = k.split(',').map(Number);
      const x = tx * ts - cam.x, y = ty * ts - cam.y;
      if (x < -ts || y < -ts || x > cam.width || y > cam.height) continue;
      ctx.fillStyle = p.watered ? cfg.wateredColor : cfg.tilledColor;
      ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
      if (!p.crop) continue;

      const c = cropById[p.crop.id];
      const t = p.crop.growth / c.growDays;
      const cx = x + ts / 2;
      if (p.crop.ripe) {
        ctx.fillStyle = cfg.plantColor;
        ctx.fillRect(cx - 4, y + 3, 8, 11);
        ctx.fillStyle = c.color;
        ctx.fillRect(cx - 3, y + 5, 6, 6);
      } else if (t === 0) {
        ctx.fillStyle = cfg.seedColor;
        ctx.fillRect(cx - 1, y + 7, 2, 2);
      } else if (t < 0.5) {
        ctx.fillStyle = cfg.plantColor;
        ctx.fillRect(cx - 1, y + 7, 2, 5);
        ctx.fillRect(cx - 3, y + 7, 2, 2);
      } else {
        ctx.fillStyle = cfg.plantColor;
        ctx.fillRect(cx - 1, y + 4, 2, 9);
        ctx.fillRect(cx - 4, y + 6, 3, 3);
        ctx.fillRect(cx + 1, y + 8, 3, 3);
      }
    }
  };

  return farm;
}
