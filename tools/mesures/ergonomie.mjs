// Ergonomics check (lot L8.3, D-23): on every screen and at every format, the buttons and the texts that are too small.
// Usage: node tools/mesures/ergonomie.mjs <DevTools port> <game address> [report.md]
// Edge must run with --remote-debugging-port (see README). Targets (D-23): tablets buttons ≥ 48 px and text ≥ 18 px
// (15 px under 680 px high), phones buttons ≥ 44 px and text ≥ 15 px.
import { writeFileSync } from 'node:fs';

const [, , PORT = '9333', BASE = 'http://localhost:5181/', OUT] = process.argv;

/** Formats in CSS pixels, landscape (D-23). */
const FORMATS = [
  { name: 'Tab A9+ / A11+ (1920 × 1200)', w: 1920, h: 1200, phone: false },
  { name: 'Tab A7 (1334 × 800)', w: 1334, h: 800, phone: false },
  { name: 'Tab A6 10.1" (1280 × 800)', w: 1280, h: 800, phone: false },
  { name: 'Tab A 7" (960 × 600)', w: 960, h: 600, phone: false },
  { name: 'Galaxy S23 Ultra (915 × 412)', w: 915, h: 412, phone: true },
  { name: 'iPhone 11 (896 × 414)', w: 896, h: 414, phone: true },
  { name: 'iPhone 14 (844 × 390)', w: 844, h: 390, phone: true },
  { name: 'Galaxy S20 (800 × 360)', w: 800, h: 360, phone: true },
];
/** Screens, through the review settings of the address (docs/STATUS.md). */
const SCREENS = [
  { name: 'accueil', q: 'ecran=accueil' },
  { name: 'journées', q: 'ecran=journees' },
  { name: 'jeu', q: 'ecran=jeu&journee=hiver&heure=11&graine=5' },
  { name: 'jeu (tutoriel)', q: 'ecran=jeu&journee=ete&tuto=1' },
  { name: 'bilan', q: 'ecran=bilan&journee=hiver&achats=ferme,reseau-chaleur' },
  { name: 'boutique', q: 'ecran=boutique&achats=ferme,reseau-chaleur,maison-lilas,maison-ve,epicerie,ecole,usine-cereales,maison-medicale' },
];

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const wait = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// What the page measures: every visible control smaller than `btn` px, every visible text smaller than `txt` px.
const probe = (btn, txt) => `(() => {
  const seen = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.className.baseVal || el.className || el.tagName).toString().trim().replace(/\\s+/g, ' ').slice(0, 40);
  const small = [];
  for (const el of document.querySelectorAll('button, a[href], input, select, [role=button], [role=slider]')) {
    if (!seen(el) || el.closest('[aria-hidden=true]')) continue;
    const r = el.getBoundingClientRect();
    if (Math.min(r.width, r.height) < ${btn} - 0.5) small.push(label(el) + ' : ' + Math.round(r.width) + ' × ' + Math.round(r.height));
  }
  const tiny = new Map();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement; if (!el || !n.textContent.trim() || !seen(el) || el.closest('[aria-hidden=true]')) continue;
    // Text inside the town or the curves drawings is scaled with them: measured as drawn.
    const px = el.closest('svg') ? el.getBoundingClientRect().height * 0.8 : parseFloat(getComputedStyle(el).fontSize);
    if (px < ${txt} - 0.5) { const k = n.textContent.trim().slice(0, 30) + ' : ' + px.toFixed(1) + ' px'; tiny.set(k, 1); }
  }
  return JSON.stringify({ small, tiny: [...tiny.keys()], rem: parseFloat(getComputedStyle(document.documentElement).fontSize) });
})()`;

const out = ['# Ergonomie (lot L8.3)', '', `Fichier écrit par \`tools/mesures/ergonomie.mjs\` : boutons et textes plus petits que les cibles de D-23 (tablette ≥ 48 px et texte ≥ 18 px, 15 px sous 680 px de haut ; téléphone ≥ 44 px et ≥ 15 px), écran par écran, au format de chaque appareil.`, ''];
let faults = 0;
for (const f of FORMATS) {
  await send('Emulation.setDeviceMetricsOverride', { width: f.w, height: f.h, deviceScaleFactor: 1, mobile: f.phone });
  const btn = f.phone ? 44 : 48;
  const txt = f.phone || f.h < 680 ? 15 : 18;
  out.push(`## ${f.name}`, '');
  for (const s of SCREENS) {
    await send('Page.navigate', { url: `${BASE}?${s.q}` });
    await sleep(2500);
    const r = await send('Runtime.evaluate', { expression: probe(btn, txt), returnByValue: true });
    const v = JSON.parse(r.result.result.value);
    const n = v.small.length + v.tiny.length;
    faults += n;
    out.push(`- **${s.name}** (1 rem = ${v.rem.toFixed(1)} px) : ${n ? '' : 'rien à signaler'}`);
    for (const b of v.small) out.push(`  - bouton trop petit — ${b}`);
    for (const t of v.tiny) out.push(`  - texte trop petit — ${t}`);
  }
  out.push('');
}
out.push(`**Total : ${faults} points.**`, '');
console.log(out.join('\n'));
if (OUT) writeFileSync(OUT, out.join('\n'));
ws.close();
