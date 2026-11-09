/**
 * Effects of the town's buildings on demand (lot L6, D-19 E2): each building bought adds (or removes) a few % of the core
 * to the demand at some moments of the day. Moments are smooth (2-hour ramps), so a day stays as easy to follow as
 * before; `demandAt` (game.ts) keeps electricity + heat ≤ 100 % (D-01) by shrinking the additions if needed.
 */
export type Moment = 'jour' | 'soir' | 'nuit' | 'toujours';
export const MOMENTS: readonly Moment[] = ['jour', 'soir', 'nuit', 'toujours'];

export interface TownEffect {
  out: 'elec' | 'heat';
  /** % of the core added at full strength (negative: the building saves energy). */
  add: number;
  when: Moment;
  /** Days where it applies (ids of content/days); all days when absent. */
  days?: string[];
}

/** 0 → 1 between a and b. */
const up = (h: number, a: number, b: number): number => (h <= a ? 0 : h >= b ? 1 : (h - a) / (b - a));

/** Strength of a moment at a game hour (0 to 1), with 2-hour ramps: day 9–17 h, evening 19–21 h, night 23–5 h. */
export function momentWeight(when: Moment, hour: number): number {
  const h = ((hour % 24) + 24) % 24;
  switch (when) {
    case 'toujours': return 1;
    case 'jour': return up(h, 7, 9) - up(h, 17, 19);
    case 'soir': return up(h, 17, 19) - up(h, 21, 23);
    case 'nuit': return h >= 12 ? up(h, 21, 23) : 1 - up(h, 5, 7);
  }
}

/** Sum of the effects at a game hour, before the D-01 limit. */
export function effectsAt(effects: readonly TownEffect[], hour: number): { elec: number; heat: number } {
  let elec = 0;
  let heat = 0;
  for (const e of effects) {
    const v = e.add * momentWeight(e.when, hour);
    if (e.out === 'elec') elec += v;
    else heat += v;
  }
  return { elec, heat };
}

/** Checks one effect of a content file; returns the problems found. */
export function effectErrors(raw: unknown, where: string): string[] {
  const o = (raw ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  if (o.out !== 'elec' && o.out !== 'heat') errors.push(`${where}.out: elec or heat expected`);
  if (typeof o.add !== 'number' || !Number.isFinite(o.add) || Math.abs(o.add) > 5) errors.push(`${where}.add: number between -5 and 5 expected`);
  if (!MOMENTS.includes(o.when as Moment)) errors.push(`${where}.when: one of ${MOMENTS.join(', ')}`);
  if (o.days !== undefined && !(Array.isArray(o.days) && o.days.every((d) => typeof d === 'string'))) errors.push(`${where}.days: list of day ids expected`);
  return errors;
}
