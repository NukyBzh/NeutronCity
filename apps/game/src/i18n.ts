/**
 * Game texts: never hard-coded in components. Interface texts live in content/i18n/<lang>.yaml and Cassandra's lines in
 * content/dialogues/<lang>.yaml (the id of a line will name its voice file later). French only in V1; English later
 * with the same ids.
 */
import { parse } from 'yaml';
import frUi from '../../../content/i18n/fr.yaml?raw';
import frLines from '../../../content/dialogues/fr.yaml?raw';

export type Texts = Record<string, string>;

export function parseTexts(source: string): Texts {
  const data: unknown = parse(source);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('i18n: a map of id → text is expected');
  const out: Texts = {};
  for (const [id, value] of Object.entries(data)) {
    if (typeof value !== 'string' || value.trim() === '') throw new Error(`i18n: text "${id}" is empty or not a string`);
    out[id] = value;
  }
  return out;
}

const texts: Texts = { ...parseTexts(frUi), ...parseTexts(frLines) };

/** Text of an id, with `{name}` placeholders replaced; a missing id shows itself so it is noticed. */
export function t(id: string, values: Record<string, string> = {}): string {
  const text = texts[id] ?? id;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
}

/** Whole euros with a French thin space: 1 240 €. */
export const euros = (n: number): string => `${Math.round(n).toLocaleString('fr-FR')} €`;
