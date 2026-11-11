import { useEffect, useState, type ReactNode } from 'react';
import { iconUrl, poseUrl, type Pose } from '../assets';
import { t } from '../i18n';
import { sound } from '../sound';

/** Decorative icon: the word always sits next to it, so it has no text alternative of its own. */
export function Icon({ name, size = 2.2, className }: { name: string; size?: number; className?: string }) {
  return <img className={className} src={iconUrl(name)} alt="" aria-hidden style={{ width: `${size}rem`, height: `${size}rem`, objectFit: 'contain' }} />;
}

/** Button = icon + word (ergonomics rule), at least 3.2 rem (64 px at 1280×800) high. */
export function Button(props: {
  icon: string;
  label: string;
  onClick: () => void;
  kind?: 'primary' | 'secondary';
  pulse?: boolean;
  disabled?: boolean;
}) {
  const { icon, label, onClick, kind = 'secondary', pulse = false, disabled = false } = props;
  return (
    <button type="button" className={`btn btn-${kind}${pulse ? ' pulse' : ''}`} onClick={() => { sound.play('click'); onClick(); }} disabled={disabled}>
      <span className="btn-icon"><Icon name={icon} size={1.7} /></span>
      <span>{label}</span>
    </button>
  );
}

export type GaugeState = 'bien' | 'presque' | 'loin';
const GAUGE_LABEL: Record<GaugeState, string> = { bien: 'gauge.bien', presque: 'gauge.presque', loin: 'gauge.loin' };

/** Follow-up gauge: colour + pictogram + word, never the colour alone. */
export function Gauge({ state }: { state: GaugeState }) {
  return (
    <span className={`gauge gauge-${state}`} role="status">
      <Icon name={state} size={1.6} />
      {t(GAUGE_LABEL[state])}
    </span>
  );
}

/** Cassandra with a pose and an optional speech bubble. */
export function Cassandra({ pose, children, className = '' }: { pose: Pose; children?: ReactNode; className?: string }) {
  return (
    <div className={`cassandra ${className}`}>
      {children ? <div className="bubble" aria-live="polite">{children}</div> : null}
      <img className="cassandra-img" src={poseUrl(pose)} alt={t('cassandra.alt')} />
    </div>
  );
}

/** Text with **one** word in bold (Cassandra's new word), written `**word**` in the content files. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/);
  return <>{parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : p))}</>;
}

/** Stars of a day: always drawn as pictograms, the number is only spoken to screen readers. */
export function Stars({ count, max = 3, size = 2.4 }: { count: number; max?: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={t('stars.label', { count: String(count), max: String(max) })}>
      {Array.from({ length: max }, (_, i) => (
        <Icon key={i} name="etoile" size={size} className={i < count ? 'star-on' : 'star-off'} />
      ))}
    </span>
  );
}

/** « Son » button (lot L5): one switch for the music and the sound effects, the choice is kept on the device. */
export function SoundButton() {
  const [on, setOn] = useState(sound.enabled);
  useEffect(() => sound.subscribe(setOn), []);
  return (
    <button type="button" className="btn btn-secondary btn-sound" aria-pressed={on} title={t('sound.label')}
      onClick={() => { sound.unlock(); sound.setEnabled(!on); }}>
      <span className="btn-icon"><Icon name={on ? 'son' : 'son-coupe'} size={1.7} /></span>
      <span>{t(on ? 'btn.soundOn' : 'btn.soundOff')}</span>
    </button>
  );
}

/**
 * Portrait screen (lot L8.2, D-23): the game is played in landscape only. On a phone or a tablet held upright (web
 * version; the Android app is locked in landscape), Cassandra asks to turn it. Hidden by the style sheet otherwise.
 */
export function RotateHint() {
  return (
    <div className="rotate" role="alert">
      <span className="rotate-phone" aria-hidden />
      <p>{t('rotate.text')}</p>
      <img className="rotate-cassandra" src={poseUrl('explique')} alt={t('cassandra.alt')} />
    </div>
  );
}
