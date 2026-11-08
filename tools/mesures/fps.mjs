// Frame rate of the play screen with the CPU slowed down (tablet-like), through the DevTools protocol.
const [, , port, url, rate] = process.argv;
const PORT = port;
const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const wait = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Emulation.setCPUThrottlingRate', { rate: Number(rate) });
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, 4000));
const expr = `(async () => {
  const t = []; let last = performance.now(); const end = last + 8000;
  await new Promise(res => { const f = (now) => { t.push(now - last); last = now; if (now < end) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  t.sort((a, b) => a - b);
  const n = t.length; return JSON.stringify({ fps: +(n / 8).toFixed(1), median: +t[n >> 1].toFixed(1), p95: +t[Math.floor(n * 0.95)].toFixed(1), worst: +t[n - 1].toFixed(1), nodes: document.querySelectorAll('svg.city *').length });
})()`;
const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
console.log(rate + 'x', url.split('?')[1], r.result.result.value);
ws.close();
