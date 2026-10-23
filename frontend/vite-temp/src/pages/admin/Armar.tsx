import React, { useEffect, useId, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../data/context';
import { Shell } from '../../components/Shell';
import { Button, FilterChip, SectionHeader, Skeleton, StateView, TeamBalance, TextField, TopBar, type BalancePlayer } from '../../components/vaf';
import { addPlayerToMatch, createMatch, getVenues, removePlayerFromMatch, updateMatch } from '../../services/api';
import { emitStatsRefresh } from '../../services/refreshBus';
import { normalize, toLocalInputDate, toLocalInputTime } from '../../lib/format';
import { avgRating, balanceTeams, DEFAULT_RATING, TEAM_ID, type MatchView, type Side } from '../../lib/stats';
import { useToast } from '../../lib/toast';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';

const nextThursday = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
  d.setHours(20, 0, 0, 0);
  return d;
};

// Monta el formulario cuando ya hay datos, para que un partido existente arranque con su fecha y equipos.
export const Armar: React.FC = () => {
  const { id } = useParams();
  const data = useAppData();
  const navigate = useNavigate();
  const existing = id ? data.views.find((v) => v.id === Number(id)) : undefined;
  if (data.loading) {
    return (
      <Shell header={false} nav={false}>
        <div className="vf-page"><TopBar title="Armar partido" /><main className="vf-main"><Skeleton shape="row" count={6} /></main></div>
      </Shell>
    );
  }
  if (id && !existing) {
    return (
      <Shell header={false} nav={false}>
        <div className="vf-page"><TopBar title="Armar partido" /><main className="vf-main"><StateView kind="error" title="No encontramos el partido" action="Volver" onAction={() => navigate('/admin?tab=partidos')} /></main></div>
      </Shell>
    );
  }
  return <ArmarForm key={existing?.id ?? 'nuevo'} existing={existing} />;
};

const ArmarForm: React.FC<{ existing?: MatchView }> = ({ existing }) => {
  const data = useAppData();
  const navigate = useNavigate();
  const toast = useToast();
  const start = existing?.date ?? nextThursday();

  const [date, setDate] = useState(toLocalInputDate(start));
  const [time, setTime] = useState(toLocalInputTime(start));
  const [venue, setVenue] = useState(existing?.raw.venue ?? '');
  const [venues, setVenues] = useState<string[]>([]);
  const venueList = useId();

  // Canchas ya usadas para autocompletar; si falla, el campo sigue siendo texto libre.
  useEffect(() => {
    let alive = true;
    getVenues().then((v) => alive && setVenues(v)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  const [teams, setTeams] = useState<Map<number, Side>>(() => new Map(existing ? [...existing.sideOf.entries()] : []));
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [dateError, setDateError] = useState<string | undefined>();

  const rating = (pid: number) => data.stats.get(pid)?.rating ?? DEFAULT_RATING;
  const toBal = (pid: number): BalancePlayer => ({ id: pid, short: data.shortOf(pid), posShort: data.info(pid)?.posShort ?? 'MED', rating: rating(pid) });
  const order = { POR: 0, DEF: 1, MED: 2, DEL: 3 } as Record<string, number>;
  const side = (s: Side) => [...teams.entries()].filter(([, t]) => t === s).map(([pid]) => toBal(pid)).sort((a, b) => order[a.posShort] - order[b.posShort] || b.rating - a.rating);
  const white = side('white');
  const black = side('black');

  const pool = useMemo(() => data.infos.filter((i) => !q.trim() || normalize(i.name).includes(normalize(q.trim()))), [data.infos, q]);

  const toggle = (pid: number) => {
    setTeams((prev) => {
      const next = new Map(prev);
      if (next.has(pid)) next.delete(pid);
      else {
        const w = [...next.values()].filter((t) => t === 'white').length;
        next.set(pid, w <= next.size - w ? 'white' : 'black');
      }
      return next;
    });
  };

  const balance = () => {
    const res = balanceTeams([...teams.keys()].map((pid) => ({ id: pid, rating: rating(pid), posShort: data.info(pid)?.posShort ?? 'MED' })));
    setTeams(new Map([...res.white.map((pid) => [pid, 'white'] as const), ...res.black.map((pid) => [pid, 'black'] as const)]));
    toast({ tone: 'info', message: 'Equipos equilibrados', detail: 'Repartimos por rating, con un portero por lado si hay dos.' });
  };

  const publish = async () => {
    const when = new Date(`${date}T${time || '20:00'}`);
    if (!date || Number.isNaN(when.getTime())) {
      setDateError('Elige la fecha del partido.');
      return;
    }
    setDateError(undefined);
    setBusy(true);
    try {
      let matchId = existing?.id;
      const iso = `${date}T${time || '20:00'}:00`; // hora local, igual que el gestor anterior
      const payload = { matchDate: iso, homeTeamId: TEAM_ID.white, awayTeamId: TEAM_ID.black, venue: venue.trim() };
      if (matchId) await updateMatch(matchId, payload);
      else {
        const created = (await createMatch(payload)) as { id: number };
        matchId = created.id;
      }
      const before = existing?.sideOf ?? new Map<number, Side>();
      for (const [pid, s] of before) {
        if (teams.get(pid) !== s) await removePlayerFromMatch(matchId!, pid);
      }
      for (const [pid, s] of teams) {
        if (before.get(pid) !== s) await addPlayerToMatch({ matchId, playerId: pid, teamId: TEAM_ID[s] });
      }
      toast({ tone: 'success', message: existing ? 'Partido actualizado' : 'Partido creado', detail: teams.size ? `${white.length} en Blanco y ${black.length} en Negro.` : 'Ya puedes repartir los equipos cuando quieras.' });
      emitStatsRefresh();
      navigate(`/admin/partidos/${matchId}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', message: 'No se publicó el partido', detail: getFriendlyErrorMessage(err, 'Revisa la conexión y vuelve a intentarlo.') });
    } finally {
      setBusy(false);
    }
  };

  const gk = (list: BalancePlayer[]) => list.filter((p) => p.posShort === 'POR').length;

  return (
    <Shell header={false} nav={false}>
      <div className="vf-page">
        <TopBar title={existing ? 'Fecha y equipos' : 'Armar partido'} />
        <main className="vf-main vf-main--pad-bottom">
          <div className="vf-form2">
            <TextField label="Fecha" type="date" icon="matches" value={date} onChange={(e) => setDate(e.target.value)} error={dateError} required />
            <TextField label="Hora" type="time" icon="clock" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <TextField label="Cancha" icon="pin" placeholder="Cancha La Paz, Envigado" maxLength={120} autoComplete="off" list={venueList} value={venue} onChange={(e) => setVenue(e.target.value)} />
          <datalist id={venueList}>{venues.map((v) => <option key={v} value={v} />)}</datalist>

          <section className="vf-block">
            <SectionHeader title="Convocados" overline={`${teams.size} de ${data.infos.length}`} />
            <TextField icon="search" type="search" placeholder="Buscar jugador" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar jugador para convocar" />
            <div className="vf-pickgrid" role="group" aria-label="Convocar jugadores">
              {pool.map((i) => <FilterChip key={i.id} selected={teams.has(i.id)} onClick={() => toggle(i.id)}>{i.short}</FilterChip>)}
            </div>
            <p className="vf-small vf-dim">La confirmación de cada jugador (Voy / Tal vez / No voy) llega pronto; por ahora convocas tú.</p>
          </section>

          <div className="vf-sechead">
            <div><span className="vf-overline">{teams.size} convocados</span><h2 className="vf-sechead__title">Equipos</h2></div>
            <Button variant="primary" icon="scale" onClick={balance} disabled={teams.size < 2}>Equilibrar</Button>
          </div>
          <TeamBalance white={white} black={black} ratingW={avgRating(white)} ratingB={avgRating(black)}
            onMove={(pid, to) => setTeams((prev) => new Map(prev).set(pid, to))} />
          <p className="vf-small vf-dim">
            Los equipos son fijos: solo se reparte la gente. {gk(white) !== 1 || gk(black) !== 1 ? 'Ojo: lo ideal es 1 portero por lado.' : '1 portero por lado.'}
          </p>
          <Button variant="primary" size="lg" block loading={busy ? 'Publicando…' : false} onClick={() => void publish()}>{existing ? 'Guardar cambios' : 'Publicar equipos'}</Button>
        </main>
      </div>
    </Shell>
  );
};
