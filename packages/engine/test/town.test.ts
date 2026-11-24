import { describe, expect, it } from 'vitest';
import {
  BASE_HAPPINESS, DAY_MINUTES, NO_MODS, START_HOUR, baseId, copiesOf, dayBonus, dayEffects, dayResult, demandAt, drawSurprises, effectsAt,
  QUARTERS, eventMods, heatOpen, hourOf, momentWeight, nextCopyId, nextDiscovery, priceOf, quarterPrice, quarterStatus, shopStatus,
  simulate, townHappiness, validateQuarters, validateShop,
  welcomeGift, type DayDef, type EventMods, type GameState, type ShopItem,
} from '../src/index';
import { DAYS, OFFER, SHOP, TEXTS } from './content';

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
  it('has the 24 buildings, 8 of them in the discovery phase, and one that opens heat', () => {
    expect(SHOP).toHaveLength(24);
    expect(SHOP.filter((i) => i.discovery !== undefined).map((i) => i.id)).toEqual([
      'reseau-chaleur', 'ferme', 'maison-lilas', 'maison-ve', 'epicerie', 'ecole', 'usine-cereales', 'maison-medicale',
    ]);
    expect(SHOP.filter((i) => i.opensHeat).map((i) => i.id)).toEqual(['reseau-chaleur']);
  });

  it('every building has its name, its effect, its place, and Cassandra presents each discovery', () => {
    const missing = SHOP.flatMap((i) => [
      `shop.${i.id}`, `shop.where.${i.id}`, `shop.effect.${i.id}`, ...(i.discovery ? [`shop.discover.${i.id}`] : []),
    ]).filter((id) => !(id in TEXTS));
    expect(missing).toEqual([]);
  });

  it('prices from 2 400 to 12 000 € (the first building 900 €, L9.3); a building pays itself back in 12 to 20 days of bonus (E3, E6, D-22), 30 % more for those that help (L10.2)', () => {
    // A building helps when it lowers or smooths the demand, or protects from the events (D-30).
    const helps = (i: ShopItem): boolean => !!(i.softens || i.protects || i.heatwaveCap || i.party || i.repair) || (i.effects ?? []).some((e) => e.add < 0);
    expect(SHOP.filter(helps).map((i) => i.id).sort())
      .toEqual(['batterie', 'caserne', 'cuve', 'hopital', 'isolation', 'mairie', 'maison-medicale', 'parc', 'solaire']);
    for (const i of SHOP) {
      const k = helps(i) ? 1.3 : 1;
      expect(i.price).toBeGreaterThanOrEqual(i.discovery === 1 ? 900 : 2400);
      expect(i.price).toBeLessThanOrEqual(12000 * k + 50);
      expect(i.price / i.bonus).toBeGreaterThanOrEqual(12);
      expect(i.price / i.bonus).toBeLessThanOrEqual(20 * k + 0.5);
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
    for (const step of ['reseau-chaleur', 'ferme', 'maison-lilas', 'maison-ve', 'epicerie', 'ecole', 'usine-cereales', 'maison-medicale']) {
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

  it('the heat network comes first and costs less than a first summer day pays (L9.3)', () => {
    const first = nextDiscovery(SHOP, [])!;
    expect(first.id).toBe('reseau-chaleur');
    expect(first.price).toBeLessThanOrEqual(900);
  });

  it('the welcome gift tops the piggy bank up to the first building, only while nothing is bought (L9.3)', () => {
    expect(welcomeGift(SHOP, [], 40)).toBe(860);
    expect(welcomeGift(SHOP, [], 900)).toBe(0);
    expect(welcomeGift(SHOP, [], 1800)).toBe(0);
    expect(welcomeGift(SHOP, ['reseau-chaleur'], 0)).toBe(0);
  });

  it('pays the bonus of the buildings bought', () => {
    expect(dayBonus(SHOP, [])).toBe(0);
    expect(dayBonus(SHOP, ['ferme', 'reseau-chaleur'])).toBe(260);
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
        for (const seed of [1, 2, 3, 4, 5]) expect(dayResult(day, simulate(day, seed, ahead(day), effects, NO_MODS, true)).stars).toBe(3);
      });
    });
});

describe('the three quarters for sale (lot L10.6b3, R2-07)', () => {
  const full = Array.from({ length: OFFER.unlockAt }, (_, i) => `b${i}`);

  it('content/shop names a price for each quarter, each one dearer than the one before', () => {
    expect(OFFER.prices).toHaveLength(QUARTERS);
    expect([...OFFER.prices].sort((a, b) => a - b)).toEqual([...OFFER.prices]);
    for (const p of OFFER.prices) expect(Number.isInteger(p) && p > 0, String(p)).toBe(true);
    // The quarters come when the town is nearly full: 24 buildings of the 30 lots of the start.
    expect(OFFER.unlockAt).toBeGreaterThan(18);
    expect(OFFER.unlockAt).toBeLessThan(30);
  });

  it('refuses a shop whose quarters are missing, too few or not dearer each time', () => {
    const ok = { quarters: { prices: [1000, 2000, 3000], unlockAt: 4 } };
    expect(validateQuarters(ok)).toEqual({ prices: [1000, 2000, 3000], unlockAt: 4 });
    expect(() => validateQuarters({})).toThrow(/prices/);
    expect(() => validateQuarters({ quarters: { prices: [1000, 2000], unlockAt: 4 } })).toThrow(/prices/);
    expect(() => validateQuarters({ quarters: { prices: [1000, 900, 3000], unlockAt: 4 } })).toThrow(/costs more/);
    expect(() => validateQuarters({ quarters: { prices: [1000, 2000, 3000] } })).toThrow(/unlockAt/);
    expect(() => validateQuarters({ quarters: { prices: [1000, 2000, 0], unlockAt: 4 } })).toThrow(/euros/);
  });

  it('the price is the one of the next quarter, whichever one the child picks', () => {
    expect(quarterPrice(OFFER, [])).toBe(OFFER.prices[0]);
    expect(quarterPrice(OFFER, [2])).toBe(OFFER.prices[1]);
    expect(quarterPrice(OFFER, [2, 0])).toBe(OFFER.prices[2]);
    // All three bought: there is nothing left to sell.
    expect(quarterPrice(OFFER, [0, 1, 2])).toBeNull();
  });

  it('a quarter opens with the size of the town, and shows as bought afterwards', () => {
    const nearly = full.slice(0, OFFER.unlockAt - 1);
    for (let q = 0; q < QUARTERS; q++) {
      expect(quarterStatus(OFFER, nearly, [], q), `${q} trop tôt`).toEqual({ kind: 'locked', needs: OFFER.unlockAt });
      expect(quarterStatus(OFFER, full, [], q), `${q} ouvert`).toEqual({ kind: 'open' });
    }
    expect(quarterStatus(OFFER, full, [1], 1)).toEqual({ kind: 'owned' });
    expect(quarterStatus(OFFER, full, [1], 0)).toEqual({ kind: 'open' });
  });
});

describe('buildings bought several times (lot L10.6, R2-06)', () => {
  const repeatables = SHOP.filter((i) => i.repeat);
  const house = SHOP.find((i) => i.id === 'petite-maison')!;

  it('only the small house and the block of flats may be bought again', () => {
    expect(repeatables.map((i) => i.id).sort()).toEqual(['immeuble-neuf', 'petite-maison']);
    for (const i of repeatables) expect(i.discovery, i.id).toBeUndefined();
  });

  it('a copy keeps its own id and leads back to its building', () => {
    expect(baseId('petite-maison')).toBe('petite-maison');
    expect(baseId('petite-maison-2')).toBe('petite-maison');
    expect(baseId('maison-medicale')).toBe('maison-medicale');
    // No building of the shop ends with a number, so no id is mistaken for a copy.
    for (const i of SHOP) expect(baseId(i.id), i.id).toBe(i.id);
    expect(nextCopyId(house, [])).toBe('petite-maison');
    expect(nextCopyId(house, ['petite-maison'])).toBe('petite-maison-2');
    expect(nextCopyId(house, ['petite-maison', 'petite-maison-2'])).toBe('petite-maison-3');
    expect(copiesOf(['petite-maison', 'petite-maison-2', 'hotel'], 'petite-maison')).toBe(2);
  });

  it('each copy costs a little more, rounded to ten euros', () => {
    expect(priceOf(house, [])).toBe(house.price);
    expect(priceOf(house, ['petite-maison'])).toBe(Math.round(house.price * 1.15 / 10) * 10);
    expect(priceOf(house, ['petite-maison', 'petite-maison-2'])).toBeGreaterThan(priceOf(house, ['petite-maison']));
    // A building bought once keeps its price whatever the town holds.
    const hotel = SHOP.find((i) => i.id === 'hotel')!;
    expect(priceOf(hotel, ['hotel'])).toBe(hotel.price);
  });

  it('every copy pays its bonus, gives its happiness and uses its electricity', () => {
    const one = ['petite-maison'];
    const three = ['petite-maison', 'petite-maison-2', 'petite-maison-3'];
    expect(dayBonus(SHOP, three)).toBe(dayBonus(SHOP, one) * 3);
    expect(townHappiness(SHOP, three) - BASE_HAPPINESS).toBe((townHappiness(SHOP, one) - BASE_HAPPINESS) * 3);
    for (const d of DAYS) expect(dayEffects(d, SHOP, three).length).toBe(dayEffects(d, SHOP, one).length * 3);
  });

  it('the shop keeps offering it, and says nothing of the kind for the others', () => {
    const all = SHOP.map((i) => i.id);
    expect(shopStatus(SHOP, all, house).kind).toBe('open');
    expect(shopStatus(SHOP, all, SHOP.find((i) => i.id === 'hotel')!).kind).toBe('owned');
  });

  it('the town hall brings the party more often, the fire station shortens the repairs', () => {
    const mods = eventMods(SHOP, ['mairie', 'caserne'], () => null);
    expect(mods.partyWeight).toBe(3);
    expect(mods.repair).toBe(0.5);
    const parties = (m: EventMods): number => {
      let n = 0;
      for (let seed = 0; seed < 300; seed++) n += drawSurprises(DAYS[0]!, seed, m).filter((s) => s.kind === 'party').length;
      return n;
    };
    expect(parties(mods)).toBeGreaterThan(parties(NO_MODS) * 1.5);
  });
});
