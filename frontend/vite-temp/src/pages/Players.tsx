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

const getPlayerPhoto = (player: Player): string | undefined => {
  const mediaCandidate = player as Player & {
    photoUrl?: string;
    avatarUrl?: string;
    imageUrl?: string;
    photo?: string;
    image?: string;
  };

  const possibleUrls = [
    mediaCandidate.photoUrl,
    mediaCandidate.avatarUrl,
    mediaCandidate.imageUrl,
    mediaCandidate.photo,
    mediaCandidate.image,
  ];

  return possibleUrls.find((url) => typeof url === 'string' && url.trim().length > 0);
};

const getPlayerCardRating = (player: Player): number => {
  const impact = (player.goals * 4) + (player.assists * 3) + player.matches;
  return Math.min(99, Math.max(50, Math.round(50 + impact * 0.8)));
};

const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

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

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    void fetchPlayers();
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

  if (loading) {
    return (
      <div className="players-page" aria-busy="true" aria-live="polite" aria-label="Cargando jugadores">
        <section className="players-header players-header-skeleton" aria-hidden="true" />
        <section className="all-players">
          <div className="container">
            <div className="skeleton" style={{ height: '56px', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }} />
            <div className="players-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="skeleton" style={{ borderRadius: 'var(--radius-lg)', minHeight: '290px' }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container status-shell">
        <div className="status-card status-card-error fade-in">
          <span className="status-icon" aria-hidden="true">⚠️</span>
          <h3>No pudimos cargar los jugadores</h3>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={handleRetry}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="players-page page-enter">
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
                const photoUrl = getPlayerPhoto(player);
                const hasPhoto = Boolean(photoUrl) && !imageErrors[player.id];
                const rating = getPlayerCardRating(player);
                return (
                  <article key={player.id} className="player-card-premium card fade-in">
                    <div className="card-header">
                      <span className="card-rating-badge" aria-label={`Rating ${rating}`}>
                        {rating}
                      </span>

                      <div className="player-photo-shell">
                        {hasPhoto ? (
                          <img
                            src={photoUrl}
                            alt={`Foto de ${player.firstName} ${player.lastName}`}
                            className="player-photo"
                            loading="lazy"
                            onError={() => {
                              setImageErrors((prev) => ({ ...prev, [player.id]: true }));
                            }}
                          />
                        ) : (
                          <div className="player-photo-fallback player-avatar-large" aria-hidden="true">
                            {initials}
                          </div>
                        )}
                      </div>
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
                      <div className="player-meta">
                        <span>Ficha #{player.id}</span>
                        <span>Rating: {rating}</span>
                      </div>
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
            <div className="empty-state status-card status-card-empty fade-in">
              <div className="status-icon" aria-hidden="true">⚽</div>
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
