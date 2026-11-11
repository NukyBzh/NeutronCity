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
