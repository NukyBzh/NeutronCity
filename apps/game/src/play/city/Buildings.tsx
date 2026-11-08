import { GROUND, INK } from './scene';

/**
 * The row of buildings: houses with tiled roofs and chimneys, a brick block of flats with balconies, a bakery with its
 * awning, a modern tower. Windows are drawn twice: the frames and dark glass here, and the lit panes in `LitWindows`,
 * above the night shade, so they glow in the dark.
 */
type Kind = 'house' | 'flats' | 'shop' | 'tower';
export interface Building {
  id: string;
  kind: Kind;
  x: number;
  w: number;
  h: number;
  wall: string;
  roof?: string;
  floors: number;
  cols: number;
  /** Quarter of the town (a quarter goes dark when electricity is missing). */
  quarter: 1 | 2;
}

export const BUILDINGS: Building[] = [
  { id: 'A', kind: 'house', x: 344, w: 112, h: 118, wall: '#F6C58F', roof: '#C8553D', floors: 2, cols: 2, quarter: 1 },
  { id: 'B', kind: 'flats', x: 566, w: 100, h: 188, wall: 'url(#nc-brick)', floors: 5, cols: 2, quarter: 1 },
  { id: 'C', kind: 'shop', x: 768, w: 128, h: 148, wall: '#F3E3C3', floors: 3, cols: 3, quarter: 2 },
  { id: 'D', kind: 'house', x: 904, w: 100, h: 112, wall: '#BFD8EE', roof: '#5E6F8F', floors: 2, cols: 2, quarter: 2 },
  { id: 'E', kind: 'tower', x: 1124, w: 150, h: 206, wall: '#A9BCD0', floors: 6, cols: 4, quarter: 2 },
];

export interface Win { b: Building; x: number; y: number; w: number; h: number; lit: boolean }

/** Window grid of a building (the shop's ground floor is its shop window, so it has no window there). */
export function windowsOf(b: Building): Win[] {
  const out: Win[] = [];
  const top = GROUND - b.h + (b.kind === 'house' ? 18 : 16);
  const groundH = b.kind === 'shop' ? 48 : 38;
  const usable = b.h - (top - (GROUND - b.h)) - groundH;
  const rows = b.floors - 1;
  const rowH = usable / rows;
  const colW = (b.w - 20) / b.cols;
  const ww = Math.min(26, colW - 10);
  const wh = Math.min(28, rowH - 12);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < b.cols; c++) {
      const x = b.x + 10 + c * colW + (colW - ww) / 2;
      const y = top + r * rowH + (rowH - wh) / 2;
      out.push({ b, x, y, w: ww, h: wh, lit: (r * 7 + c * 3 + b.x) % 5 !== 0 });
    }
  }
  return out;
}

export function BuildingDefs() {
  return (
    <>
      <pattern id="nc-brick" width="24" height="12" patternUnits="userSpaceOnUse">
        <rect width="24" height="12" fill="#B95E46" />
        <path d="M0 0.5 H24 M0 6.5 H24 M12 0.5 V6.5 M0 6.5 V12 M24 6.5 V12" stroke="#94432F" strokeWidth="1.2" />
      </pattern>
      {BUILDINGS.filter((b) => b.roof).map((b) => (
        <pattern key={b.id} id={`nc-tiles-${b.id}`} width="16" height="10" patternUnits="userSpaceOnUse">
          <rect width="16" height="10" fill={b.roof} />
          <path d="M0 10 Q 4 4 8 10 Q 12 4 16 10" fill="none" stroke="#1C2A4A" strokeOpacity="0.25" strokeWidth="1.5" />
        </pattern>
      ))}
      <linearGradient id="nc-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#DDF0FF" />
        <stop offset="0.45" stopColor="#9FCBEF" />
        <stop offset="1" stopColor="#6F9CC9" />
      </linearGradient>
      <linearGradient id="nc-awning" x1="0" x2="1">
        {Array.from({ length: 8 }, (_, i) => [
          <stop key={`a${i}`} offset={i / 8} stopColor={i % 2 ? '#FFFFFF' : '#E0443E'} />,
          <stop key={`b${i}`} offset={(i + 1) / 8} stopColor={i % 2 ? '#FFFFFF' : '#E0443E'} />,
        ])}
      </linearGradient>
      <filter id="nc-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </>
  );
}

function Window({ w, night }: { w: Win; night: number }) {
  return (
    <g>
      <rect x={w.x - 3} y={w.y - 3} width={w.w + 6} height={w.h + 6} rx={2} fill="#FFFFFF" stroke={INK} strokeWidth={1.8} />
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill={night > 0.6 ? '#2E3B5E' : 'url(#nc-glass)'} />
      {night <= 0.6 ? <path d={`M${w.x + 3} ${w.y + w.h - 4} L ${w.x + w.w - 6} ${w.y + 3}`} stroke="#FFFFFF" strokeWidth={2} opacity={0.7} /> : null}
      <line x1={w.x + w.w / 2} x2={w.x + w.w / 2} y1={w.y} y2={w.y + w.h} stroke="#FFFFFF" strokeWidth={1.5} />
      <rect x={w.x - 5} y={w.y + w.h + 2} width={w.w + 10} height={4} rx={1} fill="#D5DCEB" stroke={INK} strokeWidth={1.2} />
    </g>
  );
}

function Roof({ b }: { b: Building }) {
  const top = GROUND - b.h;
  if (b.kind === 'house') {
    return (
      <g>
        <rect x={b.x + b.w - 32} y={top - 46} width={18} height={36} fill="url(#nc-brick)" stroke={INK} strokeWidth={2.5} />
        <rect x={b.x + b.w - 35} y={top - 50} width={24} height={7} fill="#7D3A2A" stroke={INK} strokeWidth={2} />
        <path d={`M${b.x - 10} ${top + 4} L ${b.x + b.w / 2} ${top - 42} L ${b.x + b.w + 10} ${top + 4} Z`} fill={`url(#nc-tiles-${b.id})`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={b.x + b.w / 2} cy={top - 16} r={7} fill="#FFF6DC" stroke={INK} strokeWidth={2} />
      </g>
    );
  }
  if (b.kind === 'tower') {
    return (
      <g>
        <rect x={b.x + 20} y={top - 18} width={44} height={18} rx={2} fill="#8796AE" stroke={INK} strokeWidth={2.5} />
        <line x1={b.x + b.w - 30} x2={b.x + b.w - 30} y1={top} y2={top - 40} stroke={INK} strokeWidth={2.5} />
        <circle cx={b.x + b.w - 30} cy={top - 42} r={3} fill="#E0443E" />
      </g>
    );
  }
  return <rect x={b.x - 4} y={top - 8} width={b.w + 8} height={10} rx={2} fill="#D5DCEB" stroke={INK} strokeWidth={2.5} />;
}

function Front({ b, night }: { b: Building; night: number }) {
  const top = GROUND - b.h;
  const wins = windowsOf(b);
  return (
    <g>
      <Roof b={b} />
      <rect x={b.x} y={top} width={b.w} height={b.h} fill={b.wall} stroke={INK} strokeWidth={3} />
      {/* Shade on the right side gives some depth. */}
      <rect x={b.x + b.w - 10} y={top + 1.5} width={8.5} height={b.h - 3} fill="#1C2A4A" opacity={0.15} />
      <rect x={b.x} y={GROUND - 12} width={b.w} height={12} fill="#8D99B0" stroke={INK} strokeWidth={2} />
      {b.kind === 'flats' ? wins.filter((w) => w.x > b.x + b.w / 2).map((w, i) => (
        <g key={`bal${i}`}>
          <rect x={w.x - 8} y={w.y + w.h - 4} width={w.w + 16} height={12} fill="none" stroke={INK} strokeWidth={2} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={w.x - 8 + k * ((w.w + 16) / 3)} x2={w.x - 8 + k * ((w.w + 16) / 3)} y1={w.y + w.h - 4} y2={w.y + w.h + 8} stroke={INK} strokeWidth={1.5} />)}
        </g>
      )) : null}
      {wins.map((w, i) => <Window key={i} w={w} night={night} />)}
      {b.kind === 'shop' ? (
        <g>
          <rect x={b.x + 10} y={GROUND - 44} width={b.w - 52} height={32} fill="url(#nc-glass)" stroke={INK} strokeWidth={2.5} />
          <path d={`M${b.x + 14} ${GROUND - 20} q 6 -10 12 0 q 6 -10 12 0 q 6 -10 12 0`} fill="#E9B872" stroke={INK} strokeWidth={1.5} />
          <path d={`M${b.x + 4} ${GROUND - 62} H ${b.x + b.w - 4} L ${b.x + b.w + 4} ${GROUND - 46} H ${b.x - 4} Z`} fill="url(#nc-awning)" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          <rect x={b.x + b.w - 36} y={GROUND - 44} width={24} height={32} rx={2} fill="url(#nc-glass)" stroke={INK} strokeWidth={2.5} />
        </g>
      ) : (
        <g>
          <rect x={b.x + b.w / 2 - 13} y={GROUND - 46} width={26} height={34} rx={3} fill={b.kind === 'tower' ? 'url(#nc-glass)' : '#8A4F2D'} stroke={INK} strokeWidth={2.5} />
          <circle cx={b.x + b.w / 2 + 7} cy={GROUND - 28} r={1.8} fill="#FFD84D" />
          <rect x={b.x + b.w / 2 - 17} y={GROUND - 13} width={34} height={5} fill="#C3CCDB" stroke={INK} strokeWidth={1.5} />
        </g>
      )}
    </g>
  );
}

export function Buildings({ night }: { night: number }) {
  return <g>{BUILDINGS.map((b) => <Front key={b.id} b={b} night={night} />)}</g>;
}

/** Lit panes, drawn above the night shade; a dark quarter keeps its lights off. */
export function LitWindows({ night, darkQuarter }: { night: number; darkQuarter: 1 | 2 | null }) {
  if (night < 0.25) return null;
  const wins = BUILDINGS.filter((b) => b.quarter !== darkQuarter).flatMap(windowsOf).filter((w) => w.lit);
  return (
    <g opacity={Math.min(1, (night - 0.25) / 0.4)}>
      {wins.map((w, i) => <rect key={`g${i}`} x={w.x - 4} y={w.y - 4} width={w.w + 8} height={w.h + 8} fill="#FFC94D" opacity={0.55} filter="url(#nc-glow)" />)}
      {wins.map((w, i) => (
        <g key={i}>
          <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="#FFE08A" />
          <rect x={w.x} y={w.y} width={w.w * 0.3} height={w.h} fill="#F2A51F" opacity={0.6} />
          <line x1={w.x + w.w / 2} x2={w.x + w.w / 2} y1={w.y} y2={w.y + w.h} stroke="#FFFFFF" strokeWidth={1.5} />
        </g>
      ))}
    </g>
  );
}
