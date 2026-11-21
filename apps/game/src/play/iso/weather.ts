/**
 * What the day's events paint over the town (lot L10.4, R2-01): heatwave, cold wave, mild spell, storm, town party, and
 * the lit windows of a demand peak.
 *
 * Kept apart from `town.ts` on purpose: these values change all day long, while the town's pictures are painted into
 * canvases and must only be redrawn when the light really changes (lot L10.3, D-31). So everything here is shown by
 * small layers over the town (gradients, rain, flashes), never by repainting the pictures — except the lit windows
 * (`lit`), which do change a picture and therefore only switch once up and once down.
 *
 * Strengths are rounded to quarters: a layer's opacity then changes about ten times a day instead of every game minute.
 */
import { SURPRISE_SPEC, isActive, surpriseWeight, type Surprise } from '@neutron/engine';

export interface Weather {
  /** Warm red-orange veil and shimmering air (canicule). */
  heat: number;
  /** Blue veil and frost around the screen (vague de froid). */
  cold: number;
  /** Rain, dark sky and lightning (tempête). */
  storm: number;
  /** The sun breaks through and the snow melts (redoux). */
  mild: number;
  /** Fireworks in the sky (fête de la ville). */
  party: number;
  /** Demand peak: every window lights up at once. */
  lit: boolean;
}

export const NO_WEATHER: Weather = { heat: 0, cold: 0, storm: 0, mild: 0, party: 0, lit: false };

/** Seconds between two lightning flashes, and between two fireworks: the sound follows the same beat. */
export const LIGHTNING_SECONDS = 6;
export const FIREWORK_SECONDS = 2.4;
/** Strength above which the windows of a demand peak are all on (switched once up, once down). */
const LIT_FROM = 0.5;

/** Strength of an event now, in quarters (0, 0.25 … 1). */
const step = (s: Surprise, hour: number): number => (isActive(s, hour) ? Math.round(surpriseWeight(s, hour) * 4) / 4 : 0);

export function weatherOf(surprises: readonly Surprise[], hour: number): Weather {
  const w: Weather = { ...NO_WEATHER };
  for (const s of surprises) {
    const k = step(s, hour);
    if (k === 0) continue;
    switch (s.kind) {
      case 'heatwave': w.heat = Math.max(w.heat, k); break;
      case 'coldWave': w.cold = Math.max(w.cold, k); break;
      case 'mildSpell': w.mild = Math.max(w.mild, k); break;
      case 'peak': if (k >= LIT_FROM) w.lit = true; break;
      // The storm calms down as soon as the child has sent help.
      case 'storm': w.storm = Math.max(w.storm, s.fixedAt !== undefined && hour >= s.fixedAt ? Math.min(k, 0.25) : k); break;
      case 'party': w.party = Math.max(w.party, k); break;
      default: break;
    }
  }
  return w;
}

/** True while something is painted over the town (nothing to draw at all on a quiet hour). */
export const hasWeather = (w: Weather): boolean => w.heat > 0 || w.cold > 0 || w.storm > 0 || w.mild > 0 || w.party > 0;

/** The party is only worth fireworks once it is really on (they start with the second quarter). */
export const PARTY_FROM = 0.5;

/** Events that now show something in the town, for the tests and the review address. */
export const WEATHER_KINDS = (['heatwave', 'coldWave', 'mildSpell', 'storm', 'party', 'peak'] as const)
  .filter((k) => SURPRISE_SPEC[k] !== undefined);
