import { describe, expect, it } from 'vitest';
import { EMPTY, clearProgress, loadProgress, saveProgress } from '../src/save';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

describe('progress saved on the device', () => {
  it('comes back as it was saved', () => {
    const s = memory();
    const p = { version: 1 as const, wallet: 3120, owned: ['parc'], stars: { ete: 3, printemps: 1 }, lastDay: 'printemps' };
    saveProgress(p, s);
    expect(loadProgress(s)).toEqual(p);
  });

  it('starts fresh when nothing is saved, when the data is broken, or after « Nouveau joueur »', () => {
    const s = memory();
    expect(loadProgress(s)).toEqual(EMPTY);
    s.setItem('neutron-city.progress', '{not json');
    expect(loadProgress(s)).toEqual(EMPTY);
    s.setItem('neutron-city.progress', JSON.stringify({ version: 1, wallet: -5, owned: 'parc', stars: null }));
    expect(loadProgress(s)).toEqual(EMPTY);
    saveProgress({ ...EMPTY, wallet: 10 }, s);
    clearProgress(s);
    expect(loadProgress(s)).toEqual(EMPTY);
  });
});
