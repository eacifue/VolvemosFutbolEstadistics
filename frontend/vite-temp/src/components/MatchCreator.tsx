// Updated match creator form to a clearer compact layout with explicit labels and admin-friendly copy.
import React, { useEffect, useState } from 'react';
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

  const teams: Array<{ id: number; name: string }> = [
    { id: 1, name: '⚪ Equipo Blanco' },
    { id: 2, name: '⚫ Equipo Negro' }
  ];

  useEffect(() => {
    if (editingMatch) {
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
    if (!date) return;

    if (editingMatch && onUpdate) {
      onUpdate(editingMatch.id, date, homeTeamId, awayTeamId);
    } else {
      onCreate(date, homeTeamId, awayTeamId);
      setDate('');
      setHomeTeamId(undefined);
      setAwayTeamId(undefined);
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
      <h2>{editingMatch ? 'Editar Partido' : 'Crear Partido'}</h2>
      <form onSubmit={handleSubmit} className="form-group compact-form-grid">
        <div>
          <label htmlFor="match-date">Fecha y Hora</label>
          <input
            id="match-date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="home-team">Equipo Local</label>
          <select
            id="home-team"
            value={homeTeamId || ''}
            onChange={(e) => setHomeTeamId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
          >
            <option value="">Seleccionar</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="away-team">Equipo Visitante</label>
          <select
            id="away-team"
            value={awayTeamId || ''}
            onChange={(e) => setAwayTeamId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
          >
            <option value="">Seleccionar</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            {editingMatch ? 'Actualizar Partido' : 'Crear Partido'}
          </button>
          {editingMatch && (
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MatchCreator;
