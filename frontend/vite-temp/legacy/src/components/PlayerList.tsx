import React from 'react';
import type { Player } from './TeamList';

interface PlayerListProps {
    players: Player[];
    onRemove: (id: number) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, onRemove }) => {
    return (
        <ul className="player-list">
            {players.map(p => (
                <li key={p.id} className="player-item">
                    <div>
                        <strong>{p.name}</strong>
                        {p.position && <span> - {p.position}</span>}
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
    );
};

export default PlayerList;
