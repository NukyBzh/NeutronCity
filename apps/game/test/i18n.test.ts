import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseTexts } from '../src/i18n';

const fr = readFileSync(new URL('../../../content/i18n/fr.yaml', import.meta.url), 'utf8');

describe('interface texts (content/i18n/fr.yaml)', () => {
  it('is a valid map of non-empty texts', () => {
    expect(Object.keys(parseTexts(fr)).length).toBeGreaterThan(0);
  });

  it('has every id used by the welcome screen', () => {
    const texts = parseTexts(fr);
    for (const id of ['app.title', 'app.subtitle', 'app.version', 'cassandra.alt', 'home.hello']) expect(texts[id]).toBeTruthy();
  });

  it('rejects an empty text', () => {
    expect(() => parseTexts('a: ""')).toThrow();
  });
});
