import { memo, useEffect, useState, type CSSProperties } from 'react';
import { FIREWORK_SECONDS, hasWeather, PARTY_FROM, type Weather as W } from './weather';

/**
 * What an event paints over the town (lot L10.4, R2-01): veils of colour, shimmering air, rain, lightning, frost at the
 * edge of the screen and fireworks. Everything is a small layer over the town, animated by the style sheet (no work
 * per frame in the code, and the town's pictures are never repainted: see `weather.ts`).
 */

/** Spikes of frost in a corner (drawing units of a 100 × 100 corner): a fern of ice growing inwards. */
const FROST = 'M0 0 L34 7 L22 13 L52 19 L37 26 L64 33 L47 38 L72 47 L54 51 L76 62 '
  + 'L60 64 L70 78 L54 74 L58 92 L45 78 L40 97 L33 76 L23 90 L20 68 L8 76 L11 56 L0 60 Z';
/** Each corner takes about a third of the screen; the glow of the style sheet joins them along the edges. */
const C = 0.26;
const CORNERS = [
  { k: 'tl', t: `scale(${C})` },
  { k: 'tr', t: `translate(100,0) scale(${-C},${C})` },
  { k: 'bl', t: `translate(0,100) scale(${C},${-C})` },
  { k: 'br', t: `translate(100,100) scale(${-C},${-C})` },
];

/** A firework burst: rays and sparks, in its own little box. */
function Burst({ hue, delay }: { hue: string; delay: number }) {
  const rays = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2;
    return { x: Math.cos(a), y: Math.sin(a), long: k % 2 === 0 };
  });
  return (
    <svg className="w-burst" viewBox="-50 -50 100 100" aria-hidden style={{ animationDelay: `${delay}s`, animationDuration: `${FIREWORK_SECONDS * 3}s` }}>
      {rays.map((r, k) => (
        <g key={k}>
          <line x1={r.x * 8} y1={r.y * 8} x2={r.x * (r.long ? 42 : 30)} y2={r.y * (r.long ? 42 : 30)} stroke={hue} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx={r.x * (r.long ? 45 : 33)} cy={r.y * (r.long ? 45 : 33)} r="3.2" fill="#FFF6D8" />
        </g>
      ))}
      <circle cx="0" cy="0" r="5" fill="#FFF6D8" />
    </svg>
  );
}

export const CityWeather = memo(function CityWeather({ w }: { w: W }) {
  // The windows lighting up all at once (demand peak) also give a short flash over the town.
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (w.lit) setFlash((n) => n + 1);
  }, [w.lit]);
  if (!hasWeather(w) && !w.lit) return null;
  const k = (v: number): CSSProperties => ({ '--k': v } as CSSProperties);
  return (
    <div className="city-weather" aria-hidden>
      {w.heat > 0 ? (
        <>
          <i className="w-heat" style={k(w.heat)} />
          {/* Air that ripples above the roofs: three bands that slowly swell. */}
          <i className="w-haze" style={k(w.heat)} />
        </>
      ) : null}
      {w.mild > 0 ? <i className="w-mild" style={k(w.mild)} /> : null}
      {w.cold > 0 ? (
        <>
          <i className="w-cold" style={k(w.cold)} />
          <i className="w-frost-glow" style={k(w.cold)} />
          <svg className="w-frost" viewBox="0 0 100 100" preserveAspectRatio="none" style={k(w.cold)}>
            {CORNERS.map((c) => (
              <g key={c.k} transform={c.t}>
                <path d={FROST} fill="#F2FAFF" fillOpacity="0.82" />
                <path d={FROST} fill="none" stroke="#BFE4FF" strokeWidth="1.4" />
              </g>
            ))}
          </svg>
        </>
      ) : null}
      {w.storm > 0 ? (
        <>
          <i className="w-dark" style={k(w.storm)} />
          <i className="w-rain" style={k(w.storm)} />
          <i className="w-rain w-rain-2" style={k(w.storm)} />
          <i className="w-bolt" style={k(w.storm)} />
        </>
      ) : null}
      {w.party >= PARTY_FROM ? (
        <div className="w-fireworks">
          <span style={{ left: '18%', top: '8%' }}><Burst hue="#FFC83D" delay={0} /></span>
          <span style={{ left: '48%', top: '4%' }}><Burst hue="#6FD3FF" delay={FIREWORK_SECONDS} /></span>
          <span style={{ left: '74%', top: '11%' }}><Burst hue="#FF7E6B" delay={FIREWORK_SECONDS * 2} /></span>
        </div>
      ) : null}
      {flash > 0 ? <i key={flash} className="w-flash" /> : null}
    </div>
  );
});
