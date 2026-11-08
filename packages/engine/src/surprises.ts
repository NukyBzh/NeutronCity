/**
 * Surprises of a day (a TV match, a cold wave, a mild spell), drawn from a seed given by the user interface (a new
 * seed each game, kept so a game can be replayed exactly). Each one is announced by Cassandra one hour before it
 * starts and changes demand gently: in a balanced day, curve slope (≤ 4.5 %/h) + surprise slope (≤ 3.5 %/h) stays
 * below the ramp of the plant (10 %/h, D-05).
 */
import { END_HOUR, isHeatingDay, type DayDef, type SurpriseKind } from './day';
import { rng } from './rng';

export interface SurpriseSpec {
  /** Change of demand at full strength, % of the core. */
  elec: number;
  heat: number;
  /** Game hours to rise, to hold, to fall back. */
  rise: number;
  hold: number;
  fall: number;
  needsHeat: boolean;
}

export const SURPRISE_SPEC: Record<SurpriseKind, SurpriseSpec> = {
  peak: { elec: 7, heat: 0, rise: 2, hold: 1, fall: 2, needsHeat: false },
  coldWave: { elec: 0, heat: 7, rise: 2, hold: 2, fall: 2, needsHeat: true },
  mildSpell: { elec: 0, heat: -6, rise: 2, hold: 2, fall: 2, needsHeat: true },
};
/** How long before it starts Cassandra announces a surprise (game hours). */
export const ANNOUNCE_HOURS = 1;
/** Surprises start between these hours (half-hour steps). */
const FIRST_START = 9;
const LAST_START = 19;

export interface Surprise {
  kind: SurpriseKind;
  start: number;
  end: number;
}

export const surpriseEnd = (kind: SurpriseKind, start: number): number => {
  const s = SURPRISE_SPEC[kind];
  return start + s.rise + s.hold + s.fall;
};

/** A half-hour step between `from` and `to` (both included). */
const halfHourBetween = (r: () => number, from: number, to: number): number => from + Math.floor(r() * (Math.floor((to - from) * 2) + 1)) / 2;
const duration = (k: SurpriseKind): number => surpriseEnd(k, 0);

/**
 * Up to two surprises of different kinds (one if the day allows only one), the second starting at least an hour after
 * the first ends, all starting between 9 h and 19 h and over before midnight. Built directly, so every seed works.
 */
export function drawSurprises(day: DayDef, seed: number): Surprise[] {
  const r = rng(seed);
  const heating = isHeatingDay(day);
  const pool = day.surprises.filter((k) => heating || !SURPRISE_SPEC[k].needsHeat);
  if (pool.length === 0) return [];
  const k1 = pool[Math.floor(r() * pool.length)]!;
  if (pool.length === 1) {
    const start = halfHourBetween(r, FIRST_START, Math.min(LAST_START, END_HOUR - duration(k1)));
    return [{ kind: k1, start, end: surpriseEnd(k1, start) }];
  }
  const others = pool.filter((k) => k !== k1);
  const k2 = others[Math.floor(r() * others.length)]!;
  const s1 = halfHourBetween(r, FIRST_START, Math.min(LAST_START - duration(k1) - 1, END_HOUR - duration(k1) - 1 - duration(k2)));
  const e1 = surpriseEnd(k1, s1);
  const s2 = halfHourBetween(r, e1 + 1, Math.min(LAST_START, END_HOUR - duration(k2)));
  return [{ kind: k1, start: s1, end: e1 }, { kind: k2, start: s2, end: surpriseEnd(k2, s2) }];
}

/** Strength of a surprise at a game hour: 0 → 1 while rising, 1 while holding, 1 → 0 while falling. */
export function surpriseWeight(s: Surprise, hour: number): number {
  const spec = SURPRISE_SPEC[s.kind];
  const t = hour - s.start;
  if (t <= 0 || hour >= s.end) return 0;
  if (t < spec.rise) return t / spec.rise;
  if (t < spec.rise + spec.hold) return 1;
  return (s.end - hour) / spec.fall;
}
