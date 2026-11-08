/**
 * Neutron City engine (lot L0 skeleton). Pure and deterministic: no DOM, no clock, no Math.random() — randomness
 * comes from a seed passed by the UI. The plant, demand, money and happiness models arrive in lot L2.
 */

/** Rated outputs of the imaginary plant at 100 % core power. */
export const RATED_ELEC_MW = 100;
export const RATED_HEAT_MW = 300;

/**
 * D-01: the core power is shared between electricity and heat. `elecPct` is a share of 100 MWe, `heatPct` a share
 * of 300 MWth; the core power is their sum and can never exceed 100 %.
 */
export function corePct(elecPct: number, heatPct: number): number {
  return elecPct + heatPct;
}

/**
 * Setpoints a player may ask for under D-01: each share is kept within 0–100 % and, when the core is full, the
 * output being moved (`moved`) gets only what the other one leaves free.
 */
export function clampSetpoints(
  elecPct: number,
  heatPct: number,
  moved: 'elec' | 'heat',
): { elecPct: number; heatPct: number } {
  const e = Math.min(100, Math.max(0, elecPct));
  const h = Math.min(100, Math.max(0, heatPct));
  if (e + h <= 100) return { elecPct: e, heatPct: h };
  return moved === 'elec' ? { elecPct: 100 - h, heatPct: h } : { elecPct: e, heatPct: 100 - e };
}
