import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import type { DashboardDto } from '../types';
import { getDashboard } from '../services/api';

const Home: React.FC = () => {
    const [data, setData] = useState<DashboardDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getDashboard()
            .then((json: DashboardDto) => setData(json))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Cargando...</div>;
    if (error) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!data) return null;

    return (
        <div className="home">
            <section className="latest-matches">
                <div className="container">
                    <div className="section-title">
                        <h2>Últimos Partidos - Clásico Blanco vs Negro</h2>
                        <p>Revisa los resultados del enfrentamiento más emocionante</p>
                    </div>
                    <div className="grid grid-3">
                        {data.recentMatches.map((match) => {
                            const homeGoals = match.events
                                .filter(e => e.teamId === match.homeTeamId && e.eventTypeId === 1)
                                .map(e => e.playerFullName);
                            const homeAssists = match.events
                                .filter(e => e.teamId === match.homeTeamId && e.eventTypeId === 2)
                                .map(e => e.playerFullName);
                            const awayGoals = match.events
                                .filter(e => e.teamId === match.awayTeamId && e.eventTypeId === 1)
                                .map(e => e.playerFullName);
                            const awayAssists = match.events
                                .filter(e => e.teamId === match.awayTeamId && e.eventTypeId === 2)
                                .map(e => e.playerFullName);
                            const badgeText = match.winner === 'home' ? 'Blanco Gana' : match.winner === 'away' ? 'Negro Gana' : 'Empate';
                            const badgeClass = match.winner === 'home' ? 'badge-success' : match.winner === 'away' ? 'badge-danger' : 'badge-warning';

                            return (
                                <div key={match.id} className="card match-card">
                                    <div className="match-header">
                                        <span className="match-date">
                                            {new Date(match.matchDate).toLocaleDateString('es-CO')}
                                        </span>
                                        <span className={`badge ${badgeClass}`}>{badgeText}</span>
                                    </div>
                                    <div className="match-teams">
                                        <div className="team">
                                            <div className="team-name" style={{ color: '#ffffff', backgroundColor: '#1f2937', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                                Equipo Blanco
                                            </div>
                                            <div className="team-score">{match.homeGoals}</div>
                                        </div>
                                        <div className="vs">vs</div>
                                        <div className="team">
                                            <div className="team-name" style={{ color: '#ffffff', backgroundColor: '#000000', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                                Equipo Negro
                                            </div>
                                            <div className="team-score">{match.awayGoals}</div>
                                        </div>
                                    </div>
                                    <div className="match-stats">
                                        <div className="team-details">
                                            <p className="team-label" style={{ color: '#1f2937', fontWeight: 'bold' }}>Equipo Blanco</p>
                                            <p className="stats-item">
                                                <strong>Goles:</strong> {homeGoals.length > 0 ? homeGoals.join(', ') : 'Ninguno'}
                                            </p>
                                            <p className="stats-item">
                                                <strong>Asistencias:</strong> {homeAssists.length > 0 ? homeAssists.join(', ') : 'Ninguno'}
                                            </p>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="team-details">
                                            <p className="team-label" style={{ color: '#000000', fontWeight: 'bold' }}>Equipo Negro</p>
                                            <p className="stats-item">
                                                <strong>Goles:</strong> {awayGoals.length > 0 ? awayGoals.join(', ') : 'Ninguno'}
                                            </p>
                                            <p className="stats-item">
                                                <strong>Asistencias:</strong> {awayAssists.length > 0 ? awayAssists.join(', ') : 'Ninguno'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="highlights">
                <div className="container">
                    <div className="section-title">
                        <h2>Mejores Jugadores</h2>
                        <p>Top 3 en Goles y Top 3 en Asistencias</p>
                    </div>
                    <div className="teams-highlight">
                        <div className="team-highlight-section">
                            <h3 style={{ color: '#1e40af', marginBottom: '1.5rem', borderBottom: '3px solid #1e40af', paddingBottom: '0.5rem' }}>
                                ⚽ Top 3 en Goles
                            </h3>
                            <div className="players-list">
                                {data.topScorers.map((player, idx) => (
                                    <div key={player.playerId} className="list-item player-list-item">
                                        <div className="rank-badge">{idx + 1}</div>
                                        <div className="player-avatar">
                                            {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                                        </div>
                                        <div className="player-info">
                                            <h4>{player.firstName} {player.lastName}</h4>
                                        </div>
                                        <div className="player-stat">
                                            <span className="stat-value">{player.goals}</span>
                                            <span className="stat-label">Goles</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="team-highlight-section">
                            <h3 style={{ color: '#1e40af', marginBottom: '1.5rem', borderBottom: '3px solid #1e40af', paddingBottom: '0.5rem' }}>
                                🎯 Top 3 en Asistencias
                            </h3>
                            <div className="players-list">
                                {data.topAssists.map((player, idx) => (
                                    <div key={player.playerId} className="list-item player-list-item">
                                        <div className="rank-badge">{idx + 1}</div>
                                        <div className="player-avatar">
                                            {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                                        </div>
                                        <div className="player-info">
                                            <h4>{player.firstName} {player.lastName}</h4>
                                        </div>
                                        <div className="player-stat">
                                            <span className="stat-value">{player.assists}</span>
                                            <span className="stat-label">Asistencias</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="team-stats">
                <div className="container">
                    <div className="section-title">
                        <h2>Comparativa de Equipos</h2>
                        <p>Estadísticas de ambos equipos</p>
                    </div>
                    <div className="stats-comparison">
                        {data.teamComparison.map(team => {
                            const hex = team.color.replace('#', '');
                            const r = parseInt(hex.slice(0, 2), 16);
                            const g = parseInt(hex.slice(2, 4), 16);
                            const b = parseInt(hex.slice(4, 6), 16);
                            const isDark = (r * 299 + g * 587 + b * 114) / 1000 < 128;

                            return (
                                <div key={team.id} className="team-stats-section">
                                    <h3 style={{
                                        color: isDark ? '#ffffff' : '#1f2937',
                                        backgroundColor: isDark ? team.color : 'transparent',
                                        padding: isDark ? '0.75rem' : '0',
                                        borderRadius: isDark ? '0.5rem' : '0',
                                        borderBottom: isDark ? 'none' : `3px solid ${team.color}`,
                                        marginBottom: '1.5rem',
                                        paddingBottom: '0.5rem'
                                    }}>
                                        {team.name}
                                    </h3>
                                    <div className="stats-grid">
                                        {[
                                            { value: team.matchesPlayed, label: 'Partidos Jugados' },
                                            { value: team.wins, label: 'Victorias' },
                                            { value: team.draws, label: 'Empates' },
                                            { value: team.losses, label: 'Derrotas' },
                                        ].map((stat, idx) => (
                                            <div
                                                key={idx}
                                                className="stat-box"
                                                style={isDark ? { background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' } : {}}
                                            >
                                                <div className="stat-number">{stat.value}</div>
                                                <div className="stat-label">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="player-stats" style={{ marginTop: '1.5rem' }}>
                                        <div className="stat">
                                            <span className="stat-value">{team.goalsFor}</span>
                                            <span className="stat-label">Goles a favor</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{team.goalsAgainst}</span>
                                            <span className="stat-label">Goles en contra</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>¿Quieres conocer más detalles?</h2>
                        <p>Accede a todas las estadísticas, jugadores y resultados de tu equipo</p>
                        <div className="cta-buttons">
                            <a href="/jugadores" className="btn btn-accent">Ver Todos los Jugadores</a>
                            <a href="/estadisticas" className="btn btn-primary">Ver Estadísticas Completas</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;