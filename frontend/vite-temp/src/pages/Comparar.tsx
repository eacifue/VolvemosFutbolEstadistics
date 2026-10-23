import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../data/context';
import { Shell } from '../components/Shell';
import { Avatar, SectionHeader, StateView, TopBar } from '../components/vaf';
import { cx } from '../lib/cx';
import { headToHead } from '../lib/stats';

export const Comparar: React.FC = () => {
  const { a: ida, b: idb } = useParams();
  const data = useAppData();
  const navigate = useNavigate();
  const a = data.stats.get(Number(ida));
  const b = data.stats.get(Number(idb));

  if (!a || !b) {
    return (
      <Shell header={false}>
        <div className="vf-page"><TopBar title="Comparar" /><main className="vf-main"><StateView kind="error" title="Faltan jugadores" body="Elige dos jugadores desde un perfil para compararlos." action="Ver jugadores" onAction={() => navigate('/jugadores')} /></main></div>
      </Shell>
    );
  }

  const rows: [string, number, number, (v: number) => string, boolean][] = [
    ['Goles', a.g, b.g, String, false],
    ['Asistencias', a.a, b.a, String, false],
    ['G/PJ', a.gpj, b.gpj, (v) => v.toFixed(2), false],
    ['% Victorias', a.wp, b.wp, (v) => `${v}%`, false],
    ['Rating', a.rating ?? 0, b.rating ?? 0, (v) => v.toFixed(1), false],
    ['Partidos', a.pj, b.pj, String, false],
    ['Autogoles', a.og, b.og, String, true],
  ];
  const h2h = headToHead(a.id, b.id, data.views);

  return (
    <Shell header={false}>
      <div className="vf-page">
        <TopBar title="Comparar" />
        <main className="vf-main">
          <div className="vf-cmphead">
            <div><Avatar name={a.info.name} initials={a.info.initials} team={a.team} size="lg" /><b>{a.info.short}</b><span className="vf-small vf-dim">{a.info.pos}</span></div>
            <span className="vf-cmphead__vs">VS</span>
            <div><Avatar name={b.info.name} initials={b.info.initials} team={b.team} size="lg" /><b>{b.info.short}</b><span className="vf-small vf-dim">{b.info.pos}</span></div>
          </div>
          <section className="vf-block vf-cmp">
            {rows.map(([l, x, y, fmt, lowWins]) => {
              const t = x + y || 1;
              const aw = lowWins ? x < y : x > y;
              const bw = lowWins ? y < x : y > x;
              return (
                <div key={l} className="vf-cmp__row">
                  <span className={cx('vf-num vf-cmp__v', aw && 'is-win')}>{fmt(x)}</span>
                  <div className="vf-cmp__mid">
                    <span className="vf-cmp__lab">{l}</span>
                    <div className="vf-cmp__bars"><span className={cx('a', aw && 'is-win')} style={{ width: `${(x / t) * 100}%` }} /><span className={cx('b', bw && 'is-win')} style={{ width: `${(y / t) * 100}%` }} /></div>
                  </div>
                  <span className={cx('vf-num vf-cmp__v', bw && 'is-win')}>{fmt(y)}</span>
                </div>
              );
            })}
          </section>
          <section className="vf-block">
            <SectionHeader title="Cara a cara" overline="Cuando jugaron en equipos distintos" />
            {h2h.n ? (
              <div className="vf-h2h">
                <span><b className="vf-num">{h2h.a}</b> gana {a.info.short}</span>
                <span><b className="vf-num">{h2h.draws}</b> empates</span>
                <span><b className="vf-num">{h2h.b}</b> gana {b.info.short}</span>
              </div>
            ) : <p className="vf-small vf-dim">Todavía no se han enfrentado: siempre han jugado del mismo lado o no han coincidido.</p>}
          </section>
        </main>
      </div>
    </Shell>
  );
};
