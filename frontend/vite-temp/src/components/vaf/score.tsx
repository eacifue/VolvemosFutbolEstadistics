import React from 'react';
import { cx } from '../../lib/cx';
import type { FormResult, Side } from '../../lib/stats';
import { resultText } from '../../lib/format';
import { Avatar, TeamChip } from './base';
import { EventIcon } from './events';

export const LiveDot: React.FC<{ minute?: number; compact?: boolean }> = ({ minute, compact }) => (
  <span className={cx('vf-live', compact && 'vf-live--compact')}>
    <span className="vf-live__dot" aria-hidden="true" />
    {compact ? (minute != null ? `${minute}'` : 'VIVO') : `EN VIVO${minute != null ? ` · ${minute}'` : ''}`}
  </span>
);

export interface ScoreboardProps { white: number; black: number; size?: 'hero' | 'lg' | 'md' | 'mini'; live?: boolean; minute?: number; date?: string; scorers?: Record<Side, string[]>; mvp?: { name: string; team: Side }; result?: boolean }
export const Scoreboard: React.FC<ScoreboardProps> = ({ white, black, size = 'md', live, minute, date, scorers, result = true, mvp }) => {
  const winner = white > black ? 'white' : black > white ? 'black' : null;
  const label = `Blanco ${white}, Negro ${black}${live ? ', en vivo' : ''}`;
  if (size === 'mini') {
    return (
      <span className="vf-score-mini" aria-label={label}>
        <span className="vf-swatch vf-swatch--white vf-swatch--xs" aria-hidden="true" />
        <span className={cx('vf-num', winner === 'black' && 'is-dim')}>{white}</span>
        <span className="vf-score-mini__dash">–</span>
        <span className={cx('vf-num', winner === 'white' && 'is-dim')}>{black}</span>
        <span className="vf-swatch vf-swatch--black vf-swatch--xs" aria-hidden="true" />
        {live ? <LiveDot minute={minute} compact /> : null}
      </span>
    );
  }
  const sw = size === 'hero' ? 'lg' : 'md';
  return (
    <div className={cx('vf-score', `vf-score--${size}`, live && 'is-live')} role="group" aria-label={label}>
      {live || date ? <div className="vf-score__meta">{live ? <LiveDot minute={minute} /> : <span>{date}</span>}</div> : null}
      <div className="vf-score__row">
        <div className="vf-score__team"><span className={cx('vf-swatch', 'vf-swatch--white', `vf-swatch--${sw}`)} aria-hidden="true" /><span className="vf-score__name">Blanco</span></div>
        <div className="vf-score__nums" aria-live={live ? 'polite' : undefined}>
          <span className={cx('vf-num', winner === 'black' && 'is-dim')}>{white}</span>
          <span className="vf-score__dash" aria-hidden="true">–</span>
          <span className={cx('vf-num', winner === 'white' && 'is-dim')}>{black}</span>
        </div>
        <div className="vf-score__team vf-score__team--right"><span className={cx('vf-swatch', 'vf-swatch--black', `vf-swatch--${sw}`)} aria-hidden="true" /><span className="vf-score__name">Negro</span></div>
      </div>
      {result && !live ? <div className="vf-score__result">{resultText(white, black)}</div> : null}
      {scorers && (scorers.white.length || scorers.black.length) ? (
        <div className="vf-score__scorers">
          <ul>{scorers.white.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <span className="vf-score__ball"><EventIcon type="goal" size={14} /></span>
          <ul className="is-right">{scorers.black.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      ) : null}
      {mvp ? <div className="vf-score__mvp"><Avatar name={mvp.name} team={mvp.team} size="sm" badge="mvp" /><span><b>{mvp.name}</b> · MVP del partido</span></div> : null}
    </div>
  );
};

const FORM_LABEL: Record<FormResult, string> = { V: 'Victoria', E: 'Empate', P: 'Derrota' };
export const FormChips: React.FC<{ results: FormResult[]; goals?: number[]; size?: 'sm' | 'md'; label?: string }> = ({ results, goals, size = 'md', label }) => (
  <ol className={cx('vf-form', `vf-form--${size}`)} aria-label={label || 'Forma reciente'}>
    {results.map((r, i) => (
      <li key={i} className={cx('vf-form__chip', `is-${r}`)} title={FORM_LABEL[r]}>
        <span aria-hidden="true">{r}</span><span className="vf-sr">{FORM_LABEL[r]}</span>
        {goals && goals[i] != null ? <span className="vf-form__goals" aria-label={`${goals[i]} goles`}>{goals[i] > 0 ? goals[i] : '·'}</span> : null}
      </li>
    ))}
  </ol>
);

export const VersusBar: React.FC<{ label: string; white: number; black: number; format?: (v: number) => string | number }> = ({ label, white, black, format = (v) => v }) => {
  const total = white + black || 1;
  const pw = (white / total) * 100;
  return (
    <div className="vf-vs">
      <div className="vf-vs__head"><span className="vf-num">{format(white)}</span><span className="vf-vs__label">{label}</span><span className="vf-num">{format(black)}</span></div>
      <div className="vf-vs__bar" role="img" aria-label={`${label}: Blanco ${format(white)}, Negro ${format(black)}`}>
        <span className="vf-vs__w" style={{ width: `${pw}%` }} /><span className="vf-vs__b" style={{ width: `${100 - pw}%` }} />
      </div>
    </div>
  );
};

export const RivalryBar: React.FC<{ white: number; draws: number; black: number; gfWhite?: number; gfBlack?: number }> = ({ white, draws, black, gfWhite, gfBlack }) => {
  const t = white + draws + black || 1;
  return (
    <div className="vf-rivalry">
      <div className="vf-rivalry__nums">
        <div><span className="vf-rivalry__big vf-num">{white}</span><span className="vf-rivalry__cap"><TeamChip team="white" size="sm" /> victorias</span></div>
        <div className="vf-rivalry__mid"><span className="vf-rivalry__big vf-num is-dim">{draws}</span><span className="vf-rivalry__cap">empates</span></div>
        <div className="is-right"><span className="vf-rivalry__big vf-num">{black}</span><span className="vf-rivalry__cap">victorias <TeamChip team="black" size="sm" /></span></div>
      </div>
      <div className="vf-rivalry__bar" role="img" aria-label={`Blanco ${white} victorias, ${draws} empates, Negro ${black} victorias`}>
        <span className="vf-vs__w" style={{ width: `${(white / t) * 100}%` }} />
        <span className="vf-rivalry__d" style={{ width: `${(draws / t) * 100}%` }} />
        <span className="vf-vs__b" style={{ width: `${(black / t) * 100}%` }} />
      </div>
      {gfWhite != null ? <div className="vf-rivalry__gf"><span><b className="vf-num">{gfWhite}</b> goles a favor</span><span><b className="vf-num">{gfBlack}</b> goles a favor</span></div> : null}
    </div>
  );
};
