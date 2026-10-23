import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../data/context';
import { Shell } from '../../components/Shell';
import { Button, ConfirmDialog, EventIcon, IconButton, Pitch, Pronto, Scoreboard, SectionHeader, StateView, Timeline, TopBar } from '../../components/vaf';
import { MatchList } from '../Partidos';
import { deleteMatch, deleteMatchEvent } from '../../services/api';
import { emitStatsRefresh } from '../../services/refreshBus';
import { shortDate, timeAndVenue } from '../../lib/format';
import { pitchPlayers, timelineOf } from '../../lib/matchHelpers';
import { EV_LABEL, type TimelineRow } from '../../lib/stats';
import { useToast } from '../../lib/toast';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';

export const AdminPartido: React.FC = () => {
  const { id } = useParams();
  const data = useAppData();
  const navigate = useNavigate();
  const toast = useToast();
  const m = data.views.find((v) => v.id === Number(id));
  const [confirmMatch, setConfirmMatch] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TimelineRow | null>(null);
  const [busy, setBusy] = useState(false);

  if (!m) {
    return (
      <Shell header={false}>
        <div className="vf-page"><TopBar title="Partido" onBack={() => navigate('/admin?tab=partidos')} /><main className="vf-main"><StateView kind="error" title="No encontramos el partido" action="Ver partidos" onAction={() => navigate('/admin?tab=partidos')} /></main></div>
      </Shell>
    );
  }

  const removeMatch = async () => {
    setBusy(true);
    try {
      await deleteMatch(m.id);
      toast({ tone: 'success', message: 'Partido borrado', detail: `El partido del ${shortDate(m.date)} ya no cuenta en las estadísticas.` });
      emitStatsRefresh();
      navigate('/admin?tab=partidos', { replace: true });
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', message: 'No se borró el partido', detail: getFriendlyErrorMessage(err, 'Vuelve a intentarlo.') });
    } finally {
      setBusy(false);
      setConfirmMatch(false);
    }
  };

  const removeRow = async () => {
    if (!rowToDelete) return;
    setBusy(true);
    try {
      for (const evId of rowToDelete.eventIds) await deleteMatchEvent(evId);
      toast({ tone: 'success', message: `${EV_LABEL[rowToDelete.type]} borrado`, detail: 'El marcador ya se actualizó.' });
      emitStatsRefresh();
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', message: 'No se borró el evento', detail: getFriendlyErrorMessage(err, 'Vuelve a intentarlo.') });
    } finally {
      setBusy(false);
      setRowToDelete(null);
    }
  };

  const events = (
    <section className="vf-block">
      <SectionHeader title="Eventos" overline={`${m.events.length} registrados`} />
      {m.timeline.length ? (
        <>
          <Timeline events={timelineOf(m, data)} />
          <ul className="vf-lblist vf-card" aria-label="Borrar eventos">
            {m.timeline.map((r, i) => (
              <li key={r.key} className="vf-evrow">
                <span className="vf-num vf-evrow__n">{i + 1}</span>
                <EventIcon type={r.type} size={18} />
                <span className="vf-evrow__who">{data.shortOf(r.playerId)}<small>{EV_LABEL[r.type]}{r.assistId != null ? ` · asist. ${data.shortOf(r.assistId)}` : ''}</small></span>
                <IconButton icon="trash" variant="danger" label={`Borrar ${EV_LABEL[r.type].toLowerCase()} de ${data.shortOf(r.playerId)}`} onClick={() => setRowToDelete(r)} />
              </li>
            ))}
          </ul>
        </>
      ) : <p className="vf-small vf-dim">Sin eventos. Entra al modo En cancha para cargar goles.</p>}
    </section>
  );

  const lineups = (
    <section className="vf-block">
      <SectionHeader title="Alineaciones" overline={m.sideOf.size ? `${m.sideOf.size} jugadores` : 'Sin repartir'} />
      {m.sideOf.size ? <Pitch white={pitchPlayers(m, 'white', data)} black={pitchPlayers(m, 'black', data)} /> : <p className="vf-small vf-dim">Arma los equipos para ver la cancha.</p>}
    </section>
  );

  const actions = (
    <div className="vf-adminactions">
      <Button variant="primary" icon="whistle" onClick={() => navigate(`/admin/partidos/${m.id}/en-cancha`)}>Modo En cancha</Button>
      <Button variant="secondary" icon="scale" onClick={() => navigate(`/admin/armar/${m.id}`)}>Fecha y equipos</Button>
      <Button variant="secondary" icon="edit" onClick={() => navigate(`/admin/partidos/${m.id}/alineacion`)} disabled={!m.sideOf.size}>Editar alineación</Button>
      <Button variant="secondary" icon="money" onClick={() => navigate(`/admin/partidos/${m.id}/cuotas`)}>Cuotas <Pronto /></Button>
    </div>
  );

  const title = `Partido #${m.id} · ${shortDate(m.date)}`;

  return (
    <Shell header={false} nav={false}>
      {/* Móvil */}
      <div className="vf-page vf-only-mobile">
        <TopBar title={title} onBack={() => navigate('/admin?tab=partidos')} backLabel="Volver a gestión" right={<IconButton icon="trash" variant="danger" label="Borrar partido" onClick={() => setConfirmMatch(true)} />} />
        <div className="vf-matchhead"><Scoreboard size="md" white={m.white} black={m.black} date={timeAndVenue(m.date, m.raw.venue)} result={!m.upcoming} /></div>
        <main className="vf-main">{actions}{events}{lineups}</main>
      </div>
      {/* Escritorio: lista + detalle */}
      <div className="vf-admindesk vf-only-desk">
        <section className="vf-desk__list">
          <div className="vf-sechead"><h2 className="vf-sechead__title">Partidos</h2><Button variant="primary" icon="plus" size="sm" onClick={() => navigate('/admin/armar')}>Nuevo</Button></div>
          <MatchList views={data.views} onOpen={(v) => navigate(`/admin/partidos/${v.id}`)} />
        </section>
        <main className="vf-desk__main">
          <div className="vf-desk__head">
            <h1 className="vf-pagetitle">{title}</h1>
            <IconButton icon="trash" label="Borrar partido" variant="danger" onClick={() => setConfirmMatch(true)} />
          </div>
          <Scoreboard size="md" white={m.white} black={m.black} date={timeAndVenue(m.date, m.raw.venue)} result={!m.upcoming} />
          {actions}
          <div className="vf-desk__grid2">{events}{lineups}</div>
        </main>
      </div>

      {confirmMatch ? (
        <ConfirmDialog danger title={`¿Borrar el partido del ${shortDate(m.date)}?`} confirmLabel="Borrar partido" loading={busy}
          body={`Se borran también sus ${m.events.length} eventos y las alineaciones. No se puede deshacer.`} onConfirm={() => void removeMatch()} onCancel={() => setConfirmMatch(false)} />
      ) : null}
      {rowToDelete ? (
        <ConfirmDialog danger title={`¿Borrar ${EV_LABEL[rowToDelete.type].toLowerCase()} de ${data.shortOf(rowToDelete.playerId)}?`} confirmLabel="Borrar evento" loading={busy}
          body={rowToDelete.eventIds.length > 1 ? 'Se borra el gol y su asistencia. El marcador se recalcula.' : 'El marcador y las estadísticas se recalculan.'}
          onConfirm={() => void removeRow()} onCancel={() => setRowToDelete(null)} />
      ) : null}
    </Shell>
  );
};
