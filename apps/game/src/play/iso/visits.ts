/**
 * Who visits which building, and at what time of day (lot L10.5b, R2-05 : « les habitants entrent dans les
 * bâtiments »).
 *
 * Pure and without geometry on purpose: this file only says *who goes where and when*. Where the child put the
 * building, and whether a visit can be drawn there without breaking the depth of the drawing, is `town.ts`'s business.
 *
 * The result only changes when the hour crosses one of the bands below (about six times a day), so the town is not
 * redrawn for it every game minute.
 */

/** Who is walking: each one has a picture seen from the front and one seen from the back. */
export type Who = 'adulte' | 'enfant' | 'dame' | 'famille';
/** `in`: he goes in and stays. `out`: he comes out and leaves. `round`: he goes in, then comes out again. */
export type VisitMode = 'in' | 'out' | 'round';

export interface Visit {
  /** Shop building visited (its id in `content/shop/shop.yaml`). */
  id: string;
  who: Who;
  mode: VisitMode;
}

/** Pictures of each walker: the one that walks towards us, the one that walks away. */
export const WHO_PICTURES: Record<Who, { front: string; back: string; size: number }> = {
  adulte: { front: 'habitant-adulte', back: 'habitant-adulte-dos', size: 32 },
  enfant: { front: 'habitant-enfant', back: 'habitant-enfant-dos', size: 26 },
  dame: { front: 'dame-agee', back: 'dame-agee-dos', size: 33 },
  famille: { front: 'famille-1', back: 'famille-dos', size: 32 },
};

/** School hours (R2-05): the children go in in the morning and come out at the end of the afternoon. */
export const SCHOOL_IN: readonly [number, number] = [7, 9.5];
export const SCHOOL_OUT: readonly [number, number] = [16, 18];

/** The other buildings people go into, who goes there, and between which hours. */
const ROUNDS: readonly { id: string; who: Who; from: number; to: number }[] = [
  { id: 'epicerie', who: 'dame', from: 9, to: 18.5 },
  { id: 'maison-medicale', who: 'adulte', from: 8.5, to: 18 },
  { id: 'piscine', who: 'famille', from: 13, to: 19 },
  { id: 'hopital', who: 'adulte', from: 7, to: 21 },
];
/** Every building that may be visited, school included (tests, and what the town looks for). */
export const VISITED: readonly string[] = ['ecole', ...ROUNDS.map((r) => r.id)];

/** The visits on at this hour, for the buildings the child has already bought. */
export function visitsAt(hour: number, built: readonly string[]): Visit[] {
  const out: Visit[] = [];
  if (built.includes('ecole')) {
    if (hour >= SCHOOL_IN[0] && hour < SCHOOL_IN[1]) out.push({ id: 'ecole', who: 'enfant', mode: 'in' });
    else if (hour >= SCHOOL_OUT[0] && hour < SCHOOL_OUT[1]) out.push({ id: 'ecole', who: 'enfant', mode: 'out' });
  }
  for (const r of ROUNDS) {
    if (built.includes(r.id) && hour >= r.from && hour < r.to) out.push({ id: r.id, who: r.who, mode: 'round' });
  }
  return out;
}

/** Hours at which the visits change: the town is redrawn then, and only then (tests). */
export const VISIT_HOURS: readonly number[] = [...new Set([
  SCHOOL_IN[0], SCHOOL_IN[1], SCHOOL_OUT[0], SCHOOL_OUT[1], ...ROUNDS.flatMap((r) => [r.from, r.to]),
])].sort((a, b) => a - b);
