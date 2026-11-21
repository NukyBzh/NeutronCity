/**
 * Sound of the game (lot L5, R1-13): a soft background music in a seamless loop and a few short sound effects.
 *
 * - Music: « Happy Clappy Loop » by OwlishMedia, CC0 (assets/SOURCES.md), played through Web Audio so the loop has no gap.
 *   Quieter at night. It starts at the first touch: browsers and the Android WebView forbid sound before that.
 * - Effects: tiny tones made here (no file): click, tick (euros earned), coin (a real gain), warning, jingle.
 * - Sounds of the events (lot L10.4, R2-01): short CC0 recordings in `assets/audio/evenements/` (assets/SOURCES.md),
 *   played once (fireworks, thunder, clinking glasses, « ouais ») or in a loop that fades in and out (rain, crowd,
 *   wind). A file that is missing simply makes no sound: the game never waits for one.
 * - « Son » button: one switch for music and effects, kept on the device (settings, not progress: « Nouveau joueur »
 *   does not change it).
 */
import musicUrl from '../../../assets/audio/musique-happy-clappy-loop.wav?url';

export type Effect = 'click' | 'tick' | 'coin' | 'alert' | 'jingle';

/** Sounds of the events (lot L10.4): one WAV each in `assets/audio/evenements/`. */
export type Clip = 'pluie' | 'tonnerre' | 'foule' | 'feu-artifice-1' | 'feu-artifice-2' | 'verres' | 'ouais' | 'vent';
const clipFiles = import.meta.glob<string>('../../../assets/audio/evenements/*.wav', { eager: true, query: '?url', import: 'default' });
const CLIPS: Record<string, string> = Object.fromEntries(
  Object.entries(clipFiles).map(([path, url]) => [path.split('/').pop()!.replace(/\.\w+$/, ''), url]),
);
/** True when the file of a sound is there (tests, and the review of a lot before the sounds are delivered). */
export const hasClip = (name: Clip): boolean => CLIPS[name] !== undefined;
/** Seconds of the fade in and out of a looping sound (rain, crowd, wind). */
const LOOP_FADE = 0.8;

/**
 * Euros earned while playing (lot L9.3): a coin shows every 10 paid minutes, but the soft « tick » only every game hour
 * (18 at most a day instead of 108, which annoyed the players). The bright « coin » is kept for real gains.
 */
export const COIN_EVERY = 10;
export const TICK_EVERY = 60;
export const coinShows = (paidMinutes: number): boolean => paidMinutes > 0 && paidMinutes % COIN_EVERY === 0;
export const tickSounds = (paidMinutes: number): boolean => paidMinutes > 0 && paidMinutes % TICK_EVERY === 0;

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
  tick: [[1175, 0, 0.06]],
  coin: [[1319, 0, 0.08], [1760, 0.07, 0.16]],
  alert: [[660, 0, 0.14], [880, 0.16, 0.2]],
  jingle: [[523, 0, 0.14], [659, 0.12, 0.14], [784, 0.24, 0.14], [1047, 0.36, 0.34]],
};

class SoundSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private loading = false;
  /** Sounds of the events, read once each (lot L10.4); a promise of null: no file, no sound. */
  private clips = new Map<Clip, Promise<AudioBuffer | null>>();
  /** Looping sounds playing now (rain, crowd, wind). */
  private loops = new Map<Clip, { src: AudioBufferSourceNode; gain: GainNode }>();
  /** Looping sounds the game asks for, playing or not yet (no sound before the first touch). */
  private wanted = new Map<Clip, number>();
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
    // An event may have started before the first touch (the sound could not exist yet): its loop begins now.
    this.catchUpLoops();
  }

  /** Starts the looping sounds asked for while the sound was not ready yet (first touch, « Son » switched back on). */
  private catchUpLoops(): void {
    for (const [name, gain] of this.wanted) this.startLoop(name, gain);
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
    if (on) this.catchUpLoops();
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
      const peak = effect === 'click' ? EFFECTS * 0.25 : effect === 'tick' ? EFFECTS * 0.4 : EFFECTS;
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

  /** Reads a sound file once and keeps it; a file that is missing or unreadable gives null (no sound, no retry). */
  private async buffer(name: Clip): Promise<AudioBuffer | null> {
    const url = CLIPS[name];
    if (!url || !this.ctx) return null;
    const had = this.clips.get(name);
    if (had !== undefined) return had;
    const job = (async () => {
      try {
        const data = await (await fetch(url)).arrayBuffer();
        return await this.ctx!.decodeAudioData(data);
      } catch {
        return null;
      }
    })();
    this.clips.set(name, job);
    return job;
  }

  /** Plays a sound of an event once (fireworks, thunder, glasses, « ouais »). */
  clip(name: Clip, gain = 0.5, rate = 1): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.on) return;
    void this.buffer(name).then((buf) => {
      if (!buf || !this.on || !this.ctx || !this.master || this.ctx.state !== 'running') return;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = rate;
      const g = this.ctx.createGain();
      g.gain.value = gain;
      src.connect(g).connect(this.master);
      src.start();
    });
  }

  /**
   * Starts or stops a looping sound of an event (rain, crowd, wind), fading it in and out. Asked for before the first
   * touch (no sound yet), it is remembered and starts as soon as the sound is ready.
   */
  loop(name: Clip, on: boolean, gain = 0.4): void {
    if (!on) {
      this.wanted.delete(name);
      this.stopLoop(name);
      return;
    }
    this.wanted.set(name, gain);
    this.startLoop(name, gain);
  }

  private startLoop(name: Clip, gain: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.on || this.loops.has(name)) return;
    // Noted at once, so two calls in the same moment never start the sound twice.
    const holder = { src: ctx.createBufferSource(), gain: ctx.createGain() };
    this.loops.set(name, holder);
    void this.buffer(name).then((buf) => {
      if (!buf || this.loops.get(name) !== holder || !this.ctx || !this.master) { this.loops.delete(name); return; }
      holder.src.buffer = buf;
      holder.src.loop = true;
      holder.gain.gain.value = 0;
      holder.src.connect(holder.gain).connect(this.master);
      holder.src.start();
      holder.gain.gain.setTargetAtTime(gain, this.ctx.currentTime, LOOP_FADE / 3);
    });
  }

  private stopLoop(name: Clip): void {
    const ctx = this.ctx;
    const live = this.loops.get(name);
    if (!ctx || !live) return;
    this.loops.delete(name);
    live.gain.gain.cancelScheduledValues(ctx.currentTime);
    live.gain.gain.setTargetAtTime(0, ctx.currentTime, LOOP_FADE / 3);
    const src = live.src;
    window.setTimeout(() => { try { src.stop(); } catch { /* already stopped */ } }, LOOP_FADE * 1000 + 200);
  }

  /** Leaving the game screen: every looping sound of an event stops, and none is waiting to start. */
  stopLoops(): void {
    this.wanted.clear();
    for (const name of [...this.loops.keys()]) this.stopLoop(name);
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
