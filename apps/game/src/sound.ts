/**
 * Sound of the game (lot L5, R1-13): a soft background music in a seamless loop and a few short sound effects.
 *
 * - Music: « Happy Clappy Loop » by OwlishMedia, CC0 (assets/SOURCES.md), played through Web Audio so the loop has no gap.
 *   Quieter at night. It starts at the first touch: browsers and the Android WebView forbid sound before that.
 * - Effects: tiny tones made here (no file): click, coin, warning, jingle.
 * - « Son » button: one switch for music and effects, kept on the device (settings, not progress: « Nouveau joueur »
 *   does not change it).
 */
import musicUrl from '../../../assets/audio/musique-happy-clappy-loop.wav?url';

export type Effect = 'click' | 'coin' | 'alert' | 'jingle';

/** Volumes (0 to 1): music low under the voice of the game, a little lower at night. */
export const MUSIC_DAY = 0.32;
export const MUSIC_NIGHT = 0.18;
const EFFECTS = 0.35;

export interface Settings { version: 1; sound: boolean }
const KEY = 'neutron-city.settings';
export const DEFAULT_SETTINGS: Settings = { version: 1, sound: true };

/** Reads the device settings; anything missing or unreadable gives the defaults (sound on). */
export function loadSettings(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Settings {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const s = JSON.parse(raw) as Partial<Settings>;
    return { version: 1, sound: typeof s.sound === 'boolean' ? s.sound : true };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage blocked: the choice simply lasts until the game is closed.
  }
}

/** Notes of each effect: [frequency in Hz, start in s, length in s]. */
const NOTES: Record<Effect, [number, number, number][]> = {
  click: [[880, 0, 0.05]],
  coin: [[1319, 0, 0.08], [1760, 0.07, 0.16]],
  alert: [[660, 0, 0.14], [880, 0.16, 0.2]],
  jingle: [[523, 0, 0.14], [659, 0.12, 0.14], [784, 0.24, 0.14], [1047, 0.36, 0.34]],
};

class SoundSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private loading = false;
  private on = loadSettings().sound;
  private night = false;
  private listeners = new Set<(on: boolean) => void>();

  get enabled(): boolean { return this.on; }

  /** Called on the first touch or key press: creates the audio and starts the music. */
  unlock(): void {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.on ? 1 : 0;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.night ? MUSIC_NIGHT : MUSIC_DAY;
      this.musicGain.connect(this.master);
    }
    if (this.ctx.state === 'suspended' && this.on && !document.hidden) void this.ctx.resume();
    void this.startMusic();
  }

  private async startMusic(): Promise<void> {
    if (!this.ctx || !this.musicGain || this.loading) return;
    this.loading = true;
    try {
      const data = await (await fetch(musicUrl)).arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(data);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(this.musicGain);
      src.start();
    } catch {
      this.loading = false; // No music (file missing or audio refused): the game goes on silently; retried at next touch.
    }
  }

  setEnabled(on: boolean): void {
    this.on = on;
    saveSettings({ version: 1, sound: on });
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
      if (on && this.ctx.state === 'suspended') void this.ctx.resume();
    }
    this.listeners.forEach((f) => f(on));
  }

  subscribe(f: (on: boolean) => void): () => void {
    this.listeners.add(f);
    return () => this.listeners.delete(f);
  }

  /** Night (from 21 h to 7 h): the music fades to a lower volume over a few seconds. */
  setNight(night: boolean): void {
    if (night === this.night) return;
    this.night = night;
    if (this.ctx && this.musicGain) this.musicGain.gain.setTargetAtTime(night ? MUSIC_NIGHT : MUSIC_DAY, this.ctx.currentTime, 1.5);
  }

  play(effect: Effect): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.on || ctx.state !== 'running') return;
    const t0 = ctx.currentTime + 0.01;
    for (const [freq, start, len] of NOTES[effect]) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = effect === 'click' ? 'square' : 'triangle';
      osc.frequency.value = freq;
      const peak = effect === 'click' ? EFFECTS * 0.25 : EFFECTS;
      env.gain.setValueAtTime(0, t0 + start);
      env.gain.linearRampToValueAtTime(peak, t0 + start + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, t0 + start + len);
      osc.connect(env).connect(this.master);
      osc.start(t0 + start);
      osc.stop(t0 + start + len + 0.02);
    }
  }

  /** The app goes to the background (tablet): silence until it comes back. */
  visibility(hidden: boolean): void {
    if (!this.ctx) return;
    if (hidden) void this.ctx.suspend();
    else if (this.on) void this.ctx.resume();
  }
}

export const sound = new SoundSystem();

/** Wires the sound to the page once: first touch unlocks it, hiding the app silences it. */
export function installSound(): void {
  const unlock = () => sound.unlock();
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
  document.addEventListener('visibilitychange', () => sound.visibility(document.hidden));
}
