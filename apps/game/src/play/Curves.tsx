import { iconUrl } from '../assets';
import { t } from '../i18n';
import { ANNOUNCE_HOURS, END_HOUR, SURPRISE_SPEC, START_HOUR, demandAt, type DayDef, type Surprise } from '@neutron/engine';
import { LOOK_AHEAD_HOURS, type Sample } from './session';

/**
 * Demand of the town (dashed) and production of the plant (solid), one lane per output. Only the next
 * LOOK_AHEAD_HOURS of demand are visible; a surprise shows as a hatched violet band once Cassandra has announced it.
 * Hours are pictograms (morning, noon, evening, night), not numbers.
 */
const VW = 720;
const X0 = 56;
const X1 = 704;
const LANES = {
  elec: { top: 6, h: 124, min: 20, max: 90, line: '#7A5200', fill: '#FFC83D' },
  heat: { top: 146, h: 92, min: 0, max: 40, line: '#9C3D06', fill: '#FF8A3D' },
} as const;
type Lane = keyof typeof LANES;
export const CURVES_VH = 276;

const x = (h: number): number => X0 + ((h - START_HOUR) / (END_HOUR - START_HOUR)) * (X1 - X0);
const y = (lane: Lane, v: number): number => {
  const L = LANES[lane];
  const k = (Math.min(L.max, Math.max(L.min, v)) - L.min) / (L.max - L.min);
  return L.top + L.h - k * (L.h - 12) - 6;
};
const path = (pts: [number, number][]): string => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)} ${b.toFixed(1)}`).join(' ');

export function Curves({ day, surprises, hour, history, current, heatOn }: {
  day: DayDef;
  surprises: readonly Surprise[];
  hour: number;
  history: readonly Sample[];
  current: Sample;
  heatOn: boolean;
}) {
  const until = Math.min(END_HOUR, hour + LOOK_AHEAD_HOURS);
  const demandPts = (lane: Lane): [number, number][] => {
    const out: [number, number][] = [];
    for (let h = START_HOUR; h <= until + 1e-9; h += 0.25) out.push([x(h), y(lane, demandAt(day, surprises, h)[lane])]);
    out.push([x(until), y(lane, demandAt(day, surprises, until)[lane])]);
    return out;
  };
  const prodPts = (lane: Lane): [number, number][] => [...history, current].map((s) => [x(s.h), y(lane, s[lane])]);
  // Surprises already announced by Cassandra, in the lane of the output they change.
  const shown = surprises.filter((x) => hour >= x.start - ANNOUNCE_HOURS);
  const laneOf = (x: Surprise): Lane => (SURPRISE_SPEC[x.kind].elec !== 0 ? 'elec' : 'heat');
  const lanes: Lane[] = heatOn ? ['elec', 'heat'] : ['elec'];
  return (
    <svg className="curves" viewBox={`0 0 ${VW} ${CURVES_VH}`} role="img" aria-label={t('curves.label')}>
      <defs>
        <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#EEF1F7" />
          <rect width="4" height="10" fill="#D5DCEB" />
        </pattern>
        <pattern id="hatch-surprise" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="12" height="12" fill="#7B5CD6" fillOpacity="0.12" />
          <rect width="4" height="12" fill="#7B5CD6" fillOpacity="0.35" />
        </pattern>
        {(['elec', 'heat'] as Lane[]).map((lane) => (
          <clipPath key={lane} id={`clip-${lane}`}>
            <rect x={X0} y={LANES[lane].top} width={X1 - X0} height={LANES[lane].h} rx={14} />
          </clipPath>
        ))}
      </defs>
      {(['elec', 'heat'] as Lane[]).map((lane) => {
        const L = LANES[lane];
        const on = lanes.includes(lane);
        return (
          <g key={lane} opacity={on ? 1 : 0.35}>
            <image href={iconUrl(lane === 'elec' ? 'electricite' : 'chaleur')} x={6} y={L.top + L.h / 2 - 20} width={40} height={40} />
            <rect x={X0} y={L.top} width={X1 - X0} height={L.h} rx={14} fill="#FFFFFF" stroke="#1C2A4A" strokeWidth={2.5} />
            <g clipPath={`url(#clip-${lane})`}>
              <rect x={x(until)} y={L.top} width={X1 - x(until)} height={L.h} fill="url(#hatch)" />
              {shown.filter((sp) => laneOf(sp) === lane).map((sp) => (
                <g key={sp.kind}>
                  <rect x={x(sp.start)} y={L.top} width={x(sp.end) - x(sp.start)} height={L.h} fill="url(#hatch-surprise)" />
                  <image href={iconUrl('surprise')} x={(x(sp.start) + x(sp.end)) / 2 - 14} y={L.top + 4} width={28} height={28} />
                </g>
              ))}
              {on ? (
                <>
                  <path d={path(demandPts(lane))} fill="none" stroke="#1C2A4A" strokeWidth={3.5} strokeDasharray="10 8" strokeLinecap="round" />
                  <path d={path(prodPts(lane))} fill="none" stroke={L.fill} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
                  <path d={path(prodPts(lane))} fill="none" stroke={L.line} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : null}
            </g>
          </g>
        );
      })}
      <line x1={x(hour)} x2={x(hour)} y1={2} y2={LANES.heat.top + LANES.heat.h + 4} stroke="#1D47B8" strokeWidth={3} />
      <path d={`M${x(hour) - 8} 0 H ${x(hour) + 8} L ${x(hour)} 10 Z`} fill="#1D47B8" />
      {([['matin', 6.5], ['midi', 12], ['soir', 18.5], ['nuit', 23]] as const).map(([name, h]) => (
        <image key={name} href={iconUrl(name)} x={x(h) - 16} y={CURVES_VH - 34} width={32} height={32} />
      ))}
    </svg>
  );
}
