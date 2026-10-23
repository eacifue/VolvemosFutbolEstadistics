import React from 'react';
import { cx, TEAM_LABEL } from '../../lib/cx';
import type { Side } from '../../lib/stats';
import { Avatar, Pronto, TeamChip } from './base';
import { Icon } from './Icon';

export const MatchListItem: React.FC<{ date: string; white?: number; black?: number; sw?: string; sb?: string; badge?: 'HOY' | 'PRÓXIMO'; upcoming?: boolean; time?: string; assigned?: number; onClick?: () => void }> = ({ date, white = 0, black = 0, sw, sb, badge, upcoming, time, assigned, onClick }) => {
  if (upcoming) {
    return (
      <button type="button" className="vf-mli is-upcoming" onClick={onClick}>
        <span className="vf-mli__date"><span className="vf-badge vf-badge--accent">{badge || 'PRÓXIMO'}</span>{date} · {time}</span>
        <span className="vf-mli__row"><TeamChip team="white" /><span className="vf-mli__vs">vs</span><TeamChip team="black" /></span>
        <span className="vf-mli__meta"><Icon name="players" size={14} /> {assigned ? `${assigned} jugadores convocados` : 'Equipos por armar'}</span>
      </button>
    );
  }
  const r: Side | 'draw' = white > black ? 'white' : black > white ? 'black' : 'draw';
  return (
    <button type="button" className="vf-mli" onClick={onClick}>
      <span className="vf-mli__date">{badge ? <span className="vf-badge vf-badge--accent">{badge}</span> : null}{date}<span className={cx('vf-mli__res', `is-${r}`)}>{r === 'draw' ? 'Empate' : `Ganó ${TEAM_LABEL[r]}`}</span></span>
      <span className="vf-mli__row">
        <span className="vf-mli__side"><span className="vf-swatch vf-swatch--white vf-swatch--md" aria-hidden="true" /><span className="vf-mli__team">Blanco</span></span>
        <span className="vf-mli__score vf-num"><span className={r === 'black' ? 'is-dim' : ''}>{white}</span><span className="vf-mli__dash">–</span><span className={r === 'white' ? 'is-dim' : ''}>{black}</span></span>
        <span className="vf-mli__side is-right"><span className="vf-mli__team">Negro</span><span className="vf-swatch vf-swatch--black vf-swatch--md" aria-hidden="true" /></span>
      </span>
      {sw || sb ? <span className="vf-mli__scorers"><span>{sw}</span><span className="is-right">{sb}</span></span> : null}
    </button>
  );
};

// Confirmación de asistencia (Voy / Tal vez / No voy) necesita Attendance en el backend → Pronto.
export const NextMatchCard: React.FC<{ date: string; time: string; venue?: string; assigned: number; teamsReady?: boolean; onLineups?: () => void }> = ({ date, time, venue, assigned, teamsReady, onLineups }) => (
  <section className="vf-next" aria-label="Próximo partido">
    <div className="vf-next__head"><span className="vf-overline">Próximo partido</span><span className="vf-badge vf-badge--accent">{date}</span></div>
    <div className="vf-next__when">
      <span className="vf-next__time vf-num">{time}</span>
      {venue ? <span className="vf-next__venue"><Icon name="pin" size={14} /> {venue}</span> : null}
    </div>
    <div className="vf-next__count">
      <span><b className="vf-num">{assigned}</b> {assigned === 1 ? 'jugador convocado' : 'jugadores convocados'}</span>
    </div>
    <div className="vf-row vf-row--between">
      <span className="vf-small vf-dim">¿Vas? Confirma desde la app</span>
      <Pronto title="La confirmación de asistencia llega cuando el servidor guarde las respuestas" />
    </div>
    <div className="vf-next__rsvp" role="radiogroup" aria-label="¿Vas?" aria-disabled="true">
      {[['voy', 'Voy'], ['tal', 'Tal vez'], ['no', 'No voy']].map(([k, l]) => (
        <button key={k} type="button" role="radio" aria-checked={false} disabled className={cx('vf-rsvp', `is-${k}`)}>{l}</button>
      ))}
    </div>
    {teamsReady ? (
      <div className="vf-next__teams"><Icon name="check" size={14} /> Equipos armados — <button type="button" className="vf-link vf-link--btn" onClick={onLineups}>ver alineaciones</button></div>
    ) : null}
  </section>
);

export const VoteOption: React.FC<{ player: string; team?: Side | null; selected?: boolean; votes?: number; pct?: number; closed?: boolean; disabled?: boolean; onClick?: () => void }> = ({ player, team, votes, pct, selected, closed, disabled, onClick }) => (
  <button type="button" role="radio" aria-checked={!!selected} disabled={disabled || (closed && !selected)} onClick={onClick} className={cx('vf-vote', selected && 'is-on', closed && 'is-closed')}>
    <Avatar name={player} team={team} size="sm" />
    <span className="vf-vote__name">{player}</span>
    {closed || votes != null ? (
      <span className="vf-vote__res"><span className="vf-vote__bar"><span style={{ width: `${pct || 0}%` }} /></span><b className="vf-num">{votes}</b></span>
    ) : <span className={cx('vf-vote__radio', selected && 'is-on')} aria-hidden="true">{selected ? <Icon name="check" size={14} /> : null}</span>}
  </button>
);
