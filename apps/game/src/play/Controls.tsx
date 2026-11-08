import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { RATED_ELEC_MW, RATED_HEAT_MW } from '@neutron/engine';
import { t } from '../i18n';
import { Icon } from '../ui/ui';

/**
 * Big vertical slider of one output. The knob is the player's setpoint, the coloured level is what the plant really
 * produces (it follows with the ramp). Values in % and MW side by side. Steps of 5 %.
 */
export function Slider(props: {
  kind: 'elec' | 'heat';
  setpoint: number;
  production: number;
  onChange: (v: number) => void;
  pulse: boolean;
  /** What the town asks for now, in % (shown as a number and a dashed mark on the track); null when not asked. */
  demand: number | null;
  disabled?: boolean;
}) {
  const { kind, setpoint, production, onChange, pulse, demand, disabled = false } = props;
  const track = useRef<HTMLDivElement>(null);
  const fromPointer = (e: PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    const v = Math.round(((r.bottom - e.clientY) / r.height) * 20) * 5;
    onChange(Math.min(100, Math.max(0, v)));
  };
  const onKey = (e: KeyboardEvent) => {
    const d = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 25, PageDown: -25 }[e.key];
    if (d !== undefined) {
      e.preventDefault();
      onChange(Math.min(100, Math.max(0, setpoint + d)));
    }
  };
  const mw = Math.round((setpoint / 100) * (kind === 'elec' ? RATED_ELEC_MW : RATED_HEAT_MW));
  const label = t(kind === 'elec' ? 'output.elec' : 'output.heat');
  return (
    <div className={`slider slider-${kind}${disabled ? ' slider-off' : ''}`}>
      <div className="slider-title"><Icon name={kind === 'elec' ? 'electricite' : 'chaleur'} size={1.6} />{label}</div>
      <div className="slider-demand" aria-label={demand === null ? undefined : t('slider.demandtext', { pct: String(Math.round(demand)) })}>
        {demand === null ? ' ' : t('slider.demand', { pct: String(Math.round(demand)) })}
      </div>
      <div
        className="slider-track"
        ref={track}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={setpoint}
        aria-valuetext={t('slider.valuetext', { pct: String(setpoint), mw: String(mw) })}
        aria-disabled={disabled}
        onKeyDown={disabled ? undefined : onKey}
        onPointerDown={disabled ? undefined : (e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
        onPointerMove={disabled ? undefined : (e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e); }}
      >
        {[0, 25, 50, 75, 100].map((g) => <span key={g} className={`tick${g % 50 === 0 ? ' tick-big' : ''}`} style={{ bottom: `${g}%` }} />)}
        <div className="rail"><div className="level" style={{ height: `${production}%` }} /></div>
        {demand === null ? null : <span className="target" style={{ bottom: `${demand}%` }} />}
        <div className={`knob${pulse ? ' pulse' : ''}`} style={{ bottom: `${setpoint}%` }}><i /><i /><i /></div>
      </div>
      <div className="slider-value">{t('slider.value', { pct: String(setpoint), mw: String(mw) })}</div>
    </div>
  );
}

/** Share of the core (D-01): electricity + heat, never more than 100 %. No number; a padlock when it is full. */
export function CoreBar({ elec, heat }: { elec: number; heat: number }) {
  const full = elec + heat >= 100;
  return (
    <div className="core" role="img" aria-label={t(full ? 'core.full' : 'core.label')}>
      <Icon name="centrale" size={1.9} />
      <span className="core-word">{t('core.word')}</span>
      <div className="core-bar">
        <span className="core-elec" style={{ width: `${elec}%` }} />
        <span className="core-heat" style={{ width: `${heat}%` }} />
      </div>
      <Icon name="cadenas" size={1.7} className={full ? 'lock-on pop' : 'lock-off'} />
    </div>
  );
}

/** Clock: hands, and the time written hh:mm next to them (in steps of 5 minutes, so it can be read while it runs). */
export function Clock({ hour }: { hour: number }) {
  const hh = ((hour % 12) / 12) * 360;
  const mm = ((hour % 1) * 360);
  const h = Math.floor(hour) % 24;
  const m = Math.floor(((hour % 1) * 60) / 5) * 5;
  const two = (v: number) => String(v).padStart(2, '0');
  return (
    <span className="clock-box" role="img" aria-label={t('clock.label', { h: String(h), m: two(m) })}>
    <svg className="clock" viewBox="0 0 48 48" aria-hidden>
      <circle cx={24} cy={24} r={21} fill="#FFFFFF" stroke="#1C2A4A" strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={24} y1={6} x2={24} y2={i % 3 === 0 ? 10 : 8} stroke="#1C2A4A" strokeWidth={2} transform={`rotate(${i * 30} 24 24)`} />
      ))}
      <line x1={24} y1={24} x2={24} y2={13} stroke="#1C2A4A" strokeWidth={4} strokeLinecap="round" transform={`rotate(${hh} 24 24)`} />
      <line x1={24} y1={24} x2={24} y2={8} stroke="#1D47B8" strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${mm} 24 24)`} />
      <circle cx={24} cy={24} r={2.5} fill="#1C2A4A" />
    </svg>
    <b className="clock-digits" aria-hidden>{t('clock.time', { hh: two(h), mm: two(m) })}</b>
    </span>
  );
}
