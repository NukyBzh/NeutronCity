import { describe, expect, it } from 'vitest';
import { RATED_ELEC_MW, RATED_HEAT_MW, clampSetpoints, corePct } from '../src/index';

describe('D-01: the core is shared between electricity and heat', () => {
  it('70 MWe + 90 MWth = 100 % of the core', () => {
    const e = (70 / RATED_ELEC_MW) * 100;
    const h = (90 / RATED_HEAT_MW) * 100;
    expect(corePct(e, h)).toBeCloseTo(100, 10);
  });

  it('the output being moved only gets what the other leaves free', () => {
    expect(clampSetpoints(80, 30, 'elec')).toEqual({ elecPct: 70, heatPct: 30 });
    expect(clampSetpoints(80, 30, 'heat')).toEqual({ elecPct: 80, heatPct: 20 });
    expect(clampSetpoints(60, 30, 'elec')).toEqual({ elecPct: 60, heatPct: 30 });
  });

  it('shares stay between 0 and 100 %', () => {
    expect(clampSetpoints(-5, 120, 'heat')).toEqual({ elecPct: 0, heatPct: 100 });
  });
});
