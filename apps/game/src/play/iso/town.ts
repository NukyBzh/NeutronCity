/**
 * The town in isometric view, style B "isometric for children" (D-13): volumes in three tones, bright colours, dark
 * outlines like Cassandra, cars on real wheels. Built as an SVG string from a small world grid, so the same town is
 * shown as a band in the play screen and whole in the shop and the summary (owner's choice, 2026-11-08).
 *
 * World: blocks of 8 × 8 units separated by 3-unit roads (cell = 11). Cell (i, j) covers x ∈ [11i, 11i + 8],
 * y ∈ [11j, 11j + 8]. Screen: x grows to the right-down, y to the left-down, z up. Painter order: rows j, then i.
 */
import type { Mood } from '@neutron/engine';

export type Season = 'ete' | 'printemps' | 'hiver';
export const seasonOf = (dayId: string): Season => (dayId === 'hiver' ? 'hiver' : dayId === 'printemps' ? 'printemps' : 'ete');

export interface TownOptions {
  hour: number;
  season: Season;
  mood: Mood;
  elecOn: boolean;
  heatOn: boolean;
  upgrades: readonly string[];
  /** URLs of the icons used inside the drawing (heart, snowflake, bolt, cross). */
  icons: { coeur: string; froid: string; electricite: string; loin: string };
}

const S = 12;
const OX = 640;
const OY = 0;
const INK = '#1C2A4A';
const P = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 0.866 * S, OY + (x + y) * 0.5 * S - z * S];
const f1 = (v: number): string => v.toFixed(1);
const pts = (arr: [number, number][]): string => arr.map(([a, b]) => `${f1(a)},${f1(b)}`).join(' ');

/** Band shown in the play screen (rows of cells 5 to 8) and the whole town. */
const rowY = (k: number): number => OY + (11 * k + 8) * 0.5 * S;
/** Band: from the river and the plant (left) to the last streets (right), rows 4–9 around the main street. */
export const BAND_VIEWBOX = `-170 ${f1(rowY(8) + 60 - 432)} 1620 432`;
export const FULL_VIEWBOX = '-300 -120 1820 1260';

// ---------- colours ----------
const hex = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]): string => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
const mixHex = (a: string, b: string, k: number): string => { const A = hex(a); const B = hex(b); return toHex(A.map((v, i) => v + (B[i]! - v) * k)); };
const shade = (h: string, k: number): string => toHex(hex(h).map((v) => (k >= 1 ? v + (255 - v) * (k - 1) : v * k)));

/** 0 in full daylight, 1 in the middle of the night (dusk 17.5–21 h, dawn 5–7.5 h). */
export function nightAt(h: number): number {
  if (h >= 21 || h < 5) return 1;
  if (h >= 17.5) return (h - 17.5) / 3.5;
  if (h < 7.5) return 1 - (h - 5) / 2.5;
  return 0;
}

type Kind = 'reactor' | 'cooling' | 'yard' | 'trees' | 'park' | 'houses' | 'flats' | 'brick' | 'tower' | 'shop' | 'school' | 'pink';
/** What stands on each cell of the band (rows 5–8) and around it; other cells get a mix of houses, flats and trees. */
const CELLS: Record<string, Kind> = {
  '0,5': 'reactor', '0,6': 'cooling', '0,7': 'yard', '0,4': 'yard', '1,7': 'trees', '0,8': 'trees',
  '1,6': 'park', '1,5': 'houses', '1,4': 'flats', '2,5': 'brick', '2,4': 'shop', '2,6': 'houses', '2,3': 'tower',
  '3,4': 'school', '3,3': 'pink', '3,5': 'shop', '3,2': 'houses', '4,3': 'tower', '4,2': 'houses', '4,4': 'flats', '4,1': 'brick',
  '5,2': 'houses', '5,1': 'shop', '5,3': 'pink', '5,0': 'tower', '6,1': 'flats', '6,0': 'houses', '6,2': 'brick', '7,0': 'trees', '7,1': 'houses',
  '2,7': 'trees', '3,6': 'houses', '4,5': 'brick', '5,4': 'houses', '6,3': 'shop', '7,2': 'flats', '1,3': 'houses', '2,2': 'flats', '3,1': 'tower', '4,0': 'pink',
};
const FILL: Kind[] = ['houses', 'flats', 'trees', 'pink', 'houses', 'brick', 'trees', 'shop'];
const kindOf = (i: number, j: number): Kind => CELLS[`${i},${j}`] ?? FILL[(i * 7 + j * 3) % FILL.length]!;
const hash = (a: number, b: number, c = 0): number => ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0;

export function drawTown(o: TownOptions, view: 'band' | 'full'): string {
  const night = nightAt(o.hour);
  const winter = o.season === 'hiver';
  const NIGHT = '#0B1440';
  const tone = (c: string): string => (night > 0 ? mixHex(c, NIGHT, 0.5 * night) : c);
  const line = ` stroke="${tone(INK)}" stroke-width="1.3" stroke-linejoin="round"`;
  const poly = (arr: [number, number][], fill: string, extra = ''): string => `<polygon points="${pts(arr)}" fill="${tone(fill)}"${line}${extra}/>`;
  const flatPoly = (arr: [number, number][], fill: string): string => `<polygon points="${pts(arr)}" fill="${tone(fill)}"/>`;
  const darkQuarter = o.mood === 'noir';
  const cold = o.mood === 'froid';
  const happy = o.mood === 'content';
  const lit = night > 0.3;

  const grass = winter ? '#EEF3FA' : o.season === 'printemps' ? '#8FD082' : '#9CC965';
  const leaf = o.season === 'printemps' ? '#5DBB5A' : '#3E9E48';
  const roofTint = (c: string): string => (winter ? mixHex(c, '#FFFFFF', 0.7) : c);

  // ---------- primitives ----------
  function box(x: number, y: number, z: number, w: number, d: number, h: number, color: string, top?: string): string {
    return poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], color)
      + poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], shade(color, 0.78))
      + poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], top ?? (winter ? '#F7FAFE' : shade(color, 1.18)));
  }
  /** Windows on both visible faces; at night most of them light up (not in a dark quarter). */
  function windows(x: number, y: number, w: number, d: number, h: number, floors: number, dark: boolean, seed: number): string {
    let g = '';
    const fh = h / floors;
    const cx = Math.max(2, Math.round(w / 1.8));
    const cy = Math.max(2, Math.round(d / 1.8));
    for (let f = 1; f < floors; f++) {
      const v0 = f * fh + fh * 0.18;
      const v1 = v0 + fh * 0.62;
      for (let side = 0; side < 2; side++) {
        const n = side === 0 ? cx : cy;
        const len = side === 0 ? w : d;
        for (let c = 0; c < n; c++) {
          const cw = len / n;
          const u0 = (side === 0 ? x : y) + c * cw + cw * 0.22;
          const u1 = u0 + cw * 0.56;
          const q: [number, number][] = side === 0
            ? [P(u0, y + d, v0), P(u1, y + d, v0), P(u1, y + d, v1), P(u0, y + d, v1)]
            : [P(x + w, u0, v0), P(x + w, u1, v0), P(x + w, u1, v1), P(x + w, u0, v1)];
          const on = lit && !dark && hash(seed, f, c * 2 + side) % 5 !== 0;
          if (on) g += `<polygon points="${pts(q)}" fill="#FFE08A" stroke="#FFC94D" stroke-width="2.5" stroke-opacity="${0.6 * night}"/>`;
          else g += `<polygon points="${pts(q)}" fill="${tone(side === 0 ? '#BFE3FF' : '#A6CBEA')}" stroke="${tone('#FFFFFF')}" stroke-width="0.8"/>`;
        }
      }
    }
    return g;
  }
  function door(x: number, y: number, w: number, d: number, color = '#1D47B8'): string {
    const u = x + w / 2;
    return poly([P(u - 0.55, y + d, 0), P(u + 0.55, y + d, 0), P(u + 0.55, y + d, 1.7), P(u - 0.55, y + d, 1.7)], color);
  }
  function hipRoof(x: number, y: number, z: number, w: number, d: number, r: number, color: string): string {
    const c = roofTint(color);
    const ry = y + d / 2;
    const t0 = P(x + Math.min(1, w / 4), ry, z + r);
    const t1 = P(x + w - Math.min(1, w / 4), ry, z + r);
    return poly([P(x, y, z), P(x + w, y, z), t1, t0], shade(c, 0.85))
      + poly([P(x, y + d, z), P(x + w, y + d, z), t1, t0], c)
      + poly([P(x + w, y, z), P(x + w, y + d, z), t1], shade(c, 0.72));
  }
  function chimneySmoke(x: number, y: number, z: number): string {
    const [cx, cy] = P(x, y, z);
    const op = cold ? 0.3 : 0.85;
    return `<g class="steam slow" opacity="${op}"><circle cx="${f1(cx)}" cy="${f1(cy - 6)}" r="4" fill="${tone('#EEF1F7')}"/><circle cx="${f1(cx + 4)}" cy="${f1(cy - 14)}" r="5.5" fill="${tone('#EEF1F7')}"/><circle cx="${f1(cx + 1)}" cy="${f1(cy - 24)}" r="6.5" fill="${tone('#EEF1F7')}" opacity="0.7"/></g>`;
  }
  function tree(x: number, y: number, size = 1, cone = false): string {
    const [bx, by] = P(x, y, 0);
    let g = `<ellipse cx="${f1(bx)}" cy="${f1(by + 1)}" rx="${f1(7 * size)}" ry="${f1(3.5 * size)}" fill="#000" opacity="0.15"/>`;
    g += `<rect x="${f1(bx - 1.5 * size)}" y="${f1(by - 12 * size)}" width="${f1(3 * size)}" height="${f1(12 * size)}" fill="${tone('#8A5A3B')}"${line}/>`;
    if (winter) {
      g += `<path d="M${f1(bx)} ${f1(by - 10 * size)} l ${f1(-7 * size)} ${f1(-9 * size)} M${f1(bx)} ${f1(by - 13 * size)} l ${f1(6 * size)} ${f1(-10 * size)} M${f1(bx)} ${f1(by - 12 * size)} v ${f1(-12 * size)}" stroke="${tone('#6B4A33')}" stroke-width="${f1(2 * size)}" stroke-linecap="round"/>`;
      return g;
    }
    if (cone) {
      g += `<polygon points="${f1(bx)},${f1(by - 40 * size)} ${f1(bx - 9 * size)},${f1(by - 9 * size)} ${f1(bx + 9 * size)},${f1(by - 9 * size)}" fill="${tone(leaf)}"${line}/>`;
    } else {
      g += `<circle cx="${f1(bx)}" cy="${f1(by - 19 * size)}" r="${f1(9.5 * size)}" fill="${tone(leaf)}"${line}/><circle cx="${f1(bx - 3 * size)}" cy="${f1(by - 22 * size)}" r="${f1(4.2 * size)}" fill="${tone(shade(leaf, 1.3))}"/>`;
      if (o.season === 'printemps') g += [[-4, -16], [3, -24], [5, -15], [-1, -20]].map(([dx, dy], k) => `<circle cx="${f1(bx + dx! * size)}" cy="${f1(by + dy! * size)}" r="${f1(1.8 * size)}" fill="${k % 2 ? '#FFFFFF' : '#FF9FC0'}"/>`).join('');
    }
    return g;
  }
  function wheel(x: number, y: number, z: number, side: 'x' | 'y'): string {
    const [cx, cy] = P(x, y, z);
    const rot = side === 'y' ? -30 : 30;
    return `<g transform="rotate(${rot} ${f1(cx)} ${f1(cy)})"><ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(0.36 * S)}" ry="${f1(0.42 * S)}" fill="#22283A" stroke="${INK}" stroke-width="1"/><ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(0.2 * S)}" ry="${f1(0.24 * S)}" fill="#D5DCEB"/><ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(0.07 * S)}" ry="${f1(0.08 * S)}" fill="#6B7896"/></g>`;
  }
  /** A car driving along x (to the right-down of the screen), on real wheels; headlights at night. */
  function car(x: number, y: number, color: string): string {
    const w = 2.6; const d = 1.3; const z = 0.32;
    let g = wheel(x + 0.6, y, z, 'y') + wheel(x + w - 0.6, y, z, 'y');
    g += box(x, y, z, w, d, 0.55, color, shade(color, 1.15));
    g += box(x + 0.55, y + 0.15, z + 0.55, 1.4, 1.0, 0.48, '#BFE3FF', '#BFE3FF');
    g += box(x + 0.55, y + 0.15, z + 1.03, 1.4, 1.0, 0.07, color, winter ? '#FFFFFF' : shade(color, 1.15));
    g += wheel(x + 0.6, y + d, z, 'y') + wheel(x + w - 0.6, y + d, z, 'y');
    if (night > 0.4) { const [hx, hy] = P(x + w, y + d / 2, z + 0.3); g += `<ellipse cx="${f1(hx + 18)}" cy="${f1(hy + 10)}" rx="22" ry="8" fill="#FFE9A8" opacity="0.4" transform="rotate(30 ${f1(hx + 18)} ${f1(hy + 10)})"/>`; }
    return g;
  }
  function person(x: number, y: number, shirt: string, k: number): string {
    const [bx, by] = P(x, y, 0);
    let g = `<g class="walker-iso" style="animation-delay:${-k * 3}s">`;
    g += `<rect x="${f1(bx - 2.6)}" y="${f1(by - 11)}" width="5.2" height="8" rx="2.5" fill="${tone(shirt)}" stroke="${tone(INK)}" stroke-width="1"/>`;
    g += `<rect x="${f1(bx - 2.2)}" y="${f1(by - 3.5)}" width="1.7" height="4" fill="${tone('#3B4A6B')}"/><rect x="${f1(bx + 0.5)}" y="${f1(by - 3.5)}" width="1.7" height="4" fill="${tone('#3B4A6B')}"/>`;
    g += `<circle cx="${f1(bx)}" cy="${f1(by - 14)}" r="3.2" fill="${tone('#E8B48A')}" stroke="${tone(INK)}" stroke-width="1"/>`;
    if (winter || cold) g += `<path d="M${f1(bx - 3.2)} ${f1(by - 15)} q 3.2 -5 6.4 0 z" fill="${tone('#1D47B8')}"/><rect x="${f1(bx - 3)}" y="${f1(by - 11.5)}" width="6" height="2" fill="${tone('#E0443E')}"/>`;
    if (cold) g += `<image href="${o.icons.froid}" x="${f1(bx - 7)}" y="${f1(by - 34)}" width="14" height="14"/>`;
    else if (happy) g += `<image href="${o.icons.coeur}" x="${f1(bx - 6)}" y="${f1(by - 32)}" width="12" height="12" class="float"/>`;
    return `${g}</g>`;
  }

  // ---------- buildings by kind ----------
  function building(kind: Kind, X: number, Y: number, i: number, j: number): string {
    const dark = darkQuarter && i - j >= 0;
    const seed = hash(i, j);
    const ac = o.season === 'ete';
    switch (kind) {
      case 'houses': {
        let g = '';
        for (const [dx, dy, col, roof] of [[0.6, 0.8, '#FFF1D0', '#E0443E'], [4.4, 2.6, '#BFE3FF', '#4E66A0']] as const) {
          const x = X + dx; const y = Y + dy; const w = 3.2; const d = 4.6; const h = 3.6;
          g += box(x, y, 0, w, d, h, col) + windows(x, y, w, d, h, 2, dark, seed + dx) + door(x, y, w, d, '#8A4F2D');
          g += box(x + w - 1.1, y + 0.6, h, 0.7, 0.7, 2.6, '#B95E46');
          g += hipRoof(x - 0.25, y - 0.25, h, w + 0.5, d + 0.5, 2.0, roof);
          if (o.heatOn) g += chimneySmoke(x + w - 0.75, y + 0.95, h + 2.6);
          if (o.season === 'printemps') g += flatPoly([P(x + 0.2, y + d + 0.2), P(x + w - 0.2, y + d + 0.2), P(x + w - 0.2, y + d + 0.8), P(x + 0.2, y + d + 0.8)], '#FF6F91');
        }
        return g;
      }
      case 'flats': case 'brick': case 'pink': {
        const col = kind === 'brick' ? '#D9734A' : kind === 'pink' ? '#FF9AA2' : '#FFD166';
        const h = 7 + (seed % 3);
        const x = X + 0.6; const y = Y + 1; const w = 6.8; const d = 6;
        let g = box(x, y, 0, w, d, h, col);
        if (kind === 'brick') for (let k = 1; k < h * 2; k++) g += `<polyline points="${pts([P(x, y + d, k / 2), P(x + w, y + d, k / 2), P(x + w, y, k / 2)])}" stroke="${tone(shade(col, 0.86))}" stroke-width="0.6" fill="none"/>`;
        g += windows(x, y, w, d, h, Math.round(h / 2.2), dark, seed) + door(x, y, w, d);
        if (ac) for (let k = 1; k < 3; k++) { const [ax, ay] = P(x + w * 0.35 * k, y + d, h * 0.45 + k); g += `<rect x="${f1(ax - 5)}" y="${f1(ay - 3)}" width="10" height="6" rx="1" fill="${tone('#E4E7EF')}" stroke="${tone(INK)}" stroke-width="0.8"/>`; }
        if (kind === 'pink') g += hipRoof(x - 0.3, y - 0.3, h, w + 0.6, d + 0.6, 2.6, '#C8553D');
        else if (kind === 'brick') g += box(x + 0.4, y + 0.4, h, w - 0.8, d - 0.8, 2.2, '#4E66A0', winter ? '#F7FAFE' : '#7C8FC0') + box(x + 1.5, y + 1.5, h + 2.2, 0.8, 0.8, 1.1, '#3E5288');
        else g += box(x + 1, y + 1, h, 1.6, 1.2, 0.9, '#8796AE') + box(x + w - 2.6, y + d - 2.4, h, 1.6, 1.4, 0.7, '#8796AE');
        return g;
      }
      case 'tower': {
        const x = X + 1; const y = Y + 1; const w = 6; const d = 6; const h = 11 + (seed % 3);
        let g = box(x, y, 0, w, d, h, '#A9C4E8') + windows(x, y, w, d, h, Math.round(h / 1.9), dark, seed) + door(x, y, w, d);
        g += box(x + 1.5, y + 1.5, h, 2, 2, 1.2, '#8796AE');
        const [ax, ay] = P(x + w - 1, y + 1, h);
        g += `<line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(ax)}" y2="${f1(ay - 22)}" stroke="${tone(INK)}" stroke-width="1.5"/><circle cx="${f1(ax)}" cy="${f1(ay - 23)}" r="2.2" fill="#E0443E"/>`;
        return g;
      }
      case 'shop': {
        const x = X + 0.6; const y = Y + 1.2; const w = 6.8; const d = 5.6; const h = 6;
        let g = box(x, y, 0, w, d, h, '#FFE29A') + windows(x, y, w, d, h, 3, dark, seed);
        g += flatPoly([P(x + 0.4, y + d, 0.2), P(x + w - 0.4, y + d, 0.2), P(x + w - 0.4, y + d, 1.7), P(x + 0.4, y + d, 1.7)], lit && !dark ? '#FFE08A' : '#BFE3FF');
        const n = 9;
        for (let k = 0; k < n; k++) g += poly([P(x + (k * w) / n, y + d, 2.4), P(x + ((k + 1) * w) / n, y + d, 2.4), P(x + ((k + 1) * w) / n, y + d + 1, 1.8), P(x + (k * w) / n, y + d + 1, 1.8)], k % 2 ? '#FFFFFF' : seed % 2 ? '#E0443E' : '#1D47B8');
        g += box(x + 1, y + 1, h, 1.4, 1.2, 0.8, '#8796AE');
        return g;
      }
      case 'school': {
        let g = flatPoly([P(X, Y), P(X + 8, Y), P(X + 8, Y + 8), P(X, Y + 8)], shade(grass, 0.95));
        if (!o.upgrades.includes('ecole')) {
          g += tree(X + 2, Y + 6, 0.8) + tree(X + 6, Y + 2, 0.7, true);
          return g;
        }
        const x = X + 0.8; const y = Y + 1.4; const w = 6.4; const d = 5; const h = 4.6;
        g += box(x, y, 0, w, d, h, '#FFD166') + windows(x, y, w, d, h, 2, dark, seed) + door(x, y, w, d);
        g += hipRoof(x - 0.3, y - 0.3, h, w + 0.6, d + 0.6, 2.4, '#E0443E');
        const [fx, fy] = P(x + w / 2, y + d / 2, h + 2.4);
        g += `<line x1="${f1(fx)}" y1="${f1(fy)}" x2="${f1(fx)}" y2="${f1(fy - 20)}" stroke="${tone(INK)}" stroke-width="1.5"/><polygon points="${f1(fx)},${f1(fy - 20)} ${f1(fx + 10)},${f1(fy - 16)} ${f1(fx)},${f1(fy - 12)}" fill="${tone('#2E9E5B')}"/>`;
        return `<g class="pop">${g}</g>`;
      }
      case 'park': {
        let g = flatPoly([P(X, Y), P(X + 8, Y), P(X + 8, Y + 8), P(X, Y + 8)], shade(grass, 1.08));
        g += flatPoly([P(X + 3, Y), P(X + 5, Y), P(X + 5, Y + 8), P(X + 3, Y + 8)], winter ? '#E4E7EF' : '#F3E6C4');
        if (o.upgrades.includes('fontaine')) {
          g += `<g class="pop">${box(X + 3.1, Y + 3.1, 0, 1.8, 1.8, 0.5, '#D5DCEB')}${flatPoly([P(X + 3.4, Y + 3.4, 0.52), P(X + 4.6, Y + 3.4, 0.52), P(X + 4.6, Y + 4.6, 0.52), P(X + 3.4, Y + 4.6, 0.52)], winter ? '#DDEBFA' : '#5EC4F0')}${box(X + 3.8, Y + 3.8, 0.5, 0.4, 0.4, 1.3, '#D5DCEB')}</g>`;
        }
        const trees: [number, number, boolean][] = o.upgrades.includes('parc')
          ? [[1, 1, false], [1.4, 4.5, true], [1, 7, false], [6.8, 1.4, true], [6.6, 5, false], [7, 7.2, false]]
          : [[1.2, 1.5, false], [6.8, 6.6, true]];
        for (const [tx, ty, c] of trees) g += tree(X + tx, Y + ty, 0.9, c);
        if (o.upgrades.includes('parc')) for (const by of [2.2, 5.6]) g += box(X + 5.4, Y + by, 0.4, 0.5, 1.6, 0.25, '#C27C4A') + box(X + 5.9, Y + by, 0.4, 0.15, 1.6, 0.7, '#C27C4A');
        return g;
      }
      case 'trees': {
        let g = flatPoly([P(X, Y), P(X + 8, Y), P(X + 8, Y + 8), P(X, Y + 8)], shade(grass, 1.04));
        for (let k = 0; k < 4; k++) g += tree(X + 1.5 + (k % 2) * 4.5 + (seed % 2), Y + 1.6 + Math.floor(k / 2) * 4.5, 0.95, (seed + k) % 3 === 0);
        return g;
      }
      case 'yard': {
        let g = flatPoly([P(X, Y), P(X + 8, Y), P(X + 8, Y + 8), P(X, Y + 8)], '#E3ECFF');
        for (const [cx, cy] of [[2, 2.5], [5.5, 2.5]] as const) {
          const [tx, ty] = P(X + cx, Y + cy, 0);
          const [, tt] = P(X + cx, Y + cy, 4);
          g += `<path d="M${f1(tx - 13)} ${f1(ty)} V ${f1(tt)} A 13 6.5 0 0 1 ${f1(tx + 13)} ${f1(tt)} V ${f1(ty)} A 13 6.5 0 0 1 ${f1(tx - 13)} ${f1(ty)} Z" fill="${tone('#F4F6FA')}"${line}/><ellipse cx="${f1(tx)}" cy="${f1(tt)}" rx="13" ry="6.5" fill="${tone(winter ? '#FFFFFF' : '#D5DCEB')}"${line}/>`;
        }
        g += box(X + 1, Y + 5.2, 0, 6, 2, 2.4, '#8EA7D8');
        return g;
      }
      case 'reactor': {
        // Turbine hall (behind) and round reactor building with its dome.
        let g = box(X + 3.8, Y + 0.6, 0, 3.8, 6.8, 4.4, '#8EA7D8') + windows(X + 3.8, Y + 0.6, 3.8, 6.8, 4.4, 2, false, seed);
        const [cx, cy] = P(X + 2.2, Y + 4.2, 0);
        const [, ct] = P(X + 2.2, Y + 4.2, 6);
        const rx = 2.4 * S * 0.95; const ry = rx * 0.5;
        g += `<path d="M${f1(cx - rx)} ${f1(cy)} V ${f1(ct)} A ${f1(rx)} ${f1(ry)} 0 0 1 ${f1(cx + rx)} ${f1(ct)} V ${f1(cy)} A ${f1(rx)} ${f1(ry)} 0 0 1 ${f1(cx - rx)} ${f1(cy)} Z" fill="url(#iso-reactor)"${line}/>`;
        g += `<path d="M${f1(cx - rx)} ${f1(ct)} A ${f1(rx)} ${f1(rx * 0.9)} 0 0 1 ${f1(cx + rx)} ${f1(ct)} A ${f1(rx)} ${f1(ry)} 0 0 1 ${f1(cx - rx)} ${f1(ct)} Z" fill="${winter ? '#FFFFFF' : 'url(#iso-reactor)'}"${line}/>`;
        g += `<rect x="${f1(cx - 5)}" y="${f1(cy - 16)}" width="10" height="14" fill="${tone('#1D47B8')}"${line}/><circle cx="${f1(cx)}" cy="${f1(ct - rx * 0.42)}" r="4.5" fill="#FFC83D"${line}/>`;
        return g;
      }
      case 'cooling': {
        const [x0, y0] = P(X + 4, Y + 4, 0);
        const [, yt] = P(X + 4, Y + 4, 14);
        const rx = 3.6 * S * 0.95; const ry = rx * 0.5;
        let g = `<path d="M${f1(x0 - rx)} ${f1(y0)} C ${f1(x0 - rx * 0.55)} ${f1(y0 - (y0 - yt) * 0.45)} ${f1(x0 - rx * 0.55)} ${f1(y0 - (y0 - yt) * 0.75)} ${f1(x0 - rx * 0.68)} ${f1(yt)} L ${f1(x0 + rx * 0.68)} ${f1(yt)} C ${f1(x0 + rx * 0.55)} ${f1(y0 - (y0 - yt) * 0.75)} ${f1(x0 + rx * 0.55)} ${f1(y0 - (y0 - yt) * 0.45)} ${f1(x0 + rx)} ${f1(y0)} A ${f1(rx)} ${f1(ry)} 0 0 1 ${f1(x0 - rx)} ${f1(y0)} Z" fill="url(#iso-concrete)"${line}/>`;
        g += `<ellipse cx="${f1(x0)}" cy="${f1(yt)}" rx="${f1(rx * 0.68)}" ry="${f1(ry * 0.68)}" fill="${tone(winter ? '#FFFFFF' : '#8796AE')}"${line}/>`;
        g += `<g class="plume">${[[0, -10, 14], [8, -26, 19], [22, -44, 24], [40, -62, 26]].map(([dx, dy, r], k) => `<ellipse cx="${f1(x0 + dx!)}" cy="${f1(yt + dy!)}" rx="${r}" ry="${f1(r! * 0.6)}" fill="#FFFFFF" opacity="${f1((0.95 - k * 0.18) * (1 - 0.4 * night))}"/>`).join('')}</g>`;
        return g;
      }
    }
  }

  // ---------- ground ----------
  const ground: string[] = [];
  const range = view === 'band' ? { i0: -2, i1: 9, j0: 2, j1: 11 } : { i0: -2, i1: 7, j0: 0, j1: 8 };
  const span = (a: number, b: number): [number, number] => [11 * a - 3, 11 * b + 8];
  const [gx0, gx1] = span(range.i0, range.i1);
  const [gy0, gy1] = span(range.j0, range.j1);
  ground.push(flatPoly([P(gx0, gy0), P(gx1, gy0), P(gx1, gy1), P(gx0, gy1)], grass));
  // River along y, left of the plant (cells i = -1).
  ground.push(flatPoly([P(-10.5, gy0), P(-1.5, gy0), P(-1.5, gy1), P(-10.5, gy1)], winter ? '#9FD3EE' : '#5EC4F0'));
  ground.push(flatPoly([P(-1.5, gy0), P(-0.4, gy0), P(-0.4, gy1), P(-1.5, gy1)], winter ? '#FFFFFF' : '#F3E6C4'));
  ground.push(flatPoly([P(-11.6, gy0), P(-10.5, gy0), P(-10.5, gy1), P(-11.6, gy1)], winter ? '#FFFFFF' : '#F3E6C4'));
  for (let k = gy0; k < gy1; k += 6) ground.push(`<polyline points="${pts([P(-6, k), P(-6, k + 2.4)])}" stroke="${tone('#BFE9FA')}" stroke-width="2.5" stroke-linecap="round"/>`);
  const road = winter ? '#8E99B2' : '#7B88A4';
  for (let j = range.j0 - 1; j <= range.j1; j++) ground.push(flatPoly([P(0, 11 * j + 8), P(gx1, 11 * j + 8), P(gx1, 11 * j + 11), P(0, 11 * j + 11)], road));
  for (let i = 0; i <= range.i1; i++) ground.push(flatPoly([P(11 * i + 8, gy0), P(11 * i + 11, gy0), P(11 * i + 11, gy1), P(11 * i + 8, gy1)], road));
  for (let j = range.j0 - 1; j <= range.j1; j++) for (let x = 1; x < gx1; x += 3.6) ground.push(`<polyline points="${pts([P(x, 11 * j + 9.5), P(x + 1.4, 11 * j + 9.5)])}" stroke="${tone('#FFFFFF')}" stroke-width="1.6" stroke-linecap="round"/>`);
  if (o.upgrades.includes('piste')) for (let j = range.j0 - 1; j <= range.j1; j++) ground.push(`<g class="pop">${flatPoly([P(0, 11 * j + 10.2), P(gx1, 11 * j + 10.2), P(gx1, 11 * j + 10.9), P(0, 11 * j + 10.9)], '#2E9E5B')}</g>`);

  // ---------- cells, row by row (painter order), with what moves on the road in front of each row ----------
  const out: string[] = [];
  for (let j = range.j0; j <= range.j1; j++) {
    for (let i = 0; i <= range.i1; i++) {
      const X = 11 * i; const Y = 11 * j;
      out.push(flatPoly([P(X - 0.6, Y - 0.6), P(X + 8.6, Y - 0.6), P(X + 8.6, Y + 8.6), P(X - 0.6, Y + 8.6)], winter ? '#F7FAFE' : '#E4E7EF'));
      // In the band, only the rows around the main street are built (the others stay green), so the view stays clear.
      if (view === 'full' || (i + j >= 4 && i + j <= 9)) out.push(building(kindOf(i, j), X, Y, i, j));
      else out.push(building('trees', X, Y, i, j));
      if (o.upgrades.includes('eclairage') && kindOf(i, j) !== 'cooling') {
        const [lx, ly] = P(X + 8.3, Y + 8.3, 0);
        out.push(`<g class="pop"><line x1="${f1(lx)}" y1="${f1(ly)}" x2="${f1(lx)}" y2="${f1(ly - 26)}" stroke="${tone('#3B4A6B')}" stroke-width="2"/><circle cx="${f1(lx)}" cy="${f1(ly - 27)}" r="3" fill="${lit ? '#FFE27A' : tone('#D5DCEB')}" stroke="${tone(INK)}" stroke-width="1"/>${lit ? `<ellipse cx="${f1(lx)}" cy="${f1(ly)}" rx="16" ry="8" fill="#FFE9A8" opacity="${f1(0.5 * night)}"/>` : ''}</g>`);
      }
    }
    // People on the pavement in front of the row, cars on the road in front of it.
    if (j === 5 || j === 6) {
      out.push(person(11 * 1 + 2, 11 * j + 8.3, '#7B5CD6', j) + person(11 * 2 + 5, 11 * j + 8.3, '#2E9E5B', j + 1) + person(11 * 4 + 3, 11 * j + 8.3, '#FF8A3D', j + 2));
    }
    if (j === 4) out.push(`<g class="iso-car">${car(-12, 11 * j + 9.9, '#E0443E')}</g>`);
    if (j === 6) out.push(`<g class="iso-car slow">${car(-12, 11 * j + 8.4, '#1D47B8')}</g>`);
    if (j === 5) out.push(`<g class="iso-car late">${car(-12, 11 * j + 9.9, '#F2A51F')}</g>`);
  }

  // Links from the plant: heating pipe and power line along the road in front of row 5.
  const pipeY = 11 * 5 + 8.25;
  out.push(`<polyline points="${pts([P(4, pipeY, 0.3), P(80, pipeY, 0.3)])}" stroke="${tone(INK)}" stroke-width="6" stroke-linecap="round"/><polyline points="${pts([P(4, pipeY, 0.3), P(80, pipeY, 0.3)])}" stroke="${tone('#FF8A3D')}" stroke-width="3.5" stroke-linecap="round"/>`);
  if (o.heatOn) out.push(`<polyline class="flow" points="${pts([P(4, pipeY, 0.3), P(80, pipeY, 0.3)])}" stroke="#FFE7CC" stroke-width="1.6" stroke-dasharray="4 12" stroke-linecap="round"/>`);
  const poles = [2, 13, 24, 35, 46, 57, 68];
  const wireY = 11 * 4 + 8.2;
  for (const x of poles) { const [a, b] = P(x, wireY, 0); const [, c] = P(x, wireY, 5); out.push(`<line x1="${f1(a)}" y1="${f1(b)}" x2="${f1(a)}" y2="${f1(c)}" stroke="${tone('#4A5878')}" stroke-width="2"/><line x1="${f1(a - 4)}" y1="${f1(c)}" x2="${f1(a + 4)}" y2="${f1(c)}" stroke="${tone('#4A5878')}" stroke-width="2"/>`); }
  out.push(`<polyline points="${pts(poles.map((x) => P(x, wireY, 5)))}" stroke="${tone(INK)}" stroke-width="1" fill="none"/>`);
  if (o.elecOn) out.push(`<polyline class="flow" points="${pts(poles.map((x) => P(x, wireY, 5)))}" stroke="#FFC83D" stroke-width="2.2" stroke-dasharray="3 12" fill="none" stroke-linecap="round"/>`);

  // Reaction of the dark quarter: a bolt with a cross above it.
  if (darkQuarter) {
    const [qx, qy] = P(40, 40, 12);
    out.push(`<g class="pop"><circle cx="${f1(qx)}" cy="${f1(qy)}" r="40" fill="#FFFFFF" opacity="0.85" stroke="${INK}" stroke-width="2"/><image href="${o.icons.electricite}" x="${f1(qx - 32)}" y="${f1(qy - 32)}" width="64" height="64"/><image href="${o.icons.loin}" x="${f1(qx + 8)}" y="${f1(qy + 6)}" width="34" height="34"/></g>`);
  }

  const snow = winter ? Array.from({ length: 50 }, (_, k) => `<circle class="flake" cx="${f1(-400 + ((k * 197) % 2000))}" cy="${view === 'band' ? f1(rowY(8) - 330) : -230}" r="${f1(1.6 + (k % 3))}" fill="#FFFFFF" opacity="0.9" style="animation-delay:${-((k * 13) % 11)}s;animation-duration:${8 + (k % 5)}s"/>`).join('') : '';
  const defs = `<defs><linearGradient id="iso-concrete" x1="0" x2="1"><stop offset="0" stop-color="${tone('#FFFFFF')}"/><stop offset="0.6" stop-color="${tone('#E4E8F0')}"/><stop offset="1" stop-color="${tone('#A9B4C8')}"/></linearGradient><linearGradient id="iso-reactor" x1="0" x2="1"><stop offset="0" stop-color="${tone('#FFFFFF')}"/><stop offset="0.55" stop-color="${tone('#EEF2F8')}"/><stop offset="1" stop-color="${tone('#AEB9CD')}"/></linearGradient></defs>`;
  return defs + ground.join('') + out.join('') + snow;
}
