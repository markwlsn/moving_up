// Keyboard state tracker. Uses event.code so WASD works on any keyboard layout position.
const KEYMAP = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  debug: ['F3', 'Backquote'],
  interact: ['Space', 'KeyJ'],
  cancel: ['Escape', 'KeyK'],
  debugSkipHour: ['BracketRight'],
  debugDrain: ['Minus'],
  debugGrow: ['Equal'],
  toolPrev: ['KeyQ'],
  toolNext: ['KeyE'],
  seedNext: ['KeyR'],
  inventory: ['KeyI', 'Tab'],
  save: ['F5'],
  load: ['F9'],
  phone: ['KeyP'],
  help: ['F1', 'KeyH'],
  action1: ['Digit1'],
  action2: ['Digit2'],
};

const held = new Set();
const pressedThisTick = new Set();

window.addEventListener('keydown', (e) => {
  if (Object.values(KEYMAP).flat().includes(e.code)) e.preventDefault();
  if (!held.has(e.code)) pressedThisTick.add(e.code);
  held.add(e.code);
});
window.addEventListener('keyup', (e) => held.delete(e.code));
window.addEventListener('blur', () => held.clear());

export function isDown(action) {
  return KEYMAP[action].some((c) => held.has(c));
}

export function wasPressed(action) {
  return KEYMAP[action].some((c) => pressedThisTick.has(c));
}

// Call once at the end of each update tick.
export function endTick() {
  pressedThisTick.clear();
}
