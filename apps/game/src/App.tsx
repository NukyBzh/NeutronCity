import cassandra from '../../../assets/cassandra/cassandra-accueil.png';
import { t } from './i18n';
import './app.css';

/** Lot L0 skeleton: a welcome screen that opens. The real screens come with the mock-ups of lot L1. */
export function App() {
  return (
    <main className="home">
      <h1 className="home-title">{t('app.title')}</h1>
      <p className="home-subtitle">{t('app.subtitle')}</p>
      <div className="home-guide">
        <img className="home-cassandra" src={cassandra} alt={t('cassandra.alt')} />
        <p className="home-bubble">{t('home.hello')}</p>
      </div>
      <p className="home-version">{t('app.version', { version: __APP_VERSION__ })}</p>
    </main>
  );
}
