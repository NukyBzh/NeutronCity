import { useState } from 'react';
import { townHappiness, type Advice, type ShopItem } from '@neutron/engine';
import { shopUrl } from '../assets';
import { euros, t } from '../i18n';
import { IsoCity } from '../play/IsoCity';
import { Button, Cassandra, Icon, Rich, Stars } from '../ui/ui';

/** Welcome screen: one goal, "Play" pulses. */
export function Home({ onPlay, onShop, onReset }: { onPlay: () => void; onShop: () => void; onReset: () => void }) {
  const [asking, setAsking] = useState(false);
  return (
    <main className="screen home">
      <div className="home-text">
        <h1>{t('app.title')}</h1>
        <p className="home-subtitle">{t('app.subtitle')}</p>
        <div className="row">
          <Button kind="primary" pulse icon="jouer" label={t('btn.play')} onClick={onPlay} />
          <Button icon="boutique" label={t('btn.shop')} onClick={onShop} />
        </div>
      </div>
      <Cassandra pose="accueil" className="home-cassandra"><Rich text={t('accueil.bonjour')} /></Cassandra>
      <div className="home-reset"><Button icon="recommencer" label={t('btn.newPlayer')} onClick={() => setAsking(true)} /></div>
      <p className="version">{t('app.version', { version: __APP_VERSION__ })}</p>
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

export interface DayCard { id: string; stars: number; locked: boolean; heat: boolean }
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
              <p className="day-lock"><Icon name="cadenas" size={1.8} />{t('days.locked')}</p>
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
export function Summary({ earned, stars, advice, season, upgrades, onShop, onAgain, onDays }: {
  earned: number; stars: number; advice: Advice; season: string; upgrades: readonly string[]; onShop: () => void; onAgain: () => void; onDays: () => void;
}) {
  return (
    <main className="screen summary">
      <div className="town-panel"><IsoCity view="full" hour={21.5} season={season} mood={stars >= 2 ? 'content' : 'calme'} elecOn heatOn={season !== 'ete'} upgrades={upgrades} /></div>
      <div className="summary-card panel">
        <h1>{t('summary.title')}</h1>
        <Stars count={stars} size={4} />
        <p className="summary-money"><Icon name="tirelire" size={3} />{t('summary.earned', { amount: euros(earned) })}</p>
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

/** Shop: buy upgrades that appear in the town and make its inhabitants happier for good. */
export function Shop({ items, wallet, owned, season, onBuy, onBack }: {
  items: readonly ShopItem[]; wallet: number; owned: readonly string[]; season: string; onBuy: (item: ShopItem) => void; onBack: () => void;
}) {
  const happiness = townHappiness(items, owned);
  return (
    <main className="screen shop">
      <header className="screen-head">
        <Button icon="accueil" label={t('btn.back')} onClick={onBack} />
        <h1>{t('shop.title')}</h1>
        <span className="piggy big"><Icon name="tirelire" size={2.6} /><b>{euros(wallet)}</b></span>
      </header>
      <div className="shop-body">
      <div className="town-panel"><IsoCity view="full" hour={13} season={season} mood="content" elecOn heatOn={season !== 'ete'} upgrades={owned} /></div>
      <div className="shop-side">
      <div className="joy" role="img" aria-label={t('shop.joy')}>
        <Icon name="sourire" size={2.2} />
        <span>{t('shop.joy')}</span>
        <div className="joy-bar"><span style={{ width: `${happiness}%` }} /></div>
      </div>
      <div className="shop-items">
        {items.map((item) => {
          const has = owned.includes(item.id);
          const can = !has && wallet >= item.price;
          return (
            <article key={item.id} className={`shop-item${has ? ' owned' : ''}`}>
              <img src={shopUrl(item.id)} alt="" aria-hidden />
              <h2>{t(`shop.${item.id}`)}</h2>
              {has ? (
                <p className="shop-owned"><Icon name="bien" size={1.6} />{t('shop.owned')}</p>
              ) : (
                <Button kind={can ? 'primary' : 'secondary'} icon="piece" label={euros(item.price)} onClick={() => onBuy(item)} disabled={!can} />
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
