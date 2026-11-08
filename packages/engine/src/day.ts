/**
 * A day of play (6 h → midnight): the town's demand curve and Cassandra's scheduled lines, read from
 * content/days/<id>.yaml and checked by `validateDay`. Format 1 only knows balanced days (V1); later formats may add
 * unbalanced days (buying/selling electricity, impossible demand) without changing this one.
 */
import { DEFAULT_RAMP_PCT_PER_HOUR } from './plant';

export const START_HOUR = 6;
export const END_HOUR = 24;
export const DAY_MINUTES = (END_HOUR - START_HOUR) * 60;

export type SurpriseKind = 'peak' | 'coldWave' | 'mildSpell';
export const SURPRISE_KINDS: readonly SurpriseKind[] = ['peak', 'coldWave', 'mildSpell'];
export type Pose = 'accueil' | 'explique' | 'attention' | 'bravo' | 'reflechit';
const POSES: readonly Pose[] = ['accueil', 'explique', 'attention', 'bravo', 'reflechit'];

export interface DayLine { hour: number; say: string; pose: Pose }

export interface DayDef {
  id: string;
  format: 1;
  balance: 'balanced';
  /** 1 easy, 2 medium, 3 hard: also the order in which days open. */
  level: 1 | 2 | 3;
  rampPctPerHour: number;
  /** [hour, electricity % of the core, heat % of the core], hours in increasing order from 0 to 24. */
  points: [number, number, number][];
  /** Kinds of surprise this day may draw (heat surprises only on heating days). */
  surprises: SurpriseKind[];
  lines: DayLine[];
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Checks a parsed day file and returns it typed; throws one error listing every problem found. */
export function validateDay(raw: unknown, where = 'day'): DayDef {
  const errors: string[] = [];
  const r = (raw ?? {}) as Record<string, unknown>;
  if (typeof r.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(r.id)) errors.push('id: lower-case word expected');
  if (r.format !== 1) errors.push('format: 1 expected');
  if (r.balance !== 'balanced') errors.push('balance: only "balanced" days exist in format 1');
  if (r.level !== 1 && r.level !== 2 && r.level !== 3) errors.push('level: 1, 2 or 3 expected');
  const ramp = r.rampPctPerHour ?? DEFAULT_RAMP_PCT_PER_HOUR;
  if (!isNum(ramp) || ramp <= 0) errors.push('rampPctPerHour: positive number expected');
  const pts = r.points;
  if (!Array.isArray(pts) || pts.length < 2) errors.push('points: at least two [hour, elec, heat] expected');
  else {
    pts.forEach((p, i) => {
      if (!Array.isArray(p) || p.length !== 3 || !p.every(isNum)) errors.push(`points[${i}]: [hour, elec, heat] expected`);
      else {
        const [, e, h] = p as [number, number, number];
        if (e < 0 || h < 0 || e + h > 100) errors.push(`points[${i}]: shares must be ≥ 0 with elec + heat ≤ 100 (D-01)`);
      }
      if (i > 0 && Array.isArray(p) && Array.isArray(pts[i - 1]) && !(p[0] > pts[i - 1][0])) errors.push(`points[${i}]: hours must increase`);
    });
    const first = pts[0] as unknown[];
    const last = pts[pts.length - 1] as unknown[];
    if (first?.[0] !== 0 || last?.[0] !== 24) errors.push('points: the curve must cover 0 h to 24 h');
  }
  const sur = r.surprises ?? [];
  if (!Array.isArray(sur) || !sur.every((k) => SURPRISE_KINDS.includes(k as SurpriseKind))) errors.push(`surprises: list of ${SURPRISE_KINDS.join(', ')} expected`);
  const lines = r.lines ?? [];
  if (!Array.isArray(lines)) errors.push('lines: list expected');
  else lines.forEach((l, i) => {
    const o = (l ?? {}) as Record<string, unknown>;
    if (!isNum(o.hour) || o.hour < START_HOUR || o.hour >= END_HOUR) errors.push(`lines[${i}].hour: between 6 and 24 expected`);
    if (typeof o.say !== 'string' || o.say === '') errors.push(`lines[${i}].say: text id expected`);
    if (!POSES.includes(o.pose as Pose)) errors.push(`lines[${i}].pose: one of ${POSES.join(', ')}`);
  });
  if (errors.length) throw new Error(`${where}: ${errors.join('; ')}`);
  return { ...(r as unknown as DayDef), rampPctPerHour: ramp as number, surprises: sur as SurpriseKind[], lines: lines as DayLine[] };
}

/** True if the town needs heat at some point of the day. */
export const isHeatingDay = (day: DayDef): boolean => day.points.some((p) => p[2] > 0);

/** Demand of the curve alone (no surprise) at a game hour, linear between the points. */
export function curveAt(day: DayDef, hour: number): { elec: number; heat: number } {
  const h = Math.min(24, Math.max(0, hour));
  const pts = day.points;
  for (let i = 1; i < pts.length; i++) {
    const [h1, e1, q1] = pts[i]!;
    const [h0, e0, q0] = pts[i - 1]!;
    if (h <= h1) {
      const k = (h - h0) / (h1 - h0);
      return { elec: e0 + k * (e1 - e0), heat: q0 + k * (q1 - q0) };
    }
  }
  const last = pts[pts.length - 1]!;
  return { elec: last[1], heat: last[2] };
}
