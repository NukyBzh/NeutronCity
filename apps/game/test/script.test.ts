import { describe, expect, it } from 'vitest';
import { SPRING, SUMMER } from '../src/maquette/fakeDay';
import { scriptFor } from '../src/maquette/script';

describe("Cassandra's script follows the day", () => {
  it('summer: no heating talk and no surprise announcement', () => {
    const ids = scriptFor(SUMMER).map((l) => l.id);
    expect(ids).not.toContain('jeu.chauffage.baisse');
    expect(ids).not.toContain('jeu.surprise.match');
  });

  it('spring: the surprise is announced one hour before it starts, lines in time order', () => {
    const lines = scriptFor(SPRING);
    const match = lines.find((l) => l.id === 'jeu.surprise.match');
    expect(match?.hour).toBe(SPRING.surprise!.start - 1);
    expect(lines.map((l) => l.hour)).toEqual([...lines.map((l) => l.hour)].sort((a, b) => a - b));
  });
});
