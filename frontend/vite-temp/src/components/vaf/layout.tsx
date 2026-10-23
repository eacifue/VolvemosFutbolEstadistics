import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { useTheme } from '../../lib/theme';
import type { TeamRecord } from '../../lib/stats';
import { Crest, IconButton } from './base';
import { Icon, type IconName } from './Icon';

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/partidos', label: 'Partidos', icon: 'matches' },
  { to: '/ranking', label: 'Ranking', icon: 'ranking' },
  { to: '/jugadores', label: 'Jugadores', icon: 'players' },
  { to: '/admin', label: 'Admin', icon: 'admin' },
];

const ThemeToggle: React.FC = () => {
  const [theme, toggle] = useTheme();
  return <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} onClick={toggle} />;
};

export const AppHeader: React.FC<{ record?: TeamRecord | null; admin: boolean; title?: string; subtitle?: string }> = ({ record, title = 'Volvemos al Fútbol', subtitle = 'Blanco y Negro', admin }) => {
  const navigate = useNavigate();
  return (
    <header className="vf-header">
      <Crest size={30} />
      <div className="vf-header__titles">
        <span className="vf-header__title">{title}</span>
        <span className="vf-header__sub">{subtitle}</span>
      </div>
      {record && record.played ? (
        <div className="vf-header__record" aria-label={`Historial: Blanco ${record.white} victorias, ${record.draws} empates, Negro ${record.black} victorias`}>
          <span className="vf-swatch vf-swatch--white vf-swatch--xs" aria-hidden="true" /><b className="vf-num">{record.white}</b>
          <span className="vf-header__draws vf-num">{record.draws}</span>
          <b className="vf-num">{record.black}</b><span className="vf-swatch vf-swatch--black vf-swatch--xs" aria-hidden="true" />
        </div>
      ) : null}
      <span className="vf-header__actions">
        <ThemeToggle />
        {!admin ? <IconButton icon="lock" label="Entrar como admin" onClick={() => navigate('/admin')} /> : null}
      </span>
    </header>
  );
};

export const BottomNav: React.FC<{ admin: boolean }> = ({ admin }) => (
  <nav className="vf-nav" aria-label="Principal">
    {(admin ? NAV : NAV.slice(0, 4)).map((it) => (
      <NavLink key={it.to} to={it.to} end={it.to === '/'} className={({ isActive }) => cx('vf-nav__item', isActive && 'is-active')}>
        {({ isActive }) => (
          <>
            <span className="vf-nav__icon"><Icon name={it.icon} size={22} fill={isActive} /></span>
            <span className="vf-nav__label">{it.label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export const DesktopSide: React.FC<{ admin: boolean }> = ({ admin }) => (
  <aside className="vf-desk__side">
    <div className="vf-desk__brand"><Crest size={32} /><span>Volvemos al Fútbol<small>{admin ? 'Admin' : 'Blanco y Negro'}</small></span></div>
    <nav className="vf-desk__nav" aria-label="Principal">
      {NAV.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.to === '/'} className={({ isActive }) => cx(isActive && 'is-active')}>
          {({ isActive }) => <><Icon name={it.to === '/admin' && !admin ? 'lock' : it.icon} size={20} fill={isActive} />{it.label}</>}
        </NavLink>
      ))}
    </nav>
    <div className="vf-desk__foot"><ThemeToggle /></div>
  </aside>
);

export const TopBar: React.FC<{ title: string; onBack?: () => void; backLabel?: string; backIcon?: IconName; right?: React.ReactNode }> = ({ title, onBack, backLabel = 'Volver', backIcon = 'back', right }) => {
  const navigate = useNavigate();
  return (
    <div className="vf-topbar">
      <IconButton icon={backIcon} label={backLabel} onClick={onBack ?? (() => navigate(-1))} />
      <span className="vf-topbar__title">{title}</span>
      {right ?? <span />}
    </div>
  );
};
