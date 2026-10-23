import React, { useState, useEffect } from 'react';
import type { Player, Incident } from './MatchList';

interface IncidentFormProps {
    playersWhite: Player[];
    playersBlack: Player[];
    onSubmit: (incident: Omit<Incident, 'id'>) => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ playersWhite, playersBlack, onSubmit }) => {
    const [team, setTeam] = useState<'white' | 'black'>('white');
    const [playerId, setPlayerId] = useState<number>(0);
    const [type, setType] = useState<'goal' | 'assist'>('goal');
    const [minute, setMinute] = useState<number | ''>('');

    const list = team === 'white' ? playersWhite : playersBlack;

    useEffect(() => {
        if (list.length > 0) {
            setPlayerId(list[0].id);
        } else {
            setPlayerId(0);
        }
    }, [team, list]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerId) return;
        onSubmit({ team, playerId, type, minute: minute === '' ? undefined : minute });
        setType('goal');
        setMinute('');
    };

    const hasPlayers = list.length > 0 && playerId !== 0;
    return (
        <form className="incident-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Equipo</label>
                <select value={team} onChange={e => setTeam(e.target.value as any)}>
                    <option value="white">Equipo Blanco</option>
                    <option value="black">Equipo Negro</option>
                </select>
            </div>
            <div className="form-group">
                <label>Jugador</label>
                <select value={playerId} onChange={e => setPlayerId(Number(e.target.value))}>
                    <option value={0}>Selecciona...</option>
                    {list.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Tipo</label>
                <select value={type} onChange={e => setType(e.target.value as any)}>
                    <option value="goal">Gol</option>
                    <option value="assist">Asistencia</option>
                </select>
            </div>
            <div className="form-group">
                <label>Minuto (opcional)</label>
                <input
                    type="number"
                    min="0"
                    max="120"
                    value={minute}
                    onChange={e => setMinute(e.target.value === '' ? '' : Number(e.target.value))}
                />
            </div>
            <button type="submit" className="btn btn-primary" disabled={!hasPlayers}>
                Agregar Incidente
            </button>
        </form>
    );
};

export default IncidentForm;
