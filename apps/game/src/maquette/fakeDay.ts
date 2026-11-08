/**
 * TEMPORARY model of the clickable mock-up (lot L1): a fixed spring day, the ramp (D-05) and the money scale (D-02),
 * just enough to feel the rhythm of a day. Replaced by `packages/engine` and `content/days/` in lot L2 — do not build
 * on it.
 */
import type { GaugeState } from '../ui/ui';

export const START_HOUR = 6;
export const END_HOUR = 24;
/** A day (6 h → midnight) lasts about 5 minutes. */
export const REAL_SECONDS_PER_GAME_HOUR = 300 / (END_HOUR - START_HOUR);
/** D-05: each output moves 10 % per game hour towards the player's setpoint. */
export const RAMP_PCT_PER_HOUR = 10;
/** How far ahead the demand is shown (game hours). */
export const LOOK_AHEAD_HOURS = 3;

type Curve = [hour: number, pct: number][];
export interface DayDef {
  id: 'ete' | 'printemps' | 'hiver';
  elec: Curve;
  heat: Curve;
  surprise?: { kind: 'peak'; start: number; full: number; endFull: number; end: number; elecPct: number };
}

/** "Journée de printemps": electricity 40–65 %, a little heating in the morning and evening, a TV match at night. */
export const SPRING: DayDef = {
  id: 'printemps',
  elec: [[6, 42], [7, 50], [9, 55], [12, 52], [14, 48], [17, 55], [19, 63], [21, 56], [24, 42]],
  heat: [[6, 12], [8, 15], [10, 8], [12, 5], [16, 5], [18, 10], [20, 15], [22, 14], [24, 10]],
  surprise: { kind: 'peak', start: 19, full: 20.5, endFull: 21, end: 23, elecPct: 6 },
};

/** "Journée d'été": electricity only, air conditioning in the afternoon. */
export const SUMMER: DayDef = {
  id: 'ete',
  elec: [[6, 40], [9, 55], [13, 70], [16, 72], [18, 62], [20, 68], [22, 55], [24, 42]],
  heat: [[6, 0], [24, 0]],
};

const interp =(c: Curve, h: number): number => {
  for (let i = 1; i < c.length; i++) {
    const [h1, v1] = c[i]!;
    const [h0, v0] = c[i - 1]!;
    if (h <= h1) return v0 + ((h - h0) / (h1 - h0 || 1)) * (v1 - v0);
  }
  return c[c.length - 1]![1];
};

export function surpriseWeight(day: DayDef, h: number): number {
  const s = day.surprise;
  if (!s || h <= s.start || h >= s.end) return 0;
  if (h < s.full) return (h - s.start) / (s.full - s.start);
  if (h > s.endFull) return (s.end - h) / (s.end - s.endFull);
  return 1;
}

export function demandAt(day: DayDef, h: number): { elec: number; heat: number } {
  const elec = interp(day.elec, h) + surpriseWeight(day, h) * (day.surprise?.elecPct ?? 0);
  return { elec, heat: interp(day.heat, h) };
}

/** D-02: gap in core points → gauge and euros per game minute. */
export function gaugeOf(gap: number): GaugeState {
  const g = Math.abs(gap);
  return g <= 3 ? 'bien' : g <= 8 ? 'presque' : 'loin';
}
export const EUROS_PER_MINUTE: Record<GaugeState, number> = { bien: 2, presque: 1, loin: 0 };

/** Most a day can pay: 2 € per minute for each output the town asks for. */
export function maxEuros(day: DayDef): number {
  const minutes = (END_HOUR - START_HOUR) * 60;
  const outputs = day.heat.some(([, v]) => v > 0) ? 2 : 1;
  return minutes * 2 * outputs;
}

/** Stars (D-02): 1 for a finished day, 2 from half the maximum, 3 from 80 %. */
export function starsOf(earned: number, max: number): number {
  const r = max > 0 ? earned / max : 0;
  return r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1;
}

export interface Sample { h: number; elec: number; heat: number }

export interface PlayState {
  /** Game minutes since 6 h (an integer, so a day is exactly 1 080 steps). */
  minute: number;
  hour: number;
  /** Player's setpoints and plant outputs, % of the core (D-01). */
  setElec: number;
  setHeat: number;
  elec: number;
  heat: number;
  euros: number;
  /** Game minutes that paid something (one flying coin every 10). */
  paidMinutes: number;
  history: Sample[];
}

export const step5 = (x: number): number => Math.round(x / 5) * 5;

export function newPlay(day: DayDef): PlayState {
  const d = demandAt(day, START_HOUR);
  const e = step5(d.elec);
  const h = step5(d.heat);
  return { minute: 0, hour: START_HOUR, setElec: e, setHeat: h, elec: e, heat: h, euros: 0, paidMinutes: 0, history: [{ h: START_HOUR, elec: e, heat: h }] };
}

const toward = (from: number, to: number, max: number): number => (Math.abs(to - from) <= max ? to : from + Math.sign(to - from) * max);

/** One game minute. */
export function stepMinute(day: DayDef, s: PlayState): PlayState {
  if (s.minute >= (END_HOUR - START_HOUR) * 60) return s;
  const minute = s.minute + 1;
  const hour = START_HOUR + minute / 60;
  const elec = toward(s.elec, s.setElec, RAMP_PCT_PER_HOUR / 60);
  const heat = toward(s.heat, s.setHeat, RAMP_PCT_PER_HOUR / 60);
  const d = demandAt(day, hour);
  let pay = EUROS_PER_MINUTE[gaugeOf(elec - d.elec)];
  if (d.heat > 0) pay += EUROS_PER_MINUTE[gaugeOf(heat - d.heat)];
  const history = minute % 5 === 0 ? [...s.history, { h: hour, elec, heat }] : s.history;
  return { ...s, minute, hour, elec, heat, euros: s.euros + pay, paidMinutes: s.paidMinutes + (pay > 0 ? 1 : 0), history };
}
