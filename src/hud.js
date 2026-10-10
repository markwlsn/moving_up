// HUD: date/time/weather/money panel (top-right), energy bar (bottom-left), tool panel (bottom-right).
export function createHud(cfg, { width, height }) {
  const hud = {};

  function panel(ctx, x, y, lines) {
    const w = Math.max(...lines.map((l) => ctx.measureText(l.text).width)) + 12;
    if (x < 0) x = width - w + x; // negative x = offset from right edge
    ctx.fillStyle = cfg.panelColor;
    ctx.fillRect(x, y, w, lines.length * 10 + 6);
    lines.forEach((l, i) => {
      ctx.fillStyle = l.color || cfg.textColor;
      ctx.fillText(l.text, x + 6, y + 4 + i * 10);
    });
    return lines.length * 10 + 6;
  }

  hud.render = function (ctx, { clock, energy, weather, toolbar, wallet, inventory, todayFiesta }) {
    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    // Date/time/weather/money panel (top-right)
    const d = clock.date();
    const rightLines = [
      { text: `${d.weekday}, Day ${d.dayOfPart}` },
      { text: d.part.name, color: d.part.color },
      { text: clock.timeText(), color: clock.isLate() ? cfg.lateColor : cfg.textColor },
      { text: weather.label(), color: weather.isRaining() ? cfg.rainLabelColor : cfg.sunLabelColor },
      { text: `₱${wallet ? wallet.get() : 0}`, color: '#a3e635' },
    ];
    if (todayFiesta) {
      rightLines.push({ text: `🎉 ${todayFiesta.name}!`, color: '#ffd54f' });
    }
    panel(ctx, -4, 4, rightLines);

    // Tool panel (bottom-right)
    const tool = toolbar.tool();
    const lines = [{ text: `Tool: ${tool.name}  [Q/E]` }];
    if (tool.id === 'seeds') {
      const c = toolbar.seed();
      const inSeason = c.seasons.includes(d.part.id);
      const count = inventory ? inventory.count(`seed_${c.id}`) : 0;
      lines.push({
        text: `Seeds: ${c.name} [x${count}] [R]`,
        color: inSeason && count > 0 ? cfg.textColor : cfg.energyLowColor,
      });
    }
    lines.push({ text: `Bag: [I]  •  Phone: [P]`, color: '#f8e3b6' });
    panel(ctx, -4, height - lines.length * 10 - 10, lines);

    // Energy bar (bottom-left)
    const bw = 80, bh = 8, bx = 6, by = height - bh - 16;
    ctx.fillStyle = cfg.panelColor;
    ctx.fillRect(bx - 3, by - 11, bw + 6, bh + 15);
    ctx.fillStyle = cfg.textColor;
    ctx.fillText(`Energy ${energy.value}/${energy.max}`, bx, by - 9);
    ctx.fillStyle = cfg.energyBackColor;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = energy.ratio() <= 0.25 ? cfg.energyLowColor : cfg.energyColor;
    ctx.fillRect(bx, by, Math.round(bw * energy.ratio()), bh);
  };

  return hud;
}
