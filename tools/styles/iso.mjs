// Style proposals for the town (2026-11-08): our own drawings, in the genre of isometric city illustrations
// (flat colours, three tones per volume, dense details). No image is copied from any source.
// Usage: node tools/styles/iso.mjs <output folder>  →  style-A-iso-detaille.svg, style-B-iso-enfants.svg, style-C-face-relief.svg
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2] ?? 'docs/maquettes/styles';
mkdirSync(OUT, { recursive: true });
const W = 1280;
const H = 800;

// ---------- colour helpers ----------
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
const shade = (h, k) => toHex(hex(h).map((v) => (k >= 1 ? v + (255 - v) * (k - 1) : v * k)));

// ---------- isometric scene ----------
function isoScene(opts) {
  const { s, ox, oy, outline, lineW, palette, windows: winStyle, people } = opts;
  const P = (x, y, z = 0) => [ox + (x - y) * 0.866 * s, oy + (x + y) * 0.5 * s - z * s];
  const pts = (arr) => arr.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
  const stroke = outline ? ` stroke="${outline}" stroke-width="${lineW}" stroke-linejoin="round"` : '';
  const poly = (arr, fill, extra = '') => `<polygon points="${pts(arr)}" fill="${fill}"${stroke}${extra}/>`;
  const polyNoLine = (arr, fill, extra = '') => `<polygon points="${pts(arr)}" fill="${fill}"${extra}/>`;
  const items = []; // { key, svg }
  const add = (key, svg) => items.push({ key, svg });

  // Flat ground pieces (drawn first, in this order).
  const ground = [];
  const flat = (x0, y0, x1, y1, fill, z = 0) => ground.push(polyNoLine([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)], fill));

  function box(x, y, z, w, d, h, color, o = {}) {
    const top = shade(color, o.topK ?? 1.18);
    const left = color;
    const right = shade(color, 0.78);
    let g = '';
    g += poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], left);
    g += poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], right);
    if (!o.noTop) g += poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], o.top ?? top);
    return g;
  }
  // Windows on the two visible faces.
  function windows(x, y, z, w, d, h, o) {
    const { floors, colsX, colsY, glass, frame, tall = 0.62, wide = 0.55, from = 1 } = o;
    let g = '';
    const fh = h / floors;
    for (let f = from; f < floors; f++) {
      const v0 = z + f * fh + fh * (1 - tall) / 2;
      const v1 = v0 + fh * tall;
      for (let c = 0; c < colsX; c++) {
        const cw = w / colsX;
        const u0 = x + c * cw + cw * (1 - wide) / 2;
        const u1 = u0 + cw * wide;
        const q = [P(u0, y + d, v0), P(u1, y + d, v0), P(u1, y + d, v1), P(u0, y + d, v1)];
        g += polyNoLine(q, glass, frame ? ` stroke="${frame}" stroke-width="${winStyle.frameW}"` : '');
        if (winStyle.shine) g += `<polyline points="${pts([P(u0 + cw * wide * 0.15, y + d, v0 + fh * tall * 0.25), P(u0 + cw * wide * 0.5, y + d, v0 + fh * tall * 0.8)])}" stroke="#FFFFFF" stroke-width="1.2" opacity="0.7" fill="none"/>`;
      }
      for (let c = 0; c < colsY; c++) {
        const cw = d / colsY;
        const u0 = y + c * cw + cw * (1 - wide) / 2;
        const u1 = u0 + cw * wide;
        const q = [P(x + w, u0, v0), P(x + w, u1, v0), P(x + w, u1, v1), P(x + w, u0, v1)];
        g += polyNoLine(q, shade(glass, 0.85), frame ? ` stroke="${frame}" stroke-width="${winStyle.frameW}"` : '');
      }
    }
    return g;
  }
  function door(x, y, w, d, side, color) {
    if (side === 'y') { const u = x + w / 2; return poly([P(u - 0.6, y + d, 0), P(u + 0.6, y + d, 0), P(u + 0.6, y + d, 2), P(u - 0.6, y + d, 2)], color); }
    const u = y + d / 2; return poly([P(x + w, u - 0.6, 0), P(x + w, u + 0.6, 0), P(x + w, u + 0.6, 2), P(x + w, u - 0.6, 2)], shade(color, 0.8));
  }
  function hipRoof(x, y, z, w, d, r, color) {
    const ridgeY = y + d / 2;
    const top = [P(x + 1, ridgeY, z + r), P(x + w - 1, ridgeY, z + r)];
    let g = '';
    g += poly([P(x, y, z), P(x + w, y, z), top[1], top[0]], shade(color, 0.85));
    g += poly([P(x, y + d, z), P(x + w, y + d, z), top[1], top[0]], color);
    g += poly([P(x + w, y, z), P(x + w, y + d, z), top[1]], shade(color, 0.72));
    return g;
  }
  function mansard(x, y, z, w, d, color, slate) {
    let g = box(x + 0.4, y + 0.4, z, w - 0.8, d - 0.8, 2.6, slate, { topK: 1.25 });
    // Round dormers.
    for (let c = 0; c < Math.floor(w / 3); c++) {
      const u = x + 1.5 + c * 3;
      g += polyNoLine([P(u, y + d - 0.4, z + 0.6), P(u + 1.2, y + d - 0.4, z + 0.6), P(u + 1.2, y + d - 0.4, z + 1.7), P(u + 0.6, y + d - 0.4, z + 2.1), P(u, y + d - 0.4, z + 1.7)], palette.glass);
    }
    for (let c = 0; c < 2; c++) g += box(x + 1 + c * 2.2, y + 1.2, z + 2.6, 0.8, 0.8, 1.2, shade(slate, 0.8));
    return g;
  }
  function building(b) {
    const { x, y, w, d, h, color, roof = 'flat', floors, shop } = b;
    let g = box(x, y, 0, w, d, h, color);
    if (b.brick) {
      for (let k = 1; k < h * 2; k++) {
        const z = k * 0.5;
        g += `<polyline points="${pts([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y, z)])}" stroke="${shade(color, 0.86)}" stroke-width="0.6" fill="none"/>`;
      }
    }
    g += windows(x, y, 0, w, d, h, { floors, colsX: Math.max(2, Math.round(w / 1.6)), colsY: Math.max(2, Math.round(d / 1.6)), glass: palette.glass, frame: winStyle.frame, from: 1, ...winStyle.size });
    if (shop) {
      // Awning and shop window on the ground floor.
      g += polyNoLine([P(x + 0.4, y + d, 0.3), P(x + w - 0.4, y + d, 0.3), P(x + w - 0.4, y + d, 1.9), P(x + 0.4, y + d, 1.9)], palette.glass);
      const n = Math.round(w * 1.5);
      for (let i = 0; i < n; i++) {
        const u0 = x + (i * w) / n;
        const u1 = x + ((i + 1) * w) / n;
        g += poly([P(u0, y + d, 2.6), P(u1, y + d, 2.6), P(u1, y + d + 1, 2.0), P(u0, y + d + 1, 2.0)], i % 2 ? '#FFFFFF' : shop);
      }
    } else g += door(x, y, w, d, 'y', palette.door);
    if (roof === 'hip') g += hipRoof(x - 0.3, y - 0.3, h, w + 0.6, d + 0.6, Math.min(w, d) * 0.45, b.roofColor ?? palette.roof);
    else if (roof === 'mansard') g += mansard(x, y, h, w, d, color, palette.slate);
    else {
      g += box(x, y, h, w, d, 0.4, shade(color, 1.1));
      g += box(x + 1, y + 1, h + 0.4, 1.4, 1, 0.9, palette.metal);
      if (w > 4) g += box(x + w - 2.6, y + d - 2.4, h + 0.4, 1.6, 1.4, 0.7, palette.metal);
    }
    return g;
  }
  function tree(x, y, kind = 'round', size = 1) {
    const [bx, by] = P(x, y, 0);
    const t = palette.trunk;
    const outl = outline ? ` stroke="${outline}" stroke-width="${lineW}"` : '';
    let g = `<ellipse cx="${bx}" cy="${by + 2}" rx="${8 * size}" ry="${4 * size}" fill="#000" opacity="0.15"/>`;
    g += `<rect x="${bx - 1.6 * size}" y="${by - 14 * size}" width="${3.2 * size}" height="${14 * size}" fill="${t}"${outl}/>`;
    if (kind === 'cone') g += `<polygon points="${bx},${by - 46 * size} ${bx - 11 * size},${by - 10 * size} ${bx + 11 * size},${by - 10 * size}" fill="${palette.leaf}"${outl}/><polygon points="${bx},${by - 46 * size} ${bx + 11 * size},${by - 10 * size} ${bx + 2 * size},${by - 10 * size}" fill="${shade(palette.leaf, 0.8)}"/>`;
    else g += `<circle cx="${bx}" cy="${by - 22 * size}" r="${11 * size}" fill="${palette.leaf}"${outl}/><circle cx="${bx - 3.5 * size}" cy="${by - 25 * size}" r="${5 * size}" fill="${shade(palette.leaf, 1.25)}"/>`;
    return g;
  }
  // A wheel seen on a side of the car: tyre, rim and hub, flattened and tilted like the side it is on.
  function wheel(x, y, z, side) {
    const [cx, cy] = P(x, y, z);
    const rot = side === 'y' ? -30 : 30;
    const o = outline ? ` stroke="${outline}" stroke-width="1"` : '';
    return `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${0.36 * s}" ry="${0.42 * s}" fill="#22283A"${o}/><ellipse cx="${cx}" cy="${cy}" rx="${0.2 * s}" ry="${0.24 * s}" fill="#D5DCEB"/><ellipse cx="${cx}" cy="${cy}" rx="${0.07 * s}" ry="${0.08 * s}" fill="#6B7896"/></g>`;
  }
  function car(x, y, color, along = 'x') {
    const [w, d] = along === 'x' ? [2.6, 1.3] : [1.3, 2.6];
    const z = 0.32; // the body stands on its wheels
    let g = '';
    // Hidden-side wheels first, then the body, then the visible-side wheels.
    if (along === 'x') { g += wheel(x + 0.6, y, z, 'y') + wheel(x + w - 0.6, y, z, 'y'); }
    else { g += wheel(x, y + 0.6, z, 'x') + wheel(x, y + d - 0.6, z, 'x'); }
    g += box(x, y, z, w, d, 0.55, color);
    g += box(x + (along === 'x' ? 0.55 : 0.15), y + (along === 'x' ? 0.15 : 0.55), z + 0.55, along === 'x' ? 1.4 : 1.0, along === 'x' ? 1.0 : 1.4, 0.48, palette.glass, { topK: 1 });
    g += box(x + (along === 'x' ? 0.55 : 0.15), y + (along === 'x' ? 0.15 : 0.55), z + 1.03, along === 'x' ? 1.4 : 1.0, along === 'x' ? 1.0 : 1.4, 0.06, color);
    if (along === 'x') { g += wheel(x + 0.6, y + d, z, 'y') + wheel(x + w - 0.6, y + d, z, 'y'); }
    else { g += wheel(x + w, y + 0.6, z, 'x') + wheel(x + w, y + d - 0.6, z, 'x'); }
    return g;
  }
  function person(x, y, shirt) {
    const [bx, by] = P(x, y, 0);
    const o = outline ? ` stroke="${outline}" stroke-width="1"` : '';
    return `<rect x="${bx - 2.2}" y="${by - 9}" width="4.4" height="7" rx="2" fill="${shirt}"${o}/><rect x="${bx - 1.8}" y="${by - 2.5}" width="1.4" height="3" fill="#3B4A6B"/><rect x="${bx + 0.4}" y="${by - 2.5}" width="1.4" height="3" fill="#3B4A6B"/><circle cx="${bx}" cy="${by - 11.5}" r="2.6" fill="#E8B48A"${o}/>`;
  }
  // The plant: cooling tower, reactor building with its dome, turbine hall, fence.
  function coolingTower(cx, cy, r, h) {
    const [x0, y0] = P(cx, cy, 0);
    const [, yt] = P(cx, cy, h);
    const rx = r * s * 0.95;
    const ry = rx * 0.5;
    const o = outline ? ` stroke="${outline}" stroke-width="${lineW}"` : '';
    let g = `<defs><linearGradient id="ct${cx}" x1="0" x2="1"><stop offset="0" stop-color="${shade(palette.concrete, 1.15)}"/><stop offset="0.6" stop-color="${palette.concrete}"/><stop offset="1" stop-color="${shade(palette.concrete, 0.72)}"/></linearGradient></defs>`;
    g += `<path d="M${x0 - rx} ${y0} C ${x0 - rx * 0.55} ${y0 - (y0 - yt) * 0.45} ${x0 - rx * 0.55} ${y0 - (y0 - yt) * 0.75} ${x0 - rx * 0.68} ${yt} L ${x0 + rx * 0.68} ${yt} C ${x0 + rx * 0.55} ${y0 - (y0 - yt) * 0.75} ${x0 + rx * 0.55} ${y0 - (y0 - yt) * 0.45} ${x0 + rx} ${y0} A ${rx} ${ry} 0 0 1 ${x0 - rx} ${y0} Z" fill="url(#ct${cx})"${o}/>`;
    g += `<ellipse cx="${x0}" cy="${yt}" rx="${rx * 0.68}" ry="${ry * 0.68}" fill="${shade(palette.concrete, 0.6)}"${o}/>`;
    g += `<g fill="#FFFFFF">${[[0, -12, 18], [10, -30, 24], [26, -52, 30], [48, -74, 32]].map(([dx, dy, rr], i) => `<ellipse cx="${x0 + dx}" cy="${yt + dy}" rx="${rr}" ry="${rr * 0.6}" opacity="${0.95 - i * 0.18}"/>`).join('')}</g>`;
    return g;
  }
  function reactor(cx, cy, r, h) {
    const [x0, y0] = P(cx, cy, 0);
    const [, yt] = P(cx, cy, h);
    const rx = r * s * 0.95;
    const ry = rx * 0.5;
    const o = outline ? ` stroke="${outline}" stroke-width="${lineW}"` : '';
    let g = `<defs><linearGradient id="rc${cx}" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.55" stop-color="${palette.reactor}"/><stop offset="1" stop-color="${shade(palette.reactor, 0.7)}"/></linearGradient></defs>`;
    g += `<path d="M${x0 - rx} ${y0} V ${yt} A ${rx} ${ry} 0 0 1 ${x0 + rx} ${yt} V ${y0} A ${rx} ${ry} 0 0 1 ${x0 - rx} ${y0} Z" fill="url(#rc${cx})"${o}/>`;
    g += `<path d="M${x0 - rx} ${yt} A ${rx} ${rx * 0.9} 0 0 1 ${x0 + rx} ${yt} A ${rx} ${ry} 0 0 1 ${x0 - rx} ${yt} Z" fill="url(#rc${cx})"${o}/>`;
    g += `<rect x="${x0 - 5}" y="${y0 - 18}" width="10" height="16" fill="${palette.door}"${o}/>`;
    g += `<circle cx="${x0}" cy="${yt - rx * 0.45}" r="5" fill="#FFC83D"${o}/>`;
    return g;
  }

  // ---------- the scene ----------
  flat(-6, -6, 64, 44, palette.grass);
  flat(1, -6, 8, 44, palette.water); // river
  for (let k = -4; k < 44; k += 5) ground.push(`<polyline points="${pts([P(4.5, k), P(4.5, k + 2.2)])}" stroke="${shade(palette.water, 1.35)}" stroke-width="2.5" stroke-linecap="round"/>`);
  flat(8, -6, 9.2, 44, palette.quay);
  flat(0, -6, 1, 44, palette.quay);
  flat(9.2, 18, 64, 22.5, palette.road); // road along x
  flat(30, -6, 34.5, 44, palette.road); // road along y
  for (let k = 11; k < 64; k += 3) if (k < 29 || k > 35) ground.push(`<polyline points="${pts([P(k, 20.25), P(k + 1.4, 20.25)])}" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>`);
  for (let k = -5; k < 44; k += 3) if (k < 17 || k > 23) ground.push(`<polyline points="${pts([P(32.25, k), P(32.25, k + 1.4)])}" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>`);
  flat(9.2, 16.8, 30, 18, palette.pavement); flat(9.2, 22.5, 30, 23.7, palette.pavement);
  flat(34.5, 16.8, 64, 18, palette.pavement); flat(34.5, 22.5, 64, 23.7, palette.pavement);
  flat(28.8, -6, 30, 16.8, palette.pavement); flat(34.5, -6, 35.7, 16.8, palette.pavement);
  flat(28.8, 23.7, 30, 44, palette.pavement); flat(34.5, 23.7, 35.7, 44, palette.pavement);
  flat(10, -4, 28, 16, palette.site); // plant ground
  flat(12, 25, 28, 40, shade(palette.grass, 1.12)); // park
  flat(17, 30, 22, 35, palette.pavement);

  // Plant.
  add(4, coolingTower(14, 4, 4, 13));
  add(10, box(19, 8, 0, 8, 6, 4.5, palette.hall) + windows(19, 8, 0, 8, 6, 4.5, { floors: 2, colsX: 6, colsY: 4, glass: palette.glass, from: 1, tall: 0.4, wide: 0.7 }));
  add(13, reactor(23, 3, 3.2, 6.5));
  for (let k = 10; k <= 28; k += 2) add(16 + k * 0.01, box(k, 15.6, 0, 0.15, 0.15, 1.1, palette.metal));
  add(16.5, box(10, 15.6, 0.8, 18, 0.1, 0.12, palette.metal));
  // Town blocks.
  const B = [
    { x: 36, y: 1, w: 6, d: 6, h: 11, color: palette.brick, brick: true, roof: 'mansard', floors: 5 },
    { x: 43, y: 1, w: 6, d: 6, h: 8, color: palette.pink, roof: 'hip', floors: 4 },
    { x: 50, y: 1, w: 6, d: 6, h: 17, color: palette.grey, roof: 'flat', floors: 9 },
    { x: 36, y: 9, w: 7, d: 6, h: 7, color: palette.beige, roof: 'flat', floors: 3, shop: '#E0443E' },
    { x: 45, y: 9, w: 5, d: 6, h: 9, color: palette.brick, brick: true, roof: 'hip', roofColor: palette.roof2, floors: 4 },
    { x: 52, y: 9, w: 6, d: 6, h: 6, color: palette.cream, roof: 'mansard', floors: 3 },
    { x: 37, y: 26, w: 6, d: 6, h: 13, color: palette.grey2, roof: 'flat', floors: 7 },
    { x: 45, y: 26, w: 6, d: 7, h: 7, color: palette.cream, roof: 'hip', floors: 3 },
    { x: 53, y: 26, w: 5, d: 6, h: 10, color: palette.pink, roof: 'mansard', floors: 5 },
    { x: 38, y: 35, w: 9, d: 6, h: 5, color: palette.beige, roof: 'flat', floors: 2, shop: '#1D47B8' },
  ];
  for (const b of B) add(b.x + b.w / 2 + b.y + b.d / 2, building(b));
  // Trees, fountain, cars, boat, people.
  for (const [x, y, k] of [[13, 27, 'round'], [15, 31, 'cone'], [24, 27, 'round'], [26, 33, 'cone'], [14, 37, 'round'], [24, 38, 'round'], [20, 26, 'cone'], [11, 21.5, 'round']]) add(x + y + 0.5, tree(x, y, k));
  for (const [x, y] of [[36, 17.4], [42, 17.4], [48, 17.4], [56, 17.4], [36, 23.2], [44, 23.2], [52, 23.2], [60, 23.2]]) add(x + y + 0.3, tree(x, y, 'round', 0.8));
  add(39.5, box(18.5, 31.5, 0, 2, 2, 0.6, palette.quay) + box(19.2, 32.2, 0.6, 0.6, 0.6, 1.4, palette.concrete) + polyNoLine([P(18.8, 31.8, 0.62), P(20.2, 31.8, 0.62), P(20.2, 33.2, 0.62), P(18.8, 33.2, 0.62)], palette.water));
  add(38.6, car(12, 18.6, '#E0443E'));
  add(42.3, car(22, 20.6, '#1D47B8'));
  add(41.5, car(50, 18.6, '#F2A51F'));
  add(30.5, car(30.6, 4, '#2E9E5B', 'y'));
  add(46, car(33, 12, '#7B5CD6', 'y'));
  add(10.5, box(2.5, 8, 0, 4, 2, 0.8, '#D9534A') + box(3, 8.3, 0.8, 1.6, 1.4, 1.2, '#FFFFFF') + box(4.8, 8.3, 0.8, 1.1, 1.4, 0.6, '#FFC83D'));
  if (people) for (const [x, y, c] of [[38, 17.2, '#7B5CD6'], [46, 23, '#2E9E5B'], [18, 29.5, '#FF8A3D'], [21, 34, '#1D47B8'], [55, 17.2, '#E0443E']]) add(x + y + 0.6, person(x, y, c));

  items.sort((a, b) => a.key - b.key);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${palette.bg}"/>${ground.join('')}${items.map((i) => i.svg).join('')}${opts.label ?? ''}</svg>`;
}

const label = (t, sub) => `<g font-family="Nunito, Segoe UI, sans-serif"><rect x="16" y="16" width="${Math.max(t.length, sub.length) * 9.5 + 40}" height="66" rx="14" fill="#FFFFFF" opacity="0.92" stroke="#1C2A4A" stroke-width="2"/><text x="34" y="44" font-size="22" font-weight="800" fill="#1D47B8">${t}</text><text x="34" y="68" font-size="16" font-weight="700" fill="#1C2A4A">${sub}</text></g>`;

// A — detailed isometric: muted realistic palette, no outlines, many windows.
const A = isoScene({
  s: 13.5, ox: 600, oy: 120, outline: null, lineW: 0, people: false,
  windows: { frame: null, frameW: 0, shine: true, size: { tall: 0.6, wide: 0.5 } },
  palette: {
    bg: '#E9E4D4', grass: '#3E9A3A', water: '#8ED3E4', quay: '#E6DFC8', road: '#E9E2CC', pavement: '#D2CDBF', site: '#DADDE2',
    glass: '#A8E4EE', door: '#5B6C8F', roof: '#B9452F', roof2: '#7A3F24', slate: '#5E6878', metal: '#8C96A6', trunk: '#7A4B2A', leaf: '#2E8B2E',
    brick: '#B9663B', pink: '#F2C9CE', grey: '#C9CED6', grey2: '#AEB6C2', beige: '#E9D2A6', cream: '#F1E7D6', hall: '#9AA7BC', concrete: '#E3E6EC', reactor: '#E6ECF5',
  },
  label: label('Proposition A — isométrique détaillé', 'Couleurs réalistes, pas de contour, beaucoup de fenêtres'),
});

// B — isometric for children: bright colours, dark outlines like Cassandra, fewer bigger windows, inhabitants.
const B = isoScene({
  s: 13.5, ox: 600, oy: 120, outline: '#1C2A4A', lineW: 1.4, people: true,
  windows: { frame: '#FFFFFF', frameW: 1, shine: false, size: { tall: 0.7, wide: 0.6 } },
  palette: {
    bg: '#BFE3FF', grass: '#7CC678', water: '#5EC4F0', quay: '#F3E6C4', road: '#7B88A4', pavement: '#E4E7EF', site: '#E3ECFF',
    glass: '#BFE3FF', door: '#1D47B8', roof: '#E0443E', roof2: '#C8553D', slate: '#4E66A0', metal: '#8796AE', trunk: '#8A5A3B', leaf: '#4CAF50',
    brick: '#D9734A', pink: '#FF9AA2', grey: '#A9BCD0', grey2: '#8EC5FF', beige: '#FFD166', cream: '#FFF1D0', hall: '#8EA7D8', concrete: '#F4F6FA', reactor: '#FFFFFF',
  },
  label: label('Proposition B — isométrique pour enfants', 'Couleurs vives, contours foncés comme Cassandra, habitants'),
});

// ---------- C — front view with relief (keeps D-03: sky, day/night) ----------
function frontScene() {
  const G = 560; // ground line
  const dx = 0.55; const dy = -0.4; // receding direction of the side faces
  let g = '';
  const face = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const side = (x, y, w, h, d, c) => `<polygon points="${x + w},${y} ${x + w + d * dx},${y + d * dy} ${x + w + d * dx},${y + h + d * dy} ${x + w},${y + h}" fill="${c}"/>`;
  const top = (x, y, w, d, c) => `<polygon points="${x},${y} ${x + d * dx},${y + d * dy} ${x + w + d * dx},${y + d * dy} ${x + w},${y}" fill="${c}"/>`;
  function bld(x, w, h, d, color, o = {}) {
    const y = G - h;
    let s = side(x, y, w, h, d, shade(color, 0.75)) + face(x, y, w, h, color);
    if (o.brick) for (let k = y + 6; k < G; k += 6) s += `<line x1="${x}" x2="${x + w}" y1="${k}" y2="${k}" stroke="${shade(color, 0.88)}" stroke-width="1"/>`;
    const floors = Math.floor((h - 30) / 34);
    const cols = Math.max(2, Math.round(w / 34));
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const wx = x + 10 + c * ((w - 20) / cols) + 4;
      const wy = y + 14 + f * 34;
      const ww = (w - 20) / cols - 8;
      s += `<rect x="${wx}" y="${wy}" width="${ww}" height="22" fill="#A8E4EE"/><rect x="${wx}" y="${wy}" width="${ww * 0.35}" height="22" fill="#FFFFFF" opacity="0.35"/><rect x="${wx - 2}" y="${wy + 22}" width="${ww + 4}" height="3" fill="${shade(color, 1.25)}"/>`;
      if (o.balcony && c % 2 === 1) s += `<rect x="${wx - 4}" y="${wy + 14}" width="${ww + 8}" height="9" fill="none" stroke="#4A5878" stroke-width="1.5"/>`;
    }
    if (o.shop) {
      s += `<rect x="${x + 8}" y="${G - 36}" width="${w - 16}" height="30" fill="#A8E4EE"/>`;
      for (let i = 0; i < 8; i++) s += `<polygon points="${x + 4 + (i * (w - 8)) / 8},${G - 50} ${x + 4 + ((i + 1) * (w - 8)) / 8},${G - 50} ${x + 6 + ((i + 1) * (w - 8)) / 8},${G - 38} ${x + 6 + (i * (w - 8)) / 8},${G - 38}" fill="${i % 2 ? '#FFFFFF' : o.shop}"/>`;
    } else s += `<rect x="${x + w / 2 - 10}" y="${G - 30}" width="20" height="30" fill="#5B6C8F"/>`;
    if (o.roof === 'hip') {
      s += `<polygon points="${x - 6},${y} ${x + w + 6},${y} ${x + w + 6 + d * dx},${y + d * dy} ${x + w / 2 + d * dx * 0.5},${y - 34 + d * dy * 0.5} ${x + w / 2},${y - 34}" fill="${shade(o.roofColor, 0.8)}"/>`;
      s += `<polygon points="${x - 6},${y} ${x + w / 2},${y - 34} ${x + w + 6},${y}" fill="${o.roofColor}"/>`;
      for (let k = 1; k < 5; k++) s += `<line x1="${x - 6 + k * 3}" x2="${x + w + 6 - k * 3}" y1="${y - k * 6.5}" y2="${y - k * 6.5}" stroke="${shade(o.roofColor, 0.85)}" stroke-width="1"/>`;
    } else if (o.roof === 'mansard') {
      s += side(x + 4, y - 22, w - 8, 22, d - 4, shade('#5E6878', 0.75)) + face(x + 4, y - 22, w - 8, 22, '#5E6878') + top(x + 4, y - 22, w - 8, d - 4, '#7C8696');
      for (let c = 0; c < Math.floor((w - 8) / 26); c++) s += `<path d="M${x + 12 + c * 26} ${y - 4} v -8 a 6 6 0 0 1 12 0 v 8 z" fill="#A8E4EE"/>`;
    } else s += top(x, y, w, d, shade(color, 1.18)) + `<rect x="${x + 8}" y="${y - 10}" width="18" height="10" fill="#8C96A6"/>`;
    return s;
  }
  // Sky, hills, river in front.
  g += `<defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8CC8F5"/><stop offset="1" stop-color="#DCEFFF"/></linearGradient></defs>`;
  g += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  g += `<path d="M0 470 C 260 380 520 430 760 400 S 1100 380 1280 430 V 600 H 0 Z" fill="#9CC9A0"/>`;
  g += `<path d="M0 520 C 300 460 600 500 900 470 S 1180 480 1280 500 V 600 H 0 Z" fill="#5FA858"/>`;
  // Plant on the left.
  g += `<path d="M60 ${G} C 100 470 104 400 92 330 H 196 C 184 400 188 470 228 ${G} Z" fill="#E3E6EC"/><path d="M144 ${G} C 170 470 174 400 166 330 H 196 C 184 400 188 470 228 ${G} Z" fill="#B9C1CE"/><ellipse cx="144" cy="330" rx="52" ry="9" fill="#9AA4B5"/>`;
  g += [[150, 300, 34], [175, 262, 42], [215, 224, 48]].map(([x, y, r], i) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.62}" fill="#FFFFFF" opacity="${0.95 - i * 0.2}"/>`).join('');
  g += bld(250, 120, 70, 50, '#9AA7BC') + `<path d="M232 ${G} V 440 A 50 50 0 0 1 332 440 V ${G} Z" fill="#EEF2F8"/><path d="M290 ${G} V 440 A 50 50 0 0 1 332 440 V ${G} Z" fill="#C7D0DE"/><circle cx="282" cy="420" r="9" fill="#FFC83D"/>`;
  g += bld(420, 120, 210, 70, '#B9663B', { brick: true, roof: 'mansard', balcony: true });
  g += bld(560, 110, 150, 60, '#F2C9CE', { roof: 'hip', roofColor: '#B9452F' });
  g += bld(690, 130, 120, 60, '#E9D2A6', { shop: '#E0443E' });
  g += bld(840, 100, 260, 60, '#C9CED6');
  g += bld(960, 120, 140, 60, '#F1E7D6', { roof: 'hip', roofColor: '#7A3F24' });
  g += bld(1100, 150, 190, 60, '#AEB6C2', { roof: 'mansard', balcony: true });
  // Pavement, road, river bank.
  g += `<rect x="0" y="${G}" width="${W}" height="26" fill="#D2CDBF"/><rect x="0" y="${G + 26}" width="${W}" height="70" fill="#7A8496"/>`;
  for (let k = 20; k < W; k += 90) g += `<rect x="${k}" y="${G + 58}" width="46" height="6" rx="3" fill="#FFFFFF"/>`;
  g += `<rect x="0" y="${G + 96}" width="${W}" height="14" fill="#E6DFC8"/><rect x="0" y="${G + 110}" width="${W}" height="${H - G - 110}" fill="#8ED3E4"/>`;
  for (let k = 0; k < W; k += 140) g += `<rect x="${k + 30}" y="${G + 150}" width="60" height="5" rx="2.5" fill="#C8ECF5"/>`;
  // Trees, cars, boat.
  for (const x of [400, 680, 830, 1090]) g += `<rect x="${x - 3}" y="${G - 40}" width="6" height="42" fill="#7A4B2A"/><circle cx="${x}" cy="${G - 52}" r="22" fill="#2E8B2E"/><circle cx="${x - 7}" cy="${G - 58}" r="10" fill="#4FA84A"/>`;
  // Car with real wheels: tyre, rim and hub, wheel arches cut in the body.
  const wheel = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="11" fill="#22283A"/><circle cx="${cx}" cy="${cy}" r="6.5" fill="#C9CFDA"/><circle cx="${cx}" cy="${cy}" r="2.2" fill="#6B7896"/>${[0, 72, 144, 216, 288].map((a) => `<line x1="${cx}" y1="${cy}" x2="${cx + 5.5 * Math.cos((a * Math.PI) / 180)}" y2="${cy + 5.5 * Math.sin((a * Math.PI) / 180)}" stroke="#8C96A6" stroke-width="1.3"/>`).join('')}`;
  const carF = (x, c) => {
    const y = G + 50;
    return `<ellipse cx="${x + 48}" cy="${y + 12}" rx="52" ry="4" fill="#000" opacity="0.2"/>`
      + `<path d="M${x} ${y} v -14 q 0 -7 9 -8 l 14 -2 l 13 -13 q 3 -3 8 -3 h 26 q 5 0 8 3 l 12 13 l 6 1 q 9 1 9 9 v 14 h -9 a 12 12 0 0 0 -24 0 h -42 a 12 12 0 0 0 -24 0 z" fill="${c}"/>`
      + `<path d="M${x} ${y - 9} h 96" stroke="${shade(c, 0.75)}" stroke-width="3"/>`
      + `<path d="M${x + 38} ${y - 22} l 10 -10 h 14 v 10 z M${x + 66} ${y - 22} v -10 h 10 q 3 0 5 2 l 8 8 z" fill="#A8E4EE"/>`
      + `<rect x="${x + 93}" y="${y - 16}" width="7" height="5" rx="2" fill="#FFE27A"/><rect x="${x - 2}" y="${y - 16}" width="5" height="5" rx="2" fill="#E0443E"/>`
      + wheel(x + 23, y) + wheel(x + 77, y);
  };
  g += carF(300, '#E0443E') + carF(760, '#1D47B8');
  g += `<path d="M560 ${G + 168} h 200 l -24 30 h -152 z" fill="#D9534A"/><rect x="580" y="${G + 136}" width="70" height="32" fill="#FFFFFF"/>` + ['#1D8BE0', '#FFC83D', '#2E9E5B', '#E0443E'].map((c, i) => `<rect x="${660 + i * 22}" y="${G + 146}" width="20" height="22" fill="${c}"/>`).join('');
  g += label('Proposition C — vue de face en relief', 'Garde le ciel jour/nuit (D-03), volumes et ombres de l’isométrique');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`;
}

writeFileSync(join(OUT, 'style-A-iso-detaille.svg'), A);
writeFileSync(join(OUT, 'style-B-iso-enfants.svg'), B);
writeFileSync(join(OUT, 'style-C-face-relief.svg'), frontScene());
console.log('3 style proposals written to', OUT);
