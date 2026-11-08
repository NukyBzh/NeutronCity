import { describe, expect, it } from 'vitest';
import {
  END_HOUR, RAMP_PCT_PER_HOUR, SPRING, START_HOUR, SUMMER, demandAt, maxEuros, newPlay, starsOf, stepMinute, type DayDef, type PlayState,
} from '../src/maquette/fakeDay';

/** The mock-up days already follow the rules the real days will be tested against in lot L2. */
describe.each([SUMMER, SPRING])('mock-up day $id', (day: DayDef) => {
  it('is balanced: elec + heat ≤ 100 % and slopes below the ramp (D-01, D-05)', () => {
    for (let h = START_HOUR; h < END_HOUR; h += 1 / 60) {
      const a = demandAt(day, h);
      const b = demandAt(day, h + 1 / 60);
      expect(a.elec + a.heat).toBeLessThanOrEqual(100);
      expect(Math.abs(b.elec - a.elec) * 60).toBeLessThanOrEqual(8 + 1e-9);
      expect(Math.abs(b.heat - a.heat) * 60).toBeLessThanOrEqual(8 + 1e-9);
      expect(8).toBeLessThan(RAMP_PCT_PER_HOUR);
    }
  });

  const play = (driver: (s: PlayState) => PlayState): PlayState => {
    let s = newPlay(day);
    while (s.hour < END_HOUR) s = stepMinute(day, driver(s));
    return s;
  };

  it('a player who anticipates gets 3 stars, one who never moves does not (D-02)', () => {
    const ahead = play((s) => {
      const d = demandAt(day, s.hour + 0.25);
      return { ...s, setElec: d.elec, setHeat: d.heat };
    });
    const idle = play((s) => s);
    expect(starsOf(ahead.euros, maxEuros(day))).toBe(3);
    expect(starsOf(idle.euros, maxEuros(day))).toBeLessThan(3);
    expect(ahead.euros).toBeLessThanOrEqual(maxEuros(day));
  });

  it('replays to the same euros', () => {
    expect(play((s) => s).euros).toBe(play((s) => s).euros);
  });
});
