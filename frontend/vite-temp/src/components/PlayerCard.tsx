import React from 'react';
import type { Player } from '../types';

type PlayerCardProps = {
  player: Player;
  rank: number;
  photoUrl?: string;
  imageFailed?: boolean;
  onImageError?: (playerId: number) => void;
};

export const calculateEffectiveness = (goals: number, assists: number, matches: number): number => {
  if (!matches || matches <= 0) {
    return 0;
  }

  return Math.round(((goals + assists) / matches) * 100);
};

const calculateGoalsPerGame = (goals: number, matches: number): number => {
  if (!matches || matches <= 0) {
    return 0;
  }

  return Math.round((goals / matches) * 100) / 100;
};

export const getPlayerCardRating = (player: Player): number => {
  const impact = (player.goals * 4) + (player.assists * 3) + player.matches;
  return Math.min(99, Math.max(50, Math.round(50 + impact * 0.8)));
};

const getPositionTheme = (position?: string): string => {
  const value = (position || '').toLowerCase();
  if (value.includes('portero') || value.includes('goalkeeper')) return 'goalkeeper';
  if (value.includes('defensa') || value.includes('defender')) return 'defender';
  if (value.includes('medio') || value.includes('midfielder') || value.includes('volante')) return 'midfielder';
  if (value.includes('delantero') || value.includes('forward') || value.includes('ataque')) return 'forward';
  return 'default';
};

const getTier = (rating: number): string => {
  if (rating >= 92) return 'icon';
  if (rating >= 84) return 'elite';
  if (rating >= 74) return 'pro';
  return 'rising';
};

const getInitials = (player: Player): string => {
  return `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
};

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  rank,
  photoUrl,
  imageFailed = false,
  onImageError,
}) => {
  const fullName = `${player.firstName} ${player.lastName}`;
  const positionName = player.position?.name ?? 'Sin posicion';
  const rating = getPlayerCardRating(player);
  const effectiveness = calculateEffectiveness(player.goals, player.assists, player.matches);
  const positionTheme = getPositionTheme(positionName);
  const tier = getTier(rating);
  const hasPhoto = Boolean(photoUrl) && !imageFailed;
  const goalsPerGame = typeof player.goalsPerGame === 'number'
    ? player.goalsPerGame
    : calculateGoalsPerGame(player.goals, player.matches);
  const wins = player.wins ?? 0;
  const losses = player.losses ?? 0;
  const draws = player.draws ?? 0;
  const goalStreak = player.goalStreak ?? 0;
  const noGoalStreak = player.noGoalStreak ?? 0;

  return (
    <article className={`player-card-shell player-card-premium player-card-${positionTheme} player-card-tier-${tier} card fade-in`}>
      <div className="player-card-glow" aria-hidden="true" />

      <header className="card-header player-card-header-modern">
        <div className="card-rating-badge" aria-label={`Rating ${rating}`}>
          <span className="card-rating-label">OVR</span>
          <strong>{rating}</strong>
        </div>

        <div className="player-rank-badge" aria-label={`Ranking ${rank}`}>
          #{rank}
        </div>

        <div className="player-photo-shell">
          {hasPhoto ? (
            <img
              src={photoUrl}
              alt={`Foto de ${fullName}`}
              className="player-photo"
              loading="lazy"
              onError={() => onImageError?.(player.id)}
            />
          ) : (
            <div className="player-photo-fallback player-avatar-large" aria-hidden="true">
              {getInitials(player)}
            </div>
          )}
        </div>

        <div className="player-card-ornament" aria-hidden="true" />
      </header>

      <div className="card-body player-card-body-modern">
        <div className="player-card-title-row">
          <h3 className="player-name ellipsis">{fullName}</h3>
          <span className={`position-badge position-${positionTheme}`}>{positionName}</span>
        </div>

        <div className="player-card-tier-row">
          <span className="player-tier-pill">{tier}</span>
          <span className="player-card-id">Ficha #{player.id}</span>
        </div>

        <div className="player-performance player-performance-grid-2x2">
          <div className="performance-item">
            <span className="perf-label">Goles</span>
            <span className="perf-value">{player.goals}</span>
          </div>
          <div className="performance-item">
            <span className="perf-label">Asistencias</span>
            <span className="perf-value">{player.assists}</span>
          </div>
          <div className="performance-item">
            <span className="perf-label">Partidos</span>
            <span className="perf-value">{player.matches}</span>
          </div>
          <div className="performance-item performance-item-highlight">
            <span className="perf-label">Goles/Partido</span>
            <span className="perf-value">{goalsPerGame.toFixed(2)}</span>
          </div>
        </div>

        <div className="player-results-strip" aria-label="Historial de resultados">
          <span className="result-badge result-win">W {wins}</span>
          <span className="result-badge result-loss">L {losses}</span>
          <span className="result-badge result-draw">D {draws}</span>
        </div>

        <div className="streak-grid">
          <div className="streak-card streak-card-hot">
            <span className="streak-label">Racha gol</span>
            <span className="streak-value">{goalStreak}</span>
          </div>
          <div className="streak-card streak-card-cold">
            <span className="streak-label">Racha sin gol</span>
            <span className="streak-value">{noGoalStreak}</span>
          </div>
        </div>
      </div>

      <footer className="card-footer player-card-footer-modern">
        <div className="player-meta">
          <span>Contribucion directa</span>
          <span>{player.goals + player.assists}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(effectiveness, 100)}%` }} />
        </div>
        <span className="performance-text">Impacto ofensivo por partido</span>
      </footer>
    </article>
  );
};

export default PlayerCard;