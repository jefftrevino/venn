export function geometry(n) {
  const S = 600;
  const C = S / 2;
  const Rt = { 1: 195, 2: 188, 3: 176, 4: 160, 5: 148, 6: 138 };
  const R = Rt[n] !== undefined ? Rt[n] : 126;
  const D = n === 1 ? 0 : R * 0.6;
  const centers = [];
  for (let i = 0; i < n; i++) {
    const ang = (-90 + i * 360 / n) * Math.PI / 180;
    centers.push({ x: C + D * Math.cos(ang), y: C + D * Math.sin(ang), ang });
  }
  return { S, C, R, centers, n };
}

export function defaultRel(center, idx, count, n) {
  let ox, oy;
  if (n === 1) {
    ox = 0;
    oy = -0.12;
  } else {
    ox = Math.cos(center.ang) * 0.42;
    oy = Math.sin(center.ang) * 0.42;
  }
  const spread = (idx - (count - 1) / 2) * 0.17;
  let rx = ox;
  let ry = oy + spread;
  const m = Math.hypot(rx, ry);
  const max = 0.76;
  if (m > max) {
    rx = rx / m * max;
    ry = ry / m * max;
  }
  return { rx, ry };
}
