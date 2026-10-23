import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../data/context';
import { Shell } from '../../components/Shell';
import { Button, FilterChip, Icon, Pitch, Skeleton, StateView, TopBar } from '../../components/vaf';
import { changePlayerTeam, updatePitchPositions } from '../../services/api';
import { emitStatsRefresh } from '../../services/refreshBus';
import { clearLocalSpots, loadLocalSpots, type Spots } from '../../lib/lineupStore';
import { pitchPlayers } from '../../lib/matchHelpers';
import { other, TEAM_ID, type MatchView } from '../../lib/stats';
import { useToast } from '../../lib/toast';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';

type Draft = Record<number, { x: number; y: number } | null>;

// Arranca con lo que ya está en el servidor; si no hay nada y este dispositivo tenía posiciones
// guardadas de antes, las precarga para poder subirlas.
const initialDraft = (m: MatchView): { draft: Draft; fromDevice: boolean } => {
  const server: Spots = {};
  (m.raw.matchPlayers ?? []).forEach((mp) => {
    if (mp.pitchX != null && mp.pitchY != null) server[mp.playerId] = { x: mp.pitchX, y: mp.pitchY };
  });
  if (Object.keys(server).length) return { draft: server, fromDevice: false };
  const local = loadLocalSpots(m.id);
  const inLineup = Object.fromEntries(Object.entries(local).filter(([pid]) => m.sideOf.has(Number(pid))));
  return { draft: inLineup, fromDevice: Object.keys(inLineup).length > 0 };
};

export const EditarAlineacion: React.FC = () => {
  const { id } = useParams();
  const data = useAppData();
  const navigate = useNavigate();
  const m = data.views.find((v) => v.id === Number(id));
  if (data.loading) {
    return (
      <Shell header={false} nav={false}>
        <div className="vf-page"><TopBar title="Editar alineación" /><main className="vf-main"><Skeleton shape="card" /></main></div>
      </Shell>
    );
  }
  if (!m) {
    return (
      <Shell header={false} nav={false}>
        <div className="vf-page"><TopBar title="Editar alineación" /><main className="vf-main"><StateView kind="error" title="No encontramos el partido" action="Volver" onAction={() => navigate('/admin?tab=partidos')} /></main></div>
      </Shell>
    );
  }
  return <Editor key={m.id} m={m} />;
};

const Editor: React.FC<{ m: MatchView }> = ({ m }) => {
  const data = useAppData();
  const navigate = useNavigate();
  const toast = useToast();
  const [{ draft: start, fromDevice }] = useState(() => initialDraft(m));
  const [draft, setDraft] = useState<Draft>(start);
  const [selected, setSelected] = useState<number | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [saving, setSaving] = useState(false);

  const apply = (list: ReturnType<typeof pitchPlayers>) => list.map((p) => ({ ...p, x: draft[p.id]?.x, y: draft[p.id]?.y }));
  const white = apply(pitchPlayers(m, 'white', data));
  const black = apply(pitchPlayers(m, 'black', data));
  const back = () => navigate(`/admin/partidos/${m.id}`);

  const swap = async () => {
    if (selected == null) return;
    const from = m.sideOf.get(selected);
    if (!from) return;
    setSwapping(true);
    try {
      await changePlayerTeam(m.id, selected, TEAM_ID[other(from)]);
      // El servidor la devuelve a la ubicación automática: cada equipo tiene su mitad.
      setDraft((d) => ({ ...d, [selected]: null }));
      toast({ tone: 'success', message: `${data.shortOf(selected)} pasó a ${other(from) === 'white' ? 'Blanco' : 'Negro'}` });
      emitStatsRefresh();
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', message: 'No se cambió de equipo', detail: getFriendlyErrorMessage(err, 'Vuelve a intentarlo.') });
    } finally {
      setSwapping(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updatePitchPositions(m.id, [...m.sideOf.keys()].map((pid) => ({ playerId: pid, x: draft[pid]?.x ?? null, y: draft[pid]?.y ?? null })));
      clearLocalSpots(m.id);
      toast({ tone: 'success', message: 'Alineación guardada para todos', detail: 'Ya la ven así en Partidos.' });
      emitStatsRefresh();
      back();
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', message: 'No se guardó la alineación', detail: getFriendlyErrorMessage(err, 'Revisa la conexión y vuelve a intentarlo.') });
      setSaving(false);
    }
  };

  return (
    <Shell header={false} nav={false}>
      <div className="vf-page">
        <TopBar title="Editar alineación" backIcon="close" backLabel="Cancelar edición" onBack={back} />
        <main className="vf-main vf-main--pad-bottom">
          <div className="vf-hintbar"><Icon name="edit" size={16} /><span className="vf-grow">Arrastra una camiseta, o tócala y luego toca su nuevo lugar. Con teclado: flechas.</span></div>
          {fromDevice ? <p className="vf-small vf-dim">Cargamos las posiciones que tenías guardadas en este dispositivo. Guarda para que las vean todos.</p> : null}
          <Pitch white={white} black={black} editable selectedId={selected} onSelect={setSelected}
            onMove={(pid, x, y) => setDraft((d) => ({ ...d, [pid]: { x, y } }))} />
          <div className="vf-chiprow">
            <FilterChip icon="undo" onClick={() => setDraft({})}>Restablecer por posición</FilterChip>
            <FilterChip icon="swap" onClick={() => void swap()} disabled={selected == null || swapping}>{swapping ? 'Cambiando…' : 'Cambiar de equipo'}</FilterChip>
          </div>
        </main>
        <div className="vf-editbar">
          <Button variant="secondary" size="lg" onClick={back} disabled={saving}>Cancelar</Button>
          <Button variant="primary" size="lg" icon="check" loading={saving ? 'Guardando…' : false} onClick={() => void save()}>Guardar para todos</Button>
        </div>
      </div>
    </Shell>
  );
};
