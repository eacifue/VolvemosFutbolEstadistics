import React from 'react';
import type { Player, Match } from '../types';
import { playerPrimaryTeam, TEAM_WHITE } from '../utils/teamStats';

const initials = (first: string, last: string): string =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

interface Props {
  players: Player[];
  matches: Match[];
  loading: boolean;
}

const JugadoresTab: React.FC<Props> = ({ players, matches, loading }) => {
  if (loading) {
    return <div className="tab-loading">Cargando jugadores…</div>;
  }

  return (
    <div className="tab-panel">
      <div>
        <div className="section-label">Jugadores ({players.length})</div>
        <div className="player-grid">
          {players.map((p) => {
            const team = playerPrimaryTeam(p.id, matches);
            const isWhite = team === TEAM_WHITE;
            const avatarClass = team === null ? 'player-avatar-neutral' : isWhite ? 'player-avatar-white' : 'player-avatar-black';

            return (
              <div key={p.id} className="card player-card">
                <div className={`player-avatar ${avatarClass}`}>{initials(p.firstName, p.lastName)}</div>
                <div className="player-card-name">
                  {p.firstName} {p.lastName}
                </div>
                {team !== null && (
                  <span className={`tag ${isWhite ? 'tag-neutral' : 'tag-accent-2'}`}>{isWhite ? 'Blanco' : 'Negro'}</span>
                )}
                <div className="player-card-stats">
                  <div>
                    <i className="ph-fill ph-soccer-ball" /> {p.goals}
                  </div>
                  <div>
                    <i className="ph ph-shoe" /> {p.assists}
                  </div>
                  <div>
                    <i className="ph ph-check-circle" /> {p.wins}G
                  </div>
                  <div>
                    <i className="ph ph-x-circle" /> {p.losses}P
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {players.length === 0 && <div className="empty-hint">Aún no hay jugadores registrados.</div>}
      </div>
    </div>
  );
};

export default JugadoresTab;
