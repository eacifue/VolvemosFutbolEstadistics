import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../data/context';
import { Shell } from '../components/Shell';
import { AchievementBadge, SectionHeader, Skeleton, StateView, TopBar } from '../components/vaf';
import { achievementsOf, type Achievement } from '../lib/stats';

export const Logros: React.FC = () => {
  const { id } = useParams();
  const data = useAppData();
  const navigate = useNavigate();
  const s = data.stats.get(Number(id));
  const list = useMemo(() => (s ? achievementsOf(s, data.views) : []), [s, data.views]);

  if (!s) {
    return (
      <Shell header={false}>
        <div className="vf-page"><TopBar title="Logros" /><main className="vf-main">{data.loading ? <Skeleton shape="row" count={4} /> : <StateView kind="error" title="No encontramos al jugador" action="Ver jugadores" onAction={() => navigate('/jugadores')} />}</main></div>
      </Shell>
    );
  }

  const real = list.filter((a) => !a.soon);
  const done = real.filter((a) => a.unlocked).length;
  const next = real.filter((a) => !a.unlocked && a.progress != null).sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];
  // Los arqueros tienen "Arco" en lugar de "Goles": los grupos salen del propio listado, en su orden.
  const groups = [...new Set(list.map((a) => a.group))] as Achievement['group'][];

  return (
    <Shell header={false}>
      <div className="vf-page">
        <TopBar title={`Logros · ${s.info.name}`} onBack={() => navigate(`/jugadores/${s.id}`)} backLabel="Volver al perfil" />
        <main className="vf-main">
          <section className="vf-pot">
            <span className="vf-overline">Desbloqueados</span>
            <div className="vf-pot__row">
              <span className="vf-pot__big vf-num">{done}<span className="vf-pot__of"> / {real.length}</span></span>
              {next ? <span className="vf-small vf-dim">Siguiente: {next.name}</span> : null}
            </div>
            <span className="vf-next__bar" role="progressbar" aria-valuemin={0} aria-valuemax={real.length} aria-valuenow={done} aria-label="Logros desbloqueados"><span style={{ width: `${(done / Math.max(1, real.length)) * 100}%` }} /></span>
          </section>
          {groups.map((g) => (
            <section key={g} className="vf-block">
              <SectionHeader title={g} />
              <div className="vf-achgrid">{list.filter((a) => a.group === g).map((a) => <AchievementBadge key={a.id} {...a} />)}</div>
            </section>
          ))}
        </main>
      </div>
    </Shell>
  );
};
