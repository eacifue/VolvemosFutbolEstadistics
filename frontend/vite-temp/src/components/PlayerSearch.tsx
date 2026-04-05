import React, { useState } from 'react';
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

    const availablePlayers = allPlayers.filter(p => !assignedPlayerIds.includes(p.id));

    const filteredPlayers = availablePlayers.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        if (selectedPlayerId) {
            onSelectPlayer(selectedPlayerId, team);
            setSelectedPlayerId(null);
            setSearch('');
        }
    };

    return (
        <div className="player-search">
            <h3>Add Player to Team</h3>
            <div className="form-group">
                <label>Search Player</label>
                <input
                    type="text"
                    placeholder="Type player name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={selectedPlayerId || ''}
                    onChange={(e) => setSelectedPlayerId(Number(e.target.value) || null)}
                >
                    <option value="">Select a player</option>
                    {filteredPlayers.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                        </option>
                    ))}
                </select>
                <label>Team</label>
                <select
                    value={team}
                    onChange={(e) => setTeam(Number(e.target.value) as 1 | 2)}
                >
                    <option value={1}>1 - White</option>
                    <option value={2}>2 - Black</option>
                </select>
                <button
                    className="btn btn-primary"
                    onClick={handleAdd}
                    disabled={!selectedPlayerId}
                >
                    Add to {team === 1 ? 'White' : 'Black'} Team
                </button>
            </div>
        </div>
    );
};

export default PlayerSearch;