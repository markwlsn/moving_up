// Fixed-timestep loop: update() runs at a constant rate, render() runs every frame
// with an interpolation factor (alpha) for smooth motion on any refresh rate.
export function startLoop({ ticksPerSecond, update, render }) {
  const step = 1 / ticksPerSecond;
  const maxFrame = 0.25; // avoid "spiral of death" after tab switch
  let last = performance.now() / 1000;
  let acc = 0;

  // FPS measurement (rendered frames per second)
  let frames = 0, fpsTimer = 0, fps = 0;

  function frame(nowMs) {
    const now = nowMs / 1000;
    let dt = now - last;
    last = now;
    if (dt > maxFrame) dt = maxFrame;
    acc += dt;

    while (acc >= step) {
      update(step);
      acc -= step;
    }

    frames++;
    fpsTimer += dt;
    if (fpsTimer >= 0.5) {
      fps = frames / fpsTimer;
      frames = 0;
      fpsTimer = 0;
    }

    render(acc / step, fps);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
