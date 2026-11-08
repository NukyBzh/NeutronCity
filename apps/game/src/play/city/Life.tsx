import { iconUrl } from '../../assets';
import { GROUND, H, INK, W } from './scene';

/** Background, street and everything that moves in the town. Movement is pure CSS (stopped if the device asks). */

export function Background() {
  const b = GROUND;
  const trees = [[300, b - 112, 18], [520, b - 96, 22], [700, b - 92, 16], [1020, b - 118, 20], [1090, b - 112, 15]] as const;
  return (
    <g>
      <path d={`M0 ${b - 96} C 220 ${b - 170} 430 ${b - 140} 640 ${b - 118} S 1050 ${b - 175} ${W} ${b - 110} V ${b} H 0 Z`} fill="#A9CFE0" opacity={0.7} />
      <path d={`M0 ${b - 60} C 260 ${b - 118} 520 ${b - 76} 760 ${b - 90} S 1100 ${b - 120} ${W} ${b - 66} V ${b} H 0 Z`} fill="#8FCB86" stroke={INK} strokeWidth={2.5} />
      {trees.map(([x, y, r]) => (
        <g key={x}>
          <rect x={x - 3} y={y} width={6} height={r + 10} fill="#7A5236" />
          <circle cx={x} cy={y - 2} r={r} fill="#5DAE5A" stroke={INK} strokeWidth={2} />
          <circle cx={x - r * 0.4} cy={y - r * 0.3} r={r * 0.45} fill="#7CC678" />
        </g>
      ))}
    </g>
  );
}

export function Clouds() {
  return (
    <g fill="#FFFFFF" opacity={0.9}>
      {[[220, 48, 1], [640, 30, 1.3], [1000, 62, 0.9]].map(([x, y, s], i) => (
        <g key={i} className="cloud" style={{ animationDelay: `${-i * 25}s` }}>
          <g transform={`translate(${x} ${y}) scale(${s})`}>
            <ellipse cx={0} cy={0} rx={34} ry={14} />
            <ellipse cx={-20} cy={-6} rx={18} ry={12} />
            <ellipse cx={14} cy={-12} rx={22} ry={16} />
          </g>
        </g>
      ))}
    </g>
  );
}

/** Pavement with paving joints and kerb, then the road with its markings. */
export function Street({ cycleLane }: { cycleLane: boolean }) {
  const b = GROUND;
  return (
    <g>
      <rect x={0} y={b} width={W} height={24} fill="#E4E7EF" stroke={INK} strokeWidth={2.5} />
      {Array.from({ length: 33 }, (_, i) => <line key={i} x1={i * 40} x2={i * 40 - 8} y1={b} y2={b + 20} stroke="#C9CFDC" strokeWidth={1.5} />)}
      <rect x={0} y={b + 20} width={W} height={6} fill="#B6BDCC" stroke={INK} strokeWidth={1.5} />
      <rect x={0} y={b + 26} width={W} height={H - b - 26} fill="#55617C" />
      <rect x={0} y={b + 26} width={W} height={6} fill="#47526B" />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 84 + 20} y={b + 56} width={44} height={5} rx={2.5} fill="#F4F6FA" />)}
      {cycleLane ? (
        <g className="pop">
          <rect x={0} y={b + 32} width={W} height={14} fill="#2E9E5B" opacity={0.95} />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i} transform={`translate(${i * 220 + 90} ${b + 39})`} stroke="#FFFFFF" strokeWidth={1.6} fill="none">
              <circle cx={-7} cy={2} r={4} />
              <circle cx={7} cy={2} r={4} />
              <path d="M-7 2 L -2 -4 H 4 L 7 2 M-2 -4 L 0 2 L 4 -4" />
            </g>
          ))}
        </g>
      ) : null}
    </g>
  );
}

const SKIN = ['#F2C9A0', '#C68A5E', '#8D5A3B', '#F5D5B8'];

/** A walking inhabitant (legs and arms swing). Cold: hat, scarf and a snowflake; happy: a heart. */
export function Person({ x, shirt, trousers, skin, hair, delay, speed = 24, child = false, happy, cold }: {
  x: number; shirt: string; trousers: string; skin: number; hair: string; delay: number; speed?: number; child?: boolean; happy: boolean; cold: boolean;
}) {
  const s = child ? 0.78 : 1;
  return (
    <g className="walker" style={{ animationDelay: `${delay}s`, animationDuration: `${speed}s` }}>
      <g transform={`translate(${x} ${GROUND + 18}) scale(${s})`}>
        <ellipse cx={0} cy={0} rx={11} ry={2.5} fill="#1C2A4A" opacity={0.18} />
        <g className="leg">
          <rect x={-5} y={-24} width={6} height={24} rx={3} fill={trousers} stroke={INK} strokeWidth={1.5} />
          <rect x={-6} y={-3} width={9} height={4} rx={2} fill={INK} />
        </g>
        <g className="leg leg-b">
          <rect x={0} y={-24} width={6} height={24} rx={3} fill={trousers} stroke={INK} strokeWidth={1.5} />
          <rect x={-1} y={-3} width={9} height={4} rx={2} fill={INK} />
        </g>
        <g className="arm"><rect x={-10} y={-44} width={5} height={18} rx={2.5} fill={shirt} stroke={INK} strokeWidth={1.5} /></g>
        <path d="M-9 -24 V -40 Q -9 -47 0 -47 Q 9 -47 9 -40 V -24 Z" fill={shirt} stroke={INK} strokeWidth={2} />
        <g className="arm arm-b"><rect x={5} y={-44} width={5} height={18} rx={2.5} fill={shirt} stroke={INK} strokeWidth={1.5} /></g>
        <rect x={-2.5} y={-51} width={5} height={5} fill={SKIN[skin]} />
        <circle cx={0} cy={-58} r={9} fill={SKIN[skin]} stroke={INK} strokeWidth={2} />
        <path d="M-9 -59 Q -9 -69 0 -68 Q 9 -69 9 -59 Q 4 -63 -1 -62 Q -6 -63 -9 -59 Z" fill={hair} />
        <circle cx={3.5} cy={-58} r={1.2} fill={INK} />
        <path d="M2 -53.5 Q 4.5 -52 6.5 -54" stroke={INK} strokeWidth={1.2} fill="none" />
        {cold ? (
          <g>
            <path d="M-9 -61 Q 0 -74 9 -61 Z" fill="#1D47B8" stroke={INK} strokeWidth={1.5} />
            <circle cx={0} cy={-71} r={3} fill="#FFFFFF" stroke={INK} strokeWidth={1} />
            <rect x={-8} y={-50} width={16} height={6} rx={3} fill="#E0443E" stroke={INK} strokeWidth={1.2} />
            <image href={iconUrl('froid')} x={-12} y={-100} width={24} height={24} />
          </g>
        ) : null}
        {happy && !cold ? <image href={iconUrl('coeur')} x={-10} y={-96} width={20} height={20} className="float" /> : null}
      </g>
    </g>
  );
}

export function Car({ night }: { night: number }) {
  const y = GROUND + 30;
  return (
    <g className="car">
      <ellipse cx={50} cy={y + 34} rx={50} ry={4} fill="#000000" opacity={0.25} />
      <path d={`M2 ${y + 26} V ${y + 14} Q 2 ${y + 8} 10 ${y + 7} L 24 ${y + 5} L 36 ${y - 8} Q 40 ${y - 12} 48 ${y - 12} H 70 Q 78 ${y - 12} 82 ${y - 6} L 90 ${y + 5} Q 100 ${y + 7} 100 ${y + 16} V ${y + 26} Z`} fill="#D93B36" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={`M38 ${y + 4} L 46 ${y - 7} H 58 V ${y + 4} Z M62 ${y + 4} V ${y - 7} H 72 Q 76 ${y - 7} 79 ${y - 3} L 84 ${y + 4} Z`} fill="url(#nc-glass)" stroke={INK} strokeWidth={1.8} />
      <path d={`M6 ${y + 14} H 98`} stroke="#A82B26" strokeWidth={2} />
      {[24, 78].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={y + 26} r={10} fill="#2A3350" stroke={INK} strokeWidth={2} />
          <circle cx={cx} cy={y + 26} r={4.5} fill="#C3CCDB" />
        </g>
      ))}
      <rect x={94} y={y + 9} width={7} height={6} rx={2} fill="#FFE27A" stroke={INK} strokeWidth={1.2} />
      {night > 0.4 ? <path d={`M101 ${y + 12} L 170 ${y + 2} L 170 ${y + 26} Z`} fill="#FFE9A8" opacity={0.35} /> : null}
      <rect x={1} y={y + 10} width={5} height={6} rx={2} fill="#E0443E" />
    </g>
  );
}

export function Bike() {
  const y = GROUND + 52;
  return (
    <g className="bike">
      <g transform={`translate(0 ${y}) scale(-1 1)`}>
        <circle cx={-18} cy={0} r={11} fill="none" stroke={INK} strokeWidth={2.5} />
        <circle cx={18} cy={0} r={11} fill="none" stroke={INK} strokeWidth={2.5} />
        <path d="M-18 0 L -6 -16 H 10 L 18 0 M-6 -16 L 0 0 L 10 -16 M8 -20 H 14" stroke="#1D8BE0" strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <rect x={-10} y={-40} width={13} height={20} rx={6} fill="#2E9E5B" stroke={INK} strokeWidth={2} />
        <path d="M-2 -22 L 2 -8 L -2 0" stroke="#3B4A6B" strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={-3} cy={-47} r={7} fill={SKIN[1]} stroke={INK} strokeWidth={2} />
        <path d="M-11 -48 Q -3 -60 6 -48 Z" fill="#FFC83D" stroke={INK} strokeWidth={1.5} />
        <path d="M2 -34 L 12 -22" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Smoke of a chimney when the heating is on (fainter when the heat is missing). */
export function Smoke({ x, y, weak }: { x: number; y: number; weak: boolean }) {
  return (
    <g className="steam slow" opacity={weak ? 0.3 : 0.9}>
      <circle cx={x} cy={y - 8} r={7} fill="#EEF1F7" />
      <circle cx={x + 7} cy={y - 22} r={10} fill="#EEF1F7" opacity={0.8} />
      <circle cx={x + 2} cy={y - 38} r={12} fill="#EEF1F7" opacity={0.55} />
    </g>
  );
}
