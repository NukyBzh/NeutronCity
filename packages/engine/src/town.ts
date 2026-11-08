/**
 * The town's happiness and the shop. Happiness of the town only grows with what the player buys (never lost); the
 * mood of the day is only shown in the town and costs nothing (owner's choice, 2026-11-08). Buying and saving come
 * with lot L6; this file fixes the rule and the shop format (content/shop/shop.yaml).
 */
import type { Gauge } from './game';

export interface ShopItem { id: string; price: number; joy: number }

/** Happiness of a town with nothing bought yet. */
export const BASE_HAPPINESS = 40;

export function validateShop(raw: unknown, where = 'shop'): ShopItem[] {
  const items = (raw as { items?: unknown })?.items;
  const errors: string[] = [];
  if (!Array.isArray(items) || items.length === 0) throw new Error(`${where}: items: list expected`);
  const ids = new Set<string>();
  items.forEach((it, i) => {
    const o = (it ?? {}) as Record<string, unknown>;
    if (typeof o.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(o.id)) errors.push(`items[${i}].id: lower-case word expected`);
    else if (ids.has(o.id)) errors.push(`items[${i}].id: "${o.id}" twice`);
    else ids.add(o.id);
    if (!Number.isInteger(o.price) || (o.price as number) <= 0) errors.push(`items[${i}].price: whole euros expected`);
    if (!Number.isInteger(o.joy) || (o.joy as number) <= 0) errors.push(`items[${i}].joy: positive whole number expected`);
  });
  if (errors.length) throw new Error(`${where}: ${errors.join('; ')}`);
  return items as ShopItem[];
}

/** Happiness of the town (0–100) from what was bought. */
export function townHappiness(shop: readonly ShopItem[], owned: readonly string[]): number {
  return Math.min(100, BASE_HAPPINESS + shop.filter((i) => owned.includes(i.id)).reduce((a, i) => a + i.joy, 0));
}

export type Mood = 'content' | 'noir' | 'froid' | 'calme';

/** Mood of the day, shown by the town: dark when electricity is far short, cold when heat is, happy when all is well. */
export function moodOf(elec: Gauge, heat: Gauge | null, elecShort: boolean, heatShort: boolean): Mood {
  if (elec === 'loin' && elecShort) return 'noir';
  if (heat === 'loin' && heatShort) return 'froid';
  if (elec === 'bien' && (heat === null || heat === 'bien')) return 'content';
  return 'calme';
}
