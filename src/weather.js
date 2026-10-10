// Minimal weather for Phase 4: each day is "sunny" or "rain" (rolled from the season part's
// rainChance). Full weather (storms, effects on events) comes in Phase 9.
export function createWeather(cfg, { width, height }) {
  const w = { today: 'sunny', _t: 0 };

  w.rollForDay = (date) => {
    w.today = Math.random() < (date.part.rainChance || 0) ? 'rain' : 'sunny';
  };
  w.isRaining = () => w.today === 'rain';
  w.label = () => (w.isRaining() ? 'Rain' : 'Sunny');

  w.update = (dt) => { w._t += dt; };

  w.render = (ctx) => {
    if (!w.isRaining()) return;
    ctx.fillStyle = cfg.rainTint;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = cfg.rainColor;
    const n = cfg.rainDrops;
    for (let i = 0; i < n; i++) {
      // Deterministic pseudo-random per drop, animated by time.
      const seed = (i * 9301 + 49297) % 233280;
      const x = (seed * 7) % width;
      const speed = 180 + (seed % 120);
      const y = ((seed % height) + w._t * speed) % (height + 10) - 10;
      ctx.fillRect(Math.floor(x - y * 0.15) % width, Math.floor(y), 1, 5);
    }
  };

  return w;
}
