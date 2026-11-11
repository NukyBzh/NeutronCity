import { useEffect, useRef, useState } from 'react';
import {
  NO_MODS, SURPRISE_SPEC, canFix, clampSetpoints, fixSurprise, gaugesOf, hourOf, isActive, isHeatingDay, isOver, isSurplus, moodOf, setSetpoints,
  type DayDef, type EventMods, type GameState, type Pose, type SurpriseKind, type TownEffect,
} from '@neutron/engine';
import { townUrl } from '../assets';
import { euros, t } from '../i18n';
import { IsoCity } from '../play/IsoCity';
import type { Places } from '../play/iso/town';
import { Clock, CoreBar, Slider } from '../play/Controls';
import { Curves } from '../play/Curves';
import { REAL_SECONDS_PER_GAME_MINUTE, START_HOUR, advance, playUntil, startOf, timelineOf, type Sample } from '../play/session';
import { coinShows, sound, tickSounds } from '../sound';
import { Button, Cassandra, Gauge, Icon, Rich, SoundButton } from '../ui/ui';
import { NO_STATS, type GameEnd, type PlayStats } from '../journal';

/** A bubble stays about 7 s (auto-advance, no "Continue" button). */
const BUBBLE_SECONDS = 7;
/** Hint after about 20 s far from demand without touching anything. */
const IDLE_HINT_SECONDS = 20;

interface Line { id: string; pose: Pose }

/**
 * Guided tutorial of the first game (lot L5): the time stays still while Cassandra shows one thing at a time; the part
 * she talks about is lit, the rest is dimmed. Step « curseur » waits until the child has moved the yellow slider.
 */
type TutoTarget = 'city' | 'curves' | 'elec' | 'controls' | 'piggy';
const TUTO: { id: string; target: TutoTarget; pose: Pose; wait?: boolean }[] = [
  { id: 'tuto.ville', target: 'city', pose: 'accueil' },
  { id: 'tuto.demande', target: 'curves', pose: 'explique' },
  { id: 'tuto.curseur', target: 'elec', pose: 'explique', wait: true },
  { id: 'tuto.centrale', target: 'controls', pose: 'reflechit' },
  { id: 'tuto.tirelire', target: 'piggy', pose: 'bravo' },
];
/** The yellow slider must move this many points before the tutorial goes on. */
const TUTO_MOVE = 5;

/** Events the child acts on (lot L7.1): the Gemini picture on the button, and how to act. */
const EVENT_PICTURE: Partial<Record<SurpriseKind, string>> = {
  storm: 'camion-maintenance', squirrel: 'panneau-alerte', heatLeak: 'fumee', scale: 'reseau-chaleur', newcomers: 'famille-1', classVisit: 'enfants',
};
/** Long press on the valve (milliseconds of real time) and taps to clean the exchanger. */
const HOLD_MS = 1200;
const TAPS = 5;
/** Where a button stands over the town band (% from the left): over its quarter, or in the middle. */
const QUARTER_X = [38, 58, 78];

/** A big button on the town to act on an event: a tap, a long press, or several taps. */
function EventButton({ kind, quarter, onAct }: { kind: SurpriseKind; quarter?: number; onAct: () => void }) {
  const how = SURPRISE_SPEC[kind].fix;
  const [taps, setTaps] = useState(0);
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);
  const stop = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  useEffect(() => stop, []);
  const left = quarter !== undefined ? QUARTER_X[quarter] ?? 50 : 50;
  const label = how === 'taps' ? `${t(`event.${kind}.action`)} · ${t('event.scale.left', { n: String(TAPS - taps) })}` : t(`event.${kind}.action`);
  const handlers = how === 'hold'
    ? {
      onPointerDown: () => { setHolding(true); timer.current = window.setTimeout(() => { stop(); onAct(); }, HOLD_MS); },
      onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop,
    }
    : { onClick: () => { sound.play('click'); if (how === 'taps' && taps + 1 < TAPS) setTaps(taps + 1); else onAct(); } };
  return (
    <button type="button" className={`event-btn pulse${holding ? ' holding' : ''}`} style={{ left: `${left}%` }} aria-label={label} {...handlers}>
      {EVENT_PICTURE[kind] ? <img src={townUrl(EVENT_PICTURE[kind]!)} alt="" draggable={false} /> : null}
      <span>{label}</span>
      {how === 'hold' ? <i className="event-hold" style={{ animationDuration: `${HOLD_MS}ms` }} /> : null}
    </button>
  );
}

/** Review settings in the address (mock-up): `?vitesse=10` plays 10× faster; `?heure=19` starts at 19 h (add `&suivi=non` for a player who never moved). */
const PARAMS = new URLSearchParams(window.location.search);
const SPEED = Math.min(30, Math.max(1, Number(PARAMS.get('vitesse')) || 1));
const REVIEW_START = Math.min(23.9, Math.max(START_HOUR, Number(PARAMS.get('heure')) || START_HOUR));
const REVIEW_FOLLOW = PARAMS.get('suivi') !== 'non';
/** Review: `&tuto=oui&etape=3` opens the tutorial at its third step. */
const REVIEW_STEP = Math.max(1, Number(PARAMS.get('etape')) || 1) - 1;
/** Speeds offered to the player (R1-06): the game time runs 1, 2 or 4 times faster. */
export const SPEEDS = [1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];

export function Play({
  day, seed, upgrades, places, effects = [], mods = NO_MODS, seen = [], onSeen, speed, onSpeed, onFinish, onRestart, onHome, tutorial = false, onTutorialDone, onRecord,
}: {
  day: DayDef;
  /** Effects of the buildings bought on this day's demand (lot L6). */
  effects?: readonly TownEffect[];
  /** How the buildings bought soften the events (lot L7.1). */
  mods?: EventMods;
  /** Events Cassandra has already explained, and what to call once she explains a new one. */
  seen?: readonly string[];
  onSeen?: (kind: string) => void;
  seed: number;
  upgrades: readonly string[];
  /** Lot of each building (lot L9.4). */
  places?: Places;
  speed: Speed;
  onSpeed: (s: Speed) => void;
  onFinish: (game: GameState, stats: PlayStats) => void;
  onRestart: () => void;
  onHome: () => void;
  tutorial?: boolean;
  onTutorialDone?: () => void;
  /** Play log of the trial (lot L9.1): the game as it stands, written at the start, every game hour and when it ends. */
  onRecord?: (game: GameState, stats: PlayStats, end: GameEnd) => void;
}) {
  const [run, setRun] = useState(() => (REVIEW_START > START_HOUR ? playUntil(day, seed, REVIEW_START, REVIEW_FOLLOW, effects, mods) : startOf(day, seed, effects, mods)));
  const [timeline] = useState(() => timelineOf(day, run.game, seen));
  const [paused, setPaused] = useState(false);
  // Held upright (web version, lot L8.2): the game is hidden behind « Tourne ton téléphone », so time stops.
  useEffect(() => {
    const upright = window.matchMedia('(orientation: portrait)');
    const check = () => { if (upright.matches) setPaused(true); };
    check();
    upright.addEventListener('change', check);
    return () => upright.removeEventListener('change', check);
  }, []);
  const [tuto, setTuto] = useState<number | null>(tutorial ? Math.min(REVIEW_STEP, TUTO.length - 1) : null);
  const tutoStart = useRef(run.game.plant.setElec);
  const [line, setLine] = useState<Line | null>(null);
  const [coins, setCoins] = useState<number[]>([]);
  // Red coins leaving the piggy bank while electricity is wasted (D-15).
  const [losses, setLosses] = useState<number[]>([]);
  const clock = useRef({
    real: 0, carry: 0, lastInput: 0, farSince: -1, coreToldAt: -1e9, praised: false, goodSince: -1, surplusSince: -1, surplusToldAt: -1e9, lastLoss: 0,
    next: Math.max(0, timeline.filter((l) => l.hour < hourOf(run.game)).length - 1),
  });
  const current = useRef(run);
  current.current = run;
  const pace = useRef(speed);
  pace.current = speed;

  const say = (id: string, pose: Pose) => setLine({ id, pose });

  // What the play log counts (lot L9.1), written with the game at the start, every game hour and at the end.
  const stats = useRef<PlayStats>({ ...NO_STATS, seconds: [0, 0, 0] });
  const record = useRef(onRecord);
  record.current = onRecord;
  const lastHour = useRef(-1);
  useEffect(() => {
    record.current?.(current.current.game, stats.current, 'interrompu');
  }, []);
  const leave = (end: GameEnd, go: () => void) => {
    record.current?.(current.current.game, stats.current, end);
    go();
  };

  const endTuto = () => {
    if (tuto !== null) stats.current.tutorial = tuto + 1 >= TUTO.length ? 'fini' : `passe-${tuto + 1}`;
    setTuto(null);
    onTutorialDone?.();
  };
  const nextTuto = () => {
    if (tuto === null || tuto + 1 >= TUTO.length) endTuto();
    else setTuto(tuto + 1);
  };

  // Music a little quieter at night (21 h - 7 h); back to day volume when leaving the game.
  useEffect(() => () => sound.setNight(false), []);

  useEffect(() => {
    if (paused || tuto !== null) return undefined;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const c = clock.current;
      // c.real: time of the player (hints, reminders); c.carry: game time, sped up by the speed buttons.
      const dt = Math.min(0.1, (now - last) / 1000) * SPEED;
      last = now;
      c.real += dt;
      c.carry += dt * pace.current;
      stats.current.seconds[pace.current === 4 ? 2 : pace.current === 2 ? 1 : 0] += dt / SPEED;
      let r: { game: GameState; history: Sample[] } = current.current;
      while (c.carry >= REAL_SECONDS_PER_GAME_MINUTE && !isOver(r.game)) {
        c.carry -= REAL_SECONDS_PER_GAME_MINUTE;
        const paid = r.game.paidMinutes;
        r = advance(day, r.game, r.history);
        const p = r.game.paidMinutes;
        if (p > paid && coinShows(p)) {
          setCoins((k) => [...k.slice(-4), p]);
          if (tickSounds(p)) sound.play('tick');
        }
        const w = r.game.stats.surplusElec;
        if (w > 0 && w % 10 === 0 && w !== c.lastLoss) { c.lastLoss = w; setLosses((k) => [...k.slice(-4), w]); }
      }
      if (r !== current.current) {
        current.current = r;
        setRun(r);
      }
      const g = r.game;
      const h = hourOf(g);
      sound.setNight(h >= 21 || h < 7);
      const step = timeline[c.next];
      if (step && h >= step.hour) {
        c.next += 1;
        say(step.say, step.pose);
        // An event explained once is not explained again (lot L7.1).
        if (step.say.endsWith('.why')) onSeen?.(step.say.split('.')[1]!);
        else if (step.say.startsWith('surprise.')) sound.play('alert');
      }
      const view = gaugesOf(day, g);
      if (view.elec === 'loin' || view.heat === 'loin') {
        if (c.farSince < 0) c.farSince = c.real;
        if (c.real - c.farSince > IDLE_HINT_SECONDS && c.real - c.lastInput > IDLE_HINT_SECONDS) {
          const which = view.elec === 'loin' ? 'elec' : 'heat';
          const up = which === 'elec' ? g.plant.elec < view.demand.elec : g.plant.heat < view.demand.heat;
          // Pointing pose: Cassandra shows the slider to move (R1-07).
          say(`jeu.indice.${which}.${up ? 'monter' : 'baisser'}`, 'explique');
          stats.current.hints++;
          c.farSince = c.real;
        }
      } else c.farSince = -1;
      // Electricity wasted for a while: Cassandra says it costs euros (at most every 30 s, D-15).
      if (isSurplus(g.plant.elec, view.demand.elec)) {
        if (c.surplusSince < 0) c.surplusSince = c.real;
        if (c.real - c.surplusSince > 6 && c.real - c.surplusToldAt > 30) {
          c.surplusToldAt = c.real;
          say('jeu.surplus', 'attention');
        }
      } else c.surplusSince = -1;
      if (view.elec === 'bien' && (view.heat === null || view.heat === 'bien')) {
        if (c.goodSince < 0) c.goodSince = h;
        if (!c.praised && h - c.goodSince >= 3) {
          c.praised = true;
          say('jeu.bravo', 'bravo');
        }
      } else c.goodSince = -1;
      if (isOver(g)) {
        onFinish(g, stats.current);
        return;
      }
      if (Math.floor(h) !== lastHour.current) {
        lastHour.current = Math.floor(h);
        record.current?.(g, stats.current, 'interrompu');
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [paused, tuto, day, timeline, onFinish]);

  useEffect(() => {
    if (!line) return undefined;
    const id = window.setTimeout(() => setLine((l) => (l === line ? null : l)), BUBBLE_SECONDS * 1000);
    return () => window.clearTimeout(id);
  }, [line]);

  // The child acts on an event (lot L7.1): the repair starts or the reward is given.
  const act = (index: number) => {
    const r = current.current;
    const game = fixSurprise(r.game, index);
    if (game === r.game) return;
    const next = { ...r, game };
    current.current = next;
    setRun(next);
  };

  // Each event the child acted on (or a class visit succeeded): Cassandra says so, coins for a reward.
  const told = useRef(new Set<number>());
  useEffect(() => {
    run.game.surprises.forEach((e, i) => {
      if (e.fixedAt === undefined || told.current.has(i)) return;
      told.current.add(i);
      say(`surprise.${e.kind}.done`, 'bravo');
      if (SURPRISE_SPEC[e.kind].reward) sound.play('coin');
    });
  }, [run.game.surprises]);

  const setOutput = (moved: 'elec' | 'heat', v: number) => {
    const c = clock.current;
    // A new hold of a slider: the last move was more than a second ago (in real time).
    if (c.real - c.lastInput > 1 || stats.current.moves === 0) stats.current.moves++;
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
    // Tutorial: the child moved the yellow slider enough, Cassandra goes on by herself.
    if (tuto !== null && TUTO[tuto]?.wait && moved === 'elec' && Math.abs(next.game.plant.setElec - tutoStart.current) >= TUTO_MOVE) {
      tutoStart.current = Number.NaN;
      window.setTimeout(() => setTuto((k) => (k === null ? null : k + 1)), 700);
    }
  };

  const g = run.game;
  const hour = hourOf(g);
  const view = gaugesOf(day, g);
  const heatDay = isHeatingDay(day);
  const elecShort = g.plant.elec < view.demand.elec;
  const heatShort = g.plant.heat < view.demand.heat;
  // Pulse the slider to act on: the output far from demand whose setpoint is not already heading the right way.
  const needs = (prod: number, set: number, dem: number) => Math.abs(prod - dem) > 3 && Math.abs(set - dem) > 3;
  const step = tuto === null ? null : TUTO[tuto]!;
  const pulseElec = step ? step.target === 'elec' : needs(g.plant.elec, g.plant.setElec, view.demand.elec);
  const pulseHeat = !step && view.heat !== null && needs(g.plant.heat, g.plant.setHeat, view.demand.heat);
  // The town is repainted when its light changes; at ×4 the light moves once a game hour, not every 5 minutes, so a
  // small tablet keeps 30 images a second at dusk (lot L8.3).
  const lightGrid = speed * SPEED >= 4 ? 1 : 12;

  // Events in the town (lot L7.1): what the child can act on, repairs going on, the class visit, what the town shows.
  const acts = step ? [] : g.surprises.map((e, i) => ({ e, i })).filter(({ e }) => canFix(e, hour));
  const on = g.surprises.filter((e) => isActive(e, hour));
  const cutEv = on.find((e) => SURPRISE_SPEC[e.kind].cut);
  const repairing = on.find((e) => e.fixedAt !== undefined && SURPRISE_SPEC[e.kind].fix && !SURPRISE_SPEC[e.kind].reward);
  const visit = on.find((e) => SURPRISE_SPEC[e.kind].visit !== undefined && e.fixedAt === undefined);
  const scene = {
    cut: cutEv?.quarter ?? null,
    truck: cutEv && cutEv.fixedAt !== undefined ? cutEv.quarter ?? null : null,
    leak: on.some((e) => e.kind === 'heatLeak'),
    family: on.some((e) => e.kind === 'newcomers' && e.fixedAt === undefined),
    visit: visit !== undefined,
  };

  return (
    <main className={`screen play${step ? ' tuto-on' : ''}`} data-tuto={step?.target}>
      <header className="play-top">
        <Button icon="pause" label={t('btn.pause')} onClick={() => setPaused(true)} />
        <div className="play-day">
          <Icon name="matin" size={2} />
          <span>{t(`day.${day.id}.title`)}</span>
          <Clock hour={hour} />
        </div>
        <div className="play-top-right">
          <span className="piggy" aria-label={t('piggy.label', { amount: euros(g.euros) })}>
            <Icon name="tirelire" size={2.4} />
            <b>{euros(g.euros)}</b>
            {coins.map((k) => <span key={k} className="coin"><Icon name="piece" size={1.5} /></span>)}
            {losses.map((k) => <span key={`l${k}`} className="coin lost"><Icon name="piece" size={1.5} /></span>)}
          </span>
          <div className="speed" role="group" aria-label={t('speed.label')}>
            {SPEEDS.map((s) => (
              <button key={s} type="button" className={`speed-btn${s === speed ? ' on' : ''}`} aria-pressed={s === speed} onClick={() => onSpeed(s)}>
                {t('speed.x', { n: String(s) })}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="zone-city" aria-label={t('zone.city')}>
        <IsoCity
          view="band"
          hour={Math.floor(hour * lightGrid) / lightGrid}
          season={day.id}
          mood={moodOf(view.elec, view.heat, elecShort, heatShort)}
          elecOn={g.plant.elec > 0}
          heatOn={heatDay && g.plant.heat > 0}
          upgrades={upgrades}
          places={places}
          scene={scene}
        />
        {acts.length || repairing || visit ? (
          <div className="event-layer">
            {acts.map(({ e, i }) => <EventButton key={`${e.kind}${i}`} kind={e.kind} quarter={e.quarter} onAct={() => act(i)} />)}
            {repairing ? (
              <span className="event-chip"><img src={townUrl('camion-maintenance')} alt="" />{t('event.repair')}</span>
            ) : null}
            {visit ? (
              <span className="event-chip visit">
                <img src={townUrl('enfants')} alt="" />{t('event.classVisit.progress')}
                <i className="visit-bar"><b style={{ width: `${Math.min(100, (g.visitRun / (SURPRISE_SPEC.classVisit.visit ?? 60)) * 100)}%` }} /></i>
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Cassandra stands at the bottom, between the curves and the controls, pointing at the sliders (R1-07). */}
      <div className="play-guide">
        {step ? (
          <Cassandra pose={step.pose} className="play-cassandra">
            <Rich text={t(step.id)} />
            <span className="tuto-buttons">
              {step.wait ? null : (
                <Button kind="primary" pulse icon="jouer" label={t(tuto === TUTO.length - 1 ? 'btn.go' : 'btn.next')} onClick={nextTuto} />
              )}
              {tuto === TUTO.length - 1 ? null : <Button icon="passer" label={t('btn.skip')} onClick={endTuto} />}
            </span>
          </Cassandra>
        ) : (
          <Cassandra pose={line?.pose ?? 'explique'} className="play-cassandra">
            {line ? <Rich text={t(line.id)} /> : null}
          </Cassandra>
        )}
      </div>

      <section className="zone-curves panel" aria-label={t('zone.curves')}>
        <div className="curves-head">
          <span className="legend"><i className="legend-dash" />{t('curves.demand')}</span>
          <span className="legend"><i className="legend-solid" />{t('curves.production')}</span>
          <span className="legend"><i className="legend-band" />{t('curves.band')}</span>
        </div>
        <div className="curves-body">
          <Curves day={day} surprises={g.surprises} effects={g.effects} hour={hour} history={run.history} current={{ h: hour, elec: g.plant.elec, heat: g.plant.heat }} heatOn={heatDay} />
          <div className="curves-gauges">
            <Gauge state={view.elec} />
            {view.heat ? <Gauge state={view.heat} /> : <span />}
          </div>
        </div>
      </section>

      <section className="zone-controls panel" aria-label={t('zone.controls')}>
        <CoreBar elec={g.plant.setElec} heat={g.plant.setHeat} />
        <div className="sliders">
          <Slider kind="elec" setpoint={g.plant.setElec} production={g.plant.elec} onChange={(v) => setOutput('elec', v)} pulse={pulseElec} demand={view.demand.elec} />
          <Slider kind="heat" setpoint={g.plant.setHeat} production={g.plant.heat} onChange={(v) => setOutput('heat', v)} pulse={pulseHeat} demand={heatDay ? view.demand.heat : null} disabled={!heatDay} />
        </div>
      </section>

      {paused ? (
        <div className="overlay" role="dialog" aria-modal aria-label={t('pause.title')}>
          <div className="overlay-card">
            <h2><Icon name="pause" size={2} />{t('pause.title')}</h2>
            <p>{t('pause.text')}</p>
            <div className="row">
              <Button kind="primary" pulse icon="jouer" label={t('btn.resume')} onClick={() => setPaused(false)} />
              <Button icon="recommencer" label={t('btn.restart')} onClick={() => leave('recommence', onRestart)} />
              <Button icon="accueil" label={t('btn.home')} onClick={() => leave('accueil', onHome)} />
            </div>
            <SoundButton />
          </div>
        </div>
      ) : null}
    </main>
  );
}
