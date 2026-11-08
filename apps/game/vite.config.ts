import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

// Relative base so the same build works in a browser and inside Tauri (lot L8). Port 5180: the NPP project uses
// 5173–5176 on the same PC. No inlined assets (the Tauri CSP blocks data: URIs for fonts).
export default defineConfig({
  base: './',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5180, strictPort: true },
  build: { target: 'es2022', assetsInlineLimit: 0 },
});
