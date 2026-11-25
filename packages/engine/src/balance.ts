/**
 * Balance (lot L7.2, D-22): simulated players and measures of the events, the stars and the money. Used by the tests
 * (packages/engine/test/balance.test.ts) and by the report tool (tools/equilibrage). Pure, like the rest of the engine.
 */
import { type DayDef, type SurpriseKind } from './day';
import { dayResult, demandAt, hourOf, simulate, starBonus, type GameState } from './game';
import { QUARTERS } from './surprises';
import {
  copiesOf, dayBonus, dayEffects, eventMods, nextCopyId, priceOf, quarterPrice, quarterStatus, shopStatus, welcomeGift,
  type QuarterOffer, type ShopItem,
} from './town';

/** A simulated player: how it moves the sliders, and how long it takes to act on an event (null: never). */
export interface Bot {
  move: (day: DayDef) => (s: GameState) => { elec: number; heat: number } | null;
  fixDelay: number | null;
}

const round = (v: number, step: number): number => Math.round(v / step) * step;

/** Looks a quarter of an hour ahead and acts at once on every event. */
export const PERFECT: Bot = {
  move: (day) => (s) => {
    const d = demandAt(day, s.surprises, hourOf(s) + 0.25, s.effects);
    return { elec: round(d.elec, 5), heat: round(d.heat, 5) };
  },
  fixDelay: 0,
};

/**
 * A rough imitation of an attentive child: looks at the demand every 20 game minutes without looking ahead, sets the
 * sliders on it (5 % steps, like the real sliders), and acts on an event half an hour after it starts.
 */
export const CHILD: Bot = {
  move: (day) => (s) => {
    if (s.minute % 20 !== 0) return null;
    const d = demandAt(day, s.surprises, hourOf(s), s.effects);
    return { elec: round(d.elec, 5), heat: round(d.heat, 5) };
  },
  fixDelay: 0.5,
};

/** Follows the demand like the perfect player but never acts on an event. */
export const NO_REPAIR: Bot = { ...PERFECT, fixDelay: null };

/** Touches nothing. */
export const IDLE: Bot = { move: () => () => null, fixDelay: null };

export const BOTS = { parfait: PERFECT, enfant: CHILD, 'sans-réparer': NO_REPAIR, inactif: IDLE } as const;
export type BotName = keyof typeof BOTS;

/** One day played by a bot: the end state and its result. */
export function playDay(day: DayDef, seed: number, bot: Bot, shop: readonly ShopItem[] = [], owned: readonly string[] = [],
  quarterOf: (id: string) => number | null = () => null) {
  const game = simulate(day, seed, bot.move(day), dayEffects(day, shop, owned), eventMods(shop, owned, quarterOf), bot.fixDelay ?? false);
  return { game, result: dayResult(day, game) };
}

export interface DayMeasure {
  /** Share of games with 1, 2 or 3 stars. */
  stars: Record<1 | 2 | 3, number>;
  /** Mean share of the maximum earned (rewards apart). */
  ratio: number;
  /** Mean number of events a day, and share of days with each kind. */
  events: number;
  kinds: Partial<Record<SurpriseKind, number>>;
}

/** Plays `seeds` games of a day with a bot and measures them. */
export function measureDay(day: DayDef, bot: Bot, seeds: number): DayMeasure {
  const stars = { 1: 0, 2: 0, 3: 0 };
  const kinds: Partial<Record<SurpriseKind, number>> = {};
  let ratio = 0;
  let events = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    const { game, result } = playDay(day, seed, bot);
    stars[result.stars] += 1 / seeds;
    ratio += (game.euros - game.stats.rewards) / result.max / seeds;
    events += game.surprises.length / seeds;
    for (const k of new Set(game.surprises.map((e) => e.kind))) kinds[k] = (kinds[k] ?? 0) + 1 / seeds;
  }
  return { stars, ratio, events, kinds };
}

export interface Campaign {
  /** Day (1-based) on which each building was bought. */
  bought: { id: string; day: number }[];
  /** Days played until the whole town was bought (null: not within `maxDays`). */
  complete: number | null;
  /** What each quarter for sale cost and the day it was bought; empty when the campaign does not count the lots. */
  quarters: { price: number; day: number }[];
  /** Days played until every lot holds a building, the quarters for sale included (null: not within `maxDays`). */
  full: number | null;
}

/**
 * The ground the bot builds on (lot L10.6c): the town starts with `start` lots and each quarter for sale bought in the
 * shop opens `perQuarter` more. Without this the campaign buys without counting the ground, as it did before.
 */
export interface CampaignLots {
  start: number;
  perQuarter: number;
  offer: QuarterOffer;
}

/**
 * A bot plays the days in turn (as the days screen offers them), keeps its euros and the town's bonus by stars, and
 * buys whatever the shop offers as soon as it can pay (the cheapest first).
 */
export function campaign(days: readonly DayDef[], shop: readonly ShopItem[], bot: Bot, maxDays = 60,
  quarterOf: (id: string) => number | null = () => null, lots?: CampaignLots): Campaign {
  let wallet = 0;
  const owned: string[] = [];
  const bought: Campaign['bought'] = [];
  const quarters: Campaign['quarters'] = [];
  /** The quarters for sale bought, in the order of the purchases. */
  const got: number[] = [];
  let complete: number | null = null;
  /** Lots left to build on, without counting the ground when the caller does not ask for it. */
  const room = (): number => (lots ? lots.start + lots.perQuarter * got.length - owned.length : Number.POSITIVE_INFINITY);
  for (let n = 1; n <= maxDays; n++) {
    const day = days[(n - 1) % days.length]!;
    const { game, result } = playDay(day, n, bot, shop, owned, quarterOf);
    wallet += game.euros + starBonus(dayBonus(shop, owned), result.stars);
    wallet += welcomeGift(shop, owned, wallet);
    for (;;) {
      // No ground left: the only thing worth buying is a quarter for sale (lot L10.6c, D-36). It saves up for it, so
      // the price of a quarter is told in days of play by the report of `tools/equilibrage`.
      if (room() === 0) {
        const price = quarterPrice(lots!.offer, got);
        const q = got.length;
        if (price === null || price > wallet || quarterStatus(lots!.offer, owned, got, q).kind !== 'open') break;
        wallet -= price;
        got.push(q);
        quarters.push({ price, day: n });
        continue;
      }
      // The cheapest it can afford, but a building it does not have yet before a second copy of one it has (L10.6).
      const open = shop
        .filter((i) => shopStatus(shop, owned, i).kind === 'open' && priceOf(i, owned) <= wallet)
        .sort((a, b) => (copiesOf(owned, a.id) - copiesOf(owned, b.id)) || (priceOf(a, owned) - priceOf(b, owned)));
      if (!open.length) break;
      const item = open[0]!;
      const id = nextCopyId(item, owned);
      wallet -= priceOf(item, owned);
      owned.push(id);
      bought.push({ id, day: n });
    }
    // The town is complete once every building of the shop has been bought at least once (copies do not count).
    if (complete === null && shop.every((i) => copiesOf(owned, i.id) > 0)) {
      complete = n;
      if (!lots) return { bought, complete, quarters, full: null };
    }
    // Nothing left to buy: every quarter bought and every lot built on.
    if (lots && got.length === QUARTERS && room() === 0) return { bought, complete, quarters, full: n };
  }
  return { bought, complete, quarters, full: null };
}
