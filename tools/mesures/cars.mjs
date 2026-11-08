// Samples the first car of the play band over 6 s while the town is redrawn, through the DevTools protocol.
const [, , url] = process.argv;
const PORT = process.env.PORT ?? 9333;
const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const wait = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, 2500));
const expr = `(async () => {
  const s = []; let last = null, redraws = 0;
  for (let k = 0; k < 80; k++) {
    for (const [n, sel] of [['a', '.iso-band .iso-car'], ['b', '.iso-band .iso-car.slow']]) {
      const el = document.querySelector(sel); if (n === 'a' && el !== last) { redraws++; last = el; }
      const r = el.getBoundingClientRect(); s.push([n, k, Math.round(r.x), +getComputedStyle(el).opacity]);
    }
    await new Promise(res => setTimeout(res, 75));
  }
  const back = [];
  for (const n of ['a','b']) { const t = s.filter(x => x[0] === n); for (let i = 1; i < t.length; i++) if (t[i][2] < t[i-1][2] - 2 && t[i-1][3] > 0.2 && t[i][3] > 0.2) back.push([n, t[i-1], t[i]]); }
  const xs = s.filter(x => x[0]==='a').map(x => x[2]);
  return JSON.stringify({ redraws, back, xmin: Math.min(...xs), xmax: Math.max(...xs), sample: xs.slice(0, 12) });
})()`;
const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
console.log(r.result.result.value ?? JSON.stringify(r.result));
ws.close();
