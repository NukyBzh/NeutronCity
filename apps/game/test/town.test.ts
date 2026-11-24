import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { validateShop } from '@neutron/engine';
import {
  BAND_VIEWBOX, BUILD_LOTS, FULL_VIEWBOX, HAT, PLACEABLE, PLOTS, TOWN_IMAGES, drawTown, drawTownLayers, freeLots, isBuildLot, isLot,
  lightKey, pictureOf, quarterOf,
  settle, tileCentre, tileCorners, type Places, type TownImage, type TownOptions,
} from '../src/play/iso/town';
import { skyColours } from '../src/play/iso/Sky';

const SHOP = validateShop(parse(readFileSync(fileURLToPath(new URL('../../../content/shop/shop.yaml', import.meta.url)), 'utf8')));
/** Shop buildings without a plot: the cycle track changes the roads, the street lights stand at the crossroads. */
const NO_PLOT = ['piste', 'eclairage'];
const ALL = SHOP.map((i) => i.id);
const pic = (id: string): TownImage => ({ href: `data:image/webp;base64,${id}`, w: 100, h: 90 });
const IMAGES: Record<string, TownImage> = Object.fromEntries(
  [...TOWN_IMAGES, ...ALL].map((id) => [id, pic(id)]),
);
const opts = (o: Partial<TownOptions> = {}): TownOptions => ({ hour: 14, season: 'ete', mood: 'content', elecOn: true, heatOn: false, upgrades: ALL, images: IMAGES, ...o });
const town = (o: Partial<TownOptions> = {}, view: 'band' | 'full' = 'band') => drawTown(opts(o), view);
const still = (o: Partial<TownOptions> = {}, view: 'band' | 'full' = 'band') => drawTownLayers(opts(o), view).filter((l) => l.kind === 'still').map((l) => l.svg).join('');
const moving = (o: Partial<TownOptions> = {}, view: 'band' | 'full' = 'band') => drawTownLayers(opts(o), view).filter((l) => l.kind === 'moving').map((l) => l.svg).join('');
const uses = (svg: string, id: string): number => svg.split(`href="#p-${id}"`).length - 1;

describe('the town is made of pictures (lot L6.3)', () => {
  it('no drawn building, vehicle or object: only Gemini pictures placed on tiles', () => {
    for (const view of ['band', 'full'] as const) {
      for (const o of [{}, { hour: 22, season: 'hiver' as const, mood: 'noir' as const }, { upgrades: [] }]) {
        const s = still(o, view);
        expect(s).not.toMatch(/<(polygon|rect|path|circle|ellipse|line|polyline)\b/);
        expect(s).not.toMatch(/<image href="(?!data:)/);
        expect(uses(s, 'herbe')).toBeGreaterThan(10);
        for (const id of ['route', 'carrefour', 'riviere', 'reacteur', 'immeuble-jour', 'maisons', 'arbre']) {
          if (!(o as Partial<TownOptions>).season) expect(s, id).toContain(`href="#p-${id}"`);
        }
      }
    }
  });

  it('each picture is defined once per layer and placed with <use>', () => {
    const s = still({}, 'full');
    const defs = s.match(/<image id="p-[^"]+"/g) ?? [];
    const layers = drawTownLayers(opts(), 'full').filter((l) => l.kind === 'still').length;
    expect(defs.length).toBeLessThanOrEqual((TOWN_IMAGES.length + ALL.length) * layers);
    expect(uses(s, 'herbe') + uses(s, 'beton') + uses(s, 'route')).toBeGreaterThan(60);
  });

  it('the flats light their windows at night, take the snow in winter and go dark in a quarter without electricity', () => {
    expect(still({ hour: 13 })).toContain('#p-immeuble-jour"');
    expect(still({ hour: 23 })).toContain('#p-immeuble-nuit"');
    expect(still({ hour: 13, season: 'hiver' })).toContain('#p-immeuble-jour-neige"');
    expect(still({ hour: 23, season: 'hiver' })).toContain('#p-immeuble-nuit-neige"');
    expect(still({ hour: 23, mood: 'noir' })).toContain('#p-immeuble-coupure"');
    expect(moving({ mood: 'noir' })).toContain('#p-panneau-alerte');
  });

  it('pictures take the evening and night light; the cooling tower steams only while the plant works', () => {
    expect(still({ hour: 13 })).not.toContain('feColorMatrix');
    expect(still({ hour: 23 })).toContain('filter="url(#f-light)"');
    expect(still({ hour: 13, season: 'hiver' })).toContain('filter="url(#f-winter)"');
    expect(still({ elecOn: true })).toContain('#p-tour-on"');
    expect(still({ elecOn: false, heatOn: false })).toContain('#p-tour-off"');
  });

  it('cars, a bus and inhabitants go along the streets, between the rows of buildings (series 3)', () => {
    const layers = drawTownLayers(opts(), 'band');
    const traffic = layers.map((l, k) => (l.kind === 'moving' && l.svg.includes('iso-move') && !l.frame ? k : -1)).filter((k) => k >= 0);
    expect(traffic.length).toBe(3);
    // Each street's traffic has still rows after it, which hide it behind the buildings in front.
    expect(layers.slice(traffic[0]! + 1).some((l) => l.kind === 'still')).toBe(true);
    const rows = traffic.map((k) => layers[k]!.svg).join('');
    for (const id of ['voiture-rouge-avant', 'voiture-bleue-arriere', 'bus', 'habitant-adulte', 'famille-1']) expect(rows, id).toContain(`#p-${id}"`);
    // Every move of a street goes along it (x of the world: right-down or left-up on the screen).
    for (const [, tx, ty] of rows.matchAll(/--tx:(-?[\d.]+)px;--ty:(-?[\d.]+)px/g)) expect(Number(ty) / Number(tx)).toBeCloseTo(0.5 / 0.866, 2);
  });

  it('in each street, the back pavement is drawn first, then the lanes, then the front pavement (R2-04)', () => {
    for (const l of drawTownLayers(opts(), 'band').filter((x) => x.kind === 'moving' && x.svg.includes('iso-move') && !x.frame)) {
      const ys = [...l.svg.matchAll(/<use href="#p-[^"]+" transform="translate\((-?[\d.]+) (-?[\d.]+)\) scale\((-?[\d.]+) (-?[\d.]+)\)"/g)];
      expect(ys.length).toBeGreaterThan(1);
    }
    // Row 5 lists a walker of the back pavement last: it must now come first.
    const row5 = drawTownLayers(opts(), 'band').filter((x) => x.kind === 'moving' && x.svg.includes('famille-1'))[0]!.svg;
    const body = row5.slice(row5.indexOf('</defs>'));
    expect(body.indexOf('#p-habitant-adulte"')).toBeLessThan(body.indexOf('#p-voiture-rouge-avant"'));
    expect(body.indexOf('#p-famille-1"')).toBeGreaterThan(body.indexOf('#p-bus"'));
  });

  it('cars also go along the cross streets, with the pictures in front of them drawn again over them (R2-04, L10.3)', () => {
    const layers = drawTownLayers(opts(), 'band');
    const cross = layers.map((l, k) => ({ l, k })).filter(({ l }) => l.kind === 'moving' && l.frame !== undefined);
    expect(cross.length).toBe(3);
    for (const { l, k } of cross) {
      expect(l.svg).toContain('iso-move');
      for (const [, tx, ty] of l.svg.matchAll(/--tx:(-?[\d.]+)px;--ty:(-?[\d.]+)px/g)) expect(Number(ty) / Number(tx)).toBeCloseTo(-0.5 / 0.866, 2);
      // Right after it: a still layer on the same frame, the pictures in front of the street.
      const over = layers[k + 1]!;
      expect(over.kind).toBe('still');
      expect(over.over).toBe(true);
      expect(over.frame).toEqual(l.frame);
      expect(over.svg).not.toContain('iso-move');
      // Framed on the street: much smaller than the whole drawing.
      expect(l.frame!.w * l.frame!.h).toBeLessThan(1960 * 1300 * 0.4);
    }
    // The street by the plant: the plant (to its left, behind) is not drawn again, the town to its right is.
    const byPlant = layers[cross[0]!.k + 1]!.svg;
    expect(byPlant).not.toContain('#p-reacteur"');
    expect(byPlant).toMatch(/#p-(immeuble|maisons|arbre|gare)/);
  });

  it('the cycle track turns the streets into cycle-track tiles', () => {
    expect(still({ upgrades: [] })).not.toContain('#p-piste"');
    expect(still({ upgrades: ['piste'] })).toContain('#p-piste"');
  });

  it('street lights are the Gemini lamp-post, at the crossroads once bought', () => {
    expect(still({ upgrades: [] })).not.toContain('#p-lampadaire');
    expect(still({ upgrades: ['eclairage'] })).toContain('#p-lampadaire');
  });

  it('R1-03: bought buildings do not replay their "appear" animation at each redraw', () => {
    for (const view of ['band', 'full'] as const) {
      expect(town({}, view)).not.toContain('class="pop"');
      expect(town({ mood: 'noir', hour: 22 }, view)).not.toContain('class="pop"');
    }
  });

  it('the drawing only changes when the light changes (not every game minute)', () => {
    expect(lightKey(9)).toBe(lightKey(16.5));
    expect(lightKey(18)).not.toBe(lightKey(20));
    const keys = new Set(Array.from({ length: 18 * 12 }, (_, k) => lightKey(6 + k / 12)));
    expect(keys.size).toBeLessThanOrEqual(24);
  });
});

describe('sky (R1-11, R1-12)', () => {
  it('blue by day, warm at sunset, dark at night', () => {
    const lum = (c: string) => [1, 3, 5].reduce((a, i) => a + parseInt(c.slice(i, i + 2), 16), 0);
    const [dayTop] = skyColours(13);
    const [, sunsetLow] = skyColours(19.5);
    const [nightTop] = skyColours(23);
    expect(parseInt(dayTop.slice(5, 7), 16)).toBeGreaterThan(parseInt(dayTop.slice(1, 3), 16));
    expect(parseInt(sunsetLow.slice(1, 3), 16)).toBeGreaterThan(parseInt(sunsetLow.slice(5, 7), 16));
    expect(lum(nightTop)).toBeLessThan(lum(dayTop) / 3);
  });
});

describe('shop buildings in the town (lots L6.2, L6.3)', () => {
  it('every building with a picture has its own plot, well inside the town the player sees', () => {
    const withPicture = ALL.filter((id) => !NO_PLOT.includes(id) && id !== 'isolation');
    expect(Object.keys(PLOTS).sort()).toEqual([...withPicture].sort());
    const cells = Object.values(PLOTS).map((p) => `${p.c},${p.r}`);
    expect(new Set(cells).size).toBe(cells.length);
    // Since lot L10.3 (D-31) the play screen shows the whole town: the band is not used by any screen any more.
    const [bx, by, bw, bh] = FULL_VIEWBOX.split(' ').map(Number) as [number, number, number, number];
    for (const [id, p] of Object.entries(PLOTS)) {
      expect(isLot(p.c, p.r) || (id === 'reseau-chaleur' && p.c === 1), id).toBe(true);
      const [x, y] = tileCentre(p.c, p.r);
      expect(x, id).toBeGreaterThan(bx + 80);
      expect(x, id).toBeLessThan(bx + bw - 80);
      expect(y, id).toBeGreaterThan(by + 60);
      expect(y, id).toBeLessThan(by + bh - 20);
    }
    // The hat goes on the Lilas house, always bought before isolation opens.
    expect(SHOP.find((i) => i.id === HAT.on)!.discovery).toBeDefined();
    expect(SHOP.find((i) => i.id === 'isolation')!.unlockAt).toBeGreaterThanOrEqual(8);
  });

  it('a grass tile before the purchase, the same picture as in the shop after it', () => {
    for (const view of ['band', 'full'] as const) {
      const none = still({ upgrades: [] }, view);
      for (const id of Object.keys(PLOTS)) expect(none, id).not.toContain(`#p-${id}"`);
      const all = still({}, view);
      for (const id of [...Object.keys(PLOTS), 'isolation']) expect(all, id).toContain(`href="#p-${id}"`);
      expect(uses(none, 'herbe')).toBeGreaterThan(uses(all, 'herbe') - 1);
    }
    expect(still({ upgrades: ['ferme'] })).toContain('#p-ferme"');
    expect(still({ upgrades: ['ferme'] })).not.toContain('#p-ecole"');
  });

  it('a building bought whose picture is not loaded yet keeps its grass tile (no broken picture)', () => {
    const { ferme: _f, ...rest } = IMAGES;
    expect(still({ upgrades: ['ferme'], images: rest })).not.toContain('#p-ferme');
  });

  it('the building just bought arrives with its animation and the arrow, in a moving layer', () => {
    for (const id of NO_PLOT) expect(moving({ fresh: id }, 'full'), id).toContain('mark-arrow');
    for (const id of [...Object.keys(PLOTS), 'isolation']) {
      const m = moving({ fresh: id }, 'full');
      expect(m, id).toContain('<g class="pop">');
      expect(m, id).toContain(`#p-${id}"`);
      expect(still({ fresh: id }, 'full'), id).not.toContain(`href="#p-${id}"`);
      expect(m, id).toContain('mark-arrow');
    }
    expect(town({}, 'full')).not.toContain('mark-arrow');
  });
});

describe('the child chooses where to build (lot L9.4)', () => {
  it('30 lawns to build on, all of them lots, the default plots among them', () => {
    expect(BUILD_LOTS).toHaveLength(30);
    expect(new Set(BUILD_LOTS.map(([c, r]) => `${c},${r}`)).size).toBe(30);
    for (const [c, r] of BUILD_LOTS) expect(isLot(c, r), `${c},${r}`).toBe(true);
    for (const id of PLACEABLE) expect(isBuildLot(PLOTS[id]!.c, PLOTS[id]!.r), id).toBe(true);
    expect(PLACEABLE).not.toContain('reseau-chaleur');
    expect(PLACEABLE.length).toBeLessThan(BUILD_LOTS.length);
    // Most of them are seen in the band of the play screen.
    const [, by, , bh] = BAND_VIEWBOX.split(' ').map(Number) as [number, number, number, number];
    expect(BUILD_LOTS.filter(([c, r]) => { const y = tileCentre(c, r)[1]; return y > by + 40 && y < by + bh; }).length).toBeGreaterThanOrEqual(16);
  });

  it('settles every building on a lot of its own: kept, else its default plot, else the first free lot', () => {
    expect(settle(['parc', 'piste'], {})).toEqual({ parc: [PLOTS.parc!.c, PLOTS.parc!.r] });
    expect(settle(['parc'], { parc: [9, 6] })).toEqual({ parc: [9, 6] });
    // Not a building lot, or a lot already taken: back to a free lot.
    const s = settle(['parc', 'ecole'], { parc: [9, 0], ecole: [PLOTS.parc!.c, PLOTS.parc!.r] });
    expect(s.ecole).toEqual([PLOTS.parc!.c, PLOTS.parc!.r]);
    // The park's lot is not a building lot (a landmark): it goes to a free lot.
    expect(isBuildLot(...(s.parc as [number, number]))).toBe(true);
    expect(`${s.parc}`).not.toBe(`${s.ecole}`);
    // The building being placed gets no lot, and the free lots leave out those taken.
    expect(settle(['parc', 'ecole'], {}, 'ecole')).not.toHaveProperty('ecole');
    expect(freeLots({ parc: [9, 6] })).toHaveLength(29);
  });

  it('draws a building on the lot chosen, and a lawn on its default plot', () => {
    const at = (svg: string, id: string): string => { const k = svg.indexOf(`href="#p-${id}" transform="`); return k < 0 ? '' : svg.slice(k, svg.indexOf('"/>', k)); };
    const base = still({ upgrades: ['parc'] }, 'full');
    const moved = still({ upgrades: ['parc'], places: { parc: [9, 6] } }, 'full');
    expect(at(moved, 'parc')).not.toBe('');
    expect(at(moved, 'parc')).not.toBe(at(base, 'parc'));
    // Being placed: not drawn at all.
    expect(still({ upgrades: ['parc'], places: {} }, 'full')).not.toContain('#p-parc"');
    // The heat station always stands by the plant.
    expect(still({ upgrades: ['reseau-chaleur'], places: {} }, 'full')).toContain('#p-reseau-chaleur"');
  });

  it('the hospital protects the quarter where the child put it', () => {
    expect(quarterOf({ hopital: [3, 6] })('hopital')).toBe(0);
    expect(quarterOf({ hopital: [10, 3] })('hopital')).toBe(2);
    expect(quarterOf({})('hopital')).toBeNull();
    expect(quarterOf()('hopital')).toBe(1);
  });

  it('a lot to touch is a diamond on its tile', () => {
    const [top, right, bottom, left] = tileCorners(4, 6);
    expect(top![1]).toBeLessThan(bottom![1]);
    expect(left![0]).toBeLessThan(right![0]);
    const [cx, cy] = tileCentre(4, 6);
    expect((top![0] + bottom![0]) / 2).toBeCloseTo(cx, 0);
    expect((top![1] + bottom![1]) / 2).toBeCloseTo(cy, 0);
  });
});

describe('fixes of lot L9.3', () => {
  it('the building just bought pops in at its own depth: pictures in front of it are drawn after it', () => {
    const layers = drawTownLayers(opts({ upgrades: ['maison-ve', 'maison-lilas'], fresh: 'maison-ve' }), 'full');
    const ve = layers.findIndex((l) => l.svg.includes('<g class="pop">') && l.svg.includes('#p-maison-ve"'));
    const lilas = layers.findIndex((l) => l.svg.includes('#p-maison-lilas"'));
    expect(ve).toBeGreaterThanOrEqual(0);
    expect(lilas).toBeGreaterThan(ve);
  });

  it('a flock of birds by day, each beating its wings, all heading the same way; none at night', () => {
    const day = moving({ hour: 11 }, 'band');
    expect(day.split('class="bird-wave"').length - 1).toBe(4);
    expect(day.split('class="flap-up"').length - 1).toBe(4);
    expect(day.split('class="flap-down"').length - 1).toBe(4);
    expect(day).not.toMatch(/oiseau-[a-z]+-(haut|bas)" transform="translate\([^)]*\) scale\(-/);
    expect(moving({ hour: 23 }, 'band')).not.toContain('bird-wave');
  });
});

describe('countryside behind the town (lot L9.3)', () => {
  it('is the first picture of the ground, under every tile, and takes the light of the hour', () => {
    for (const view of ['band', 'full'] as const) {
      const ground = drawTownLayers(opts(), view)[0]!.svg;
      const body = ground.slice(ground.indexOf('</defs>'));
      expect(body.indexOf('#p-arriere-ville"')).toBeGreaterThan(-1);
      expect(body.indexOf('#p-arriere-ville"')).toBeLessThan(body.indexOf('#p-herbe"'));
    }
    expect(drawTownLayers(opts({ hour: 23 }), 'full')[0]!.svg).toContain('filter="url(#f-light)"');
    const { 'arriere-ville': _a, ...rest } = IMAGES;
    expect(drawTownLayers(opts({ images: rest }), 'full')[0]!.svg).not.toContain('arriere-ville');
  });
});

describe('the town sleeps at night (R2-02)', () => {
  it('« ZzZ » rise above a few homes from 23 h to 5 h only, drawn with paths, never in a still layer', () => {
    const count = (h: number): number => moving({ hour: h }, 'full').split('class="sleeper"').length - 1;
    expect(count(23.5)).toBeGreaterThan(0);
    expect(count(23.5)).toBeLessThanOrEqual(6);
    expect(count(2)).toBe(count(23.5));
    expect(count(21)).toBe(0);
    expect(count(12)).toBe(0);
    expect(still({ hour: 23.5 }, 'full')).not.toContain('zzz');
    expect(moving({ hour: 23.5 }, 'full')).not.toMatch(/<text\b/);
    expect(lightKey(22.9)).not.toBe(lightKey(23.1));
  });
});

describe('the town during an event (lot L10.4, R2-01)', () => {
  it('a demand peak lights every window of the flats, even by day, without touching the houses', () => {
    const day = still({ hour: 18 }, 'full');
    const peak = still({ hour: 18, scene: { lit: true } }, 'full');
    expect(day).toContain('#p-immeuble-jour"');
    expect(peak).toContain('#p-immeuble-nuit"');
    expect(peak).not.toContain('#p-immeuble-jour"');
    expect(uses(peak, 'maisons')).toBe(uses(day, 'maisons'));
    // In winter, the lit picture with snow; in a quarter without electricity, the dark one wins.
    expect(still({ hour: 18, season: 'hiver', scene: { lit: true } }, 'full')).toContain('#p-immeuble-nuit-neige"');
    expect(still({ hour: 18, scene: { lit: true, cut: 0 } }, 'full')).toContain('#p-immeuble-coupure"');
  });

  it('a mild spell melts the snow: half as many flakes, and only in winter', () => {
    const flakes = (o: Partial<TownOptions>): number => moving({ season: 'hiver', ...o }, 'full').split('class="flake"').length - 1;
    expect(flakes({})).toBe(50);
    expect(flakes({ scene: { melt: true } })).toBe(25);
    expect(moving({ season: 'ete', scene: { melt: true } }, 'full')).not.toContain('class="flake"');
  });

  it('the pictures of the town are not redrawn by an event painted over them (lot L10.3, fluidity)', () => {
    // Only `lit` and `melt` change a picture: the veils, the rain and the fireworks are layers over the town.
    const quiet = still({ hour: 11 }, 'full');
    for (const scene of [{ leak: true }, { family: true }, { visit: true }]) {
      expect(still({ hour: 11, scene }, 'full')).toBe(quiet);
    }
  });
});

describe('the pictures of the events in the town (lot L10.4, R2-01)', () => {
  it('the party gathers a crowd on the square, under the garlands', () => {
    const quiet = moving({}, 'full');
    const party = moving({ scene: { party: true } }, 'full');
    expect(quiet).not.toContain('#p-foule-fete');
    expect(party).toContain('#p-foule-fete');
    expect(party).toContain('#p-guirlandes');
    // On the crossroads in the middle of the town, where no building ever stands.
    const [cx, cy] = tileCentre(5, 5);
    const place = party.match(/#p-foule-fete" transform="translate\(([-\d.]+) ([-\d.]+)\)/);
    expect(place).not.toBeNull();
    expect(Number(place![1])).toBeGreaterThan(cx - 200);
    expect(Number(place![1])).toBeLessThan(cx + 200);
    expect(Number(place![2])).toBeLessThan(cy);
  });

  it('the squirrel sits on a pylon, a different one for each quarter', () => {
    const where = (q: number): number => {
      const m = moving({ scene: { squirrel: q, cut: q } }, 'full').match(/#p-ecureuil" transform="translate\(([-\d.]+)/);
      expect(m, `quartier ${q}`).not.toBeNull();
      return Number(m![1]);
    };
    const xs = [where(0), where(1), where(2)];
    expect(new Set(xs).size).toBe(3);
    // Further right for a quarter further right.
    expect(xs[0]!).toBeLessThan(xs[1]!);
    expect(xs[1]!).toBeLessThan(xs[2]!);
    expect(moving({}, 'full')).not.toContain('#p-ecureuil');
  });

  it('the worker only comes once the valve is closed, by the heat station', () => {
    expect(moving({ scene: { leak: true } }, 'full')).not.toContain('#p-ouvrier');
    const fixing = moving({ scene: { worker: true } }, 'full');
    expect(fixing).toContain('#p-ouvrier');
  });

  it('none of them is painted into the still pictures of the town', () => {
    const s = still({ scene: { party: true, squirrel: 1, worker: true } }, 'full');
    for (const id of ['foule-fete', 'guirlandes', 'ecureuil', 'ouvrier']) expect(s, id).not.toContain(`#p-${id}`);
  });
});

describe('the inhabitants walk (lot L10.5a, R2-05)', () => {
  it('every walker bobs up and down, each at his own moment; no vehicle does', () => {
    const s = moving({}, 'full');
    const walks = s.split('class="walk"').length - 1;
    expect(walks).toBeGreaterThanOrEqual(6);
    // One phase per walker, and they are not all the same.
    const phases = [...s.matchAll(/class="walk" style="--d:([-\d.]+)s"/g)].map((m) => m[1]!);
    expect(phases.length).toBe(walks);
    expect(new Set(phases).size).toBeGreaterThan(1);
    // The bob is inside the layer that crosses the street, never around it.
    expect(s).not.toMatch(/class="walk"[^>]*>\s*<g class="iso-move"/);
  });

  it('the old lady walks in two streets, with her shopping bag', () => {
    const s = moving({}, 'full');
    expect(s.split('href="#p-dame-agee"').length - 1).toBe(2);
    expect(TOWN_IMAGES).toContain('dame-agee');
  });
});

describe('the two steps of a walk (lot L10.5a, images 71 à 74)', () => {
  /** The town with the pictures of the second step, as it will be once Yann has made them again. */
  const withSteps = (): string => {
    const images = { ...IMAGES, 'habitant-adulte-2': pic('habitant-adulte-2'), 'habitant-enfant-2': pic('habitant-enfant-2') };
    return drawTownLayers(opts({ images }), 'full').filter((l) => l.kind === 'moving').map((l) => l.svg).join('');
  };

  it('are shown in turn, each keeping the bob, as soon as the second picture is there', () => {
    const before = moving({}, 'full');
    expect(before).not.toContain('step-a');
    expect(before).not.toContain('#p-habitant-adulte-2');
    const after = withSteps();
    expect(after.split('class="walk step-a"').length - 1).toBe(3);
    expect(after.split('class="walk step-b"').length - 1).toBe(3);
    expect(after).toContain('#p-habitant-adulte-2');
    expect(after).toContain('#p-habitant-enfant-2');
  });

  it('a walker with no second picture keeps the simple bob', () => {
    const after = withSteps();
    // The old lady has only one picture: she is drawn once, without a step class.
    expect(after.split('href="#p-dame-agee"').length - 1).toBe(2);
    expect(after).toMatch(/class="walk" style="--d:[-\d.]+s"/);
  });

  it('both steps stand at the same place and the same height', () => {
    const after = withSteps();
    const boxes = [...after.matchAll(/class="walk step-([ab])"[^>]*><use href="#p-habitant-adulte(-2)?" transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)/g)];
    expect(boxes.length).toBeGreaterThanOrEqual(2);
    const [a, b] = boxes;
    // Same ground line (the pictures are the same size here, so the same translation).
    expect(Number(a![4])).toBeCloseTo(Number(b![4]), 1);
  });
});

describe('the inhabitants go into the buildings (lot L10.5b, R2-05)', () => {
  /** The school on a lot in front of a street (row 4), as the child may place it. */
  const schoolPlaces = { ecole: [6, 4] as const };
  const visit = (mode: 'in' | 'out' | 'round', places: Places = schoolPlaces) =>
    moving({ places, upgrades: ['ecole'], scene: { visits: [{ id: 'ecole', who: 'enfant', mode }] } }, 'full');

  it('a child walks along the pavement, goes in, and comes out of the school', () => {
    const round = visit('round');
    expect(round).toContain('class="v-go"');
    expect(round).toContain('class="v-enter"');
    expect(round).toContain('class="v-leave"');
    // Seen from the back to walk up to the door, from the front along the pavement.
    expect(round).toContain('#p-habitant-enfant-dos');
    expect(round).toContain('#p-habitant-enfant');
    // One single path for the three pictures.
    expect(round.split('class="visit"').length - 1).toBe(3);
  });

  it('in the morning he goes in and stays; at the end of the day he only comes out', () => {
    const goes = visit('in');
    expect(goes).toContain('class="v-enter"');
    expect(goes).not.toContain('class="v-leave"');
    const comes = visit('out');
    expect(comes).toContain('class="v-leave"');
    expect(comes).not.toContain('class="v-enter"');
    expect(comes).not.toContain('class="v-go"');
  });

  it('the path goes along the pavement, then up to the door', () => {
    const m = visit('round').match(/class="visit" style="--ax:([-\d.]+)px;--ay:([-\d.]+)px;--bx:([-\d.]+)px;--by:([-\d.]+)px;--cx:([-\d.]+)px;--cy:([-\d.]+)px/);
    expect(m).not.toBeNull();
    const [ax, ay, bx, by, cx] = m!.slice(1).map(Number);
    // Along the pavement: to the right and down the screen (he comes towards us).
    expect(ax!).toBeGreaterThan(0);
    expect(ay!).toBeGreaterThan(0);
    // Then the door: a little to the right and up.
    expect(bx!).toBeGreaterThan(ax!);
    expect(by!).toBeLessThan(ay!);
    // Then away, further right.
    expect(cx!).toBeGreaterThan(ax!);
  });

  it('a building that is not in front of a street gets no visit (the depth would break)', () => {
    // Row 3 is a back-row lot: the walker would have to cross the lot of row 4.
    expect(visit('round', { ecole: [6, 3] })).not.toContain('class="visit"');
    // Nor a building that is not built, whatever the scene says.
    expect(moving({ places: schoolPlaces, upgrades: [], scene: { visits: [{ id: 'ecole', who: 'enfant', mode: 'round' }] } }, 'full'))
      .not.toContain('class="visit"');
  });

  it('a visit is never painted into the still pictures of the town', () => {
    expect(still({ places: schoolPlaces, upgrades: ['ecole'], scene: { visits: [{ id: 'ecole', who: 'enfant', mode: 'round' }] } }, 'full'))
      .not.toContain('class="visit"');
  });
});

describe('buildings bought several times in the town (lot L10.6, R2-06)', () => {
  it('the copies take the two colours in turn', () => {
    expect(pictureOf('petite-maison')).toBe('petite-maison');
    expect(pictureOf('petite-maison-2')).toBe('petite-maison-b');
    expect(pictureOf('petite-maison-3')).toBe('petite-maison');
    expect(pictureOf('immeuble-neuf-2')).toBe('immeuble-neuf-b');
    // A building bought once keeps its own picture.
    expect(pictureOf('hotel')).toBe('hotel');
    expect(pictureOf('parc')).toBe('parc');
    for (const id of ['petite-maison-b', 'immeuble-neuf-b']) expect(TOWN_IMAGES).toContain(id);
  });

  it('each copy is drawn on its own lot, with its own colour', () => {
    const places = { 'petite-maison': [3, 1] as const, 'petite-maison-2': [4, 1] as const };
    const s = still({ upgrades: ['petite-maison', 'petite-maison-2'], places }, 'full');
    expect(s).toContain('#p-petite-maison"');
    expect(s).toContain('#p-petite-maison-b"');
    const lots = settle(['petite-maison', 'petite-maison-2'], {});
    expect(Object.keys(lots).sort()).toEqual(['petite-maison', 'petite-maison-2']);
    expect(lots['petite-maison']).not.toEqual(lots['petite-maison-2']);
  });

  it('the bakery of the decor is gone: only the one from the shop is left (R2-06)', () => {
    expect(TOWN_IMAGES).not.toContain('boulangerie');
    expect(still({}, 'full')).not.toContain('#p-boulangerie');
    expect(still({ upgrades: ['patisserie'] }, 'full')).toContain('#p-patisserie');
  });
});
