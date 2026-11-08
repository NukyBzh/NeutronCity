import { useCallback, useState } from 'react';
import { SPRING, SUMMER, maxEuros, starsOf, type DayDef } from './maquette/fakeDay';
import { Days, Home, Shop, Summary, type DayCard } from './screens/Menus';
import { Play } from './screens/Play';
import './app.css';

type Screen = 'home' | 'days' | 'play' | 'summary' | 'shop';

/**
 * Clickable mock-up of lot L1: every screen and the path between them, with a fake day (maquette/fakeDay.ts). The
 * progress is kept in memory only (local save comes with the shop, lot L6). The wallet starts with 2 500 € so the shop
 * can be tried at once.
 */
export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [day, setDay] = useState<DayDef>(SPRING);
  const [wallet, setWallet] = useState(2500);
  const [owned, setOwned] = useState<string[]>([]);
  const [last, setLast] = useState({ earned: 0, stars: 1 });
  const [stars, setStars] = useState<Record<DayCard['id'], number>>({ ete: 3, printemps: 0, hiver: 0 });
  const [round, setRound] = useState(0);

  const cards: DayCard[] = [
    { id: 'ete', stars: stars.ete, locked: false, heat: false, playable: true },
    { id: 'printemps', stars: stars.printemps, locked: false, heat: true, playable: true },
    { id: 'hiver', stars: stars.hiver, locked: stars.printemps === 0, heat: true, playable: false },
  ];

  const finish = useCallback((earned: number) => {
    const st = starsOf(earned, maxEuros(day));
    setLast({ earned, stars: st });
    setWallet((w) => w + earned);
    setStars((s) => ({ ...s, [day.id]: Math.max(s[day.id], st) }));
    setScreen('summary');
  }, [day]);

  const startDay = (id: DayCard['id']) => {
    setDay(id === 'ete' ? SUMMER : SPRING);
    setRound((r) => r + 1);
    setScreen('play');
  };

  switch (screen) {
    case 'home':
      return <Home onPlay={() => setScreen('days')} onShop={() => setScreen('shop')} />;
    case 'days':
      return <Days cards={cards} onPick={startDay} onHome={() => setScreen('home')} />;
    case 'play':
      return <Play key={round} day={day} upgrades={owned} onFinish={finish} onHome={() => setScreen('home')} />;
    case 'summary':
      return <Summary earned={last.earned} stars={last.stars} onShop={() => setScreen('shop')} onAgain={() => startDay(day.id)} onDays={() => setScreen('days')} />;
    case 'shop':
      return (
        <Shop wallet={wallet} owned={owned} onBack={() => setScreen('home')}
          onBuy={(id, price) => { if (wallet >= price && !owned.includes(id)) { setWallet(wallet - price); setOwned([...owned, id]); } }} />
      );
  }
}
