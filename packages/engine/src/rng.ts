/**
 * Small seeded generator (mulberry32): the same seed always gives the same numbers. Copied from the NPP project
 * (branch jeu-decouverte, apps/web/src/game/day.ts, `rng`). The seed comes from the user interface; the engine never
 * draws randomness by itself.
 */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
