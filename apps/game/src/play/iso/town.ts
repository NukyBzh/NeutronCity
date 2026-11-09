/**
 * The town in isometric view, made only of Gemini pictures (lot L6.3, owner's choice: one design for the whole town, no
 * drawn building, vehicle or object). A checkerboard of ground tiles (grass, roads, crossroads, river, concrete) with
 * buildings, trees and plant parts set on them; cars, a bus and inhabitants go along the streets (series 3). The sky, the falling snow and the energy flowing in the power line stay
 * drawn (owner's choice). The same town is shown as a band in the play screen and whole in the shop and the summary.
 *
 * World: tiles of 8 × 8 units. Tile (c, r) covers x ∈ [8c, 8c + 8], y ∈ [8r, 8r + 8]; x grows to the right-down of the
 * screen, y to the left-down. Column -1 is the river, columns 0–1 the plant, then blocks of 2 × 2 lots between roads.
 * Painter order: row by row (r), then c; the traffic of each road row is drawn between the rows behind it and the
 * rows in front of it, so buildings in front still hide it.
 *
 * Every picture is defined once per layer (<defs>) and placed with <use>: the still layers stay small enough to be
 * painted quickly on the tablet.
 */
import type { Mood } from '@neutron/engine';

export type Season = 'ete' | 'printemps' | 'hiver';
export const seasonOf = (dayId: string): Season => (dayId === 'hiver' ? 'hiver' : dayId === 'printemps' ? 'printemps' : 'ete');

export interface TownImage { href: string; w: number; h: number }

export interface TownOptions {
  hour: number;
  season: Season;
  mood: Mood;
  elecOn: boolean;
  heatOn: boolean;
  upgrades: readonly string[];
  /** Upgrade just bought: only it plays the "appear" animation (otherwise it would replay at every redraw). */
  fresh?: string | null;
  /**
   * Pictures as data: URLs (they are painted into still pictures, which cannot load outside files): the town's
   * pictures (TOWN_IMAGES) and those of the shop buildings. What is not loaded yet is simply not drawn.
   */
  images?: Readonly<Record<string, TownImage>>;
}

// ---------- the map ----------
const T = 8;
const S = 12;
const OX = 640;
const OY = 0;
const P = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 0.866 * S, OY + (x + y) * 0.5 * S - z * S];
const f1 = (v: number): string => v.toFixed(1);
/** Width of a tile on the screen. */
const TILE_W = 2 * T * 0.866 * S;

export const COLS = [-2, 10] as const;
export const ROWS = [0, 10] as const;
const PLANT_COLS = [0, 1];
const isRoadCol = (c: number): boolean => c >= 2 && (c - 2) % 3 === 0;
const isRoadRow = (r: number): boolean => r >= 2 && (r - 2) % 3 === 0;
/** Lots of the town: not river, not plant, not road. */
export const isLot = (c: number, r: number): boolean => c >= 3 && !isRoadCol(c) && !isRoadRow(r);

/** Band of the play screen: from the river and the plant (left) to the streets (right). */
export const BAND_VIEWBOX = '-170 204 1620 432';
export const FULL_VIEWBOX = '-360 -170 1960 1300';

/**
 * Plot of each shop building (lot L6.2): tile (c, r) and width of the picture as a share of a tile. A grass tile until
 * it is bought, then the same picture as in the shop. All plots stand in the lots seen in the band of the play screen.
 * Isolation is the woolly hat on the chimney of the Lilas house; the cycle track turns the roads into cycle-track
 * tiles; street lights are the Gemini lamp-post at the crossroads.
 */
export const PLOTS: Readonly<Record<string, { c: number; r: number; size: number }>> = {
  ferme: { c: 3, r: 3, size: 0.95 },
  'reseau-chaleur': { c: 3, r: 4, size: 0.9 },
  'maison-lilas': { c: 4, r: 4, size: 0.8 },
  'maison-ve': { c: 4, r: 3, size: 0.9 },
  epicerie: { c: 6, r: 3, size: 0.85 },
  ecole: { c: 6, r: 4, size: 1 },
  'usine-cereales': { c: 7, r: 0, size: 1 },
  'maison-medicale': { c: 7, r: 3, size: 0.72 },
  batterie: { c: 3, r: 6, size: 0.8 },
  parc: { c: 4, r: 6, size: 1 },
  piscine: { c: 6, r: 1, size: 1 },
  solaire: { c: 7, r: 1, size: 0.95 },
  hopital: { c: 7, r: 4, size: 1.05 },
  cuve: { c: 3, r: 7, size: 0.6 },
  fontaine: { c: 4, r: 7, size: 0.62 },
};
/** The woolly hat on its chimney (isolation) covers the chimney of the Lilas house: centre, bottom, width (shares). */
export const HAT = { on: 'maison-lilas', x: 0.69, bottom: 0.3, size: 0.3 } as const;
/** Grass tile, also the tile of the plots not bought yet. */
export const TILE = 'herbe';
const plotAt = (c: number, r: number): string | undefined => Object.keys(PLOTS).find((id) => PLOTS[id]!.c === c && PLOTS[id]!.r === r);

/** Share of each ground tile's height taken by its top face (measured on the pictures). */
const FACE: Record<string, number> = { herbe: 0.872, route: 0.876, piste: 0.86, carrefour: 0.817, riviere: 0.817, beton: 0.817 };

type Thing = 'immeuble' | 'maisons' | 'arbres' | 'jeux' | 'usine-2' | 'usine-3' | 'gare'
  | 'immeuble-moderne' | 'immeuble-brique' | 'tour-bureaux' | 'boulangerie' | 'maison-jardin' | 'immeuble-rose'
  | 'reacteur' | 'salle-machines' | 'tour' | 'poste' | 'pompage' | 'salle-commande' | 'combustible' | 'diesel';
/** What stands on the lots and on the plant's tiles; other lots get a mix of flats, houses and trees. */
const PLACES: Record<string, Thing> = {
  '0,5': 'pompage', '0,6': 'reacteur', '1,6': 'salle-machines', '0,7': 'tour', '1,7': 'poste', '0,8': 'salle-commande',
  '1,8': 'combustible', '0,9': 'diesel',
  '6,0': 'immeuble-rose', '9,0': 'usine-2', '10,0': 'usine-3', '9,1': 'immeuble', '10,1': 'maisons',
  '6,6': 'jeux', '9,4': 'gare', '3,9': 'immeuble', '9,3': 'maisons', '6,7': 'immeuble', '7,6': 'arbres',
};
const FILL: Thing[] = [
  'immeuble', 'maisons', 'immeuble-moderne', 'arbres', 'immeuble-brique', 'maison-jardin', 'tour-bureaux', 'immeuble',
  'immeuble-rose', 'boulangerie', 'arbres', 'maisons',
];
const hash = (a: number, b: number): number => (((a + 7) * 73856093) ^ ((b + 3) * 19349663)) >>> 0;
const thingAt = (c: number, r: number): Thing | null => {
  const k = PLACES[`${c},${r}`];
  if (k) return k;
  if (PLANT_COLS.includes(c)) return (r === 4 || r === 10) ? 'arbres' : null;
  if (c < 0 || !isLot(c, r)) return null;
  return FILL[hash(c, r) % FILL.length]!;
};
/** Size of each thing as a share of a tile. */
const SIZE: Record<Thing, number> = {
  immeuble: 0.95, maisons: 0.95, arbres: 0, jeux: 0, 'usine-2': 1, 'usine-3': 1, gare: 1, reacteur: 0.95, 'salle-machines': 1,
  tour: 0.95, poste: 1, pompage: 1, 'salle-commande': 0.9, combustible: 0.9, diesel: 0.8,
  'immeuble-moderne': 0.8, 'immeuble-brique': 0.8, 'tour-bureaux': 0.62, boulangerie: 0.72, 'maison-jardin': 0.95, 'immeuble-rose': 0.9,
};

/** Pictures of the town (assets/ville), loaded by the screen with the shop buildings' pictures. */
export const TOWN_IMAGES = [
  'herbe', 'route', 'carrefour', 'riviere', 'beton',
  'immeuble-jour', 'immeuble-jour-neige', 'immeuble-nuit', 'immeuble-nuit-neige', 'immeuble-coupure', 'immeuble-coupure-neige',
  'maisons', 'usine-2', 'usine-3', 'gare', 'reacteur', 'salle-machines', 'tour-on', 'tour-off', 'poste', 'pylone', 'pompage',
  'salle-commande', 'combustible', 'diesel', 'arbre', 'lampadaire', 'panneau-alerte', 'balancoire', 'enfants', 'oiseaux',
  'immeuble-moderne', 'immeuble-brique', 'tour-bureaux', 'boulangerie', 'maison-jardin', 'immeuble-rose', 'piste',
  'voiture-rouge-avant', 'voiture-rouge-arriere', 'voiture-bleue-avant', 'voiture-bleue-arriere', 'bus',
  'habitant-adulte', 'habitant-enfant', 'famille-1', 'famille-2',
] as const;

/**
 * Traffic of each road row: vehicles (front picture going right-down, back picture going left-up, both mirrored) and
 * inhabitants on the pavements (the pictures walk to the left: mirrored to walk right-down). Seconds per crossing and
 * offset, so they never start together. Walkers' size is their height on the screen.
 */
interface Mover { id: string; dir: 1 | -1; lane: number; size: number; dur: number; d: number; walker?: boolean }
const TRAFFIC: Record<number, Mover[]> = {
  2: [
    { id: 'voiture-bleue-avant', dir: 1, lane: 5, size: 0.3, dur: 18, d: -4 },
    { id: 'voiture-rouge-arriere', dir: -1, lane: 3, size: 0.28, dur: 21, d: -12 },
    { id: 'habitant-adulte', dir: 1, lane: 7.3, size: 34, dur: 60, d: -20, walker: true },
  ],
  5: [
    { id: 'voiture-rouge-avant', dir: 1, lane: 5, size: 0.3, dur: 16, d: 0 },
    { id: 'voiture-bleue-arriere', dir: -1, lane: 3, size: 0.28, dur: 19, d: -7 },
    { id: 'bus', dir: 1, lane: 5, size: 0.42, dur: 24, d: -13 },
    { id: 'famille-1', dir: 1, lane: 7.3, size: 34, dur: 70, d: -30, walker: true },
    { id: 'habitant-adulte', dir: -1, lane: 0.8, size: 32, dur: 64, d: -9, walker: true },
  ],
  8: [
    { id: 'voiture-rouge-avant', dir: 1, lane: 5, size: 0.3, dur: 17, d: -9 },
    { id: 'voiture-bleue-arriere', dir: -1, lane: 3, size: 0.28, dur: 20, d: -2 },
    { id: 'habitant-enfant', dir: 1, lane: 7.3, size: 26, dur: 58, d: -15, walker: true },
    { id: 'famille-2', dir: -1, lane: 0.8, size: 32, dur: 72, d: -40, walker: true },
  ],
};
/** Streets run from the road after the plant (never on the river) to the end of the town (world x). */
const STREET_X = [T * 2, T * (COLS[1] + 1)] as const;

/** Pylons of the power line, on the road in front of row 5, from the plant to the town (world x). */
const PYLONS = [14, 23, 47, 71];
const WIRE_Y = 5 * T + 1;

// ---------- light ----------
const hex = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** 0 in full daylight, 1 in the middle of the night (dusk 17.5–21 h, dawn 5–7.5 h). */
export function nightAt(h: number): number {
  if (h >= 21 || h < 5) return 1;
  if (h >= 17.5) return (h - 17.5) / 3.5;
  if (h < 7.5) return 1 - (h - 5) / 2.5;
  return 0;
}

/**
 * Night level used by the drawing, in steps of 1/8: the town is only redrawn when the light really changes (about
 * 20 times a day instead of every 5 game minutes), which keeps the tablet smooth.
 */
export const nightStep = (h: number): number => Math.round(nightAt(h) * 8) / 8;
/** Warm light of the setting sun on the town (0 to 1, highest around 19 h 30), in steps of 1/4. */
export const warmStep = (h: number): number => Math.round(Math.max(0, 1 - Math.abs(h - 19.3) / 1.7) * 4) / 4;
/** What the drawing depends on in the hour: it is redrawn only when this changes. */
export const lightKey = (h: number): string => `${nightStep(h)}|${warmStep(h)}`;

/**
 * The town comes as layers, back to front. `still` layers never move: the screen paints them once into a picture.
 * `moving` layers hold what is animated (the building just bought, the arrow, flows, snow, birds).
 */
export interface TownLayer { kind: 'still' | 'moving'; svg: string }

interface Box { x: number; y: number; w: number; h: number }
/** One picture to place, with the filters it goes through (light, winter). */
interface Item { id: string; box: Box; mirror?: boolean; filters: string[]; /** Attributes of a <g> around it (animation). */ wrap?: string }

/** The whole town as one SVG string (tests, tools). */
export function drawTown(o: TownOptions, view: 'band' | 'full'): string {
  return drawTownLayers(o, view).map((l) => l.svg).join('');
}

export function drawTownLayers(o: TownOptions, view: 'band' | 'full'): TownLayer[] {
  const img = o.images ?? {};
  const night = nightStep(o.hour);
  const warm = warmStep(o.hour);
  const winter = o.season === 'hiver';
  const darkNight = night >= 0.5;

  // The pictures take the light of the hour: warmer at sunset, darker and bluer at night (a colour matrix). Night
  // pictures of the flats (lit windows) only take the sunset tint. Winter pales the grass and the trees.
  const matrix = (kw: number, kn: number): string | null => {
    if (kw === 0 && kn === 0) return null;
    const s = (1 - kn) * (1 - kw);
    const sun = hex('#FF9E6B');
    const dark = hex('#0B1440');
    const off = [0, 1, 2].map((c) => (((1 - kn) * kw * sun[c]!) + kn * dark[c]!) / 255);
    const k = s.toFixed(3);
    return `${k} 0 0 0 ${off[0]!.toFixed(3)} 0 ${k} 0 0 ${off[1]!.toFixed(3)} 0 0 ${k} 0 ${off[2]!.toFixed(3)} 0 0 0 1 0`;
  };
  const light = matrix(0.2 * warm, 0.5 * night);
  const lightNight = matrix(0.2 * warm, 0);
  const FILTERS: Record<string, string | null> = {
    light,
    'light-n': lightNight,
    winter: winter ? '0.35 0 0 0 0.62 0 0.35 0 0 0.64 0 0 0.35 0 0.68 0 0 0 1 0' : null,
  };
  const filterDefs = (used: Set<string>): string => [...used]
    .filter((f) => FILTERS[f])
    .map((f) => `<filter id="f-${f}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${FILTERS[f]}"/></filter>`).join('');
  const L = (extra: string[] = []): string[] => [...extra, 'light'];

  /** Where a picture stands: its base centred on world point (x, y), `size` of a tile wide. */
  function boxAt(id: string, x: number, y: number, size: number): Box | null {
    const im = img[id];
    if (!im) return null;
    const [cx, cy] = P(x, y);
    const w = TILE_W * size;
    const h = (w * im.h) / im.w;
    return { x: cx - w / 2, y: cy + w * 0.289 - h, w, h };
  }
  /** A ground tile on (c, r): its top face fitted on the tile. */
  function tileBox(id: string, c: number, r: number): Box | null {
    if (!img[id]) return null;
    const [, ty] = P(T * c, T * r);
    const [lx] = P(T * c, T * r + T);
    const [rx] = P(T * c + T, T * r);
    const [, by] = P(T * c + T, T * r + T);
    return { x: lx, y: ty, w: rx - lx, h: (by - ty) / (FACE[id] ?? 0.85) };
  }

  /** Renders items: each picture defined once, placed with <use>, consecutive items sharing filters grouped. */
  function render(items: Item[]): string {
    const used = new Set<string>();
    const filtersUsed = new Set<string>();
    let body = '';
    let open: string | null = null;
    for (const it of items) {
      used.add(it.id);
      const fs = it.filters.filter((f) => FILTERS[f]);
      fs.forEach((f) => filtersUsed.add(f));
      const key = fs.join(',');
      if (key !== open) {
        if (open !== null) body += '</g>'.repeat(open ? open.split(',').length : 0);
        body += fs.map((f) => `<g filter="url(#f-${f})">`).join('');
        open = key;
      }
      const im = img[it.id]!;
      const kx = it.box.w / im.w;
      const ky = it.box.h / im.h;
      const t = it.mirror
        ? `translate(${f1(it.box.x + it.box.w)} ${f1(it.box.y)}) scale(${(-kx).toFixed(4)} ${ky.toFixed(4)})`
        : `translate(${f1(it.box.x)} ${f1(it.box.y)}) scale(${kx.toFixed(4)} ${ky.toFixed(4)})`;
      const use = `<use href="#p-${it.id}" transform="${t}"/>`;
      body += it.wrap ? `<g ${it.wrap}>${use}</g>` : use;
    }
    if (open) body += '</g>'.repeat(open.split(',').length);
    const defs = [...used].map((id) => `<image id="p-${id}" href="${img[id]!.href}" width="${img[id]!.w}" height="${img[id]!.h}" preserveAspectRatio="none"/>`).join('');
    return `<defs>${filterDefs(filtersUsed)}${defs}</defs>${body}`;
  }

  const layers: TownLayer[] = [];

  // ---------- ground ----------
  const ground: Item[] = [];
  const tileOf = (c: number, r: number): { id: string; mirror?: boolean; winter?: boolean } => {
    if (c === -1) return { id: 'riviere' };
    if (c < 0) return { id: 'herbe', winter: true };
    if (PLANT_COLS.includes(c)) return r >= 5 && r <= 9 ? { id: 'beton' } : { id: 'herbe', winter: true };
    if (isRoadCol(c) && isRoadRow(r)) return { id: 'carrefour' };
    if (isRoadCol(c)) return { id: 'route', mirror: true };
    if (isRoadRow(r)) return o.upgrades.includes('piste') && img.piste ? { id: 'piste' } : { id: 'route' };
    const thing = thingAt(c, r);
    return thing === 'arbres' || thing === 'jeux' || plotAt(c, r) ? { id: 'herbe', winter: true } : { id: 'beton' };
  };
  for (let s = COLS[0] + ROWS[0]; s <= COLS[1] + ROWS[1]; s++) {
    for (let c: number = COLS[0]; c <= COLS[1]; c++) {
      const r = s - c;
      if (r < ROWS[0] || r > ROWS[1]) continue;
      const t = tileOf(c, r);
      const box = tileBox(t.id, c, r);
      if (box) ground.push({ id: t.id, box, mirror: t.mirror, filters: L(t.winter ? ['winter'] : []) });
    }
  }
  // Until the tiles are loaded: a plain green ground, so the town is never an empty hole.
  if (ground.length === 0) {
    const pts = [P(T * COLS[0], 0), P(T * (COLS[1] + 1), 0), P(T * (COLS[1] + 1), T * (ROWS[1] + 1)), P(T * COLS[0], T * (ROWS[1] + 1))];
    layers.push({ kind: 'still', svg: `<polygon points="${pts.map(([a, b]) => `${f1(a)},${f1(b)}`).join(' ')}" fill="${winter ? '#E9EEF6' : '#9CC965'}"/>` });
  } else layers.push({ kind: 'still', svg: render(ground) });

  // ---------- buildings, trees, plant ----------
  const things: Item[] = [];
  const top: string[] = [];
  const darkQuarter = (c: number, r: number): boolean => o.mood === 'noir' && c >= 3 && c - r >= 2;
  const flats = (c: number, r: number): { id: string; filters: string[] } => {
    const snow = winter ? '-neige' : '';
    if (darkQuarter(c, r)) return { id: `immeuble-coupure${snow}`, filters: ['light-n'] };
    if (darkNight) return { id: `immeuble-nuit${snow}`, filters: ['light-n'] };
    return { id: `immeuble-jour${snow}`, filters: L() };
  };
  const push = (id: string, x: number, y: number, size: number, filters: string[]): void => {
    const box = boxAt(id, x, y, size);
    if (box) things.push({ id, box, filters });
  };
  const trees = (c: number, r: number, spots: [number, number][]): void => {
    for (const [dx, dy] of spots) push('arbre', T * c + 4 + dx, T * r + 4 + dy, 0.24 + ((hash(c + dx, r + dy) % 3) * 0.03), L(['winter']));
  };
  /** The picture of a shop building on its plot. */
  function pictureBox(id: string): Box | null {
    const pl = PLOTS[id];
    if (!pl) return null;
    return boxAt(id, T * pl.c + 4, T * pl.r + 4, pl.size * (view === 'full' ? 1.15 : 1));
  }
  function hatBox(): Box | null {
    const b = pictureBox(HAT.on);
    const im = img.isolation;
    if (!b || !im) return null;
    const w = b.w * HAT.size;
    const h = (w * im.h) / im.w;
    return { x: b.x + b.w * HAT.x - w / 2, y: b.y + b.h * HAT.bottom - h, w, h };
  }
  const fresh: Item[] = [];
  /** Traffic of a road row: what moves along it, drawn between the rows behind and the rows in front. */
  const traffic = (r: number): string => {
    const items: Item[] = [];
    for (const m of TRAFFIC[r] ?? []) {
      const im = img[m.id];
      if (!im) continue;
      const y = T * r + m.lane;
      const x0 = m.dir === 1 ? STREET_X[0] : STREET_X[1];
      let box: Box | null;
      if (m.walker) {
        const [cx, cy] = P(x0, y);
        const w = (m.size * im.w) / im.h;
        box = { x: cx - w / 2, y: cy - m.size, w, h: m.size };
      } else box = boxAt(m.id, x0, y, m.size);
      if (!box) continue;
      const len = (STREET_X[1] - STREET_X[0]) * m.dir;
      const wrap = `class="iso-move" style="--tx:${f1(len * 0.866 * S)}px;--ty:${f1(len * 0.5 * S)}px;--dur:${m.dur}s;--d:${m.d}s"`;
      items.push({ id: m.id, box, mirror: m.walker ? m.dir === 1 : true, filters: L(), wrap });
    }
    return items.length ? render(items) : '';
  };
  let rowItems: Item[] = [];
  const flush = (): void => {
    if (rowItems.length) layers.push({ kind: 'still', svg: render(rowItems) });
    rowItems = [];
  };
  for (let r: number = ROWS[0]; r <= ROWS[1]; r++) {
    things.length = 0;
    for (let c: number = COLS[0]; c <= COLS[1]; c++) {
      const x = T * c + 4;
      const y = T * r + 4;
      const plot = plotAt(c, r);
      if (plot) {
        const box = o.upgrades.includes(plot) && img[plot] ? pictureBox(plot) : null;
        if (box) {
          const item = { id: plot, box, filters: L() };
          const hat = plot === HAT.on && o.upgrades.includes('isolation') ? hatBox() : null;
          const hatItem = hat ? { id: 'isolation', box: hat, filters: L() } : null;
          if (o.fresh === plot) { fresh.push(item); if (hatItem) fresh.push(hatItem); }
          else {
            things.push(item);
            if (hatItem) (o.fresh === 'isolation' ? fresh : things).push(hatItem);
          }
        }
        continue;
      }
      const thing = thingAt(c, r);
      switch (thing) {
        case null: break;
        case 'immeuble': { const f = flats(c, r); push(f.id, x, y, SIZE.immeuble, f.filters); break; }
        case 'arbres': trees(c, r, [[-2, -2], [2, -1.5], [-1.5, 2], [2.2, 2.2]]); break;
        case 'jeux':
          trees(c, r, [[-2.5, -2.5]]);
          push('balancoire', x + 1.5, y - 1.5, 0.45, L());
          push('enfants', x - 1, y + 1.5, 0.42, L());
          break;
        case 'tour': push(o.elecOn || o.heatOn ? 'tour-on' : 'tour-off', x, y, SIZE.tour, L()); break;
        default: push(thing, x, y, SIZE[thing], L());
      }
      // Street lights (Gemini lamp-post) at each crossroads once bought.
      if (o.upgrades.includes('eclairage') && isRoadCol(c) && isRoadRow(r)) push('lampadaire', T * c + 1, T * r + 1, 0.14, L());
      // Pylons of the power line along the road in front of row 5.
      if (r === 5) for (const px of PYLONS) if (Math.floor(px / T) === c) push('pylone', px, WIRE_Y, 0.36, L());
    }
    rowItems.push(...things);
    const moving = isRoadRow(r) ? traffic(r) : '';
    if (moving) {
      flush();
      layers.push({ kind: 'moving', svg: moving });
    }
  }
  things.length = 0;
  flush();

  // ---------- moving: the building just bought, flows, marks, snow, birds ----------
  if (fresh.length) top.push(`<g class="pop">${render(fresh)}</g>`);
  // Power line: thin wires between the pylons' tops; electricity flows along them while the plant produces.
  const tops = PYLONS.map((px) => { const b = boxAt('pylone', px, WIRE_Y, 0.36); return b ? [b.x + b.w / 2, b.y + b.h * 0.08] : null; }).filter((p): p is number[] => p !== null);
  if (tops.length > 1) {
    const pts = tops.map(([a, b]) => `${f1(a!)},${f1(b!)}`).join(' ');
    top.push(`<polyline points="${pts}" stroke="#4A5878" stroke-width="1.2" fill="none"/>`);
    if (o.elecOn) top.push(`<polyline class="flow" points="${pts}" stroke="#FFC83D" stroke-width="2.4" stroke-dasharray="3 12" fill="none" stroke-linecap="round"/>`);
  }
  // A quarter without electricity: the Gemini warning sign above it.
  if (o.mood === 'noir') {
    const b = boxAt('panneau-alerte', T * 8 + 4, T * 2 + 4, 0.5);
    if (b) top.push(`<g class="float">${render([{ id: 'panneau-alerte', box: { ...b, y: b.y - 90 }, filters: [] }])}</g>`);
  }
  // Building just bought: a bouncing yellow arrow and a glowing ring show where it is (R1-08).
  if (o.fresh) {
    // Cycle track and street lights: the arrow points at a road and at a crossroads of the main street.
    const spot = o.fresh === 'piste' ? tileCentre(6, 5) : o.fresh === 'eclairage' ? tileCentre(5, 5) : null;
    const b = o.fresh === 'isolation' ? hatBox() : spot ? { x: spot[0] - 50, y: spot[1] - 40, w: 100, h: 69 } : pictureBox(o.fresh);
    if (b) {
      const sx = b.x + b.w / 2;
      const sy = b.y + b.h - b.w * (o.fresh === 'isolation' ? 0.5 : 0.29);
      const ty = b.y + 18;
      const k = view === 'full' ? 2.6 : 1;
      const a = (v: number): string => f1(v * k);
      top.push(`<g class="pop"><ellipse class="mark-ring" cx="${f1(sx)}" cy="${f1(sy)}" rx="${a(58)}" ry="${a(30)}" fill="#FFE27A" fill-opacity="0.35" stroke="#FFC83D" stroke-width="${a(5)}"/>`
        + `<g class="mark-arrow"><path transform="translate(${f1(sx)} ${f1(ty)})" d="M${a(-18)} ${a(-92)} H${a(18)} V${a(-52)} H${a(34)} L0 ${a(-14)} L${a(-34)} ${a(-52)} H${a(-18)} Z" fill="#FFC83D" stroke="#1C2A4A" stroke-width="${a(5)}" stroke-linejoin="round"/></g></g>`);
    }
  }
  // Birds crossing the sky by day (Gemini picture).
  if (night < 0.5 && img.oiseaux) {
    const y0 = view === 'band' ? 230 : -60;
    top.push(`<g class="birds">${render([{ id: 'oiseaux', box: { x: -300, y: y0, w: 90, h: 72 }, filters: [] }])}</g>`);
  }
  if (winter) {
    top.push(Array.from({ length: view === 'band' ? 32 : 50 }, (_, k) => `<circle class="flake" cx="${f1(-400 + ((k * 197) % 2000))}" cy="${f1((view === 'band' ? 220 : -150) + ((k * 53) % 240))}" r="${f1(1.6 + (k % 3))}" fill="#FFFFFF" opacity="0.9" style="--d:${-((k * 13) % 11)}s;animation-duration:${8 + (k % 5)}s"/>`).join(''));
  }
  if (top.length) layers.push({ kind: 'moving', svg: top.join('') });
  return layers;
}

/** Where a tile's centre is on the screen (tests: what the band shows). */
export const tileCentre = (c: number, r: number): [number, number] => P(T * c + 4, T * r + 4);
