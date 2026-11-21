import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, coinShows, loadSettings, saveSettings, tickSounds } from '../src/sound';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe('« Son » setting kept on the device (lot L5)', () => {
  it('is on by default, and when the data is broken', () => {
    const s = memory();
    expect(loadSettings(s)).toEqual(DEFAULT_SETTINGS);
    s.setItem('neutron-city.settings', '{oops');
    expect(loadSettings(s).sound).toBe(true);
  });

  it('comes back as the player left it', () => {
    const s = memory();
    saveSettings({ version: 1, sound: false }, s);
    expect(loadSettings(s).sound).toBe(false);
  });
});

describe('euros earned while playing (lot L9.3)', () => {
  it('shows a coin every 10 paid minutes but sounds the soft tick only every game hour', () => {
    const minutes = Array.from({ length: 18 * 60 }, (_, k) => k + 1);
    expect(minutes.filter(coinShows)).toHaveLength(108);
    expect(minutes.filter(tickSounds)).toHaveLength(18);
    expect(minutes.filter(tickSounds).every(coinShows)).toBe(true);
    expect(tickSounds(0)).toBe(false);
  });
});

describe('sounds of the events (lot L10.4, R2-01)', () => {
  const dir = fileURLToPath(new URL('../../../assets/audio/evenements/', import.meta.url));
  /** Every sound the game asks for, as `Clip` in src/sound.ts. */
  const CLIPS = ['pluie', 'tonnerre', 'foule', 'feu-artifice-1', 'feu-artifice-2', 'verres', 'ouais', 'vent'];

  it('each one has its file, light and in a format every device reads', () => {
    const files = readdirSync(dir);
    expect(files.filter((f) => !f.endsWith('.wav'))).toEqual([]);
    for (const name of CLIPS) {
      const p = join(dir, `${name}.wav`);
      expect(existsSync(p), name).toBe(true);
      const head = readFileSync(p).subarray(0, 44);
      expect(head.toString('ascii', 0, 4), name).toBe('RIFF');
      expect(head.toString('ascii', 8, 12), name).toBe('WAVE');
      // Mono, 16 bits, at most 22 050 Hz: a WAV is read everywhere (the Ogg of the sources is not, on iPhone).
      expect(head.readUInt16LE(22), name).toBe(1);
      expect(head.readUInt16LE(34), name).toBe(16);
      expect(head.readUInt32LE(24), name).toBeLessThanOrEqual(22050);
      expect(statSync(p).size, name).toBeLessThan(200 * 1024);
    }
  });

  it('all of them together stay lighter than the music', () => {
    const total = readdirSync(dir).reduce((n, f) => n + statSync(join(dir, f)).size, 0);
    expect(total).toBeLessThan(1_000_000);
  });
});
