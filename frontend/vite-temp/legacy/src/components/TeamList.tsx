import React, { useState } from 'react';

export interface Player {
    id: number;
    name: string;
    position?: string;
    number?: number;
}

export interface Team {
    id: number;
    name: string;
    players: Player[];
}

interface TeamListProps {
    teams: Team[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onAdd: (name: string) => void;
}

const TeamList: React.FC<TeamListProps> = ({ teams, selectedId, onSelect, onAdd }) => {
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState('');

    const handleCreate = () => {
        if (newName.trim()) {
            onAdd(newName.trim());
            setNewName('');
            setAdding(false);
        }
    };

    return (
        <div className="team-list">
            <h3>Equipos</h3>
            <ul>
                {teams.map(team => (
                    <li
                        key={team.id}
                        className={team.id === selectedId ? 'selected' : ''}
                        onClick={() => onSelect(team.id)}
                    >
                        {team.name}
                    </li>
                ))}
            </ul>
            {adding ? (
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Nombre del equipo"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
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
                <button className="btn btn-primary" onClick={() => setAdding(true)}>
                    Agregar equipo
                </button>
            )}
        </div>
    );
};

export default TeamList;
