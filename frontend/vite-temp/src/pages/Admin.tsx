// Improved admin shell with clearer tab hierarchy and consistent panel spacing for match and player management.
import React, { useState } from 'react';
import '../styles/Admin.css';
import MatchManager from './MatchManager';
import ManagePlayers from './ManagePlayers';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'players'>('matches');

  return (
    <div className="admin-page">
      <section className="admin-header">
        <div className="container">
          <h1>Panel de Administracion</h1>
          <p>Gestiona partidos, plantillas y eventos de forma centralizada.</p>
        </div>
      </section>

      <section className="admin-content">
        <div className="container">
          <div className="admin-tabs" role="tablist" aria-label="Secciones de administracion">
            <button
              className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
              role="tab"
              aria-selected={activeTab === 'matches'}
              type="button"
            >
              Gestionar Partidos
            </button>
            <button
              className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`}
              onClick={() => setActiveTab('players')}
              role="tab"
              aria-selected={activeTab === 'players'}
              type="button"
            >
              Gestionar Jugadores
            </button>
          </div>

          <div className="tab-content">
            <div className="tab-pane" style={{ display: activeTab === 'matches' ? 'block' : 'none' }}>
              <MatchManager />
            </div>
            <div className="tab-pane" style={{ display: activeTab === 'players' ? 'block' : 'none' }}>
              <ManagePlayers />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
