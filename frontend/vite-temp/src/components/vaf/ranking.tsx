import React, { useMemo, useState } from 'react';
import { cx } from '../../lib/cx';
import type { Side } from '../../lib/stats';
import { Avatar } from './base';
import { Icon } from './Icon';

export const LeaderboardRow: React.FC<{ rank: number; name: string; team?: Side | null; value: React.ReactNode; unit?: string; sub?: string; delta?: number; highlight?: boolean; onClick?: () => void; actions?: React.ReactNode }> = ({ rank, name, team, value, unit, sub, highlight, delta, onClick, actions }) => {
  const inner = (
    <>
      <span className="vf-lb__rank vf-num">{rank}</span>
      <Avatar name={name} team={team} size="sm" badge={rank === 1 ? 'leader' : undefined} />
      <span className="vf-lb__who"><span className="vf-lb__name">{name}</span>{sub ? <span className="vf-lb__sub">{sub}</span> : null}</span>
      {delta ? <span className={cx('vf-lb__delta', delta > 0 ? 'is-up' : 'is-down')} aria-label={`${delta > 0 ? 'sube' : 'baja'} ${Math.abs(delta)}`}><Icon name={delta > 0 ? 'up' : 'down'} size={12} />{Math.abs(delta)}</span> : null}
      <span className="vf-lb__val"><b className="vf-num">{value}</b>{unit ? <small>{unit}</small> : null}</span>
    </>
  );
  return (
    <li className={cx('vf-lb', highlight && 'is-me', rank === 1 && 'is-first')}>
      {onClick ? <button type="button" className="vf-lb__main" onClick={onClick}>{inner}</button> : inner}
      {actions ? <span className="vf-lb__actions">{actions}</span> : null}
    </li>
  );
};

export interface PodiumEntry { id: number; name: string; team?: Side | null; value: React.ReactNode }
export const Podium: React.FC<{ entries: PodiumEntry[]; unit?: string }> = ({ entries, unit = 'goles' }) => {
  const order = [entries[1], entries[0], entries[2]].filter(Boolean);
  return (
    <div className="vf-podium" role="list" aria-label="Podio">
      {order.map((e) => {
        const pos = entries.indexOf(e) + 1;
        return (
          <div key={e.id} role="listitem" className={cx('vf-podium__col', `is-${pos}`)}>
            <Avatar name={e.name} team={e.team} size={pos === 1 ? 'lg' : 'md'} badge={pos === 1 ? 'leader' : undefined} />
            <span className="vf-podium__name">{e.name}</span>
            <span className="vf-podium__val vf-num">{e.value}<small> {unit}</small></span>
            <span className="vf-podium__block"><span className="vf-num">{pos}</span></span>
          </div>
        );
      })}
    </div>
  );
};

export interface DataTableColumn<R> { key: string; label: string; num?: boolean; sortable?: boolean; title?: string; render?: (row: R, i: number) => React.ReactNode }
type Row = { id: number | string } & Record<string, unknown>;

export function DataTable<R extends Row>({ columns, rows, sortKey, sortDir = 'desc', highlightRow, maxHeight, caption, onRowClick }: { columns: DataTableColumn<R>[]; rows: R[]; sortKey?: string; sortDir?: 'asc' | 'desc'; highlightRow?: number | string; maxHeight?: number; caption?: string; onRowClick?: (row: R) => void }) {
  const [st, setSt] = useState({ key: sortKey ?? columns[2]?.key, dir: sortDir, from: sortKey });
  // Si el padre cambia la métrica, la tabla se reordena por ella.
  const state = st.from === sortKey ? st : { key: sortKey ?? st.key, dir: sortDir, from: sortKey };
  const sorted = useMemo(() => {
    const r = rows.slice();
    if (!state.key) return r;
    r.sort((a, b) => {
      const x = a[state.key!];
      const y = b[state.key!];
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'es');
      return state.dir === 'asc' ? c : -c;
    });
    return r;
  }, [rows, state.key, state.dir]);
  return (
    <div className="vf-table-wrap" style={maxHeight ? { maxHeight } : undefined} tabIndex={0} role="region" aria-label={caption || 'Tabla'}>
      <table className="vf-table">
        {caption ? <caption className="vf-sr">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c, i) => {
              const on = state.key === c.key;
              return (
                <th key={c.key} scope="col" className={cx(c.num && 'is-num', i < 2 && 'is-sticky', `c${i}`, on && 'is-sorted')} aria-sort={on ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none'} title={c.title}>
                  {c.sortable === false ? c.label : (
                    <button type="button" onClick={() => setSt({ key: c.key, dir: on && state.dir === 'desc' ? 'asc' : 'desc', from: sortKey })}>
                      {c.label}{on ? <Icon name={state.dir === 'asc' ? 'up' : 'down'} size={12} /> : null}
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, ri) => (
            <tr key={r.id} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cx(highlightRow === r.id && 'is-me', onRowClick && 'is-clickable')}>
              {columns.map((c, i) => {
                const v = c.key === '#' ? ri + 1 : (r[c.key] as React.ReactNode);
                return <td key={c.key} className={cx(c.num && 'is-num vf-num', i < 2 && 'is-sticky', `c${i}`, state.key === c.key && 'is-sorted')}>{c.render ? c.render(r, ri) : v}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
