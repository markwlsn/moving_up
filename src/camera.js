// Camera that centers on a target and clamps to map edges.
// If the map is smaller than the screen on an axis, the map is centered on that axis.
export function createCamera(width, height) {
  const cam = { x: 0, y: 0, width, height };

  cam.follow = function (targetX, targetY, map) {
    let x = targetX - width / 2;
    let y = targetY - height / 2;
    x = map.pixelWidth <= width ? (map.pixelWidth - width) / 2 : Math.max(0, Math.min(map.pixelWidth - width, x));
    y = map.pixelHeight <= height ? (map.pixelHeight - height) / 2 : Math.max(0, Math.min(map.pixelHeight - height, y));
    // Round to whole pixels so tiles never shimmer.
    cam.x = Math.round(x);
    cam.y = Math.round(y);
  };

  return cam;
}
