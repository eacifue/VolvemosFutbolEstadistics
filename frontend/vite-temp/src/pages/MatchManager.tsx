// Reorganized match manager into a desktop two-column workspace with improved roster, event, and toast interaction flow.
import React, { useEffect, useState } from 'react';
import MatchCreator from '../components/MatchCreator';
import TeamRoster from '../components/TeamRoster';
import PlayerSearch from '../components/PlayerSearch';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';
import Notification from '../components/Notification';
import type { Match, Player } from '../types';
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatchPlayers,
  addPlayerToMatch,
  removePlayerFromMatch,
  getMatchEvents,
  createMatchEvent,
  deleteMatchEvent,
  getPlayers
} from '../services/api';
import { emitStatsRefresh } from '../services/refreshBus';
import '../styles/MatchManager.css';

const MatchManager: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [confirmationData, setConfirmationData] = useState<{ id: number; type: 'delete' } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    show: boolean;
  }>({ type: 'info', message: '', show: false });

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    loadMatches();
    loadPlayers();
  }, []);

  useEffect(() => {
    if (selectedMatchId) {
      const matchFromList = matches.find((m) => m.id === selectedMatchId);
      if (matchFromList) setSelectedMatch(matchFromList);
      loadSelectedMatch(selectedMatchId);
    } else {
      setSelectedMatch(null);
    }
  }, [selectedMatchId, matches]);

  const loadMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
      if (data.length > 0) setSelectedMatchId((prev) => prev ?? data[0].id);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const loadPlayers = async () => {
    try {
      const data = await getPlayers();
      setAllPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const loadSelectedMatch = async (id: number) => {
    try {
      const match = await getMatch(id);
      const players = await getMatchPlayers(id);
      const events = await getMatchEvents(id);
      setSelectedMatch({ ...match, matchPlayers: players, events });
    } catch (error) {
      console.error('Error loading match:', error);
    }
  };

  const handleCreateMatch = async (date: string, homeTeamId?: number, awayTeamId?: number) => {
    try {
      const newMatch = await createMatch({ matchDate: date, homeTeamId, awayTeamId });
      setMatches((prev) => [newMatch, ...prev]);
      setSelectedMatchId(newMatch.id);
      emitStatsRefresh();
      showNotification('success', 'Partido creado exitosamente');
    } catch (error) {
      console.error('Error creating match:', error);
      showNotification('error', 'Error al crear el partido');
    }
  };

  const handleUpdateMatch = async (id: number, date: string, homeTeamId?: number, awayTeamId?: number) => {
    try {
      const updatedMatch = await updateMatch(id, { matchDate: date, homeTeamId, awayTeamId });
      setMatches((prev) => prev.map((m) => (m.id === id ? updatedMatch : m)));
      if (selectedMatchId === id) loadSelectedMatch(id);
      setEditingMatch(null);
      emitStatsRefresh();
      showNotification('success', 'Partido actualizado exitosamente');
    } catch (error) {
      console.error('Error updating match:', error);
      showNotification('error', 'Error al actualizar el partido');
    }
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setSelectedMatchId(match.id);
  };

  const handleDeleteMatch = (id: number) => {
    setConfirmationData({ id, type: 'delete' });
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await deleteMatch(id);
      const updatedMatches = matches.filter((m) => m.id !== id);
      setMatches(updatedMatches);

      if (selectedMatchId === id) {
        if (updatedMatches.length > 0) {
          setSelectedMatchId(updatedMatches[0].id);
        } else {
          setSelectedMatchId(null);
          setSelectedMatch(null);
        }
      }

      if (editingMatch?.id === id) setEditingMatch(null);
  emitStatsRefresh();
      showNotification('success', 'Partido eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting match:', error);
      showNotification('error', 'Error al eliminar el partido');
    } finally {
      setConfirmationData(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
  };

  const handleAddPlayer = async (playerId: number, teamId: number) => {
    if (!selectedMatchId) return;
    try {
      await addPlayerToMatch({ matchId: selectedMatchId, playerId, teamId });
      loadSelectedMatch(selectedMatchId);
      showNotification('success', 'Jugador agregado exitosamente');
    } catch (error: any) {
      console.error('Error adding player:', error);
      const errorMessage = error.response?.data || 'Error al agregar el jugador';
      showNotification('error', errorMessage);
    }
  };

  const handleRemovePlayer = async (playerId: number) => {
    if (!selectedMatchId) return;
    try {
      await removePlayerFromMatch(selectedMatchId, playerId);
      loadSelectedMatch(selectedMatchId);
      showNotification('success', 'Jugador eliminado del partido');
    } catch (error) {
      console.error('Error removing player:', error);
      showNotification('error', 'Error al eliminar el jugador');
    }
  };

  const handleAddEvent = async (event: { matchId: number; playerId: number; eventTypeId: 1 | 2; teamId: 1 | 2 }) => {
    if (!selectedMatchId) return;
    try {
      await createMatchEvent({ ...event, matchId: selectedMatchId });
      loadSelectedMatch(selectedMatchId);
      emitStatsRefresh();
      showNotification('success', `${event.eventTypeId === 1 ? 'Gol' : 'Asistencia'} registrado exitosamente`);
    } catch (error: any) {
      console.error('Error adding event:', error);
      const errorMessage = error.response?.data || 'Error al registrar el evento';
      showNotification('error', errorMessage);
    }
  };

  const handleRemoveEvent = async (eventId: number) => {
    try {
      await deleteMatchEvent(eventId);
      if (selectedMatchId) loadSelectedMatch(selectedMatchId);
      emitStatsRefresh();
      showNotification('success', 'Evento eliminado exitosamente');
    } catch (error) {
      console.error('Error removing event:', error);
      showNotification('error', 'Error al eliminar el evento');
    }
  };

  const whitePlayers = selectedMatch?.matchPlayers.filter((mp) => mp.teamId === 1) || [];
  const blackPlayers = selectedMatch?.matchPlayers.filter((mp) => mp.teamId === 2) || [];

  return (
    <div className="match-manager">
      <div className="container">
        {notification.show && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={hideNotification}
            duration={5000}
            position="top-right"
          />
        )}

        {confirmationData && (
          <div className="confirmation-modal-overlay" onClick={() => setConfirmationData(null)}>
            <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Eliminar partido</h3>
              <p>Esta accion eliminara el partido y sus eventos asociados.</p>
              <div className="confirmation-buttons">
                <button className="btn btn-secondary" onClick={() => setConfirmationData(null)} type="button">
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (confirmationData?.id !== undefined) handleConfirmDelete(confirmationData.id);
                  }}
                  type="button"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        <h1>Match Manager</h1>

        <MatchCreator
          onCreate={handleCreateMatch}
          editingMatch={editingMatch}
          onUpdate={handleUpdateMatch}
          onCancelEdit={handleCancelEdit}
        />

        <div className="manager-layout">
          <aside className="matches-list manager-sidebar">
            <h2>Partidos</h2>
            {matches.length === 0 ? (
              <div className="empty-inline">⚽ No hay partidos registrados.</div>
            ) : (
              <ul>
                {matches.map((match) => (
                  <li key={match.id} className={match.id === selectedMatchId ? 'selected' : ''}>
                    <button className="match-info" onClick={() => setSelectedMatchId(match.id)} type="button">
                      {new Date(match.matchDate).toLocaleString('es-ES')}
                    </button>
                    <div className="match-actions-inline">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMatch(match);
                        }}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMatch(match.id);
                        }}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="match-details manager-main">
            {selectedMatch ? (
              <>
                <h2>Partido: {new Date(selectedMatch.matchDate).toLocaleString('es-ES')}</h2>

                <PlayerSearch
                  allPlayers={allPlayers}
                  assignedPlayerIds={selectedMatch.matchPlayers?.map((mp) => mp.playerId) || []}
                  onSelectPlayer={handleAddPlayer}
                />

                <div className="teams">
                  <TeamRoster
                    teamName={selectedMatch.homeTeam?.name || 'Equipo Blanco'}
                    players={selectedMatch.matchPlayers
                      ?.filter((mp) => mp.teamId === 1)
                      .map((mp) => mp.player)
                      .filter((p): p is Player => p != null) ?? []}
                    onRemove={handleRemovePlayer}
                  />
                  <TeamRoster
                    teamName={selectedMatch.awayTeam?.name || 'Equipo Negro'}
                    players={selectedMatch.matchPlayers
                      ?.filter((mp) => mp.teamId === 2)
                      .map((mp) => mp.player)
                      .filter((p): p is Player => p != null) ?? []}
                    onRemove={handleRemovePlayer}
                  />
                </div>

                <EventForm
                  whitePlayers={whitePlayers?.map((mp) => mp.player).filter((p): p is Player => p != null) || []}
                  blackPlayers={blackPlayers?.map((mp) => mp.player).filter((p): p is Player => p != null) || []}
                  onSubmit={handleAddEvent}
                />

                <EventList
                  events={selectedMatch.events}
                  players={selectedMatch.matchPlayers}
                  onRemove={handleRemoveEvent}
                />
              </>
            ) : (
              <div className="empty-inline">Selecciona o crea un partido para ver detalles.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MatchManager;
