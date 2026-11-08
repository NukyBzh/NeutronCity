import { GROUND, INK } from './scene';

/**
 * The imaginary plant, on the left of the town: cooling tower with its water-vapour plume, round reactor building,
 * turbine hall, fence, and the two links to the town that the player feeds: the power line (electricity) and the
 * insulated heating pipe (heat). Small dashes run along each link while it carries something.
 */
export function PlantDefs() {
  return (
    <>
      <linearGradient id="nc-concrete" x1="0" x2="1">
        <stop offset="0" stopColor="#F4F6FA" />
        <stop offset="0.55" stopColor="#DCE2EC" />
        <stop offset="1" stopColor="#A9B4C8" />
      </linearGradient>
      <linearGradient id="nc-reactor" x1="0" x2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.5" stopColor="#E6ECF5" />
        <stop offset="1" stopColor="#AEB9CD" />
      </linearGradient>
      <linearGradient id="nc-hall" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#8EA7D8" />
        <stop offset="1" stopColor="#5E78B0" />
      </linearGradient>
      <linearGradient id="nc-pipe" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#FFB27A" />
        <stop offset="0.5" stopColor="#FF8A3D" />
        <stop offset="1" stopColor="#C8601F" />
      </linearGradient>
    </>
  );
}

/** Pylon of the power line, drawn as a lattice tower. */
function Pylon({ x }: { x: number }) {
  const b = GROUND;
  return (
    <g stroke="#4A5878" strokeWidth={2.5} fill="none" strokeLinejoin="round">
      <path d={`M${x - 16} ${b} L ${x - 5} ${b - 120} M${x + 16} ${b} L ${x + 5} ${b - 120}`} />
      <path d={`M${x - 14} ${b - 10} L ${x + 12} ${b - 40} M${x + 14} ${b - 10} L ${x - 12} ${b - 40} M${x - 11} ${b - 40} L ${x + 9} ${b - 75} M${x + 11} ${b - 40} L ${x - 9} ${b - 75} M${x - 8} ${b - 75} L ${x + 6} ${b - 110} M${x + 8} ${b - 75} L ${x - 6} ${b - 110}`} strokeWidth={1.5} />
      <path d={`M${x - 26} ${b - 112} H ${x + 26} M${x - 20} ${b - 96} H ${x + 20}`} strokeWidth={3} />
    </g>
  );
}

export function Plant({ elecOn }: { elecOn: boolean }) {
  const b = GROUND;
  return (
    <g>
      {/* Cooling tower and plume. */}
      <g className="plume">
        <ellipse cx={78} cy={b - 172} rx={30} ry={16} fill="#FFFFFF" opacity={0.95} />
        <ellipse cx={96} cy={b - 196} rx={38} ry={20} fill="#FFFFFF" opacity={0.8} />
        <ellipse cx={120} cy={b - 222} rx={44} ry={22} fill="#FFFFFF" opacity={0.6} />
        <ellipse cx={150} cy={b - 244} rx={46} ry={20} fill="#FFFFFF" opacity={0.4} />
      </g>
      <path d={`M24 ${b} C 46 ${b - 60} 50 ${b - 112} 46 ${b - 160} H 112 C 108 ${b - 112} 112 ${b - 60} 134 ${b} Z`} fill="url(#nc-concrete)" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={79} cy={b - 160} rx={33} ry={6} fill="#C3CCDB" stroke={INK} strokeWidth={2.5} />
      <path d={`M36 ${b - 30} C 60 ${b - 26} 98 ${b - 26} 122 ${b - 30}`} stroke="#9AA6BC" strokeWidth={2} fill="none" />
      <path d={`M24 ${b} H 134 L 130 ${b - 10} H 28 Z`} fill="#8D99B0" stroke={INK} strokeWidth={2} />

      {/* Turbine hall (behind) and reactor building (front). */}
      <rect x={196} y={b - 70} width={104} height={70} fill="url(#nc-hall)" stroke={INK} strokeWidth={3} />
      <path d={`M192 ${b - 70} L 248 ${b - 84} L 304 ${b - 70} Z`} fill="#4E66A0" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={212 + i * 15} x2={212 + i * 15} y1={b - 64} y2={b - 4} stroke="#4E66A0" strokeWidth={2} />)}
      <rect x={204} y={b - 56} width={88} height={12} rx={3} fill="#BFE3FF" stroke={INK} strokeWidth={2} />
      <rect x={272} y={b - 28} width={20} height={28} rx={2} fill="#3B4A6B" stroke={INK} strokeWidth={2} />

      <path d={`M140 ${b} V ${b - 86} A 40 40 0 0 1 220 ${b - 86} V ${b} Z`} fill="url(#nc-reactor)" stroke={INK} strokeWidth={3} />
      <path d={`M140 ${b - 86} H 220`} stroke="#AEB9CD" strokeWidth={2} />
      <path d={`M140 ${b - 50} H 220`} stroke="#C7D0DE" strokeWidth={2} />
      <circle cx={180} cy={b - 104} r={9} fill="#FFC83D" stroke={INK} strokeWidth={2.5} />
      <rect x={168} y={b - 30} width={24} height={30} rx={3} fill="#1D47B8" stroke={INK} strokeWidth={2.5} />

      {/* Fence. */}
      <path d={`M14 ${b - 14} H 310`} stroke="#6B7896" strokeWidth={2} />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={14 + i * 24} x2={14 + i * 24} y1={b - 20} y2={b} stroke="#6B7896" strokeWidth={2} />)}

      {/* Power line: hall → pylon → into town. */}
      <Pylon x={330} />
      <path d={`M296 ${b - 78} Q 312 ${b - 92} 304 ${b - 112} M296 ${b - 78} Q 318 ${b - 84} 350 ${b - 96}`} stroke={INK} strokeWidth={1.5} fill="none" />
      <path d={`M356 ${b - 112} Q 420 ${b - 92} 470 ${b - 104} M350 ${b - 96} Q 410 ${b - 78} 470 ${b - 88}`} stroke={INK} strokeWidth={1.5} fill="none" />
      {elecOn ? <path className="flow" d={`M304 ${b - 112} L 356 ${b - 112} Q 420 ${b - 92} 470 ${b - 104}`} stroke="#FFC83D" strokeWidth={3} strokeDasharray="4 14" fill="none" strokeLinecap="round" /> : null}
    </g>
  );
}

/** Insulated heating pipe from the turbine hall, along the pavement, to the houses (drawn over the pavement). */
export function HeatPipe({ heatOn }: { heatOn: boolean }) {
  const y = GROUND + 4;
  return (
    <g>
      <path d={`M236 ${GROUND - 6} V ${y + 4}`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <path d={`M236 ${GROUND - 6} V ${y + 4}`} stroke="url(#nc-pipe)" strokeWidth={8} strokeLinecap="round" />
      <rect x={230} y={y} width={880} height={9} rx={4.5} fill="url(#nc-pipe)" stroke={INK} strokeWidth={2} />
      {heatOn ? <line className="flow" x1={236} x2={1104} y1={y + 4.5} y2={y + 4.5} stroke="#FFE7CC" strokeWidth={2.5} strokeDasharray="6 16" strokeLinecap="round" /> : null}
    </g>
  );
}
