/**
 * Events of a day (lot L7.1, owner's file docs/conception/avaries_evenements.json, D-21), still called « surprises » in
 * the code. Drawn from a seed given by the user interface (a new seed each game, kept so a game can be replayed
 * exactly): at most 3 a day, one at a time, an hour apart. Some are announced by Cassandra an hour before; the others
 * arrive suddenly. Some end when the child acts on the town (a tap, a long press, several taps): the interface calls
 * `fixSurprise` (game.ts). Every change of demand rises and falls by at most 3.5 %/h, so a day stays possible to follow:
 * curve slope + event slope stays below the plant's ramp (checked by the tests on hundreds of seeds).
 */
import { END_HOUR, isHeatingDay, type DayDef, type SurpriseKind } from './day';
import { rng } from './rng';

/** What the child does to end an event: a tap, a long press (valve), several taps (cleaning). */
export type FixAction = 'tap' | 'hold' | 'taps';

export interface SurpriseSpec {
  /** Change of demand at full strength, % of the core. */
  elec: number;
  heat: number;
  /** Game hours to rise, to hold (the longest hold when the child can end it), to fall back. */
  rise: number;
  hold: number;
  fall: number;
  needsHeat: boolean;
  /** Earliest and latest start (game hours). */
  from: number;
  to: number;
  /** Announced by Cassandra an hour before (otherwise it arrives suddenly). */
  announce: boolean;
  /** Bad news for the town: the maison médicale softens it. */
  negative: boolean;
  /** The child's action that ends it, and game hours from that action to the start of the fall (the repair). */
  fix?: FixAction;
  repair?: number;
  /** Euros of the day multiplied by this while it lasts (storm 0.6, town party 2). */
  gain?: number;
  /** Heatwave: the core may not go above this % at full strength (the river is too warm). */
  cap?: number;
  /** A quarter of the town goes dark (no electricity there). */
  cut?: boolean;
  /** Euros given once (new inhabitants welcomed, class visit succeeded). */
  reward?: number;
  /** Class visit: game minutes in a row with every output « bien » to earn the reward. */
  visit?: number;
}

export const SURPRISE_SPEC: Record<SurpriseKind, SurpriseSpec> = {
  // TV match: everybody switches the TV on in the evening.
  peak: { elec: 7, heat: 0, rise: 2, hold: 1, fall: 2, needsHeat: false, from: 18, to: 19, announce: true, negative: true },
  coldWave: { elec: 2, heat: 7, rise: 2, hold: 2, fall: 2, needsHeat: true, from: 9, to: 17, announce: true, negative: true },
  mildSpell: { elec: 0, heat: -6, rise: 2, hold: 2, fall: 2, needsHeat: true, from: 9, to: 17, announce: true, negative: false },
  heatwave: { elec: 0, heat: 0, rise: 3, hold: 3, fall: 3, needsHeat: false, from: 10, to: 12, announce: true, negative: true, cap: 80 },
  storm: { elec: -6, heat: 0, rise: 2, hold: 3, fall: 2, needsHeat: false, from: 9, to: 18, announce: true, negative: true, fix: 'tap', repair: 1, gain: 0.6, cut: true },
  squirrel: { elec: -5, heat: 0, rise: 1.5, hold: 3, fall: 1.5, needsHeat: false, from: 8, to: 19, announce: false, negative: true, fix: 'tap', repair: 0.5, gain: 0.8, cut: true },
  heatLeak: { elec: 0, heat: 6, rise: 2, hold: 3, fall: 2, needsHeat: true, from: 8, to: 18, announce: false, negative: true, fix: 'hold', repair: 1 },
  scale: { elec: 0, heat: 5, rise: 1.5, hold: 3, fall: 1.5, needsHeat: true, from: 8, to: 18, announce: false, negative: true, fix: 'taps', repair: 0.5 },
  newcomers: { elec: 0, heat: 0, rise: 0, hold: 2, fall: 0, needsHeat: false, from: 8, to: 16, announce: false, negative: false, fix: 'tap', repair: 0, reward: 150 },
  classVisit: { elec: 0, heat: 0, rise: 0, hold: 3, fall: 0, needsHeat: false, from: 9, to: 13, announce: true, negative: false, reward: 100, visit: 60 },
  party: { elec: 5, heat: 0, rise: 1.5, hold: 1.5, fall: 1.5, needsHeat: false, from: 19, to: 19.5, announce: true, negative: false, gain: 2 },
};
/** How long before it starts Cassandra announces an event (game hours). */
export const ANNOUNCE_HOURS = 1;
/** At most this many events a day (owner's choice, D-21). */
export const MAX_SURPRISES = 3;
/** Quarters of the town (left, centre, right), for the events that cut one. */
export const QUARTERS = 3;

export interface Surprise {
  kind: SurpriseKind;
  start: number;
  /** Latest possible end (when nobody acts). */
  end: number;
  /** Quarter that goes dark (events that cut one). */
  quarter?: number;
  /** Game hour at which the child acted (repair started, inhabitants welcomed, visit succeeded). */
  fixedAt?: number;
  /** Bad event softened by the maison médicale: demand changes this much (absent: 1). */
  k?: number;
  /** Heatwave: core limit at full strength (absent: the spec's). */
  cap?: number;
}

/** Changes of the town that soften the events (lot L7.1): hospital, maison médicale, battery. */
export interface EventMods {
  /** Quarter that never goes dark (the hospital's). */
  protectedQuarter: number | null;
  /** Bad events change demand this much (0.8 with the maison médicale). */
  strength: number;
  /** Core limit during a heatwave (80, 90 with the battery). */
  heatwaveCap: number;
}
export const NO_MODS: EventMods = { protectedQuarter: null, strength: 1, heatwaveCap: 80 };

export const surpriseEnd = (kind: SurpriseKind, start: number): number => {
  const s = SURPRISE_SPEC[kind];
  return start + s.rise + s.hold + s.fall;
};
const duration = (k: SurpriseKind): number => surpriseEnd(k, 0);

/** A half-hour step between `from` and `to` (both included). */
const halfHourBetween = (r: () => number, from: number, to: number): number => from + Math.floor(r() * (Math.floor((to - from) * 2) + 1)) / 2;

/**
 * Up to 3 events of different kinds, one at a time, the next starting at least an hour after the previous one ends,
 * each in its own hours and over before midnight. Built directly, so every seed gives a valid day: kinds are tried in a
 * seeded order and kept while they still fit together; then each one gets a random start that leaves room for the next.
 */
export function drawSurprises(day: DayDef, seed: number, mods: EventMods = NO_MODS): Surprise[] {
  const r = rng(seed);
  const heating = isHeatingDay(day);
  const pool = day.surprises.filter((k) => heating || !SURPRISE_SPEC[k].needsHeat);
  const order = [...pool];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  const byHour = (ks: SurpriseKind[]): SurpriseKind[] => [...ks].sort((a, b) => SURPRISE_SPEC[a].from - SURPRISE_SPEC[b].from);
  const latestOf = (k: SurpriseKind): number => Math.min(SURPRISE_SPEC[k].to, END_HOUR - duration(k));
  /** Latest start of each kind so that the following ones still fit (null: they do not fit together). */
  const latest = (ks: SurpriseKind[]): number[] | null => {
    const out = ks.map(latestOf);
    for (let i = ks.length - 2; i >= 0; i--) out[i] = Math.min(out[i]!, out[i + 1]! - 1 - duration(ks[i]!));
    let free = 0;
    for (let i = 0; i < ks.length; i++) {
      const lo = Math.max(SURPRISE_SPEC[ks[i]!].from, free);
      if (lo > out[i]!) return null;
      free = lo + duration(ks[i]!) + 1;
    }
    return out;
  };
  let chosen: SurpriseKind[] = [];
  for (const k of order) {
    if (chosen.length >= MAX_SURPRISES) break;
    const tryKinds = byHour([...chosen, k]);
    if (latest(tryKinds)) chosen = tryKinds;
  }
  const late = latest(chosen) ?? [];
  const out: Surprise[] = [];
  let free = 0;
  chosen.forEach((kind, i) => {
    const spec = SURPRISE_SPEC[kind];
    const start = halfHourBetween(r, Math.max(spec.from, free), late[i]!);
    const s: Surprise = { kind, start, end: surpriseEnd(kind, start) };
    if (spec.negative && mods.strength !== 1) s.k = mods.strength;
    if (spec.cap !== undefined) s.cap = 100 - (100 - mods.heatwaveCap) * mods.strength;
    if (spec.cut) {
      const quarters = Array.from({ length: QUARTERS }, (_, q) => q).filter((q) => q !== mods.protectedQuarter);
      s.quarter = quarters[Math.floor(r() * quarters.length)]!;
    }
    out.push(s);
    free = s.end + 1;
  });
  return out;
}

/** When the hold ends: at the latest end of the hold, or once the repair the child started is over. */
function holdEnd(s: Surprise): number {
  const spec = SURPRISE_SPEC[s.kind];
  const latest = s.start + spec.rise + spec.hold;
  if (s.fixedAt === undefined || !spec.fix) return latest;
  return Math.min(latest, Math.max(s.start + spec.rise, s.fixedAt + (spec.repair ?? 0)));
}

/** End of an event, given what the child did. */
export const surpriseOver = (s: Surprise): number => holdEnd(s) + SURPRISE_SPEC[s.kind].fall;

/** True while the event is on (between its start and its end). */
export const isActive = (s: Surprise, hour: number): boolean => hour >= s.start && hour < surpriseOver(s);

/** True while the child can still act on it. */
export const canFix = (s: Surprise, hour: number): boolean =>
  SURPRISE_SPEC[s.kind].fix !== undefined && s.fixedAt === undefined && hour >= s.start && hour < holdEnd(s);

/** Strength of an event at a game hour: 0 → 1 while rising, 1 while holding, 1 → 0 while falling. */
export function surpriseWeight(s: Surprise, hour: number): number {
  const spec = SURPRISE_SPEC[s.kind];
  const t = hour - s.start;
  const he = holdEnd(s);
  const end = he + spec.fall;
  if (t < 0 || hour >= end) return 0;
  if (t < spec.rise) return t / spec.rise;
  if (hour < he) return 1;
  return spec.fall > 0 ? (end - hour) / spec.fall : 0;
}

/** Events as a « perfect player » meets them: every repair started at once (the maximum of the day is counted so). */
export const fixedAtOnce = (surprises: readonly Surprise[]): Surprise[] =>
  surprises.map((s) => (SURPRISE_SPEC[s.kind].fix && SURPRISE_SPEC[s.kind].reward === undefined ? { ...s, fixedAt: s.start } : s));

/** Core limit at a game hour (100 % unless a heatwave holds the plant back). */
export function coreCap(surprises: readonly Surprise[], hour: number): number {
  let cap = 100;
  for (const s of surprises) {
    const full = s.cap ?? SURPRISE_SPEC[s.kind].cap;
    if (full !== undefined) cap = Math.min(cap, 100 - (100 - full) * surpriseWeight(s, hour));
  }
  return cap;
}

/** Euros of a minute are multiplied by this (storm, squirrel, town party). */
export function gainAt(surprises: readonly Surprise[], hour: number): number {
  let g = 1;
  for (const s of surprises) {
    const k = SURPRISE_SPEC[s.kind].gain;
    if (k !== undefined && isActive(s, hour)) g *= k;
  }
  return g;
}
