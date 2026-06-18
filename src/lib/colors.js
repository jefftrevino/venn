const HUES = [255, 24, 150, 305, 85, 195, 335, 55];

export function colorFor(i) {
  const h = HUES[i % HUES.length];
  return {
    stroke: `oklch(0.62 0.13 ${h})`,
    fill: `oklch(0.74 0.11 ${h} / 0.42)`,
    fillActive: `oklch(0.74 0.13 ${h} / 0.6)`,
    solid: `oklch(0.56 0.16 ${h})`,
  };
}
