import { memo } from 'react';
import { iconUrl, shopUrl } from '../assets';
import type { GaugeState } from '../ui/ui';

/**
 * The town, front view in layers (D-03): sky, hills and plant, a row of buildings, the street. Simple shapes for the
 * mock-up; the final drawings come from Figma later. Reacts to the hour and to how well the player follows demand.
 */
export interface CityProps {
  hour: number;
  elecGauge: GaugeState;
  heatGauge: GaugeState | null;
  /** Production below demand (otherwise a gap is a surplus: the town does not suffer from it). */
  elecShort: boolean;
  heatShort: boolean;
  heatOn: boolean;
  upgrades: readonly string[];
}

const W = 1280;
const H = 340;
const GROUND = 252;

type RGB = [number, number, number];
const SKY: [number, RGB, RGB][] = [
  [5, [31, 42, 85], [60, 70, 120]],
  [6.5, [255, 200, 160], [255, 232, 200]],
  [8.5, [150, 205, 250], [205, 235, 255]],
  [16.5, [150, 205, 250], [205, 235, 255]],
  [18.5, [255, 160, 120], [255, 214, 170]],
  [20, [108, 91, 158], [230, 150, 140]],
  [21.5, [31, 42, 85], [60, 70, 120]],
  [24, [22, 30, 66], [45, 55, 105]],
];
const mix = (a: RGB, b: RGB, k: number): string => `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * k)).join(',')})`;
function skyAt(h: number): [string, string] {
  for (let i = 1; i < SKY.length; i++) {
    const [h1, t1, b1] = SKY[i]!;
    const [h0, t0, b0] = SKY[i - 1]!;
    if (h <= h1) {
      const k = (h - h0) / (h1 - h0);
      return [mix(t0, t1, k), mix(b0, b1, k)];
    }
  }
  const last = SKY[SKY.length - 1]!;
  return [mix(last[1], last[1], 0), mix(last[2], last[2], 0)];
}

interface Building { x: number; w: number; h: number; color: string; roof: 'flat' | 'house'; quarter: 1 | 2 }
const BUILDINGS: Building[] = [
  { x: 330, w: 110, h: 120, color: '#F7B267', roof: 'house', quarter: 1 },
  { x: 450, w: 90, h: 170, color: '#8EC5FF', roof: 'flat', quarter: 1 },
  { x: 650, w: 120, h: 140, color: '#FF9AA2', roof: 'flat', quarter: 2 },
  { x: 780, w: 100, h: 110, color: '#B5E48C', roof: 'house', quarter: 2 },
  { x: 890, w: 90, h: 190, color: '#FFD166', roof: 'flat', quarter: 2 },
];
/**
 * Where the shop's upgrades appear (D-03: fixed slots in the street). The right end of the town (x > 1110) stays free
 * for Cassandra. The cycle lane and the street lights are drawn along the street instead of in a slot.
 */
const SLOTS: Record<string, { x: number; y: number; s: number }> = {
  parc: { x: 236, y: GROUND - 92, s: 94 },
  fontaine: { x: 550, y: GROUND - 84, s: 90 },
  ecole: { x: 990, y: GROUND - 110, s: 110 },
};
const LAMPS = [205, 640, 960];

function Windows({ b, lit }: { b: Building; lit: boolean }) {
  const cols = Math.max(2, Math.floor((b.w - 20) / 28));
  const rows = Math.max(2, Math.floor((b.h - 40) / 34));
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = lit && (r * 7 + c * 3 + b.x) % 5 !== 0;
      out.push(
        <rect key={`${r}-${c}`} x={b.x + 14 + c * ((b.w - 28) / cols) + 2} y={GROUND - b.h + 30 + r * 34} width={(b.w - 28) / cols - 8} height={20} rx={4}
          fill={on ? '#FFE27A' : '#5B6C8F'} stroke="#1C2A4A" strokeWidth={2} />,
      );
    }
  }
  return <>{out}</>;
}

function Person({ x, color, delay, happy, cold }: { x: number; color: string; delay: number; happy: boolean; cold: boolean }) {
  return (
    <g className="walker" style={{ animationDelay: `${delay}s` }}>
      <g transform={`translate(${x} ${GROUND + 2})`}>
        <rect x={-9} y={-34} width={18} height={26} rx={9} fill={color} stroke="#1C2A4A" strokeWidth={2.5} />
        <circle cx={0} cy={-44} r={10} fill="#F2C9A0" stroke="#1C2A4A" strokeWidth={2.5} />
        {cold ? <rect x={-10} y={-37} width={20} height={6} rx={3} fill="#E0443E" /> : null}
        <rect x={-7} y={-10} width={5} height={12} rx={2} fill="#1C2A4A" />
        <rect x={2} y={-10} width={5} height={12} rx={2} fill="#1C2A4A" />
        {happy ? <image href={iconUrl('coeur')} x={-11} y={-80} width={22} height={22} className="float" /> : null}
        {cold ? <image href={iconUrl('froid')} x={-13} y={-84} width={26} height={26} /> : null}
      </g>
    </g>
  );
}

export const City = memo(function City(p: CityProps) {
  const [skyTop, skyBottom] = skyAt(p.hour);
  const night = p.hour >= 19 || p.hour < 7;
  const sunT = (p.hour - 6) / 14;
  const sunX = 120 + sunT * 1040;
  const sunY = 210 - Math.sin(Math.PI * Math.min(1, Math.max(0, sunT))) * 170;
  const happy = p.elecGauge === 'bien' && (p.heatGauge === null || p.heatGauge === 'bien');
  const darkQuarter = p.elecShort && p.elecGauge === 'loin';
  const cold = p.heatOn && p.heatShort && p.heatGauge === 'loin';
  return (
    <svg className="city" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" role="img" aria-label="Neutron City">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky)" />
      {p.hour < 20.5 && p.hour >= 6 ? <circle cx={sunX} cy={sunY} r={30} fill="#FFD84D" stroke="#F2A51F" strokeWidth={4} /> : null}
      {night ? <image href={iconUrl('nuit')} x={1080} y={30} width={64} height={64} /> : null}
      {night ? [90, 260, 620, 840, 1200].map((x, i) => <circle key={x} cx={x} cy={40 + (i % 3) * 22} r={3} fill="#FFF6DC" />) : null}
      <path d={`M0 ${GROUND - 70} C 200 ${GROUND - 150} 420 ${GROUND - 120} 640 ${GROUND - 90} S 1050 ${GROUND - 150} ${W} ${GROUND - 80} V ${GROUND} H 0 Z`} fill="#9BD49A" stroke="#1C2A4A" strokeWidth={3} />
      <path d={`M0 ${GROUND - 30} C 260 ${GROUND - 80} 520 ${GROUND - 40} 760 ${GROUND - 50} S 1100 ${GROUND - 70} ${W} ${GROUND - 30} V ${GROUND} H 0 Z`} fill="#78C474" stroke="#1C2A4A" strokeWidth={3} />

      {/* The plant: round building, cooling chimney with its water vapour. */}
      <g>
        <rect x={150} y={GROUND - 150} width={34} height={150} rx={8} fill="#FFFFFF" stroke="#1C2A4A" strokeWidth={3} />
        <g className="steam">
          <circle cx={167} cy={GROUND - 165} r={14} fill="#FFFFFF" opacity={0.9} />
          <circle cx={180} cy={GROUND - 190} r={18} fill="#FFFFFF" opacity={0.75} />
          <circle cx={160} cy={GROUND - 215} r={20} fill="#FFFFFF" opacity={0.55} />
        </g>
        <path d={`M40 ${GROUND} V ${GROUND - 60} A 55 55 0 0 1 150 ${GROUND - 60} V ${GROUND} Z`} fill="#E3ECFF" stroke="#1C2A4A" strokeWidth={3} />
        <circle cx={95} cy={GROUND - 60} r={16} fill="#FFC83D" stroke="#1C2A4A" strokeWidth={3} />
        <rect x={80} y={GROUND - 30} width={30} height={30} rx={4} fill="#1D47B8" stroke="#1C2A4A" strokeWidth={3} />
      </g>

      {/* Buildings; houses smoke when the heating is on. */}
      {BUILDINGS.map((b) => (
        <g key={b.x}>
          {b.roof === 'house' && p.heatOn ? (
            <g className="steam slow">
              <circle cx={b.x + b.w - 22} cy={GROUND - b.h - 48} r={10} fill="#EEF1F7" opacity={cold ? 0.3 : 0.9} />
              <circle cx={b.x + b.w - 14} cy={GROUND - b.h - 66} r={13} fill="#EEF1F7" opacity={cold ? 0.2 : 0.7} />
            </g>
          ) : null}
          {b.roof === 'house' ? (
            <>
              <rect x={b.x + b.w - 30} y={GROUND - b.h - 38} width={16} height={30} fill="#A9744F" stroke="#1C2A4A" strokeWidth={3} />
              <path d={`M${b.x - 8} ${GROUND - b.h + 4} L ${b.x + b.w / 2} ${GROUND - b.h - 40} L ${b.x + b.w + 8} ${GROUND - b.h + 4} Z`} fill="#E0443E" stroke="#1C2A4A" strokeWidth={3} strokeLinejoin="round" />
            </>
          ) : null}
          <rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} rx={b.roof === 'flat' ? 10 : 2} fill={b.color} stroke="#1C2A4A" strokeWidth={3} />
          <Windows b={b} lit={night && !(darkQuarter && b.quarter === 2)} />
          <rect x={b.x + b.w / 2 - 12} y={GROUND - 36} width={24} height={36} rx={4} fill="#1D47B8" stroke="#1C2A4A" strokeWidth={3} />
        </g>
      ))}

      {darkQuarter ? (
        <g className="pop">
          <image href={iconUrl('electricite')} x={760} y={20} width={56} height={56} />
          <image href={iconUrl('loin')} x={796} y={52} width={32} height={32} />
        </g>
      ) : null}

      {Object.entries(SLOTS).map(([id, s]) =>
        p.upgrades.includes(id) ? <image key={id} href={shopUrl(id)} x={s.x} y={s.y} width={s.s} height={s.s} className="pop" /> : null,
      )}

      {/* Street. */}
      <rect x={0} y={GROUND} width={W} height={22} fill="#E7EAF2" stroke="#1C2A4A" strokeWidth={3} />
      <rect x={0} y={GROUND + 22} width={W} height={H - GROUND - 22} fill="#5E6B88" />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 84 + 20} y={GROUND + 52} width={44} height={6} rx={3} fill="#FFFFFF" />)}
      {p.upgrades.includes('piste') ? (
        <g className="pop">
          <rect x={0} y={GROUND + 4} width={W} height={14} fill="#2E9E5B" />
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 130 + 40} y={GROUND + 9} width={40} height={4} rx={2} fill="#FFFFFF" />)}
        </g>
      ) : null}
      {p.upgrades.includes('eclairage')
        ? LAMPS.map((x) => <image key={x} href={shopUrl('eclairage')} x={x - 30} y={GROUND - 68} width={70} height={70} className="pop" />)
        : null}

      <Person x={300} color="#7B5CD6" delay={0} happy={happy} cold={cold} />
      <Person x={620} color="#2E9E5B" delay={-6} happy={happy} cold={cold} />
      <Person x={860} color="#FF8A3D" delay={-12} happy={false} cold={cold} />

      <g className="car">
        <rect x={0} y={GROUND + 28} width={96} height={30} rx={12} fill="#E0443E" stroke="#1C2A4A" strokeWidth={3} />
        <rect x={18} y={GROUND + 12} width={52} height={22} rx={8} fill="#BFE3FF" stroke="#1C2A4A" strokeWidth={3} />
        <circle cx={22} cy={GROUND + 60} r={10} fill="#1C2A4A" />
        <circle cx={74} cy={GROUND + 60} r={10} fill="#1C2A4A" />
        {night ? <rect x={92} y={GROUND + 34} width={10} height={8} rx={3} fill="#FFE27A" /> : null}
      </g>
      <g className="bike">
        <circle cx={0} cy={GROUND + 56} r={12} fill="none" stroke="#1C2A4A" strokeWidth={3} />
        <circle cx={40} cy={GROUND + 56} r={12} fill="none" stroke="#1C2A4A" strokeWidth={3} />
        <path d={`M0 ${GROUND + 56} L 16 ${GROUND + 38} H 32 L 40 ${GROUND + 56} M16 ${GROUND + 38} L 22 ${GROUND + 56} L 32 ${GROUND + 38}`} stroke="#1C2A4A" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <rect x={12} y={GROUND + 6} width={16} height={24} rx={8} fill="#2E9E5B" stroke="#1C2A4A" strokeWidth={2.5} />
        <circle cx={20} cy={GROUND - 2} r={9} fill="#F2C9A0" stroke="#1C2A4A" strokeWidth={2.5} />
      </g>
    </svg>
  );
});
