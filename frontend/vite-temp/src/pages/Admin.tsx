import React, { useState } from 'react';
import '../styles/Admin.css'
import MatchManager from './MatchManager';
import ManagePlayers from './ManagePlayers';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'players'>('matches');

  return (
    <div className="admin-page">
      <section className="admin-header">
        <div className="container">
          <h1>Panel de Administración</h1>
          <p>Gestiona partidos y jugadores</p>
        </div>
      </section>

      <section className="admin-content">
        <div className="container">
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              Gestionar Partidos
            </button>
            <button
              className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`}
              onClick={() => setActiveTab('players')}
            >
              Gestionar Jugadores
            </button>
          </div>

          <div className="tab-content" style={{ position: 'relative' }}>
            <div style={{ display: activeTab === 'matches' ? 'block' : 'none' }}>
              <MatchManager />
            </div>
            <div style={{ display: activeTab === 'players' ? 'block' : 'none' }}>
              <ManagePlayers />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
