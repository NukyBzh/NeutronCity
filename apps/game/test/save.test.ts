import { describe, expect, it } from 'vitest';
import { EMPTY, clearProgress, loadProgress, saveProgress } from '../src/save';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

describe('progress saved on the device', () => {
  it('keeps the lots chosen for the buildings, and drops broken ones (lot L9.4)', () => {
    const s = memory();
    s.setItem('neutron-city.progress', JSON.stringify({ ...EMPTY, places: { parc: [9, 6], ecole: 'x', piscine: [1.5, 2], fontaine: [4] } }));
    expect(loadProgress(s).places).toEqual({ parc: [9, 6] });
    s.setItem('neutron-city.progress', JSON.stringify({ version: 1, wallet: 0, owned: ['parc'], stars: {}, lastDay: null }));
    expect(loadProgress(s).places).toEqual({});
  });

  it('comes back as it was saved', () => {
    const s = memory();
    const p = { version: 1 as const, wallet: 3120, owned: ['parc'], stars: { ete: 3, printemps: 1 }, lastDay: 'printemps', tuto: true, seen: ['storm'], places: { parc: [9, 6] as [number, number] }, quarters: [0, 2] };
    saveProgress(p, s);
    expect(loadProgress(s)).toEqual(p);
  });

  it('keeps the quarters for sale bought, and drops what is not one (lot L10.6b3)', () => {
    const s = memory();
    // Progress saved before this lot: no quarter, the town keeps its 30 lots.
    s.setItem('neutron-city.progress', JSON.stringify({ version: 1, wallet: 0, owned: ['parc'], stars: {}, lastDay: null }));
    expect(loadProgress(s).quarters).toEqual([]);
    // Each quarter once, in order; anything that is not a quarter of the town goes.
    s.setItem('neutron-city.progress', JSON.stringify({ ...EMPTY, quarters: [2, 0, 2, 3, -1, 1.5, 'x', null] }));
    expect(loadProgress(s).quarters).toEqual([0, 2]);
    s.setItem('neutron-city.progress', JSON.stringify({ ...EMPTY, quarters: 'tout' }));
    expect(loadProgress(s).quarters).toEqual([]);
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

  it('shows the tutorial to a new player only (lot L5), also for progress saved before v0.7.0', () => {
    const s = memory();
    expect(loadProgress(s).tuto).toBe(false);
    s.setItem('neutron-city.progress', JSON.stringify({ version: 1, wallet: 40, owned: [], stars: { ete: 2 }, lastDay: 'ete' }));
    expect(loadProgress(s).tuto).toBe(true);
    s.setItem('neutron-city.progress', JSON.stringify({ version: 1, wallet: 0, owned: [], stars: {}, lastDay: null }));
    expect(loadProgress(s).tuto).toBe(false);
  });
});
