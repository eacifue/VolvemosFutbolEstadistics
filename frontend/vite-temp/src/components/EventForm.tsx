import React, { useState } from 'react';
import type { Player } from '../types';

interface EventFormProps {
    whitePlayers: Player[];
    blackPlayers: Player[];
    onSubmit: (event: { matchId: number; playerId: number; eventTypeId: 1 | 2; teamId: 1 | 2}) => void;
}

const EventForm: React.FC<EventFormProps> = ({ whitePlayers, blackPlayers, onSubmit }) => {
    const [team, setTeam] = useState<1 | 2>(1);
    const [playerId, setPlayerId] = useState<number>(0);
    const [eventType, setEventType] = useState<1 | 2>(1);


    const players = team === 1? whitePlayers : blackPlayers;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerId) return;
        onSubmit({
            matchId: 0, // Will be set in parent
            playerId,
            eventTypeId: eventType,
            teamId: team,
        });
        setPlayerId(0);

    };

    return (
        <div className="event-form">
            <h3>Add Match Event</h3>
            <form onSubmit={handleSubmit} className="form-group">
                <label>Team</label>
                <select value={team} onChange={(e) => setTeam(Number(e.target.value) as 1 | 2)}>
                    <option value={1}>1 - White</option>
                    <option value={2}>2 - Black</option>
                </select>

                <label>Player</label>
                <select
                    value={playerId}
                    onChange={(e) => setPlayerId(Number(e.target.value))}
                    required
                >
                    <option value={0}>Select player</option>
                    {players.filter(p => p && p.id).map(p => (
                        <option key={p.id} value={p.id}>
                            {p.firstName || 'Unknown'} {p.lastName || 'Player'}
                        </option>
                    ))}
                </select>

                <label>Event Type</label>
                <select value={eventType} onChange={(e) => setEventType(Number(e.target.value) as 1 | 2)}>
                    <option value={1}>Goal</option>
                    <option value={2}>Assist</option>
                </select>

                <button type="submit" className="btn btn-primary" disabled={!playerId}>
                    Add Event
                </button>
            </form>
        </div>
    );
};

export default EventForm;