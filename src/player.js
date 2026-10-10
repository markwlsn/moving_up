import { isDown } from './input.js';

// Placeholder player: a square that moves in 4 directions (no diagonals)
// and collides with solid map tiles. Position is in world pixels.
export function createPlayer(cfg, map) {
  const p = {
    x: 0, y: 0, prevX: 0, prevY: 0,
    size: cfg.size, speed: cfg.speed,
    facing: 'down',
  };

  // Place the player centered on a tile.
  p.placeAtTile = function (tx, ty) {
    const ts = map.tileSize;
    p.x = p.prevX = tx * ts + (ts - p.size) / 2;
    p.y = p.prevY = ty * ts + (ts - p.size) / 2;
  };

  // Move along one axis; if blocked, slide flush against the tile edge.
  function moveAxis(axis, amount) {
    if (amount === 0) return;
    const ts = map.tileSize;
    const nx = axis === 'x' ? p.x + amount : p.x;
    const ny = axis === 'y' ? p.y + amount : p.y;
    if (!map.rectHitsSolid(nx, ny, p.size, p.size)) {
      p[axis] = axis === 'x' ? nx : ny;
      return;
    }
    // Snap to the edge of the blocking tile.
    if (amount > 0) {
      const edge = Math.floor((p[axis] + p.size + amount) / ts) * ts;
      p[axis] = edge - p.size;
    } else {
      const edge = Math.floor((p[axis] + amount) / ts) * ts + ts;
      p[axis] = edge;
    }
  }

  p.update = function (dt, speedMultiplier = 1) {
    p.prevX = p.x;
    p.prevY = p.y;

    // 4-direction: vertical takes priority when two keys are held.
    let dx = 0, dy = 0;
    if (isDown('up')) dy = -1;
    else if (isDown('down')) dy = 1;
    else if (isDown('left')) dx = -1;
    else if (isDown('right')) dx = 1;

    if (dy < 0) p.facing = 'up';
    else if (dy > 0) p.facing = 'down';
    else if (dx < 0) p.facing = 'left';
    else if (dx > 0) p.facing = 'right';

    const speed = p.speed * speedMultiplier;
    moveAxis('x', dx * speed * dt);
    moveAxis('y', dy * speed * dt);
  };

  // The tile directly in front of the player.
  p.facingTile = () => {
    const t = p.tile();
    const off = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[p.facing];
    return { x: t.x + off[0], y: t.y + off[1] };
  };

  // Interpolated position for smooth rendering.
  p.drawPos = (alpha) => ({
    x: p.prevX + (p.x - p.prevX) * alpha,
    y: p.prevY + (p.y - p.prevY) * alpha,
  });

  p.tile = () => ({
    x: Math.floor((p.x + p.size / 2) / map.tileSize),
    y: Math.floor((p.y + p.size / 2) / map.tileSize),
  });

  p.render = function (ctx, alpha, cam) {
    const pos = p.drawPos(alpha);
    const x = Math.round(pos.x) - cam.x;
    const y = Math.round(pos.y) - cam.y;
    ctx.fillStyle = cfg.outlineColor;
    ctx.fillRect(x, y, p.size, p.size);
    ctx.fillStyle = cfg.color;
    ctx.fillRect(x + 1, y + 1, p.size - 2, p.size - 2);

    // Small facing marker so direction is visible
    ctx.fillStyle = cfg.outlineColor;
    const c = Math.floor(p.size / 2) - 1;
    const marks = {
      up: [x + c, y + 2], down: [x + c, y + p.size - 4],
      left: [x + 2, y + c], right: [x + p.size - 4, y + c],
    };
    const [mx, my] = marks[p.facing];
    ctx.fillRect(mx, my, 2, 2);
  };

  return p;
}
