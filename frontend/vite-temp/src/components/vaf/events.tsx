import React from 'react';
import { cx } from '../../lib/cx';
import { EV_LABEL, type EvType, type Side } from '../../lib/stats';
import { TeamChip } from './base';

export const EventIcon: React.FC<{ type: EvType; size?: number }> = ({ type, size = 16 }) => {
  if (type === 'yellow' || type === 'red') {
    return <svg className={`vf-evicon vf-evicon--${type}`} width={size} height={size} viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="1.5" width="8.5" height="12" rx="1.5" transform="rotate(8 8 8)" /></svg>;
  }
  if (type === 'assist') {
    return (
      <svg className="vf-evicon vf-evicon--assist" width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="3.5" cy="12.5" r="2" />
        <path d="M5.5 10.5C7 6 9.5 4 13.5 3.5M10.5 2l3 1.5-1.6 2.9" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={`vf-evicon vf-evicon--${type}`} width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.6" className="vf-evicon__ball" />
      <path d="M8 4.6l2.6 1.9-1 3H6.4l-1-3z" className="vf-evicon__pent" />
      {type === 'own-goal' ? <path d="M2.5 13.5l11-11" className="vf-evicon__slash" /> : null}
    </svg>
  );
};

export const EventBadge: React.FC<{ type: EvType; count?: number; label?: string }> = ({ type, count, label }) => (
  <span className={cx('vf-evbadge', `vf-evbadge--${type}`)} aria-label={`${count != null ? `${count} ` : ''}${label || EV_LABEL[type]}`}>
    <EventIcon type={type} size={14} />
    {count != null && count > 1 ? <span className="vf-num">×{count}</span> : null}
    {label ? <span>{label}</span> : null}
  </span>
);

export interface EventCountsProps { goals?: number; assists?: number; ownGoals?: number; yellow?: number; red?: number; compact?: boolean }
export const EventCounts: React.FC<EventCountsProps> = ({ goals = 0, assists = 0, ownGoals = 0, yellow = 0, red = 0, compact }) => {
  const list = ([['goal', goals], ['assist', assists], ['own-goal', ownGoals], ['yellow', yellow], ['red', red]] as [EvType, number][]).filter(([, n]) => n > 0);
  if (!list.length) return null;
  return <span className={cx('vf-evcounts', compact && 'is-compact')}>{list.map(([t, n]) => <EventBadge key={t} type={t} count={n} />)}</span>;
};

export interface TimelineEntry { key: string; side: Side; type: EvType; player: string; assist?: string; min?: number }

export const TimelineItem: React.FC<{ side: Side; minute?: number; type: EvType; player: string; assist?: string; score?: [number, number] | null; order?: boolean }> = ({ side, minute, type, player, assist, score, order }) => (
  <li className={cx('vf-tl__item', `is-${side}`)}>
    <div className="vf-tl__card">
      <EventIcon type={type} size={18} />
      <div className="vf-tl__text">
        <span className="vf-tl__player">{player}{type === 'own-goal' ? <span className="vf-tl__tag"> (a.g.)</span> : null}</span>
        {assist ? <span className="vf-tl__assist">asist. {assist}</span> : <span className="vf-tl__type">{EV_LABEL[type]}</span>}
      </div>
    </div>
    <div className="vf-tl__axis">
      <span className="vf-tl__min vf-num">{minute != null ? (order ? `${minute}.` : `${minute}'`) : ''}</span>
      {score ? <span className="vf-tl__score vf-num">{score[0]}–{score[1]}</span> : null}
    </div>
    <div className="vf-tl__spacer" />
  </li>
);

// Sin minuto en la API: se numera por orden (1, 2, 3), nunca "Min --".
export const Timeline: React.FC<{ events: TimelineEntry[]; hasMinutes?: boolean }> = ({ events, hasMinutes = false }) => {
  let w = 0;
  let b = 0;
  return (
    <div className="vf-tl">
      <div className="vf-tl__heads"><TeamChip team="white" size="sm" /><span className="vf-tl__label">{hasMinutes ? 'MIN' : 'ORDEN'}</span><TeamChip team="black" size="sm" /></div>
      <ol className="vf-tl__list">
        {events.map((e, i) => {
          let sc: [number, number] | null = null;
          if (e.type === 'goal' || e.type === 'own-goal') {
            if (e.side === 'white') w++;
            else b++;
            sc = [w, b];
          }
          return <TimelineItem key={e.key} side={e.side} minute={hasMinutes ? e.min : i + 1} order={!hasMinutes} type={e.type} player={e.player} assist={e.assist} score={sc} />;
        })}
      </ol>
      <div className="vf-tl__end">Final · {w}–{b}</div>
    </div>
  );
};

// Flujo del partido: escalera de diferencia de goles (arriba Blanco, abajo Negro).
// Sin minutos, el eje es el orden de los goles.
export const Momentum: React.FC<{ goals: { side: Side; type: EvType; min?: number }[]; duration?: number; height?: number; byOrder?: boolean }> = ({ goals, duration = 60, height = 140, byOrder }) => {
  const list = goals.map((g, i) => ({ ...g, at: byOrder ? i + 1 : g.min ?? i + 1 }));
  const span = byOrder ? Math.max(1, list.length + 1) : duration;
  let d = 0;
  const steps: { at: number; d: number; og?: boolean }[] = [{ at: 0, d: 0 }];
  list.forEach((g) => {
    d += g.side === 'white' ? 1 : -1;
    steps.push({ at: g.at, d, og: g.type === 'own-goal' });
  });
  const max = Math.max(2, ...steps.map((s) => Math.abs(s.d)));
  const W = 340;
  const H = height;
  const mid = H / 2;
  const x = (m: number) => (m / span) * W;
  const y = (v: number) => mid - (v / max) * (mid - 10);
  let path = `M0 ${mid}`;
  steps.slice(1).forEach((s) => { path += ` H${x(s.at).toFixed(1)} V${y(s.d).toFixed(1)}`; });
  path += ` H${W}`;
  const area = `${path} V${mid} Z`;
  const final = steps[steps.length - 1].d;
  return (
    <figure className="vf-mom" aria-label={`Flujo del partido: ${final > 0 ? 'terminó arriba Blanco' : final < 0 ? 'terminó arriba Negro' : 'terminó empatado'}`}>
      <div className="vf-mom__lab is-top"><TeamChip team="white" size="sm" /> arriba</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" aria-hidden="true">
        <clipPath id="vfmTop"><rect x="0" y="0" width={W} height={mid} /></clipPath>
        <clipPath id="vfmBot"><rect x="0" y={mid} width={W} height={mid} /></clipPath>
        <line x1="0" y1={mid} x2={W} y2={mid} className="vf-mom__zero" />
        <line x1={W / 2} y1="4" x2={W / 2} y2={H - 4} className="vf-mom__half" />
        <path d={area} clipPath="url(#vfmTop)" className="vf-mom__w" />
        <path d={area} clipPath="url(#vfmBot)" className="vf-mom__b" />
        <path d={path} className="vf-mom__line" />
        {steps.slice(1).map((s, i) => <circle key={i} cx={x(s.at)} cy={y(s.d)} r="3.5" className={`vf-mom__dot${s.og ? ' is-og' : ''}`} />)}
      </svg>
      <div className="vf-mom__lab is-bottom"><TeamChip team="black" size="sm" /> arriba</div>
      <figcaption className="vf-mom__axis">
        {byOrder ? (<><span>Inicio</span><span>Orden de los goles</span><span>Final</span></>) : (<><span className="vf-num">0'</span><span className="vf-num">{duration / 2}'</span><span className="vf-num">{duration}'</span></>)}
      </figcaption>
    </figure>
  );
};
