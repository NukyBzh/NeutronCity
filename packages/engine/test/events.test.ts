import { describe, expect, it } from 'vitest';
import {
  DAY_MINUTES, NO_MODS, START_HOUR, SURPRISE_SPEC, canFix, coreCap, dayResult, demandAt, drawSurprises, eventMods, fixSurprise, hourOf,
  isActive, maxEuros, newGame, setSetpoints, simulate, starBonus, stepMinute, surpriseOver, type DayDef, type GameState, type Surprise,
  type SurpriseKind,
} from '../src/index';
import { DAYS, SHOP } from './content';

const day = (id: string): DayDef => DAYS.find((d) => d.id === id)!;
/** A game with only this event, starting at `start` (the rest of the day untouched). */
const withEvent = (d: DayDef, kind: SurpriseKind, start: number, extra: Partial<Surprise> = {}): GameState => {
  const s = newGame(d, 1);
  const ev: Surprise = { kind, start, end: start + SURPRISE_SPEC[kind].rise + SURPRISE_SPEC[kind].hold + SURPRISE_SPEC[kind].fall, ...extra };
  return { ...s, surprises: [ev] };
};
/** Plays minute by minute until `hour`, following the demand. */
const playTo = (d: DayDef, s: GameState, hour: number): GameState => {
  let g = s;
  while (hourOf(g) < hour) {
    const dem = demandAt(d, g.surprises, hourOf(g) + 0.25, g.effects);
    g = stepMinute(d, setSetpoints(g, Math.round(dem.elec), Math.round(dem.heat), 'elec'));
  }
  return g;
};
const ahead = (d: DayDef) => (s: GameState) => {
  const dem = demandAt(d, s.surprises, hourOf(s) + 0.25, s.effects);
  return { elec: Math.round(dem.elec / 5) * 5, heat: Math.round(dem.heat / 5) * 5 };
};

describe('events the child acts on (lot L7.1, D-21)', () => {
  it('a storm darkens a quarter until the child sends the truck; the repair takes an hour, then the lights come back', () => {
    const d = day('hiver');
    let g = playTo(d, withEvent(d, 'storm', 10, { quarter: 1 }), 11);
    expect(canFix(g.surprises[0]!, hourOf(g))).toBe(true);
    const before = demandAt(d, [], 11).elec;
    expect(demandAt(d, g.surprises, 11).elec).toBeLessThan(before);
    g = fixSurprise(g, 0);
    expect(g.surprises[0]!.fixedAt).toBe(11);
    expect(canFix(g.surprises[0]!, hourOf(g))).toBe(false);
    expect(surpriseOver(g.surprises[0]!)).toBe(11 + 1 + 2);
    // Without the truck it lasts its longest.
    expect(surpriseOver({ kind: 'storm', start: 10, end: 17 })).toBe(10 + 2 + 3 + 2);
  });

  it('nothing to act on before an event starts or once it is over', () => {
    const d = day('ete');
    const g = withEvent(d, 'squirrel', 12, { quarter: 0 });
    expect(fixSurprise(g, 0)).toBe(g);
    expect(fixSurprise(g, 5)).toBe(g);
  });

  it('a dark quarter pays less, and leaving it dark costs stars: the maximum counts a repair at once', () => {
    const d = day('ete');
    const storm: Surprise[] = [{ kind: 'squirrel', start: 10, end: 16.5, quarter: 2 }];
    const atOnce: Surprise[] = [{ ...storm[0]!, fixedAt: 10 }];
    expect(maxEuros(d, storm)).toBe(maxEuros(d, atOnce));
    expect(maxEuros(d, storm)).toBeLessThan(DAY_MINUTES * 2);
  });

  it('new inhabitants: a tap welcomes them and gives 150 € once; the reward never makes the stars', () => {
    const d = day('ete');
    let g = playTo(d, withEvent(d, 'newcomers', 9), 9.5);
    const euros = g.euros;
    g = fixSurprise(g, 0);
    expect(g.euros).toBe(euros + 150);
    expect(g.stats.rewards).toBe(150);
    expect(fixSurprise(g, 0).euros).toBe(g.euros);
    g = playTo(d, g, 12);
    expect(isActive(g.surprises[0]!, 12)).toBe(false);
  });

  it('class visit: an hour in a row with every output « bien » earns 100 €, once', () => {
    const d = day('ete');
    const g = playTo(d, withEvent(d, 'classVisit', 9), 11.5);
    expect(g.stats.rewards).toBe(100);
    expect(g.surprises[0]!.fixedAt).toBeDefined();
    // A player who never moves does not earn it.
    let idle = withEvent(d, 'classVisit', 9);
    while (hourOf(idle) < 12) idle = stepMinute(d, idle);
    expect(idle.stats.rewards).toBe(0);
  });

  it('heatwave: the plant may not go above 80 % (90 % with the battery), and the town makes do with it', () => {
    const d = day('ete');
    const sur: Surprise[] = [{ kind: 'heatwave', start: 10, end: 19 }];
    expect(coreCap(sur, 9)).toBe(100);
    expect(coreCap(sur, 14)).toBe(80);
    for (let h = 10; h <= 19; h += 0.25) expect(demandAt(d, sur, h).elec).toBeLessThanOrEqual(coreCap(sur, h) + 1e-9);
    let g = withEvent(d, 'heatwave', 10);
    g = setSetpoints(g, 100, 0, 'elec');
    while (hourOf(g) < 15) g = stepMinute(d, g);
    expect(g.plant.elec).toBeLessThanOrEqual(80 + 1e-9);
    const battery = drawSurprises(d, 0, { ...NO_MODS, heatwaveCap: 90 }).concat([]);
    for (const e of battery) if (e.kind === 'heatwave') expect(e.cap).toBe(90);
  });

  it('town party: twice the euros while it lasts', () => {
    const d = day('ete');
    const party: Surprise[] = [{ kind: 'party', start: 19, end: 23.5 }];
    expect(maxEuros(d, party)).toBeGreaterThan(DAY_MINUTES * 2);
  });

  it('valve and cleaning: the heat leak and the scaled exchanger end only once the child acts', () => {
    const d = day('hiver');
    for (const kind of ['heatLeak', 'scale'] as const) {
      expect(SURPRISE_SPEC[kind].fix).toBe(kind === 'heatLeak' ? 'hold' : 'taps');
      let g = playTo(d, withEvent(d, kind, 9), 10);
      expect(demandAt(d, g.surprises, 10).heat).toBeGreaterThan(demandAt(d, [], 10).heat);
      g = fixSurprise(g, 0);
      expect(surpriseOver(g.surprises[0]!)).toBeLessThan(9 + 2 + 3 + 2);
    }
  });
});

describe('buildings against events (lot L7.1)', () => {
  const quarterOf = (id: string): number | null => (id === 'hopital' ? 1 : null);

  it('the hospital keeps its quarter lit, the maison médicale softens bad events, the battery helps in a heatwave', () => {
    expect(eventMods(SHOP, [], quarterOf)).toEqual(NO_MODS);
    const all = eventMods(SHOP, SHOP.map((i) => i.id), quarterOf);
    expect(all).toEqual({ protectedQuarter: 1, strength: 0.8, heatwaveCap: 90 });
    for (const d of DAYS) {
      for (let seed = 0; seed < 300; seed++) {
        for (const e of drawSurprises(d, seed, all)) {
          if (SURPRISE_SPEC[e.kind].cut) expect(e.quarter).not.toBe(1);
          expect(e.k ?? 1).toBe(SURPRISE_SPEC[e.kind].negative ? 0.8 : 1);
        }
      }
    }
  });

  it('a softened storm darkens less', () => {
    const d = day('hiver');
    const strong: Surprise[] = [{ kind: 'storm', start: 10, end: 17, quarter: 0 }];
    const soft: Surprise[] = [{ ...strong[0]!, k: 0.8 }];
    expect(demandAt(d, soft, 13).elec).toBeGreaterThan(demandAt(d, strong, 13).elec);
  });
});

describe('the town bonus depends on the stars (D-21)', () => {
  it('all with 3 stars, half with 2, none with 1', () => {
    expect([starBonus(1600, 3), starBonus(1600, 2), starBonus(1600, 1)]).toEqual([1600, 800, 0]);
  });
});

describe('every day stays possible with every event (lot L7.1)', () => {
  it.each(DAYS.map((d) => [d.id, d] as const))('%s: 3 stars for a player who looks ahead and repairs at once, on 40 seeds', (_id, d) => {
    for (let seed = 100; seed < 140; seed++) {
      const r = dayResult(d, simulate(d, seed, ahead(d), [], NO_MODS, true));
      expect(r.stars, `seed ${seed}`).toBe(3);
    }
  });

  it('replaying a game with the same seed, moves and repairs gives the same euros', () => {
    const d = day('hiver');
    const a = simulate(d, 7, ahead(d), [], NO_MODS, true);
    const b = simulate(d, 7, ahead(d), [], NO_MODS, true);
    expect(a).toEqual(b);
    expect(a.minute).toBe(DAY_MINUTES);
    expect(START_HOUR).toBe(6);
  });
});
