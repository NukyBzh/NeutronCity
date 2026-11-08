import { useCallback, useEffect, useState } from 'react';
import { dayResult, isHeatingDay, type DayResult, type GameState } from '@neutron/engine';
import { DAYS, SHOP, dayById } from './content';
import { Days, Home, Shop, Summary, type DayCard } from './screens/Menus';
import { Play, type Speed } from './screens/Play';
import { EMPTY, clearProgress, loadProgress, saveProgress } from './save';
import './app.css';

type Screen = 'home' | 'days' | 'play' | 'summary' | 'shop';

/**
 * Review settings in the address: `?ecran=jeu&journee=ete&heure=19&achats=parc,fontaine&graine=42` opens a screen
 * directly (`accueil`, `journees`, `jeu`, `bilan`, `boutique`), with a day, upgrades already bought and a fixed seed.
 */
const PARAMS = new URLSearchParams(window.location.search);
const SCREENS: Record<string, Screen> = { accueil: 'home', journees: 'days', jeu: 'play', bilan: 'summary', boutique: 'shop' };
const START_SCREEN = SCREENS[PARAMS.get('ecran') ?? ''] ?? 'home';
const START_DAY = dayById(PARAMS.get('journee') ?? '') ?? DAYS[0]!;
const START_OWNED = (PARAMS.get('achats') ?? '').split(',').filter(Boolean);
const FIXED_SEED = PARAMS.has('graine') ? Number(PARAMS.get('graine')) >>> 0 : null;
/** Reviewing a screen through the address never reads nor changes the player's saved progress. */
const REVIEW = PARAMS.has('ecran') || PARAMS.has('achats');
const SAVED = REVIEW ? { ...EMPTY, wallet: 2500, owned: START_OWNED } : loadProgress();

/** A new seed for each game (the surprises change); the user interface is the only place that draws randomness. */
const newSeed = (): number => FIXED_SEED ?? Math.floor(Math.random() * 2 ** 31);

/**
 * The game's screens and the path between them. Progress (euros, upgrades, stars) is saved on the device after each
 * change; « Nouveau joueur » on the home screen erases it (for test sessions with several children).
 */
export function App() {
  const [screen, setScreen] = useState<Screen>(START_SCREEN);
  const [day, setDay] = useState(PARAMS.has('journee') ? START_DAY : dayById(SAVED.lastDay ?? '') ?? START_DAY);
  const [seed, setSeed] = useState(newSeed);
  const [round, setRound] = useState(0);
  const [wallet, setWallet] = useState(SAVED.wallet);
  const [owned, setOwned] = useState<string[]>(SAVED.owned);
  const [last, setLast] = useState<DayResult>({ euros: 0, max: 0, stars: 1, advice: 'anticiper' });
  const [stars, setStars] = useState<Record<string, number>>(SAVED.stars);
  // Speed chosen by the player, kept from one day to the next (not saved).
  const [speed, setSpeed] = useState<Speed>(1);
  // Upgrade just bought: it appears in the town with a short animation.
  const [fresh, setFresh] = useState<string | null>(null);

  useEffect(() => {
    if (!REVIEW) saveProgress({ version: 1, wallet, owned, stars, lastDay: day.id });
  }, [wallet, owned, stars, day]);

  const reset = () => {
    clearProgress();
    setWallet(0);
    setOwned([]);
    setStars({});
    setDay(DAYS[0]!);
  };

  // A day opens once the day before it has been finished (one star at least).
  const cards: DayCard[] = DAYS.map((d, i) => ({
    id: d.id,
    stars: stars[d.id] ?? 0,
    locked: i > 0 && !(stars[DAYS[i - 1]!.id] ?? 0),
    heat: isHeatingDay(d),
  }));

  const finish = useCallback((game: GameState) => {
    const r = dayResult(day, game);
    setLast(r);
    setWallet((w) => w + r.euros);
    setStars((s) => ({ ...s, [day.id]: Math.max(s[day.id] ?? 0, r.stars) }));
    setScreen('summary');
  }, [day]);

  const startDay = (id: string) => {
    setDay(dayById(id) ?? DAYS[0]!);
    setSeed(newSeed());
    setRound((r) => r + 1);
    setScreen('play');
  };

  switch (screen) {
    case 'home':
      return <Home onPlay={() => setScreen('days')} onShop={() => setScreen('shop')} onReset={reset} />;
    case 'days':
      return <Days cards={cards} onPick={startDay} onHome={() => setScreen('home')} />;
    case 'play':
      return <Play key={round} day={day} seed={seed} upgrades={owned} speed={speed} onSpeed={setSpeed} onFinish={finish} onRestart={() => startDay(day.id)} onHome={() => setScreen('home')} />;
    case 'summary':
      return <Summary earned={last.euros} stars={last.stars} advice={last.advice} season={day.id} upgrades={owned} onShop={() => setScreen('shop')} onAgain={() => startDay(day.id)} onDays={() => setScreen('days')} />;
    case 'shop':
      return (
        <Shop items={SHOP} wallet={wallet} owned={owned} fresh={fresh} season={day.id} onBack={() => { setFresh(null); setScreen('home'); }}
          onBuy={(item) => { if (wallet >= item.price && !owned.includes(item.id)) { setWallet(wallet - item.price); setOwned([...owned, item.id]); setFresh(item.id); } }} />
      );
  }
}
