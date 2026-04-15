// Improved admin shell with clearer tab hierarchy and consistent panel spacing for match and player management.
import React, { useState } from 'react';
import '../styles/Admin.css';
import MatchManager from './MatchManager';
import ManagePlayers from './ManagePlayers';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'players'>('matches');
  const isMatchesTab = activeTab === 'matches';
  const matchesTabId = 'admin-tab-matches';
  const playersTabId = 'admin-tab-players';
  const matchesPanelId = 'admin-panel-matches';
  const playersPanelId = 'admin-panel-players';

  return (
    <div className="admin-page page-enter">
      <section className="admin-header">
        <div className="container">
          <h1>Panel de Administracion</h1>
          <p>Gestiona partidos, plantillas y eventos de forma centralizada.</p>
          <div className="admin-header-chips" aria-label="Resumen rapido de administracion">
            <span className="admin-chip">Modo Operativo</span>
            <span className="admin-chip">Estadisticas Amateur</span>
            <span className="admin-chip admin-chip-active">Seccion: {isMatchesTab ? 'Partidos' : 'Jugadores'}</span>
          </div>
        </div>
      </section>

      <section className="admin-content">
        <div className="container">
          <div className="admin-tabs" role="tablist" aria-label="Secciones de administracion">
            <button
              className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
              id={matchesTabId}
              role="tab"
              aria-controls={matchesPanelId}
              aria-selected={activeTab === 'matches'}
              type="button"
            >
              <span className="tab-icon tab-glyph" aria-hidden="true">MP</span>
              <span className="tab-text-wrap">
                <strong>Gestionar Partidos</strong>
                <small>rosters, eventos y marcador</small>
              </span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`}
              onClick={() => setActiveTab('players')}
              id={playersTabId}
              role="tab"
              aria-controls={playersPanelId}
              aria-selected={activeTab === 'players'}
              type="button"
            >
              <span className="tab-icon tab-glyph" aria-hidden="true">JG</span>
              <span className="tab-text-wrap">
                <strong>Gestionar Jugadores</strong>
                <small>altas, bajas y posiciones</small>
              </span>
            </button>
          </div>

          <div className="tab-content">
            <div
              className="tab-pane"
              id={matchesPanelId}
              role="tabpanel"
              aria-labelledby={matchesTabId}
              hidden={activeTab !== 'matches'}
              style={{ display: activeTab === 'matches' ? 'block' : 'none' }}
            >
              <MatchManager />
            </div>
            <div
              className="tab-pane"
              id={playersPanelId}
              role="tabpanel"
              aria-labelledby={playersTabId}
              hidden={activeTab !== 'players'}
              style={{ display: activeTab === 'players' ? 'block' : 'none' }}
            >
              <ManagePlayers />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
