// Reorganized event list to group by team with clear event icons and aligned remove controls.
import React from 'react';
import type { MatchEvent, MatchPlayer } from '../types';

interface EventListProps {
  events: MatchEvent[];
  players: MatchPlayer[];
  onRemove?: (eventId: number) => void;
}

const EventList: React.FC<EventListProps> = ({ events, players, onRemove }) => {
  const getPlayer = (playerId: number) => players.find((mp) => mp.playerId === playerId)?.player;

  const whiteEvents = events.filter((event) => event.teamId === 1);
  const blackEvents = events.filter((event) => event.teamId === 2);

  const renderEvent = (event: MatchEvent) => {
    const player = getPlayer(event.playerId);
    const icon = event.eventTypeId === 1 ? '⚽' : '🎯';
    const label = event.eventType?.name || (event.eventTypeId === 1 ? 'Gol' : 'Asistencia');

    return (
      <li key={event.id} className="event-item">
        <div className="event-main-text ellipsis">
          <span className="event-icon">{icon}</span>
          {label} - {player?.firstName} {player?.lastName}
        </div>
        {onRemove && (
          <button className="btn btn-danger btn-icon-only" onClick={() => onRemove(event.id)} type="button" aria-label="Eliminar evento">
            ✕
          </button>
        )}
      </li>
    );
  };

  return (
    <div className="event-list">
      <h3>Eventos del Partido</h3>
      <div className="event-groups">
        <section className="event-group team-white">
          <h4><span className="team-color-dot team-color-white"></span>Equipo Blanco</h4>
          <ul>
            {whiteEvents.length ? whiteEvents.map(renderEvent) : <li className="event-item muted">Sin eventos</li>}
          </ul>
        </section>

        <section className="event-group team-black">
          <h4><span className="team-color-dot team-color-black"></span>Equipo Negro</h4>
          <ul>
            {blackEvents.length ? blackEvents.map(renderEvent) : <li className="event-item muted">Sin eventos</li>}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default EventList;
