// Updated roster rows with avatars, team dots, and aligned remove actions that never wrap into broken layouts.
import React from 'react';
import type { Player } from '../types';

interface TeamRosterProps {
  teamName: string;
  players: Player[];
  onRemove: (playerId: number) => void;
}

const TeamRoster: React.FC<TeamRosterProps> = ({ teamName, players, onRemove }) => {
  const teamClass = teamName.toLowerCase().includes('negro') ? 'team-black' : 'team-white';

  return (
    <div className={`team-roster ${teamClass}`}>
      <h4>
        <span className={`team-color-dot ${teamClass === 'team-black' ? 'team-color-black' : 'team-color-white'}`}></span>
        {teamName}
      </h4>
      <ul className="player-list">
        {players.filter((p) => p && p.id).map((p) => {
          const initials = `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
          return (
            <li key={p.id} className="player-item">
              <div className="player-inline-info">
                <span className="player-mini-avatar">{initials}</span>
                <div className="player-meta">
                  <strong className="ellipsis">{p.firstName || 'Unknown'} {p.lastName || 'Player'}</strong>
                  {p.position && <span className="ellipsis">{p.position.name}</span>}
                </div>
              </div>
              <button className="btn btn-danger btn-icon-only" onClick={() => onRemove(p.id)} type="button" aria-label="Quitar jugador">
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TeamRoster;
