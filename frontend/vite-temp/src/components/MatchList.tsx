import React, { useState } from 'react';

export interface Player {
    id: number;
    name: string;
    position?: string;
    number?: number;
}

export interface Incident {
    id: number;
    type: 'goal' | 'assist';
    playerId: number;
    team: 'white' | 'black';
    minute?: number;
}

export interface Match {
    id: number;
    date: string;
    whiteTeamPlayers: Player[];
    blackTeamPlayers: Player[];
    incidents: Incident[];
}

interface MatchListProps {
    matches: Match[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onAdd: (date: string) => void;
}

const MatchList: React.FC<MatchListProps> = ({ matches, selectedId, onSelect, onAdd }) => {
    const [adding, setAdding] = useState(false);
    const [newDate, setNewDate] = useState('');

    const handleCreate = () => {
        if (newDate) {
            onAdd(newDate);
            setNewDate('');
            setAdding(false);
        }
    };

    return (
        <div className="match-list">
            <h3>Partidos</h3>
            <ul>
                {matches.map(m => (
                    <li
                        key={m.id}
                        className={m.id === selectedId ? 'selected' : ''}
                        onClick={() => onSelect(m.id)}
                    >
                        {new Date(m.date).toLocaleString('es-ES')}
                    </li>
                ))}
            </ul>
            {adding ? (
                <div className="form-group">
                    <label htmlFor="match-date">Fecha</label>
                    <input
                        id="match-date"
                        type="datetime-local"
                        value={newDate}
                        onChange={e => setNewDate(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleCreate}>
                        Guardar
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setAdding(false)}
                    >
                        Cancelar
                    </button>
                </div>
            ) : (
                <button
                    className="btn btn-primary"
                    onClick={() => setAdding(true)}
                >
                    Crear Partido
                </button>
            )}
        </div>
    );
};

export default MatchList;
