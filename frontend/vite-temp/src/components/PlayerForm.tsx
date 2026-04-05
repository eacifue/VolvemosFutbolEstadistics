import React, { useState } from 'react';
import type { Player } from './TeamList';

interface PlayerFormProps {
    onSubmit: (player: Omit<Player, 'id'>) => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [number, setNumber] = useState<number | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), position: position.trim() || undefined, number: number === '' ? undefined : number });
        setName('');
        setPosition('');
        setNumber('');
    };

    return (
        <form className="player-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Nombre</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Posición</label>
                <input
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Número</label>
                <input
                    type="number"
                    min="0"
                    value={number}
                    onChange={e => setNumber(e.target.value === '' ? '' : Number(e.target.value))}
                />
            </div>
            <button type="submit" className="btn btn-primary">
                Agregar Jugador
            </button>
        </form>
    );
};

export default PlayerForm;
