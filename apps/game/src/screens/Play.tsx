import { useEffect, useRef, useState } from 'react';
import {
  clampSetpoints, gaugesOf, hourOf, isHeatingDay, isOver, moodOf, setSetpoints, type DayDef, type GameState, type Pose,
} from '@neutron/engine';
import { euros, t } from '../i18n';
import { IsoCity } from '../play/IsoCity';
import { Clock, CoreBar, Slider } from '../play/Controls';
import { Curves } from '../play/Curves';
import { REAL_SECONDS_PER_GAME_MINUTE, START_HOUR, advance, playUntil, startOf, timelineOf, type Sample } from '../play/session';
import { Button, Cassandra, Gauge, Icon, Rich } from '../ui/ui';

/** A bubble stays about 7 s (auto-advance, no "Continue" button). */
const BUBBLE_SECONDS = 7;
/** Hint after about 20 s far from demand without touching anything. */
const IDLE_HINT_SECONDS = 20;

interface Line { id: string; pose: Pose }

/** Review settings in the address (mock-up): `?vitesse=10` plays 10× faster; `?heure=19` starts at 19 h (add `&suivi=non` for a player who never moved). */
const PARAMS = new URLSearchParams(window.location.search);
const SPEED = Math.min(30, Math.max(1, Number(PARAMS.get('vitesse')) || 1));
const REVIEW_START = Math.min(23.9, Math.max(START_HOUR, Number(PARAMS.get('heure')) || START_HOUR));
const REVIEW_FOLLOW = PARAMS.get('suivi') !== 'non';

export function Play({ day, seed, upgrades, onFinish, onRestart, onHome }: {
  day: DayDef;
  seed: number;
  upgrades: readonly string[];
  onFinish: (game: GameState) => void;
  onRestart: () => void;
  onHome: () => void;
}) {
  const [run, setRun] = useState(() => (REVIEW_START > START_HOUR ? playUntil(day, seed, REVIEW_START, REVIEW_FOLLOW) : startOf(day, seed)));
  const [timeline] = useState(() => timelineOf(day, run.game));
  const [paused, setPaused] = useState(false);
  const [line, setLine] = useState<Line | null>(null);
  const [coins, setCoins] = useState<number[]>([]);
  const clock = useRef({
    real: 0, carry: 0, lastInput: 0, farSince: -1, coreToldAt: -1e9, praised: false, goodSince: -1,
    next: Math.max(0, timeline.filter((l) => l.hour < hourOf(run.game)).length - 1),
  });
  const current = useRef(run);
  current.current = run;

  const say = (id: string, pose: Pose) => setLine({ id, pose });

  useEffect(() => {
    if (paused) return undefined;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const c = clock.current;
      const dt = Math.min(0.1, (now - last) / 1000) * SPEED;
      last = now;
      c.real += dt;
      c.carry += dt;
      let r: { game: GameState; history: Sample[] } = current.current;
      while (c.carry >= REAL_SECONDS_PER_GAME_MINUTE && !isOver(r.game)) {
        c.carry -= REAL_SECONDS_PER_GAME_MINUTE;
        const paid = r.game.paidMinutes;
        r = advance(day, r.game, r.history);
        const p = r.game.paidMinutes;
        if (p > paid && p % 10 === 0) setCoins((k) => [...k.slice(-4), p]);
      }
      if (r !== current.current) {
        current.current = r;
        setRun(r);
      }
      const g = r.game;
      const h = hourOf(g);
      const step = timeline[c.next];
      if (step && h >= step.hour) {
        c.next += 1;
        say(step.say, step.pose);
      }
      const view = gaugesOf(day, g);
      if (view.elec === 'loin' || view.heat === 'loin') {
        if (c.farSince < 0) c.farSince = c.real;
        if (c.real - c.farSince > IDLE_HINT_SECONDS && c.real - c.lastInput > IDLE_HINT_SECONDS) {
          const which = view.elec === 'loin' ? 'elec' : 'heat';
          const up = which === 'elec' ? g.plant.elec < view.demand.elec : g.plant.heat < view.demand.heat;
          say(`jeu.indice.${which}.${up ? 'monter' : 'baisser'}`, 'reflechit');
          c.farSince = c.real;
        }
      } else c.farSince = -1;
      if (view.elec === 'bien' && (view.heat === null || view.heat === 'bien')) {
        if (c.goodSince < 0) c.goodSince = h;
        if (!c.praised && h - c.goodSince >= 3) {
          c.praised = true;
          say('jeu.bravo', 'bravo');
        }
      } else c.goodSince = -1;
      if (isOver(g)) {
        onFinish(g);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [paused, day, timeline, onFinish]);

  useEffect(() => {
    if (!line) return undefined;
    const id = window.setTimeout(() => setLine((l) => (l === line ? null : l)), BUBBLE_SECONDS * 1000);
    return () => window.clearTimeout(id);
  }, [line]);

  const setOutput = (moved: 'elec' | 'heat', v: number) => {
    const c = clock.current;
    c.lastInput = c.real;
    const r = current.current;
    const wanted = moved === 'elec' ? { e: v, h: r.game.plant.setHeat } : { e: r.game.plant.setElec, h: v };
    const ok = clampSetpoints(wanted.e, wanted.h, moved);
    if (ok.elecPct + ok.heatPct >= 100 && wanted.e + wanted.h > 100 && c.real - c.coreToldAt > 30) {
      c.coreToldAt = c.real;
      say('jeu.coeur.plein', 'attention');
    }
    // Update the ref at once so the next animation frame does not step from the old setpoints.
    const next = { ...r, game: setSetpoints(r.game, wanted.e, wanted.h, moved) };
    current.current = next;
    setRun(next);
  };

  const g = run.game;
  const hour = hourOf(g);
  const view = gaugesOf(day, g);
  const heatDay = isHeatingDay(day);
  const elecShort = g.plant.elec < view.demand.elec;
  const heatShort = g.plant.heat < view.demand.heat;
  // Pulse the slider to act on: the output far from demand whose setpoint is not already heading the right way.
  const needs = (prod: number, set: number, dem: number) => Math.abs(prod - dem) > 3 && Math.abs(set - dem) > 3;
  const pulseElec = needs(g.plant.elec, g.plant.setElec, view.demand.elec);
  const pulseHeat = view.heat !== null && needs(g.plant.heat, g.plant.setHeat, view.demand.heat);

  return (
    <main className="screen play">
      <header className="play-top">
        <Button icon="pause" label={t('btn.pause')} onClick={() => setPaused(true)} />
        <div className="play-day">
          <Icon name="matin" size={2} />
          <span>{t(`day.${day.id}.title`)}</span>
          <Clock hour={hour} />
        </div>
        <div className="play-top-spacer" />
      </header>

      <section className="zone-city" aria-label={t('zone.city')}>
        <IsoCity
          view="band"
          hour={Math.floor(hour * 12) / 12}
          season={day.id}
          mood={moodOf(view.elec, view.heat, elecShort, heatShort)}
          elecOn={g.plant.elec > 0}
          heatOn={heatDay && g.plant.heat > 0}
          upgrades={upgrades}
        />
        <Cassandra pose={line?.pose ?? 'explique'} className="play-cassandra">
          {line ? <Rich text={t(line.id)} /> : null}
        </Cassandra>
      </section>

      <section className="zone-curves panel" aria-label={t('zone.curves')}>
        <div className="curves-head">
          <span className="legend"><i className="legend-dash" />{t('curves.demand')}</span>
          <span className="legend"><i className="legend-solid" />{t('curves.production')}</span>
          <span className="piggy" aria-label={t('piggy.label', { amount: euros(g.euros) })}>
            <Icon name="tirelire" size={2.4} />
            <b>{euros(g.euros)}</b>
            {coins.map((k) => <span key={k} className="coin"><Icon name="piece" size={1.5} /></span>)}
          </span>
        </div>
        <div className="curves-body">
          <Curves day={day} surprises={g.surprises} hour={hour} history={run.history} current={{ h: hour, elec: g.plant.elec, heat: g.plant.heat }} heatOn={heatDay} />
          <div className="curves-gauges">
            <Gauge state={view.elec} />
            {view.heat ? <Gauge state={view.heat} /> : <span />}
          </div>
        </div>
      </section>

      <section className="zone-controls panel" aria-label={t('zone.controls')}>
        <CoreBar elec={g.plant.setElec} heat={g.plant.setHeat} />
        <div className="sliders">
          <Slider kind="elec" setpoint={g.plant.setElec} production={g.plant.elec} onChange={(v) => setOutput('elec', v)} pulse={pulseElec} />
          <Slider kind="heat" setpoint={g.plant.setHeat} production={g.plant.heat} onChange={(v) => setOutput('heat', v)} pulse={pulseHeat} disabled={!heatDay} />
        </div>
      </section>

      {paused ? (
        <div className="overlay" role="dialog" aria-modal aria-label={t('pause.title')}>
          <div className="overlay-card">
            <h2><Icon name="pause" size={2} />{t('pause.title')}</h2>
            <p>{t('pause.text')}</p>
            <div className="row">
              <Button kind="primary" pulse icon="jouer" label={t('btn.resume')} onClick={() => setPaused(false)} />
              <Button icon="recommencer" label={t('btn.restart')} onClick={onRestart} />
              <Button icon="accueil" label={t('btn.home')} onClick={onHome} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
