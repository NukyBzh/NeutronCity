import { useEffect, useRef, useState } from 'react';
import { clampSetpoints } from '@neutron/engine';
import type { Pose } from '../assets';
import { euros, t } from '../i18n';
import {
  END_HOUR, REAL_SECONDS_PER_GAME_HOUR, START_HOUR, demandAt, gaugeOf, newPlay, playUntil, stepMinute, type DayDef, type PlayState,
} from '../maquette/fakeDay';
import { scriptFor } from '../maquette/script';
import { City } from '../play/City';
import { Clock, CoreBar, Slider } from '../play/Controls';
import { Curves } from '../play/Curves';
import { Button, Cassandra, Gauge, Icon, Rich } from '../ui/ui';

/** A bubble stays about 7 s (auto-advance, no "Continue" button). */
const BUBBLE_SECONDS = 7;
/** Hint after about 20 s far from demand without touching anything. */
const IDLE_HINT_SECONDS = 20;

interface Line { id: string; pose: Pose; until: number }

/** Mock-up only: `?vitesse=10` in the address plays the day 10 times faster, to review it quickly. */
const PARAMS = new URLSearchParams(window.location.search);
const MOCKUP_SPEED = Math.min(30, Math.max(1, Number(PARAMS.get('vitesse')) || 1));
/** Mock-up only: `?heure=19` starts the day at 19 h; add `&suivi=non` for a player who never touched anything. */
const MOCKUP_START = Math.min(23.9, Math.max(START_HOUR, Number(PARAMS.get('heure')) || START_HOUR));
const MOCKUP_FOLLOW = PARAMS.get('suivi') !== 'non';

export function Play({ day, upgrades, onFinish, onHome }: {
  day: DayDef;
  upgrades: readonly string[];
  onFinish: (earned: number) => void;
  onHome: () => void;
}) {
  const [script] = useState(() => scriptFor(day));
  const [s, setS] = useState<PlayState>(() => (MOCKUP_START > START_HOUR ? playUntil(day, MOCKUP_START, MOCKUP_FOLLOW) : newPlay(day)));
  const [paused, setPaused] = useState(false);
  const [line, setLine] = useState<Line | null>(null);
  const [coins, setCoins] = useState<number[]>([]);
  const clock = useRef({
    real: 0, carry: 0, lastInput: 0, farSince: -1, coreToldAt: -1e9, praised: false, goodSince: -1,
    scriptIdx: Math.max(0, script.filter((l) => l.hour < MOCKUP_START).length - 1),
  });
  const state = useRef(s);
  state.current = s;

  const say = (id: string, pose: Pose) => setLine({ id, pose, until: clock.current.real + BUBBLE_SECONDS });

  useEffect(() => {
    if (paused) return undefined;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const c = clock.current;
      const dt = Math.min(0.1, (now - last) / 1000) * MOCKUP_SPEED;
      last = now;
      c.real += dt;
      c.carry += dt;
      const minuteSeconds = REAL_SECONDS_PER_GAME_HOUR / 60;
      let next = state.current;
      while (c.carry >= minuteSeconds && next.hour < END_HOUR) {
        c.carry -= minuteSeconds;
        const before = next.paidMinutes;
        next = stepMinute(day, next);
        if (next.paidMinutes > before && next.paidMinutes % 10 === 0) setCoins((k) => [...k.slice(-4), next.paidMinutes]);
      }
      if (next !== state.current) {
        state.current = next;
        setS(next);
      }
      // Script, hints and praise.
      const h = next.hour;
      const step = script[c.scriptIdx];
      if (step && h >= step.hour) {
        c.scriptIdx += 1;
        say(step.id, step.pose);
      }
      const d = demandAt(day, h);
      const ge = gaugeOf(next.elec - d.elec);
      const gh = d.heat > 0 ? gaugeOf(next.heat - d.heat) : 'bien';
      if (ge === 'loin' || gh === 'loin') {
        if (c.farSince < 0) c.farSince = c.real;
        if (c.real - c.farSince > IDLE_HINT_SECONDS && c.real - c.lastInput > IDLE_HINT_SECONDS) {
          const which = ge === 'loin' ? 'elec' : 'heat';
          const up = which === 'elec' ? next.elec < d.elec : next.heat < d.heat;
          say(`jeu.indice.${which}.${up ? 'monter' : 'baisser'}`, 'reflechit');
          c.farSince = c.real;
        }
      } else c.farSince = -1;
      if (ge === 'bien' && gh === 'bien') {
        if (c.goodSince < 0) c.goodSince = h;
        if (!c.praised && h - c.goodSince >= 3) {
          c.praised = true;
          say('jeu.bravo', 'bravo');
        }
      } else c.goodSince = -1;
      if (next.hour >= END_HOUR) {
        onFinish(next.euros);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [paused, day, script, onFinish]);

  useEffect(() => {
    if (!line) return undefined;
    const id = window.setTimeout(() => setLine((l) => (l === line ? null : l)), BUBBLE_SECONDS * 1000);
    return () => window.clearTimeout(id);
  }, [line]);

  const setOutput = (moved: 'elec' | 'heat', v: number) => {
    clock.current.lastInput = clock.current.real;
    const cur = state.current;
    const wanted = moved === 'elec' ? { e: v, h: cur.setHeat } : { e: cur.setElec, h: v };
    const c = clampSetpoints(wanted.e, wanted.h, moved);
    if (c.elecPct + c.heatPct >= 100 && wanted.e + wanted.h > 100 && clock.current.real - clock.current.coreToldAt > 30) {
      clock.current.coreToldAt = clock.current.real;
      say('jeu.coeur.plein', 'attention');
    }
    // Update the ref at once so the next animation frame does not step from the old setpoints.
    const next = { ...state.current, setElec: c.elecPct, setHeat: c.heatPct };
    state.current = next;
    setS(next);
  };

  const d = demandAt(day, s.hour);
  const heatOn = day.heat.some(([, v]) => v > 0);
  const ge = gaugeOf(s.elec - d.elec);
  const gh = heatOn && d.heat > 0 ? gaugeOf(s.heat - d.heat) : null;
  // Pulse the slider to act on: the output far from demand whose setpoint is not already heading the right way.
  const needs = (prod: number, set: number, dem: number) => gaugeOf(prod - dem) !== 'bien' && Math.abs(set - dem) > 3;
  const pulseElec = needs(s.elec, s.setElec, d.elec);
  const pulseHeat = gh !== null && needs(s.heat, s.setHeat, d.heat);

  return (
    <main className="screen play">
      <header className="play-top">
        <Button icon="pause" label={t('btn.pause')} onClick={() => setPaused(true)} />
        <div className="play-day">
          <Icon name="matin" size={2} />
          <span>{t(`day.${day.id}.title`)}</span>
          <Clock hour={s.hour} />
        </div>
        <div className="play-top-spacer" />
      </header>

      <section className="zone-city" aria-label={t('zone.city')}>
        <City hour={Math.floor(s.hour * 12) / 12} elecGauge={ge} heatGauge={gh} elecShort={s.elec < d.elec} heatShort={s.heat < d.heat} elecOn={s.elec > 0} heatOn={heatOn && s.heat > 0} upgrades={upgrades} />
        <Cassandra pose={line?.pose ?? 'explique'} className="play-cassandra">
          {line ? <Rich text={t(line.id)} /> : null}
        </Cassandra>
      </section>

      <section className="zone-curves panel" aria-label={t('zone.curves')}>
        <div className="curves-head">
          <span className="legend"><i className="legend-dash" />{t('curves.demand')}</span>
          <span className="legend"><i className="legend-solid" />{t('curves.production')}</span>
          <span className="piggy" aria-label={t('piggy.label', { amount: euros(s.euros) })}>
            <Icon name="tirelire" size={2.4} />
            <b>{euros(s.euros)}</b>
            {coins.map((k) => <span key={k} className="coin"><Icon name="piece" size={1.5} /></span>)}
          </span>
        </div>
        <div className="curves-body">
          <Curves day={day} hour={s.hour} history={s.history} current={{ h: s.hour, elec: s.elec, heat: s.heat }} heatOn={heatOn} />
          <div className="curves-gauges">
            <Gauge state={ge} />
            {gh ? <Gauge state={gh} /> : <span />}
          </div>
        </div>
      </section>

      <section className="zone-controls panel" aria-label={t('zone.controls')}>
        <CoreBar elec={s.setElec} heat={s.setHeat} />
        <div className="sliders">
          <Slider kind="elec" setpoint={s.setElec} production={s.elec} onChange={(v) => setOutput('elec', v)} pulse={pulseElec} />
          <Slider kind="heat" setpoint={s.setHeat} production={s.heat} onChange={(v) => setOutput('heat', v)} pulse={pulseHeat} disabled={!heatOn} />
        </div>
      </section>

      {paused ? (
        <div className="overlay" role="dialog" aria-modal aria-label={t('pause.title')}>
          <div className="overlay-card">
            <h2><Icon name="pause" size={2} />{t('pause.title')}</h2>
            <p>{t('pause.text')}</p>
            <div className="row">
              <Button kind="primary" pulse icon="jouer" label={t('btn.resume')} onClick={() => setPaused(false)} />
              <Button icon="recommencer" label={t('btn.restart')} onClick={() => { clock.current = { ...clock.current, scriptIdx: 0, praised: false, goodSince: -1, farSince: -1 }; setS(newPlay(day)); setCoins([]); setLine(null); setPaused(false); }} />
              <Button icon="accueil" label={t('btn.home')} onClick={onHome} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
