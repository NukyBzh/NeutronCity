import type { ReactNode } from 'react';
import { iconUrl, poseUrl, type Pose } from '../assets';
import { t } from '../i18n';

/** Decorative icon: the word always sits next to it, so it has no text alternative of its own. */
export function Icon({ name, size = 2.2, className }: { name: string; size?: number; className?: string }) {
  return <img className={className} src={iconUrl(name)} alt="" aria-hidden style={{ width: `${size}rem`, height: `${size}rem` }} />;
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
    <button type="button" className={`btn btn-${kind}${pulse ? ' pulse' : ''}`} onClick={onClick} disabled={disabled}>
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
