import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData, type AppData } from '../data/context';
import { Shell } from '../components/Shell';
import {
  Avatar, Button, EventCounts, EventIcon, FilterChip, IconButton, LeaderboardRow, LineupList, Momentum, NextMatchCard, Pitch, Pronto, ProntoBox,
  Scoreboard, SectionHeader, ShareSheet, Skeleton, StateView, Tabs, TeamChip, Timeline, TopBar, VersusBar, VoteOption,
} from '../components/vaf';
import { shortDate, time24, timeAndVenue } from '../lib/format';
import { pitchPlayers, timelineOf } from '../lib/matchHelpers';
import { RATING_HELP, scorersOf, type MatchView, type Side } from '../lib/stats';

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'minutos', label: 'Minutos' },
  { id: 'alineaciones', label: 'Alineaciones' },
  { id: 'stats', label: 'Stats' },
  { id: 'mvp', label: 'MVP' },
];

const goalLine = (m: MatchView, data: AppData, side: Side) =>
  m.events
    .filter((e) => (e.type === 'goal' || e.type === 'own-goal') && e.credited === side)
    .map((e) => ({
      id: e.id,
      type: e.type,
      text: e.type === 'own-goal' ? `Autogol de ${data.shortOf(e.playerId)}` : `Gol de ${data.shortOf(e.playerId)}${e.assistId != null ? ` (asist. ${data.shortOf(e.assistId)})` : ''}`,
    }));

const bestRated = (m: MatchView) => [...m.ratings.entries()].sort((a, b) => b[1] - a[1]);

const Resumen: React.FC<{ m: MatchView; data: AppData }> = ({ m, data }) => {
  const best = bestRated(m)[0];
  const bestSide = best ? m.sideOf.get(best[0]) : undefined;
  const c = best ? m.counts.get(best[0]) : undefined;
  return (
    <>
      <section className="vf-block vf-goals2">
        {(['white', 'black'] as Side[]).map((side) => {
          const lines = goalLine(m, data, side);
          return (
            <div key={side}>
              <TeamChip team={side} size="sm" />
              {lines.length ? <ul>{lines.map((l) => <li key={l.id}><EventIcon type={l.type} size={14} /><span>{l.text}</span><span /></li>)}</ul> : <p className="vf-small vf-dim">Sin goles</p>}
            </div>
          );
        })}
      </section>
      {best ? (
        <section className="vf-block vf-mvpcard">
          <span className="vf-overline">Mejor rating del partido</span>
          <div className="vf-mvpcard__row">
            <Avatar name={data.nameOf(best[0])} initials={data.info(best[0])?.initials} team={bestSide} size="lg" />
            <div>
              <h3 className="vf-mvpcard__name">{data.nameOf(best[0])}</h3>
              {c ? <EventCounts goals={c.goals} assists={c.assists} ownGoals={c.ownGoals} /> : null}
              <p className="vf-dim vf-small" title={RATING_HELP}>Rating {best[1].toFixed(1)} · calculado con goles, asistencias y resultado</p>
            </div>
          </div>
        </section>
      ) : null}
      <ProntoBox title="Jugador del partido" overline="Votación MVP" text="Cuando el servidor guarde los votos, aquí saldrá el MVP elegido por el grupo y el Tronco del partido." />
      <ProntoBox title="La crónica" overline="Generada con IA" text="Un resumen corto y con pique del partido, escrito a partir de los goles y revisado por el admin." />
    </>
  );
};

const Minutos: React.FC<{ m: MatchView; data: AppData }> = ({ m, data }) => (
  <>
    <div className="vf-hintbar"><span className="vf-grow">Por ahora los eventos salen en el orden en que se cargaron.</span><Pronto title="El minuto de cada evento llega cuando el servidor lo guarde" /></div>
    {m.timeline.length ? <Timeline events={timelineOf(m, data)} hasMinutes={false} /> : <StateView kind="empty" title="Sin eventos" body="Este partido todavía no tiene goles ni asistencias cargados." />}
  </>
);

const Alineaciones: React.FC<{ m: MatchView; data: AppData; admin: boolean }> = ({ m, data, admin }) => {
  const [view, setView] = useState<'cancha' | 'lista'>('cancha');
  const navigate = useNavigate();
  const white = pitchPlayers(m, 'white', data);
  const black = pitchPlayers(m, 'black', data);
  if (!white.length && !black.length) {
    return <StateView kind="empty" title="Sin alineaciones" body="El admin todavía no repartió la gente entre Blanco y Negro." action={admin ? 'Armar equipos' : undefined} onAction={() => navigate(`/admin/armar/${m.id}`)} />;
  }
  return (
    <>
      <div className="vf-row vf-row--between">
        <div className="vf-chiprow">
          <FilterChip selected={view === 'cancha'} icon="players" onClick={() => setView('cancha')}>Cancha</FilterChip>
          <FilterChip selected={view === 'lista'} onClick={() => setView('lista')}>Lista</FilterChip>
        </div>
        {admin ? <Button variant="ghost" size="sm" icon="edit" onClick={() => navigate(`/admin/partidos/${m.id}/alineacion`)}>Editar</Button> : null}
      </div>
      {view === 'cancha' ? <Pitch white={white} black={black} /> : <LineupList white={white} black={black} />}
    </>
  );
};

const Stats: React.FC<{ m: MatchView; data: AppData }> = ({ m, data }) => {
  const sideSum = (side: Side, f: (id: number) => number) => m.lineup[side].reduce((acc, id) => acc + f(id), 0);
  const assists = (side: Side) => m.events.filter((e) => e.type === 'assist' && e.team === side).length;
  const og = (side: Side) => m.events.filter((e) => e.type === 'own-goal' && e.credited === side).length;
  const avg = (side: Side) => (m.lineup[side].length ? sideSum(side, (id) => m.ratings.get(id) ?? 6) / m.lineup[side].length : 0);
  const ranked = bestRated(m).slice(0, 5);
  const goals = m.events.filter((e) => e.type === 'goal' || e.type === 'own-goal').map((e) => ({ side: e.credited, type: e.type }));
  return (
    <>
      <section className="vf-block vf-stack">
        <div className="vf-vshead"><TeamChip team="white" /><TeamChip team="black" /></div>
        <VersusBar label="Goles" white={m.white} black={m.black} />
        <VersusBar label="Asistencias" white={assists('white')} black={assists('black')} />
        <VersusBar label="Jugadores" white={m.lineup.white.length} black={m.lineup.black.length} />
        <VersusBar label="Autogoles a favor" white={og('white')} black={og('black')} />
        {m.lineup.white.length || m.lineup.black.length ? <VersusBar label="Rating medio" white={avg('white')} black={avg('black')} format={(v) => v.toFixed(1)} /> : null}
      </section>
      {ranked.length ? (
        <section className="vf-block">
          <SectionHeader title="Ratings del partido" overline="Calculado" />
          <ol className="vf-lblist">
            {ranked.map(([id, r], i) => {
              const c = m.counts.get(id);
              const sub = c ? [c.goals ? `${c.goals} gol${c.goals > 1 ? 'es' : ''}` : '', c.assists ? `${c.assists} asist.` : '', c.ownGoals ? `${c.ownGoals} a.g.` : ''].filter(Boolean).join(' · ') : '';
              return <LeaderboardRow key={id} rank={i + 1} name={data.nameOf(id)} team={m.sideOf.get(id)} value={r.toFixed(1)} sub={sub || undefined} />;
            })}
          </ol>
        </section>
      ) : null}
      {goals.length ? (
        <section className="vf-block">
          <SectionHeader title="Flujo del partido" overline="Quién iba ganando" right={<Pronto title="Con el minuto de cada gol, el eje pasa a ser el tiempo de juego" />} />
          <Momentum goals={goals} byOrder />
          <p className="vf-small vf-dim">Eje por orden de los goles; con minutos se verá contra el reloj.</p>
        </section>
      ) : null}
      <ProntoBox title="Disciplina" text="Amarillas y rojas por equipo, cuando el servidor tenga esos tipos de evento." />
    </>
  );
};

const Mvp: React.FC<{ m: MatchView; data: AppData }> = ({ m, data }) => {
  const candidates = bestRated(m).slice(0, 6);
  return (
    <ProntoBox title="¿Quién fue el MVP?" overline="Votación" text="Un voto por jugador, sin votarte a ti mismo. Necesita cuentas de jugador y que el servidor guarde los votos.">
      <div className="vf-votelist" role="radiogroup" aria-label="MVP">
        {candidates.map(([id]) => <VoteOption key={id} player={data.nameOf(id)} team={m.sideOf.get(id)} disabled />)}
      </div>
      <Button variant="primary" size="lg" block disabled>Votar</Button>
    </ProntoBox>
  );
};

export const PartidoDetalle: React.FC = () => {
  const { id } = useParams();
  const data = useAppData();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [sharing, setSharing] = useState(false);
  const m = useMemo(() => data.views.find((v) => v.id === Number(id)), [data.views, id]);
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab')! : 'resumen';

  if (!m) {
    return (
      <Shell header={false} nav={false}>
        <div className="vf-page">
          <TopBar title="Partido" onBack={() => navigate('/partidos')} backLabel="Volver a partidos" />
          <main className="vf-main">
            {data.loading ? <Skeleton shape="hero" /> : <StateView kind="error" title="No encontramos el partido" body="Puede que lo hayan borrado. Vuelve a la lista de partidos." action="Ver partidos" onAction={() => navigate('/partidos')} />}
          </main>
        </div>
      </Shell>
    );
  }

  const scorers = scorersOf(m, data.shortOf);

  return (
    <Shell header={false} nav={false}>
      <div className="vf-page">
        <TopBar title={`Partido #${m.id} · ${shortDate(m.date)}`} onBack={() => navigate('/partidos')} backLabel="Volver a partidos"
          right={!m.upcoming ? <IconButton icon="share" label="Compartir resultado" onClick={() => setSharing(true)} /> : undefined} />
        {m.upcoming ? (
          <main className="vf-main">
            <NextMatchCard date={shortDate(m.date)} time={time24(m.date)} venue={m.raw.venue ?? undefined} assigned={m.sideOf.size} />
            {isAdmin ? (
              <div className="vf-adminactions">
                <Button variant="primary" icon="whistle" onClick={() => navigate(`/admin/partidos/${m.id}/en-cancha`)}>Modo En cancha</Button>
                <Button variant="secondary" icon="scale" onClick={() => navigate(`/admin/armar/${m.id}`)}>Armar equipos</Button>
              </div>
            ) : null}
            <Alineaciones m={m} data={data} admin={isAdmin} />
          </main>
        ) : (
          <>
            <div className="vf-matchhead"><Scoreboard size="md" white={m.white} black={m.black} date={timeAndVenue(m.date, m.raw.venue)} /></div>
            <Tabs items={TABS} active={tab} label="Detalle del partido" onChange={(t) => setParams(t === 'resumen' ? {} : { tab: t }, { replace: true })} />
            <main className="vf-main" role="tabpanel">
              {tab === 'resumen' ? <Resumen m={m} data={data} /> : null}
              {tab === 'minutos' ? <Minutos m={m} data={data} /> : null}
              {tab === 'alineaciones' ? <Alineaciones m={m} data={data} admin={isAdmin} /> : null}
              {tab === 'stats' ? <Stats m={m} data={data} /> : null}
              {tab === 'mvp' ? <Mvp m={m} data={data} /> : null}
            </main>
          </>
        )}
      </div>
      {sharing ? (
        <ShareSheet title="Compartir resultado" fileName={`resultado-${m.id}`} onClose={() => setSharing(false)}
          data={{ variant: 'result', date: shortDate(m.date), white: m.white, black: m.black, sw: scorers.white, sb: scorers.black }} />
      ) : null}
    </Shell>
  );
};
