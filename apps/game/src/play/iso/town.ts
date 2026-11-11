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
   * Lot chosen by the child for each building (lot L9.4). Absent: every building on its default plot (PLOTS). Given:
   * a building without a lot here is not drawn (it is being placed).
   */
  places?: Places;
  /**
   * Pictures as data: URLs (they are painted into still pictures, which cannot load outside files): the town's
   * pictures (TOWN_IMAGES) and those of the shop buildings. What is not loaded yet is simply not drawn.
   */
  images?: Readonly<Record<string, TownImage>>;
  /** What the day's events show in the town (lot L7.1). */
  scene?: TownScene;
}

/** Events seen in the town: a dark quarter, the repair truck, a heat leak, a family arriving, a class visiting. */
export interface TownScene {
  cut?: number | null;
  truck?: number | null;
  leak?: boolean;
  family?: boolean;
  visit?: boolean;
}

/** Quarters of the town (engine's QUARTERS): the lots' columns of the left, centre and right blocks. */
export const QUARTER_COLS: readonly (readonly number[])[] = [[3, 4], [6, 7], [9, 10]];
/** Quarter of a shop building's lot (the hospital protects its own, lot L7.1), wherever the child put it (L9.4). */
export const quarterOf = (places?: Places) => (id: string): number | null => {
  const at = placeOf(id, places);
  if (!at) return null;
  const q = QUARTER_COLS.findIndex((cols) => cols.includes(at[0]));
  return q >= 0 ? q : null;
};

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
 * it is bought, then the same picture as in the shop. All plots stand in the lots seen in the band of the play screen,
 * except the heat station, on the plant's concrete.
 * Isolation is the woolly hat on the chimney of the Lilas house; the cycle track turns the roads into cycle-track
 * tiles; street lights are the Gemini lamp-post at the crossroads.
 */
export const PLOTS: Readonly<Record<string, { c: number; r: number; size: number }>> = {
  ferme: { c: 3, r: 3, size: 0.95 },
  // The heat station stands against the plant, by the fuel store, its pipes towards the town (Yann, 2026-11-10).
  'reseau-chaleur': { c: 1, r: 9, size: 0.95 },
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
/** Where each building stands: column and row of its lot (lot L9.4). */
export type Places = Readonly<Record<string, readonly [number, number]>>;
/** The heat station always stands against the plant; the other buildings with a plot go where the child wants. */
export const FIXED_PLOTS: readonly string[] = ['reseau-chaleur'];
export const PLACEABLE: readonly string[] = Object.keys(PLOTS).filter((id) => !FIXED_PLOTS.includes(id));

/**
 * Lots where the child builds (lot L9.4, « une ville plus vide, à construire »): 30 lawns. All the lots seen in the band
 * of the play screen (rows and columns adding up to 4 to 12) that hold no landmark, and 12 lots further down, seen in
 * the shop and the summary. The other lots keep the houses and flats of the town (back corner, landmarks).
 */
const FAR_LOTS = ['7,7', '9,6', '9,7', '10,3', '10,4', '10,6', '4,9', '6,9', '7,9', '3,10', '4,10', '6,10'];

/** Ring and arrow helpers need the lot's column and row: where a building stands now, or null. */
export function placeOf(id: string, places?: Places): readonly [number, number] | null {
  const pl = PLOTS[id];
  if (!pl) return null;
  if (!places || FIXED_PLOTS.includes(id)) return [pl.c, pl.r];
  return places[id] ?? null;
}

/** The woolly hat on its chimney (isolation) covers the chimney of the Lilas house: centre, bottom, width (shares). */
export const HAT = { on: 'maison-lilas', x: 0.69, bottom: 0.3, size: 0.3 } as const;
/** Grass tile, also the tile of the plots not bought yet. */
export const TILE = 'herbe';

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
/** Lots where the child may build (see FAR_LOTS). */
export const BUILD_LOTS: readonly (readonly [number, number])[] = (() => {
  const out: [number, number][] = [];
  for (let r: number = ROWS[0]; r <= ROWS[1]; r++) {
    for (let c = 3; c <= COLS[1]; c++) {
      if (!isLot(c, r) || PLACES[`${c},${r}`]) continue;
      if ((c + r >= 4 && c + r <= 12) || FAR_LOTS.includes(`${c},${r}`)) out.push([c, r]);
    }
  }
  return out;
})();
const BUILD_SET = new Set(BUILD_LOTS.map(([c, r]) => `${c},${r}`));
export const isBuildLot = (c: number, r: number): boolean => BUILD_SET.has(`${c},${r}`);

/** Lots still free for a new building. */
export function freeLots(places: Places): (readonly [number, number])[] {
  const used = new Set(Object.values(places).map(([c, r]) => `${c},${r}`));
  return BUILD_LOTS.filter(([c, r]) => !used.has(`${c},${r}`));
}

/**
 * Gives every building bought a lot (lot L9.4): its own lot if it is a free building lot, else its default plot (progress
 * saved before L9.4, review addresses) if free, else the first free lot. `pending` (being placed) gets none.
 */
export function settle(owned: readonly string[], places: Places, pending: string | null = null): Places {
  const out: Record<string, readonly [number, number]> = {};
  const used = new Set<string>();
  const take = (id: string, at: readonly [number, number]): boolean => {
    const k = `${at[0]},${at[1]}`;
    if (!isBuildLot(at[0], at[1]) || used.has(k)) return false;
    used.add(k);
    out[id] = [at[0], at[1]];
    return true;
  };
  const todo = owned.filter((id) => PLACEABLE.includes(id) && id !== pending);
  const left = todo.filter((id) => !(places[id] && take(id, places[id]!)));
  const still = left.filter((id) => !take(id, [PLOTS[id]!.c, PLOTS[id]!.r]));
  for (const id of still) {
    const lot = BUILD_LOTS.find(([c, r]) => !used.has(`${c},${r}`));
    if (lot) take(id, lot);
  }
  return out;
}

/** The four corners of a ground tile on the screen (lot L9.4: the lots the child can touch). */
export function tileCorners(c: number, r: number): [number, number][] {
  return [P(T * c, T * r), P(T * c + T, T * r), P(T * c + T, T * r + T), P(T * c, T * r + T)];
}

const FILL: Thing[] = [
  'immeuble', 'maisons', 'immeuble-moderne', 'arbres', 'immeuble-brique', 'maison-jardin', 'tour-bureaux', 'immeuble',
  'immeuble-rose', 'boulangerie', 'arbres', 'maisons',
];
const hash = (a: number, b: number): number => (((a + 7) * 73856093) ^ ((b + 3) * 19349663)) >>> 0;
const thingAt = (c: number, r: number): Thing | null => {
  const k = PLACES[`${c},${r}`];
  if (k) return k;
  if (PLANT_COLS.includes(c)) return (r === 4 || r === 10) ? 'arbres' : null;
  if (c < 0 || !isLot(c, r) || isBuildLot(c, r)) return null;
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
  'arriere-ville', 'herbe', 'route', 'carrefour', 'riviere', 'beton',
  'immeuble-jour', 'immeuble-jour-neige', 'immeuble-nuit', 'immeuble-nuit-neige', 'immeuble-coupure', 'immeuble-coupure-neige',
  'maisons', 'usine-2', 'usine-3', 'gare', 'reacteur', 'salle-machines', 'tour-on', 'tour-off', 'poste', 'pylone', 'pompage',
  'salle-commande', 'combustible', 'diesel', 'arbre', 'lampadaire', 'panneau-alerte', 'balancoire', 'enfants',
  'oiseau-bleu-haut', 'oiseau-bleu-bas', 'oiseau-jaune-haut', 'oiseau-jaune-bas',
  'immeuble-moderne', 'immeuble-brique', 'tour-bureaux', 'boulangerie', 'maison-jardin', 'immeuble-rose', 'piste',
  'voiture-rouge-avant', 'voiture-rouge-arriere', 'voiture-bleue-avant', 'voiture-bleue-arriere', 'bus',
  'habitant-adulte', 'habitant-enfant', 'famille-1', 'famille-2', 'camion-maintenance', 'fumee',
] as const;

/**
 * Countryside picture behind the town (1024 px square): centre of its dark green diamond (pixels) and the scale that
 * makes that diamond (541 px high) the town's lots, columns and rows 0 to 10 (1 056 drawing units high).
 */
const BACKDROP = { size: 1024, cx: 525.5, cy: 551.5, scale: (T * 11 * S) / 541 } as const;

/** The flock of birds (lot L9.3): colour, place in the flock, size, wing beat and wave periods (seconds). */
const FLOCK: readonly { color: 'bleu' | 'jaune'; dx: number; dy: number; size: number; flap: number; wave: number }[] = [
  { color: 'bleu', dx: 0, dy: 0, size: 1.1, flap: 0.46, wave: 3.1 },
  { color: 'jaune', dx: 38, dy: -16, size: 0.95, flap: 0.4, wave: 2.6 },
  { color: 'jaune', dx: 44, dy: 18, size: 0.9, flap: 0.43, wave: 3.4 },
  { color: 'bleu', dx: 82, dy: -4, size: 0.85, flap: 0.5, wave: 2.9 },
];

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
    // A quarter without electricity (lot L7.1): darker and bluer, whatever the hour.
    dark: '0.42 0 0 0 0.03 0 0.42 0 0 0.05 0 0 0.48 0 0.12 0 0 0 1 0',
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
  // Countryside around the town (lot L9.3, Yann's picture asset_67): its dark green diamond lies under the town's lots,
  // its river goes on from the town's river; its sky is cut out, so the game's sky shows above the hills.
  if (img['arriere-ville']) {
    const [cx, cy] = P(T * 5.5, T * 5.5);
    const size = BACKDROP.size * BACKDROP.scale;
    const x = cx - BACKDROP.cx * BACKDROP.scale;
    const y = cy - BACKDROP.cy * BACKDROP.scale;
    ground.push({ id: 'arriere-ville', box: { x, y, w: size, h: size }, filters: L(['winter']) });
    // Below it, the same picture upside down: its pale bottom edge goes on, so a tall panel never shows the sky under
    // the ground (seen at night in the summary).
    ground.push({ id: 'arriere-ville', box: { x, y: y + 2 * size, w: size, h: -size }, filters: L(['winter']) });
  }
  // Lot of each building bought (lot L9.4): where the child put it, or its default plot.
  const builtAt = new Map<string, string>();
  for (const id of o.upgrades) {
    const at = placeOf(id, o.places);
    if (at) builtAt.set(`${at[0]},${at[1]}`, id);
  }
  const heatPlot = (c: number, r: number): boolean => PLOTS['reseau-chaleur']!.c === c && PLOTS['reseau-chaleur']!.r === r;
  const tileOf = (c: number, r: number): { id: string; mirror?: boolean; winter?: boolean } => {
    if (c === -1) return { id: 'riviere' };
    if (c < 0) return { id: 'herbe', winter: true };
    if (PLANT_COLS.includes(c)) return r >= 5 && r <= 9 ? { id: 'beton' } : { id: 'herbe', winter: true };
    if (isRoadCol(c) && isRoadRow(r)) return { id: 'carrefour' };
    if (isRoadCol(c)) return { id: 'route', mirror: true };
    if (isRoadRow(r)) return o.upgrades.includes('piste') && img.piste ? { id: 'piste' } : { id: 'route' };
    const thing = thingAt(c, r);
    return thing === 'arbres' || thing === 'jeux' || isBuildLot(c, r) || heatPlot(c, r) ? { id: 'herbe', winter: true } : { id: 'beton' };
  };
  for (let s = COLS[0] + ROWS[0]; s <= COLS[1] + ROWS[1]; s++) {
    for (let c: number = COLS[0]; c <= COLS[1]; c++) {
      const r = s - c;
      if (r < ROWS[0] || r > ROWS[1]) continue;
      // The strip of grass beyond the river: the countryside picture already has it (lot L9.3).
      if (c < -1 && img['arriere-ville']) continue;
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
  const scene = o.scene ?? {};
  const cutCols = scene.cut !== undefined && scene.cut !== null ? QUARTER_COLS[scene.cut] ?? [] : [];
  const darkQuarter = (c: number, r: number): boolean => cutCols.includes(c) || (o.mood === 'noir' && c >= 3 && c - r >= 2);
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
  /** The picture of a shop building on its lot. */
  function pictureBox(id: string): Box | null {
    const pl = PLOTS[id];
    const at = placeOf(id, o.places);
    if (!pl || !at) return null;
    return boxAt(id, T * at[0] + 4, T * at[1] + 4, pl.size * (view === 'full' ? 1.15 : 1));
  }
  function hatBox(): Box | null {
    const b = pictureBox(HAT.on);
    const im = img.isolation;
    if (!b || !im) return null;
    const w = b.w * HAT.size;
    const h = (w * im.h) / im.w;
    return { x: b.x + b.w * HAT.x - w / 2, y: b.y + b.h * HAT.bottom - h, w, h };
  }
  /** Ring and arrow around the building just bought (R1-08). */
  function freshMark(): { ring: string; arrow: string } | null {
    if (!o.fresh) return null;
    // Cycle track and street lights: the arrow points at a road and at a crossroads of the main street.
    const spot = o.fresh === 'piste' ? tileCentre(6, 5) : o.fresh === 'eclairage' ? tileCentre(5, 5) : null;
    const b = o.fresh === 'isolation' ? hatBox() : spot ? { x: spot[0] - 50, y: spot[1] - 40, w: 100, h: 69 } : pictureBox(o.fresh);
    if (!b) return null;
    const sx = b.x + b.w / 2;
    const sy = b.y + b.h - b.w * (o.fresh === 'isolation' ? 0.5 : 0.29);
    const ty = b.y + 18;
    const k = view === 'full' ? 2.6 : 1;
    const a = (v: number): string => f1(v * k);
    return {
      ring: `<ellipse class="mark-ring" cx="${f1(sx)}" cy="${f1(sy)}" rx="${a(58)}" ry="${a(30)}" fill="#FFE27A" fill-opacity="0.35" stroke="#FFC83D" stroke-width="${a(5)}"/>`,
      arrow: `<g class="mark-arrow"><path transform="translate(${f1(sx)} ${f1(ty)})" d="M${a(-18)} ${a(-92)} H${a(18)} V${a(-52)} H${a(34)} L0 ${a(-14)} L${a(-34)} ${a(-52)} H${a(-18)} Z" fill="#FFC83D" stroke="#1C2A4A" stroke-width="${a(5)}" stroke-linejoin="round"/></g>`,
    };
  }
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
      // Everything of a cut quarter goes dark (lot L7.1).
      const first = things.length;
      const dim = (): void => { if (cutCols.includes(c)) for (let k = first; k < things.length; k++) things[k]!.filters = [...things[k]!.filters, 'dark']; };
      const plot = builtAt.get(`${c},${r}`);
      if (!plot && (isBuildLot(c, r) || heatPlot(c, r))) { dim(); continue; }
      if (plot) {
        const box = o.upgrades.includes(plot) && img[plot] ? pictureBox(plot) : null;
        if (box) {
          const item = { id: plot, box, filters: L() };
          const hat = plot === HAT.on && o.upgrades.includes('isolation') ? hatBox() : null;
          const hatItem = hat ? { id: 'isolation', box: hat, filters: L() } : null;
          // The building just bought pops in at its own depth, not over the whole town (lot L9.3): the pictures
          // behind it are flushed first, it gets its own moving layer, and what stands in front is drawn after it.
          const popping = o.fresh === plot ? [item, ...(hatItem ? [hatItem] : [])] : hatItem && o.fresh === 'isolation' ? [hatItem] : [];
          if (o.fresh !== plot) things.push(item);
          if (hatItem && o.fresh !== plot && o.fresh !== 'isolation') things.push(hatItem);
          dim();
          if (popping.length) {
            if (cutCols.includes(c)) for (const it of popping) it.filters = [...it.filters, 'dark'];
            rowItems.push(...things);
            things.length = 0;
            flush();
            layers.push({ kind: 'moving', svg: `<g class="pop">${o.fresh === plot ? freshMark()?.ring ?? '' : ''}${render(popping)}</g>` });
          }
          continue;
        }
        dim();
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
      dim();
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

  // ---------- moving: flows, marks, snow, birds (the building just bought pops in at its own depth) ----------
  // Power line: thin wires between the pylons' tops; electricity flows along them while the plant produces.
  const tops = PYLONS.map((px) => { const b = boxAt('pylone', px, WIRE_Y, 0.36); return b ? [b.x + b.w / 2, b.y + b.h * 0.08] : null; }).filter((p): p is number[] => p !== null);
  if (tops.length > 1) {
    const pts = tops.map(([a, b]) => `${f1(a!)},${f1(b!)}`).join(' ');
    top.push(`<polyline points="${pts}" stroke="#4A5878" stroke-width="1.2" fill="none"/>`);
    if (o.elecOn) top.push(`<polyline class="flow" points="${pts}" stroke="#FFC83D" stroke-width="2.4" stroke-dasharray="3 12" fill="none" stroke-linecap="round"/>`);
  }
  // Events (lot L7.1): warning sign above a cut quarter, repair truck in front of it, smoke of a heat leak, a family
  // arriving, a class visiting the plant.
  const sceneItems: Item[] = [];
  const at = (id: string, wx: number, wy: number, size: number, lift = 0, mirror = false): void => {
    const b = boxAt(id, wx, wy, size);
    if (b) sceneItems.push({ id, box: { ...b, y: b.y - lift }, mirror, filters: L() });
  };
  if (cutCols.length) at('panneau-alerte', T * (cutCols[0]! + 1), T * 4, 0.42, 120);
  if (scene.truck !== undefined && scene.truck !== null) {
    const cols = QUARTER_COLS[scene.truck] ?? [];
    // On the street above the quarter (row 2), which the band of the play screen always shows.
    if (cols.length) at('camion-maintenance', T * cols[0]! + 6, T * 2 + 5, 0.34, 0, true);
  }
  if (scene.leak) {
    const pl = o.upgrades.includes('reseau-chaleur') ? PLOTS['reseau-chaleur'] : null;
    if (pl) at('fumee', T * pl.c + 4, T * pl.r + 4, 0.35, 40); else at('fumee', T * 1 + 4, T * 8 + 4, 0.35, 60);
  }
  if (scene.family) at('famille-1', T * 5 + 6, T * 4 + 7, 0.26);
  if (scene.visit) at('enfants', T * 2 + 3, T * 7 + 4, 0.3);
  if (sceneItems.length) top.push(`<g class="float">${render(sceneItems)}</g>`);
  // A quarter without electricity: the Gemini warning sign above it.
  if (o.mood === 'noir' && !cutCols.length) {
    const b = boxAt('panneau-alerte', T * 8 + 4, T * 2 + 4, 0.5);
    if (b) top.push(`<g class="float">${render([{ id: 'panneau-alerte', box: { ...b, y: b.y - 90 }, filters: [] }])}</g>`);
  }
  // Building just bought: a bouncing yellow arrow shows where it is (R1-08), above everything; its glowing ring lies on
  // the ground, under the building, except for the cycle track, the street lights and the hat (no plot of their own).
  const mark = freshMark();
  if (mark) top.push(`<g class="pop">${PLOTS[o.fresh!] ? '' : mark.ring}${mark.arrow}</g>`);
  // Birds crossing the sky by day (lot L9.3): a small flock, all heading left (the way they look), each bird beating
  // its wings (two pictures, wings up and down) and rising and falling on its own wave. Cut from the Gemini picture.
  if (night < 0.5) {
    const y0 = view === 'band' ? 262 : -20;
    const x0 = view === 'band' ? 1500 : 1700;
    const birds = FLOCK.map((b, k) => {
      const up = `oiseau-${b.color}-haut`;
      const down = `oiseau-${b.color}-bas`;
      const im = img[up];
      if (!im || !img[down]) return '';
      const w = 30 * b.size * (view === 'full' ? 1.6 : 1);
      const box = { x: x0 + b.dx * (view === 'full' ? 1.6 : 1), y: y0 + b.dy * (view === 'full' ? 1.6 : 1), w, h: (w * im.h) / im.w };
      const flap = `style="--flap:${b.flap}s;--d:${-k * 0.13}s"`;
      return `<g class="bird-wave" style="--wave:${b.wave}s;--d:${-k * 0.7}s">${render([
        { id: up, box, filters: [], wrap: `class="flap-up" ${flap}` },
        { id: down, box, filters: [], wrap: `class="flap-down" ${flap}` },
      ])}</g>`;
    }).join('');
    if (birds) top.push(`<g class="birds">${birds}</g>`);
  }
  if (winter) {
    top.push(Array.from({ length: view === 'band' ? 32 : 50 }, (_, k) => `<circle class="flake" cx="${f1(-400 + ((k * 197) % 2000))}" cy="${f1((view === 'band' ? 220 : -150) + ((k * 53) % 240))}" r="${f1(1.6 + (k % 3))}" fill="#FFFFFF" opacity="0.9" style="--d:${-((k * 13) % 11)}s;animation-duration:${8 + (k % 5)}s"/>`).join(''));
  }
  if (top.length) layers.push({ kind: 'moving', svg: top.join('') });
  return layers;
}

/** Where a tile's centre is on the screen (tests: what the band shows). */
export const tileCentre = (c: number, r: number): [number, number] => P(T * c + 4, T * r + 4);
