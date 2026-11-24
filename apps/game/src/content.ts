/**
 * Game content read at start-up: the days (content/days/*.yaml) and the shop (content/shop/shop.yaml), parsed from YAML
 * and checked by the engine. A broken file stops the game with a clear message instead of playing a wrong day.
 */
import { parse } from 'yaml';
import { validateDay, validateQuarters, validateShop, type DayDef, type QuarterOffer, type ShopItem } from '@neutron/engine';
import shopSource from '../../../content/shop/shop.yaml?raw';

const dayFiles = import.meta.glob<string>('../../../content/days/*.yaml', { eager: true, query: '?raw', import: 'default' });

/** Days by increasing level (the order in which they open). */
export const DAYS: DayDef[] = Object.entries(dayFiles)
  .map(([path, src]) => validateDay(parse(src), path.split('/').pop()))
  .sort((a, b) => a.level - b.level);

const shopData: unknown = parse(shopSource);
export const SHOP: ShopItem[] = validateShop(shopData, 'shop.yaml');
/** What the three quarters for sale cost, and when they are offered (lot L10.6b3). */
export const QUARTERS_OFFER: QuarterOffer = validateQuarters(shopData, 'shop.yaml');

export const dayById = (id: string): DayDef | undefined => DAYS.find((d) => d.id === id);
