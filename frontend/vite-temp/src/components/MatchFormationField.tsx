import React, { useRef, useState } from 'react';
import type { MatchEntry } from '../utils/teamStats';

const POSITION_ORDER = ['Delantero', 'Mediocampista', 'Defensa', 'Portero'];
const ROW_Y: Record<string, number> = { Delantero: 16, Mediocampista: 40, Defensa: 64, Portero: 88 };
const FALLBACK_POSITION = 'Mediocampista';

const resolvePosition = (name?: string): string => (name && POSITION_ORDER.includes(name) ? name : FALLBACK_POSITION);

const STORAGE_KEY = 'byn_field_layout_v1';

type Overrides = Record<number, { x: number; y: number }>;

const loadOverrides = (matchId: number, teamId: number): Overrides => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw);
    return all[`${matchId}:${teamId}`] ?? {};
  } catch {
    return {};
  }
};

const persistOverride = (matchId: number, teamId: number, playerId: number, pos: { x: number; y: number }): void => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const key = `${matchId}:${teamId}`;
    all[key] = { ...(all[key] ?? {}), [playerId]: pos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage unavailable — layout just won't persist across reloads
  }
};

interface Props {
  matchId: number;
  teamId: number;
  entries: MatchEntry[];
  jerseyBg: string;
  gkBg: string;
}

const MatchFormationField: React.FC<Props> = ({ matchId, teamId, entries, jerseyBg, gkBg }) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [overrides, setOverrides] = useState<Overrides>(() => loadOverrides(matchId, teamId));
  const [dragging, setDragging] = useState<{ playerId: number; x: number; y: number } | null>(null);

  const rows = POSITION_ORDER.map((posName) => entries.filter((e) => resolvePosition(e.positionName) === posName));

  const handlePointerDown = (playerId: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (playerId: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (!fieldRef.current || e.buttons === 0) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const x = Math.max(6, Math.min(94, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(6, Math.min(94, ((e.clientY - rect.top) / rect.height) * 100));
    setDragging({ playerId, x, y });
  };

  const handlePointerUp = (playerId: number) => () => {
    setDragging((current) => {
      if (current && current.playerId === playerId) {
        const pos = { x: current.x, y: current.y };
        setOverrides((prev) => ({ ...prev, [playerId]: pos }));
        persistOverride(matchId, teamId, playerId, pos);
      }
      return null;
    });
  };

  return (
    <div className="match-field" ref={fieldRef}>
      <div className="match-field-border" />
      <div className="match-field-circle" />
      {rows.map((row, rowIdx) => {
        const posName = POSITION_ORDER[rowIdx];
        const isGk = posName === 'Portero';
        return row.map((entry, i) => {
          const override = overrides[entry.playerId];
          const isDragging = dragging?.playerId === entry.playerId;
          const x = isDragging ? dragging.x : override?.x ?? ((i + 1) / (row.length + 1)) * 100;
          const y = isDragging ? dragging.y : override?.y ?? ROW_Y[posName];
          const hasStats = entry.goals > 0 || entry.assists > 0 || entry.ownGoals > 0;

          return (
            <div
              key={entry.playerId}
              className="match-jersey"
              style={{ left: `${x}%`, top: `${y}%` }}
              onPointerDown={handlePointerDown(entry.playerId)}
              onPointerMove={handlePointerMove(entry.playerId)}
              onPointerUp={handlePointerUp(entry.playerId)}
              onPointerCancel={handlePointerUp(entry.playerId)}
            >
              <div className="match-jersey-shirt" style={{ background: isGk ? gkBg : jerseyBg }}>
                <i className="ph-fill ph-t-shirt" />
              </div>
              <div className="match-jersey-name">{entry.playerName}</div>
              {hasStats && (
                <div className="match-jersey-badges">
                  {entry.goals > 0 && (
                    <span className="match-jersey-badge">
                      <i className="ph-fill ph-soccer-ball" /> {entry.goals}
                    </span>
                  )}
                  {entry.assists > 0 && (
                    <span className="match-jersey-badge">
                      <i className="ph ph-target" /> {entry.assists}
                    </span>
                  )}
                  {entry.ownGoals > 0 && (
                    <span className="match-jersey-badge match-jersey-badge-warn">
                      <i className="ph ph-warning" /> {entry.ownGoals}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        });
      })}
    </div>
  );
};

export default MatchFormationField;
