/**
 * A game: one day played minute by minute. Pure functions: the interface keeps the state, calls `stepMinute` as game
 * time passes and `setSetpoints` when the player moves a slider. Money (D-02) is counted in whole euros so a replay
 * with the same seed and the same moves gives exactly the same result.
 */
import { DAY_MINUTES, START_HOUR, curveAt, isHeatingDay, type DayDef } from './day';
import { clampSetpoints, stepPlant, type Output, type PlantState } from './plant';
import { effectsAt, type TownEffect } from './effects';
import {
  NO_MODS, SURPRISE_SPEC, canFix, coreCap, drawSurprises, fixedAtOnce, gainAt, isActive, surpriseWeight, type EventMods, type Surprise,
} from './surprises';

export type Gauge = 'bien' | 'presque' | 'loin';

/** D-15: the player must stay in a band of ±7 core points around the demand. */
export const BAND_PCT = 7;
/** D-15: gap between production and demand, in core points → gauge (±3 « bien », ±7 « presque »). */
export function gaugeOf(gap: number): Gauge {
  const g = Math.abs(gap);
  return g <= 3 ? 'bien' : g <= BAND_PCT ? 'presque' : 'loin';
}
/** D-15: euros earned per game minute for one output inside the band. */
export const EUROS_PER_MINUTE: Record<Gauge, number> = { bien: 2, presque: 1, loin: 0 };
/** D-15: electricity produced above the band is wasted and costs this much per game minute. */
export const SURPLUS_PENALTY = 1;
/** True when electricity is produced above the band (wasted, D-15). */
export const isSurplus = (production: number, demand: number): boolean => production - demand > BAND_PCT;

export interface Demand { elec: number; heat: number }

/**
 * Town demand at a game hour: the day's curve, plus the surprises, plus the effects of the buildings bought (lot L6),
 * never below 0. If the buildings would push electricity + heat above 100 % (D-01), their additions shrink just enough.
 * During a heatwave the plant may not go above a lower limit: the town makes do with what it may produce (lot L7.1).
 */
export function demandAt(day: DayDef, surprises: readonly Surprise[], hour: number, effects: readonly TownEffect[] = []): Demand {
  let { elec, heat } = curveAt(day, hour);
  for (const s of surprises) {
    const w = surpriseWeight(s, hour) * (s.k ?? 1);
    elec += w * SURPRISE_SPEC[s.kind].elec;
    heat += w * SURPRISE_SPEC[s.kind].heat;
  }
  elec = Math.max(0, elec);
  heat = Math.max(0, heat);
  const cap = coreCap(surprises, hour);
  const limit = (d: Demand): Demand => (d.elec + d.heat > cap ? { elec: Math.max(0, cap - d.heat), heat: d.heat } : d);
  if (effects.length === 0) return limit({ elec, heat });
  let add = effectsAt(effects, hour);
  const pos = Math.max(0, add.elec) + Math.max(0, add.heat);
  const excess = elec + heat + add.elec + add.heat - 100;
  if (excess > 0 && pos > 0) {
    const k = Math.max(0, 1 - excess / pos);
    add = { elec: add.elec > 0 ? add.elec * k : add.elec, heat: add.heat > 0 ? add.heat * k : add.heat };
  }
  return limit({ elec: Math.max(0, elec + add.elec), heat: Math.max(0, heat + add.heat) });
}

export interface GameStats {
  /** Minutes in the red, per output. */
  redElec: number;
  redHeat: number;
  /** Minutes with electricity in the red during the evening peak (18–21 h). */
  redEvening: number;
  /** Minutes the town asked for heat. */
  heatMinutes: number;
  /** Minutes with electricity produced above the band (D-15). */
  surplusElec: number;
  /** Euros given by the events (inhabitants welcomed, class visit), already in the piggy bank. */
  rewards: number;
}

export interface GameState {
  seed: number;
  surprises: Surprise[];
  /** Effects of the buildings bought that apply to this day (lot L6), fixed for the whole day. */
  effects: TownEffect[];
  /** Game minutes since 6 h (integer: a day is exactly DAY_MINUTES steps). */
  minute: number;
  plant: PlantState;
  euros: number;
  /** Minutes that paid something (the interface drops a coin every 10). */
  paidMinutes: number;
  /** Class visit: game minutes in a row with every output « bien » so far. */
  visitRun: number;
  stats: GameStats;
}

export const hourOf = (s: GameState): number => START_HOUR + s.minute / 60;
export const isOver = (s: GameState): boolean => s.minute >= DAY_MINUTES;

/** Start of a day: the plant already produces what the town asks at 6 h (rounded to the sliders' 5 % steps). */
export function newGame(day: DayDef, seed: number, effects: readonly TownEffect[] = [], mods: EventMods = NO_MODS): GameState {
  const surprises = drawSurprises(day, seed, mods);
  const d = demandAt(day, surprises, START_HOUR, effects);
  const e = Math.round(d.elec / 5) * 5;
  const h = Math.round(d.heat / 5) * 5;
  return {
    seed, surprises, effects: [...effects], minute: 0,
    plant: { setElec: e, setHeat: h, elec: e, heat: h },
    euros: 0, paidMinutes: 0, visitRun: 0,
    stats: { redElec: 0, redHeat: 0, redEvening: 0, heatMinutes: 0, surplusElec: 0, rewards: 0 },
  };
}

/**
 * The child acts on an event (a tap on the quarter, a long press on the valve, the cleaning taps, welcoming the new
 * inhabitants): the repair starts, or the reward is given. Nothing happens if the event cannot be acted on now.
 */
export function fixSurprise(s: GameState, index: number): GameState {
  const ev = s.surprises[index];
  const hour = hourOf(s);
  if (!ev || !canFix(ev, hour)) return s;
  const surprises = s.surprises.map((x, i) => (i === index ? { ...x, fixedAt: hour } : x));
  const reward = SURPRISE_SPEC[ev.kind].reward ?? 0;
  return { ...s, surprises, euros: s.euros + reward, stats: { ...s.stats, rewards: s.stats.rewards + reward } };
}

/** The player moves one slider; D-01 keeps electricity + heat ≤ 100 %. */
export function setSetpoints(s: GameState, elecPct: number, heatPct: number, moved: Output): GameState {
  const c = clampSetpoints(elecPct, heatPct, moved);
  return { ...s, plant: { ...s.plant, setElec: c.elecPct, setHeat: c.heatPct } };
}

/** What the screen shows at the current minute: demand, and a gauge per output asked for (heat: null when none). */
export function gaugesOf(day: DayDef, s: GameState): { demand: Demand; elec: Gauge; heat: Gauge | null } {
  const demand = demandAt(day, s.surprises, hourOf(s), s.effects);
  return { demand, elec: gaugeOf(s.plant.elec - demand.elec), heat: demand.heat > 0 ? gaugeOf(s.plant.heat - demand.heat) : null };
}

/**
 * One game minute: the plant follows its setpoints, then the minute is paid and counted. Electricity above the band
 * costs SURPLUS_PENALTY (D-15); the piggy bank never goes below 0 (a child of 8 is not left in debt).
 */
export function stepMinute(day: DayDef, s: GameState): GameState {
  if (isOver(s)) return s;
  const minute = s.minute + 1;
  const hour = START_HOUR + minute / 60;
  let plant = stepPlant(s.plant, day.rampPctPerHour);
  // Heatwave: the plant may not go above the limit (electricity gives way first).
  const cap = coreCap(s.surprises, hour);
  if (plant.elec + plant.heat > cap) plant = { ...plant, elec: Math.max(0, cap - plant.heat) };
  const next = { ...s, minute, plant };
  const g = gaugesOf(day, next);
  const surplus = isSurplus(plant.elec, g.demand.elec);
  const earned = EUROS_PER_MINUTE[g.elec] + (g.heat ? EUROS_PER_MINUTE[g.heat] : 0);
  // Whole euros, rounded down (a dark quarter really pays less).
  const pay = Math.floor(earned * gainAt(s.surprises, hour) + 1e-9) - (surplus ? SURPLUS_PENALTY : 0);
  const st = s.stats;
  // Class visit: every output « bien » for long enough in a row earns the reward once.
  let surprises = next.surprises;
  let visitRun = s.visitRun;
  let reward = 0;
  const vi = surprises.findIndex((e) => SURPRISE_SPEC[e.kind].visit !== undefined && e.fixedAt === undefined && isActive(e, hour));
  if (vi >= 0) {
    const allGood = g.elec === 'bien' && (g.heat === null || g.heat === 'bien');
    visitRun = allGood ? visitRun + 1 : 0;
    const spec = SURPRISE_SPEC[surprises[vi]!.kind];
    if (visitRun >= (spec.visit ?? 0)) {
      reward = spec.reward ?? 0;
      surprises = surprises.map((e, i) => (i === vi ? { ...e, fixedAt: hour } : e));
      visitRun = 0;
    }
  } else visitRun = 0;
  return {
    ...next,
    surprises,
    visitRun,
    euros: Math.max(0, s.euros + pay) + reward,
    paidMinutes: s.paidMinutes + (pay > 0 ? 1 : 0),
    stats: {
      redElec: st.redElec + (g.elec === 'loin' ? 1 : 0),
      redHeat: st.redHeat + (g.heat === 'loin' ? 1 : 0),
      redEvening: st.redEvening + (g.elec === 'loin' && hour > 18 && hour <= 21 ? 1 : 0),
      heatMinutes: st.heatMinutes + (g.heat ? 1 : 0),
      surplusElec: st.surplusElec + (surplus ? 1 : 0),
      rewards: st.rewards + reward,
    },
  };
}

/**
 * Most a day can pay: 2 € a minute for each output the town asks for at that minute, times the events' gain, for a
 * player who starts every repair at once (so leaving a quarter dark costs stars). Rewards are extra.
 */
export function maxEuros(day: DayDef, surprises: readonly Surprise[], effects: readonly TownEffect[] = []): number {
  const ideal = fixedAtOnce(surprises);
  let total = 0;
  for (let m = 1; m <= DAY_MINUTES; m++) {
    const h = START_HOUR + m / 60;
    total += Math.floor((demandAt(day, ideal, h, effects).heat > 0 ? 4 : 2) * gainAt(ideal, h) + 1e-9);
  }
  return total;
}

/** Share of the town's bonus paid after a day, by stars (owner's choice, D-21): all with 3, half with 2, none with 1. */
export const BONUS_SHARE: Record<1 | 2 | 3, number> = { 1: 0, 2: 0.5, 3: 1 };
export const starBonus = (bonus: number, stars: 1 | 2 | 3): number => Math.round(bonus * BONUS_SHARE[stars]);

/** D-02 stars, thresholds tuned in lot L7.2 (D-22): 1 for a finished day, 2 from 45 % of the maximum, 3 from 75 %. */
export const STAR_THRESHOLDS = { two: 0.45, three: 0.75 } as const;
export function starsOf(euros: number, max: number): 1 | 2 | 3 {
  const r = max > 0 ? euros / max : 0;
  return r >= STAR_THRESHOLDS.three ? 3 : r >= STAR_THRESHOLDS.two ? 2 : 1;
}

export type Advice = 'bravo' | 'soir' | 'chaleur' | 'surplus' | 'anticiper';

export interface DayResult { euros: number; max: number; stars: 1 | 2 | 3; advice: Advice }

/** End of the day: euros, stars, and the one piece of advice Cassandra gives (the biggest weakness). */
export function dayResult(day: DayDef, s: GameState): DayResult {
  const max = maxEuros(day, s.surprises, s.effects);
  // Rewards are a gift: they never make the stars.
  const stars = starsOf(s.euros - s.stats.rewards, max);
  const st = s.stats;
  let advice: Advice = 'anticiper';
  if (stars === 3) advice = 'bravo';
  else if (st.surplusElec >= 60) advice = 'surplus';
  else if (st.redEvening >= 30) advice = 'soir';
  else if (isHeatingDay(day) && st.heatMinutes > 0 && st.redHeat / st.heatMinutes > st.redElec / DAY_MINUTES) advice = 'chaleur';
  return { euros: s.euros, max, stars, advice };
}

/**
 * Plays a whole day without a screen (tests, tuning): `player` sees the state each minute and may return new
 * setpoints. Same day, seed and player ⇒ same result.
 */
export function simulate(
  day: DayDef, seed: number, player: (s: GameState) => { elec: number; heat: number } | null, effects: readonly TownEffect[] = [],
  mods: EventMods = NO_MODS, fixes: boolean | number = false,
): GameState {
  let s = newGame(day, seed, effects, mods);
  // With `fixes`, the player acts on every event as soon as it can (true) or this many game hours after it starts.
  const delay = fixes === true ? 0 : fixes === false ? null : fixes;
  while (!isOver(s)) {
    if (delay !== null) s.surprises.forEach((e, i) => { if (canFix(e, hourOf(s)) && hourOf(s) >= e.start + delay) s = fixSurprise(s, i); });
    const move = player(s);
    if (move) s = setSetpoints(s, move.elec, move.heat, move.elec !== s.plant.setElec ? 'elec' : 'heat');
    s = stepMinute(day, s);
  }
  return s;
}
