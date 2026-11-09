import { describe, expect, it } from 'vitest';
import {
  DAY_MINUTES, START_HOUR, dayBonus, dayEffects, dayResult, demandAt, drawSurprises, effectsAt, heatOpen, hourOf, momentWeight,
  nextDiscovery, shopStatus, simulate, validateShop, type DayDef, type GameState, type ShopItem,
} from '../src/index';
import { DAYS, SHOP, TEXTS } from './content';

const SEEDS = 200;
const ids = (items: readonly ShopItem[]) => items.map((i) => i.id);
/** Every building bought, or only those that never lower demand (the hardest town for D-01). */
const ALL = ids(SHOP);
const ONLY_MORE = ids(SHOP.filter((i) => i.effects.every((e) => e.add > 0)));

const ahead = (day: DayDef) => (s: GameState) => {
  const d = demandAt(day, s.surprises, hourOf(s) + 0.25, s.effects);
  return { elec: Math.round(d.elec / 5) * 5, heat: Math.round(d.heat / 5) * 5 };
};

describe('content/shop (lot L6, D-19)', () => {
  it('has the 18 buildings, 8 of them in the discovery phase, and one that opens heat', () => {
    expect(SHOP).toHaveLength(18);
    expect(SHOP.filter((i) => i.discovery !== undefined).map((i) => i.id)).toEqual([
      'ferme', 'reseau-chaleur', 'maison-lilas', 'maison-ve', 'epicerie', 'ecole', 'usine-cereales', 'maison-medicale',
    ]);
    expect(SHOP.filter((i) => i.opensHeat).map((i) => i.id)).toEqual(['reseau-chaleur']);
  });

  it('every building has its name, its effect, its place, and Cassandra presents each discovery', () => {
    const missing = SHOP.flatMap((i) => [
      `shop.${i.id}`, `shop.where.${i.id}`, `shop.effect.${i.id}`, ...(i.discovery ? [`shop.discover.${i.id}`] : []),
    ]).filter((id) => !(id in TEXTS));
    expect(missing).toEqual([]);
  });

  it('prices from 800 to 5 000 €; a building pays itself back in 1 to 2.5 days of bonus (E3, E6)', () => {
    for (const i of SHOP) {
      expect(i.price).toBeGreaterThanOrEqual(800);
      expect(i.price).toBeLessThanOrEqual(5000);
      expect(i.price / i.bonus).toBeGreaterThanOrEqual(1);
      expect(i.price / i.bonus).toBeLessThanOrEqual(2.5);
    }
  });

  it('effects name real days only', () => {
    const days = DAYS.map((d) => d.id);
    expect(SHOP.flatMap((i) => i.effects.flatMap((e) => e.days ?? [])).filter((d) => !days.includes(d))).toEqual([]);
  });

  it('the shop check rejects broken files with a clear message', () => {
    expect(() => validateShop({ items: [{ id: 'a', price: 10, joy: 1, bonus: 5, effects: [] }] })).toThrow(/discovery or unlockAt/);
    expect(() => validateShop({ items: [{ id: 'a', price: 10, joy: 1, bonus: 5, discovery: 2 }] })).toThrow(/without gap/);
    expect(() => validateShop({ items: [{ id: 'a', price: 10, joy: 1, bonus: 5, unlockAt: 0, effects: [{ out: 'elec', add: 9, when: 'jour' }] }] })).toThrow(/between -5 and 5/);
  });
});

describe('order of the shop (E4, E5)', () => {
  it('offers the discovery buildings one at a time, in order, then opens the others as the town grows', () => {
    const owned: string[] = [];
    for (const step of ['ferme', 'reseau-chaleur', 'maison-lilas', 'maison-ve', 'epicerie', 'ecole', 'usine-cereales', 'maison-medicale']) {
      expect(nextDiscovery(SHOP, owned)?.id).toBe(step);
      const open = SHOP.filter((i) => shopStatus(SHOP, owned, i).kind === 'open').map((i) => i.id);
      expect(open).toEqual([step]);
      owned.push(step);
    }
    expect(nextDiscovery(SHOP, owned)).toBeNull();
    const open8 = SHOP.filter((i) => shopStatus(SHOP, owned, i).kind === 'open').map((i) => i.id);
    expect(open8.sort()).toEqual(['batterie', 'fontaine', 'parc']);
    expect(shopStatus(SHOP, owned, SHOP.find((i) => i.id === 'cuve')!)).toEqual({ kind: 'locked', needs: 16 });
  });

  it('the heat network opens the days with heat', () => {
    expect(heatOpen(SHOP, ['ferme'])).toBe(false);
    expect(heatOpen(SHOP, ['ferme', 'reseau-chaleur'])).toBe(true);
  });

  it('pays the bonus of the buildings bought', () => {
    expect(dayBonus(SHOP, [])).toBe(0);
    expect(dayBonus(SHOP, ['ferme', 'reseau-chaleur'])).toBe(1600);
  });
});

describe('effects of the buildings on demand (E2)', () => {
  it('moments are smooth and cover the right hours', () => {
    expect(momentWeight('jour', 13)).toBe(1);
    expect(momentWeight('jour', 22)).toBe(0);
    expect(momentWeight('soir', 20)).toBe(1);
    expect(momentWeight('nuit', 2)).toBe(1);
    expect(momentWeight('nuit', 12)).toBe(0);
    for (const w of ['jour', 'soir', 'nuit', 'toujours'] as const) {
      for (let m = 0; m < 24 * 60; m++) expect(Math.abs(momentWeight(w, (m + 1) / 60) - momentWeight(w, m / 60)) * 60).toBeLessThanOrEqual(0.5 + 1e-9);
    }
  });

  it('heat effects never apply to a day without heat', () => {
    const ete = DAYS.find((d) => d.id === 'ete')!;
    expect(dayEffects(ete, SHOP, ALL).filter((e) => e.out === 'heat')).toEqual([]);
    expect(effectsAt(dayEffects(ete, SHOP, ['ferme']), 13).elec).toBe(2);
  });

  it('never pushes electricity + heat above 100 % (D-01)', () => {
    const day = DAYS.find((d) => d.id === 'hiver')!;
    const big = [{ out: 'heat' as const, add: 5, when: 'toujours' as const }, { out: 'elec' as const, add: 5, when: 'toujours' as const }];
    for (let m = 0; m <= DAY_MINUTES; m++) {
      const d = demandAt(day, drawSurprises(day, 3), START_HOUR + m / 60, [...big, ...big, ...big, ...big]);
      expect(d.elec + d.heat).toBeLessThanOrEqual(100 + 1e-9);
    }
  });

  describe.each(DAYS.flatMap((d) => [[d.id, 'tout', d, ALL], [d.id, 'seulement +', d, ONLY_MORE]] as const))(
    '%s with the buildings (%s)', (_id, _set, day, owned) => {
      it(`stays playable for ${SEEDS} seeds: elec + heat ≤ 100 %, slope below the plant's ramp`, () => {
        const effects = dayEffects(day, SHOP, owned);
        for (let seed = 0; seed < SEEDS; seed++) {
          const sur = drawSurprises(day, seed);
          let prev = demandAt(day, sur, START_HOUR, effects);
          for (let m = 1; m <= DAY_MINUTES; m++) {
            const d = demandAt(day, sur, START_HOUR + m / 60, effects);
            if (d.elec + d.heat > 100 + 1e-9) throw new Error(`seed ${seed} minute ${m}: ${d.elec + d.heat} %`);
            const slope = Math.max(Math.abs(d.elec - prev.elec), Math.abs(d.heat - prev.heat)) * 60;
            if (slope > day.rampPctPerHour - 1) throw new Error(`seed ${seed} minute ${m}: slope ${slope} %/h`);
            prev = d;
          }
        }
      });

      it('a player who looks ahead still gets 3 stars', () => {
        const effects = dayEffects(day, SHOP, owned);
        for (const seed of [1, 2, 3, 4, 5]) expect(dayResult(day, simulate(day, seed, ahead(day), effects)).stars).toBe(3);
      });
    });
});
