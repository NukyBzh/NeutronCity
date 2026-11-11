import { describe, expect, it } from 'vitest';
import { SURPRISE_SPEC, fixSurprise, newGame, stepMinute, isOver, type SurpriseKind } from '@neutron/engine';
import { DAYS } from '../src/content';
import { EMPTY_JOURNAL, MAX_RECORDS, NO_STATS, gameRecord, loadJournal, localStamp, saveJournal, summarize, toCsv, upsert, type Journal } from '../src/journal';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};
const actable = (k: string) => SURPRISE_SPEC[k as SurpriseKind]?.fix !== undefined;
const base = { id: 1, child: 2, at: '2026-11-12T10:00:00' };

describe('play log of the trial (lot L9.1)', () => {
  it('comes back as it was saved; broken data gives an empty log', () => {
    const s = memory();
    expect(loadJournal(s)).toEqual(EMPTY_JOURNAL);
    const j: Journal = upsert({ ...EMPTY_JOURNAL, child: 3 }, { type: 'achat', id: 5, child: 3, at: base.at, item: 'parc', price: 2400 });
    saveJournal(j, s);
    expect(loadJournal(s)).toEqual(j);
    s.setItem('neutron-city.journal', '{oops');
    expect(loadJournal(s)).toEqual(EMPTY_JOURNAL);
    s.setItem('neutron-city.journal', JSON.stringify({ version: 1, child: -2, records: [null, { type: 'x', id: 1 }] }));
    expect(loadJournal(s)).toEqual(EMPTY_JOURNAL);
  });

  it('a game is written again as it goes on (one line), and the oldest lines go beyond the limit', () => {
    const day = DAYS[0]!;
    let g = newGame(day, 7);
    let j = upsert(EMPTY_JOURNAL, gameRecord(base, day, g, NO_STATS, 'interrompu'));
    for (let i = 0; i < 120; i++) g = stepMinute(day, g);
    j = upsert(j, gameRecord(base, day, g, NO_STATS, 'accueil'));
    expect(j.records).toHaveLength(1);
    expect(j.records[0]).toMatchObject({ end: 'accueil', hour: 8, stars: null });
    let big = j;
    for (let i = 0; i < MAX_RECORDS + 5; i++) big = upsert(big, { type: 'achat', id: 100 + i, child: 1, at: base.at, item: 'parc', price: 1 });
    expect(big.records).toHaveLength(MAX_RECORDS);
  });

  it('a finished game has its stars; events acted on and their delay are summed up per child', () => {
    const day = DAYS.find((d) => d.id === 'hiver')!;
    let seed = 1;
    let g = newGame(day, seed);
    while (!g.surprises.some((e) => actable(e.kind))) g = newGame(day, ++seed);
    const i = g.surprises.findIndex((e) => actable(e.kind));
    let acted = false;
    while (!isOver(g)) {
      if (!acted && g.minute / 60 + 6 >= g.surprises[i]!.start + 0.5) {
        const f = fixSurprise(g, i);
        if (f !== g) { g = f; acted = true; }
      }
      g = stepMinute(day, g);
    }
    const r = gameRecord(base, day, g, { ...NO_STATS, seconds: [100.4, 20, 0], tutorial: 'passe-2' }, 'fini');
    expect(r.stars).toBeGreaterThanOrEqual(1);
    expect(r.max).toBeGreaterThan(0);
    expect(r.stats.seconds).toEqual([100, 20, 0]);
    const j = upsert(upsert(EMPTY_JOURNAL, r), { type: 'achat', id: 9, child: 2, at: base.at, item: 'parc', price: 2400, place: '4,6' });
    const [s] = summarize(j, actable);
    expect(s).toMatchObject({ child: 2, games: 1, finished: 1, bought: 1, minutes: 2, tutorial: 'passe-2' });
    expect(s!.acted).toBeGreaterThanOrEqual(1);
    expect(s!.delay).toBeGreaterThanOrEqual(0.5);
    const csv = toCsv(j).split('\r\n');
    expect(csv[0]!.split(';')).toHaveLength(20);
    expect(csv[1]!.split(';')).toHaveLength(20);
    expect(csv[2]!.split(';')).toHaveLength(20);
    expect(csv[2]!.endsWith(';4,6')).toBe(true);
    expect(csv[1]).toContain(`${g.surprises[i]!.kind} `);
  });

  it('local stamp without time zone', () => {
    expect(localStamp(new Date(2026, 10, 2, 9, 5, 7))).toBe('2026-11-02T09:05:07');
  });
});
