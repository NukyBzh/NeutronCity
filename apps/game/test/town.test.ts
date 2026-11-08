import { describe, expect, it } from 'vitest';
import { CAR_START_X, RIVER_X, drawTown, drawTownLayers, lightKey, type TownOptions } from '../src/play/iso/town';
import { skyColours } from '../src/play/iso/Sky';

const ICONS = { coeur: 'c.svg', froid: 'f.svg', electricite: 'e.svg', loin: 'l.svg' };
const ALL = ['fontaine', 'parc', 'piste', 'eclairage', 'ecole'];
const town = (o: Partial<TownOptions> = {}, view: 'band' | 'full' = 'band') =>
  drawTown({ hour: 14, season: 'ete', mood: 'content', elecOn: true, heatOn: false, upgrades: ALL, icons: ICONS, ...o }, view);

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
  const opts = (o: Partial<TownOptions> = {}): TownOptions => ({ hour: 14, season: 'hiver', mood: 'froid', elecOn: true, heatOn: true, upgrades: ALL, icons: ICONS, fresh: 'parc', ...o });

  it('still layers hold nothing animated and no outside picture (they are painted once into canvases)', () => {
    for (const view of ['band', 'full'] as const) {
      for (const hour of [8, 14, 19.5, 22.5]) {
        const layers = drawTownLayers(opts({ hour, mood: hour > 21 ? 'noir' : 'froid' }), view);
        for (const l of layers.filter((x) => x.kind === 'still')) {
          expect(l.svg).not.toMatch(/class="(iso-car|walker-iso|flake|steam|plume|flow|float|mark-arrow|mark-ring)/);
          expect(l.svg).not.toContain('<image');
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
