import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { validateShop } from '@neutron/engine';
import { SCHOOL_IN, SCHOOL_OUT, VISITED, VISIT_HOURS, WHO_PICTURES, visitsAt } from '../src/play/iso/visits';
import { TOWN_IMAGES } from '../src/play/iso/town';

const SHOP = validateShop(parse(readFileSync(fileURLToPath(new URL('../../../content/shop/shop.yaml', import.meta.url)), 'utf8')));
const ALL = SHOP.map((i) => i.id);
const ids = (hour: number, built: readonly string[] = ALL): string[] => visitsAt(hour, built).map((v) => v.id).sort();

describe('who goes into which building (lot L10.5b, R2-05)', () => {
  it('every building visited is really in the shop, and every walker has his two pictures', () => {
    for (const id of VISITED) expect(ALL, id).toContain(id);
    for (const [who, p] of Object.entries(WHO_PICTURES)) {
      expect(TOWN_IMAGES, `${who} de face`).toContain(p.front);
      expect(TOWN_IMAGES, `${who} de dos`).toContain(p.back);
      expect(p.size).toBeGreaterThan(20);
    }
  });

  it('the children go into the school in the morning and come out at the end of the day', () => {
    const school = (h: number) => visitsAt(h, ALL).find((v) => v.id === 'ecole');
    expect(school(SCHOOL_IN[0] - 1)).toBeUndefined();
    expect(school(SCHOOL_IN[0] + 0.5)?.mode).toBe('in');
    expect(school(SCHOOL_IN[1] + 1)).toBeUndefined();
    expect(school(SCHOOL_OUT[0] + 0.5)?.mode).toBe('out');
    expect(school(SCHOOL_OUT[1] + 0.5)).toBeUndefined();
    expect(school(10)?.who ?? 'enfant').toBe('enfant');
  });

  it('a building that is not built yet is never visited', () => {
    expect(ids(10, [])).toEqual([]);
    expect(ids(10, ['epicerie'])).toEqual(['epicerie']);
    expect(ids(8, ['ecole'])).toEqual(['ecole']);
  });

  it('each building has its own hours, and the night is quiet', () => {
    expect(ids(6.5)).toEqual([]);
    expect(ids(23)).toEqual([]);
    expect(ids(14)).toContain('piscine');
    expect(ids(10)).not.toContain('piscine');
    expect(ids(10)).toContain('epicerie');
    // Never two visits of the same building at once.
    for (let h = 6; h < 24; h += 0.25) {
      const got = ids(h);
      expect(new Set(got).size, `à ${h} h`).toBe(got.length);
    }
  });

  it('the visits only change a few times a day, so the town is hardly ever redrawn for them', () => {
    let changes = 0;
    let last = JSON.stringify(visitsAt(6, ALL));
    for (let h = 6; h < 24; h += 1 / 60) {
      const now = JSON.stringify(visitsAt(h, ALL));
      if (now !== last) changes++;
      last = now;
    }
    expect(changes).toBeLessThanOrEqual(VISIT_HOURS.length);
    expect(changes).toBeGreaterThan(2);
  });
});
