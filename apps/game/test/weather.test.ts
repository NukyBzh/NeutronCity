import { describe, expect, it } from 'vitest';
import { SURPRISE_SPEC, surpriseEnd, type Surprise, type SurpriseKind } from '@neutron/engine';
import { FIREWORK_SECONDS, LIGHTNING_SECONDS, NO_WEATHER, PARTY_FROM, hasWeather, weatherOf } from '../src/play/iso/weather';

/** One event starting at `start`, as the engine draws it. */
const ev = (kind: SurpriseKind, start: number, more: Partial<Surprise> = {}): Surprise => ({ kind, start, end: surpriseEnd(kind, start), ...more });
/** Middle of the hold of an event: full strength. */
const middle = (kind: SurpriseKind, start: number): number => start + SURPRISE_SPEC[kind].rise + SURPRISE_SPEC[kind].hold / 2;

describe('what the events paint over the town (lot L10.4, R2-01)', () => {
  it('a quiet hour paints nothing at all', () => {
    expect(weatherOf([], 14)).toEqual(NO_WEATHER);
    expect(hasWeather(NO_WEATHER)).toBe(false);
    // An event that is over paints nothing either.
    const s = ev('heatwave', 10);
    expect(weatherOf([s], s.end + 1)).toEqual(NO_WEATHER);
  });

  it('each event paints its own layer, and only its own', () => {
    const cases: [SurpriseKind, keyof typeof NO_WEATHER][] = [
      ['heatwave', 'heat'], ['coldWave', 'cold'], ['mildSpell', 'mild'], ['storm', 'storm'], ['party', 'party'],
    ];
    for (const [kind, key] of cases) {
      const s = ev(kind, SURPRISE_SPEC[kind].from);
      const w = weatherOf([s], middle(kind, s.start));
      expect(w[key], kind).toBe(1);
      for (const other of Object.keys(NO_WEATHER) as (keyof typeof NO_WEATHER)[]) {
        if (other !== key) expect(w[other], `${kind} → ${other}`).toBe(NO_WEATHER[other]);
      }
    }
  });

  it('rises and falls with the event, in quarters, so a layer changes about ten times a day', () => {
    const s = ev('heatwave', 10);
    const spec = SURPRISE_SPEC.heatwave;
    expect(weatherOf([s], s.start).heat).toBe(0);
    expect(weatherOf([s], s.start + spec.rise / 2).heat).toBe(0.5);
    expect(weatherOf([s], middle('heatwave', s.start)).heat).toBe(1);
    expect(weatherOf([s], s.end - spec.fall / 2).heat).toBe(0.5);
    const seen = new Set<number>();
    for (let h = s.start; h < s.end; h += 1 / 60) seen.add(weatherOf([s], h).heat);
    expect([...seen].sort()).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('the windows of a demand peak light up once, at half strength, and go off again', () => {
    const s = ev('peak', 18);
    const spec = SURPRISE_SPEC.peak;
    expect(weatherOf([s], s.start + spec.rise * 0.3).lit).toBe(false);
    expect(weatherOf([s], s.start + spec.rise * 0.7).lit).toBe(true);
    expect(weatherOf([s], middle('peak', s.start)).lit).toBe(true);
    expect(weatherOf([s], s.end - spec.fall * 0.1).lit).toBe(false);
    // Nothing is painted over the town for a peak: only the pictures of the flats change.
    expect(hasWeather(weatherOf([s], middle('peak', s.start)))).toBe(false);
  });

  it('the storm calms down as soon as the child has sent the truck', () => {
    const s = ev('storm', 10);
    expect(weatherOf([s], middle('storm', s.start)).storm).toBe(1);
    // Helped at once: the rain is already weak half an hour later, and the event is over sooner.
    const helped = { ...s, fixedAt: s.start + 1 };
    expect(weatherOf([helped], s.start + 2.5).storm).toBe(0.25);
    expect(weatherOf([helped], middle('storm', s.start)).storm).toBe(0);
  });

  it('several events at once each paint their own layer', () => {
    const w = weatherOf([ev('heatwave', 10), ev('party', 19)], middle('party', 19));
    expect(w.party).toBe(1);
    expect(w.heat).toBe(0);
    const both = weatherOf([ev('coldWave', 10), ev('storm', 10)], middle('storm', 10));
    expect(both.cold).toBeGreaterThan(0);
    expect(both.storm).toBeGreaterThan(0);
    expect(hasWeather(both)).toBe(true);
  });

  it('the fireworks only start once the party is really on', () => {
    const s = ev('party', 19);
    expect(weatherOf([s], s.start + SURPRISE_SPEC.party.rise * 0.2).party).toBeLessThan(PARTY_FROM);
    expect(weatherOf([s], middle('party', s.start)).party).toBeGreaterThanOrEqual(PARTY_FROM);
  });

  it('the drawing and the sound share the same beat', () => {
    expect(LIGHTNING_SECONDS).toBeGreaterThan(FIREWORK_SECONDS);
    expect(FIREWORK_SECONDS).toBeGreaterThan(1);
  });
});
