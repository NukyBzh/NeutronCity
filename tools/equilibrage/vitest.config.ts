import { defineConfig } from 'vitest/config';

// Balance report (lot L7.2): `npx.cmd vitest run --config tools/equilibrage/vitest.config.ts`
export default defineConfig({
  test: { include: ['tools/equilibrage/*.test.ts'], environment: 'node', testTimeout: 600000 },
});
