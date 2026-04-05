import React from 'react';
import type { MatchEvent, MatchPlayer } from '../types';

interface EventListProps {
    events: MatchEvent[];
    players: MatchPlayer[];
    onRemove?: (eventId: number) => void;
}

const EventList: React.FC<EventListProps> = ({ events, players, onRemove }) => {
    const getPlayer = (playerId: number) =>
        players.find(mp => mp.playerId === playerId)?.player;

    return (
        <div className="event-list">
            <h3>Match Events</h3>
            <ul>
                {events.map((event) => {
                    const player = getPlayer(event.playerId);
                    return (
                        <li key={event.id} className="event-item">
                            <div>
                                {event.eventType?.name} — {player?.firstName} {player?.lastName} ({event.teamId === 1 ? 'Blanco' : 'Negro'})
                            </div>
                            {onRemove && (
                                <button className="btn btn-danger" onClick={() => onRemove(event.id)}>
                                    ✕
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default EventList;