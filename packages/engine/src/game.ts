/**
 * A game: one day played minute by minute. Pure functions: the interface keeps the state, calls `stepMinute` as game
 * time passes and `setSetpoints` when the player moves a slider. Money (D-02) is counted in whole euros so a replay
 * with the same seed and the same moves gives exactly the same result.
 */
import { DAY_MINUTES, START_HOUR, curveAt, isHeatingDay, type DayDef } from './day';
import { clampSetpoints, stepPlant, type Output, type PlantState } from './plant';
import { SURPRISE_SPEC, drawSurprises, surpriseWeight, type Surprise } from './surprises';

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

/** Town demand at a game hour: the day's curve plus the surprises, never below 0. */
export function demandAt(day: DayDef, surprises: readonly Surprise[], hour: number): Demand {
  let { elec, heat } = curveAt(day, hour);
  for (const s of surprises) {
    const w = surpriseWeight(s, hour);
    elec += w * SURPRISE_SPEC[s.kind].elec;
    heat += w * SURPRISE_SPEC[s.kind].heat;
  }
  return { elec: Math.max(0, elec), heat: Math.max(0, heat) };
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
}

export interface GameState {
  seed: number;
  surprises: Surprise[];
  /** Game minutes since 6 h (integer: a day is exactly DAY_MINUTES steps). */
  minute: number;
  plant: PlantState;
  euros: number;
  /** Minutes that paid something (the interface drops a coin every 10). */
  paidMinutes: number;
  stats: GameStats;
}

export const hourOf = (s: GameState): number => START_HOUR + s.minute / 60;
export const isOver = (s: GameState): boolean => s.minute >= DAY_MINUTES;

/** Start of a day: the plant already produces what the town asks at 6 h (rounded to the sliders' 5 % steps). */
export function newGame(day: DayDef, seed: number): GameState {
  const surprises = drawSurprises(day, seed);
  const d = demandAt(day, surprises, START_HOUR);
  const e = Math.round(d.elec / 5) * 5;
  const h = Math.round(d.heat / 5) * 5;
  return {
    seed, surprises, minute: 0,
    plant: { setElec: e, setHeat: h, elec: e, heat: h },
    euros: 0, paidMinutes: 0,
    stats: { redElec: 0, redHeat: 0, redEvening: 0, heatMinutes: 0, surplusElec: 0 },
  };
}

/** The player moves one slider; D-01 keeps electricity + heat ≤ 100 %. */
export function setSetpoints(s: GameState, elecPct: number, heatPct: number, moved: Output): GameState {
  const c = clampSetpoints(elecPct, heatPct, moved);
  return { ...s, plant: { ...s.plant, setElec: c.elecPct, setHeat: c.heatPct } };
}

/** What the screen shows at the current minute: demand, and a gauge per output asked for (heat: null when none). */
export function gaugesOf(day: DayDef, s: GameState): { demand: Demand; elec: Gauge; heat: Gauge | null } {
  const demand = demandAt(day, s.surprises, hourOf(s));
  return { demand, elec: gaugeOf(s.plant.elec - demand.elec), heat: demand.heat > 0 ? gaugeOf(s.plant.heat - demand.heat) : null };
}

/**
 * One game minute: the plant follows its setpoints, then the minute is paid and counted. Electricity above the band
 * costs SURPLUS_PENALTY (D-15); the piggy bank never goes below 0 (a child of 8 is not left in debt).
 */
export function stepMinute(day: DayDef, s: GameState): GameState {
  if (isOver(s)) return s;
  const minute = s.minute + 1;
  const plant = stepPlant(s.plant, day.rampPctPerHour);
  const next = { ...s, minute, plant };
  const g = gaugesOf(day, next);
  const surplus = isSurplus(plant.elec, g.demand.elec);
  const pay = EUROS_PER_MINUTE[g.elec] + (g.heat ? EUROS_PER_MINUTE[g.heat] : 0) - (surplus ? SURPLUS_PENALTY : 0);
  const hour = hourOf(next);
  const st = s.stats;
  return {
    ...next,
    euros: Math.max(0, s.euros + pay),
    paidMinutes: s.paidMinutes + (pay > 0 ? 1 : 0),
    stats: {
      redElec: st.redElec + (g.elec === 'loin' ? 1 : 0),
      redHeat: st.redHeat + (g.heat === 'loin' ? 1 : 0),
      redEvening: st.redEvening + (g.elec === 'loin' && hour > 18 && hour <= 21 ? 1 : 0),
      heatMinutes: st.heatMinutes + (g.heat ? 1 : 0),
      surplusElec: st.surplusElec + (surplus ? 1 : 0),
    },
  };
}

/** Most a day can pay: 2 € a minute for each output the town asks for at that minute. */
export function maxEuros(day: DayDef, surprises: readonly Surprise[]): number {
  let total = 0;
  for (let m = 1; m <= DAY_MINUTES; m++) total += demandAt(day, surprises, START_HOUR + m / 60).heat > 0 ? 4 : 2;
  return total;
}

/** D-02 stars: 1 for a finished day, 2 from half the maximum, 3 from 80 %. */
export function starsOf(euros: number, max: number): 1 | 2 | 3 {
  const r = max > 0 ? euros / max : 0;
  return r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1;
}

export type Advice = 'bravo' | 'soir' | 'chaleur' | 'surplus' | 'anticiper';

export interface DayResult { euros: number; max: number; stars: 1 | 2 | 3; advice: Advice }

/** End of the day: euros, stars, and the one piece of advice Cassandra gives (the biggest weakness). */
export function dayResult(day: DayDef, s: GameState): DayResult {
  const max = maxEuros(day, s.surprises);
  const stars = starsOf(s.euros, max);
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
export function simulate(day: DayDef, seed: number, player: (s: GameState) => { elec: number; heat: number } | null): GameState {
  let s = newGame(day, seed);
  while (!isOver(s)) {
    const move = player(s);
    if (move) s = setSetpoints(s, move.elec, move.heat, move.elec !== s.plant.setElec ? 'elec' : 'heat');
    s = stepMinute(day, s);
  }
  return s;
}
