import { useCallback, useEffect, useRef, useState } from 'react';
import {
  dayBonus, dayEffects, dayResult, eventMods, heatOpen, isHeatingDay, shopStatus, starBonus, welcomeGift, type DayResult, type GameState,
} from '@neutron/engine';
import { DAYS, SHOP, dayById } from './content';
import { Days, Home, Shop, Summary, type DayCard } from './screens/Menus';
import { Play, type Speed } from './screens/Play';
import { JournalScreen } from './screens/Journal';
import { gameRecord, loadJournal, localStamp, saveJournal, upsert, type BuyRecord, type GameEnd, type Journal, type PlayStats } from './journal';
import { EMPTY, clearProgress, loadProgress, saveProgress } from './save';
import { PLACEABLE, freeLots, quarterOf, settle, type Places } from './play/iso/town';
import './app.css';

type Screen = 'home' | 'days' | 'play' | 'summary' | 'shop' | 'journal';

/**
 * Review settings in the address: `?ecran=jeu&journee=ete&heure=19&achats=parc,fontaine&graine=42` opens a screen
 * directly (`accueil`, `journees`, `jeu`, `bilan`, `boutique`), with a day, upgrades already bought and a fixed seed.
 */
const PARAMS = new URLSearchParams(window.location.search);
const SCREENS: Record<string, Screen> = { accueil: 'home', journees: 'days', jeu: 'play', bilan: 'summary', boutique: 'shop', journal: 'journal' };
const START_SCREEN = SCREENS[PARAMS.get('ecran') ?? ''] ?? 'home';
const START_DAY = dayById(PARAMS.get('journee') ?? '') ?? DAYS[0]!;
const START_OWNED = (PARAMS.get('achats') ?? '').split(',').filter(Boolean);
/** Review: `&nouveau=fontaine` shows the shop just after buying that upgrade. */
const START_FRESH = PARAMS.get('nouveau');
/** Review: `&placer=ferme` shows the shop while that upgrade (in `achats`) waits for its lot (lot L9.4). */
const START_PLACING = PARAMS.get('placer');
const FIXED_SEED = PARAMS.has('graine') ? Number(PARAMS.get('graine')) >>> 0 : null;
/** Reviewing a screen through the address never reads nor changes the player's saved progress. */
const REVIEW = PARAMS.has('ecran') || PARAMS.has('achats');
const SAVED = REVIEW ? { ...EMPTY, wallet: 7500, owned: START_OWNED, tuto: true } : loadProgress();
/** Review: `&tuto=oui` opens the game with the guided tutorial. */
const FORCE_TUTO = PARAMS.get('tuto') === 'oui';

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
  // Lot of each building (lot L9.4): chosen by the child; progress saved before gets the default plots.
  const [places, setPlaces] = useState<Places>(() => settle(SAVED.owned, SAVED.places ?? {}, START_PLACING));
  // Building just bought that waits for its lot: the shop asks the child where to build it.
  const [placing, setPlacing] = useState<string | null>(START_PLACING);
  const [last, setLast] = useState<DayResult>({ euros: 0, max: 0, stars: 1, advice: 'anticiper' });
  // Euros paid by the town's buildings at the end of the last day (D-19 E1).
  const [lastBonus, setLastBonus] = useState(REVIEW ? dayBonus(SHOP, START_OWNED) : 0);
  // What the town's buildings would pay with 3 stars (the summary says why it paid less, D-21).
  const [townBonus, setTownBonus] = useState(REVIEW ? dayBonus(SHOP, START_OWNED) : 0);
  // Welcome gift of the last day (lot L9.3): what Cassandra added so that the first building can be bought.
  const [lastGift, setLastGift] = useState(PARAMS.has('cadeau') ? Number(PARAMS.get('cadeau')) || 0 : 0);
  // Events Cassandra has already explained (lot L7.1).
  const [seen, setSeen] = useState<string[]>(SAVED.seen);
  const [stars, setStars] = useState<Record<string, number>>(SAVED.stars);
  // Speed chosen by the player, kept from one day to the next (not saved).
  const [speed, setSpeed] = useState<Speed>(1);
  // Upgrade just bought: it appears in the town with a short animation.
  const [fresh, setFresh] = useState<string | null>(START_FRESH);
  // Guided tutorial (lot L5): seen once per player, shown again with « Revoir l'aide ».
  const [tutoSeen, setTutoSeen] = useState(SAVED.tuto && !FORCE_TUTO);
  const [tutoAsked, setTutoAsked] = useState(false);
  // Play log of the trial with children (lot L9.1, D-26): kept on the device, never written in review mode.
  const [journal, setJournal] = useState<Journal>(loadJournal);
  const game = useRef({ id: 0, at: '' });
  // Last purchase written in the play log: the lot chosen is added to it (lot L9.4).
  const lastBuy = useRef<BuyRecord | null>(null);
  const log = useCallback((change: (j: Journal) => Journal) => {
    if (REVIEW) return;
    setJournal((j) => { const next = change(j); saveJournal(next); return next; });
  }, []);
  const logGame = useCallback((g: GameState, stats: PlayStats, end: GameEnd) => {
    log((j) => upsert(j, gameRecord({ ...game.current, child: j.child }, day, g, stats, end)));
  }, [day, log]);

  useEffect(() => {
    if (!REVIEW) saveProgress({ version: 1, wallet, owned, stars, lastDay: day.id, tuto: tutoSeen, seen, places: places as Record<string, [number, number]> });
  }, [wallet, owned, stars, day, tutoSeen, seen, places]);

  const reset = () => {
    clearProgress();
    // A new player is the next child of the trial (the log itself stays).
    log((j) => (j.records.some((r) => r.child === j.child) ? { ...j, child: j.child + 1 } : j));
    setWallet(0);
    setOwned([]);
    setPlaces({});
    setPlacing(null);
    setStars({});
    setDay(DAYS[0]!);
    setTutoSeen(false);
    setSeen([]);
  };

  // A day opens once the day before it has been finished (one star at least); a day with heat also needs the heat
  // network (D-19 E5), unless the player already has stars on it (progress saved before v0.8.0).
  const heat = heatOpen(SHOP, owned);
  const cards: DayCard[] = DAYS.map((d, i) => {
    const prev = i > 0 && !(stars[DAYS[i - 1]!.id] ?? 0);
    const noHeat = isHeatingDay(d) && !heat && !(stars[d.id] ?? 0);
    return { id: d.id, stars: stars[d.id] ?? 0, locked: prev || noHeat, lockReason: noHeat ? 'heat' : 'prev', heat: isHeatingDay(d) };
  });

  const finish = useCallback((g: GameState, stats: PlayStats) => {
    logGame(g, stats, 'fini');
    const r = dayResult(day, g);
    const full = dayBonus(SHOP, owned);
    const bonus = starBonus(full, r.stars);
    setLast(r);
    setLastBonus(bonus);
    setTownBonus(full);
    const gift = welcomeGift(SHOP, owned, wallet + r.euros + bonus);
    setLastGift(gift);
    setWallet(wallet + r.euros + bonus + gift);
    setStars((s) => ({ ...s, [day.id]: Math.max(s[day.id] ?? 0, r.stars) }));
    setScreen('summary');
  }, [day, owned, wallet, logGame]);

  const startDay = (id: string) => {
    setDay(dayById(id) ?? DAYS[0]!);
    setSeed(newSeed());
    setRound((r) => r + 1);
    const now = new Date();
    game.current = { id: now.getTime(), at: localStamp(now) };
    setScreen('play');
  };

  switch (screen) {
    case 'home':
      return <Home onPlay={() => setScreen('days')} onShop={() => setScreen('shop')} onReset={reset} onTutorial={() => { setTutoAsked(true); startDay(DAYS[0]!.id); }} onSecret={() => setScreen('journal')} />;
    case 'journal':
      return <JournalScreen journal={journal} onChild={(n) => log((j) => ({ ...j, child: n }))} onErase={() => log((j) => ({ ...j, records: [] }))} onBack={() => setScreen('home')} />;
    case 'days':
      return <Days cards={cards} onPick={startDay} onHome={() => setScreen('home')} />;
    case 'play':
      return (
        <Play key={round} day={day} seed={seed} upgrades={owned} effects={dayEffects(day, SHOP, owned)} places={places} mods={eventMods(SHOP, owned, quarterOf(places))}
          seen={seen} onSeen={(k) => setSeen((s) => (s.includes(k) ? s : [...s, k]))} speed={speed} onSpeed={setSpeed} onFinish={finish} onRestart={() => startDay(day.id)}
          onHome={() => setScreen('home')} tutorial={!tutoSeen || tutoAsked} onTutorialDone={() => { setTutoSeen(true); setTutoAsked(false); }} onRecord={logGame} />
      );
    case 'summary':
      return <Summary earned={last.euros} bonus={lastBonus} gift={lastGift} townBonus={townBonus} stars={last.stars} advice={last.advice} season={day.id} upgrades={owned} places={places} onShop={() => setScreen('shop')} onAgain={() => startDay(day.id)} onDays={() => setScreen('days')} />;
    case 'shop': {
      // Leaving the shop before choosing a lot puts the building on the first free lot (never lost).
      const leave = (to: Screen) => {
        if (placing) setPlaces((p) => settle(owned, p));
        setPlacing(null);
        setFresh(null);
        setScreen(to);
      };
      return (
        <Shop items={SHOP} wallet={wallet} owned={owned} fresh={fresh} season={day.id} places={places}
          placing={placing} spots={placing ? freeLots(places) : []}
          onPlace={(c, r) => {
            if (!placing) return;
            setPlaces((p) => ({ ...p, [placing]: [c, r] }));
            setFresh(placing);
            setPlacing(null);
            log((j) => upsert(j, { ...lastBuy.current!, place: `${c},${r}` }));
          }}
          onBack={() => leave('home')}
          onPlay={() => leave('days')}
          onBuy={(item) => {
            if (placing || wallet < item.price || shopStatus(SHOP, owned, item).kind !== 'open') return;
            setWallet(wallet - item.price);
            setOwned([...owned, item.id]);
            // A building with a lot of its own waits for the child's choice (lot L9.4); the others appear at once.
            if (PLACEABLE.includes(item.id)) { setPlacing(item.id); setFresh(null); } else setFresh(item.id);
            const now = new Date();
            lastBuy.current = { type: 'achat', id: now.getTime(), child: journal.child, at: localStamp(now), item: item.id, price: item.price };
            log((j) => upsert(j, { ...lastBuy.current!, child: j.child }));
          }} />
      );
    }
  }
}
