import React from 'react';
import type { DashboardDto, TopPlayerDto } from '../types';

interface Props {
  dashboard: DashboardDto | null;
  loading: boolean;
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

type BoardField = 'goals' | 'assists' | 'ownGoals' | 'wins' | 'losses';

const boardValue = (p: TopPlayerDto, field: BoardField): number => p[field] ?? 0;

const TopsTab: React.FC<Props> = ({ dashboard, loading }) => {
  if (loading || !dashboard) {
    return <div className="tab-loading">Cargando estadísticas…</div>;
  }

  const boards: { title: string; field: BoardField; entries: TopPlayerDto[] }[] = [
    { title: 'Top 5 Goleadores', field: 'goals', entries: dashboard.topScorers },
    { title: 'Top 5 Asistencias', field: 'assists', entries: dashboard.topAssists },
    { title: 'Top 5 Más Ganados', field: 'wins', entries: dashboard.topWinners },
    { title: 'Top 5 Más Perdidos', field: 'losses', entries: dashboard.topLosers },
    { title: 'Top 5 Autogoles', field: 'ownGoals', entries: dashboard.topOwnGoals },
  ];

  const white = dashboard.teamComparison.find((t) => t.id === 1);
  const black = dashboard.teamComparison.find((t) => t.id === 2);

  return (
    <div className="tab-panel">
      <div>
        <div className="section-label section-label-accent">Top 1 · Últimos 3 partidos</div>
        <div className="recent-list">
          {dashboard.recentMatches.map((m) => (
            <div key={m.id} className="card recent-match-card">
              <div className="recent-match-header">
                <span className="tab-subtle">{formatDate(m.matchDate)}</span>
                <span className="recent-match-score">
                  {m.homeGoals} — {m.awayGoals}
                </span>
              </div>
              <div className="recent-events">
                {m.events.slice(0, 4).map((ev) => (
                  <div key={ev.id} className="recent-event">
                    <span className={`tag ${ev.teamId === 1 ? 'tag-neutral' : 'tag-accent-2'}`}>
                      {ev.teamId === 1 ? 'Blanco' : 'Negro'}
                    </span>
                    {ev.playerFullName} · {ev.eventTypeName}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {dashboard.recentMatches.length === 0 && <div className="empty-hint">Aún no hay partidos.</div>}
        </div>
      </div>

      {boards.map((board) => (
        <div key={board.title}>
          <div className="section-label section-label-accent">{board.title}</div>
          <div className="card board-card">
            {board.entries.map((entry, idx) => (
              <div key={entry.playerId} className="board-row">
                <div className="board-rank">
                  <span className="board-rank-num">{idx + 1}</span>
                  {entry.firstName} {entry.lastName}
                </div>
                <span className="board-value">{boardValue(entry, board.field)}</span>
              </div>
            ))}
            {board.entries.length === 0 && <div className="empty-hint">Sin datos aún.</div>}
          </div>
        </div>
      ))}

      <div>
        <div className="section-label">Cara a cara</div>
        <div className="card h2h-card">
          <div className="h2h-side">
            <div>Blanco</div>
            <div className="h2h-value">{white?.wins ?? 0}</div>
            <div className="tab-subtle">victorias</div>
          </div>
          <div className="h2h-center">
            <i className="ph-fill ph-trophy" />
            <div>{white?.draws ?? 0}</div>
            <div>empates</div>
          </div>
          <div className="h2h-side">
            <div>Negro</div>
            <div className="h2h-value h2h-value-black">{black?.wins ?? 0}</div>
            <div className="tab-subtle">victorias</div>
          </div>
        </div>
        <div className="h2h-goals-row">
          <span>{white?.goalsFor ?? 0} goles a favor</span>
          <span>{black?.goalsFor ?? 0} goles a favor</span>
        </div>
      </div>
    </div>
  );
};

export default TopsTab;
