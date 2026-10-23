import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../data/context';
import { Shell } from '../../components/Shell';
import {
  BottomSheet, Button, Icon, IconButton, LiveDot, LivePlayerButton, Pronto, QuickEventPad, Scoreboard, Snackbar, StateView, SyncStatus, TeamChip, TopBar,
} from '../../components/vaf';
import { createMatchEvent } from '../../services/api';
import { emitStatsRefresh } from '../../services/refreshBus';
import { buildMatchView, EV_ID, EV_LABEL, TEAM_ID, type EvType, type Side } from '../../lib/stats';
import type { MatchEvent } from '../../types';
import { useToast } from '../../lib/toast';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';

// Cada toque queda en una cola local: 5 s para Deshacer y luego se envía en orden (gol antes que su asistencia,
// así la asistencia queda ligada al gol). Sin señal, la cola espera y se envía al volver.
interface Op { tempId: number; playerId: number; type: EvType; team: Side; at: number; group: number }
const UNDO_MS = 5000;
const qKey = (matchId: number) => `vf_live_queue_${matchId}`;
const readQ = (matchId: number): Op[] => {
  try {
    return JSON.parse(localStorage.getItem(qKey(matchId)) ?? '[]') as Op[];
  } catch {
    return [];
  }
};
const writeQ = (matchId: number, q: Op[]) => {
  try {
    localStorage.setItem(qKey(matchId), JSON.stringify(q));
  } catch {
    // sin almacenamiento: la cola vive solo en memoria
  }
};

const isNetwork = (err: unknown) => {
  const e = err as { code?: string; message?: string; response?: unknown };
  return !e?.response && (e?.code === 'ERR_NETWORK' || e?.message === 'Network Error' || !navigator.onLine);
};

const fmtClock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export const EnCancha: React.FC = () => {
  const { id } = useParams();
  const matchId = Number(id);
  const data = useAppData();
  const navigate = useNavigate();
  const toast = useToast();
  const base = data.views.find((v) => v.id === matchId);
  const { shortOf } = data;

  const [queue, setQueue] = useState<Op[]>(() => readQ(matchId));
  const [sending, setSending] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [failed, setFailed] = useState(false);
  const [sheet, setSheet] = useState<{ playerId: number; step: 'event' | 'assist'; group?: number } | null>(null);
  const [snack, setSnack] = useState<{ group: number; message: string; until: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [clock, setClock] = useState<{ running: boolean; base: number; since: number }>({ running: false, base: 0, since: 0 });
  const flushing = useRef(false);

  useEffect(() => writeQ(matchId, queue), [matchId, queue]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      clearInterval(t);
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const flush = useCallback(async (force = false) => {
    if (flushing.current) return;
    const ready = readQ(matchId).filter((op) => force || Date.now() - op.at >= UNDO_MS).sort((a, b) => a.tempId - b.tempId);
    if (!ready.length) return;
    flushing.current = true;
    setSending(true);
    let sent = 0;
    try {
      for (const op of ready) {
        try {
          await createMatchEvent({ matchId, playerId: op.playerId, eventTypeId: EV_ID[op.type], teamId: TEAM_ID[op.team] });
          sent++;
          setQueue((q) => q.filter((x) => x.tempId !== op.tempId));
          writeQ(matchId, readQ(matchId).filter((x) => x.tempId !== op.tempId));
          setFailed(false);
          setOffline(false);
        } catch (err) {
          if (isNetwork(err)) {
            setOffline(true);
            break;
          }
          console.error(err);
          setFailed(true);
          setQueue((q) => q.filter((x) => x.tempId !== op.tempId));
          writeQ(matchId, readQ(matchId).filter((x) => x.tempId !== op.tempId));
          toast({ tone: 'error', message: `No se guardó: ${EV_LABEL[op.type].toLowerCase()} de ${shortOf(op.playerId)}`, detail: getFriendlyErrorMessage(err, 'Vuelve a cargarlo.') });
        }
      }
    } finally {
      flushing.current = false;
      setSending(false);
      if (sent) emitStatsRefresh();
    }
  }, [matchId, toast, shortOf]);

  // Envía lo que ya pasó la ventana de Deshacer.
  useEffect(() => {
    if (queue.some((op) => now - op.at >= UNDO_MS) && !offline) void flush();
  }, [now, queue, offline, flush]);

  // Al salir de la pantalla se envía todo lo pendiente.
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);
  useEffect(() => () => void flushRef.current(true), []);

  const view = useMemo(() => {
    if (!base) return null;
    const fake: MatchEvent[] = queue.map((op) => ({
      id: -op.tempId, matchId, playerId: op.playerId, eventTypeId: EV_ID[op.type], teamId: TEAM_ID[op.team], createdAt: new Date(op.at).toISOString(),
    } as MatchEvent));
    return buildMatchView({ ...base.raw, events: [...(base.raw.events ?? []), ...fake] });
  }, [base, queue, matchId]);

  if (!base || !view) {
    return (
      <Shell header={false} nav={false}>
        <div className="vf-page"><TopBar title="En cancha" /><main className="vf-main"><StateView kind="error" title="No encontramos el partido" action="Volver" onAction={() => navigate('/admin?tab=partidos')} /></main></div>
      </Shell>
    );
  }

  const elapsed = clock.base + (clock.running ? Math.floor((now - clock.since) / 1000) : 0);
  const minute = clock.running || clock.base ? Math.floor(elapsed / 60) + 1 : undefined;
  const label = (pid: number) => data.info(pid)?.initials ?? '?';

  const push = (ops: Omit<Op, 'tempId' | 'at' | 'group'>[], message: string) => {
    const at = Date.now();
    const group = at;
    setQueue((q) => [...q, ...ops.map((o, i) => ({ ...o, tempId: at + i, at, group }))]);
    setSnack({ group, message, until: at + UNDO_MS });
    setSheet(null);
  };

  const onPick = (type: EvType) => {
    if (!sheet) return;
    const team = view.sideOf.get(sheet.playerId) ?? 'white';
    const mates = view.lineup[team].filter((x) => x !== sheet.playerId);
    if (type === 'goal' && mates.length) {
      setSheet({ ...sheet, step: 'assist' });
      return;
    }
    const credited = type === 'own-goal' ? (team === 'white' ? 'black' : 'white') : team;
    const scores = type === 'goal' || type === 'own-goal';
    const s = view.white + (scores && credited === 'white' ? 1 : 0);
    const b = view.black + (scores && credited === 'black' ? 1 : 0);
    const scoreText = scores ? ` · ${s}–${b}` : '';
    push([{ playerId: sheet.playerId, type, team }], `${EV_LABEL[type]} de ${data.shortOf(sheet.playerId)}${scoreText}`);
  };

  const onAssist = (assistId: number | null) => {
    if (!sheet) return;
    const team = view.sideOf.get(sheet.playerId) ?? 'white';
    const s = view.white + (team === 'white' ? 1 : 0);
    const b = view.black + (team === 'black' ? 1 : 0);
    const ops: Omit<Op, 'tempId' | 'at' | 'group'>[] = [{ playerId: sheet.playerId, type: 'goal', team }];
    if (assistId != null) ops.push({ playerId: assistId, type: 'assist', team });
    push(ops, `Gol de ${data.shortOf(sheet.playerId)}${assistId != null ? ` · asist. ${data.shortOf(assistId)}` : ''} · ${s}–${b}`);
  };

  const undo = () => {
    if (!snack) return;
    setQueue((q) => q.filter((op) => op.group !== snack.group));
    setSnack(null);
    toast({ tone: 'info', message: 'Deshecho', detail: 'Ese evento no se guardó.' });
  };

  const sync: 'saving' | 'saved' | 'offline' | 'error' = offline && queue.length ? 'offline' : sending || queue.length ? 'saving' : failed ? 'error' : 'saved';
  const sheetPlayer = sheet ? data.info(sheet.playerId) : undefined;
  const sheetTeam: Side = sheet ? view.sideOf.get(sheet.playerId) ?? 'white' : 'white';
  const snackLeft = snack ? Math.max(0, snack.until - now) : 0;

  const col = (side: Side) => (
    <div className="vf-livecol">
      <TeamChip team={side} />
      {view.lineup[side].map((pid) => {
        const c = view.counts.get(pid);
        return <LivePlayerButton key={pid} name={data.info(pid)?.label ?? data.shortOf(pid)} label={label(pid)} team={side} goals={c?.goals} assists={c?.assists} ownGoals={c?.ownGoals} pressed={sheet?.playerId === pid} onClick={() => setSheet({ playerId: pid, step: 'event' })} />;
      })}
    </div>
  );

  return (
    <Shell header={false} nav={false}>
      <div className="vf-page vf-page--live">
        <div className="vf-livetop">
          <div className="vf-livetop__bar">
            <IconButton icon="close" label="Salir del modo En cancha" onClick={() => navigate(`/admin/partidos/${matchId}`)} />
            <LiveDot minute={minute} />
            <SyncStatus state={sync} pending={queue.length} />
          </div>
          <Scoreboard size="lg" white={view.white} black={view.black} result={false} />
          <div className="vf-livetop__clock">
            <Icon name="timer" size={16} />
            <span className="vf-num">{fmtClock(elapsed)}</span>
            <Button variant="ghost" size="sm" onClick={() => setClock((c) => (c.running ? { running: false, base: elapsed, since: 0 } : { running: true, base: c.base, since: Date.now() }))}>
              {clock.running ? 'Pausar' : elapsed ? 'Seguir' : 'Iniciar'}
            </Button>
            <Pronto title="El cronómetro funciona, pero el minuto de cada evento aún no se guarda en el servidor" />
          </div>
        </div>
        {view.sideOf.size ? (
          <main className="vf-livegrid">{col('white')}{col('black')}</main>
        ) : (
          <main className="vf-main"><StateView kind="empty" title="Sin jugadores en cancha" body="Primero reparte la gente entre Blanco y Negro." action="Armar equipos" onAction={() => navigate(`/admin/armar/${matchId}`)} /></main>
        )}
        {snack && snackLeft > 0 ? (
          <div className="vf-snackslot"><Snackbar message={snack.message} progress={snackLeft / UNDO_MS} seconds={Math.ceil(snackLeft / 1000)} onAction={undo} /></div>
        ) : null}
      </div>

      {sheet && sheetPlayer ? (
        <BottomSheet title={sheet.step === 'assist' ? 'Asistencia' : 'Registrar evento'} onClose={() => setSheet(null)}>
          {sheet.step === 'assist' ? (
            <QuickEventPad step="assist" player={sheetPlayer.short} team={sheetTeam} onAssist={onAssist}
              mates={view.lineup[sheetTeam].filter((x) => x !== sheet.playerId).map((x) => ({ id: x, short: data.info(x)?.label ?? data.shortOf(x), label: label(x) }))} />
          ) : (
            <QuickEventPad player={sheetPlayer.name} team={sheetTeam} onPick={onPick} />
          )}
        </BottomSheet>
      ) : null}
    </Shell>
  );
};
