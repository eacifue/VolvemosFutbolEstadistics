// Reworked players page with stronger search UX, responsive card grid, position-coded badges, and friendly empty states.
import React, { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PlayerCard, { getPlayerCardRating } from '../components/PlayerCard';
import '../styles/Players.css';
import type { Player } from '../types';
import { getPlayers } from '../services/api';
import { subscribeStatsRefresh } from '../services/refreshBus';

const getPlayerPhoto = (player: Player): string | undefined => {
  const possibleUrls = [
    player.photoUrl,
    player.avatarUrl,
    player.imageUrl,
    player.photo,
    player.image,
  ];

  return possibleUrls.find((url) => typeof url === 'string' && url.trim().length > 0);
};

const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const fetchPlayers = async () => {
    try {
      const data = await getPlayers();
      startTransition(() => {
        setPlayers(data);
      });
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
    const term = deferredSearchTerm.toLowerCase().trim();
    return players.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
      p.position?.name?.toLowerCase().includes(term) ||
      p.id.toString().includes(term)
    );
  }, [deferredSearchTerm, players]);

  const rankedPlayers = useMemo(() => {
    return [...filteredPlayers]
      .sort((left, right) => {
        const ratingDiff = getPlayerCardRating(right) - getPlayerCardRating(left);
        if (ratingDiff !== 0) {
          return ratingDiff;
        }

        const contributionDiff = (right.goals + right.assists) - (left.goals + left.assists);
        if (contributionDiff !== 0) {
          return contributionDiff;
        }

        return left.id - right.id;
      })
      .map((player, index) => ({
        player,
        rank: index + 1,
      }));
  }, [filteredPlayers]);

  const handleImageError = (playerId: number) => {
    setImageErrors((prev) => ({ ...prev, [playerId]: true }));
  };

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

          {rankedPlayers.length > 0 ? (
            <div className="players-grid">
              {rankedPlayers.map(({ player, rank }) => {
                const photoUrl = getPlayerPhoto(player);
                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={rank}
                    photoUrl={photoUrl}
                    imageFailed={Boolean(imageErrors[player.id])}
                    onImageError={handleImageError}
                  />
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
