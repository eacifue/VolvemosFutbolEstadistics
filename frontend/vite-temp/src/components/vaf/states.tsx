import React from 'react';
import { cx } from '../../lib/cx';
import { Button } from './base';
import { Icon } from './Icon';

export const StateView: React.FC<{ kind: 'empty' | 'error' | 'offline'; title: string; body?: string; action?: string; onAction?: () => void }> = ({ kind, title, body, action, onAction }) => {
  const art = kind === 'empty' ? (
    <svg viewBox="0 0 120 80" width="120" height="80" aria-hidden="true" className="vf-state__art"><rect x="4" y="4" width="112" height="72" /><line x1="60" y1="4" x2="60" y2="76" /><circle cx="60" cy="40" r="12" /><rect x="4" y="22" width="16" height="36" /><rect x="100" y="22" width="16" height="36" /></svg>
  ) : <span className="vf-state__icon"><Icon name={kind === 'offline' ? 'offline' : 'whistle'} size={32} /></span>;
  return (
    <div className={cx('vf-state', `is-${kind}`)} role={kind === 'error' ? 'alert' : undefined}>
      {art}
      <h3 className="vf-state__title">{title}</h3>
      {body ? <p className="vf-state__body">{body}</p> : null}
      {action ? <Button variant={kind === 'empty' ? 'primary' : 'secondary'} icon={kind === 'empty' ? 'plus' : 'undo'} onClick={onAction}>{action}</Button> : null}
    </div>
  );
};

export const Skeleton: React.FC<{ shape?: 'hero' | 'match' | 'card' | 'row'; count?: number }> = ({ shape = 'row', count = 1 }) => {
  const one = (k: number) => {
    if (shape === 'hero') return <div key={k} className="vf-skel vf-skel--hero"><span className="b w40 h12" /><div className="vf-skel__row"><span className="b sq" /><span className="b w30 h64" /><span className="b sq" /></div><span className="b w50 h14" /></div>;
    if (shape === 'match') return <div key={k} className="vf-skel vf-skel--match"><span className="b w30 h12" /><div className="vf-skel__row"><span className="b w20 h16" /><span className="b w20 h28" /><span className="b w20 h16" /></div></div>;
    if (shape === 'card') return <div key={k} className="vf-skel vf-skel--card"><span className="b circ" /><span className="b w60 h16" /><span className="b w40 h12" /></div>;
    return <div key={k} className="vf-skel vf-skel--row"><span className="b w8 h16" /><span className="b circ-sm" /><span className="b w50 h14" /><span className="b w10 h20 ml" /></div>;
  };
  return <div className="vf-skel-group" aria-busy="true" aria-label="Cargando">{Array.from({ length: count }, (_, i) => one(i))}</div>;
};

export const OfflineBar: React.FC<{ savedAt: Date | null }> = ({ savedAt }) => (
  <div className="vf-offbar" role="status">
    <Icon name="offline" size={16} />
    Sin conexión · mostrando datos {savedAt ? `del ${savedAt.toLocaleDateString('es-CO', { weekday: 'long' })} ${savedAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}` : 'guardados'}
  </div>
);
