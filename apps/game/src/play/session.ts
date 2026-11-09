/**
 * What the play screen keeps around the engine's game state: Cassandra's timeline for this game and the production
 * history drawn on the curves. Real-time pacing also lives here: a day (6 h → midnight) lasts about 5 minutes.
 */
import {
  ANNOUNCE_HOURS, NO_MODS, START_HOUR, SURPRISE_SPEC, demandAt, fixSurprise, canFix, hourOf, isOver, newGame, setSetpoints, stepMinute,
  type DayDef, type EventMods, type GameState, type Pose, type TownEffect,
} from '@neutron/engine';

export const REAL_SECONDS_PER_GAME_MINUTE = 300 / (18 * 60);
/** How far ahead the demand is shown (game hours). */
export const LOOK_AHEAD_HOURS = 3;

export interface Sample { h: number; elec: number; heat: number }
export interface TimedLine { hour: number; say: string; pose: Pose }

/**
 * Cassandra's lines of this game: those of the day file, plus each event, announced an hour before it starts (or when
 * it starts, for sudden ones), and explained the first time the child meets it (`seen`: events already explained).
 */
export function timelineOf(day: DayDef, game: GameState, seen: readonly string[] = []): TimedLine[] {
  const events = game.surprises.flatMap((s) => {
    const spec = SURPRISE_SPEC[s.kind];
    const say = { hour: spec.announce ? s.start - ANNOUNCE_HOURS : s.start, say: `surprise.${s.kind}`, pose: 'attention' as Pose };
    const why = { hour: s.start + (spec.announce ? 0 : 0.4), say: `surprise.${s.kind}.why`, pose: 'explique' as Pose };
    return seen.includes(s.kind) ? [say] : [say, why];
  });
  return [...day.lines, ...events].sort((a, b) => a.hour - b.hour);
}

export const sampleOf = (g: GameState): Sample => ({ h: hourOf(g), elec: g.plant.elec, heat: g.plant.heat });

/** Adds one game minute and keeps a sample every 5 minutes for the curves. */
export function advance(day: DayDef, g: GameState, history: Sample[]): { game: GameState; history: Sample[] } {
  const game = stepMinute(day, g);
  return { game, history: game.minute % 5 === 0 ? [...history, sampleOf(game)] : history };
}

/**
 * Review of the mock-up only (`?heure=`): the game played up to `hour` by a player who follows demand a quarter of an
 * hour ahead (`follow`) or never touches anything.
 */
export function playUntil(
  day: DayDef, seed: number, hour: number, follow: boolean, effects: readonly TownEffect[] = [], mods: EventMods = NO_MODS,
): { game: GameState; history: Sample[] } {
  let game = newGame(day, seed, effects, mods);
  let history = [sampleOf(game)];
  while (!isOver(game) && hourOf(game) < hour) {
    // The reviewing player also repairs at once, except in the last hour, so an event in progress can be looked at.
    if (follow) game.surprises.forEach((e, i) => { if (canFix(e, hourOf(game)) && hourOf(game) < hour - 1) game = fixSurprise(game, i); });
    if (follow) {
      const d = demandAt(day, game.surprises, hourOf(game) + 0.25, game.effects);
      game = setSetpoints(game, Math.round(d.elec / 5) * 5, Math.round(d.heat / 5) * 5, 'elec');
    }
    ({ game, history } = advance(day, game, history));
  }
  return { game, history };
}

export const startOf = (day: DayDef, seed: number, effects: readonly TownEffect[] = [], mods: EventMods = NO_MODS): { game: GameState; history: Sample[] } => {
  const game = newGame(day, seed, effects, mods);
  return { game, history: [sampleOf(game)] };
};

export { START_HOUR };
