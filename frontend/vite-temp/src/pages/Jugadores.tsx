import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../data/context';
import { Shell } from '../components/Shell';
import { PlayerCard, Skeleton, StateView, TextField } from '../components/vaf';
import { normalize } from '../lib/format';

export const Jugadores: React.FC = () => {
  const data = useAppData();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const term = normalize(q.trim());
    return data.infos.filter((i) => !term || normalize(i.name).includes(term)).map((i) => data.stats.get(i.id)!).filter(Boolean);
  }, [data.infos, data.stats, q]);

  return (
    <Shell>
      <main className="vf-main">
        <h1 className="vf-pagetitle">Jugadores</h1>
        <TextField icon="search" type="search" placeholder="Buscar jugador (sin tildes también)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar jugador" />
        {data.loading ? <Skeleton shape="row" count={6} /> : null}
        {data.error ? <StateView kind="error" title="Se nos cayó el balón" body={data.error} action="Reintentar" onAction={() => void data.refetch()} /> : null}
        <div className="vf-list">
          {list.map((s) => <PlayerCard key={s.id} stats={s} onClick={() => navigate(`/jugadores/${s.id}`)} />)}
        </div>
        {!data.loading && data.infos.length && !list.length ? <p className="vf-small vf-dim">No encontramos a nadie con “{q}”.</p> : null}
        {!data.loading && !data.error && !data.infos.length ? <StateView kind="empty" title="Aún no hay jugadores" body="Cuando el admin registre al grupo, aquí aparece cada uno con sus números." /> : null}
      </main>
    </Shell>
  );
};
