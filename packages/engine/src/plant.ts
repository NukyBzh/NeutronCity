/**
 * The imaginary plant (D-01, D-05). One core shared between electricity and heat; each output follows the player's
 * setpoint at a limited speed (ramp). Kept as a plain object so later versions can add thermal inertia, incidents or
 * several plants without changing the callers.
 */

/** Rated outputs of the plant at 100 % core power. */
export const RATED_ELEC_MW = 100;
export const RATED_HEAT_MW = 300;
/** D-05: default ramp of each output, in % of the core per game hour. */
export const DEFAULT_RAMP_PCT_PER_HOUR = 10;

export type Output = 'elec' | 'heat';

export interface PlantState {
  /** Player's setpoints, % of the core (D-01: elec + heat ≤ 100). */
  setElec: number;
  setHeat: number;
  /** What the plant really produces, % of the core. */
  elec: number;
  heat: number;
}

/** D-01: the core power is the sum of both shares and can never exceed 100 %. */
export function corePct(elecPct: number, heatPct: number): number {
  return elecPct + heatPct;
}

/**
 * Setpoints a player may ask for under D-01: each share is kept within 0–100 % and, when the core is full, the output
 * being moved (`moved`) gets only what the other one leaves free.
 */
export function clampSetpoints(elecPct: number, heatPct: number, moved: Output): { elecPct: number; heatPct: number } {
  const e = Math.min(100, Math.max(0, elecPct));
  const h = Math.min(100, Math.max(0, heatPct));
  if (e + h <= 100) return { elecPct: e, heatPct: h };
  return moved === 'elec' ? { elecPct: 100 - h, heatPct: h } : { elecPct: e, heatPct: 100 - e };
}

export const mw = (output: Output, pct: number): number => (pct / 100) * (output === 'elec' ? RATED_ELEC_MW : RATED_HEAT_MW);

const toward = (from: number, to: number, max: number): number => (Math.abs(to - from) <= max ? to : from + Math.sign(to - from) * max);

/** The plant one game minute later: each output moves towards its setpoint by at most ramp / 60. */
export function stepPlant(p: PlantState, rampPctPerHour: number): PlantState {
  const max = rampPctPerHour / 60;
  return { ...p, elec: toward(p.elec, p.setElec, max), heat: toward(p.heat, p.setHeat, max) };
}
