// Nuki Town symbol (lot L9.2a, D-27): vector redraw of the logo chosen by Yann from a Gemini board — the town's plant
// (reactor dome, cooling tower, annex) on a grass island, an orbit from yellow (electricity) to orange (heat), Nuki the
// NukiTeam electron winking on the left, a euro coin on the right. Writes the SVG files of apps/desktop/branding.
// After `tauri icon apps/desktop/branding/icon.png`, the Android adaptive layers (mipmap-*/ic_launcher_foreground.png and
// ic_launcher_background.png) are rendered again from android-avant.svg and android-fond.svg, since the tile alone gets cut.
// Usage (from the repo root): node tools/branding/nuki-town.mjs
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INK = '#1C2A4A';
const out = join(import.meta.dirname, '..', '..', 'apps', 'desktop', 'branding');

// Orbit: ellipse through Nuki (left) and the coin (right), behind the plant at the top, in front of it at the bottom.
const O = { cx: 57, cy: 62, rx: 47, ry: 27, rot: -20 };
const ellipse = (w, color) =>
  `<ellipse cx="${O.cx}" cy="${O.cy}" rx="${O.rx}" ry="${O.ry}" transform="rotate(${O.rot} ${O.cx} ${O.cy})" fill="none" stroke="${color}" stroke-width="${w}"/>`;
const orbit = `${ellipse(9, INK)}${ellipse(5.4, 'url(#orb)')}`;

const NUKI = { cx: 15.5, cy: 74, r: 12.5 };
const COIN = { cx: 100, cy: 47.5, r: 10.5 };

/** Nuki winking, from the NukiTeam kit (nuki-clin.svg, body r 20 in a 60 box), scaled to r. */
const nuki = ({ cx, cy, r }) => {
  const k = r / 20;
  return `<g transform="translate(${cx - 30 * k} ${cy - 30 * k}) scale(${k})">
    <circle cx="30" cy="30" r="31" fill="url(#halo)"/>
    <circle cx="30" cy="30" r="20" fill="url(#nuki)" stroke="${INK}" stroke-width="3.4"/>
    <ellipse cx="22" cy="21" rx="6" ry="3.4" transform="rotate(-35 22 21)" fill="#fff" fill-opacity=".85"/>
    <path d="M20.6 28q3.4 -4 6.8 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="36" cy="27" r="3" fill="${INK}"/><circle cx="36.9" cy="26" r="1" fill="#fff"/>
    <path d="M23 34q7 7 14 0" fill="none" stroke="${INK}" stroke-width="3.1" stroke-linecap="round"/>
  </g>`;
};

const coin = ({ cx, cy, r }) => `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#E9A912" stroke="${INK}" stroke-width="2.4"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 2.6}" fill="#FFC83D" stroke="#B57A00" stroke-width="1"/>
    <path d="M${cx + 3.6} ${cy - 4.2}a5 5.2 0 1 0 0 8.4M${cx - 5.6} ${cy - 1.4}h6.4M${cx - 5.6} ${cy + 1.6}h6.4" fill="none" stroke="#9A6200" stroke-width="2" stroke-linecap="round"/>
  </g>`;

// The plant, drawn front-left lit like the town's buildings (light from the top left).
const plant = `
  <!-- grass island: a round floating disc -->
  <path d="M20 88 V93 A40 13 0 0 0 100 93 V88" fill="#8A5A2B" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <ellipse cx="60" cy="88" rx="40" ry="13" fill="#4CB25F" stroke="${INK}" stroke-width="2.4"/>
  <path d="M88 91.5l1 -2.4 1 2.4 1 -2.6 1 2.6M27 86.5l1 -2.4 1 2.4 1 -2.6 1 2.6M72 97l1 -2.4 1 2.4 1 -2.6 1 2.6" fill="none" stroke="#2E7D45" stroke-width="1" stroke-linecap="round"/>
  <!-- cooling tower -->
  <path d="M64 39 Q66.5 58 61.5 84 L85 84 Q80 58 82.5 39 Z" fill="url(#tower)" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <ellipse cx="73.25" cy="39" rx="9.25" ry="3" fill="#B9BEC8" stroke="${INK}" stroke-width="2.4"/>
  <ellipse cx="73.25" cy="39.4" rx="6.6" ry="1.7" fill="#7D8594"/>
  <!-- reactor -->
  <path d="M35 55 A13.5 13.5 0 0 1 62 55 L62 86 Q48.5 90 35 86 Z" fill="url(#dome)" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M35 55 Q48.5 59 62 55" fill="none" stroke="${INK}" stroke-width="1.6"/>
  <path d="M36.5 61.5 Q48.5 65 60.5 61.5 L60.5 67 Q48.5 70.5 36.5 67 Z" fill="#4FD1C5" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M42.5 63.4v5.2M48.5 64v5.4M54.5 63.4v5.2" stroke="${INK}" stroke-width="1.2"/>
  <!-- annex -->
  <path d="M46 72 L68 72 L74 68.5 L52 68.5 Z" fill="#F3F4F7" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M68 72 L74 68.5 L74 84 L68 88 Z" fill="#B8BFCC" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <rect x="46" y="72" width="22" height="16" fill="#DDE2EA" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <rect x="53" y="76.5" width="3.6" height="4" fill="#4FD1C5" stroke="${INK}" stroke-width="1.1"/>
  <rect x="58.5" y="76.5" width="3.6" height="4" fill="#4FD1C5" stroke="${INK}" stroke-width="1.1"/>
  <rect x="64" y="76.5" width="2.6" height="4" fill="#4FD1C5" stroke="${INK}" stroke-width="1.1"/>
  <!-- steam -->
  <path d="M66 31 a4 4 0 0 1 4 -5.5 a5 5 0 0 1 9 -1 a4 4 0 0 1 6 4 a3.4 3.4 0 0 1 -1 6.5 H68.5 a3.4 3.4 0 0 1 -2.5 -4 Z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;

const defs = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4ECFF"/><stop offset="1" stop-color="#5E9BF0"/></linearGradient>
  <linearGradient id="orb" gradientUnits="userSpaceOnUse" x1="14" y1="70" x2="104" y2="45"><stop offset="0" stop-color="#FFC83D"/><stop offset=".45" stop-color="#FFC83D"/><stop offset="1" stop-color="#FF8A3D"/></linearGradient>
  <linearGradient id="dome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4E6EB"/><stop offset=".6" stop-color="#CDD1D9"/><stop offset="1" stop-color="#A9AFBB"/></linearGradient>
  <linearGradient id="tower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DADDE3"/><stop offset=".55" stop-color="#C4C8D0"/><stop offset="1" stop-color="#9EA4B1"/></linearGradient>
  <radialGradient id="nuki" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#B5F5FF"/><stop offset=".55" stop-color="#3DD6FF"/><stop offset="1" stop-color="#1BA3D6"/></radialGradient>
  <radialGradient id="halo"><stop offset=".6" stop-color="#3DD6FF" stop-opacity=".6"/><stop offset="1" stop-color="#3DD6FF" stop-opacity="0"/></radialGradient>
  <clipPath id="front"><path d="M-10 ${NUKI.cy + 1} L130 ${COIN.cy - 3} L130 130 L-10 130 Z"/></clipPath>
</defs>`;

/** Everything but the tile: back orbit, plant, front orbit, Nuki, coin. */
const scene = `${orbit}${plant}<g clip-path="url(#front)">${orbit}</g>${nuki(NUKI)}${coin(COIN)}`;

const svg = (body, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}">
<!-- Nuki Town symbol, generated by tools/branding/nuki-town.mjs (lot L9.2a). Do not edit by hand. -->
${defs}
${body}
</svg>
`;

// App icon: rounded tile with an ink rim. Full-bleed (maskable / Android): square tile, scene kept in the safe zone.
const tile = `<rect x="4" y="4" width="112" height="112" rx="27" fill="url(#sky)" stroke="${INK}" stroke-width="3"/>`;
writeFileSync(join(out, 'icon.svg'), svg(`${tile}${scene}`, 1024));
writeFileSync(join(out, 'icon-plein.svg'), svg(`<rect width="120" height="120" fill="url(#sky)"/><g transform="translate(12 12) scale(.8)">${scene}</g>`, 1024));
writeFileSync(join(out, 'symbole.svg'), svg(scene, 512));
// Android adaptive icon (108 dp, only the central 66 dp circle is sure to show): sky background and the scene apart.
const k = 0.64;
writeFileSync(join(out, 'android-avant.svg'), svg(`<g transform="translate(${60 * (1 - k)} ${60 * (1 - k)}) scale(${k})">${scene}</g>`, 432));
writeFileSync(join(out, 'android-fond.svg'), svg('<rect width="120" height="120" fill="url(#sky)"/>', 432));
console.log('ok');
