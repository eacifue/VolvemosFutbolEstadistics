import React from 'react';
import type { Team, Player } from './TeamList';
import PlayerList from './PlayerList';
import PlayerForm from './PlayerForm';

interface TeamDetailsProps {
    team: Team | null;
    onAddPlayer: (teamId: number, player: Omit<Player, 'id'>) => void;
    onRemovePlayer: (teamId: number, playerId: number) => void;
}

const TeamDetails: React.FC<TeamDetailsProps> = ({ team, onAddPlayer, onRemovePlayer }) => {
    if (!team) {
        return <div className="team-details"><p>Seleccione un equipo para ver detalles</p></div>;
    }

    return (
        <div className="team-details">
            <h2>{team.name}</h2>
            <PlayerList players={team.players} onRemove={id => onRemovePlayer(team.id, id)} />
            <h4>Agregar Jugador</h4>
            <PlayerForm onSubmit={player => onAddPlayer(team.id, player)} />
        </div>
    );
};

export default TeamDetails;
