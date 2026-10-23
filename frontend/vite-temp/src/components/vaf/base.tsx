import React, { useId, useState } from 'react';
import { cx, TEAM_LABEL, TEAM_SHORT } from '../../lib/cx';
import type { Side } from '../../lib/stats';
import { Icon, type IconName } from './Icon';
import { EventCounts, type EventCountsProps } from './events';

/* ---------- Escudo (assets/logos/escudo.svg) ---------- */
export const Crest: React.FC<{ size?: number; title?: string }> = ({ size = 36, title = 'Volvemos al Fútbol' }) => (
  <img className="vf-crest" src="/escudo.svg" width={size} height={Math.round(size * 1.15)} alt={title} />
);

/* ---------- Equipo ---------- */
export const TeamChip: React.FC<{ team: Side; label?: 'full' | 'short' | 'none'; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ team, label = 'full', size = 'md', className }) => (
  <span className={cx('vf-teamchip', `vf-teamchip--${size}`, className)}>
    <span className={cx('vf-swatch', `vf-swatch--${team}`)} aria-hidden="true" />
    {label === 'none' ? <span className="vf-sr">{TEAM_LABEL[team]}</span> : <span className="vf-teamchip__label">{label === 'short' ? TEAM_SHORT[team] : TEAM_LABEL[team]}</span>}
  </span>
);

const JERSEY = 'M16 4L7 8 2 16.5 8 22l4-3V44h24V19l4 3 6-5.5L41 8l-9-4c-1.6 3.4-4.6 5.2-8 5.2S17.6 7.4 16 4z';
export interface JerseyProps { team: Side; number?: number; initials?: string; size?: number; name?: string | null; events?: EventCountsProps; mvp?: boolean; selected?: boolean; draggable?: boolean; onClick?: () => void; onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement> }
export const Jersey: React.FC<JerseyProps> = ({ team, number, initials, size = 48, name, events, mvp, selected, onClick, onKeyDown, draggable }) => {
  const id = useId().replace(/:/g, '');
  const ink = team === 'white' ? 'var(--team-white-ink)' : 'var(--team-black-ink)';
  const label = number != null ? String(number) : initials ?? '';
  const body = (
    <>
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="vf-jersey__svg">
        {team === 'black' ? (
          <defs>
            <pattern id={`j${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" style={{ fill: 'var(--team-black)' }} />
              <rect x="4" width="2" height="6" style={{ fill: 'var(--team-black-stripe)' }} />
            </pattern>
          </defs>
        ) : null}
        <path d={JERSEY} style={{ fill: team === 'black' ? `url(#j${id})` : 'var(--team-white)', stroke: team === 'black' ? 'var(--team-black-edge)' : 'var(--team-white-edge)' }} strokeWidth="1.5" strokeLinejoin="round" />
        <text x="24" y="33" textAnchor="middle" className="vf-jersey__num" style={{ fill: ink, fontSize: label.length > 2 ? 13 : undefined }}>{label}</text>
      </svg>
      {name ? <span className="vf-jersey__name">{name}</span> : null}
      {events ? <span className="vf-jersey__events"><EventCounts {...events} compact /></span> : null}
      {mvp ? <span className="vf-jersey__mvp">MVP</span> : null}
    </>
  );
  const cls = cx('vf-jersey', selected && 'is-selected', draggable && 'is-draggable');
  return onClick ? (
    <button type="button" className={cls} onClick={onClick} onKeyDown={onKeyDown} aria-pressed={selected || undefined} aria-label={`${name ?? ''} · ${TEAM_LABEL[team]}`}>{body}</button>
  ) : (
    <span className={cls}>{body}</span>
  );
};

export const Avatar: React.FC<{ name: string; initials?: string; team?: Side | null; size?: 'sm' | 'md' | 'lg'; badge?: 'mvp' | 'leader'; src?: string }> = ({ name, initials, team, size = 'md', badge, src }) => {
  const ini = initials || name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span className={cx('vf-avatar', `vf-avatar--${size}`, team && `vf-avatar--${team}`, badge === 'leader' && 'is-leader')} title={name}>
      {src ? <img src={src} alt="" /> : <span className="vf-avatar__ini" aria-hidden="true">{ini}</span>}
      <span className="vf-sr">{name}</span>
      {badge === 'mvp' ? <span className="vf-avatar__badge">MVP</span> : null}
      {badge === 'leader' ? <span className="vf-avatar__badge vf-avatar__badge--leader">1</span> : null}
    </span>
  );
};

/* ---------- Básicos ---------- */
type ButtonBase = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;
export interface ButtonProps extends ButtonBase { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; icon?: IconName; iconRight?: IconName; loading?: boolean | string; block?: boolean; children?: React.ReactNode }
export const Button: React.FC<ButtonProps> = ({ variant = 'secondary', size = 'md', icon, iconRight, loading, disabled, block, children, className, type = 'button', ...rest }) => (
  <button type={type} {...rest} disabled={disabled || !!loading} aria-busy={loading ? true : undefined}
    className={cx('vf-btn', `vf-btn--${variant}`, `vf-btn--${size}`, block && 'vf-btn--block', loading && 'is-loading', className)}>
    {loading ? <span className="vf-spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size={size === 'lg' ? 22 : 18} /> : null}
    {children ? <span>{loading && typeof loading === 'string' ? loading : children}</span> : null}
    {iconRight && !loading ? <Icon name={iconRight} size={18} /> : null}
  </button>
);

export const IconButton: React.FC<ButtonBase & { icon: IconName; label: string; variant?: 'ghost' | 'secondary' | 'danger'; size?: 'sm' | 'md' | 'lg' }> = ({ icon, label, variant = 'ghost', size = 'md', className, ...rest }) => (
  <button type="button" {...rest} aria-label={label} title={label} className={cx('vf-iconbtn', `vf-iconbtn--${variant}`, `vf-iconbtn--${size}`, className)}>
    <Icon name={icon} size={size === 'lg' ? 24 : 20} />
  </button>
);

export interface TabItem { id: string; label: string; count?: number; soon?: boolean }
export const Tabs: React.FC<{ items: TabItem[]; active?: string; onChange?: (id: string) => void; variant?: 'underline' | 'segmented'; label?: string }> = ({ items, active, onChange, variant = 'underline', label = 'Secciones' }) => {
  const [cur, setCur] = useState(active ?? items[0]?.id);
  const sel = active ?? cur;
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = items.findIndex((it) => it.id === sel);
    const next = items[(i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
    setCur(next.id);
    onChange?.(next.id);
    (e.currentTarget.querySelectorAll('button')[items.indexOf(next)] as HTMLButtonElement | undefined)?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={cx('vf-tabs', `vf-tabs--${variant}`)} onKeyDown={onKey}>
      {items.map((it) => (
        <button key={it.id} role="tab" type="button" tabIndex={sel === it.id ? 0 : -1} aria-selected={sel === it.id} className={cx('vf-tab', sel === it.id && 'is-active')}
          onClick={() => { setCur(it.id); onChange?.(it.id); }}>
          {it.label}{it.count != null ? <span className="vf-tab__count">{it.count}</span> : null}
        </button>
      ))}
    </div>
  );
};

export const FilterChip: React.FC<{ selected?: boolean; children: React.ReactNode; count?: number; icon?: IconName; onClick?: () => void; disabled?: boolean; soon?: boolean }> = ({ selected, children, count, onClick, icon, disabled, soon }) => (
  <button type="button" aria-pressed={!!selected} onClick={onClick} disabled={disabled || soon} className={cx('vf-chip', selected && 'is-selected')}>
    {selected ? <Icon name="check" size={16} /> : icon ? <Icon name={icon} size={16} /> : null}
    <span>{children}</span>
    {count != null ? <span className="vf-chip__count">{count}</span> : null}
    {soon ? <Pronto /> : null}
  </button>
);

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> { label?: string; hint?: string; error?: string; icon?: IconName; soon?: boolean }
export const TextField: React.FC<TextFieldProps> = ({ label, hint, error, icon, required, soon, disabled, id: idProp, ...input }) => {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className={cx('vf-field', error && 'has-error', (disabled || soon) && 'is-disabled')}>
      {label ? (
        <span className="vf-field__labelrow">
          <label htmlFor={id} className="vf-field__label">{label}{required ? <span aria-hidden="true"> *</span> : null}</label>
          {soon ? <Pronto /> : null}
        </span>
      ) : null}
      <div className="vf-field__box">
        {icon ? <Icon name={icon} size={18} /> : null}
        <input id={id} required={required} disabled={disabled || soon} aria-invalid={!!error} aria-describedby={hint || error ? `${id}h` : undefined} {...input} />
      </div>
      {error ? <p id={`${id}h`} className="vf-field__error"><Icon name="close" size={14} /> {error}</p> : hint ? <p id={`${id}h`} className="vf-field__hint">{hint}</p> : null}
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; overline?: string; action?: string; onAction?: () => void; right?: React.ReactNode; as?: 'h1' | 'h2' }> = ({ title, action, onAction, overline, right, as = 'h2' }) => {
  const H = as;
  return (
    <div className="vf-sechead">
      <div>{overline ? <span className="vf-overline">{overline}</span> : null}<H className="vf-sechead__title">{title}</H></div>
      {right}
      {action ? (
        <button type="button" className="vf-link vf-link--btn" onClick={onAction}>
          {action}<Icon name="chevron" size={14} />
        </button>
      ) : null}
    </div>
  );
};

/* ---------- Pronto: la interfaz existe, el backend todavía no ---------- */
export const Pronto: React.FC<{ title?: string }> = ({ title = 'Disponible pronto: falta el soporte en el servidor' }) => (
  <span className="vf-badge vf-soon" title={title}>Pronto</span>
);

export const ProntoBox: React.FC<{ title: string; overline?: string; text?: string; children?: React.ReactNode; dim?: boolean }> = ({ title, overline, text, children, dim = true }) => (
  <section className="vf-soonbox" aria-disabled={dim || undefined}>
    <div className="vf-soonbox__head">
      <div>{overline ? <span className="vf-overline">{overline}</span> : null}<h2 className="vf-sechead__title">{title}</h2></div>
      <Pronto />
    </div>
    {text ? <p className="vf-small vf-dim">{text}</p> : null}
    {children ? <div className="vf-soonbox__body">{children}</div> : null}
  </section>
);
