/**
 * Game content read at start-up: the days (content/days/*.yaml) and the shop (content/shop/shop.yaml), parsed from YAML
 * and checked by the engine. A broken file stops the game with a clear message instead of playing a wrong day.
 */
import { parse } from 'yaml';
import { validateDay, validateShop, type DayDef, type ShopItem } from '@neutron/engine';
import shopSource from '../../../content/shop/shop.yaml?raw';

const dayFiles = import.meta.glob<string>('../../../content/days/*.yaml', { eager: true, query: '?raw', import: 'default' });

/** Days by increasing level (the order in which they open). */
export const DAYS: DayDef[] = Object.entries(dayFiles)
  .map(([path, src]) => validateDay(parse(src), path.split('/').pop()))
  .sort((a, b) => a.level - b.level);

export const SHOP: ShopItem[] = validateShop(parse(shopSource), 'shop.yaml');

export const dayById = (id: string): DayDef | undefined => DAYS.find((d) => d.id === id);
