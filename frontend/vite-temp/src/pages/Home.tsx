// Redesigned home dashboard with football scoreboard cards, richer match context, and responsive stat comparisons.
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import type { DashboardDto, RecentMatchDto, TopPlayerDto } from '../types';
import { getDashboard } from '../services/api';
import { subscribeStatsRefresh } from '../services/refreshBus';
import { EVENT_TYPE_IDS, getEventTypeLabelById, isGoalForTeam } from '../constants/eventTypes';

const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const getResultBadge = (match: RecentMatchDto): 'Ganador Equipo Blanco' | 'Ganador Equipo Negro' | 'EMPATE' => {
  if (match.winner === 'Home') return 'Ganador Equipo Blanco';
  if (match.winner === 'Away') return 'Ganador Equipo Negro';
  return 'EMPATE';
};

const getResultClass = (match: RecentMatchDto): string => {
  if (match.winner === 'Home') return 'result-white-win';
  if (match.winner === 'Away') return 'result-black-win';
  return 'result-draw';
};

const playerInitials = (player: TopPlayerDto): string => {
  return `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
};

const getAvatarClassById = (id: number): string => {
  return id % 2 === 0 ? 'avatar-black' : 'avatar-white';
};

const getRankClass = (rank: number): string => {
  if (rank === 1) return 'rank-gold';
  if (rank === 2) return 'rank-silver';
  if (rank === 3) return 'rank-bronze';
  return 'rank-default';
};

interface StatHeroCard {
  key: string;
  value: string;
  label: string;
  icon: string;
  colorClass: string;
}

const buildStatCards = (data: DashboardDto): StatHeroCard[] => [
  { key: 'total', value: String(data.totalMatches), label: 'Partidos Jugados', icon: '🏟️', colorClass: 'stat-total' },
  { key: 'white', value: String(data.whiteTeamWins), label: 'Victorias Blanco', icon: '⚪', colorClass: 'stat-white' },
  { key: 'black', value: String(data.blackTeamWins), label: 'Victorias Negro', icon: '⚫', colorClass: 'stat-black' },
  { key: 'draws', value: String(data.draws), label: 'Empates', icon: '🤝', colorClass: 'stat-draw' },
  {
    key: 'diff',
    value: data.goalDifference > 0 ? `+${data.goalDifference}` : String(data.goalDifference),
    label: 'Diferencia de Gol',
    icon: '⚽',
    colorClass: data.goalDifference > 0 ? 'stat-positive' : data.goalDifference < 0 ? 'stat-negative' : 'stat-draw',
  },
];

const Home: React.FC = () => {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const json = await getDashboard();
      setData(json as DashboardDto);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Error cargando dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    void fetchDashboard();
  };

  useEffect(() => {
    void fetchDashboard();

    const unsubscribe = subscribeStatsRefresh(() => {
      void fetchDashboard();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const whiteGoals = data?.whiteGoalsFor ?? 0;
  const blackGoals = data?.blackGoalsFor ?? 0;
  const goalsTotal = Math.max(whiteGoals + blackGoals, 1);
  const whiteBar = Math.max(10, (whiteGoals / goalsTotal) * 100);
  const blackBar = Math.max(10, (blackGoals / goalsTotal) * 100);

  const scorerLeader = useMemo(() => {
    if (!data?.topScorers.length) return 1;
    return Math.max(...data.topScorers.map((p) => p.goals ?? 0), 1);
  }, [data?.topScorers]);

  const assistLeader = useMemo(() => {
    if (!data?.topAssists.length) return 1;
    return Math.max(...data.topAssists.map((p) => p.assists ?? 0), 1);
  }, [data?.topAssists]);

  const ownGoalLeader = useMemo(() => {
    if (!data?.topOwnGoals.length) return 1;
    return Math.max(...data.topOwnGoals.map((p) => p.ownGoals ?? 0), 1);
  }, [data?.topOwnGoals]);

  if (loading) {
    return (
      <div className="home" aria-busy="true" aria-live="polite" aria-label="Cargando estadisticas">
        <section className="stats-hero">
          <div className="container">
            <div className="stats-hero-grid">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="stat-hero-card skeleton-dark" style={{ minHeight: '128px' }} />
              ))}
            </div>
          </div>
        </section>
        <section className="latest-matches">
          <div className="container">
            <div className="skeleton" style={{ height: '2rem', width: '220px', marginBottom: '1.5rem', borderRadius: '0.5rem' }} />
            <div className="grid matches-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ borderRadius: '1rem', minHeight: '280px' }} />
              ))}
            </div>
          </div>
        </section>
        <section className="highlights" style={{ padding: '3rem 0' }}>
          <div className="container">
            <div className="skeleton" style={{ height: '2rem', width: '200px', marginBottom: '1.5rem', borderRadius: '0.5rem' }} />
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {[1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ borderRadius: '1rem', minHeight: '180px' }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container status-shell">
        <div className="status-card status-card-error fade-in">
          <span className="status-icon" aria-hidden="true">⚠️</span>
          <h3>No se pudo cargar el dashboard</h3>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={handleRetry}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container status-shell">
        <div className="status-card status-card-empty fade-in">
          <span className="status-icon" aria-hidden="true">📊</span>
          <h3>Aun no hay datos para mostrar</h3>
          <p>Cuando se registren partidos y eventos, aqui veras las estadisticas.</p>
          <Link to="/admin" className="btn btn-secondary">Ir a Admin</Link>
        </div>
      </div>
    );
  }

  const statCards = buildStatCards(data);

  /* Wins distribution percentages */
  const totalForPct = Math.max(data.totalMatches, 1);
  const whiteWinsPct = Math.round((data.whiteTeamWins / totalForPct) * 100);
  const blackWinsPct = Math.round((data.blackTeamWins / totalForPct) * 100);
  const drawPct = 100 - whiteWinsPct - blackWinsPct;

  /* Head-to-head rows */
  const whiteTeam = data.teamComparison.find((t) => t.id === 1);
  const blackTeam = data.teamComparison.find((t) => t.id !== 1);

  const h2hRows: { label: string; white: number | string; black: number | string }[] = whiteTeam && blackTeam
    ? [
        { label: 'Victorias', white: whiteTeam.wins, black: blackTeam.wins },
        { label: 'Empates', white: whiteTeam.draws, black: blackTeam.draws },
        { label: 'Derrotas', white: whiteTeam.losses, black: blackTeam.losses },
        { label: 'Goles a Favor', white: whiteTeam.goalsFor, black: blackTeam.goalsFor },
        { label: 'Goles en Contra', white: whiteTeam.goalsAgainst, black: blackTeam.goalsAgainst },
      ]
    : [];

  return (
    <div className="home page-enter">
      {/* STATS HERO — dark sports band at top */}
      <section className="stats-hero" aria-label="Estadísticas generales de la temporada">
        <div className="container">
          <div className="stats-hero-grid">
            {statCards.map((card, i) => (
              <article key={card.key} className={`stat-hero-card ${card.colorClass} fade-in fade-in-${i + 1}`}>
                <span className="stat-hero-icon" aria-hidden="true">{card.icon}</span>
                <strong className="stat-hero-value">{card.value}</strong>
                <span className="stat-hero-label">{card.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WINS DISTRIBUTION — segmented bar */}
      {data.totalMatches > 0 && (
        <section className="wins-distribution" aria-label="Distribucion de resultados">
          <div className="container">
            <div className="dist-bar-wrap">
              <div className="dist-bar" role="img" aria-label={`Blanco ${whiteWinsPct}%, Empates ${drawPct}%, Negro ${blackWinsPct}%`}>
                {whiteWinsPct > 0 && (
                  <span
                    className="dist-segment dist-white"
                    style={{ width: `${whiteWinsPct}%` }}
                    title={`Blanco gana ${whiteWinsPct}%`}
                  />
                )}
                {drawPct > 0 && (
                  <span
                    className="dist-segment dist-draw"
                    style={{ width: `${drawPct}%` }}
                    title={`Empates ${drawPct}%`}
                  />
                )}
                {blackWinsPct > 0 && (
                  <span
                    className="dist-segment dist-black"
                    style={{ width: `${blackWinsPct}%` }}
                    title={`Negro gana ${blackWinsPct}%`}
                  />
                )}
              </div>
              <div className="dist-labels">
                <span className="dist-label-white">
                  <span className="dist-dot dist-dot-white" />
                  Blanco {whiteWinsPct}%
                </span>
                <span className="dist-label-draw">
                  <span className="dist-dot dist-dot-draw" />
                  Empates {drawPct}%
                </span>
                <span className="dist-label-black">
                  <span className="dist-dot dist-dot-black" />
                  Negro {blackWinsPct}%
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="latest-matches">
        <div className="container">
          <div className="section-title">
            <h2>Ultimos Partidos</h2>
            <p>El clasico Blanco vs Negro en formato marcador de estadio.</p>
          </div>

          {data.recentMatches.length === 0 ? (
            <div className="empty-state-card">
              <p className="empty-state-icon">⚽</p>
              <h3>Aun no hay partidos registrados</h3>
              <p>Comienza creando el proximo encuentro desde el panel de administracion.</p>
              <Link to="/admin" className="btn btn-primary">Crear primer partido</Link>
            </div>
          ) : (
            <div className="grid grid-3 matches-grid">
              {data.recentMatches.map((match) => {
                const homeGoals = match.events
                  .filter((e) => isGoalForTeam(e, match.homeTeamId, match.awayTeamId))
                  .map((e) => e.playerFullName);
                const homeAssists = match.events
                  .filter((e) => e.teamId === match.homeTeamId && e.eventTypeId === EVENT_TYPE_IDS.assist)
                  .map((e) => e.playerFullName);
                const awayGoals = match.events
                  .filter((e) => isGoalForTeam(e, match.awayTeamId, match.homeTeamId))
                  .map((e) => e.playerFullName);
                const awayAssists = match.events
                  .filter((e) => e.teamId === match.awayTeamId && e.eventTypeId === EVENT_TYPE_IDS.assist)
                  .map((e) => e.playerFullName);

                const homeWinner = match.winner === 'Home';
                const awayWinner = match.winner === 'Away';
                const resultBadge = getResultBadge(match);
                const homeKeyEvents = match.events
                  .filter((e) => e.teamId === match.homeTeamId && (e.eventTypeId === EVENT_TYPE_IDS.goal || e.eventTypeId === EVENT_TYPE_IDS.assist || e.eventTypeId === EVENT_TYPE_IDS.ownGoal))
                  .slice(0, 4);
                const awayKeyEvents = match.events
                  .filter((e) => e.teamId === match.awayTeamId && (e.eventTypeId === EVENT_TYPE_IDS.goal || e.eventTypeId === EVENT_TYPE_IDS.assist || e.eventTypeId === EVENT_TYPE_IDS.ownGoal))
                  .slice(0, 4);
                const totalKeyEvents = homeKeyEvents.length + awayKeyEvents.length;

                return (
                  <article key={match.id} className={`card match-card ${getResultClass(match)} fade-in`}>
                    <header className="match-header">
                      <div className="match-header-left">
                        <span className="match-date">{new Date(match.matchDate).toLocaleDateString('es-CO')}</span>
                        {isToday(match.matchDate) && (
                          <span className="live-badge" aria-label="Partido jugado hoy">
                            <span className="live-dot"></span>
                            HOY
                          </span>
                        )}
                        <span className="match-meta-pill">{totalKeyEvents} eventos clave</span>
                      </div>
                      <span className="badge badge-dark">{resultBadge}</span>
                    </header>

                    <div className="scoreboard match-teams">
                      <div className={`score-team team ${homeWinner ? 'team-winner' : ''}`}>
                        <span className="team-color-dot team-color-white" aria-hidden="true"></span>
                        <span className="score-team-name team-name ellipsis">EQUIPO BLANCO</span>
                        <span className="score-value team-score">{match.homeGoals}</span>
                      </div>
                      <div className="score-separator vs">:</div>
                      <div className={`score-team team ${awayWinner ? 'team-winner' : ''}`}>
                        <span className="team-color-dot team-color-black" aria-hidden="true"></span>
                        <span className="score-team-name team-name ellipsis">EQUIPO NEGRO</span>
                        <span className="score-value team-score">{match.awayGoals}</span>
                      </div>
                    </div>

                    <div className="score-stage">Resultado Final</div>

                    <div className="match-stats">
                      <div className="team-details team-details-white">
                        <p className="team-label"><span className="team-color-dot team-color-white"></span>Equipo Blanco</p>
                        <p className="stats-item ellipsis"><strong>Goles:</strong> {homeGoals.length > 0 ? homeGoals.join(', ') : 'Ninguno'}</p>
                        <p className="stats-item ellipsis"><strong>Asistencias:</strong> {homeAssists.length > 0 ? homeAssists.join(', ') : 'Ninguna'}</p>
                        <div className="events-stack" aria-label="Eventos clave equipo blanco">
                          {homeKeyEvents.length > 0 ? homeKeyEvents.map((event) => (
                            <span key={event.id} className={`event-chip ${event.eventTypeId === EVENT_TYPE_IDS.ownGoal ? 'event-chip-own-goal' : 'event-chip-white'} ellipsis`}>
                              {getEventTypeLabelById(event.eventTypeId)}: {event.playerFullName}
                            </span>
                          )) : (
                            <span className="event-chip event-chip-empty">Sin eventos clave</span>
                          )}
                        </div>
                      </div>
                      <div className="divider"></div>
                      <div className="team-details team-details-black">
                        <p className="team-label"><span className="team-color-dot team-color-black"></span>Equipo Negro</p>
                        <p className="stats-item ellipsis"><strong>Goles:</strong> {awayGoals.length > 0 ? awayGoals.join(', ') : 'Ninguno'}</p>
                        <p className="stats-item ellipsis"><strong>Asistencias:</strong> {awayAssists.length > 0 ? awayAssists.join(', ') : 'Ninguna'}</p>
                        <div className="events-stack" aria-label="Eventos clave equipo negro">
                          {awayKeyEvents.length > 0 ? awayKeyEvents.map((event) => (
                            <span key={event.id} className={`event-chip ${event.eventTypeId === EVENT_TYPE_IDS.ownGoal ? 'event-chip-own-goal' : 'event-chip-black'} ellipsis`}>
                              {getEventTypeLabelById(event.eventTypeId)}: {event.playerFullName}
                            </span>
                          )) : (
                            <span className="event-chip event-chip-empty">Sin eventos clave</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="highlights">
        <div className="container">
          <div className="section-title">
            <h2>Mejores Jugadores</h2>
            <p>Top 3 goleadores y asistentes de la temporada.</p>
          </div>

          <div className="teams-highlight">
            <div className="team-highlight-section">
              <h3>⚽ Top Goleadores</h3>
              <div className="players-list">
                {data.topScorers.map((player, idx) => {
                  const goals = player.goals ?? 0;
                  const progress = Math.max(8, (goals / scorerLeader) * 100);
                  return (
                    <div key={player.playerId} className="list-item player-list-item">
                      <div className={`rank-badge ${getRankClass(idx + 1)}`}>#{idx + 1}</div>
                      <div className={`player-avatar ${getAvatarClassById(player.playerId)}`}>{playerInitials(player)}</div>
                      <div className="player-info">
                        <h4 className="ellipsis">{player.firstName} {player.lastName}</h4>
                        <div className="player-progress">
                          <span className="player-progress-fill" style={{ width: `${progress}%` }}></span>
                        </div>
                      </div>
                      <div className="player-stat">
                        <span className="stat-value">{goals}</span>
                        <span className="stat-label">⚽ Goles</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="team-highlight-section">
              <h3>🎯 Top Asistencias</h3>
              <div className="players-list">
                {data.topAssists.map((player, idx) => {
                  const assists = player.assists ?? 0;
                  const progress = Math.max(8, (assists / assistLeader) * 100);
                  return (
                    <div key={player.playerId} className="list-item player-list-item">
                      <div className={`rank-badge ${getRankClass(idx + 1)}`}>#{idx + 1}</div>
                      <div className={`player-avatar ${getAvatarClassById(player.playerId)}`}>{playerInitials(player)}</div>
                      <div className="player-info">
                        <h4 className="ellipsis">{player.firstName} {player.lastName}</h4>
                        <div className="player-progress">
                          <span className="player-progress-fill" style={{ width: `${progress}%` }}></span>
                        </div>
                      </div>
                      <div className="player-stat">
                        <span className="stat-value">{assists}</span>
                        <span className="stat-label">🎯 Asist.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="team-highlight-section team-highlight-section-own-goals">
              <h3>🥅 Top Autogoles</h3>
              <div className="players-list">
                {(data.topOwnGoals ?? []).map((player, idx) => {
                  const ownGoals = player.ownGoals ?? 0;
                  const progress = Math.max(8, (ownGoals / ownGoalLeader) * 100);
                  return (
                    <div key={player.playerId} className="list-item player-list-item player-list-item-own-goals">
                      <div className={`rank-badge ${getRankClass(idx + 1)}`}>#{idx + 1}</div>
                      <div className={`player-avatar ${getAvatarClassById(player.playerId)}`}>{playerInitials(player)}</div>
                      <div className="player-info">
                        <h4 className="ellipsis">{player.firstName} {player.lastName}</h4>
                        <p className="player-subteam ellipsis">{player.teamName || 'Equipo'}</p>
                        <div className="player-progress player-progress-own-goals">
                          <span className="player-progress-fill player-progress-fill-own-goals" style={{ width: `${progress}%` }}></span>
                        </div>
                      </div>
                      <div className="player-stat player-stat-own-goals">
                        <span className="stat-value">{ownGoals}</span>
                        <span className="stat-label">🔴 Autogoles</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="team-stats">
        <div className="container">
          <div className="section-title">
            <h2>Cara a Cara</h2>
            <p>Comparativa directa entre Equipo Blanco y Equipo Negro.</p>
          </div>

          {h2hRows.length > 0 ? (
            <div className="h2h-panel card fade-in">
              {/* Team headers */}
              <div className="h2h-header">
                <div className="h2h-team h2h-team-white">
                  <span className="h2h-team-dot h2h-dot-white" />
                  <span className="h2h-team-name">EQUIPO BLANCO</span>
                </div>
                <div className="h2h-center-col" aria-hidden="true">VS</div>
                <div className="h2h-team h2h-team-black">
                  <span className="h2h-team-name">EQUIPO NEGRO</span>
                  <span className="h2h-team-dot h2h-dot-black" />
                </div>
              </div>

              {/* Data rows */}
              {h2hRows.map((row) => {
                const wVal = Number(row.white);
                const bVal = Number(row.black);
                const whiteLeads = wVal > bVal;
                const blackLeads = bVal > wVal;
                return (
                  <div key={row.label} className="h2h-row">
                    <strong className={`h2h-value h2h-value-white ${whiteLeads ? 'h2h-leader' : ''}`}>
                      {row.white}
                    </strong>
                    <span className="h2h-row-label">{row.label}</span>
                    <strong className={`h2h-value h2h-value-black ${blackLeads ? 'h2h-leader' : ''}`}>
                      {row.black}
                    </strong>
                  </div>
                );
              })}

              {/* Goals comparison bars */}
              <div className="h2h-bars">
                <div className="h2h-bar-row">
                  <span className="h2h-bar-label">Blanco</span>
                  <div className="h2h-bar-track">
                    <span className="h2h-bar-fill h2h-fill-white" style={{ width: `${whiteBar}%` }} />
                  </div>
                  <span className="h2h-bar-val">{whiteGoals} goles</span>
                </div>
                <div className="h2h-bar-row">
                  <span className="h2h-bar-label">Negro</span>
                  <div className="h2h-bar-track">
                    <span className="h2h-bar-fill h2h-fill-black" style={{ width: `${blackBar}%` }} />
                  </div>
                  <span className="h2h-bar-val">{blackGoals} goles</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state-card">
              <p className="empty-state-icon">📊</p>
              <h3>Sin estadísticas aun</h3>
              <p>Los datos de comparativa apareceran una vez que se registren partidos.</p>
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Listo para ver mas?</h2>
            <p>Explora todos los jugadores y administra el clasico desde un panel rapido y claro.</p>
            <div className="cta-buttons">
              <Link to="/jugadores" className="btn btn-accent">Ver Jugadores</Link>
              <Link to="/admin" className="btn btn-secondary">Ir a Admin</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
