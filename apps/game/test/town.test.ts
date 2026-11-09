import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { validateShop } from '@neutron/engine';
import { CAR_START_X, HAT, PLOTS, RIVER_X, TILE, drawTown, drawTownLayers, lightKey, type TownImage, type TownOptions } from '../src/play/iso/town';
import { skyColours } from '../src/play/iso/Sky';

const ICONS = { coeur: 'c.svg', froid: 'f.svg', electricite: 'e.svg', loin: 'l.svg' };
const SHOP = validateShop(parse(readFileSync(fileURLToPath(new URL('../../../content/shop/shop.yaml', import.meta.url)), 'utf8')));
/** Buildings that keep their own drawing (D-19 E8). */
const DRAWN = ['fontaine', 'piste', 'eclairage'];
const ALL = SHOP.map((i) => i.id);
const IMAGES: Record<string, TownImage> = Object.fromEntries([...ALL.filter((id) => !DRAWN.includes(id)), TILE].map((id) => [id, { href: `data:image/webp;base64,${id}`, w: 100, h: 90 }]));
const town = (o: Partial<TownOptions> = {}, view: 'band' | 'full' = 'band') =>
  drawTown({ hour: 14, season: 'ete', mood: 'content', elecOn: true, heatOn: false, upgrades: ALL, icons: ICONS, images: IMAGES, ...o }, view);

describe('isometric town (test feedback R1)', () => {
  it('R1-01: cars start on the road after the river', () => {
    expect(CAR_START_X).toBeGreaterThan(RIVER_X[1]);
  });

  it('R1-03: bought upgrades do not replay their "appear" animation at each redraw', () => {
    for (const view of ['band', 'full'] as const) {
      expect(town({}, view)).not.toContain('class="pop"');
      expect(town({ mood: 'noir', hour: 22 }, view)).not.toContain('class="pop"');
    }
  });

  it('R1-03 / R1-08: only the upgrade just bought appears, with an arrow showing where it is', () => {
    const s = town({ fresh: 'fontaine' }, 'full');
    expect(s.match(/class="pop"/g)?.length).toBe(2);
    expect(s).toContain('mark-arrow');
    for (const id of ALL) expect(town({ fresh: id }, 'full'), id).toContain('mark-arrow');
    expect(town({}, 'full')).not.toContain('mark-arrow');
  });

  it('R1-02: animated parts carry their own offset, never a fixed delay that restarts', () => {
    const s = town({ season: 'hiver', hour: 7 });
    expect(s).not.toContain('animation-delay');
    expect(s).toContain('--d:');
  });
});

describe('town layers for the tablet (lot L4)', () => {
  const opts = (o: Partial<TownOptions> = {}): TownOptions => ({ hour: 14, season: 'hiver', mood: 'froid', elecOn: true, heatOn: true, upgrades: ALL, icons: ICONS, images: IMAGES, fresh: 'parc', ...o });

  it('still layers hold nothing animated and no outside picture (they are painted once into canvases)', () => {
    for (const view of ['band', 'full'] as const) {
      for (const hour of [8, 14, 19.5, 22.5]) {
        const layers = drawTownLayers(opts({ hour, mood: hour > 21 ? 'noir' : 'froid' }), view);
        for (const l of layers.filter((x) => x.kind === 'still')) {
          expect(l.svg).not.toMatch(/class="(iso-car|walker-iso|flake|steam|plume|flow|float|mark-arrow|mark-ring)/);
          expect(l.svg).not.toMatch(/<image href="(?!data:)/);
        }
      }
    }
  });

  it('cars drive between the rows of buildings, so the rows in front still hide them', () => {
    const layers = drawTownLayers(opts(), 'band');
    const firstCar = layers.findIndex((l) => l.svg.includes('iso-car'));
    expect(firstCar).toBeGreaterThan(0);
    expect(layers.slice(firstCar + 1).some((l) => l.kind === 'still')).toBe(true);
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

describe('shop buildings in the town (lot L6.2)', () => {
  it('every building with a picture has its own plot, in the rows seen in the play screen and in the whole town', () => {
    const withPicture = ALL.filter((id) => !DRAWN.includes(id) && id !== 'isolation');
    expect(Object.keys(PLOTS).sort()).toEqual([...withPicture].sort());
    const cells = Object.values(PLOTS).map((p) => `${p.i},${p.j}`);
    expect(new Set(cells).size).toBe(cells.length);
    for (const p of Object.values(PLOTS)) {
      expect(p.i).toBeGreaterThanOrEqual(1); // column 0: the plant
      expect(p.i + p.j).toBeGreaterThanOrEqual(5);
      expect(p.i + p.j).toBeLessThanOrEqual(8);
      expect(p.j).toBeLessThanOrEqual(8);
      expect(`${p.i},${p.j}`).not.toBe('1,6'); // the park with the fountain
    }
    // The hat goes on the Lilas house, always bought before isolation opens.
    const iso = SHOP.find((i) => i.id === 'isolation')!;
    expect(SHOP.find((i) => i.id === HAT.on)!.discovery).toBeDefined();
    expect(iso.unlockAt).toBeGreaterThanOrEqual(8);
  });

  it('a grass tile before the purchase, the same picture as in the shop after it', () => {
    for (const view of ['band', 'full'] as const) {
      const none = town({ upgrades: [] }, view);
      for (const id of Object.keys(PLOTS)) expect(none).not.toContain(IMAGES[id]!.href);
      expect(none.split(`href="${IMAGES[TILE]!.href}"`).length - 1).toBe(Object.keys(PLOTS).length);
      const all = town({}, view);
      for (const id of [...Object.keys(PLOTS), 'isolation']) expect(all, id).toContain(`href="${IMAGES[id]!.href}"`);
      expect(all).not.toContain(IMAGES[TILE]!.href);
    }
    expect(town({ upgrades: ['ferme'] })).toContain(IMAGES.ferme!.href);
    expect(town({ upgrades: ['ferme'] })).not.toContain(IMAGES.ecole!.href);
  });

  it('a building bought whose picture is not loaded yet keeps its plot (no broken picture)', () => {
    const s = town({ upgrades: ['ferme'], images: { [TILE]: IMAGES[TILE]! } });
    expect(s).not.toContain(IMAGES.ferme!.href);
    expect(s.split(`href="${IMAGES[TILE]!.href}"`).length - 1).toBe(Object.keys(PLOTS).length);
    // Before the tile itself is loaded: plain grass with a dashed edge.
    expect(town({ upgrades: [], images: {} }).match(/stroke-dasharray="6 5"/g)?.length).toBe(Object.keys(PLOTS).length);
  });

  it('the building just bought arrives with its animation and the arrow, in a moving layer', () => {
    for (const id of [...Object.keys(PLOTS), 'isolation']) {
      const layers = drawTownLayers({ hour: 14, season: 'ete', mood: 'content', elecOn: true, heatOn: false, upgrades: ALL, icons: ICONS, images: IMAGES, fresh: id }, 'full');
      const moving = layers.filter((l) => l.kind === 'moving').map((l) => l.svg).join('');
      const still = layers.filter((l) => l.kind === 'still').map((l) => l.svg).join('');
      expect(moving, id).toContain(`<g class="pop">`);
      expect(moving, id).toContain(IMAGES[id]!.href);
      expect(still, id).not.toContain(IMAGES[id]!.href);
      expect(moving, id).toContain('mark-arrow');
    }
  });

  it('pictures take the evening and night light like the drawn town', () => {
    expect(town({ hour: 13 })).not.toContain('feColorMatrix');
    expect(town({ hour: 23 })).toContain('filter="url(#iso-light)"');
  });
});
