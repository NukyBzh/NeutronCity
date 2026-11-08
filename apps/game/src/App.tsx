import { useCallback, useState } from 'react';
import { dayResult, isHeatingDay, type DayResult, type GameState } from '@neutron/engine';
import { DAYS, SHOP, dayById } from './content';
import { Days, Home, Shop, Summary, type DayCard } from './screens/Menus';
import { Play } from './screens/Play';
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

/** A new seed for each game (the surprises change); the user interface is the only place that draws randomness. */
const newSeed = (): number => FIXED_SEED ?? Math.floor(Math.random() * 2 ** 31);

/**
 * The game's screens and the path between them. Progress is kept in memory for now (saving on the device comes with the
 * shop, lot L6); the wallet starts with 2 500 € so the shop can be tried at once.
 */
export function App() {
  const [screen, setScreen] = useState<Screen>(START_SCREEN);
  const [day, setDay] = useState(START_DAY);
  const [seed, setSeed] = useState(newSeed);
  const [round, setRound] = useState(0);
  const [wallet, setWallet] = useState(2500);
  const [owned, setOwned] = useState<string[]>(START_OWNED);
  const [last, setLast] = useState<DayResult>({ euros: 0, max: 0, stars: 1, advice: 'anticiper' });
  const [stars, setStars] = useState<Record<string, number>>({});

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
      return <Home onPlay={() => setScreen('days')} onShop={() => setScreen('shop')} />;
    case 'days':
      return <Days cards={cards} onPick={startDay} onHome={() => setScreen('home')} />;
    case 'play':
      return <Play key={round} day={day} seed={seed} upgrades={owned} onFinish={finish} onRestart={() => startDay(day.id)} onHome={() => setScreen('home')} />;
    case 'summary':
      return <Summary earned={last.euros} stars={last.stars} advice={last.advice} onShop={() => setScreen('shop')} onAgain={() => startDay(day.id)} onDays={() => setScreen('days')} />;
    case 'shop':
      return (
        <Shop items={SHOP} wallet={wallet} owned={owned} onBack={() => setScreen('home')}
          onBuy={(item) => { if (wallet >= item.price && !owned.includes(item.id)) { setWallet(wallet - item.price); setOwned([...owned, item.id]); } }} />
      );
  }
}
