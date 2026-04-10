// Rebuilt event form into a compact inline layout with explicit labels and football-specific event options.
import React, { useState } from 'react';
import type { Player } from '../types';

interface EventFormProps {
  whitePlayers: Player[];
  blackPlayers: Player[];
  onSubmit: (event: { matchId: number; playerId: number; eventTypeId: 1 | 2; teamId: 1 | 2 }) => void;
}

const EventForm: React.FC<EventFormProps> = ({ whitePlayers, blackPlayers, onSubmit }) => {
  const [team, setTeam] = useState<1 | 2>(1);
  const [playerId, setPlayerId] = useState<number>(0);
  const [eventType, setEventType] = useState<1 | 2>(1);

  const players = team === 1 ? whitePlayers : blackPlayers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) return;

    onSubmit({
      matchId: 0,
      playerId,
      eventTypeId: eventType,
      teamId: team,
    });

    setPlayerId(0);
  };

  return (
    <div className="event-form">
      <h3>Registrar Evento</h3>
      <form onSubmit={handleSubmit} className="form-group compact-form-grid event-form-inline">
        <div>
          <label htmlFor="event-team">Equipo</label>
          <select id="event-team" value={team} onChange={(e) => setTeam(Number(e.target.value) as 1 | 2)}>
            <option value={1}>⚪ Blanco</option>
            <option value={2}>⚫ Negro</option>
          </select>
        </div>

        <div>
          <label htmlFor="event-player">Jugador</label>
          <select
            id="event-player"
            value={playerId}
            onChange={(e) => setPlayerId(Number(e.target.value))}
            required
          >
            <option value={0}>Selecciona jugador</option>
            {players.filter((p) => p && p.id).map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName || 'Unknown'} {p.lastName || 'Player'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="event-type">Tipo de evento</label>
          <select id="event-type" value={eventType} onChange={(e) => setEventType(Number(e.target.value) as 1 | 2)}>
            <option value={1}>⚽ Gol</option>
            <option value={2}>🎯 Asistencia</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={!playerId}>
          Guardar Evento
        </button>
      </form>
    </div>
  );
};

export default EventForm;
