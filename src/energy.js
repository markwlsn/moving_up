// Player energy. No fail state: at 0 energy the player just moves slower (cozy pillar).
export function createEnergy(cfg) {
  const e = { max: cfg.max, value: cfg.max };
  e.spend = (n) => { e.value = Math.max(0, e.value - n); };
  e.restoreFraction = (f) => { e.value = Math.max(e.value, Math.round(e.max * f)); };
  e.isExhausted = () => e.value <= 0;
  e.speedMultiplier = () => (e.isExhausted() ? cfg.exhaustedSpeedMultiplier : 1);
  e.ratio = () => e.value / e.max;
  return e;
}
