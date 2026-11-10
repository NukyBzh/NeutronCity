import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { validateShop } from '@neutron/engine';
import {
  BAND_VIEWBOX, HAT, PLOTS, TOWN_IMAGES, drawTown, drawTownLayers, isLot, lightKey, tileCentre, type TownImage, type TownOptions,
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
    const traffic = layers.map((l, k) => (l.kind === 'moving' && l.svg.includes('iso-move') ? k : -1)).filter((k) => k >= 0);
    expect(traffic.length).toBe(3);
    // Each street's traffic has still rows after it, which hide it behind the buildings in front.
    expect(layers.slice(traffic[0]! + 1).some((l) => l.kind === 'still')).toBe(true);
    const all = layers.map((l) => l.svg).join('');
    for (const id of ['voiture-rouge-avant', 'voiture-bleue-arriere', 'bus', 'habitant-adulte', 'famille-1']) expect(all, id).toContain(`#p-${id}"`);
    // Every move goes along a street (x of the world: right-down or left-up on the screen).
    for (const [, tx, ty] of all.matchAll(/--tx:(-?[\d.]+)px;--ty:(-?[\d.]+)px/g)) expect(Number(ty) / Number(tx)).toBeCloseTo(0.5 / 0.866, 2);
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
  it('every building with a picture has its own plot, on a lot seen in the play screen', () => {
    const withPicture = ALL.filter((id) => !NO_PLOT.includes(id) && id !== 'isolation');
    expect(Object.keys(PLOTS).sort()).toEqual([...withPicture].sort());
    const cells = Object.values(PLOTS).map((p) => `${p.c},${p.r}`);
    expect(new Set(cells).size).toBe(cells.length);
    const [bx, by, bw, bh] = BAND_VIEWBOX.split(' ').map(Number) as [number, number, number, number];
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
