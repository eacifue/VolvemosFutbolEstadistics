import React, { useState } from 'react';
import './styles/main.css';
import './styles/nocturne.css';
import { useAppData } from './hooks/useAppData';
import PartidosTab from './tabs/PartidosTab';
import JugadoresTab from './tabs/JugadoresTab';
import TopsTab from './tabs/TopsTab';
import AdminTab from './tabs/AdminTab';

type TabKey = 'matches' | 'players' | 'tops' | 'admin';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'tops', label: 'Tops', icon: 'ph-fill ph-trophy' },
  { key: 'matches', label: 'Partidos', icon: 'ph-fill ph-soccer-ball' },
  { key: 'players', label: 'Jugadores', icon: 'ph ph-users-three' },
  { key: 'admin', label: 'Admin', icon: 'ph ph-gear-six' },
];

const App: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('tops');
  const { dashboard, players, matches, loading } = useAppData();

  const whiteWins = dashboard?.teamComparison.find((t) => t.id === 1)?.wins ?? 0;
  const blackWins = dashboard?.teamComparison.find((t) => t.id === 2)?.wins ?? 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <div className="app-header-logo">
            <i className="ph-fill ph-soccer-ball" />
          </div>
          <div>
            <div className="app-header-kicker">Volvemos al Fútbol</div>
            <div className="app-header-title">Blanco y Negro</div>
          </div>
        </div>
        <div className="app-header-score">
          <div>
            <strong>{whiteWins}</strong>Blanco
          </div>
          <div>
            <strong>{blackWins}</strong>Negro
          </div>
        </div>
      </header>

      <main className="app-content">
        {tab === 'matches' && <PartidosTab matches={matches} loading={loading} />}
        {tab === 'players' && <JugadoresTab players={players} matches={matches} loading={loading} />}
        {tab === 'tops' && <TopsTab dashboard={dashboard} loading={loading} />}
        {tab === 'admin' && <AdminTab />}
      </main>

      <nav className="app-bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`app-nav-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <i className={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
