import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../data/context';
import { Shell } from '../../components/Shell';
import { Avatar, Button, ConfirmDialog, IconButton, StateView, Tabs, TextField } from '../../components/vaf';
import { MatchList } from '../Partidos';
import { createPlayer, deletePlayer, updatePlayer } from '../../services/api';
import { emitStatsRefresh } from '../../services/refreshBus';
import { posShortOf, POS_LABEL, type PosShort } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';

const POS_TABS: { id: PosShort; label: string }[] = [
  { id: 'POR', label: 'Portero' },
  { id: 'DEF', label: 'Defensa' },
  { id: 'MED', label: 'Medio' },
  { id: 'DEL', label: 'Delantero' },
];

const JugadoresAdmin: React.FC = () => {
  const data = useAppData();
  const toast = useToast();
  const [editing, setEditing] = useState<number | null>(null);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [nick, setNick] = useState('');
  const [pos, setPos] = useState<PosShort>('MED');
  const [errors, setErrors] = useState<{ first?: string; last?: string }>({});
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const positionId = (p: PosShort) => data.positions.find((x) => posShortOf(x.name) === p && x.name === POS_LABEL[p])?.id ?? data.positions.find((x) => posShortOf(x.name) === p)?.id;

  const reset = () => {
    setEditing(null);
    setFirst('');
    setLast('');
    setNick('');
    setPos('MED');
    setErrors({});
  };

  const startEdit = (id: number) => {
    const i = data.info(id);
    if (!i) return;
    setEditing(id);
    setFirst(i.raw.firstName.trim());
    setLast(i.raw.lastName.trim());
    setNick(i.nick ?? '');
    setPos(i.posShort);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { first: first.trim() ? undefined : 'Escribe el nombre.', last: last.trim() ? undefined : 'Escribe el apellido.' };
    setErrors(errs);
    if (errs.first || errs.last) return;
    setBusy(true);
    const payload = { firstName: first.trim(), lastName: last.trim(), nickname: nick.trim() || null, idPosition: positionId(pos) ?? null };
    try {
      if (editing) await updatePlayer(editing, payload);
      else await createPlayer(payload);
      toast({ tone: 'success', message: editing ? 'Jugador actualizado' : 'Jugador guardado', detail: `${payload.firstName} ${payload.lastName} ya aparece en Jugadores.` });
      reset();
      emitStatsRefresh();
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', message: 'No se guardó el jugador', detail: getFriendlyErrorMessage(err, 'Revisa los datos y vuelve a intentarlo.') });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (toDelete == null) return;
    setDeleting(true);
    const name = data.nameOf(toDelete);
    try {
      await deletePlayer(toDelete);
      toast({ tone: 'success', message: 'Jugador borrado', detail: `${name} ya no aparece en el grupo.` });
      if (editing === toDelete) reset();
      emitStatsRefresh();
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', message: 'No se borró el jugador', detail: getFriendlyErrorMessage(err, 'Puede que tenga partidos cargados. Inténtalo de nuevo.') });
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const pj = (id: number) => data.stats.get(id)?.pj ?? 0;

  return (
    <>
      <form className="vf-block vf-stack" onSubmit={save} noValidate>
        <div className="vf-row vf-row--between">
          <h2 className="vf-h2">{editing ? 'Editar jugador' : 'Nuevo jugador'}</h2>
          {editing ? <Button variant="ghost" size="sm" icon="close" onClick={reset}>Cancelar</Button> : null}
        </div>
        <div className="vf-form2">
          <TextField label="Nombre" required value={first} onChange={(e) => setFirst(e.target.value)} error={errors.first} autoComplete="off" />
          <TextField label="Apellido" required value={last} onChange={(e) => setLast(e.target.value)} error={errors.last} autoComplete="off" />
        </div>
        <div className="vf-form2">
          <TextField label="Apodo" hint="Sale en la cancha y en las cartas" placeholder="Pipe" maxLength={40} autoComplete="off" value={nick} onChange={(e) => setNick(e.target.value)} />
          <TextField label="Dorsal" soon inputMode="numeric" placeholder="12" />
        </div>
        <div className="vf-field">
          <span className="vf-field__label" id="pos-label">Posición</span>
          <Tabs variant="segmented" label="Posición" active={pos} onChange={(id) => setPos(id as PosShort)} items={POS_TABS} />
        </div>
        <Button type="submit" variant="primary" size="lg" block loading={busy ? 'Guardando…' : false}>{editing ? 'Guardar cambios' : 'Guardar jugador'}</Button>
      </form>

      <section className="vf-block">
        <h2 className="vf-h2">Plantel ({data.infos.length})</h2>
        {data.infos.length ? (
          <ul className="vf-lblist vf-card" aria-label="Plantel">
            {data.infos.map((i) => (
              <li key={i.id} className="vf-evrow">
                <Avatar name={i.name} initials={i.initials} team={data.stats.get(i.id)?.team} size="sm" />
                <span className="vf-evrow__who">{i.name}{i.nick ? ` “${i.nick}”` : ''}<small>{i.pos || POS_LABEL[i.posShort]} · {pj(i.id)} PJ</small></span>
                <IconButton icon="edit" label={`Editar a ${i.name}`} onClick={() => startEdit(i.id)} />
                <IconButton icon="trash" variant="danger" label={`Borrar a ${i.name}`} onClick={() => setToDelete(i.id)} />
              </li>
            ))}
          </ul>
        ) : <StateView kind="empty" title="Sin jugadores" body="Registra al primero con el formulario de arriba." />}
      </section>

      {toDelete != null ? (
        <ConfirmDialog danger title={`¿Borrar a ${data.nameOf(toDelete)}?`} confirmLabel="Borrar jugador" loading={deleting}
          body={pj(toDelete) ? `Jugó ${pj(toDelete)} partidos: si el servidor lo permite, sus goles y alineaciones dejan de contar. No se puede deshacer.` : 'Sale del grupo y de los rankings. No se puede deshacer.'}
          onConfirm={() => void confirmDelete()} onCancel={() => setToDelete(null)} />
      ) : null}
    </>
  );
};

const PartidosAdmin: React.FC = () => {
  const data = useAppData();
  const navigate = useNavigate();
  return (
    <section className="vf-block">
      <div className="vf-sechead"><h2 className="vf-sechead__title">Partidos</h2><Button variant="primary" size="sm" icon="plus" onClick={() => navigate('/admin/armar')}>Nuevo</Button></div>
      {data.views.length ? <MatchList views={data.views} onOpen={(m) => navigate(`/admin/partidos/${m.id}`)} /> : <StateView kind="empty" title="Todavía no hay partidos" body="Crea el primero: eliges fecha, convocas y repartes Blanco y Negro." action="Crear partido" onAction={() => navigate('/admin/armar')} />}
    </section>
  );
};

export const Gestion: React.FC = () => {
  const { user, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'partidos' ? 'partidos' : 'jugadores';
  const content = useMemo(() => (tab === 'partidos' ? <PartidosAdmin /> : <JugadoresAdmin />), [tab]);
  return (
    <Shell>
      <main className="vf-main">
        <Tabs variant="segmented" label="Gestión" active={tab} onChange={(id) => setParams(id === 'jugadores' ? {} : { tab: id }, { replace: true })}
          items={[{ id: 'jugadores', label: 'Jugadores' }, { id: 'partidos', label: 'Partidos' }]} />
        {content}
        <Button variant="ghost" block icon="lock" onClick={logout}>Cerrar sesión{user?.username ? ` (${user.username})` : ''}</Button>
      </main>
    </Shell>
  );
};
