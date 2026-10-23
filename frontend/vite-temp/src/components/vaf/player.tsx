import React from 'react';
import { cx } from '../../lib/cx';
import { PREVENTED_HELP, RATING_HELP, WALL_MAX_CONCEDED, type PlayerStats } from '../../lib/stats';
import { Avatar, Pronto, TeamChip } from './base';
import { EventIcon } from './events';
import { Icon, type IconName } from './Icon';

export const StatTile: React.FC<{ label: string; value: React.ReactNode; sub?: string; emphasis?: boolean; size?: 'sm' | 'md' | 'lg'; title?: string }> = ({ label, value, sub, emphasis, size = 'md', title }) => (
  <div className={cx('vf-stat', `vf-stat--${size}`, emphasis && 'is-emph')} title={title}>
    <span className="vf-stat__val vf-num">{value}</span>
    <span className="vf-stat__label">{label}</span>
    {sub ? <span className="vf-stat__sub">{sub}</span> : null}
  </div>
);

const STREAK = {
  fire: { icon: 'fire', title: 'Racha de fuego', tail: 'partidos marcando' },
  drought: { icon: 'drought', title: 'Sequía', tail: 'sin gol' },
  wall: { icon: 'shield', title: 'Muro', tail: `partidos con ${WALL_MAX_CONCEDED} o menos recibidos` },
} as const;

export const Streak: React.FC<{ kind: 'fire' | 'drought' | 'wall'; n: number; name?: string }> = ({ kind, n, name }) => {
  const k = STREAK[kind];
  return (
    <span className={cx('vf-streak', `is-${kind}`)}>
      <Icon name={k.icon} size={14} />
      <span>{k.title} · <b className="vf-num">{n}</b> {k.tail}{name ? ` — ${name}` : ''}</span>
    </span>
  );
};

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

export const PlayerCard: React.FC<{ stats: PlayerStats; variant?: 'compact' | 'full'; onClick?: () => void }> = ({ stats: s, variant = 'compact', onClick }) => {
  const p = s.info;
  const team = s.team ?? 'white';
  if (variant === 'compact') {
    return (
      <button type="button" className="vf-pcard" onClick={onClick}>
        <Avatar name={p.name} initials={p.initials} team={s.team} size="md" />
        <span className="vf-pcard__who">
          <span className="vf-pcard__name">{p.name}</span>
          <span className="vf-pcard__meta">
            {p.posShort}
            {s.team ? <> · <TeamChip team={s.team} size="sm" label="short" /> {s.team === 'white' ? s.whitePct : 100 - s.whitePct}%</> : ' · sin partidos'}
          </span>
        </span>
        <span className="vf-pcard__stats">
          {s.isKeeper ? (
            <>
              <span title="Goles recibidos por partido"><b className="vf-num">{s.pj ? s.gcpj.toFixed(1) : '–'}</b><small>GC/PJ</small></span>
              <span title="Vallas invictas"><b className="vf-num">{s.cleanSheets}</b><small>Vallas</small></span>
            </>
          ) : (
            <>
              <span><b className="vf-num">{s.g}</b><small>G</small></span>
              <span><b className="vf-num">{s.a}</b><small>A</small></span>
            </>
          )}
          <span><b className="vf-num">{s.wp}%</b><small>Vic.</small></span>
        </span>
        <Icon name="chevron" size={18} className="vf-pcard__chev" />
      </button>
    );
  }
  return (
    <article className={cx('vf-carta', `vf-carta--${team}`)} aria-label={`Carta de ${p.name}`}>
      <div className="vf-carta__top">
        <div className="vf-carta__rating" title={RATING_HELP}><span className="vf-num">{s.rating != null ? s.rating.toFixed(1) : '–'}</span><small>RATING</small></div>
        <div className="vf-carta__pos"><span>{p.posShort}</span></div>
      </div>
      <div className="vf-carta__id">
        <Avatar name={p.name} initials={p.initials} team={s.team} size="lg" />
        <div><h3 className="vf-carta__name">{p.name}</h3>{p.nick ? <span className="vf-carta__nick">“{p.nick}”</span> : p.pos ? <span className="vf-carta__nick">{p.pos}</span> : null}</div>
      </div>
      <div className="vf-carta__split" aria-label={`Juega ${s.whitePct}% con Blanco y ${100 - s.whitePct}% con Negro`}>
        <span className="vf-carta__splitlab"><TeamChip team="white" size="sm" label="short" /><b className="vf-num">{s.whitePct}%</b></span>
        <span className="vf-carta__splitbar"><span className="vf-vs__w" style={{ width: `${s.whitePct}%` }} /><span className="vf-vs__b" style={{ width: `${100 - s.whitePct}%` }} /></span>
        <span className="vf-carta__splitlab"><b className="vf-num">{100 - s.whitePct}%</b><TeamChip team="black" size="sm" label="short" /></span>
      </div>
      {s.isKeeper ? (
        <div className="vf-carta__stats">
          <StatTile label="PJ" value={s.pj} />
          <StatTile label="GC/PJ" value={s.pj ? s.gcpj.toFixed(2) : '–'} emphasis title="Goles recibidos por partido" />
          <StatTile label="Vallas" value={s.cleanSheets} title="Partidos sin recibir gol" />
          <StatTile label="Evitados" value={s.pj ? signed(s.goalsPrevented) : '–'} title={PREVENTED_HELP} />
          <StatTile label="% Vic." value={`${s.wp}%`} />
        </div>
      ) : (
        <div className="vf-carta__stats">
          <StatTile label="PJ" value={s.pj} />
          <StatTile label="Goles" value={s.g} emphasis />
          <StatTile label="Asist." value={s.a} />
          <StatTile label="G/PJ" value={s.gpj.toFixed(2)} />
          <StatTile label="% Vic." value={`${s.wp}%`} />
        </div>
      )}
      {s.streak ? <Streak kind={s.streak.kind} n={s.streak.n} /> : null}
    </article>
  );
};

export const AchievementBadge: React.FC<{ name: string; desc?: string; glyph: string; unlocked?: boolean; count?: number; progress?: number; shame?: boolean; soon?: boolean }> = ({ name, desc, glyph, unlocked = true, count, progress, shame, soon }) => {
  const g = glyph === 'fire' || glyph === 'star' || glyph === 'shield'
    ? <Icon name={glyph as IconName} size={22} />
    : glyph === 'own' ? <EventIcon type="own-goal" size={22} /> : <span className="vf-num">{glyph}</span>;
  return (
    <div className={cx('vf-ach', !unlocked && 'is-locked', shame && 'is-shame')}>
      <span className="vf-ach__medal" aria-hidden="true">{g}{count != null && count > 1 ? <span className="vf-ach__count vf-num">×{count}</span> : null}</span>
      <span className="vf-ach__name">{name}</span>
      <span className="vf-ach__desc">{desc}</span>
      {soon ? <Pronto /> : null}
      {!soon && !unlocked && progress != null ? (
        <span className="vf-ach__prog" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={`Progreso ${name}`}><span style={{ width: `${progress * 100}%` }} /></span>
      ) : null}
      {!soon && !unlocked && progress == null ? <span className="vf-ach__lock"><Icon name="lock" size={12} /> Bloqueada</span> : null}
    </div>
  );
};

export const InsightRow: React.FC<{ kind: 'fire' | 'drought' | 'duo' | 'shame'; title: string; text: string; value?: React.ReactNode }> = ({ kind, title, text, value }) => {
  const icon = ({ fire: 'fire', drought: 'drought', duo: 'link', shame: 'own' } as const)[kind];
  return (
    <li className={cx('vf-insight', `is-${kind}`)}>
      <span className="vf-insight__icon" aria-hidden="true">{icon === 'own' ? <EventIcon type="own-goal" size={20} /> : <Icon name={icon} size={20} />}</span>
      <span className="vf-insight__body"><span className="vf-insight__title">{title}</span><span className="vf-insight__text">{text}</span></span>
      {value != null ? <span className="vf-insight__val vf-num">{value}</span> : null}
    </li>
  );
};

export const LeaderCard: React.FC<{ title: string; stats: PlayerStats; value: React.ReactNode; unit?: string; onClick?: () => void }> = ({ title, stats, value, unit, onClick }) => (
  <button type="button" className="vf-leader" onClick={onClick}>
    <span className="vf-overline">{title}</span>
    <span className="vf-leader__val"><span className="vf-num">{value}</span><small>{unit}</small></span>
    <span className="vf-leader__who"><Avatar name={stats.info.name} initials={stats.info.initials} team={stats.team} size="sm" /><span>{stats.info.short}</span></span>
  </button>
);
