/** Shared measures and colour helpers of the town drawing (front view in layers, D-03). */
export const W = 1280;
export const H = 340;
/** Top of the pavement: everything stands on this line. */
export const GROUND = 252;
export const INK = '#1C2A4A';

type RGB = [number, number, number];
const SKY: [number, RGB, RGB][] = [
  [4.5, [22, 30, 66], [45, 55, 105]],
  [6, [120, 110, 170], [255, 190, 150]],
  [7.5, [140, 195, 245], [255, 225, 190]],
  [9, [120, 190, 250], [205, 235, 255]],
  [16.5, [120, 190, 250], [205, 235, 255]],
  [18.5, [240, 150, 120], [255, 214, 160]],
  [20, [100, 85, 160], [235, 140, 130]],
  [21.5, [30, 40, 85], [70, 70, 130]],
  [24, [22, 30, 66], [45, 55, 105]],
];
const mix = (a: RGB, b: RGB, k: number): string => `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * k)).join(',')})`;

export function skyAt(h: number): [string, string] {
  for (let i = 1; i < SKY.length; i++) {
    const [h1, t1, b1] = SKY[i]!;
    const [h0, t0, b0] = SKY[i - 1]!;
    if (h <= h1) {
      const k = Math.max(0, (h - h0) / (h1 - h0));
      return [mix(t0, t1, k), mix(b0, b1, k)];
    }
  }
  const last = SKY[SKY.length - 1]!;
  return [mix(last[1], last[1], 0), mix(last[2], last[2], 0)];
}

/** 0 in full daylight, 1 in the middle of the night (dusk 17.5–21 h, dawn 5–7.5 h). */
export function nightAt(h: number): number {
  if (h >= 21 || h < 5) return 1;
  if (h >= 17.5) return (h - 17.5) / 3.5;
  if (h < 7.5) return 1 - (h - 5) / 2.5;
  return 0;
}
