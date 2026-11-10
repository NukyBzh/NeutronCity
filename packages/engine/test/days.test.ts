import { describe, expect, it } from 'vitest';
import {
  DAY_MINUTES, END_HOUR, START_HOUR, SURPRISE_KINDS, curveAt, demandAt, drawSurprises, validateDay, type DayDef,
} from '../src/index';
import { DAYS, DAY_FILES, SHOP, TEXTS } from './content';

const SEEDS = 1000;

describe('content/days', () => {
  it('has the three V1 days, one per level, each file named after its id', () => {
    expect(DAYS.map((d) => d.id).sort()).toEqual(['ete', 'hiver', 'printemps']);
    expect(DAYS.map((d) => d.level).sort()).toEqual([1, 2, 3]);
    DAYS.forEach((d, i) => expect(DAY_FILES[i]).toBe(`${d.id}.yaml`));
  });

  it.each(DAYS.map((d) => [d.id, d] as const))('%s: every text it uses exists', (_id, day) => {
    const ids = [`day.${day.id}.title`, `day.${day.id}.level`, ...day.lines.map((l) => l.say), ...day.surprises.map((k) => `surprise.${k}`)];
    expect(ids.filter((id) => !(id in TEXTS))).toEqual([]);
  });

  it.each(DAYS.map((d) => [d.id, d] as const))('%s: the curve alone stays below 9 %%/h (D-16)', (_id, day) => {
    for (let m = 0; m < 24 * 60; m++) {
      const a = curveAt(day, m / 60);
      const b = curveAt(day, (m + 1) / 60);
      expect(Math.abs(b.elec - a.elec) * 60).toBeLessThanOrEqual(9 + 1e-9);
      expect(Math.abs(b.heat - a.heat) * 60).toBeLessThanOrEqual(9 + 1e-9);
    }
  });

  it.each(DAYS.map((d) => [d.id, d] as const))(`%s is balanced with the surprises of ${SEEDS} seeds (D-01, D-05)`, (_id, day: DayDef) => {
    for (let seed = 0; seed < SEEDS; seed++) {
      const sur = drawSurprises(day, seed);
      let prev = demandAt(day, sur, START_HOUR);
      for (let m = 1; m <= DAY_MINUTES; m++) {
        const d = demandAt(day, sur, START_HOUR + m / 60);
        if (d.elec + d.heat > 100) throw new Error(`${day.id} seed ${seed} minute ${m}: elec + heat = ${d.elec + d.heat}`);
        const slope = Math.max(Math.abs(d.elec - prev.elec), Math.abs(d.heat - prev.heat)) * 60;
        if (slope > 12.5 + 1e-9) throw new Error(`${day.id} seed ${seed} minute ${m}: slope ${slope} %/h`);
        prev = d;
      }
    }
  }, 60000);

  it('the day check rejects broken files with a clear message', () => {
    expect(() => validateDay({ id: 'x', format: 2 })).toThrow(/format/);
    expect(() => validateDay({ id: 'x', format: 1, balance: 'balanced', level: 1, points: [[0, 80, 30], [24, 50, 0]] })).toThrow(/D-01/);
    expect(() => validateDay({ id: 'x', format: 1, balance: 'unbalanced', level: 1, points: [[0, 50, 0], [24, 50, 0]] })).toThrow(/balance/);
  });
});

describe('content/shop', () => {
  it('every item has its text and a sensible price', () => {
    expect(SHOP.filter((i) => !(`shop.${i.id}` in TEXTS))).toEqual([]);
    expect(SURPRISE_KINDS.length).toBe(11);
    expect(END_HOUR - START_HOUR).toBe(18);
  });
});
