// Capture d'écran honnête du jeu, par le protocole DevTools (lot L10.6b2).
//
// Pourquoi ce script plutôt que `msedge --screenshot` : avec `--virtual-time-budget`, Edge fait défiler le temps du
// jeu à toute vitesse, l'horloge change donc la lumière sans arrêt et les calques de la ville sont redessinés en
// boucle. La photo attrape alors des calques peints pour une autre taille de fenêtre, et la ville apparaît deux fois,
// la seconde un peu plus petite et décalée — ce qui a trompé la relecture des maquettes du lot L10.6b. Ici on laisse
// au jeu du vrai temps pour peindre, puis on photographie.
//
//   node tools/mesures/capture.mjs <port-debug> <largeur> <hauteur> <fichier.png> <adresse> [attente-ms]
//
// Edge doit tourner : voir le README de ce dossier (étape 1).
import { writeFileSync } from 'node:fs';

const [, , port, width, height, out, url, delay] = process.argv;
if (!url) { console.error('usage: node capture.mjs <port> <largeur> <hauteur> <fichier.png> <adresse> [attente-ms]'); process.exit(1); }

const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const wait = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Emulation.setDeviceMetricsOverride', { width: Number(width), height: Number(height), deviceScaleFactor: 1, mobile: false });
// La version web garde le jeu en mémoire (lot L8.2) : on photographie ce qui vient d'être construit.
await send('Network.enable');
await send('Network.setBypassServiceWorker', { bypass: true });
// Page blanche d'abord : chaque capture repart d'un écran neuf, même adresse ou non.
await send('Page.navigate', { url: 'about:blank' });
await new Promise((r) => setTimeout(r, 300));
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, Number(delay) || 6000));
const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(`${out} ${width}×${height}`);
ws.close();
