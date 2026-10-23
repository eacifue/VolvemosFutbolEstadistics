// Reworked player search into a compact inline control row optimized for match assignment workflows.
import React, { useMemo, useState } from 'react';
import type { Player } from '../types';

interface PlayerSearchProps {
  allPlayers: Player[];
  assignedPlayerIds: number[];
  onSelectPlayer: (playerId: number, team: 1 | 2) => void;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({ allPlayers, assignedPlayerIds, onSelectPlayer }) => {
  const [search, setSearch] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [team, setTeam] = useState<1 | 2>(1);

  const availablePlayers = useMemo(() => allPlayers.filter((p) => !assignedPlayerIds.includes(p.id)), [allPlayers, assignedPlayerIds]);

  const filteredPlayers = useMemo(() => {
    const term = search.toLowerCase().trim();
    return availablePlayers.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(term));
  }, [availablePlayers, search]);

  const handleAdd = () => {
    if (!selectedPlayerId) return;
    onSelectPlayer(selectedPlayerId, team);
    setSelectedPlayerId(null);
    setSearch('');
  };

  return (
    <div className="player-search">
      <h3>Agregar Jugador al Partido</h3>
      <div className="form-group inline-search-form">
        <div className="field-wrap">
          <label htmlFor="search-player">Buscar jugador</label>
          <input
            id="search-player"
            type="text"
            placeholder="Escribe nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="field-wrap">
          <label htmlFor="player-select">Jugador</label>
          <select
            id="player-select"
            value={selectedPlayerId || ''}
            onChange={(e) => setSelectedPlayerId(Number(e.target.value) || null)}
          >
            <option value="">Selecciona jugador</option>
            {filteredPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="field-wrap">
          <label htmlFor="team-select">Equipo</label>
          <select
            id="team-select"
            value={team}
            onChange={(e) => setTeam(Number(e.target.value) as 1 | 2)}
          >
            <option value={1}>⚪ Blanco</option>
            <option value={2}>⚫ Negro</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleAdd} disabled={!selectedPlayerId} type="button">
          Agregar
        </button>
      </div>
    </div>
  );
};

export default PlayerSearch;
