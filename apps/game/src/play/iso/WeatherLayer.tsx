import { memo, useEffect, useState, type CSSProperties } from 'react';
import { townUrl } from '../../assets';
import { FIREWORK_SECONDS, hasWeather, PARTY_FROM, type Weather as W } from './weather';

/**
 * What an event paints over the town (lot L10.4, R2-01): veils of colour, shimmering air, rain, lightning, storm
 * clouds, frost at the edge of the screen and fireworks. Everything is a small layer over the town, animated by the
 * style sheet (no work per frame in the code, and the town's pictures are never repainted: see `weather.ts`).
 *
 * The drawings (fireworks, lightning, clouds, frost) are the Gemini pictures of `assets/ville/`, placed as plain
 * images: they are not part of the town's own layers, which are painted into canvases.
 */

/** Where the three fireworks go off in the sky, and in which order. */
const BURSTS = [
  { left: '19%', top: '9%', size: 26 },
  { left: '49%', top: '4%', size: 30 },
  { left: '75%', top: '12%', size: 24 },
];
/** Storm clouds across the top of the sky, each drifting at its own pace. */
const CLOUDS = [
  { left: '-6%', top: '-2%', size: 34, drift: 38 },
  { left: '34%', top: '-5%', size: 40, drift: 52 },
  { left: '72%', top: '-3%', size: 36, drift: 45 },
];

export const CityWeather = memo(function CityWeather({ w }: { w: W }) {
  // The windows lighting up all at once (demand peak) also give a short flash over the town.
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (w.lit) setFlash((n) => n + 1);
  }, [w.lit]);
  if (!hasWeather(w) && !w.lit) return null;
  const k = (v: number): CSSProperties => ({ '--k': v } as CSSProperties);
  const pic = (name: string): string => townUrl(name);
  return (
    <div className="city-weather" aria-hidden>
      {w.heat > 0 ? (
        <>
          <i className="w-heat" style={k(w.heat)} />
          {/* Air that ripples above the roofs: bands that slowly swell. */}
          <i className="w-haze" style={k(w.heat)} />
        </>
      ) : null}
      {w.mild > 0 ? <i className="w-mild" style={k(w.mild)} /> : null}
      {w.cold > 0 ? (
        <>
          <i className="w-cold" style={k(w.cold)} />
          <i className="w-frost-glow" style={k(w.cold)} />
          {pic('givre') ? <img className="w-frost" src={pic('givre')} alt="" style={k(w.cold)} draggable={false} /> : null}
        </>
      ) : null}
      {w.storm > 0 ? (
        <>
          <i className="w-dark" style={k(w.storm)} />
          {pic('nuage-orage') ? (
            <div className="w-clouds" style={k(w.storm)}>
              {CLOUDS.map((c) => (
                <img key={c.left} src={pic('nuage-orage')} alt="" draggable={false}
                  style={{ left: c.left, top: c.top, width: `${c.size}%`, animationDuration: `${c.drift}s` }} />
              ))}
            </div>
          ) : null}
          <i className="w-rain" style={k(w.storm)} />
          <i className="w-rain w-rain-2" style={k(w.storm)} />
          <i className="w-bolt" style={k(w.storm)} />
          {pic('eclair') ? <img className="w-bolt-pic" src={pic('eclair')} alt="" draggable={false} /> : null}
        </>
      ) : null}
      {w.party >= PARTY_FROM && pic('feu-artifice') ? (
        <div className="w-fireworks">
          {BURSTS.map((b, n) => (
            <img key={b.left} src={pic('feu-artifice')} alt="" draggable={false}
              style={{ left: b.left, top: b.top, width: `${b.size}%`, animationDelay: `${n * FIREWORK_SECONDS}s`, animationDuration: `${FIREWORK_SECONDS * 3}s` }} />
          ))}
        </div>
      ) : null}
      {flash > 0 ? <i key={flash} className="w-flash" /> : null}
    </div>
  );
});
