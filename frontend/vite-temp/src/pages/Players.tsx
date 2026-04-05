import React, { useState, useEffect } from 'react';
import '../styles/Players.css';
import type { Player } from '../types';
import { getPlayers } from '../services/api';

const Players: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getPlayers()
            .then((data: Player[]) => setPlayers(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Cargando...</div>;
    if (error) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'red' }}>{error}</div>;

    const filteredPlayers = players.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
    );

    return (
        <div className="players-page">
            <section className="players-header">
                <div className="container">
                    <h1>Nuestros Jugadores</h1>
                    <p>Conoce a los mejores talentos del fútbol</p>
                </div>
            </section>

            <section className="all-players">
                <div className="container">
                    <div className="search-section">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar jugador por nombre o posición..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <span className="search-count">{filteredPlayers.length}</span>
                        </div>
                    </div>

                    {filteredPlayers.length > 0 ? (
                        <div className="players-grid">
                            {filteredPlayers.map(player => (
                                <div key={player.id} className="player-card-premium">
                                    <div className="card-header">
                                        <div className="player-avatar-large">
                                            {player.firstName.charAt(0)}
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <h3 className="player-name">
                                            {player.firstName} {player.lastName}
                                        </h3>
                                        <div className="position-badge">
                                            {player.position?.name ?? 'Sin posición'}
                                        </div>

                                        <div className="player-performance">
                                            <div className="performance-item goals">
                                                <div className="perf-header">
                                                    <span className="perf-icon">⚽</span>
                                                    <span className="perf-label">Goles</span>
                                                </div>
                                                <span className="perf-value">{player.goals}</span>
                                            </div>
                                            <div className="performance-item assists">
                                                <div className="perf-header">
                                                    <span className="perf-icon">🎯</span>
                                                    <span className="perf-label">Asistencias</span>
                                                </div>
                                                <span className="perf-value">{player.assists}</span>
                                            </div>
                                            <div className="performance-item matches">
                                                <div className="perf-header">
                                                    <span className="perf-icon">🏆</span>
                                                    <span className="perf-label">Partidos</span>
                                                </div>
                                                <span className="perf-value">{player.matches}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${Math.min((player.goals + player.assists) * 2, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="performance-text">Desempeño</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No se encontraron jugadores</h3>
                            <p>Intenta con otro nombre o posición</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Players;