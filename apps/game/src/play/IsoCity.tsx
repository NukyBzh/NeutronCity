import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Mood } from '@neutron/engine';
import { townUrl } from '../assets';
import { t } from '../i18n';
import {
  BAND_VIEWBOX, FULL_VIEWBOX, PLOTS, TOWN_IMAGES, drawTownLayers, lightKey, seasonOf, tileCorners, type Places, type TownImage, type TownLayer,
  type TownScene,
} from './iso/town';
import { Sky } from './iso/Sky';
import { CityWeather } from './iso/WeatherLayer';
import { NO_WEATHER, type Weather } from './iso/weather';

/**
 * The town in isometric view (style B, D-13). `band`: the slice shown in the play screen (river, plant, then the
 * streets); `full`: the whole town, in the shop and the summary.
 *
 * Built for the tablet (lot L4): the sky is a small drawing of its own; the still parts of the town are painted once
 * into canvases (pictures), and only the small moving layers (cars, walkers, smoke, snow) are animated. The drawing is
 * rebuilt only when the light changes (night and sunset levels), not every game minute.
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
  /** Upgrade just bought, shown with an arrow. */
  fresh?: string | null;
  /** What the day's events show in the town (lot L7.1). */
  scene?: TownScene;
  /** What the day's events paint over the town (lot L10.4): veils, rain, frost, fireworks. */
  weather?: Weather;
  /** Lot of each building (lot L9.4). */
  places?: Places;
  /** Quarters for sale the child has bought (lot L10.6b): the others keep their sign. */
  quarters?: readonly number[];
  /** Free lots to touch while a building waits for its lot (lot L9.4), what touching one does, and its label. */
  spots?: readonly (readonly [number, number])[];
  onSpot?: (c: number, r: number) => void;
  spotLabel?: string;
}


/**
 * Pictures of the shop buildings (lot L6.2), read once as data: URLs: a still layer is an SVG painted as a picture, which
 * cannot load outside files. About 850 KB in all (town and shop).
 */
type Images = Readonly<Record<string, TownImage>>;
let loaded: Images | null = null;
let loading: Promise<Images> | null = null;
async function readImage(id: string): Promise<[string, TownImage] | null> {
  try {
    const blob = await (await fetch(townUrl(id))).blob();
    const href = await new Promise<string>((ok, ko) => {
      const r = new FileReader();
      r.onload = () => ok(r.result as string);
      r.onerror = () => ko(r.error);
      r.readAsDataURL(blob);
    });
    const img = await loadPicture(href);
    return [id, { href, w: img.naturalWidth, h: img.naturalHeight }];
  } catch {
    return null; // A picture that fails to load leaves its plot empty.
  }
}
function loadImages(): Promise<Images> {
  loading ??= Promise.all([...TOWN_IMAGES, ...Object.keys(PLOTS), 'isolation'].map(readImage)).then((all) => {
    loaded = Object.fromEntries(all.filter((x): x is [string, TownImage] => x !== null));
    return loaded;
  });
  return loading;
}

/**
 * Loads a picture and waits for it. `onload` rather than `decode()`: several decodes at once may never finish in a
 * page that is not shown (seen while checking lot L6.2).
 */
function loadPicture(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ko(new Error(`picture not loaded: ${src.slice(0, 40)}`));
    img.src = src;
  });
}

/**
 * Where a layer covering only part of the drawing (`frame`, lot L10.3) stands in the town's box of w × h pixels, framed
 * like the whole drawing (viewBox and aspect of the view).
 */
function frameRect(frame: { x: number; y: number; w: number; h: number }, viewBox: string, aspect: string, w: number, h: number): { left: number; top: number; width: number; height: number } {
  const [vx, vy, vw, vh] = viewBox.split(' ').map(Number) as [number, number, number, number];
  const k = aspect.includes('slice') ? Math.max(w / vw, h / vh) : Math.min(w / vw, h / vh);
  const ox = (w - vw * k) / 2;
  const oy = (h - vh * k) / 2;
  return { left: ox + (frame.x - vx) * k, top: oy + (frame.y - vy) * k, width: frame.w * k, height: frame.h * k };
}
const framedStyle = (r: { left: number; top: number; width: number; height: number }): CSSProperties =>
  ({ inset: 'auto', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
const frameBox = (f: { x: number; y: number; w: number; h: number }): string => `${f.x} ${f.y} ${f.w} ${f.h}`;

/** Paints one still layer (an SVG string) into a canvas, at the screen's pixel density, with the view's framing. */
async function paint(canvas: HTMLCanvasElement, svg: string, viewBox: string, aspect: string, w: number, h: number): Promise<void> {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}" viewBox="${viewBox}" preserveAspectRatio="${aspect}">${svg}</svg>`;
  const url = URL.createObjectURL(new Blob([doc], { type: 'image/svg+xml' }));
  try {
    const img = await loadPicture(url);
    // Drawn off screen first, then copied at once: the old picture stays until the new one is ready (no flicker).
    const off = document.createElement('canvas');
    off.width = pw;
    off.height = ph;
    off.getContext('2d')!.drawImage(img, 0, 0);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, pw, ph);
    ctx.drawImage(off, 0, 0);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const IsoCity = memo(function IsoCity(p: IsoCityProps) {
  const [images, setImages] = useState<Images | null>(loaded);
  useEffect(() => {
    if (images) return undefined;
    let live = true;
    void loadImages().then((all) => { if (live) setImages(all); });
    return () => { live = false; };
  }, [images]);
  const upgradesKey = p.upgrades.join(',');
  const sceneKey = JSON.stringify(p.scene ?? {});
  const placesKey = p.places ? JSON.stringify(p.places) : '';
  const quartersKey = (p.quarters ?? []).join(',');
  const light = lightKey(p.hour);
  const layers = useMemo(
    () => drawTownLayers({ hour: p.hour, season: seasonOf(p.season), mood: p.mood, elecOn: p.elecOn, heatOn: p.heatOn, upgrades: upgradesKey ? upgradesKey.split(',') : [], fresh: p.fresh ?? null, images: images ?? undefined, scene: JSON.parse(sceneKey) as TownScene, places: placesKey ? JSON.parse(placesKey) as Places : undefined, quarters: quartersKey ? quartersKey.split(',').map(Number) : [] }, p.view),
    // The hour only matters through the light (night and sunset levels).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [light, p.season, p.mood, p.elecOn, p.heatOn, upgradesKey, p.fresh, p.view, images, sceneKey, placesKey, quartersKey],
  );
  // Each moving layer has its own phase, changed only when that layer's drawing changes (React then creates new
  // elements, whose animations must go on where the old ones were, R1-02). A layer whose drawing is the same keeps its
  // elements and its phase.
  const phases = useRef<{ svg: string; phase: string }[]>([]);
  const now = (performance.now() / 1000).toFixed(2);
  layers.forEach((l: TownLayer, k) => {
    if (l.kind === 'moving' && phases.current[k]?.svg !== l.svg) phases.current[k] = { svg: l.svg, phase: now };
  });

  const viewBox = p.view === 'band' ? BAND_VIEWBOX : FULL_VIEWBOX;
  const aspect = p.view === 'band' ? 'xMidYMid slice' : 'xMidYMid meet';
  const box = useRef<HTMLDivElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  /** What each canvas shows now (drawing and size): a still layer is repainted only when it really changed. */
  const painted = useRef<string[]>([]);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize((s) => (s && s.w === r.width && s.h === r.height ? s : { w: r.width, h: r.height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!size) return undefined;
    let stop = false;
    // One picture per animation frame, so a change of light never freezes the game for long on the tablet.
    const todo = layers.flatMap((l, k) => {
      const key = `${size.w}x${size.h}|${l.svg}`;
      if (l.kind !== 'still' || painted.current[k] === key) return [];
      // A framed still layer (lot L10.3) is painted at the size of its frame on the screen.
      const r = l.frame ? frameRect(l.frame, viewBox, aspect, size.w, size.h) : null;
      return [{ k, svg: l.svg, key, vb: l.frame ? frameBox(l.frame) : viewBox, asp: l.frame ? 'none' : aspect, w: r ? r.width : size.w, h: r ? r.height : size.h }];
    });
    void (async () => {
      for (const job of todo) {
        if (stop) return;
        const c = canvases.current[job.k];
        if (!c) continue;
        try {
          await paint(c, job.svg, job.vb, job.asp, job.w, job.h);
          painted.current[job.k] = job.key;
        } catch {
          // A picture that fails to paint keeps the previous one.
        }
        await new Promise((r) => requestAnimationFrame(r));
      }
    })();
    return () => { stop = true; };
  }, [layers, size, viewBox, aspect]);

  return (
    <div ref={box} className={`city iso-${p.view}`} role="img" aria-label={t('app.title')}>
      {/* The sky moves by quarters of an hour: enough for the sun, and cheap on the tablet. */}
      {/* In the full view the panel is wider than the drawing: the sky fills it (slice), so the sides of the
          panel are sky and not the colour of the page (lot L10.6b2). */}
      <Sky view={p.view} hour={Math.floor(p.hour * 4) / 4} viewBox={viewBox} aspect={p.view === 'full' ? 'xMidYMid slice' : aspect} storm={p.weather?.storm ?? 0} mild={p.weather?.mild ?? 0} heat={p.weather?.heat ?? 0} cold={p.weather?.cold ?? 0} />
      {layers.map((l, k) => (l.kind === 'still'
        ? <canvas key={k} className="city-layer" ref={(c) => { canvases.current[k] = c; }} style={l.frame && size ? framedStyle(frameRect(l.frame, viewBox, aspect, size.w, size.h)) : undefined} />
        : (
          <svg key={k} className="city-layer" viewBox={l.frame ? frameBox(l.frame) : viewBox} preserveAspectRatio={l.frame ? 'none' : aspect} aria-hidden
            style={l.frame && size ? framedStyle(frameRect(l.frame, viewBox, aspect, size.w, size.h)) : undefined}>
            <g style={{ '--phase': `${phases.current[k]?.phase ?? '0'}s` } as CSSProperties} dangerouslySetInnerHTML={{ __html: l.svg }} />
          </svg>
        )))}
      {/* Lot L10.4: what the events paint over the town (veils, rain, frost, fireworks), above the pictures. */}
      <CityWeather w={p.weather ?? NO_WEATHER} />
      {/* Lot L9.4: the free lots glow and can be touched, above the whole town. */}
      {p.spots?.length ? (
        <svg className="city-layer city-spots" viewBox={viewBox} preserveAspectRatio={aspect}>
          {p.spots.map(([c, r]) => (
            <polygon key={`${c},${r}`} className="spot" points={tileCorners(c, r).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
              role="button" tabIndex={0} aria-label={p.spotLabel}
              onClick={() => p.onSpot?.(c, r)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') p.onSpot?.(c, r); }} />
          ))}
        </svg>
      ) : null}
    </div>
  );
});
