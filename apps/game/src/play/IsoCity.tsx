import { memo, useMemo, useRef, type CSSProperties } from 'react';
import type { Mood } from '@neutron/engine';
import { iconUrl } from '../assets';
import { BAND_VIEWBOX, FULL_VIEWBOX, drawTown, nightAt, seasonOf } from './iso/town';

/**
 * The town in isometric view (style B, D-13). `band`: the slice shown in the play screen (river, plant, then the
 * streets); `full`: the whole town, in the shop and the summary. The drawing is rebuilt only when what it shows
 * changes (the hour is passed rounded to 5 game minutes).
 */
export interface IsoCityProps {
  view: 'band' | 'full';
  hour: number;
  /** Day id (ete, printemps, hiver). */
  season: string;
  mood: Mood;
  elecOn: boolean;
  heatOn: boolean;
  upgrades: readonly string[];
  /** Upgrade just bought, shown with an "appear" animation. */
  fresh?: string | null;
}

const ICONS = { coeur: iconUrl('coeur'), froid: iconUrl('froid'), electricite: iconUrl('electricite'), loin: iconUrl('loin') };

/** Sky behind the town: day blue, dawn and dusk orange, night navy. */
function skyOf(hour: number): [string, string] {
  const n = nightAt(hour);
  const dusk = (hour > 17 && hour < 21) || (hour > 5 && hour < 8);
  if (n > 0.7) return ['#141C44', '#2C3570'];
  if (dusk) return ['#F0A07C', '#FFE0B8'];
  return ['#8CC8F5', '#DCEFFF'];
}

export const IsoCity = memo(function IsoCity(p: IsoCityProps) {
  const upgradesKey = p.upgrades.join(',');
  const inner = useMemo(
    () => drawTown({ hour: p.hour, season: seasonOf(p.season), mood: p.mood, elecOn: p.elecOn, heatOn: p.heatOn, upgrades: upgradesKey ? upgradesKey.split(',') : [], fresh: p.fresh ?? null, icons: ICONS }, p.view),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p.hour, p.season, p.mood, p.elecOn, p.heatOn, upgradesKey, p.fresh, p.view],
  );
  // The phase changes only when the drawing really changes (new elements): then their animations go on where the old
  // ones were. When the drawing is the same, React keeps the elements, and the phase must not move (R1-02).
  const drawn = useRef({ inner: '', phase: '0' });
  if (drawn.current.inner !== inner) drawn.current = { inner, phase: (performance.now() / 1000).toFixed(2) };
  const { phase } = drawn.current;
  const [top, bottom] = skyOf(p.hour);
  return (
    <svg className={`city iso-${p.view}`} viewBox={p.view === 'band' ? BAND_VIEWBOX : FULL_VIEWBOX} preserveAspectRatio={p.view === 'band' ? 'xMidYMid slice' : 'xMidYMid meet'} role="img" aria-label="Neutron City">
      <defs>
        <linearGradient id={`iso-sky-${p.view}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x="-2000" y="-2000" width="6000" height="6000" fill={`url(#iso-sky-${p.view})`} />
      <g style={{ '--phase': `${phase}s` } as CSSProperties} dangerouslySetInnerHTML={{ __html: inner }} />
    </svg>
  );
});
