import React, { useState, useEffect } from 'react';
import type { Team } from '../types';

interface MatchCreatorProps {
    onCreate: (date: string, homeTeamId?: number, awayTeamId?: number) => void;
    editingMatch?: { id: number; matchDate: string; homeTeamId?: number; awayTeamId?: number; homeTeam?: Team; awayTeam?: Team } | null;
    onUpdate?: (id: number, date: string, homeTeamId?: number, awayTeamId?: number) => void;
    onCancelEdit?: () => void;
}

const MatchCreator: React.FC<MatchCreatorProps> = ({ onCreate, editingMatch, onUpdate, onCancelEdit }) => {
    const [date, setDate] = useState('');
    const [homeTeamId, setHomeTeamId] = useState<number | undefined>();
    const [awayTeamId, setAwayTeamId] = useState<number | undefined>();
    // Default to two teams: White (1) and Black (2)
    const teams: any[] = [
        { id: 1, name: '⚪ Equipo Blanco' },
        { id: 2, name: '⚫ Equipo Negro' }
    ];

    useEffect(() => {
        if (editingMatch) {
            // Convert to datetime-local format
            const matchDate = new Date(editingMatch.matchDate);
            const localDateTime = new Date(matchDate.getTime() - matchDate.getTimezoneOffset() * 60000);
            setDate(localDateTime.toISOString().slice(0, 16));
            setHomeTeamId(editingMatch.homeTeamId);
            setAwayTeamId(editingMatch.awayTeamId);
        } else {
            setDate('');
            setHomeTeamId(undefined);
            setAwayTeamId(undefined);
        }
    }, [editingMatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (date) {
            if (editingMatch && onUpdate) {
                onUpdate(editingMatch.id, date, homeTeamId, awayTeamId);
            } else {
                onCreate(date, homeTeamId, awayTeamId);
            }
            if (!editingMatch) {
                setDate('');
                setHomeTeamId(undefined);
                setAwayTeamId(undefined);
            }
        }
    };

    const handleCancel = () => {
        setDate('');
        setHomeTeamId(undefined);
        setAwayTeamId(undefined);
        onCancelEdit?.();
    };

    return (
        <div className="match-creator">
            <h2>{editingMatch ? 'Edit Match' : 'Create New Match'}</h2>
            <form onSubmit={handleSubmit} className="form-group">
                <label htmlFor="match-date">Match Date & Time</label>
                <input
                    id="match-date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <label htmlFor="home-team">Home Team</label>
                <select
                    id="home-team"
                    value={homeTeamId || ''}
                    onChange={(e) => setHomeTeamId(e.target.value ? parseInt(e.target.value) : undefined)}
                >
                    <option value="">Select Home Team</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
                <label htmlFor="away-team">Away Team</label>
                <select
                    id="away-team"
                    value={awayTeamId || ''}
                    onChange={(e) => setAwayTeamId(e.target.value ? parseInt(e.target.value) : undefined)}
                >
                    <option value="">Select Away Team</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
                <div className="button-group">
                    <button type="submit" className="btn btn-primary">
                        {editingMatch ? 'Update Match' : 'Create Match'}
                    </button>
                    {editingMatch && (
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default MatchCreator;