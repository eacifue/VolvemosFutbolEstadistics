import React from 'react';
import type { Player, Incident } from './MatchList';

interface IncidentListProps {
    incidents: Incident[];
    playersWhite: Player[];
    playersBlack: Player[];
    onRemove?: (id: number) => void;
}

const IncidentList: React.FC<IncidentListProps> = ({ incidents, playersWhite, playersBlack, onRemove }) => {
    const getPlayerName = (team: 'white' | 'black', id: number) => {
        const list = team === 'white' ? playersWhite : playersBlack;
        return list.find(p => p.id === id)?.name || `Jugador ${id}`;
    };

    return (
        <ul className="incident-list">
            {incidents.map(i => (
                <li key={i.id} className="incident-item">
                    <div>
                        {i.minute !== undefined && <span>{i.minute}' </span>}
                        {i.type === 'goal' ? 'Gol' : 'Asistencia'} — {getPlayerName(i.team, i.playerId)} ({i.team === 'white' ? 'Blanco' : 'Negro'})
                    </div>
                    {onRemove && (
                        <button className="btn btn-danger" onClick={() => onRemove(i.id)}>
                            ✕
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default IncidentList;
