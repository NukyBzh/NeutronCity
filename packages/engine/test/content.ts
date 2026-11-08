/** Test helper: reads the content files the way the game does (YAML parsed, then checked by the engine). */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { validateDay, validateShop, type DayDef, type ShopItem } from '../src/index';

export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const read = (p: string): unknown => parse(readFileSync(join(ROOT, p), 'utf8'));

export const DAY_FILES = readdirSync(join(ROOT, 'content/days')).filter((f) => f.endsWith('.yaml'));
export const DAYS: DayDef[] = DAY_FILES.map((f) => validateDay(read(`content/days/${f}`), f));
export const SHOP: ShopItem[] = validateShop(read('content/shop/shop.yaml'));
export const TEXTS = { ...(read('content/i18n/fr.yaml') as Record<string, string>), ...(read('content/dialogues/fr.yaml') as Record<string, string>) };
