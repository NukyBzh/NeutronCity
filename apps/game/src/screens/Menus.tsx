import { useEffect, useRef, useState } from 'react';
import { nextDiscovery, shopStatus, townHappiness, type Advice, type ShopItem, type ShopStatus } from '@neutron/engine';
import { HOME_BACKGROUND, shopUrl } from '../assets';
import { euros, t } from '../i18n';
import { IsoCity } from '../play/IsoCity';
import type { Places } from '../play/iso/town';
import { sound } from '../sound';
import { Button, Cassandra, Icon, Rich, SoundButton, Stars } from '../ui/ui';

/** Taps on the version number that open the hidden play log (lot L9.1), within this many milliseconds. */
const SECRET_TAPS = 5;
const SECRET_MS = 3000;

/** Game logo (lot L9.2a, D-27): the Nuki Town symbol, the name with its first word in blue and the rest in orange,
 *  and the NukiTeam signature. The symbol is drawn by tools/branding/nuki-town.mjs. */
function GameLogo() {
  const [first, ...rest] = t('app.title').split(' ');
  return (
    <div className="game-logo">
      <img src="./icons/icone.svg" alt="" />
      <div>
        <h1><span className="logo-a">{first}</span> <span className="logo-b">{rest.join(' ')}</span></h1>
        <p className="game-logo-by">{t('app.by')}</p>
      </div>
    </div>
  );
}

/** Welcome screen: one goal, "Play" pulses. Five quick taps on the version number open the adult's play log. */
export function Home({ onPlay, onShop, onReset, onTutorial, onSecret }: {
  onPlay: () => void; onShop: () => void; onReset: () => void; onTutorial: () => void; onSecret?: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const taps = useRef<number[]>([]);
  const tapVersion = (e: { timeStamp: number }) => {
    taps.current = [...taps.current.filter((x) => e.timeStamp - x < SECRET_MS), e.timeStamp];
    if (taps.current.length >= SECRET_TAPS) { taps.current = []; onSecret?.(); }
  };
  return (
    <main className="screen home" style={HOME_BACKGROUND ? { backgroundImage: `url("${HOME_BACKGROUND}")` } : undefined}>
      <div className="home-text">
        <GameLogo />
        <p className="home-subtitle">{t('app.subtitle')}</p>
        <div className="row">
          <Button kind="primary" pulse icon="jouer" label={t('btn.play')} onClick={onPlay} />
          <Button icon="boutique" label={t('btn.shop')} onClick={onShop} />
        </div>
      </div>
      <Cassandra pose="accueil" className="home-cassandra"><Rich text={t('accueil.bonjour')} /></Cassandra>
      <div className="home-reset">
        <Button icon="recommencer" label={t('btn.newPlayer')} onClick={() => setAsking(true)} />
        <Button icon="jouer" label={t('btn.tutorial')} onClick={onTutorial} />
        {/* Next to the buttons, not in the bottom-right corner: the Netlify badge covers that corner online (L9.2b). */}
        <p className="version" onClick={tapVersion}>{t('app.version', { version: __APP_VERSION__ })}</p>
      </div>
      <div className="home-sound"><SoundButton /></div>
      {asking ? (
        <div className="overlay" role="dialog" aria-modal aria-label={t('reset.title')}>
          <div className="overlay-card">
            <h2><Icon name="recommencer" size={2} />{t('reset.title')}</h2>
            <p>{t('reset.text')}</p>
            <div className="row">
              <Button icon="accueil" label={t('btn.cancel')} onClick={() => setAsking(false)} />
              <Button kind="primary" icon="recommencer" label={t('btn.erase')} onClick={() => { onReset(); setAsking(false); }} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export interface DayCard { id: string; stars: number; locked: boolean; lockReason?: 'prev' | 'heat'; heat: boolean }
const DAY_ICON: Record<string, string> = { ete: 'midi', printemps: 'matin', hiver: 'froid' };

/** Choose a day: easiest first; a locked day says how to open it; the next day to play pulses. */
export function Days({ cards, onPick, onHome }: { cards: DayCard[]; onPick: (id: string) => void; onHome: () => void }) {
  const next = cards.find((c) => !c.locked && c.stars === 0)?.id;
  return (
    <main className="screen days">
      <header className="screen-head">
        <Button icon="accueil" label={t('btn.home')} onClick={onHome} />
        <h1>{t('days.title')}</h1>
      </header>
      <div className="day-cards">
        {cards.map((c) => (
          <article key={c.id} className={`day-card${c.locked ? ' locked' : ''}`}>
            <Icon name={DAY_ICON[c.id] ?? 'midi'} size={4} />
            <h2>{t(`day.${c.id}.title`)}</h2>
            <p className="day-level">{t(`day.${c.id}.level`)}</p>
            <p className="day-outputs">
              <Icon name="electricite" size={1.8} />
              {c.heat ? <Icon name="chaleur" size={1.8} /> : null}
              <span>{t(c.heat ? 'days.both' : 'days.elecOnly')}</span>
            </p>
            {c.locked ? (
              <p className="day-lock"><Icon name="cadenas" size={1.8} />{t(c.lockReason === 'heat' ? 'days.locked.heat' : 'days.locked')}</p>
            ) : (
              <>
                <Stars count={c.stars} size={2} />
                <Button kind={c.id === next ? 'primary' : 'secondary'} pulse={c.id === next} icon="jouer" label={t('btn.play')} onClick={() => onPick(c.id)} />
              </>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

/** End of the day: euros, stars (pictograms) and the one piece of advice chosen by the engine. */
export function Summary({ earned, bonus = 0, townBonus = bonus, gift = 0, stars, advice, season, upgrades, places, onShop, onAgain, onDays }: {
  earned: number; bonus?: number; townBonus?: number; gift?: number; places?: Places; stars: number; advice: Advice; season: string; upgrades: readonly string[]; onShop: () => void; onAgain: () => void; onDays: () => void;
}) {
  // A short jingle when the day ends (lot L5).
  useEffect(() => sound.play('jingle'), []);
  return (
    <main className="screen summary">
      <div className="town-panel"><IsoCity view="full" hour={21.5} season={season} mood={stars >= 2 ? 'content' : 'calme'} elecOn heatOn={season !== 'ete'} upgrades={upgrades} places={places} /></div>
      <div className="summary-card panel">
        <h1>{t('summary.title')}</h1>
        <Stars count={stars} size={4} />
        <p className="summary-money"><Icon name="tirelire" size={3} />{t('summary.earned', { amount: euros(earned) })}</p>
        {/* The town's bonus depends on the stars (D-21): all with 3, half with 2, none with 1. */}
        {townBonus > 0 ? (
          <p className="summary-bonus"><Icon name="piece" size={2} />
            {t(stars >= 3 ? 'summary.bonus' : stars === 2 ? 'summary.bonus.half' : 'summary.bonus.none', { amount: euros(bonus) })}
          </p>
        ) : null}
        {/* Welcome gift (lot L9.3): enough euros for the first building, whatever the first day gave. */}
        {gift > 0 ? (
          <p className="summary-bonus summary-gift"><Icon name="piece" size={2} />{t('summary.gift', { amount: euros(gift) })}</p>
        ) : null}
        <div className="row">
          <Button kind="primary" pulse icon="boutique" label={t('btn.shop')} onClick={onShop} />
          <Button icon="recommencer" label={t('btn.again')} onClick={onAgain} />
          <Button icon="etoile" label={t('btn.days')} onClick={onDays} />
        </div>
      </div>
      <Cassandra pose={advice === 'bravo' ? 'bravo' : 'explique'} className="summary-cassandra">
        <Rich text={t(`bilan.${advice}`)} />
      </Cassandra>
    </main>
  );
}

/**
 * What opens a building not offered yet (lot L9.3, instead of « Bientôt »): the building to buy first, the number of
 * discovery buildings still to buy before it, or the size of the town it needs.
 */
function unlockText(item: ShopItem, status: ShopStatus, next: ShopItem | null): string {
  if (status.kind === 'locked') return t('shop.locked', { n: String(status.needs) });
  if (item.discovery !== undefined && next?.discovery !== undefined) {
    const before = item.discovery - next.discovery;
    return before === 1 ? t('shop.after', { name: t(`shop.${next.id}`) }) : t('shop.afterMany', { n: String(before) });
  }
  return t('shop.locked', { n: String(item.unlockAt ?? 0) });
}

const ORDER: Record<ShopStatus['kind'], number> = { open: 0, owned: 1, later: 2, locked: 2 };

/**
 * Shop (lot L6, D-19): buildings that make the inhabitants happier for good, pay a bonus every day and change the
 * demand a little. Discovery phase: one building offered at a time, presented by Cassandra; then the others open as
 * the town grows. Buildings to come stay visible, greyed, so the child sees what is next.
 */
export function Shop({ items, wallet, owned, fresh = null, season, places, placing = null, spots = [], onPlace, onBuy, onBack, onPlay }: {
  items: readonly ShopItem[]; wallet: number; owned: readonly string[]; fresh?: string | null; season: string; onBuy: (item: ShopItem) => void; onBack: () => void;
  onPlay: () => void;
  /** Lot L9.4: lots of the buildings, the building waiting for its lot, the free lots and the child's choice. */
  places?: Places; placing?: string | null; spots?: readonly (readonly [number, number])[]; onPlace?: (c: number, r: number) => void;
}) {
  const happiness = townHappiness(items, owned);
  const next = nextDiscovery(items, owned);
  const total = items.filter((i) => i.discovery !== undefined).length;
  const count = items.filter((i) => owned.includes(i.id)).length;
  const rows = items.map((item) => ({ item, status: shopStatus(items, owned, item) })).sort((a, b) => ORDER[a.status.kind] - ORDER[b.status.kind]);
  const line = placing ? 'shop.place' : next ? (wallet >= next.price ? `shop.discover.${next.id}` : 'shop.say.wait') : 'shop.say.free';
  const affordable = rows.some(({ item, status }) => status.kind === 'open' && wallet >= item.price);
  return (
    <main className="screen shop">
      <header className="screen-head">
        <Button icon="accueil" label={t('btn.back')} onClick={onBack} />
        {/* Back to a day in one touch (lot L9.3); it pulses once nothing more can be bought. */}
        <Button kind="primary" pulse={!affordable && !placing} icon="jouer" label={t('btn.play')} onClick={onPlay} />
        <h1>{t('shop.title')}</h1>
        <span className="piggy big"><Icon name="tirelire" size={2.6} /><b>{euros(wallet)}</b></span>
      </header>
      <div className="shop-body">
      <div className={`town-panel${placing ? ' placing' : ''}`}><IsoCity view="full" hour={13} season={season} mood="content" elecOn heatOn={season !== 'ete'} upgrades={owned} fresh={fresh}
        places={places} spots={placing ? spots : undefined} onSpot={onPlace} spotLabel={placing ? t('shop.placeHere', { name: t(`shop.${placing}`) }) : undefined} />
        {placing ? (
          <p className="shop-news shop-placing" role="status"><img src={shopUrl(placing)} alt="" aria-hidden /><span><b>{t('shop.placeTitle')}</b>{t('shop.placeHint')}</span></p>
        ) : fresh ? (
          <p className="shop-news" role="status"><img src={shopUrl(fresh)} alt="" aria-hidden /><span><b>{t('shop.new')}</b>{t(`shop.where.${fresh}`)}</span></p>
        ) : null}
      </div>
      <div className="shop-side">
      <div className="shop-guide">
        <Cassandra pose={placing ? 'explique' : next && wallet < next.price ? 'reflechit' : 'explique'} className="shop-cassandra"><Rich text={t(line)} /></Cassandra>
      </div>
      <p className="shop-phase">{next ? t('shop.discovery', { n: String(next.discovery), total: String(total) }) : t('shop.free', { n: String(count) })}</p>
      <div className="joy" role="img" aria-label={t('shop.joy')}>
        <Icon name="sourire" size={2.2} />
        <span>{t('shop.joy')}</span>
        <div className="joy-bar"><span style={{ width: `${happiness}%` }} /></div>
      </div>
      <div className="shop-items">
        {rows.map(({ item, status }) => {
          const can = status.kind === 'open' && wallet >= item.price && !placing;
          const closed = status.kind === 'later' || status.kind === 'locked';
          return (
            <article key={item.id} className={`shop-item shop-${status.kind}${item.id === fresh ? ' just' : ''}`}>
              <img src={shopUrl(item.id)} alt="" aria-hidden />
              <h2>{t(`shop.${item.id}`)}</h2>
              <p className="shop-effect">{t(`shop.effect.${item.id}`)}</p>
              <p className="shop-bonus"><Icon name="piece" size={1.2} />{t('shop.bonus', { amount: euros(item.bonus) })}</p>
              {status.kind === 'owned' ? (
                <p className="shop-owned"><Icon name="bien" size={1.6} />{t('shop.owned')}</p>
              ) : closed ? (
                <p className="shop-lock"><Icon name="cadenas" size={1.4} />{unlockText(item, status, next)}</p>
              ) : (
                <Button kind={can ? 'primary' : 'secondary'} pulse={can} icon="piece" label={euros(item.price)} onClick={() => onBuy(item)} disabled={!can} />
              )}
            </article>
          );
        })}
      </div>
      </div>
      </div>
    </main>
  );
}
