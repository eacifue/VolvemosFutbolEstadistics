import React from 'react';
import type { Player } from '../types';
import StatItemWidget from './StatItemWidget';
import type { GoalkeeperStats } from '../utils/goalkeeperStats';
import { isGoalkeeperPlayer } from '../utils/goalkeeperStats';

type PlayerCardProps = {
  player: Player;
  rank: number;
  photoUrl?: string;
  imageFailed?: boolean;
  onImageError?: (playerId: number) => void;
  goalkeeperStats?: GoalkeeperStats;
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
  goalkeeperStats,
}) => {
  const fullName = `${player.firstName} ${player.lastName}`;
  const positionName = player.position?.name ?? 'Sin posicion';
  const teamName = player.teamName ?? player.team?.name ?? 'Equipo no asignado';
  const rating = getPlayerCardRating(player);
  const effectiveness = calculateEffectiveness(player.goals, player.assists, player.matches);
  const positionTheme = getPositionTheme(positionName);
  const tier = getTier(rating).toUpperCase();
  const hasPhoto = Boolean(photoUrl) && !imageFailed;
  const goalsPerGame = typeof player.goalsPerGame === 'number'
    ? player.goalsPerGame
    : calculateGoalsPerGame(player.goals, player.matches);
  const wins = player.wins ?? 0;
  const losses = player.losses ?? 0;
  const draws = player.draws ?? 0;
  const goalStreak = player.goalStreak ?? 0;
  const noGoalStreak = player.noGoalStreak ?? 0;
  const isGoalkeeper = isGoalkeeperPlayer(player);

  return (
    <article className={`player-card-shell player-card-clean player-card-${positionTheme} card fade-in`}>
      <header className="player-card-main-row">
        <div className="player-avatar-wrap" aria-hidden="true">
          {hasPhoto ? (
            <img
              src={photoUrl}
              alt={`Foto de ${fullName}`}
              className="player-photo"
              loading="lazy"
              onError={() => onImageError?.(player.id)}
            />
          ) : (
            <div className="player-photo-fallback player-avatar-large">{getInitials(player)}</div>
          )}
        </div>

        <div className="player-main-meta">
          <div className="player-main-topline">
            <h3 className="player-name ellipsis">{fullName}</h3>
            {rank === 1 ? <span className="player-best-badge">TOP</span> : null}
          </div>
          <p className="player-team-subtitle ellipsis">{teamName}</p>
          <div className="player-chip-row">
            <span className={`position-badge position-${positionTheme}`}>{positionName}</span>
            {isGoalkeeper && <span className="goalkeeper-badge">🥅 Arquero</span>}
            <span className="player-tier-pill">{tier}</span>
            <span className="player-card-id">ID {player.id}</span>
          </div>
        </div>

        <div className="player-rating-pill" aria-label={`Rating ${rating}`}>{rating}</div>
      </header>

      <hr className="player-card-divider" />

      <div className="player-stats-row" role="list" aria-label="Estadisticas del jugador">
        <StatItemWidget label="Goles" value={player.goals} icon="G" />
        <StatItemWidget label="Asistencias" value={player.assists} icon="A" />
        <StatItemWidget label="Partidos" value={player.matches} icon="PJ" />
        <StatItemWidget label="Goles/Partido" value={goalsPerGame.toFixed(2)} icon="GP" />
      </div>

      {isGoalkeeper && (
        <div className="goalkeeper-stats-row" role="list" aria-label="Estadisticas de arquero">
          <StatItemWidget label="Goles recibidos" value={goalkeeperStats?.goalsConceded ?? 0} icon="GR" />
          <StatItemWidget label="Recibidos/Partido" value={(goalkeeperStats?.avgGoalsConceded ?? 0).toFixed(2)} icon="AVG" />
        </div>
      )}

      <div className="player-results-strip" aria-label="Partidos ganados, perdidos y empatados">
        <span className="result-badge result-win">W {wins}</span>
        <span className="result-badge result-loss">L {losses}</span>
        <span className="result-badge result-draw">D {draws}</span>
      </div>

      {!isGoalkeeper && (
        <div className="streak-grid" aria-label="Rachas del jugador">
          <div className="streak-card streak-card-hot">
            <span className="streak-label">Racha gol</span>
            <span className="streak-value">{goalStreak}</span>
          </div>
          <div className="streak-card streak-card-cold">
            <span className="streak-label">Racha sin gol</span>
            <span className="streak-value">{noGoalStreak}</span>
          </div>
        </div>
      )}

      <footer className="player-card-footer-clean">
        <span className="performance-text">Impacto ofensivo por partido: {effectiveness}%</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(effectiveness, 100)}%` }} />
        </div>
      </footer>
    </article>
  );
};

export default PlayerCard;