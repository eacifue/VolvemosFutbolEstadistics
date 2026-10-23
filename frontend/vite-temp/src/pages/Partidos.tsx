import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../data/context';
import { Shell } from '../components/Shell';
import { Button, FilterChip, MatchListItem, Skeleton, StateView } from '../components/vaf';
import { monthTitle, shortDate, time24 } from '../lib/format';
import { lastNameOf } from '../lib/matchHelpers';
import { scorersOf, type MatchView } from '../lib/stats';

type Filter = 'all' | 'white' | 'black' | 'draw';

export const MatchList: React.FC<{ views: MatchView[]; onOpen: (m: MatchView) => void }> = ({ views, onOpen }) => {
  const data = useAppData();
  const upcoming = views.filter((v) => v.upcoming).sort((a, b) => a.date.getTime() - b.date.getTime());
  const played = views.filter((v) => !v.upcoming);
  const groups = new Map<string, MatchView[]>();
  played.forEach((m) => {
    const k = monthTitle(m.date);
    groups.set(k, [...(groups.get(k) ?? []), m]);
  });
  const item = (m: MatchView) => {
    const sc = scorersOf(m, (id) => lastNameOf(data, id));
    return (
      <MatchListItem key={m.id} date={shortDate(m.date)} time={time24(m.date)} white={m.white} black={m.black} upcoming={m.upcoming}
        badge={m.today ? 'HOY' : m.upcoming ? 'PRÓXIMO' : undefined} assigned={m.sideOf.size}
        sw={sc.white.join(', ')} sb={sc.black.join(', ')} onClick={() => onOpen(m)} />
    );
  };
  return (
    <>
      {upcoming.length ? <section className="vf-month"><h2 className="vf-month__title">Próximos</h2><div className="vf-list">{upcoming.map(item)}</div></section> : null}
      {[...groups.entries()].map(([month, list]) => (
        <section key={month} className="vf-month">
          <h2 className="vf-month__title">{month}</h2>
          <div className="vf-list">{list.map(item)}</div>
        </section>
      ))}
    </>
  );
};

export const Partidos: React.FC = () => {
  const data = useAppData();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const played = data.views.filter((v) => !v.upcoming);
  const count = (r: Filter) => played.filter((m) => m.result === r).length;
  const shown = filter === 'all' ? data.views : played.filter((m) => m.result === filter);

  return (
    <Shell>
      <main className="vf-main">
        <div className="vf-pagehead">
          <h1 className="vf-pagetitle">Partidos</h1>
          {isAdmin ? <Button variant="primary" size="sm" icon="plus" onClick={() => navigate('/admin/armar')}>Nuevo</Button> : null}
        </div>
        <div className="vf-chiprow" role="group" aria-label="Filtrar partidos">
          <FilterChip selected={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterChip>
          <FilterChip selected={filter === 'white'} count={count('white')} onClick={() => setFilter('white')}>Ganó Blanco</FilterChip>
          <FilterChip selected={filter === 'black'} count={count('black')} onClick={() => setFilter('black')}>Ganó Negro</FilterChip>
          <FilterChip selected={filter === 'draw'} count={count('draw')} onClick={() => setFilter('draw')}>Empates</FilterChip>
          <FilterChip soon>Donde jugué</FilterChip>
        </div>
        {data.loading ? <Skeleton shape="match" count={4} /> : null}
        {data.error ? <StateView kind="error" title="Se nos cayó el balón" body={data.error} action="Reintentar" onAction={() => void data.refetch()} /> : null}
        {!data.loading && !data.error && !data.views.length ? (
          <StateView kind="empty" title="Todavía no hay partidos" body="Cuando el admin cargue el primer Blanco vs Negro, aquí verás el marcador y quién la rompió."
            action={isAdmin ? 'Crear partido' : undefined} onAction={() => navigate('/admin/armar')} />
        ) : null}
        {!data.loading && data.views.length && !shown.length ? <p className="vf-small vf-dim">No hay partidos con ese resultado todavía.</p> : null}
        <MatchList views={shown} onOpen={(m) => navigate(`/partidos/${m.id}`)} />
      </main>
    </Shell>
  );
};
