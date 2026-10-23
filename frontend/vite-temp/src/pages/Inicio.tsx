import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../data/context';
import { InstallSheet } from '../components/InstallSheet';
import { Shell } from '../components/Shell';
import {
  Button, FormChips, Icon, IconButton, InsightRow, LeaderCard, NextMatchCard, RivalryBar, Scoreboard, SectionHeader, ShareSheet, Skeleton, StateView, Streak, TeamChip,
} from '../components/vaf';
import { dateTime, relativeDay, shortDate, time24 } from '../lib/format';
import { useInstallPrompt } from '../lib/install';
import { insightsOf, scorersOf } from '../lib/stats';

export const Inicio: React.FC = () => {
  const data = useAppData();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sharing, setSharing] = useState(false);
  const [installing, setInstalling] = useState(false);
  const installPrompt = useInstallPrompt();

  const played = data.views.filter((v) => !v.upcoming);
  const last = played[0];
  const next = [...data.views].filter((v) => v.upcoming).sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  const stats = useMemo(() => [...data.stats.values()], [data.stats]);

  const leaders = useMemo(() => {
    const withPj = stats.filter((s) => s.pj > 0);
    // "Ganador" exige haber jugado al menos el 30 % de lo que jugó el que más tiene (mínimo 3),
    // para que no gane alguien con 100 % en dos o tres partidos.
    const maxPj = Math.max(0, ...withPj.map((s) => s.pj));
    const minPj = Math.min(maxPj, Math.max(3, Math.ceil(maxPj * 0.3)));
    const top = <K extends 'g' | 'a' | 'wp'>(k: K, pool = withPj) => [...pool].sort((a, b) => b[k] - a[k] || b.pj - a.pj)[0];
    return { scorer: top('g'), assist: top('a'), winner: top('wp', withPj.filter((s) => s.pj >= minPj)) };
  }, [stats]);

  const insights = useMemo(() => insightsOf(stats, data.views, data.nameOf, data.shortOf), [stats, data.views, data.nameOf, data.shortOf]);
  const fire = stats.filter((s) => s.goalStreak >= 2).sort((a, b) => b.goalStreak - a.goalStreak)[0];

  if (data.loading) {
    return (
      <Shell>
        <main className="vf-main"><Skeleton shape="hero" /><Skeleton shape="match" count={2} /><Skeleton shape="row" count={4} /></main>
      </Shell>
    );
  }

  if (data.error) {
    return (
      <Shell>
        <main className="vf-main"><StateView kind="error" title="Se nos cayó el balón" body={data.error} action="Reintentar" onAction={() => void data.refetch()} /></main>
      </Shell>
    );
  }

  const scorers = last ? scorersOf(last, data.shortOf) : null;

  return (
    <Shell>
      <main className="vf-main">
        {last && scorers ? (
          <section className="vf-hero" aria-label="Último partido">
            <div className="vf-hero__over">
              <span className="vf-overline">Último partido · {relativeDay(last.date)}</span>
              <IconButton icon="share" label="Compartir resultado" onClick={() => setSharing(true)} />
            </div>
            <Scoreboard size="hero" white={last.white} black={last.black} date={dateTime(last.date)} scorers={scorers} />
            {fire ? <Streak kind="fire" n={fire.goalStreak} name={fire.info.name} /> : null}
            <Button variant="ghost" size="sm" iconRight="chevron" onClick={() => navigate(`/partidos/${last.id}`)}>Ver el partido</Button>
          </section>
        ) : (
          <StateView kind="empty" title="Todavía no hay partidos" body="Cuando el admin cargue el primer Blanco vs Negro, aquí verás el marcador y quién la rompió."
            action={isAdmin ? 'Crear partido' : undefined} onAction={() => navigate('/admin/armar')} />
        )}

        {next ? (
          <NextMatchCard date={shortDate(next.date)} time={time24(next.date)} venue={next.raw.venue ?? undefined} assigned={next.sideOf.size} teamsReady={next.lineup.white.length > 0 && next.lineup.black.length > 0}
            onLineups={() => navigate(`/partidos/${next.id}?tab=alineaciones`)} />
        ) : null}

        {installPrompt.available ? (
          <ul className="vf-insights">
            <li>
              <button type="button" className="vf-insight vf-insight--btn" onClick={() => setInstalling(true)}>
                <span className="vf-insight__icon" aria-hidden="true"><Icon name="phone" size={20} /></span>
                <span className="vf-insight__body"><span className="vf-insight__title">Instala la app</span><span className="vf-insight__text">El marcador a un toque, sin buscar el link en el chat.</span></span>
              </button>
            </li>
          </ul>
        ) : null}

        {data.record.played ? (
          <section className="vf-block">
            <SectionHeader title="La rivalidad" action="Historial" onAction={() => navigate('/partidos')} />
            <RivalryBar white={data.record.white} draws={data.record.draws} black={data.record.black} gfWhite={data.record.gfWhite} gfBlack={data.record.gfBlack} />
            <div className="vf-formrow">
              <span className="vf-formrow__lab"><TeamChip team="white" size="sm" label="short" /></span>
              <FormChips results={data.record.formWhite} size="sm" label="Forma Blanco" />
              <FormChips results={data.record.formBlack} size="sm" label="Forma Negro" />
              <span className="vf-formrow__lab"><TeamChip team="black" size="sm" label="short" /></span>
            </div>
          </section>
        ) : null}

        {leaders.scorer ? (
          <section className="vf-block">
            <SectionHeader title="Líderes" action="Ver ranking" onAction={() => navigate('/ranking')} />
            <div className="vf-leaders">
              <LeaderCard title="Pichichi" stats={leaders.scorer} value={leaders.scorer.g} unit="goles" onClick={() => navigate(`/jugadores/${leaders.scorer.id}`)} />
              {leaders.assist ? <LeaderCard title="Asistidor" stats={leaders.assist} value={leaders.assist.a} unit="asist." onClick={() => navigate(`/jugadores/${leaders.assist.id}`)} /> : null}
              {leaders.winner ? <LeaderCard title="Ganador" stats={leaders.winner} value={`${leaders.winner.wp}%`} unit="vic." onClick={() => navigate(`/jugadores/${leaders.winner.id}`)} /> : null}
            </div>
          </section>
        ) : null}

        {insights.length ? (
          <section className="vf-block">
            <SectionHeader title="Rachas y curiosidades" />
            <ul className="vf-insights">{insights.map((i) => <InsightRow key={i.kind} kind={i.kind} title={i.title} text={i.text} value={i.value} />)}</ul>
          </section>
        ) : null}
      </main>

      {sharing && last && scorers ? (
        <ShareSheet title="Compartir resultado" fileName={`resultado-${last.id}`} onClose={() => setSharing(false)}
          data={{ variant: 'result', date: shortDate(last.date), white: last.white, black: last.black, sw: scorers.white, sb: scorers.black }} />
      ) : null}
      {installing ? <InstallSheet onClose={() => setInstalling(false)} /> : null}
    </Shell>
  );
};
