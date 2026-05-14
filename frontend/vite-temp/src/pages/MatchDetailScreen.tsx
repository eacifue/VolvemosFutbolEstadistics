import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Match, MatchEvent, MatchPlayer } from '../types';
import { getMatch, getMatchEvents, getMatchPlayers, getMatches } from '../services/api';
import { getEventIconById, getEventTypeLabelById, isGoalForTeam, isOwnGoalEvent } from '../constants/eventTypes';
import '../styles/MatchDetailScreen.css';

type LoadedMatchDetail = Match & {
  matchPlayers: MatchPlayer[];
  events: MatchEvent[];
};

const formatDate = (value: string) => new Date(value).toLocaleString('es-ES');

const getEventIcon = (event: MatchEvent): string => {
  const label = (event.eventType?.name ?? '').toLowerCase();

  if (label.includes('autogol') || label.includes('owngoal') || label.includes('autogoal')) return '🥅';
  if (event.eventTypeId === 1 || label.includes('gol')) return '⚽';
  if (event.eventTypeId === 2 || label.includes('asist')) return '🎯';
  if (label.includes('amarilla')) return '🟨';
  if (label.includes('roja')) return '🟥';
  if (label.includes('cambio')) return '🔄';

  return getEventIconById(event.eventTypeId);
};

const getEventLabel = (event: MatchEvent): string => {
  return event.eventType?.name ?? getEventTypeLabelById(event.eventTypeId);
};

const getEventMinute = (event: MatchEvent): string => {
  const maybeMinute = (event as unknown as { minute?: number }).minute;
  if (typeof maybeMinute === 'number' && maybeMinute >= 0) {
    return `${maybeMinute}`;
  }

  return '--';
};

const renderTeamEvents = (
  events: MatchEvent[],
  getPlayerNameById: (playerId: number) => string,
) => {
  if (!events.length) {
    return <p className="muted">Sin eventos registrados para este equipo.</p>;
  }

  return (
    <ul className="events-list events-list-compact">
      {events.map((event) => (
        <li key={event.id} className={isOwnGoalEvent(event) ? 'event-own-goal' : ''}>
          <span className={`event-icon ${isOwnGoalEvent(event) ? 'event-icon-own-goal' : ''}`} aria-hidden="true">{getEventIcon(event)}</span>
          <span className="event-text">
            {getEventLabel(event)} - Min {getEventMinute(event)} - {getPlayerNameById(event.playerId)}
          </span>
        </li>
      ))}
    </ul>
  );
};

const MatchDetailScreen: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<LoadedMatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateCarouselControls = () => {
    const carousel = carouselRef.current;
    if (!carousel) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    const hasOverflow = maxScrollLeft > 1;

    setCanScrollLeft(hasOverflow && carousel.scrollLeft > 2);
    setCanScrollRight(hasOverflow && carousel.scrollLeft < maxScrollLeft - 2);
  };

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const step = Math.max(260, Math.round(carousel.clientWidth * 0.68));
    carousel.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const loadMatchDetail = async (matchId: number) => {
    setIsLoadingDetail(true);
    try {
      const [match, matchPlayers, events] = await Promise.all([
        getMatch(matchId),
        getMatchPlayers(matchId),
        getMatchEvents(matchId),
      ]);

      setSelectedMatch({ ...match, matchPlayers, events });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMatches();
      setMatches(data);

      if (data.length === 0) {
        setSelectedMatchId(null);
        setSelectedMatch(null);
        return;
      }

      const initialMatchId = data[0].id;
      setSelectedMatchId(initialMatchId);
      await loadMatchDetail(initialMatchId);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudieron cargar los partidos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    updateCarouselControls();

    if (!carousel) return;

    const onScroll = () => updateCarouselControls();
    const onResize = () => updateCarouselControls();

    carousel.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      carousel.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [matches.length]);

  const handleSelectMatch = async (matchId: number) => {
    if (matchId === selectedMatchId) return;
    setSelectedMatchId(matchId);

    try {
      await loadMatchDetail(matchId);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo cargar el detalle del partido.');
    }
  };

  const detail = useMemo(() => {
    if (!selectedMatch) {
      return {
        homeName: 'Equipo Local',
        awayName: 'Equipo Visitante',
        homeScore: 0,
        awayScore: 0,
        homeLineup: [] as MatchPlayer[],
        awayLineup: [] as MatchPlayer[],
        homeEvents: [] as MatchEvent[],
        awayEvents: [] as MatchEvent[],
      };
    }

    const homeName = selectedMatch.homeTeam?.name ?? 'Equipo Local';
    const awayName = selectedMatch.awayTeam?.name ?? 'Equipo Visitante';

    const homeLineup = selectedMatch.matchPlayers.filter((mp) => mp.teamId === 1);
    const awayLineup = selectedMatch.matchPlayers.filter((mp) => mp.teamId === 2);
    const homeEvents = selectedMatch.events.filter((event) => event.teamId === 1);
    const awayEvents = selectedMatch.events.filter((event) => event.teamId === 2);

    const homeTeamId = selectedMatch.homeTeamId ?? 1;
    const awayTeamId = selectedMatch.awayTeamId ?? 2;

    const homeScore = selectedMatch.events.filter((event) => isGoalForTeam(event, homeTeamId, awayTeamId)).length;
    const awayScore = selectedMatch.events.filter((event) => isGoalForTeam(event, awayTeamId, homeTeamId)).length;

    return { homeName, awayName, homeScore, awayScore, homeLineup, awayLineup, homeEvents, awayEvents };
  }, [selectedMatch]);

  const getPlayerNameById = (playerId: number): string => {
    const player = selectedMatch?.matchPlayers.find((mp) => mp.playerId === playerId)?.player;
    if (!player) return 'Jugador';
    return `${player.firstName} ${player.lastName}`;
  };

  if (isLoading) {
    return (
      <div className="match-detail-screen status-shell">
        <div className="status-card fade-in">
          <div className="spinner" aria-hidden="true" />
          <p>Cargando resumen de partidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-detail-screen status-shell">
        <div className="status-card status-card-error fade-in">
          <h3>No pudimos cargar la pantalla de partidos</h3>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => void loadData()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="match-detail-screen status-shell">
        <div className="status-card status-card-empty fade-in">
          <h3>No hay partidos</h3>
          <p>Cuando registres partidos, aqui podras ver el detalle completo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="match-detail-screen page-enter">
      <div className="container match-detail-layout">
        <section className="match-detail-top card">
          {isLoadingDetail ? (
            <div className="match-detail-loading" aria-live="polite">
              <div className="spinner" aria-hidden="true" />
              <span>Actualizando detalle del partido...</span>
            </div>
          ) : (
            <div key={selectedMatch?.id ?? 'empty'} className="detail-fade-in">
              <header className="match-vs-row">
                <div className="team-head">
                  <span className="team-crest" aria-hidden="true">🏟️</span>
                  <h2 className="ellipsis">{detail.homeName}</h2>
                </div>
                <div className="vs-center">VS</div>
                <div className="team-head team-head-away">
                  <h2 className="ellipsis">{detail.awayName}</h2>
                  <span className="team-crest" aria-hidden="true">🏟️</span>
                </div>
              </header>

              <div className="scoreboard" aria-label="Marcador del partido">
                <span>{detail.homeScore}</span>
                <span className="score-separator">-</span>
                <span>{detail.awayScore}</span>
              </div>

              <div className="lineups-grid">
                <article className="lineup-card">
                  <h3>{detail.homeName}</h3>
                  <div className="lineup-scroll">
                    {detail.homeLineup.length > 0 ? (
                      <ul>
                        {detail.homeLineup.map((mp) => (
                          <li key={mp.id}>{mp.player.firstName} {mp.player.lastName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">Sin alineacion cargada.</p>
                    )}
                  </div>

                  <div className="team-events-block">
                    <h4>Eventos ({detail.homeName})</h4>
                    {renderTeamEvents(detail.homeEvents, getPlayerNameById)}
                  </div>
                </article>

                <article className="lineup-card">
                  <h3>{detail.awayName}</h3>
                  <div className="lineup-scroll">
                    {detail.awayLineup.length > 0 ? (
                      <ul>
                        {detail.awayLineup.map((mp) => (
                          <li key={mp.id}>{mp.player.firstName} {mp.player.lastName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">Sin alineacion cargada.</p>
                    )}
                  </div>

                  <div className="team-events-block">
                    <h4>Eventos ({detail.awayName})</h4>
                    {renderTeamEvents(detail.awayEvents, getPlayerNameById)}
                  </div>
                </article>
              </div>
            </div>
          )}
        </section>

        <section className="match-detail-bottom card">
          <header className="list-head">
            <h3>Listado de partidos</h3>
            <span>{matches.length} totales</span>
          </header>

          <div className="matches-carousel-shell">
            <button
              type="button"
              className={`carousel-arrow left ${canScrollLeft ? 'is-visible' : ''}`}
              onClick={() => handleScrollCarousel('left')}
              aria-label="Desplazar partidos a la izquierda"
              disabled={!canScrollLeft}
            >
              <span aria-hidden="true">←</span>
            </button>

            <div
              ref={carouselRef}
              className="matches-scroll-list"
              role="listbox"
              aria-label="Partidos disponibles"
            >
              {matches.map((match) => {
                const isSelected = selectedMatchId === match.id;
                const homeName = match.homeTeam?.name ?? 'Equipo Local';
                const awayName = match.awayTeam?.name ?? 'Equipo Visitante';
                const isFinished = new Date(match.matchDate).getTime() <= Date.now();

                const homeTeamId = match.homeTeamId ?? 1;
                const awayTeamId = match.awayTeamId ?? 2;
                const homeGoals = (match.events ?? []).filter((event) => isGoalForTeam(event, homeTeamId, awayTeamId)).length;
                const awayGoals = (match.events ?? []).filter((event) => isGoalForTeam(event, awayTeamId, homeTeamId)).length;

                return (
                  <button
                    key={match.id}
                    type="button"
                    className={`match-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => void handleSelectMatch(match.id)}
                    aria-selected={isSelected}
                  >
                    <div className="match-card-top">
                      <span className="match-status-chip">{isFinished ? 'Finalizado' : 'Programado'}</span>
                    </div>
                    <div className="match-teams">{homeName} <span className="versus-inline">vs</span> {awayName}</div>
                    <div className="match-score-mini">{homeGoals} - {awayGoals}</div>
                    <div className="match-date-mini">{formatDate(match.matchDate)}</div>
                    <div className="match-overlay-info">Ver detalle del partido</div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={`carousel-arrow right ${canScrollRight ? 'is-visible' : ''}`}
              onClick={() => handleScrollCarousel('right')}
              aria-label="Desplazar partidos a la derecha"
              disabled={!canScrollRight}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MatchDetailScreen;
