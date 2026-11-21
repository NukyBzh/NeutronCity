import { memo } from 'react';
import { nightAt } from './town';

/**
 * Sky behind the town, hour by hour (R1-11, R1-12): colours of dawn, day, golden hour, sunset and night; the sun
 * crosses the sky from 6 h to 20 h 30 and turns orange near the horizon; at night the moon and twinkling stars; a few
 * clouds drift, tinted by the light. Drawn for the project. Redrawn every 5 game minutes (a few dozen elements).
 */

/** Sky colours (top, bottom) at given hours; in between, colours are mixed. */
const STOPS: [number, string, string][] = [
  [0, '#0B1033', '#1E2A5C'],
  [4.6, '#0B1033', '#1E2A5C'],
  [5.5, '#2A2F6B', '#B9708F'],
  [6.5, '#6FA8E8', '#FFC9A0'],
  [8, '#7FC0F5', '#D8EEFF'],
  [17, '#7FC0F5', '#D8EEFF'],
  [18.5, '#6E9EDB', '#FFD39A'],
  [19.5, '#4C62AA', '#FF9E6B'],
  [20.5, '#2B2F6E', '#C2607A'],
  [21.5, '#121842', '#2C3570'],
  [24, '#0B1033', '#1E2A5C'],
];

const hex = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number): string => {
  const A = hex(a); const B = hex(b);
  return `#${A.map((v, i) => Math.round(v + (B[i]! - v) * k).toString(16).padStart(2, '0')).join('')}`;
};

export function skyColours(hour: number): [string, string] {
  const h = ((hour % 24) + 24) % 24;
  for (let k = 1; k < STOPS.length; k++) {
    const [h1, t1, b1] = STOPS[k]!;
    const [h0, t0, b0] = STOPS[k - 1]!;
    if (h <= h1) {
      const f = (h - h0) / (h1 - h0);
      return [mix(t0, t1, f), mix(b0, b1, f)];
    }
  }
  return [STOPS[0]![1], STOPS[0]![2]];
}

/** Where the sun or the moon goes in each view: rising point, top control point, setting point. */
const ARC = {
  band: [[1430, 470], [1150, 120], [860, 440]],
  full: [[1380, 170], [610, -300], [-160, 170]],
} as const;
const STAR_BOX = { band: [700, 1450, 210, 380], full: [-300, 1520, -120, 180] } as const;

function onArc(view: 'band' | 'full', t: number): [number, number] {
  const [a, c, b] = ARC[view];
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
}

const SUNRISE = 6;
const SUNSET = 20.5;

export const Sky = memo(function Sky({ view, hour, viewBox, aspect, storm = 0, mild = 0, heat = 0, cold = 0 }: {
  view: 'band' | 'full'; hour: number; viewBox: string; aspect: string;
  /** Storm (lot L10.4): the sky turns to slate and fills with low dark clouds, the sun goes behind them. */
  storm?: number;
  /** Mild spell (lot L10.4): the sky clears and the sun shines wider. */
  mild?: number;
  /** Heatwave (lot L10.4): the sky turns hot and hazy. */
  heat?: number;
  /** Cold wave (lot L10.4): the sky turns to cold pale blue. */
  cold?: number;
}) {
  const h = ((hour % 24) + 24) % 24;
  const [day0, day1] = skyColours(h);
  const tint = (c: string, hot: string, icy: string): string => mix(mix(c, hot, heat * 0.55), icy, cold * 0.5);
  const top = mix(mix(tint(day0, '#E8A05C', '#A7C8E8'), '#2A3354', storm * 0.8), '#9FD0F7', mild * 0.3);
  const bottom = mix(mix(tint(day1, '#FFD9A0', '#DCEBFA'), '#5A6485', storm * 0.75), '#FFF3C4', mild * 0.3);
  const [, vy, , vh] = viewBox.split(' ').map(Number) as [number, number, number, number];
  const night = nightAt(h);
  const big = view === 'full' ? 1.9 : 1;
  const id = `sky-${view}`;

  const sunUp = h >= SUNRISE && h <= SUNSET && storm < 0.5;
  const sunT = (h - SUNRISE) / (SUNSET - SUNRISE);
  const [sx, sy] = onArc(view, Math.min(1, Math.max(0, sunT)));
  // Low sun: bigger and orange.
  const low = sunUp ? Math.max(0, 1 - Math.min(sunT, 1 - sunT) * 5) : 0;
  const sunCol = mix('#FFE27A', '#FF8A3D', low);

  const moonT = h >= SUNSET ? (h - SUNSET) / (24 - SUNSET + SUNRISE) : h < SUNRISE ? (h + 24 - SUNSET) / (24 - SUNSET + SUNRISE) : -1;
  const [mx, my] = onArc(view, Math.min(1, Math.max(0, moonT)));

  const [x0, x1, y0, y1] = STAR_BOX[view];
  const stars = Array.from({ length: view === 'full' ? 46 : 28 }, (_, k) => {
    const a = (k * 7919) % 1000 / 1000; const b = (k * 104729) % 997 / 997;
    return { x: x0 + a * (x1 - x0), y: y0 + b * (y1 - y0), r: 1.2 + (k % 3) * 0.7, d: -((k * 13) % 7) };
  });

  // Clouds: white by day, pink at sunset, dim blue at night.
  const warm = Math.max(0, 1 - Math.abs(h - 19.6) / 1.6);
  const cloudCol = mix(mix(mix('#FFFFFF', '#FFC2B0', warm), '#39437E', night), '#4A5878', storm * 0.85);
  const cloudOp = Math.min(1, 0.9 - 0.45 * night + 0.4 * storm) * (1 - mild * 0.45);
  const clouds = view === 'band'
    ? [[760, 250, 1, 0], [1180, 300, 0.8, -30], [980, 230, 0.7, -60]]
    : [[0, -40, 1.6, 0], [700, 10, 1.3, -40], [1200, -70, 1.5, -80], [300, 90, 1.1, -20]];
  // Storm (lot L10.4): a second row of bigger clouds, lower and drifting faster.
  // They hang in the strip of sky above the hills (lower down, the countryside picture hides them).
  const stormClouds = storm > 0 && view === 'full'
    ? [[-150, -150, 2.1, -10], [420, -100, 1.8, -55], [1020, -145, 2.3, -95], [1520, -105, 1.9, -25]]
    : storm > 0 ? [[700, 250, 1.3, -15], [1080, 226, 1.1, -45]] : [];

  return (
    <svg className="city-layer sky" viewBox={viewBox} preserveAspectRatio={aspect} aria-hidden>
      <defs>
        {/* Spread over the visible height only, so the horizon colour is really seen just above the town. */}
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1={vy} x2="0" y2={vy + vh * (view === 'band' ? 0.75 : 0.45)}>
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={sunCol} stopOpacity={0.55} />
          <stop offset="1" stopColor={sunCol} stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}-moon`}>
          <circle cx={mx} cy={my} r={18 * big} fill="#FFFFFF" />
          <circle cx={mx + 8 * big} cy={my - 5 * big} r={16 * big} fill="#000000" />
        </mask>
      </defs>
      <rect x="-2000" y="-2000" width="6000" height="6000" fill={`url(#${id}-g)`} />
      {night > 0.6 ? (
        <g opacity={(night - 0.6) / 0.4}>
          {stars.map((s, k) => <circle key={k} className="star" cx={s.x} cy={s.y} r={s.r * big} fill="#FFF6D8" style={{ animationDelay: `${s.d}s` }} />)}
        </g>
      ) : null}
      {sunUp ? (
        <g>
          <circle cx={sx} cy={sy} r={(70 + 30 * low) * big} fill={`url(#${id}-glow)`} />
          <circle cx={sx} cy={sy} r={(22 + 8 * low) * big} fill={sunCol} stroke="#FFB43D" strokeWidth={2 * big} />
        </g>
      ) : null}
      {moonT >= 0 ? (
        <g>
          <circle cx={mx} cy={my} r={34 * big} fill="#FFF6D8" opacity={0.12} />
          <circle cx={mx} cy={my} r={18 * big} fill="#FFF3C4" mask={`url(#${id}-moon)`} />
        </g>
      ) : null}
      {clouds.map(([cx, cy, k, d], n) => (
        <g key={n} className="sky-cloud" style={{ animationDelay: `${d}s` }} opacity={cloudOp}>
          <g transform={`translate(${cx} ${cy}) scale(${k! * big * 0.8})`} fill={cloudCol}>
            <ellipse cx="0" cy="0" rx="46" ry="16" />
            <ellipse cx="-18" cy="-10" rx="22" ry="16" />
            <ellipse cx="14" cy="-16" rx="26" ry="20" />
          </g>
        </g>
      ))}
      {stormClouds.map(([cx, cy, k, d], n) => (
        <g key={`s${n}`} className="sky-cloud storm-cloud" style={{ animationDelay: `${d}s` }} opacity={0.92 * storm}>
          {/* Lighter than the sky of a storm, so they stand out against it. */}
          <g transform={`translate(${cx} ${cy}) scale(${k! * big * 0.8})`} fill={mix('#9AA6C4', '#6E7898', storm)}>
            <ellipse cx="0" cy="0" rx="54" ry="17" />
            <ellipse cx="-24" cy="-11" rx="26" ry="17" />
            <ellipse cx="16" cy="-18" rx="30" ry="22" />
            <ellipse cx="44" cy="-6" rx="22" ry="14" />
          </g>
        </g>
      ))}
    </svg>
  );
});
