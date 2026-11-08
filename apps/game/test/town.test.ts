import { describe, expect, it } from 'vitest';
import { CAR_START_X, RIVER_X, drawTown, type TownOptions } from '../src/play/iso/town';

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

  it('R1-03: only the upgrade just bought appears with the animation', () => {
    const s = town({ fresh: 'fontaine' }, 'full');
    expect(s.match(/class="pop"/g)?.length).toBe(1);
  });

  it('R1-02: animated parts carry their own offset, never a fixed delay that restarts', () => {
    const s = town({ season: 'hiver', hour: 7 });
    expect(s).not.toContain('animation-delay');
    expect(s).toContain('--d:');
  });
});
