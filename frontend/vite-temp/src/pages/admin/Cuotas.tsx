import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../data/context';
import { Shell } from '../../components/Shell';
import { Button, FilterChip, IconButton, PaymentRow, Pronto, StateView, TextField, TopBar } from '../../components/vaf';
import { money, shortDate } from '../../lib/format';
import { useToast } from '../../lib/toast';

// P3 · Cuotas de cancha. El backend no tiene pagos: la pantalla funciona, pero guarda solo en este dispositivo → Pronto.
type Method = 'Nequi' | 'Daviplata' | 'Efectivo';
interface CuotasState { fee: number; paid: Record<number, Method> }
const KEY = (id: number) => `vf_cuotas_${id}`;
const read = (id: number): CuotasState => {
  try {
    return { fee: 12000, paid: {}, ...(JSON.parse(localStorage.getItem(KEY(id)) ?? '{}') as Partial<CuotasState>) };
  } catch {
    return { fee: 12000, paid: {} };
  }
};

export const Cuotas: React.FC = () => {
  const { id } = useParams();
  const matchId = Number(id);
  const data = useAppData();
  const navigate = useNavigate();
  const toast = useToast();
  const m = data.views.find((v) => v.id === matchId);
  const [state, setState] = useState<CuotasState>(() => read(matchId));
  const [method, setMethod] = useState<Method>('Nequi');
  const [filter, setFilter] = useState<'all' | 'debe' | 'pago'>('all');

  useEffect(() => {
    try {
      localStorage.setItem(KEY(matchId), JSON.stringify(state));
    } catch {
      // sin almacenamiento
    }
  }, [matchId, state]);

  if (!m) {
    return (
      <Shell header={false} nav={false}>
        <div className="vf-page"><TopBar title="Cuotas" /><main className="vf-main"><StateView kind="error" title="No encontramos el partido" action="Volver" onAction={() => navigate('/admin?tab=partidos')} /></main></div>
      </Shell>
    );
  }

  const people = [...m.sideOf.keys()];
  const paidIds = people.filter((p) => state.paid[p]);
  const owing = people.filter((p) => !state.paid[p]);
  const goal = state.fee * people.length;
  const collected = state.fee * paidIds.length;
  const shown = filter === 'all' ? people : filter === 'pago' ? paidIds : owing;

  const toggle = (pid: number) => setState((s) => {
    const paid = { ...s.paid };
    if (paid[pid]) delete paid[pid];
    else paid[pid] = method;
    return { ...s, paid };
  });

  const remind = async () => {
    const text = `Cancha del ${shortDate(m.date)}: faltan ${money(state.fee * owing.length)}. Deben ${money(state.fee)} cada uno: ${owing.map((p) => data.shortOf(p)).join(', ')}.`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        toast({ tone: 'success', message: 'Mensaje copiado', detail: 'Pégalo en el chat del grupo.' });
      }
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') toast({ tone: 'error', message: 'No pudimos preparar el mensaje', detail: 'Vuelve a intentarlo.' });
    }
  };

  return (
    <Shell header={false} nav={false}>
      <div className="vf-page">
        <TopBar title={`Cancha · ${shortDate(m.date)}`} onBack={() => navigate(`/admin/partidos/${matchId}`)} right={<IconButton icon="share" label="Enviar cobro al grupo" onClick={() => void remind()} disabled={!owing.length} />} />
        <main className="vf-main">
          <div className="vf-hintbar"><span className="vf-grow">Las cuotas se guardan solo en este dispositivo hasta que el servidor tenga pagos.</span><Pronto title="Pagos en el servidor: pendiente de backend" /></div>
          {!people.length ? (
            <StateView kind="empty" title="Nadie convocado" body="Arma los equipos para saber a quién cobrarle." action="Armar equipos" onAction={() => navigate(`/admin/armar/${matchId}`)} />
          ) : (
            <>
              <section className="vf-pot">
                <span className="vf-overline">Recogido para la cancha</span>
                <div className="vf-pot__row"><span className="vf-pot__big vf-num">{money(collected)}<span className="vf-pot__of"> / {money(goal)}</span></span></div>
                <span className="vf-next__bar" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={collected} aria-label="Recogido"><span style={{ width: `${goal ? (collected / goal) * 100 : 0}%` }} /></span>
                <span className="vf-small vf-dim">{money(state.fee)} por jugador · {people.length} convocados · faltan {owing.length}</span>
              </section>
              <div className="vf-form2">
                <TextField label="Valor por jugador" type="number" inputMode="numeric" min={0} step={500} icon="money" value={String(state.fee)} onChange={(e) => setState((s) => ({ ...s, fee: Math.max(0, Number(e.target.value) || 0) }))} />
                <div className="vf-field">
                  <span className="vf-field__label">Medio al marcar “Pagó”</span>
                  <div className="vf-chiprow">{(['Nequi', 'Daviplata', 'Efectivo'] as Method[]).map((x) => <FilterChip key={x} selected={method === x} onClick={() => setMethod(x)}>{x}</FilterChip>)}</div>
                </div>
              </div>
              <div className="vf-chiprow" role="group" aria-label="Filtrar pagos">
                <FilterChip selected={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterChip>
                <FilterChip selected={filter === 'debe'} count={owing.length} onClick={() => setFilter('debe')}>Deben</FilterChip>
                <FilterChip selected={filter === 'pago'} count={paidIds.length} onClick={() => setFilter('pago')}>Pagaron</FilterChip>
              </div>
              <ul className="vf-pays">
                {shown.map((pid) => <PaymentRow key={pid} name={data.nameOf(pid)} team={m.sideOf.get(pid)} amount={money(state.fee)} status={state.paid[pid] ? 'pago' : 'debe'} method={state.paid[pid]} onToggle={() => toggle(pid)} />)}
              </ul>
              <Button variant="primary" size="lg" block icon="share" onClick={() => void remind()} disabled={!owing.length}>Recordar a los que deben</Button>
            </>
          )}
        </main>
      </div>
    </Shell>
  );
};
