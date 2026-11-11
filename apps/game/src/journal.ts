/**
 * Play log for the trial with children (lot L9.1, D-26): one line per game and per purchase, kept on the device only
 * (no name, no network). The adult reads it on a hidden screen (5 taps on the version number), exports it as a table
 * and erases it. « Nouveau joueur » goes on to the next child's number; the log itself is never erased by it.
 */
import { dayResult, hourOf, type DayDef, type GameState } from '@neutron/engine';

/** How a game ended: finished, restarted or left from the pause, or the game was closed during the day. */
export type GameEnd = 'fini' | 'recommence' | 'accueil' | 'interrompu';

/** What the play screen counts during a game, besides the engine's state. */
export interface PlayStats {
  /** Real seconds of play (pauses and tutorial excluded) at ×1, ×2 and ×4. */
  seconds: [number, number, number];
  /** Times the child took hold of a slider (moves less than a second apart count once). */
  moves: number;
  /** Hints Cassandra gave after 20 s far from demand without touching anything. */
  hints: number;
  /** Tutorial: not shown, finished, or skipped at step n (1-based). */
  tutorial: 'non' | 'fini' | `passe-${number}`;
}

export const NO_STATS: PlayStats = { seconds: [0, 0, 0], moves: 0, hints: 0, tutorial: 'non' };

export interface GameRecord {
  type: 'jour';
  /** Unique within the log (start time in ms). */
  id: number;
  child: number;
  /** Start, local date and time (ISO, no time zone). */
  at: string;
  day: string;
  seed: number;
  end: GameEnd;
  /** Game hour reached (6 to 24). */
  hour: number;
  euros: number;
  /** Stars and maximum of the day: finished games only. */
  stars: 1 | 2 | 3 | null;
  max: number | null;
  stats: PlayStats;
  /** Each event of the day: when it started and when the child acted (game hours; null: never). */
  events: { kind: string; start: number; fixed: number | null }[];
}

/** A purchase; `place`: the lot chosen in the town, « column,row » (lot L9.4). */
export interface BuyRecord { type: 'achat'; id: number; child: number; at: string; item: string; price: number; place?: string }
export type JournalRecord = GameRecord | BuyRecord;

export interface Journal {
  version: 1;
  /** Number of the child playing now. */
  child: number;
  records: JournalRecord[];
}

const KEY = 'neutron-city.journal';
/** Oldest lines dropped beyond this (about 400 kB). */
export const MAX_RECORDS = 1000;
export const EMPTY_JOURNAL: Journal = { version: 1, child: 1, records: [] };

export function loadJournal(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Journal {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { ...EMPTY_JOURNAL, records: [] };
    const j = JSON.parse(raw) as Partial<Journal>;
    if (j.version !== 1 || !Array.isArray(j.records)) return { ...EMPTY_JOURNAL, records: [] };
    const child = Number.isInteger(j.child) && (j.child as number) >= 1 ? (j.child as number) : 1;
    const records = j.records.filter((r): r is JournalRecord => !!r && typeof r === 'object' && (r.type === 'jour' || r.type === 'achat') && typeof r.id === 'number');
    return { version: 1, child, records };
  } catch {
    return { ...EMPTY_JOURNAL, records: [] };
  }
}

export function saveJournal(j: Journal, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(KEY, JSON.stringify(j));
  } catch {
    // Storage full or blocked: the game goes on without the log.
  }
}

/** Adds a line, or replaces the line with the same id and type (a game is written again as it goes on). */
export function upsert(j: Journal, r: JournalRecord): Journal {
  const i = j.records.findIndex((x) => x.id === r.id && x.type === r.type);
  const records = i >= 0 ? j.records.map((x, k) => (k === i ? r : x)) : [...j.records, r];
  return { ...j, records: records.slice(-MAX_RECORDS) };
}

/** Local date and time without time zone, to the second: 2026-11-12T14:05:09. */
export function localStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const round2 = (x: number) => Math.round(x * 100) / 100;

/** The line of a game, from the engine's state and what the play screen counted. */
export function gameRecord(base: { id: number; child: number; at: string }, day: DayDef, game: GameState, stats: PlayStats, end: GameEnd): GameRecord {
  const r = end === 'fini' ? dayResult(day, game) : null;
  return {
    type: 'jour', ...base, day: day.id, seed: game.seed, end, hour: round2(hourOf(game)), euros: Math.round(game.euros),
    stars: r?.stars ?? null, max: r ? Math.round(r.max) : null,
    stats: { ...stats, seconds: stats.seconds.map((s) => Math.round(s)) as PlayStats['seconds'] },
    events: game.surprises.map((e) => ({ kind: e.kind, start: round2(e.start), fixed: e.fixedAt === undefined ? null : round2(e.fixedAt) })),
  };
}

export interface ChildSummary {
  child: number;
  games: number;
  finished: number;
  /** Best stars on each day. */
  best: Record<string, number>;
  /** Mean delay (game hours) between the start of an event and the child's action; null: no event acted on. */
  delay: number | null;
  /** Events acted on / events that could be acted on. */
  acted: number;
  events: number;
  bought: number;
  /** Real minutes of play. */
  minutes: number;
  tutorial: string;
}

/** One row per child, in order: what the adult looks at first after a session. */
export function summarize(j: Journal, actable: (kind: string) => boolean): ChildSummary[] {
  const by = new Map<number, ChildSummary & { delays: number[] }>();
  for (const r of j.records) {
    const s = by.get(r.child) ?? { child: r.child, games: 0, finished: 0, best: {}, delay: null, acted: 0, events: 0, bought: 0, minutes: 0, tutorial: 'non', delays: [] };
    by.set(r.child, s);
    if (r.type === 'achat') { s.bought++; continue; }
    s.games++;
    if (r.end === 'fini') s.finished++;
    if (r.stars) s.best[r.day] = Math.max(s.best[r.day] ?? 0, r.stars);
    s.minutes += r.stats.seconds.reduce((a, b) => a + b, 0) / 60;
    if (r.stats.tutorial !== 'non') s.tutorial = r.stats.tutorial;
    for (const e of r.events) {
      if (!actable(e.kind) || e.start > r.hour) continue;
      s.events++;
      if (e.fixed !== null) { s.acted++; s.delays.push(e.fixed - e.start); }
    }
  }
  return [...by.values()].sort((a, b) => a.child - b.child).map(({ delays, ...s }) => ({
    ...s, minutes: Math.round(s.minutes), delay: delays.length ? round2(delays.reduce((a, b) => a + b, 0) / delays.length) : null,
  }));
}

const CSV_HEAD = ['type', 'enfant', 'date', 'journee', 'fin', 'heure_atteinte', 'etoiles', 'euros', 'maximum', 'secondes_x1', 'secondes_x2', 'secondes_x4',
  'prises_curseur', 'indices', 'tutoriel', 'evenements', 'achat', 'prix', 'graine', 'terrain'];

/**
 * The log as a table for a spreadsheet (semicolons, as French Excel expects). Events read « storm 9.5>9.9 »: started
 * at 9.5 h, the child acted at 9.9 h (« - »: never).
 */
export function toCsv(j: Journal): string {
  const lines = [CSV_HEAD.join(';')];
  for (const r of j.records) {
    if (r.type === 'achat') {
      lines.push(['achat', r.child, r.at, '', '', '', '', '', '', '', '', '', '', '', '', '', r.item, r.price, '', r.place ?? ''].join(';'));
      continue;
    }
    const ev = r.events.map((e) => `${e.kind} ${e.start}>${e.fixed ?? '-'}`).join(' | ');
    lines.push(['jour', r.child, r.at, r.day, r.end, r.hour, r.stars ?? '', r.euros, r.max ?? '', ...r.stats.seconds, r.stats.moves, r.stats.hints, r.stats.tutorial,
      ev, '', '', r.seed, ''].join(';'));
  }
  return `${lines.join('\r\n')}\r\n`;
}
