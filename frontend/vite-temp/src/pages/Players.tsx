// Reworked players page with stronger search UX, responsive card grid, position-coded badges, and friendly empty states.
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Players.css';
import type { Player } from '../types';
import { getPlayers } from '../services/api';
import { subscribeStatsRefresh } from '../services/refreshBus';

const getPositionClass = (position?: string): string => {
  const value = (position || '').toLowerCase();
  if (value.includes('portero') || value.includes('goalkeeper')) return 'position-goalkeeper';
  if (value.includes('defensa') || value.includes('defender')) return 'position-defender';
  if (value.includes('medio') || value.includes('midfielder') || value.includes('volante')) return 'position-midfielder';
  if (value.includes('delantero') || value.includes('forward') || value.includes('ataque')) return 'position-forward';
  return 'position-default';
};

const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlayers = async () => {
    try {
      const data = await getPlayers();
      setPlayers(data as Player[]);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Error cargando jugadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlayers();

    const unsubscribe = subscribeStatsRefresh(() => {
      void fetchPlayers();
    });

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void fetchPlayers();
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const filteredPlayers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return players.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
      p.position?.name?.toLowerCase().includes(term) ||
      p.id.toString().includes(term)
    );
  }, [players, searchTerm]);

  if (loading) return <div className="container page-feedback">Cargando jugadores...</div>;
  if (error) return <div className="container page-feedback page-feedback-error">{error}</div>;

  return (
    <div className="players-page">
      <section className="players-header">
        <div className="container">
          <h1>Nuestros Jugadores</h1>
          <p>Rendimiento individual, posicion y contribucion al clasico.</p>
        </div>
      </section>

      <section className="all-players">
        <div className="container">
          <div className="search-section">
            <div className="search-bar">
              <span className="search-icon" aria-hidden="true">🔎</span>
              <input
                type="text"
                placeholder="Buscar por nombre, posicion o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Buscar jugador"
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')} aria-label="Limpiar busqueda" type="button">
                  ✕
                </button>
              )}
              <span className="search-count">{filteredPlayers.length} resultados</span>
            </div>
          </div>

          {filteredPlayers.length > 0 ? (
            <div className="players-grid">
              {filteredPlayers.map((player) => {
                const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
                const positionName = player.position?.name ?? 'Sin posicion';
                return (
                  <article key={player.id} className="player-card-premium card">
                    <div className="card-header">
                      <div className="player-avatar-large">{initials}</div>
                    </div>

                    <div className="card-body">
                      <h3 className="player-name ellipsis">{player.firstName} {player.lastName}</h3>
                      <div className={`position-badge ${getPositionClass(positionName)}`}>{positionName}</div>

                      <div className="player-performance">
                        <div className="performance-item goals">
                          <div className="perf-header">
                            <span className="perf-icon">⚽</span>
                            <span className="perf-label">Goles</span>
                          </div>
                          <span className="perf-value">{player.goals}</span>
                        </div>
                        <div className="performance-item assists">
                          <div className="perf-header">
                            <span className="perf-icon">🎯</span>
                            <span className="perf-label">Asist.</span>
                          </div>
                          <span className="perf-value">{player.assists}</span>
                        </div>
                        <div className="performance-item matches">
                          <div className="perf-header">
                            <span className="perf-icon">🏆</span>
                            <span className="perf-label">Partidos</span>
                          </div>
                          <span className="perf-value">{player.matches}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min((player.goals + player.assists) * 8, 100)}%` }}></div>
                      </div>
                      <span className="performance-text">Aporte ofensivo</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⚽</div>
              <h3>No encontramos jugadores</h3>
              <p>Prueba otra busqueda o revisa el panel para registrar nuevos jugadores.</p>
              <Link to="/admin" className="btn btn-primary">Ir a administracion</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Players;
