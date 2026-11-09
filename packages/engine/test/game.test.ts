import { describe, expect, it } from 'vitest';
import {
  DAY_MINUTES, MAX_SURPRISES, NO_MODS, SURPRISE_SPEC, dayResult, demandAt, drawSurprises, gaugeOf, hourOf, isHeatingDay, maxEuros, newGame,
  isSurplus, setSetpoints, simulate, stepMinute, townHappiness, type DayDef, type GameState,
} from '../src/index';
import { DAYS, SHOP } from './content';

/** Follows the demand a quarter of an hour ahead, on the sliders' 5 % steps. */
const ahead = (day: DayDef) => (s: GameState) => {
  const d = demandAt(day, s.surprises, hourOf(s) + 0.25, s.effects);
  return { elec: Math.round(d.elec / 5) * 5, heat: Math.round(d.heat / 5) * 5 };
};
const idle = () => null;

describe.each(DAYS.map((d) => [d.id, d] as const))('game on %s', (_id, day) => {
  it('same seed and same moves ⇒ same result, to the euro', () => {
    for (const seed of [1, 42, 2026]) {
      const a = simulate(day, seed, ahead(day), [], NO_MODS, true);
      const b = simulate(day, seed, ahead(day), [], NO_MODS, true);
      expect(a).toEqual(b);
      expect(Number.isInteger(a.euros)).toBe(true);
    }
  });

  it('a player who anticipates (and repairs at once) gets 3 stars; one who never moves gets at least 1 but not 3 (D-02)', () => {
    for (const seed of [3, 17, 99, 512, 777]) {
      const played = simulate(day, seed, ahead(day), [], NO_MODS, true);
      const good = dayResult(day, played);
      const lazy = dayResult(day, simulate(day, seed, idle));
      expect(good.stars, `seed ${seed}`).toBe(3);
      expect(good.advice).toBe('bravo');
      expect(good.euros - played.stats.rewards).toBeLessThanOrEqual(good.max);
      expect(lazy.stars, `seed ${seed}`).toBeGreaterThanOrEqual(1);
      expect(lazy.stars, `seed ${seed}`).toBeLessThan(3);
      expect(lazy.advice).not.toBe('bravo');
    }
  });

  it('the plant never moves faster than the ramp nor beyond the core (D-01, D-05)', () => {
    let s = newGame(day, 5);
    let flip = false;
    while (s.minute < DAY_MINUTES) {
      if (s.minute % 90 === 0) {
        flip = !flip;
        s = setSetpoints(s, flip ? 95 : 10, flip ? 60 : 0, flip ? 'heat' : 'elec');
      }
      const before = s.plant;
      s = stepMinute(day, s);
      expect(Math.abs(s.plant.elec - before.elec)).toBeLessThanOrEqual(day.rampPctPerHour / 60 + 1e-9);
      expect(Math.abs(s.plant.heat - before.heat)).toBeLessThanOrEqual(day.rampPctPerHour / 60 + 1e-9);
      expect(s.plant.setElec + s.plant.setHeat).toBeLessThanOrEqual(100);
      expect(s.plant.elec + s.plant.heat).toBeLessThanOrEqual(100 + 1e-9);
    }
  });

  it('pays only what the D-02 scale allows', () => {
    const s = simulate(day, 8, ahead(day), [], NO_MODS, true);
    expect(s.euros - s.stats.rewards).toBeLessThanOrEqual(maxEuros(day, s.surprises));
    if (isHeatingDay(day)) expect(maxEuros(day, s.surprises)).toBeGreaterThan(DAY_MINUTES * 2);
    // A day with no event changing the gain pays at most 2 € a minute for electricity alone.
    else if (!s.surprises.some((e) => SURPRISE_SPEC[e.kind].gain)) expect(maxEuros(day, s.surprises)).toBe(DAY_MINUTES * 2);
  });
});

describe('surprises', () => {
  it('1 to 3 events of different kinds, one at a time and an hour apart, in their own hours, over before midnight (D-21)', () => {
    for (const day of DAYS) {
      const counts = new Set<number>();
      for (let seed = 0; seed < 300; seed++) {
        const sur = drawSurprises(day, seed);
        counts.add(sur.length);
        expect(sur.length).toBeGreaterThanOrEqual(1);
        expect(sur.length).toBeLessThanOrEqual(MAX_SURPRISES);
        expect(new Set(sur.map((x) => x.kind)).size).toBe(sur.length);
        for (let i = 1; i < sur.length; i++) expect(sur[i]!.start).toBeGreaterThanOrEqual(sur[i - 1]!.end + 1);
        for (const x of sur) {
          const spec = SURPRISE_SPEC[x.kind];
          expect(day.surprises).toContain(x.kind);
          expect(x.start).toBeGreaterThanOrEqual(spec.from);
          expect(x.start).toBeLessThanOrEqual(spec.to);
          expect(x.end).toBeLessThanOrEqual(24);
          if (!isHeatingDay(day)) expect(spec.needsHeat).toBe(false);
          expect(x.quarter !== undefined).toBe(spec.cut === true);
        }
      }
      expect(counts.has(MAX_SURPRISES), day.id).toBe(true);
    }
  });

  it('a different seed usually gives different surprises', () => {
    const day = DAYS.find((d) => d.id === 'hiver')!;
    const all = new Set(Array.from({ length: 50 }, (_, s) => JSON.stringify(drawSurprises(day, s))));
    expect(all.size).toBeGreaterThan(10);
  });
});

describe('D-02 gauge and town happiness', () => {
  it('gauge thresholds', () => {
    expect([gaugeOf(3), gaugeOf(-3.01), gaugeOf(7), gaugeOf(-7.5)]).toEqual(['bien', 'presque', 'presque', 'loin']);
  });

  it('happiness starts at 40, only grows with purchases and stays ≤ 100', () => {
    expect(townHappiness(SHOP, [])).toBe(40);
    expect(townHappiness(SHOP, ['parc'])).toBeGreaterThan(40);
    expect(townHappiness(SHOP, SHOP.map((i) => i.id))).toBeLessThanOrEqual(100);
  });
});

describe('D-15: stay in the ±7 % band, wasted electricity costs money', () => {
  const day = DAYS.find((d) => d.id === 'ete')!;

  it('electricity more than 7 points above the demand costs 1 € a minute', () => {
    expect(isSurplus(60, 52)).toBe(true);
    expect(isSurplus(59, 52)).toBe(false);
    // Plant at 100 % all day while the town asks 32–85 %: mostly wasted, never paid much.
    const over = simulate(day, 4, () => ({ elec: 100, heat: 0 }));
    expect(over.stats.surplusElec).toBeGreaterThan(300);
    const r = dayResult(day, over);
    expect(r.advice).toBe('surplus');
    expect(r.stars).toBe(1);
  });

  it('the piggy bank never goes below 0', () => {
    let s = setSetpoints(newGame(day, 9), 100, 0, 'elec');
    let min = Infinity;
    while (s.minute < DAY_MINUTES) { s = stepMinute(day, s); min = Math.min(min, s.euros); }
    expect(min).toBeGreaterThanOrEqual(0);
  });

  it('a player who follows closely loses nothing to the penalty', () => {
    const good = simulate(day, 11, ahead(day));
    expect(good.stats.surplusElec).toBe(0);
  });
});
