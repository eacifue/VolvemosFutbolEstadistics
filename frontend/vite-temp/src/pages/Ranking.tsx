import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../data/context';
import { Shell } from '../components/Shell';
import { DataTable, FilterChip, IconButton, LeaderboardRow, Podium, SectionHeader, ShareSheet, Skeleton, StateView, Tabs, type DataTableColumn } from '../components/vaf';
import { seasonOf, shortDate } from '../lib/format';
import { computePlayerStats, PREVENTED_HELP, RATING_HELP, type PlayerStats } from '../lib/stats';

type Metric = 'g' | 'a' | 'wp' | 'rating' | 'og' | 'gk';
const METRICS: { id: Metric; label: string; unit: string; overline: string }[] = [
  { id: 'g', label: 'Goles', unit: 'goles', overline: 'Pichichi' },
  { id: 'a', label: 'Asistencias', unit: 'asist.', overline: 'Asistidores' },
  { id: 'wp', label: '% Victorias', unit: '%', overline: 'Ganadores' },
  { id: 'rating', label: 'Rating', unit: 'rating', overline: 'Mejor rating' },
  { id: 'og', label: 'Autogoles', unit: 'AG', overline: 'Muro de la vergüenza' },
  { id: 'gk', label: 'Arqueros', unit: 'GC/PJ', overline: 'Arqueros' },
];
const MIN_PJ = [1, 3, 5];
// Arqueros: solo porteros, de menor a mayor GC/PJ. Mínimo propio (como "Ganador" en Inicio): el 30 % de los
// partidos del arquero que más jugó, y nunca menos de 3, para que dos o tres partidos buenos no lideren.
const keeperMinPj = (maxPj: number) => Math.max(3, Math.ceil(maxPj * 0.3));

interface Row extends Record<string, unknown> { id: number; name: string; short: string; team: PlayerStats['team']; pj: number; g: number; a: number; ga: number; gpj: number; w: number; d: number; l: number; wp: number; og: number; rating: number; gk: number; gc: number; cs: number; prevented: number; keeper: boolean }

const fmtMetric = (m: Metric, r: Row) => (m === 'wp' ? `${r.wp}%` : m === 'rating' ? r.rating.toFixed(1) : m === 'gk' ? r.gk.toFixed(2) : r[m]);
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

export const Ranking: React.FC = () => {
  const data = useAppData();
  const navigate = useNavigate();
  const season = seasonOf(new Date());
  const [period, setPeriod] = useState<'temp' | 'hist'>('temp');
  const [metric, setMetric] = useState<Metric>('g');
  const [minIdx, setMinIdx] = useState(0);
  const [sharing, setSharing] = useState(false);

  const stats = useMemo(() => {
    if (period === 'hist') return [...data.stats.values()];
    return [...computePlayerStats(data.infos, data.views.filter((v) => v.season === season)).values()];
  }, [period, data.stats, data.infos, data.views, season]);

  const keepers = metric === 'gk';
  const maxKeeperPj = Math.max(0, ...stats.filter((s) => s.isKeeper).map((s) => s.pj));
  const minPj = keepers ? Math.max(keeperMinPj(maxKeeperPj), MIN_PJ[minIdx]) : MIN_PJ[minIdx];
  const rows: Row[] = useMemo(() => stats.filter((s) => s.pj >= minPj && (!keepers || s.isKeeper)).map((s) => ({
    id: s.id, name: s.info.name, short: s.info.short, team: s.team, pj: s.pj, g: s.g, a: s.a, ga: s.ga, gpj: s.gpj, w: s.w, d: s.d, l: s.l, wp: s.wp, og: s.og, rating: s.rating ?? 0,
    gk: s.gcpj, gc: s.gc, cs: s.cleanSheets, prevented: s.goalsPrevented, keeper: s.isKeeper,
  })), [stats, minPj, keepers]);

  const top = (m: Metric, n: number) => (m === 'gk'
    ? [...rows].filter((r) => r.keeper).sort((x, y) => x.gk - y.gk || y.pj - x.pj)
    : [...rows].sort((x, y) => (y[m] as number) - (x[m] as number) || y.pj - x.pj).filter((r) => m === 'wp' || m === 'rating' || (r[m] as number) > 0)
  ).slice(0, n);
  const cur = METRICS.find((x) => x.id === metric)!;
  const podium = top(metric, 3);

  const lead: DataTableColumn<Row>[] = [
    { key: '#', label: '#', num: true, sortable: false },
    { key: 'name', label: 'Jugador', render: (r) => (
      <button type="button" className="vf-cellwho vf-link--btn" onClick={() => navigate(`/jugadores/${r.id}`)}>
        {r.team ? <span className={`vf-swatch vf-swatch--xs vf-swatch--${r.team}`} aria-hidden="true" /> : null}{r.short}
      </button>
    ) },
    { key: 'pj', label: 'PJ', num: true, title: 'Partidos jugados' },
  ];
  const keeperColumns: DataTableColumn<Row>[] = [
    ...lead,
    { key: 'gk', label: 'GC/PJ', num: true, title: 'Goles recibidos por partido (menos es mejor)', render: (r) => r.gk.toFixed(2) },
    { key: 'gc', label: 'GC', num: true, title: 'Goles recibidos' },
    { key: 'cs', label: 'Vallas', num: true, title: 'Partidos sin recibir gol' },
    { key: 'prevented', label: 'Evit.', num: true, title: PREVENTED_HELP, render: (r) => signed(r.prevented) },
    { key: 'w', label: 'V', num: true, title: 'Victorias' },
    { key: 'd', label: 'E', num: true, title: 'Empates' },
    { key: 'l', label: 'P', num: true, title: 'Derrotas' },
    { key: 'wp', label: '%V', num: true, title: 'Porcentaje de victorias', render: (r) => `${r.wp}%` },
    { key: 'rating', label: 'Rating', num: true, title: RATING_HELP, render: (r) => r.rating.toFixed(1) },
  ];
  const columns: DataTableColumn<Row>[] = keepers ? keeperColumns : [
    ...lead,
    { key: 'g', label: 'G', num: true, title: 'Goles' },
    { key: 'a', label: 'A', num: true, title: 'Asistencias' },
    { key: 'ga', label: 'G+A', num: true, title: 'Goles más asistencias' },
    { key: 'gpj', label: 'G/PJ', num: true, title: 'Goles por partido', render: (r) => r.gpj.toFixed(2) },
    { key: 'w', label: 'V', num: true, title: 'Victorias' },
    { key: 'd', label: 'E', num: true, title: 'Empates' },
    { key: 'l', label: 'P', num: true, title: 'Derrotas' },
    { key: 'wp', label: '%V', num: true, title: 'Porcentaje de victorias', render: (r) => `${r.wp}%` },
    { key: 'og', label: 'AG', num: true, title: 'Autogoles' },
    { key: 'rating', label: 'Rating', num: true, title: RATING_HELP, render: (r) => r.rating.toFixed(1) },
  ];

  const periodTabs = <Tabs variant="segmented" label="Periodo" active={period} onChange={(id) => setPeriod(id as 'temp' | 'hist')} items={[{ id: 'temp', label: season }, { id: 'hist', label: 'Histórico' }]} />;
  const minChip = <FilterChip icon="sort" onClick={() => setMinIdx((i) => (i + 1) % MIN_PJ.length)}>Mín. PJ: {minPj}</FilterChip>;

  return (
    <Shell>
      <main className="vf-main vf-main--wide">
        <div className="vf-rankhead">
          <h1 className="vf-pagetitle">Ranking</h1>
          <div className="vf-row">{periodTabs}<IconButton icon="share" label="Compartir ranking" onClick={() => setSharing(true)} disabled={!podium.length} /></div>
        </div>
        <div className="vf-chiprow vf-chiprow--scroll" role="group" aria-label="Métrica">
          {METRICS.map((m) => <FilterChip key={m.id} selected={metric === m.id} onClick={() => setMetric(m.id)}>{m.label}</FilterChip>)}
        </div>

        {data.loading ? <Skeleton shape="row" count={6} /> : null}
        {data.error ? <StateView kind="error" title="Se nos cayó el balón" body={data.error} action="Reintentar" onAction={() => void data.refetch()} /> : null}

        {!data.loading && !rows.length && keepers ? (
          <StateView kind="empty" title="Sin arqueros en la tabla" body={`Aparecen los porteros con al menos ${minPj} partidos en el periodo. Revisa que su posición sea Portero en Gestión.`} />
        ) : null}
        {!data.loading && !rows.length && !keepers ? (
          <StateView kind="empty" title={period === 'temp' ? `Sin partidos en ${season}` : 'Todavía sin ranking'} body={period === 'temp' ? 'La temporada arranca con el primer partido del semestre. Mira el histórico mientras tanto.' : 'Con el primer partido jugado aparece la tabla.'}
            action={period === 'temp' ? 'Ver histórico' : undefined} onAction={() => setPeriod('hist')} />
        ) : null}

        {rows.length ? (
          <>
            {keepers ? null : <div className="vf-only-desk vf-desk__grid">
              <section className="vf-block"><SectionHeader title="Pichichi" /><Podium entries={top('g', 3).map((r) => ({ id: r.id, name: r.name, team: r.team, value: r.g }))} unit="goles" /></section>
              <section className="vf-block"><SectionHeader title="Asistidores" /><ol className="vf-lblist">{top('a', 5).map((r, i) => <LeaderboardRow key={r.id} rank={i + 1} name={r.name} team={r.team} value={r.a} unit="A" onClick={() => navigate(`/jugadores/${r.id}`)} />)}</ol></section>
              <section className="vf-block"><SectionHeader title="Muro de la vergüenza" overline="Autogoles" /><ol className="vf-lblist">{top('og', 3).map((r, i) => <LeaderboardRow key={r.id} rank={i + 1} name={r.name} team={r.team} value={r.og} unit="AG" onClick={() => navigate(`/jugadores/${r.id}`)} />)}</ol>{!top('og', 1).length ? <p className="vf-small vf-dim">Nadie la ha metido en su arco. Por ahora.</p> : null}</section>
            </div>}
            <div className={keepers ? undefined : 'vf-only-mobile'}>{podium.length ? <Podium entries={podium.map((r) => ({ id: r.id, name: r.name, team: r.team, value: fmtMetric(metric, r) as React.ReactNode }))} unit={metric === 'wp' ? '' : cur.unit} /> : <p className="vf-small vf-dim">Nadie suma {cur.label.toLowerCase()} todavía.</p>}</div>
            <div className="vf-tabletools"><span className="vf-small vf-dim">Mínimo {minPj} partido{minPj > 1 ? 's' : ''} · {rows.length} {keepers ? (rows.length === 1 ? 'arquero' : 'arqueros') : 'jugadores'}</span>{minChip}</div>
            <DataTable caption={keepers ? 'Ranking de arqueros' : 'Ranking de jugadores'} columns={columns} rows={rows} sortKey={metric} sortDir={keepers ? 'asc' : 'desc'} maxHeight={520} />
          </>
        ) : null}
      </main>
      {sharing && podium.length ? (
        <ShareSheet title="Compartir ranking" fileName={`ranking-${metric}`} onClose={() => setSharing(false)}
          data={{ variant: 'ranking', date: shortDate(new Date()), overline: `${cur.overline} · ${period === 'temp' ? season : 'histórico'}`, unit: cur.unit, rows: top(metric, 5).map((r) => ({ name: r.short, team: r.team, value: fmtMetric(metric, r) as string | number })) }} />
      ) : null}
    </Shell>
  );
};
