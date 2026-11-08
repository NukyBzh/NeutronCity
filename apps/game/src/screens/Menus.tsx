import { shopUrl } from '../assets';
import { euros, t } from '../i18n';
import { Button, Cassandra, Icon, Rich, Stars } from '../ui/ui';

/** Welcome screen: one goal, "Play" pulses. */
export function Home({ onPlay, onShop }: { onPlay: () => void; onShop: () => void }) {
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
      <p className="version">{t('app.version', { version: __APP_VERSION__ })}</p>
    </main>
  );
}

export interface DayCard { id: 'ete' | 'printemps' | 'hiver'; stars: number; locked: boolean; heat: boolean; playable: boolean }

/** Choose a day: easiest first; a locked day says how to open it. */
export function Days({ cards, onPick, onHome }: { cards: DayCard[]; onPick: (id: DayCard['id']) => void; onHome: () => void }) {
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
            <Icon name={c.id === 'ete' ? 'midi' : c.id === 'printemps' ? 'matin' : 'froid'} size={4} />
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
                <Button kind={c.id === next ? 'primary' : 'secondary'} pulse={c.id === next} icon="jouer" label={t('btn.play')} onClick={() => onPick(c.id)} disabled={!c.playable} />
              </>
            )}
          </article>
        ))}
      </div>
      <p className="note">{t('maquette.note')}</p>
    </main>
  );
}

/** End of the day: euros, stars (pictograms) and one piece of advice. */
export function Summary({ earned, stars, onShop, onAgain, onDays }: {
  earned: number; stars: number; onShop: () => void; onAgain: () => void; onDays: () => void;
}) {
  return (
    <main className="screen summary">
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
      <Cassandra pose={stars >= 2 ? 'bravo' : 'explique'} className="summary-cassandra">
        <Rich text={t(stars >= 3 ? 'bilan.3' : stars === 2 ? 'bilan.2' : 'bilan.1')} />
      </Cassandra>
    </main>
  );
}

export const SHOP_ITEMS = [
  { id: 'fontaine', price: 1000, joy: 5 },
  { id: 'parc', price: 1500, joy: 8 },
  { id: 'piste', price: 2500, joy: 10 },
  { id: 'eclairage', price: 3000, joy: 10 },
  { id: 'ecole', price: 5000, joy: 15 },
] as const;

/** Shop: buy upgrades that appear in the town and make its inhabitants happier. */
export function Shop({ wallet, owned, onBuy, onBack }: { wallet: number; owned: readonly string[]; onBuy: (id: string, price: number) => void; onBack: () => void }) {
  const happiness = Math.min(100, 40 + SHOP_ITEMS.filter((i) => owned.includes(i.id)).reduce((a, i) => a + i.joy * 2, 0));
  return (
    <main className="screen shop">
      <header className="screen-head">
        <Button icon="accueil" label={t('btn.back')} onClick={onBack} />
        <h1>{t('shop.title')}</h1>
        <span className="piggy big"><Icon name="tirelire" size={2.6} /><b>{euros(wallet)}</b></span>
      </header>
      <div className="joy" role="img" aria-label={t('shop.joy')}>
        <Icon name="sourire" size={2.2} />
        <span>{t('shop.joy')}</span>
        <div className="joy-bar"><span style={{ width: `${happiness}%` }} /></div>
      </div>
      <div className="shop-items">
        {SHOP_ITEMS.map((item) => {
          const has = owned.includes(item.id);
          const can = !has && wallet >= item.price;
          return (
            <article key={item.id} className={`shop-item${has ? ' owned' : ''}`}>
              <img src={shopUrl(item.id)} alt="" aria-hidden />
              <h2>{t(`shop.${item.id}`)}</h2>
              {has ? (
                <p className="shop-owned"><Icon name="bien" size={1.6} />{t('shop.owned')}</p>
              ) : (
                <Button kind={can ? 'primary' : 'secondary'} icon="piece" label={euros(item.price)} onClick={() => onBuy(item.id, item.price)} disabled={!can} />
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
