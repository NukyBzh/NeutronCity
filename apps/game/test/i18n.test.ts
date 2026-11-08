import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseTexts } from '../src/i18n';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const ui = parseTexts(readFileSync(join(root, 'content/i18n/fr.yaml'), 'utf8'));
const lines = parseTexts(readFileSync(join(root, 'content/dialogues/fr.yaml'), 'utf8'));
const all = { ...ui, ...lines };

const sources = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sources(p) : /\.tsx?$/.test(f) ? [readFileSync(p, 'utf8')] : [];
  });
const code = sources(join(root, 'apps/game/src')).join('\n');

describe('texts (content/i18n/fr.yaml, content/dialogues/fr.yaml)', () => {
  it('are valid maps of non-empty texts, with no id in both files', () => {
    expect(Object.keys(ui).length).toBeGreaterThan(0);
    expect(Object.keys(lines).filter((id) => id in ui)).toEqual([]);
  });

  it('every literal id used in the code exists', () => {
    const ids = [...code.matchAll(/\bt\('([\w.]+)'/g)].map((m) => m[1]!);
    const scripted = [...code.matchAll(/\bid: '(jeu\.[\w.]+)'/g)].map((m) => m[1]!);
    expect(ids.length).toBeGreaterThan(20);
    expect([...ids, ...scripted].filter((id) => !(id in all))).toEqual([]);
  });

  it('ids built at run time exist', () => {
    const built = [
      ...['ete', 'printemps', 'hiver'].flatMap((d) => [`day.${d}.title`, `day.${d}.level`]),
      ...['fontaine', 'parc', 'piste', 'eclairage', 'ecole'].map((s) => `shop.${s}`),
      ...['elec', 'heat'].flatMap((o) => [`jeu.indice.${o}.monter`, `jeu.indice.${o}.baisser`]),
      'gauge.bien', 'gauge.presque', 'gauge.loin', 'bilan.1', 'bilan.2', 'bilan.3',
    ];
    expect(built.filter((id) => !(id in all))).toEqual([]);
  });

  it("Cassandra's lines are short and have at most one new word in bold", () => {
    for (const [id, text] of Object.entries(lines)) {
      const words = text.replace(/\*\*/g, '').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
      expect(words, id).toBeLessThanOrEqual(16);
      expect((text.match(/\*\*/g) ?? []).length, id).toBeLessThanOrEqual(2);
    }
  });

  it('rejects an empty text', () => {
    expect(() => parseTexts('a: ""')).toThrow();
  });
});
