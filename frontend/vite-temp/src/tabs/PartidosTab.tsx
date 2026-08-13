import React, { useState } from 'react';
import type { Match } from '../types';
import { matchScore, matchEntries, TEAM_WHITE, TEAM_BLACK } from '../utils/teamStats';
import MatchFormationField from '../components/MatchFormationField';

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

interface Props {
  matches: Match[];
  loading: boolean;
}

const PartidosTab: React.FC<Props> = ({ matches, loading }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (loading) {
    return <div className="tab-loading">Cargando partidos…</div>;
  }

  const sorted = [...matches].sort((a, b) => (a.matchDate < b.matchDate ? 1 : -1));
  const selected = selectedId !== null ? sorted.find((m) => m.id === selectedId) ?? null : null;

  if (selected) {
    const score = matchScore(selected);
    const entries = matchEntries(selected);
    const whiteLeads = score.white >= score.black;
    const blackLeads = score.black >= score.white;

    return (
      <div className="tab-panel">
        <button type="button" className="back-link" onClick={() => setSelectedId(null)}>
          <i className="ph ph-arrow-left" /> Volver a partidos
        </button>
        <div className="match-flag">
          <i className="ph ph-flag-checkered" />
        </div>
        <div className="tab-subtle" style={{ textAlign: 'center' }}>{formatDate(selected.matchDate)}</div>
        <div className="card score-card">
          <div className="score-side">
            <div className="score-team-label">Blanco</div>
            <div className={`score-value ${whiteLeads ? 'score-value-lead' : ''}`}>{score.white}</div>
          </div>
          <div className="score-vs">VS</div>
          <div className="score-side">
            <div className="score-team-label">Negro</div>
            <div className={`score-value ${blackLeads ? 'score-value-lead' : ''}`}>{score.black}</div>
          </div>
        </div>

        <div className="match-drag-hint">
          <i className="ph ph-arrows-out-cardinal" /> Arrastra a un jugador para reubicarlo en la cancha
        </div>

        {[
          { label: 'Blanco', teamId: TEAM_WHITE, tagClass: 'tag-neutral', jerseyBg: 'var(--color-neutral-300)', gkBg: 'var(--color-accent-400)' },
          { label: 'Negro', teamId: TEAM_BLACK, tagClass: 'tag-accent-2', jerseyBg: 'var(--color-accent-2-400)', gkBg: 'var(--color-accent-400)' },
        ].map((group) => {
          const groupEntries = entries.filter((entry) => entry.teamId === group.teamId);
          if (groupEntries.length === 0) return null;
          return (
            <div key={group.teamId}>
              <div className="section-label">
                <span className={`tag ${group.tagClass}`}>Equipo {group.label}</span>
              </div>
              <MatchFormationField
                key={`${selected.id}-${group.teamId}`}
                matchId={selected.id}
                teamId={group.teamId}
                entries={groupEntries}
                jerseyBg={group.jerseyBg}
                gkBg={group.gkBg}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="tab-panel">
      <div>
        <div className="section-label">Partidos ({sorted.length})</div>
        <div className="match-list">
          {sorted.map((m) => {
            const score = matchScore(m);
            return (
              <div key={m.id} className="card match-list-item" onClick={() => setSelectedId(m.id)}>
                <div>
                  <div className="tab-subtle">{formatDate(m.matchDate)}</div>
                  <div className="match-list-title">Blanco vs Negro</div>
                </div>
                <div className="match-list-score">
                  {score.white} — {score.black}
                </div>
              </div>
            );
          })}
        </div>
        {sorted.length === 0 && <div className="empty-hint">Aún no hay partidos registrados.</div>}
      </div>
    </div>
  );
};

export default PartidosTab;
