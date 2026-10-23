import React, { useMemo, useState } from 'react';
import type { Player, Match } from '../types';
import { playerPrimaryTeam, TEAM_WHITE } from '../utils/teamStats';

const initials = (first: string, last: string): string =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

interface Props {
  players: Player[];
  matches: Match[];
  loading: boolean;
}

const JugadoresTab: React.FC<Props> = ({ players, matches, loading }) => {
  const [search, setSearch] = useState('');

  const filteredPlayers = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return players;
    return players.filter((p) => normalize(`${p.firstName} ${p.lastName}`).includes(term));
  }, [players, search]);

  if (loading) {
    return <div className="tab-loading">Cargando jugadores…</div>;
  }

  return (
    <div className="tab-panel">
      <div>
        <div className="section-label">Jugadores ({players.length})</div>
        <div className="player-search-wrap">
          <i className="ph ph-magnifying-glass player-search-icon" />
          <input
            type="text"
            className="player-search-input"
            placeholder="Buscar jugador por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="player-grid">
          {filteredPlayers.map((p) => {
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
                    <i className="ph ph-target" /> {p.assists}
                  </div>
                  <div>
                    <i className="ph ph-chart-line-up" /> {(p.goalsPerGame ?? 0).toFixed(1)}
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
        {players.length > 0 && filteredPlayers.length === 0 && (
          <div className="empty-hint">No se encontraron jugadores con ese nombre.</div>
        )}
        {players.length === 0 && <div className="empty-hint">Aún no hay jugadores registrados.</div>}
      </div>
    </div>
  );
};

export default JugadoresTab;
