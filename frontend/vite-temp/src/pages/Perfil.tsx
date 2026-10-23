import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../data/context';
import { Shell } from '../components/Shell';
import {
  AchievementBadge, Avatar, BottomSheet, Button, FormChips, IconButton, InsightRow, PlayerCard, SectionHeader, ShareSheet, Skeleton, StatTile, StateView, TeamChip, TextField, TopBar,
} from '../components/vaf';
import { normalize, shortDate } from '../lib/format';
import { achievementsOf, partnersOf, type Side } from '../lib/stats';

const Spark: React.FC<{ values: number[] }> = ({ values }) => {
  if (values.length < 2) return null;
  const max = Math.max(1, values[values.length - 1]);
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * 300).toFixed(1)},${(62 - (v / max) * 59).toFixed(1)}`);
  const [lx, ly] = pts[pts.length - 1].split(',');
  return (
    <svg className="vf-spark" viewBox="0 0 300 64" role="img" aria-label={`Goles acumulados: de 0 a ${values[values.length - 1]}`}>
      <polyline points={pts.join(' ')} />
      <circle cx={lx} cy={ly} r="4" />
    </svg>
  );
};

export const Perfil: React.FC = () => {
  const { id } = useParams();
  const data = useAppData();
  const navigate = useNavigate();
  const [sharing, setSharing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [q, setQ] = useState('');
  const s = data.stats.get(Number(id));
  const partners = useMemo(() => (s ? partnersOf(s.id, data.views) : {}), [s, data.views]);
  const achievements = useMemo(() => (s ? achievementsOf(s, data.views) : []), [s, data.views]);

  if (!s) {
    return (
      <Shell header={false}>
        <div className="vf-page">
          <TopBar title="Perfil" onBack={() => navigate('/jugadores')} />
          <main className="vf-main">{data.loading ? <Skeleton shape="card" /> : <StateView kind="error" title="No encontramos al jugador" body="Puede que lo hayan borrado del grupo." action="Ver jugadores" onAction={() => navigate('/jugadores')} />}</main>
        </div>
      </Shell>
    );
  }

  const last10 = s.form.slice(-10);
  const cumulative = s.form.reduce<number[]>((list, f) => [...list, list[list.length - 1] + f.goals], [0]);
  const split = (side: Side) => {
    const sp = s.splits[side];
    return { pj: sp.pj, gpj: sp.pj ? sp.g / sp.pj : 0, gcpj: sp.pj ? sp.gc / sp.pj : 0, wp: sp.pj ? Math.round((sp.w / sp.pj) * 100) : 0 };
  };
  const w = split('white');
  const b = split('black');
  const unlocked = achievements.filter((a) => a.unlocked);
  const preview = [...unlocked, ...achievements.filter((a) => !a.unlocked)].slice(0, 6);
  const others = data.infos.filter((i) => i.id !== s.id && normalize(i.name).includes(normalize(q.trim())));

  return (
    <Shell header={false}>
      <div className="vf-page">
        <TopBar title="Perfil" onBack={() => navigate('/jugadores')} backLabel="Volver a jugadores" right={<IconButton icon="share" label="Compartir carta" onClick={() => setSharing(true)} />} />
        <main className="vf-main">
          <PlayerCard variant="full" stats={s} />
          <div className="vf-actions2">
            <Button variant="secondary" icon="scale" block onClick={() => setPicking(true)}>Comparar</Button>
            <Button variant="primary" icon="share" block onClick={() => setSharing(true)}>Compartir carta</Button>
          </div>

          {s.pj ? (
            <>
              <section className="vf-block">
                <SectionHeader title="Forma" overline={`Últimos ${last10.length} · ${s.isKeeper ? 'goles recibidos' : 'goles'} debajo`} />
                <FormChips results={last10.map((f) => f.res)} goals={last10.map((f) => (s.isKeeper ? f.conceded : f.goals))} label={`Forma de ${s.info.name}`} />
                {s.isKeeper ? null : <Spark values={cumulative} />}
              </section>

              <section className="vf-block">
                <SectionHeader title="Con Blanco vs con Negro" />
                <div className="vf-splits">
                  <div><TeamChip team="white" /><StatTile label="PJ" value={w.pj} size="sm" />{s.isKeeper
                    ? <StatTile label="GC/PJ" value={w.gcpj.toFixed(2)} size="sm" emphasis={w.pj > 0 && b.pj > 0 && w.gcpj < b.gcpj} />
                    : <StatTile label="G/PJ" value={w.gpj.toFixed(2)} size="sm" emphasis={w.pj > 0 && w.gpj > b.gpj} />}<StatTile label="% Vic." value={`${w.wp}%`} size="sm" emphasis={w.pj > 0 && w.wp > b.wp} /></div>
                  <div><TeamChip team="black" /><StatTile label="PJ" value={b.pj} size="sm" />{s.isKeeper
                    ? <StatTile label="GC/PJ" value={b.gcpj.toFixed(2)} size="sm" emphasis={b.pj > 0 && w.pj > 0 && b.gcpj < w.gcpj} />
                    : <StatTile label="G/PJ" value={b.gpj.toFixed(2)} size="sm" emphasis={b.pj > 0 && b.gpj > w.gpj} />}<StatTile label="% Vic." value={`${b.wp}%`} size="sm" emphasis={b.pj > 0 && b.wp > w.wp} /></div>
                </div>
              </section>

              {partners.bestAssister || partners.assistsMostTo || partners.winsMostWith ? (
                <section className="vf-block">
                  <SectionHeader title="Socios" />
                  <ul className="vf-insights">
                    {partners.bestAssister ? <InsightRow kind="duo" title="Su mejor asistidor" text={`${data.shortOf(partners.bestAssister.id)} le ha dado ${partners.bestAssister.n} gol${partners.bestAssister.n > 1 ? 'es' : ''}.`} value={partners.bestAssister.n} /> : null}
                    {partners.assistsMostTo ? <InsightRow kind="duo" title="A quién más asiste" text={`${data.nameOf(partners.assistsMostTo.id)}, ${partners.assistsMostTo.n} asistencia${partners.assistsMostTo.n > 1 ? 's' : ''}.`} value={partners.assistsMostTo.n} /> : null}
                    {partners.winsMostWith ? <InsightRow kind="fire" title="Con quién más gana" text={`Junto a ${data.shortOf(partners.winsMostWith.id)}: ${partners.winsMostWith.w} de ${partners.winsMostWith.pj} ganados.`} value={`${Math.round((partners.winsMostWith.w / partners.winsMostWith.pj) * 100)}%`} /> : null}
                  </ul>
                </section>
              ) : null}
            </>
          ) : (
            <StateView kind="empty" title="Todavía sin partidos" body={`Cuando ${s.info.name} juegue su primer Blanco vs Negro, aquí verás su forma, splits y socios.`} />
          )}

          <section className="vf-block">
            <SectionHeader title="Logros" overline={`${unlocked.length} desbloqueados`} action="Ver todos" onAction={() => navigate(`/jugadores/${s.id}/logros`)} />
            <div className="vf-achgrid">{preview.map((a) => <AchievementBadge key={a.id} {...a} />)}</div>
          </section>
        </main>
      </div>

      {sharing ? <ShareSheet title="Compartir carta" fileName={`carta-${s.info.short.replace(/\W+/g, '-').toLowerCase()}`} data={{ variant: 'player', date: shortDate(new Date()), stats: s }} onClose={() => setSharing(false)} /> : null}
      {picking ? (
        <BottomSheet title="Comparar con…" onClose={() => setPicking(false)}>
          <div className="vf-block">
            <TextField icon="search" type="search" placeholder="Buscar jugador" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar jugador para comparar" data-autofocus />
            <ul className="vf-lblist">
              {others.map((o) => (
                <li key={o.id} className="vf-lb">
                  <button type="button" className="vf-lb__main" onClick={() => navigate(`/comparar/${s.id}/${o.id}`)}>
                    <Avatar name={o.name} initials={o.initials} team={data.stats.get(o.id)?.team} size="sm" />
                    <span className="vf-lb__who"><span className="vf-lb__name">{o.name}</span><span className="vf-lb__sub">{o.pos || o.posShort}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </BottomSheet>
      ) : null}
    </Shell>
  );
};
