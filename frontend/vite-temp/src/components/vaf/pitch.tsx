import React, { useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import type { PosShort } from '../../lib/format';
import type { Side } from '../../lib/stats';
import { Jersey, TeamChip } from './base';
import { EventCounts, type EventCountsProps } from './events';

export interface PitchPlayer { id: number; name: string; short: string; initials: string; posShort: PosShort; number?: number; events?: EventCountsProps; x?: number; y?: number }

const ROWS: Record<PosShort, number> = { POR: 0, DEF: 1, MED: 2, DEL: 3 };
const layoutSide = (list: PitchPlayer[], side: Side) => {
  const rows: PitchPlayer[][] = [[], [], [], []];
  list.forEach((p) => rows[ROWS[p.posShort] ?? 2].push(p));
  const ys = side === 'white' ? [7, 19, 31, 43] : [93, 81, 69, 57];
  const out: (PitchPlayer & { x: number; y: number; side: Side })[] = [];
  rows.forEach((r, ri) => r.forEach((p, i) => out.push({ ...p, side, x: p.x ?? ((i + 1) / (r.length + 1)) * 100, y: p.y ?? ys[ri] })));
  return out;
};

const clamp = (v: number) => Math.max(5, Math.min(95, v));

export const Pitch: React.FC<{
  white: PitchPlayer[];
  black: PitchPlayer[];
  editable?: boolean;
  mvpId?: number;
  selectedId?: number | null;
  showNames?: boolean;
  onSelect?: (id: number | null) => void;
  onMove?: (id: number, x: number, y: number) => void;
}> = ({ white, black, editable, mvpId, selectedId, showNames = true, onSelect, onMove }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: number; x: number; y: number; sx: number; sy: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const all = [...layoutSide(white, 'white'), ...layoutSide(black, 'black')];

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  const onPitchClick = (e: React.MouseEvent) => {
    if (!editable || selectedId == null || e.target !== e.currentTarget) return;
    const r = ref.current!.getBoundingClientRect();
    onMove?.(selectedId, clamp(((e.clientX - r.left) / r.width) * 100), clamp(((e.clientY - r.top) / r.height) * 100));
  };

  return (
    <div ref={ref} className={cx('vf-pitch', editable && 'is-editable')} role="group" aria-label="Alineaciones: Blanco arriba, Negro abajo" onClick={onPitchClick}>
      <svg className="vf-pitch__lines" viewBox="0 0 68 100" preserveAspectRatio="none" aria-hidden="true">
        <rect x="1" y="1" width="66" height="98" /><line x1="1" y1="50" x2="67" y2="50" /><circle cx="34" cy="50" r="8" /><circle cx="34" cy="50" r=".8" className="dot" />
        <rect x="16" y="1" width="36" height="14" /><rect x="25" y="1" width="18" height="5" /><rect x="16" y="85" width="36" height="14" /><rect x="25" y="94" width="18" height="5" />
      </svg>
      <span className="vf-pitch__side is-top"><TeamChip team="white" size="sm" /></span>
      <span className="vf-pitch__side is-bottom"><TeamChip team="black" size="sm" /></span>
      {all.map((p) => {
        const dragging = drag?.id === p.id;
        const x = dragging ? drag.x : p.x;
        const y = dragging ? drag.y : p.y;
        const handlers = editable
          ? {
              onPointerDown: (e: React.PointerEvent<HTMLSpanElement>) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag({ id: p.id, x: p.x, y: p.y, sx: e.clientX, sy: e.clientY, moved: false });
              },
              onPointerMove: (e: React.PointerEvent<HTMLSpanElement>) => {
                if (!drag || drag.id !== p.id) return;
                const moved = drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4;
                setDrag({ ...drag, ...(moved ? pos(e) : {}), moved });
              },
              onPointerUp: () => {
                if (!drag || drag.id !== p.id) return;
                if (drag.moved) {
                  onMove?.(p.id, drag.x, drag.y);
                  justDragged.current = true;
                }
                setDrag(null);
              },
              onPointerCancel: () => setDrag(null),
            }
          : {};
        return (
          <span key={`${p.side}${p.id}`} className={cx('vf-pitch__slot', dragging && 'is-dragging')} style={{ left: `${x}%`, top: `${y}%` }} {...handlers}>
            <Jersey team={p.side} number={p.number} initials={p.initials} size={38} name={showNames ? p.short : null} events={p.events} mvp={mvpId === p.id} draggable={editable} selected={selectedId === p.id}
              onClick={editable ? () => {
                if (justDragged.current) { justDragged.current = false; return; }
                onSelect?.(selectedId === p.id ? null : p.id);
              } : undefined}
              onKeyDown={editable ? (e) => {
                const d = ({ ArrowUp: [0, -3], ArrowDown: [0, 3], ArrowLeft: [-3, 0], ArrowRight: [3, 0] } as Record<string, number[]>)[e.key];
                if (!d) return;
                e.preventDefault();
                onMove?.(p.id, clamp(p.x + d[0]), clamp(p.y + d[1]));
              } : undefined} />
          </span>
        );
      })}
    </div>
  );
};

export const LineupList: React.FC<{ white: PitchPlayer[]; black: PitchPlayer[] }> = ({ white, black }) => {
  const col = (list: PitchPlayer[], team: Side) => (
    <div className="vf-lineup__col">
      <TeamChip team={team} />
      <ul>
        {list.map((p) => (
          <li key={p.id}>
            <span className="vf-num vf-lineup__n">{p.number ?? p.initials}</span>
            <span className="vf-lineup__name">{p.name}</span>
            <span className="vf-lineup__pos">{p.posShort}</span>
            {p.events ? <EventCounts {...p.events} compact /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
  return <div className="vf-lineup">{col(white, 'white')}{col(black, 'black')}</div>;
};
