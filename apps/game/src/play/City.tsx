import { memo } from 'react';
import { iconUrl, shopUrl } from '../assets';
import type { GaugeState } from '../ui/ui';
import { BUILDINGS, BuildingDefs, Buildings, LitWindows } from './city/Buildings';
import { Background, Bike, Car, Clouds, Person, Smoke, Street } from './city/Life';
import { HeatPipe, Plant, PlantDefs } from './city/Plant';
import { GROUND, H, W, nightAt, skyAt } from './city/scene';

/**
 * The town, front view in layers (D-03): sky, hills, the plant and its links (power line, heating pipe), a row of
 * buildings, the street. Drawn in SVG for the mock-up (D-08), made more realistic in the drawing pass (D-09); the
 * final drawings come from Figma. Reacts to the hour and to how well the player follows demand.
 */
export interface CityProps {
  hour: number;
  elecGauge: GaugeState;
  heatGauge: GaugeState | null;
  /** Production below demand (a surplus does not hurt the town). */
  elecShort: boolean;
  heatShort: boolean;
  /** The plant sends electricity / heat (animates the links). */
  elecOn: boolean;
  heatOn: boolean;
  upgrades: readonly string[];
}

/** Where the shop's upgrades appear. The right end of the town (x > 1110) stays free for Cassandra. */
const SLOTS: Record<string, { x: number; y: number; s: number }> = {
  parc: { x: 462, y: GROUND - 96, s: 100 },
  fontaine: { x: 674, y: GROUND - 86, s: 90 },
  ecole: { x: 1008, y: GROUND - 112, s: 112 },
};
const LAMPS = [338, 562, 764, 1004];

export const City = memo(function City(p: CityProps) {
  const [skyTop, skyBottom] = skyAt(p.hour);
  const night = nightAt(p.hour);
  const sunT = (p.hour - 6) / 14.5;
  const sunX = 140 + sunT * 1000;
  const sunY = 220 - Math.sin(Math.PI * Math.min(1, Math.max(0, sunT))) * 175;
  const happy = p.elecGauge === 'bien' && (p.heatGauge === null || p.heatGauge === 'bien');
  const darkQuarter = p.elecShort && p.elecGauge === 'loin' ? 2 : null;
  const cold = p.heatShort && p.heatGauge === 'loin';
  const lamps = p.upgrades.includes('eclairage');
  const houses = BUILDINGS.filter((b) => b.kind === 'house');
  return (
    <svg className="city" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" role="img" aria-label="Neutron City">
      <defs>
        <linearGradient id="nc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <radialGradient id="nc-sun">
          <stop offset="0.55" stopColor="#FFE066" />
          <stop offset="0.75" stopColor="#FFD23F" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFD23F" stopOpacity="0" />
        </radialGradient>
        <PlantDefs />
        <BuildingDefs />
      </defs>

      <rect width={W} height={H} fill="url(#nc-sky)" />
      {sunT > -0.05 && sunT < 1.05 ? <circle cx={sunX} cy={sunY} r={44} fill="url(#nc-sun)" /> : null}
      <Clouds />
      <Background />
      <Plant elecOn={p.elecOn} />
      {houses.map((b) => (p.heatOn ? <Smoke key={b.id} x={b.x + b.w - 23} y={GROUND - b.h - 50} weak={cold} /> : null))}
      <Buildings night={night} />

      {Object.entries(SLOTS).map(([id, s]) =>
        p.upgrades.includes(id) ? <image key={id} href={shopUrl(id)} x={s.x} y={s.y} width={s.s} height={s.s} className="pop" /> : null,
      )}

      <Street cycleLane={p.upgrades.includes('piste')} />
      <HeatPipe heatOn={p.heatOn} />
      {lamps ? LAMPS.map((x) => <image key={x} href={shopUrl('eclairage')} x={x - 34} y={GROUND - 74} width={74} height={74} className="pop" />) : null}

      <Person x={300} shirt="#7B5CD6" trousers="#3B4A6B" skin={0} hair="#6B3E26" delay={0} happy={happy} cold={cold} />
      <Person x={600} shirt="#2E9E5B" trousers="#1D47B8" skin={2} hair="#1C2A4A" delay={-9} speed={30} child happy={happy} cold={cold} />
      <Person x={860} shirt="#FF8A3D" trousers="#55617C" skin={1} hair="#2A1A10" delay={-15} speed={20} happy={happy} cold={cold} />
      <Car night={night} />
      <Bike />

      {/* Night: shade the scene, then light what glows. */}
      <rect width={W} height={H} fill="#0B1440" opacity={0.5 * night} pointerEvents="none" />
      {night > 0.3 ? (
        <g opacity={night}>
          <image href={iconUrl('nuit')} x={1040} y={22} width={58} height={58} />
          {[90, 260, 420, 620, 840, 960, 1200].map((x, i) => <circle key={x} cx={x} cy={26 + (i % 3) * 20} r={2.2} fill="#FFF6DC" />)}
        </g>
      ) : null}
      <LitWindows night={night} darkQuarter={darkQuarter} />
      {lamps && night > 0.3 ? LAMPS.map((x) => <ellipse key={x} cx={x + 8} cy={GROUND + 4} rx={34} ry={10} fill="#FFE9A8" opacity={0.45 * night} />) : null}

      {darkQuarter ? (
        <g className="pop">
          <image href={iconUrl('electricite')} x={690} y={96} width={54} height={54} />
          <image href={iconUrl('loin')} x={724} y={126} width={30} height={30} />
        </g>
      ) : null}
    </svg>
  );
});
