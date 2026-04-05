import React from 'react';
import type { Player } from '../types';

interface TeamRosterProps {
    teamName: string;
    players: Player[];
    onRemove: (playerId: number) => void;
}

const TeamRoster: React.FC<TeamRosterProps> = ({ teamName, players, onRemove }) => {
    return (
        <div className="team-roster">
            <h4>{teamName}</h4>
            <ul className="player-list">
                {players.filter(p => p && p.id).map(p => (
                    <li key={p.id} className="player-item">
                        <div>
                            <strong>{p.firstName || 'Unknown'} {p.lastName || 'Player'}</strong>
                            {p.position && <span> - {p.position.name}</span>}
                        </div>
                        <button
                            className="btn btn-danger"
                            onClick={() => onRemove(p.id)}
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TeamRoster;
