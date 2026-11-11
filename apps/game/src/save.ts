/**
 * Progress kept on the device only (no account, no network, no personal data): euros, upgrades bought, best stars
 * per day and the last day played. Stored as a versioned object so a later version can migrate it.
 */
export interface Progress {
  version: 1;
  wallet: number;
  owned: string[];
  stars: Record<string, number>;
  lastDay: string | null;
  /** The guided tutorial has been seen (lot L5); « Nouveau joueur » shows it again. */
  tuto: boolean;
  /** Events Cassandra has already explained (lot L7.1): she explains each one the first time only. */
  seen: string[];
  /** Lot chosen for each building, column and row (lot L9.4); absent in progress saved before: default plots. */
  places?: Record<string, [number, number]>;
}

const KEY = 'neutron-city.progress';
export const EMPTY: Progress = { version: 1, wallet: 0, owned: [], stars: {}, lastDay: null, tuto: false, seen: [], places: {} };

/** Reads the saved progress; anything missing or unreadable gives a fresh start. */
export function loadProgress(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Progress {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as Partial<Progress>;
    if (p.version !== 1) return { ...EMPTY };
    const stars = p.stars && typeof p.stars === 'object' ? Object.fromEntries(Object.entries(p.stars).filter(([, v]) => typeof v === 'number')) : {};
    return {
      version: 1,
      wallet: Number.isInteger(p.wallet) && (p.wallet as number) >= 0 ? (p.wallet as number) : 0,
      owned: Array.isArray(p.owned) ? p.owned.filter((x): x is string => typeof x === 'string') : [],
      stars,
      lastDay: typeof p.lastDay === 'string' ? p.lastDay : null,
      // Saved before v0.7.0 (no tutorial yet): a child who has already finished a day does not need it.
      tuto: typeof p.tuto === 'boolean' ? p.tuto : Object.keys(stars).length > 0,
      seen: Array.isArray(p.seen) ? p.seen.filter((x): x is string => typeof x === 'string') : [],
      places: readPlaces(p.places),
    };
  } catch {
    return { ...EMPTY };
  }
}

/** Keeps only well-formed lots: [column, row], whole numbers. */
function readPlaces(raw: unknown): Record<string, [number, number]> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, [number, number]> = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(v) && v.length === 2 && v.every((n) => Number.isInteger(n))) out[id] = [v[0] as number, v[1] as number];
  }
  return out;
}

export function saveProgress(p: Progress, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage full or blocked: the game goes on, progress is simply not kept.
  }
}

export function clearProgress(storage: Pick<Storage, 'removeItem'> | undefined = globalThis.localStorage): void {
  try {
    storage?.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}
