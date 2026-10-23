import React from 'react';
import { cx } from '../../lib/cx';
import type { Side } from '../../lib/stats';
import { Avatar, Crest } from './base';
import { Icon } from './Icon';
import { Scoreboard } from './score';

export const PaymentRow: React.FC<{ name: string; team?: Side | null; amount: string; status?: 'pago' | 'debe'; method?: string; onToggle?: () => void }> = ({ name, team, amount, status = 'debe', method, onToggle }) => {
  const paid = status === 'pago';
  return (
    <li className={cx('vf-pay', paid && 'is-paid')}>
      <Avatar name={name} team={team} size="sm" />
      <span className="vf-pay__who"><span className="vf-pay__name">{name}</span>{method ? <span className="vf-pay__sub">{method}</span> : null}</span>
      <span className="vf-pay__amt vf-num">{amount}</span>
      <button type="button" className={cx('vf-badge', paid ? 'vf-badge--accent' : 'vf-badge--muted', 'vf-paybtn')} onClick={onToggle} aria-pressed={paid} aria-label={`${name}: ${paid ? 'pagó, marcar como debe' : 'debe, marcar como pagó'}`}>
        {paid ? <><Icon name="check" size={12} />Pagó</> : 'Debe'}
      </button>
    </li>
  );
};

export const PushNotification: React.FC<{ title: string; body: string; time?: string; score?: [number, number] }> = ({ title, body, time = 'ahora', score }) => (
  <div className="vf-push" role="note">
    <span className="vf-push__icon"><Crest size={22} /></span>
    <div className="vf-push__body">
      <div className="vf-push__head"><span className="vf-push__app">VOLVEMOS AL FÚTBOL</span><span className="vf-push__time">{time}</span></div>
      <div className="vf-push__title">{title}{score ? <span className="vf-push__score"><Scoreboard size="mini" white={score[0]} black={score[1]} /></span> : null}</div>
      <div className="vf-push__text">{body}</div>
    </div>
  </div>
);
