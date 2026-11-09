import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../src/sound';

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
