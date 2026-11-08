/**
 * Cassandra's scheduled lines of the mock-up days (ids in content/dialogues/fr.yaml). TEMPORARY: the lines of each day
 * move to content/days/ in lot L2/L5.
 */
import type { Pose } from '../assets';
import type { DayDef } from './fakeDay';

export interface ScriptLine { hour: number; id: string; pose: Pose; needs?: 'heat' | 'surprise' }

const SCRIPT: ScriptLine[] = [
  { hour: 6, id: 'jeu.bonjour', pose: 'accueil' },
  { hour: 6.6, id: 'jeu.curseurs', pose: 'explique' },
  { hour: 8.5, id: 'jeu.chauffage.baisse', pose: 'explique', needs: 'heat' },
  { hour: 16.5, id: 'jeu.soir', pose: 'attention' },
  // The surprise is announced one hour before it starts (hour set from the day).
  { hour: -1, id: 'jeu.surprise.match', pose: 'attention', needs: 'surprise' },
  { hour: 22, id: 'jeu.fin.proche', pose: 'explique' },
];

/** Lines that make sense for this day (no heating talk in summer, no surprise when there is none), in time order. */
export function scriptFor(day: DayDef): ScriptLine[] {
  const heat = day.heat.some(([, v]) => v > 0);
  return SCRIPT.flatMap((l) => {
    if (l.needs === 'heat' && !heat) return [];
    if (l.needs === 'surprise') return day.surprise ? [{ ...l, hour: day.surprise.start - 1 }] : [];
    return [l];
  }).sort((a, b) => a.hour - b.hour);
}
