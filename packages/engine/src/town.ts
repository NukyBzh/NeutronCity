/**
 * The town's happiness and the shop (lot L6, D-11, D-19). Happiness only grows with what the player buys (never lost);
 * the mood of the day is only shown in the town and costs nothing. Each building also pays a fixed bonus at the end of
 * every day (E1) and changes the demand a little (E2, effects.ts).
 *
 * Order of the shop (E4): a « discovery » phase offers the 8 buildings of the tutorial one at a time, in order; then a
 * free phase opens the others as the town grows (number of buildings bought). The heat network opens the days with
 * heat (E5). Format: content/shop/shop.yaml.
 */
import type { DayDef } from './day';
import { isHeatingDay } from './day';
import { effectErrors, type TownEffect } from './effects';
import { NO_MODS, QUARTERS, type EventMods } from './surprises';
import type { Gauge } from './game';

export interface ShopItem {
  id: string;
  price: number;
  /** Happiness points gained for good (D-11). */
  joy: number;
  /** Euros paid at the end of every day once bought (D-19 E1). */
  bonus: number;
  /** Place in the discovery phase (1 = first); absent for the free phase. */
  discovery?: number;
  /** Free phase: buildings needed before it can be bought. */
  unlockAt?: number;
  /** Buying it opens the days with heat (D-19 E5). */
  opensHeat?: boolean;
  /** Its quarter never goes dark (hospital, lot L7.1). */
  protects?: boolean;
  /** Bad events change demand this much once it is bought (maison médicale: 0.8). */
  softens?: number;
  /** Core limit during a heatwave once it is bought (battery: 90). */
  heatwaveCap?: number;
  /** The town party is drawn this many times more often (town hall, lot L10.6). */
  party?: number;
  /** Repairs take this much of their time once it is bought (fire station: 0.5, lot L10.6). */
  repair?: number;
  /** May be bought again and again (small house, block of flats, lot L10.6): each copy has its own lot. */
  repeat?: boolean;
  effects: TownEffect[];
}

/**
 * A building bought several times (lot L10.6, R2-06): the first copy keeps the shop's id, the next ones get a number
 * (`petite-maison`, `petite-maison-2`, `petite-maison-3`…). No building of the shop ends with a number, so the id of
 * a copy always leads back to its building.
 */
export const baseId = (id: string): string => id.replace(/-\d+$/, '');
/** How many of this building the town has. */
export const copiesOf = (owned: readonly string[], id: string): number => owned.filter((o) => baseId(o) === id).length;
/** Each copy costs this much more than the one before (lot L10.6). */
export const REPEAT_RISE = 0.15;
/** What the next copy costs, rounded to ten euros; the usual price for a building bought only once. */
export function priceOf(item: ShopItem, owned: readonly string[]): number {
  const n = item.repeat ? copiesOf(owned, item.id) : 0;
  return n === 0 ? item.price : Math.round((item.price * (1 + REPEAT_RISE) ** n) / 10) * 10;
}
/** The id the next copy will have. */
export function nextCopyId(item: ShopItem, owned: readonly string[]): string {
  const n = copiesOf(owned, item.id);
  return n === 0 ? item.id : `${item.id}-${n + 1}`;
}
/** The buildings the town owns, one entry per copy (a second house pays its bonus and uses its electricity too). */
export const ownedItems = (shop: readonly ShopItem[], owned: readonly string[]): ShopItem[] =>
  owned.map((o) => shop.find((i) => i.id === baseId(o))).filter((i): i is ShopItem => i !== undefined);

/** Happiness of a town with nothing bought yet. */
export const BASE_HAPPINESS = 40;

export function validateShop(raw: unknown, where = 'shop'): ShopItem[] {
  const items = (raw as { items?: unknown })?.items;
  const errors: string[] = [];
  if (!Array.isArray(items) || items.length === 0) throw new Error(`${where}: items: list expected`);
  const ids = new Set<string>();
  const steps: number[] = [];
  const out: ShopItem[] = [];
  items.forEach((it, i) => {
    const o = (it ?? {}) as Record<string, unknown>;
    const at = `items[${i}]`;
    if (typeof o.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(o.id)) errors.push(`${at}.id: lower-case word expected`);
    else if (ids.has(o.id)) errors.push(`${at}.id: "${o.id}" twice`);
    else ids.add(o.id);
    if (!Number.isInteger(o.price) || (o.price as number) <= 0) errors.push(`${at}.price: whole euros expected`);
    if (!Number.isInteger(o.joy) || (o.joy as number) <= 0) errors.push(`${at}.joy: positive whole number expected`);
    if (!Number.isInteger(o.bonus) || (o.bonus as number) < 0) errors.push(`${at}.bonus: whole euros ≥ 0 expected`);
    const disc = o.discovery;
    const unlock = o.unlockAt;
    if ((disc === undefined) === (unlock === undefined)) errors.push(`${at}: either discovery or unlockAt expected`);
    if (disc !== undefined) {
      if (!Number.isInteger(disc) || (disc as number) < 1) errors.push(`${at}.discovery: 1, 2, 3… expected`);
      else steps.push(disc as number);
    }
    if (unlock !== undefined && (!Number.isInteger(unlock) || (unlock as number) < 0)) errors.push(`${at}.unlockAt: whole number ≥ 0 expected`);
    if (o.opensHeat !== undefined && typeof o.opensHeat !== 'boolean') errors.push(`${at}.opensHeat: true or false expected`);
    if (o.protects !== undefined && typeof o.protects !== 'boolean') errors.push(`${at}.protects: true or false expected`);
    if (o.softens !== undefined && !(typeof o.softens === 'number' && o.softens > 0 && o.softens <= 1)) errors.push(`${at}.softens: number between 0 and 1 expected`);
    if (o.heatwaveCap !== undefined && !(typeof o.heatwaveCap === 'number' && o.heatwaveCap > 0 && o.heatwaveCap <= 100)) errors.push(`${at}.heatwaveCap: % of the core expected`);
    if (o.party !== undefined && !(typeof o.party === 'number' && o.party >= 1)) errors.push(`${at}.party: how many times more often the party comes (≥ 1) expected`);
    if (o.repair !== undefined && !(typeof o.repair === 'number' && o.repair > 0 && o.repair <= 1)) errors.push(`${at}.repair: share of the repair time (0 to 1) expected`);
    if (o.repeat !== undefined && typeof o.repeat !== 'boolean') errors.push(`${at}.repeat: true or false expected`);
    if (o.repeat === true && o.discovery !== undefined) errors.push(`${at}.repeat: not during the discovery phase`);
    if (typeof o.id === 'string' && /-\d+$/.test(o.id)) errors.push(`${at}.id: must not end with a number (that is how a copy is named)`);
    const eff = o.effects ?? [];
    if (!Array.isArray(eff)) errors.push(`${at}.effects: list expected`);
    else eff.forEach((e, k) => errors.push(...effectErrors(e, `${at}.effects[${k}]`)));
    out.push({ ...(o as unknown as ShopItem), effects: (Array.isArray(eff) ? eff : []) as TownEffect[] });
  });
  const sorted = [...steps].sort((a, b) => a - b);
  if (sorted.some((s, i) => s !== i + 1)) errors.push('discovery: steps must be 1, 2, 3… without gap nor repeat');
  if (errors.length) throw new Error(`${where}: ${errors.join('; ')}`);
  return out;
}

/**
 * The three quarters for sale beyond the new street (lot L10.6b, R2-07). A quarter is not a building: it brings no
 * happiness and no bonus, it opens 6 lots more. The three are the same, so the price does not belong to one of them
 * but to the rank of the purchase: the second quarter costs more than the first, whichever one the child picks.
 */
export interface QuarterOffer {
  /** What the first, the second and the third quarter bought cost, in euros. */
  prices: readonly number[];
  /** Buildings the town needs before the quarters are offered at all. */
  unlockAt: number;
}

export function validateQuarters(raw: unknown, where = 'shop'): QuarterOffer {
  const q = (raw as { quarters?: unknown })?.quarters as Record<string, unknown> | undefined;
  const errors: string[] = [];
  const prices = q?.prices;
  if (!Array.isArray(prices) || prices.length !== QUARTERS) errors.push(`quarters.prices: ${QUARTERS} prices expected`);
  else prices.forEach((p, i) => {
    if (!Number.isInteger(p) || (p as number) <= 0) errors.push(`quarters.prices[${i}]: whole euros expected`);
    else if (i > 0 && (p as number) <= (prices[i - 1] as number)) errors.push(`quarters.prices[${i}]: each quarter costs more than the one before`);
  });
  if (!Number.isInteger(q?.unlockAt) || (q!.unlockAt as number) < 0) errors.push('quarters.unlockAt: whole number ≥ 0 expected');
  if (errors.length) throw new Error(`${where}: ${errors.join('; ')}`);
  return { prices: prices as number[], unlockAt: q!.unlockAt as number };
}

/** What the next quarter costs, or null once all three are bought. */
export const quarterPrice = (offer: QuarterOffer, bought: readonly number[]): number | null => offer.prices[bought.length] ?? null;

/** What the shop shows for one quarter for sale. */
export function quarterStatus(offer: QuarterOffer, owned: readonly string[], bought: readonly number[], q: number): ShopStatus {
  if (bought.includes(q)) return { kind: 'owned' };
  return owned.length >= offer.unlockAt ? { kind: 'open' } : { kind: 'locked', needs: offer.unlockAt };
}

/** Happiness of the town (0–100) from what was bought. */
export function townHappiness(shop: readonly ShopItem[], owned: readonly string[]): number {
  return Math.min(100, BASE_HAPPINESS + ownedItems(shop, owned).reduce((a, i) => a + i.joy, 0));
}

/** Discovery buildings in order. */
const discoveryOf = (shop: readonly ShopItem[]): ShopItem[] => shop.filter((i) => i.discovery !== undefined).sort((a, b) => a.discovery! - b.discovery!);

/** The next building of the discovery phase, or null once they are all bought (free phase). */
export function nextDiscovery(shop: readonly ShopItem[], owned: readonly string[]): ShopItem | null {
  return discoveryOf(shop).find((i) => !owned.includes(i.id)) ?? null;
}

/**
 * Welcome gift (lot L9.3): while nothing has been bought, the end of a day tops the piggy bank up to the price of the
 * first building, so that every child buys something after the very first day. Returns the euros to add (0 if none).
 */
export function welcomeGift(shop: readonly ShopItem[], owned: readonly string[], wallet: number): number {
  if (owned.length) return 0;
  const first = nextDiscovery(shop, owned);
  return first ? Math.max(0, first.price - wallet) : 0;
}

export type ShopStatus =
  | { kind: 'owned' }
  | { kind: 'open' }
  /** Discovery phase: will come later, in this order. */
  | { kind: 'later' }
  /** Free phase: needs this many buildings. */
  | { kind: 'locked'; needs: number };

/** What the shop shows for one building. */
export function shopStatus(shop: readonly ShopItem[], owned: readonly string[], item: ShopItem): ShopStatus {
  // A building that may be bought again never shows as « owned »: it stays open, at a higher price (lot L10.6).
  if (!item.repeat && owned.includes(item.id)) return { kind: 'owned' };
  const next = nextDiscovery(shop, owned);
  if (item.discovery !== undefined) return next?.id === item.id ? { kind: 'open' } : { kind: 'later' };
  if (next) return { kind: 'later' };
  const count = owned.length;
  return count >= (item.unlockAt ?? 0) ? { kind: 'open' } : { kind: 'locked', needs: item.unlockAt! };
}

/** True once a building that opens heat has been bought (D-19 E5). */
export function heatOpen(shop: readonly ShopItem[], owned: readonly string[]): boolean {
  return ownedItems(shop, owned).some((i) => i.opensHeat);
}

/** Effects of the buildings bought that apply to this day (heat effects only on days with heat). */
export function dayEffects(day: DayDef, shop: readonly ShopItem[], owned: readonly string[]): TownEffect[] {
  const heating = isHeatingDay(day);
  return ownedItems(shop, owned)
    .flatMap((i) => i.effects)
    .filter((e) => (!e.days || e.days.includes(day.id)) && (e.out === 'elec' || heating));
}

/**
 * How the buildings bought soften the day's events (lot L7.1): the quarter of a building that `protects` never goes
 * dark (`quarterOf` says in which quarter of the town a building stands), `softens` weakens bad events, `heatwaveCap`
 * lets the plant produce more during a heatwave.
 */
export function eventMods(shop: readonly ShopItem[], owned: readonly string[], quarterOf: (id: string) => number | null): EventMods {
  const mine = ownedItems(shop, owned);
  const guard = mine.find((i) => i.protects);
  return {
    protectedQuarter: guard ? quarterOf(guard.id) : NO_MODS.protectedQuarter,
    strength: mine.reduce((k, i) => k * (i.softens ?? 1), 1),
    heatwaveCap: Math.max(NO_MODS.heatwaveCap, ...mine.map((i) => i.heatwaveCap ?? 0)),
    // Town hall: the party is drawn more often. Fire station: repairs are quicker (lot L10.6).
    partyWeight: Math.max(NO_MODS.partyWeight, ...mine.map((i) => i.party ?? 0)),
    repair: Math.min(NO_MODS.repair, ...mine.map((i) => i.repair ?? 1)),
  };
}

/** Euros the town's buildings pay at the end of a day (D-19 E1). */
export function dayBonus(shop: readonly ShopItem[], owned: readonly string[]): number {
  return ownedItems(shop, owned).reduce((a, i) => a + i.bonus, 0);
}

export type Mood = 'content' | 'noir' | 'froid' | 'calme';

/** Mood of the day, shown by the town: dark when electricity is far short, cold when heat is, happy when all is well. */
export function moodOf(elec: Gauge, heat: Gauge | null, elecShort: boolean, heatShort: boolean): Mood {
  if (elec === 'loin' && elecShort) return 'noir';
  if (heat === 'loin' && heatShort) return 'froid';
  if (elec === 'bien' && (heat === null || heat === 'bien')) return 'content';
  return 'calme';
}
