// Redesigned home dashboard with football scoreboard cards, richer match context, and responsive stat comparisons.
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import type { DashboardDto, RecentMatchDto, TopPlayerDto } from '../types';
import { getDashboard } from '../services/api';
import { subscribeStatsRefresh } from '../services/refreshBus';

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

  if (loading) {
    return <div className="container page-feedback">Cargando estadisticas...</div>;
  }

  if (error) {
    return <div className="container page-feedback page-feedback-error">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="home">
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
                  .filter((e) => e.teamId === match.homeTeamId && e.eventTypeId === 1)
                  .map((e) => e.playerFullName);
                const homeAssists = match.events
                  .filter((e) => e.teamId === match.homeTeamId && e.eventTypeId === 2)
                  .map((e) => e.playerFullName);
                const awayGoals = match.events
                  .filter((e) => e.teamId === match.awayTeamId && e.eventTypeId === 1)
                  .map((e) => e.playerFullName);
                const awayAssists = match.events
                  .filter((e) => e.teamId === match.awayTeamId && e.eventTypeId === 2)
                  .map((e) => e.playerFullName);

                const homeWinner = match.winner === 'Home';
                const awayWinner = match.winner === 'Away';
                const resultBadge = getResultBadge(match);

                return (
                  <article key={match.id} className={`card match-card ${getResultClass(match)}`}>
                    <header className="match-header">
                      <div className="match-header-left">
                        <span className="match-date">{new Date(match.matchDate).toLocaleDateString('es-CO')}</span>
                        {isToday(match.matchDate) && (
                          <span className="live-badge" aria-label="Partido jugado hoy">
                            <span className="live-dot"></span>
                            HOY
                          </span>
                        )}
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

                    <div className="match-stats">
                      <div className="team-details">
                        <p className="team-label"><span className="team-color-dot team-color-white"></span>Equipo Blanco</p>
                        <p className="stats-item ellipsis"><strong>⚽ Goles:</strong> {homeGoals.length > 0 ? homeGoals.join(', ') : 'Ninguno'}</p>
                        <p className="stats-item ellipsis"><strong>🎯 Asistencias:</strong> {homeAssists.length > 0 ? homeAssists.join(', ') : 'Ninguna'}</p>
                      </div>
                      <div className="divider"></div>
                      <div className="team-details">
                        <p className="team-label"><span className="team-color-dot team-color-black"></span>Equipo Negro</p>
                        <p className="stats-item ellipsis"><strong>⚽ Goles:</strong> {awayGoals.length > 0 ? awayGoals.join(', ') : 'Ninguno'}</p>
                        <p className="stats-item ellipsis"><strong>🎯 Asistencias:</strong> {awayAssists.length > 0 ? awayAssists.join(', ') : 'Ninguna'}</p>
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
          </div>
        </div>
      </section>

      <section className="team-stats">
        <div className="container">
          <div className="section-title">
            <h2>Comparativa de Equipos</h2>
            <p>Rendimiento cara a cara entre ambos equipos.</p>
          </div>

          <div className="dashboard-overview card">
            <div className="overview-grid">
              <article className="overview-item">
                <span className="overview-label">Partidos jugados</span>
                <strong className="overview-value">{data.totalMatches}</strong>
              </article>
              <article className="overview-item overview-white">
                <span className="overview-label">Ganados blanco</span>
                <strong className="overview-value">{data.whiteTeamWins}</strong>
              </article>
              <article className="overview-item overview-black">
                <span className="overview-label">Ganados negro</span>
                <strong className="overview-value">{data.blackTeamWins}</strong>
              </article>
              <article className="overview-item overview-draw">
                <span className="overview-label">Empates</span>
                <strong className="overview-value">{data.draws}</strong>
              </article>
              <article className="overview-item overview-diff">
                <span className="overview-label">Diferencia de gol</span>
                <strong className="overview-value">{data.goalDifference > 0 ? `+${data.goalDifference}` : data.goalDifference}</strong>
              </article>
            </div>

            <div className="comparison-bars" aria-label="Comparativo de goles blanco vs negro">
              <div className="comparison-row">
                <span className="comparison-team"><span className="team-color-dot team-color-white"></span>Blanco</span>
                <div className="comparison-track"><span className="comparison-fill comparison-fill-white" style={{ width: `${whiteBar}%` }}></span></div>
                <span className="comparison-value">{whiteGoals}</span>
              </div>
              <div className="comparison-row">
                <span className="comparison-team"><span className="team-color-dot team-color-black"></span>Negro</span>
                <div className="comparison-track"><span className="comparison-fill comparison-fill-black" style={{ width: `${blackBar}%` }}></span></div>
                <span className="comparison-value">{blackGoals}</span>
              </div>
            </div>
          </div>

          <div className="stats-comparison">
            {data.teamComparison.map((team) => {
              const rival = data.teamComparison.find((t) => t.id !== team.id);
              const goalsTotal = (team.goalsFor || 0) + (rival?.goalsFor || 0) || 1;
              const goalsWidth = Math.max(10, (team.goalsFor / goalsTotal) * 100);

              return (
                <article key={team.id} className="team-stats-section card">
                  <h3 className={`team-band ${team.id === 1 ? 'band-white' : 'band-black'}`}>
                    <span className={`team-color-dot ${team.id === 1 ? 'team-color-white' : 'team-color-black'}`}></span>
                    {team.name}
                  </h3>

                  <div className="stats-grid">
                    <div className="stat-box"><div className="stat-number">{team.matchesPlayed}</div><div className="stat-label">🏆 Partidos</div></div>
                    <div className="stat-box"><div className="stat-number">{team.wins}</div><div className="stat-label">Victorias</div></div>
                    <div className="stat-box"><div className="stat-number">{team.draws}</div><div className="stat-label">Empates</div></div>
                    <div className="stat-box"><div className="stat-number">{team.losses}</div><div className="stat-label">Derrotas</div></div>
                  </div>

                  <div className="goals-visual player-stats">
                    <div className="goals-legend stat">
                      <span>⚽ GF: {team.goalsFor}</span>
                      <span>🛡️ GC: {team.goalsAgainst}</span>
                    </div>
                    <div className="goals-bar-track stat">
                      <span className={`goals-bar-fill ${team.id === 1 ? 'fill-white' : 'fill-black'}`} style={{ width: `${goalsWidth}%` }}></span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
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
