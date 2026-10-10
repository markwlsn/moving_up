// Short messages shown near the bottom of the screen (e.g. "+1 Talong").
export function createToast(cfg, { width, height }) {
  const t = { items: [] };
  t.show = (text) => {
    if (!text) return;
    t.items.push({ text, life: cfg.toastSeconds });
    if (t.items.length > 3) t.items.shift();
  };
  t.update = (dt) => {
    t.items.forEach((i) => (i.life -= dt));
    t.items = t.items.filter((i) => i.life > 0);
  };
  t.render = (ctx) => {
    ctx.font = '8px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    t.items.forEach((item, idx) => {
      const y = height - 50 - (t.items.length - 1 - idx) * 13;
      const w = ctx.measureText(item.text).width + 12;
      ctx.globalAlpha = Math.min(1, item.life / 0.3);
      ctx.fillStyle = cfg.panelColor;
      ctx.fillRect(width / 2 - w / 2, y - 6, w, 12);
      ctx.fillStyle = cfg.textColor;
      ctx.fillText(item.text, width / 2, y);
      ctx.globalAlpha = 1;
    });
    ctx.textAlign = 'left';
  };
  return t;
}
