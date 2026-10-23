import React from 'react';
import { cx } from '../../lib/cx';
import type { EvType, Side } from '../../lib/stats';
import { Button, IconButton, Pronto, TeamChip } from './base';
import { EventCounts, EventIcon } from './events';
import { Icon } from './Icon';

export const LivePlayerButton: React.FC<{ name: string; label: string; team: Side; goals?: number; assists?: number; ownGoals?: number; pressed?: boolean; onClick?: () => void }> = ({ name, label, team, goals = 0, assists = 0, ownGoals = 0, onClick, pressed }) => (
  <button type="button" className={cx('vf-lpb', `vf-lpb--${team}`, pressed && 'is-pressed')} onClick={onClick} aria-label={`Registrar evento de ${name}`}>
    <span className={cx('vf-lpb__shirt', `vf-swatch--${team}`)}><span className="vf-num">{label}</span></span>
    <span className="vf-lpb__name">{name}</span>
    <EventCounts goals={goals} assists={assists} ownGoals={ownGoals} compact />
  </button>
);

export interface Mate { id: number; short: string; label: string }

// Amarilla y roja: el backend aún no tiene esos tipos de evento → Pronto.
export const QuickEventPad: React.FC<{ player: string; team: Side; step?: 'event' | 'assist'; mates?: Mate[]; onPick?: (type: EvType) => void; onAssist?: (id: number | null) => void; busy?: boolean }> = ({ player, team, step = 'event', mates = [], onPick, onAssist, busy }) => {
  if (step === 'assist') {
    return (
      <div className="vf-qep">
        <div className="vf-qep__head"><EventIcon type="goal" size={20} /><span><b>Gol de {player}</b> · ¿Quién asistió?</span></div>
        <div className="vf-qep__mates">
          {mates.map((m) => (
            <button key={m.id} type="button" className="vf-qep__mate" onClick={() => onAssist?.(m.id)} disabled={busy}>
              <span className={cx('vf-lpb__shirt', `vf-swatch--${team}`)}><span className="vf-num">{m.label}</span></span>
              <span>{m.short}</span>
            </button>
          ))}
        </div>
        <Button variant="secondary" size="lg" block onClick={() => onAssist?.(null)} disabled={busy} data-autofocus>Sin asistencia</Button>
      </div>
    );
  }
  const btns: [EvType, string, boolean][] = [['goal', 'Gol', false], ['assist', 'Asistencia', false], ['own-goal', 'Autogol', false], ['yellow', 'Amarilla', true], ['red', 'Roja', true]];
  return (
    <div className="vf-qep">
      <div className="vf-qep__head"><TeamChip team={team} size="sm" /><span><b>{player}</b></span></div>
      <div className="vf-qep__grid">
        {btns.map(([t, l, soon]) => (
          <button key={t} type="button" className={cx('vf-qep__btn', `is-${t}`)} onClick={() => onPick?.(t)} disabled={soon || busy} data-autofocus={t === 'goal' ? true : undefined}>
            <EventIcon type={t} size={30} /><span>{l}</span>
            {soon ? <Pronto title="Las tarjetas llegan cuando el servidor tenga esos tipos de evento" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export const SyncStatus: React.FC<{ state: 'saving' | 'saved' | 'offline' | 'error'; pending?: number }> = ({ state, pending }) => {
  const text = {
    saving: 'Guardando…',
    saved: 'Guardado',
    offline: `Sin conexión · ${pending ? `${pending} por enviar` : 'se enviará al volver'}`,
    error: 'No se guardó · reintenta',
  }[state];
  return (
    <span className={cx('vf-sync', `is-${state === 'error' ? 'offline' : state}`)} role="status">
      {state === 'saving' ? <span className="vf-spinner vf-spinner--sm" aria-hidden="true" /> : <Icon name={state === 'saved' ? 'check' : state === 'error' ? 'close' : 'offline'} size={14} />}
      {text}
    </span>
  );
};

export const Snackbar: React.FC<{ message: string; action?: string; seconds?: number; progress?: number; onAction?: () => void }> = ({ message, action = 'Deshacer', seconds = 5, progress = 1, onAction }) => (
  <div className="vf-snack" role="status">
    <span className="vf-snack__msg">{message}</span>
    {action ? <button type="button" className="vf-snack__act" onClick={onAction}><Icon name="undo" size={16} />{action}</button> : null}
    <span className="vf-snack__timer" aria-hidden="true"><span style={{ width: `${progress * 100}%` }} /></span>
    <span className="vf-sr">{seconds} segundos para deshacer</span>
  </div>
);

export interface BalancePlayer { id: number; short: string; posShort: string; rating: number }
export const TeamBalance: React.FC<{ white: BalancePlayer[]; black: BalancePlayer[]; ratingW: number; ratingB: number; onMove?: (id: number, to: Side) => void }> = ({ white, black, ratingW, ratingB, onMove }) => {
  const diff = Math.abs(ratingW - ratingB);
  const col = (list: BalancePlayer[], team: Side, r: number) => (
    <div className={cx('vf-bal__col', `is-${team}`)}>
      <div className="vf-bal__head"><TeamChip team={team} /><span className="vf-bal__r"><span className="vf-num">{r.toFixed(1)}</span> <small>rating</small></span></div>
      <ul>
        {list.map((p) => (
          <li key={p.id}>
            <span className="vf-bal__pos">{p.posShort}</span>
            <span className="vf-bal__name">{p.short}</span>
            <span className="vf-num vf-bal__pr">{p.rating.toFixed(1)}</span>
            <IconButton icon={team === 'white' ? 'chevron' : 'back'} label={`Pasar a ${team === 'white' ? 'Negro' : 'Blanco'} a ${p.short}`} size="sm" onClick={() => onMove?.(p.id, team === 'white' ? 'black' : 'white')} />
          </li>
        ))}
        {!list.length ? <li><span className="vf-small vf-dim">Sin jugadores</span></li> : null}
      </ul>
    </div>
  );
  return (
    <div className="vf-bal">
      <div className="vf-bal__meter">
        <Icon name="scale" size={18} />
        <span>Diferencia de rating <b className="vf-num">{diff.toFixed(1)}</b></span>
        <span className={cx('vf-badge', diff <= 0.5 ? 'vf-badge--accent' : 'vf-badge--muted')}>{diff <= 0.5 ? 'Parejo' : 'Desbalanceado'}</span>
      </div>
      <div className="vf-bal__cols">{col(white, 'white', ratingW)}{col(black, 'black', ratingB)}</div>
    </div>
  );
};
