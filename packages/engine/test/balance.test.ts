/**
 * Balance of the events, the stars and the money (lot L7.2, D-22), with simulated players. The full report with more
 * games is written by tools/equilibrage (docs/EQUILIBRAGE.md).
 */
import { describe, expect, it } from 'vitest';
import {
  CHILD, IDLE, NO_REPAIR, PERFECT, SURPRISE_SPEC, campaign, drawSurprises, playDay, STAR_THRESHOLDS, starsOf, type DayDef, type SurpriseKind,
} from '../src/index';
import { DAYS, SHOP } from './content';

const SEEDS = 40;
const seeds = Array.from({ length: SEEDS }, (_, i) => i + 1);
const day = (id: string): DayDef => DAYS.find((d) => d.id === id)!;
const hasCut = (d: DayDef, seed: number): boolean => drawSurprises(d, seed).some((e) => SURPRISE_SPEC[e.kind].cut);

describe('how often the events come (owner\'s weights)', () => {
  it('2 or 3 events a day; no kind on every day, kinds of weight 3 more often than kinds of weight 1', () => {
    for (const d of DAYS) {
      const seen: Partial<Record<SurpriseKind, number>> = {};
      for (let seed = 1; seed <= 400; seed++) {
        const ev = drawSurprises(d, seed);
        expect(ev.length, `${d.id} seed ${seed}`).toBeGreaterThanOrEqual(2);
        expect(ev.length).toBeLessThanOrEqual(3);
        for (const e of ev) seen[e.kind] = (seen[e.kind] ?? 0) + 1 / 400;
      }
      for (const k of d.surprises) {
        if (SURPRISE_SPEC[k].needsHeat && !(seen[k] ?? 0)) continue;
        expect(seen[k] ?? 0, `${d.id} ${k}`).toBeGreaterThan(0.03);
        expect(seen[k] ?? 0, `${d.id} ${k}`).toBeLessThan(0.8);
      }
    }
    const winter = (k: SurpriseKind): number => {
      let n = 0;
      for (let seed = 1; seed <= 400; seed++) if (drawSurprises(day('hiver'), seed).some((e) => e.kind === k)) n++;
      return n;
    };
    expect(winter('storm')).toBeGreaterThan(winter('party'));
    expect(winter('peak')).toBeGreaterThan(winter('mildSpell'));
  });
});

describe('stars (3 from 75 %, 2 from 45 %)', () => {
  it('thresholds', () => {
    expect(STAR_THRESHOLDS).toEqual({ two: 0.45, three: 0.75 });
    expect(starsOf(75, 100)).toBe(3);
    expect(starsOf(74, 100)).toBe(2);
    expect(starsOf(45, 100)).toBe(2);
    expect(starsOf(44, 100)).toBe(1);
  });

  it.each(DAYS.map((d) => [d.id, d] as const))('%s: perfect 3 stars, attentive child at least 2 and mostly 3, idle 1', (_id, d) => {
    let child3 = 0;
    for (const seed of seeds) {
      expect(playDay(d, seed, PERFECT).result.stars, `perfect seed ${seed}`).toBe(3);
      const c = playDay(d, seed, CHILD).result.stars;
      expect(c, `child seed ${seed}`).toBeGreaterThanOrEqual(2);
      if (c === 3) child3++;
      expect(playDay(d, seed, IDLE).result.stars, `idle seed ${seed}`).toBe(1);
    }
    expect(child3 / SEEDS).toBeGreaterThanOrEqual(0.7);
  }, 60000);

  it.each(DAYS.map((d) => [d.id, d] as const))('%s: leaving a quarter dark costs a star; days without a cut keep 3', (_id, d) => {
    let cut = 0;
    let lost = 0;
    for (const seed of seeds) {
      const stars = playDay(d, seed, NO_REPAIR).result.stars;
      if (hasCut(d, seed)) {
        cut++;
        if (stars < 3) lost++;
      } else expect(stars, `seed ${seed}`).toBe(3);
    }
    expect(cut).toBeGreaterThan(0);
    expect(lost / cut).toBeGreaterThanOrEqual(0.9);
  }, 60000);
});

describe('money', () => {
  it('an attentive child completes the town in 15 to 25 days', () => {
    const c = campaign(DAYS, SHOP, CHILD);
    expect(c.complete).not.toBeNull();
    expect(c.complete!).toBeGreaterThanOrEqual(15);
    expect(c.complete!).toBeLessThanOrEqual(25);
    // The first building after one or two days.
    expect(c.bought[0]!.day).toBeLessThanOrEqual(2);
  }, 60000);
});
