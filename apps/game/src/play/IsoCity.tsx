import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Mood } from '@neutron/engine';
import { townUrl } from '../assets';
import { t } from '../i18n';
import {
  BAND_VIEWBOX, FULL_VIEWBOX, PLOTS, TOWN_IMAGES, drawTownLayers, lightKey, seasonOf, type TownImage, type TownLayer, type TownScene,
} from './iso/town';
import { Sky } from './iso/Sky';

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
  const light = lightKey(p.hour);
  const layers = useMemo(
    () => drawTownLayers({ hour: p.hour, season: seasonOf(p.season), mood: p.mood, elecOn: p.elecOn, heatOn: p.heatOn, upgrades: upgradesKey ? upgradesKey.split(',') : [], fresh: p.fresh ?? null, images: images ?? undefined, scene: JSON.parse(sceneKey) as TownScene }, p.view),
    // The hour only matters through the light (night and sunset levels).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [light, p.season, p.mood, p.elecOn, p.heatOn, upgradesKey, p.fresh, p.view, images, sceneKey],
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
      return l.kind === 'still' && painted.current[k] !== key ? [{ k, svg: l.svg, key }] : [];
    });
    void (async () => {
      for (const job of todo) {
        if (stop) return;
        const c = canvases.current[job.k];
        if (!c) continue;
        try {
          await paint(c, job.svg, viewBox, aspect, size.w, size.h);
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
      <Sky view={p.view} hour={Math.floor(p.hour * 4) / 4} viewBox={viewBox} aspect={aspect} />
      {layers.map((l, k) => (l.kind === 'still'
        ? <canvas key={k} className="city-layer" ref={(c) => { canvases.current[k] = c; }} />
        : (
          <svg key={k} className="city-layer" viewBox={viewBox} preserveAspectRatio={aspect} aria-hidden>
            <g style={{ '--phase': `${phases.current[k]?.phase ?? '0'}s` } as CSSProperties} dangerouslySetInnerHTML={{ __html: l.svg }} />
          </svg>
        )))}
    </div>
  );
});
