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
}

const KEY = 'neutron-city.progress';
export const EMPTY: Progress = { version: 1, wallet: 0, owned: [], stars: {}, lastDay: null };

/** Reads the saved progress; anything missing or unreadable gives a fresh start. */
export function loadProgress(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Progress {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as Partial<Progress>;
    if (p.version !== 1) return { ...EMPTY };
    return {
      version: 1,
      wallet: Number.isInteger(p.wallet) && (p.wallet as number) >= 0 ? (p.wallet as number) : 0,
      owned: Array.isArray(p.owned) ? p.owned.filter((x): x is string => typeof x === 'string') : [],
      stars: p.stars && typeof p.stars === 'object' ? Object.fromEntries(Object.entries(p.stars).filter(([, v]) => typeof v === 'number')) : {},
      lastDay: typeof p.lastDay === 'string' ? p.lastDay : null,
    };
  } catch {
    return { ...EMPTY };
  }
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
