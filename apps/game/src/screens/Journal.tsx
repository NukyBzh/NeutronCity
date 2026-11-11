import { useState } from 'react';
import { SURPRISE_SPEC, type SurpriseKind } from '@neutron/engine';
import { DAYS } from '../content';
import { euros, t } from '../i18n';
import { localStamp, summarize, toCsv, type GameRecord, type Journal } from '../journal';
import { Button, Icon } from '../ui/ui';

/** Lines of the latest games shown on the screen (the export has them all). */
const LATEST = 40;
const actable = (kind: string): boolean => SURPRISE_SPEC[kind as SurpriseKind]?.fix !== undefined;
const hhmm = (h: number): string => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

/**
 * Hidden screen of the trial with children (lot L9.1, D-26), for the adult only: which child plays now, a summary per
 * child, the latest games, and the log as a table (shared as a file, copied, or shown to select by hand).
 */
export function JournalScreen({ journal, onChild, onErase, onBack }: {
  journal: Journal; onChild: (n: number) => void; onErase: () => void; onBack: () => void;
}) {
  const [note, setNote] = useState<string | null>(null);
  const [showCsv, setShowCsv] = useState(false);
  const [asking, setAsking] = useState(false);
  const rows = summarize(journal, actable);
  const games = journal.records.filter((r): r is GameRecord => r.type === 'jour').slice(-LATEST).reverse();
  const csv = toCsv(journal);

  const share = async () => {
    const name = `neutron-city-journal-${localStamp(new Date()).replace(/[:T]/g, '-')}.csv`;
    // A byte order mark so that Excel reads the accents.
    const file = new File([`﻿${csv}`], name, { type: 'text/csv' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t('journal.title') });
        setNote(t('journal.shared'));
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      setNote(t('journal.downloaded', { name }));
    } catch {
      setNote(t('journal.failed'));
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(csv);
      setNote(t('journal.copied'));
    } catch {
      setShowCsv(true);
      setNote(t('journal.failed'));
    }
  };

  return (
    <main className="screen journal">
      <header className="screen-head">
        <Button icon="accueil" label={t('btn.back')} onClick={onBack} />
        <h1>{t('journal.title')}</h1>
      </header>
      <p className="journal-intro">{t('journal.intro')}</p>

      <section className="journal-child panel">
        <span>{t('journal.child')}</span>
        <button type="button" className="journal-step" aria-label={t('journal.child.less')} onClick={() => onChild(Math.max(1, journal.child - 1))}>−</button>
        <b>{journal.child}</b>
        <button type="button" className="journal-step" aria-label={t('journal.child.more')} onClick={() => onChild(journal.child + 1)}>+</button>
        <span className="journal-hint">{t('journal.child.hint')}</span>
      </section>

      <div className="journal-actions">
        <Button kind="primary" icon="passer" label={t('journal.export')} onClick={() => void share()} />
        <Button icon="piece" label={t('journal.copy')} onClick={() => void copy()} />
        <Button icon="etoile" label={t(showCsv ? 'journal.hideTable' : 'journal.showTable')} onClick={() => setShowCsv(!showCsv)} />
        <Button icon="recommencer" label={t('journal.erase')} onClick={() => setAsking(true)} disabled={!journal.records.length} />
        {note ? <p className="journal-note" role="status">{note}</p> : null}
      </div>
      {showCsv ? <textarea className="journal-csv" readOnly value={csv} onFocus={(e) => e.currentTarget.select()} aria-label={t('journal.showTable')} /> : null}

      <h2>{t('journal.byChild')}</h2>
      {rows.length ? (
        <table className="journal-table">
          <thead><tr>
            <th>{t('journal.col.child')}</th><th>{t('journal.col.games')}</th>
            {DAYS.map((d) => <th key={d.id}>{t(`day.${d.id}.title`)}</th>)}
            <th>{t('journal.col.acted')}</th><th>{t('journal.col.delay')}</th><th>{t('journal.col.bought')}</th>
            <th>{t('journal.col.minutes')}</th><th>{t('journal.col.tutorial')}</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.child}>
                <td>{r.child}</td>
                <td>{t('journal.games', { n: String(r.games), done: String(r.finished) })}</td>
                {DAYS.map((d) => <td key={d.id}>{r.best[d.id] ? '★'.repeat(r.best[d.id]!) : '–'}</td>)}
                <td>{r.events ? `${r.acted} / ${r.events}` : '–'}</td>
                <td>{r.delay === null ? '–' : t('journal.minutes', { n: String(Math.round(r.delay * 60)) })}</td>
                <td>{r.bought}</td>
                <td>{r.minutes}</td>
                <td>{t(`journal.tuto.${r.tutorial.startsWith('passe') ? 'passe' : r.tutorial}`, { n: r.tutorial.split('-')[1] ?? '' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p>{t('journal.empty')}</p>}

      <h2>{t('journal.latest')}</h2>
      {games.length ? (
        <table className="journal-table">
          <thead><tr>
            <th>{t('journal.col.when')}</th><th>{t('journal.col.child')}</th><th>{t('journal.col.day')}</th><th>{t('journal.col.end')}</th>
            <th>{t('journal.col.stars')}</th><th>{t('journal.col.euros')}</th><th>{t('journal.col.events')}</th>
          </tr></thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.id}>
                <td>{g.at.slice(5, 16).replace('T', ' ')}</td>
                <td>{g.child}</td>
                <td>{t(`day.${g.day}.title`)}</td>
                <td>{t(`journal.end.${g.end}`, { hour: hhmm(g.hour) })}</td>
                <td>{g.stars ? '★'.repeat(g.stars) : '–'}</td>
                <td>{euros(g.euros)}</td>
                <td>{g.events.filter((e) => actable(e.kind) && e.start <= g.hour).map((e) => t(e.fixed === null ? 'journal.event.missed' : 'journal.event.acted', {
                  name: t(`journal.kind.${e.kind}`), n: String(Math.round(((e.fixed ?? 0) - e.start) * 60)),
                })).join(', ') || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p>{t('journal.empty')}</p>}

      {asking ? (
        <div className="overlay" role="dialog" aria-modal aria-label={t('journal.erase.title')}>
          <div className="overlay-card">
            <h2><Icon name="recommencer" size={2} />{t('journal.erase.title')}</h2>
            <p>{t('journal.erase.text')}</p>
            <div className="row">
              <Button icon="accueil" label={t('btn.cancel')} onClick={() => setAsking(false)} />
              <Button kind="primary" icon="recommencer" label={t('btn.erase')} onClick={() => { onErase(); setAsking(false); setNote(null); }} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
