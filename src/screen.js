// Renders at a fixed internal resolution, then scales up by the largest whole number
// that fits the window (crisp pixels), centered with letterbox bars.
export function createScreen(canvas, width, height, letterboxColor) {
  const ctx = canvas.getContext('2d');
  const screen = { ctx, width, height, scale: 1, offsetX: 0, offsetY: 0 };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const fit = Math.min(canvas.width / width, canvas.height / height);
    screen.scale = fit >= 1 ? Math.floor(fit) : fit;
    screen.offsetX = Math.floor((canvas.width - width * screen.scale) / 2);
    screen.offsetY = Math.floor((canvas.height - height * screen.scale) / 2);
  }

  screen.begin = function () {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = letterboxColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(screen.scale, 0, 0, screen.scale, screen.offsetX, screen.offsetY);
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();
  };
  screen.end = function () {
    ctx.restore();
  };

  window.addEventListener('resize', resize);
  resize();
  return screen;
}
