import { iconUrl } from '../../assets';
import { GROUND, H, INK, W } from './scene';

/** Background, street and everything that moves in the town. Movement is pure CSS (stopped if the device asks). */

export type Season = 'ete' | 'printemps' | 'hiver';
export const seasonOf = (dayId: string): Season => (dayId === 'hiver' ? 'hiver' : dayId === 'printemps' ? 'printemps' : 'ete');

/** Colours of the landscape per season: far hills, near hills, tree leaves (none in winter). */
const LAND: Record<Season, { far: string; near: string; leaf: string; light: string }> = {
  ete: { far: '#A9CFE0', near: '#A7C96A', leaf: '#4E9E48', light: '#6DBB5E' },
  printemps: { far: '#B5D8E8', near: '#8FD082', leaf: '#6CC064', light: '#9BDB8F' },
  hiver: { far: '#D7E4F0', near: '#EEF3FA', leaf: '', light: '' },
};

function Tree({ x, y, r, season }: { x: number; y: number; r: number; season: Season }) {
  const land = LAND[season];
  if (season === 'hiver') {
    // Bare tree: trunk and branches, a little snow on the branches.
    return (
      <g stroke="#6B4A33" strokeLinecap="round" fill="none">
        <path d={`M${x} ${y + r + 10} V ${y - r * 0.6}`} strokeWidth={5} />
        <path d={`M${x} ${y} L ${x - r * 0.8} ${y - r * 0.8} M${x} ${y + 4} L ${x + r * 0.8} ${y - r * 0.6} M${x} ${y - r * 0.4} L ${x - r * 0.4} ${y - r * 1.1} M${x} ${y - r * 0.5} L ${x + r * 0.5} ${y - r * 1.1}`} strokeWidth={2.5} />
        <path d={`M${x - r * 0.8} ${y - r * 0.8} l 6 -1 M${x + r * 0.8} ${y - r * 0.6} l -6 -1`} stroke="#FFFFFF" strokeWidth={3} />
      </g>
    );
  }
  return (
    <g>
      <rect x={x - 3} y={y} width={6} height={r + 10} fill="#7A5236" />
      <circle cx={x} cy={y - 2} r={r} fill={land.leaf} stroke={INK} strokeWidth={2} />
      <circle cx={x - r * 0.4} cy={y - r * 0.3} r={r * 0.45} fill={land.light} />
      {season === 'printemps'
        ? [[-0.5, -0.4], [0.3, -0.6], [0.5, 0.1], [-0.2, 0.3], [0, -0.1]].map(([dx, dy], i) => (
            <circle key={i} cx={x + dx! * r} cy={y - 2 + dy! * r} r={2.6} fill={i % 2 ? '#FFFFFF' : '#FF9FC0'} />
          ))
        : null}
    </g>
  );
}

export function Background({ season }: { season: Season }) {
  const b = GROUND;
  const land = LAND[season];
  const trees = [[300, b - 112, 18], [520, b - 96, 22], [700, b - 92, 16], [1020, b - 118, 20], [1090, b - 112, 15]] as const;
  return (
    <g>
      <path d={`M0 ${b - 96} C 220 ${b - 170} 430 ${b - 140} 640 ${b - 118} S 1050 ${b - 175} ${W} ${b - 110} V ${b} H 0 Z`} fill={land.far} opacity={0.75} />
      <path d={`M0 ${b - 60} C 260 ${b - 118} 520 ${b - 76} 760 ${b - 90} S 1100 ${b - 120} ${W} ${b - 66} V ${b} H 0 Z`} fill={land.near} stroke={INK} strokeWidth={2.5} />
      {season === 'hiver' ? <path d={`M0 ${b - 60} C 260 ${b - 118} 520 ${b - 76} 760 ${b - 90} S 1100 ${b - 120} ${W} ${b - 66}`} stroke="#C9D6E6" strokeWidth={6} fill="none" opacity={0.6} /> : null}
      {trees.map(([x, y, r]) => <Tree key={x} x={x} y={y} r={r} season={season} />)}
    </g>
  );
}

/** Winter: falling snowflakes (stopped if the device asks for less motion). */
export function Snowfall() {
  return (
    <g fill="#FFFFFF" opacity={0.9} pointerEvents="none">
      {Array.from({ length: 34 }, (_, i) => {
        const x = (i * 197) % W;
        const r = 1.6 + ((i * 7) % 3);
        return <circle key={i} className="flake" cx={x} cy={-10} r={r} style={{ animationDelay: `${-((i * 13) % 11)}s`, animationDuration: `${8 + (i % 5)}s` }} />;
      })}
    </g>
  );
}

/** Spring: flower beds at the foot of the buildings. */
export function FlowerBeds({ xs }: { xs: readonly number[] }) {
  return (
    <g>
      {xs.map((x) => (
        <g key={x}>
          <rect x={x - 18} y={GROUND - 9} width={36} height={9} rx={3} fill="#8A5A3B" stroke={INK} strokeWidth={1.5} />
          {[-12, -4, 4, 12].map((dx, i) => (
            <g key={dx}>
              <line x1={x + dx} x2={x + dx} y1={GROUND - 9} y2={GROUND - 16} stroke="#3E8A45" strokeWidth={2} />
              <circle cx={x + dx} cy={GROUND - 18} r={3.5} fill={['#FF6F91', '#FFD84D', '#B18CFF', '#FF9F43'][i]} stroke={INK} strokeWidth={1} />
            </g>
          ))}
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
export function Street({ cycleLane, snowy }: { cycleLane: boolean; snowy: boolean }) {
  const b = GROUND;
  return (
    <g>
      <rect x={0} y={b} width={W} height={24} fill={snowy ? '#F7FAFE' : '#E4E7EF'} stroke={INK} strokeWidth={2.5} />
      {Array.from({ length: 33 }, (_, i) => <line key={i} x1={i * 40} x2={i * 40 - 8} y1={b} y2={b + 20} stroke="#C9CFDC" strokeWidth={1.5} />)}
      <rect x={0} y={b + 20} width={W} height={6} fill="#B6BDCC" stroke={INK} strokeWidth={1.5} />
      <rect x={0} y={b + 26} width={W} height={H - b - 26} fill="#55617C" />
      <rect x={0} y={b + 26} width={W} height={6} fill="#47526B" />
      {snowy ? Array.from({ length: 14 }, (_, i) => <ellipse key={`s${i}`} cx={i * 96 + 30} cy={b + 27} rx={30} ry={4} fill="#FFFFFF" />) : null}
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
export function Person({ x, shirt, trousers, skin, hair, delay, speed = 24, child = false, happy, cold, winter = false }: {
  x: number; shirt: string; trousers: string; skin: number; hair: string; delay: number; speed?: number; child?: boolean; happy: boolean; cold: boolean; winter?: boolean;
}) {
  const wrapped = cold || winter;
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
        {winter ? <path d="M-10 -24 V -41 Q -10 -48 0 -48 Q 10 -48 10 -41 V -20 Z" fill={shirt} stroke={INK} strokeWidth={2} opacity={0.95} /> : null}
        {wrapped ? (
          <g>
            <path d="M-9 -61 Q 0 -74 9 -61 Z" fill="#1D47B8" stroke={INK} strokeWidth={1.5} />
            <circle cx={0} cy={-71} r={3} fill="#FFFFFF" stroke={INK} strokeWidth={1} />
            <rect x={-8} y={-50} width={16} height={6} rx={3} fill="#E0443E" stroke={INK} strokeWidth={1.2} />
            {cold ? <image href={iconUrl('froid')} x={-12} y={-100} width={24} height={24} /> : null}
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
