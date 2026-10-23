// Todo número de la app sale de aquí, derivado de partidos + alineaciones + eventos reales.
// Regla de negocio: un gol suma al equipo del jugador; un autogol suma al rival.
import type { Match, MatchEvent, Player } from '../types';
import { fullName, initialsOf, posShortOf, seasonOf, shortName, isSameDay, type PosShort } from './format';

export type Side = 'white' | 'black';
export type EvType = 'goal' | 'assist' | 'own-goal' | 'yellow' | 'red';
export type FormResult = 'V' | 'E' | 'P';

export const TEAM_ID: Record<Side, number> = { white: 1, black: 2 };
export const sideOfTeamId = (teamId?: number | null): Side => (teamId === 2 ? 'black' : 'white');
export const other = (s: Side): Side => (s === 'white' ? 'black' : 'white');

const EV_BY_ID: Record<number, EvType> = { 1: 'goal', 2: 'assist', 3: 'own-goal', 4: 'yellow', 5: 'red' };
export const EV_ID: Record<EvType, number> = { goal: 1, assist: 2, 'own-goal': 3, yellow: 4, red: 5 };
export const EV_LABEL: Record<EvType, string> = { goal: 'Gol', assist: 'Asistencia', 'own-goal': 'Autogol', yellow: 'Amarilla', red: 'Roja' };

export interface PlayerInfo {
  id: number;
  name: string;
  short: string;
  nick?: string;
  label: string; // apodo si tiene; si no, nombre corto. Es lo que sale en la cancha y en En cancha.
  initials: string;
  pos: string;
  posShort: PosShort;
  positionId?: number;
  raw: Player;
}

export const toInfo = (p: Player): PlayerInfo => ({
  id: p.id,
  name: fullName(p),
  short: shortName(p),
  nick: p.nickname?.trim() || undefined,
  label: p.nickname?.trim() || shortName(p),
  initials: initialsOf(p),
  pos: p.position?.name ?? '',
  posShort: posShortOf(p.position?.name),
  positionId: p.positionId ?? p.position?.id,
  raw: p,
});

export interface EventCountsData { goals: number; assists: number; ownGoals: number; yellow: number; red: number }
const emptyCounts = (): EventCountsData => ({ goals: 0, assists: 0, ownGoals: 0, yellow: 0, red: 0 });

export interface MatchEv {
  id: number;
  order: number;
  playerId: number;
  type: EvType;
  team: Side; // equipo del jugador en el partido
  credited: Side; // a quién suma (autogol = rival)
  assistId?: number; // goles: asistidor inferido
  assistEventId?: number;
  linkedGoalId?: number; // asistencias ligadas a un gol
}

export interface TimelineRow {
  key: string;
  side: Side;
  type: EvType;
  playerId: number;
  assistId?: number;
  eventIds: number[];
}

export interface MatchView {
  id: number;
  raw: Match;
  date: Date;
  season: string;
  upcoming: boolean;
  today: boolean;
  white: number;
  black: number;
  result: Side | 'draw';
  lineup: Record<Side, number[]>;
  sideOf: Map<number, Side>;
  events: MatchEv[];
  timeline: TimelineRow[];
  counts: Map<number, EventCountsData>;
  ratings: Map<number, number>;
}

const ordered = (events: MatchEvent[]): MatchEvent[] =>
  [...events].sort((a, b) => {
    const t = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return t !== 0 && !Number.isNaN(t) ? t : a.id - b.id;
  });

// Rating calculado (no hay rating en el backend): base 6, +1 gol, +0.7 asistencia, −1 autogol,
// +0.5 victoria, −0.3 derrota, −0.3 amarilla, −1 roja; entre 3 y 10.
export const RATING_HELP = 'Rating calculado: base 6, +1 por gol, +0.7 por asistencia, −1 por autogol, +0.5 si ganó, −0.3 si perdió.';
const matchRating = (c: EventCountsData, res: FormResult): number => {
  const r = 6 + c.goals + 0.7 * c.assists - c.ownGoals - 0.3 * c.yellow - c.red + (res === 'V' ? 0.5 : res === 'P' ? -0.3 : 0);
  return Math.round(Math.min(10, Math.max(3, r)) * 10) / 10;
};

export const resultFor = (m: Pick<MatchView, 'result'>, side: Side): FormResult =>
  m.result === 'draw' ? 'E' : m.result === side ? 'V' : 'P';

export const buildMatchView = (match: Match, now = new Date()): MatchView => {
  const date = new Date(match.matchDate);
  const sideOf = new Map<number, Side>();
  const lineup: Record<Side, number[]> = { white: [], black: [] };
  (match.matchPlayers ?? []).forEach((mp) => {
    const s = sideOfTeamId(mp.teamId);
    if (!sideOf.has(mp.playerId)) {
      sideOf.set(mp.playerId, s);
      lineup[s].push(mp.playerId);
    }
  });

  const events: MatchEv[] = ordered(match.events ?? []).map((e, i) => {
    const type = EV_BY_ID[e.eventTypeId] ?? 'goal';
    const team = sideOf.get(e.playerId) ?? sideOfTeamId(e.teamId);
    return { id: e.id, order: i, playerId: e.playerId, type, team, credited: type === 'own-goal' ? other(team) : team };
  });

  // Asistencia ligada al gol (inferida): una asistencia se asocia al último gol del mismo equipo
  // registrado antes y que aún no tenga asistidor. Así carga el modo En cancha (gol → asistencia).
  const pending: Record<Side, MatchEv[]> = { white: [], black: [] };
  events.forEach((e) => {
    if (e.type === 'goal') pending[e.team].push(e);
    if (e.type === 'assist') {
      const goal = [...pending[e.team]].reverse().find((g) => g.assistId == null && g.playerId !== e.playerId);
      if (goal) {
        goal.assistId = e.playerId;
        goal.assistEventId = e.id;
        e.linkedGoalId = goal.id;
      }
    }
  });

  let white = 0;
  let black = 0;
  const counts = new Map<number, EventCountsData>();
  const bump = (id: number) => {
    if (!counts.has(id)) counts.set(id, emptyCounts());
    return counts.get(id)!;
  };
  events.forEach((e) => {
    if (e.type === 'goal' || e.type === 'own-goal') {
      if (e.credited === 'white') white++;
      else black++;
    }
    const c = bump(e.playerId);
    if (e.type === 'goal') c.goals++;
    if (e.type === 'assist') c.assists++;
    if (e.type === 'own-goal') c.ownGoals++;
    if (e.type === 'yellow') c.yellow++;
    if (e.type === 'red') c.red++;
  });

  const timeline: TimelineRow[] = events
    .filter((e) => !(e.type === 'assist' && e.linkedGoalId != null))
    .map((e) => ({
      key: String(e.id),
      side: e.type === 'own-goal' ? e.credited : e.team,
      type: e.type,
      playerId: e.playerId,
      assistId: e.assistId,
      eventIds: e.assistEventId ? [e.id, e.assistEventId] : [e.id],
    }));

  const hasEvents = events.length > 0;
  const upcoming = date.getTime() > now.getTime() && !hasEvents;
  const result: Side | 'draw' = white > black ? 'white' : black > white ? 'black' : 'draw';

  const ratings = new Map<number, number>();
  if (!upcoming) {
    sideOf.forEach((s, id) => ratings.set(id, matchRating(counts.get(id) ?? emptyCounts(), resultFor({ result }, s))));
  }

  return { id: match.id, raw: match, date, season: seasonOf(date), upcoming, today: isSameDay(date, now), white, black, result, lineup, sideOf, events, timeline, counts, ratings };
};

export const scorersOf = (m: MatchView, short: (id: number) => string): Record<Side, string[]> => {
  const agg: Record<Side, Map<string, number>> = { white: new Map(), black: new Map() };
  m.events.forEach((e) => {
    if (e.type !== 'goal' && e.type !== 'own-goal') return;
    const key = e.type === 'own-goal' ? `a.g. ${short(e.playerId)}` : short(e.playerId);
    agg[e.credited].set(key, (agg[e.credited].get(key) ?? 0) + 1);
  });
  const fmt = (m2: Map<string, number>) => [...m2.entries()].map(([k, n]) => (n > 1 ? `${k} ×${n}` : k));
  return { white: fmt(agg.white), black: fmt(agg.black) };
};

/* ---------------- Jugadores ---------------- */

// La "Sequía" solo pica a quien tiene que meter goles: porteros y defensas no la sufren.
const expectedToScore = (info: PlayerInfo): boolean => info.posShort === 'MED' || info.posShort === 'DEL';

export interface FormEntry { matchId: number; res: FormResult; goals: number; conceded: number; side: Side; date: Date }

export interface PlayerStats {
  id: number;
  info: PlayerInfo;
  pj: number;
  g: number;
  a: number;
  og: number;
  w: number;
  d: number;
  l: number;
  ga: number;
  gpj: number;
  wp: number;
  rating: number | null;
  team: Side | null;
  whitePct: number;
  form: FormEntry[]; // cronológico
  streak: { kind: 'fire' | 'drought' | 'wall'; n: number } | null;
  goalStreak: number;
  noGoalStreak: number;
  splits: Record<Side, { pj: number; g: number; w: number; gc: number }>;
  // Portero. La posición es fija del jugador (no por partido) y si su equipo tuvo dos porteros
  // en un partido, los goles recibidos se le cuentan completos a ambos.
  isKeeper: boolean;
  gc: number; // goles recibidos por su equipo en los partidos que jugó
  gcpj: number;
  cleanSheets: number; // vallas invictas
  goalsPrevented: number; // (GC/PJ medio del grupo − su GC/PJ) × PJ; negativo = recibe más que el promedio
  wallStreak: number; // partidos seguidos (hasta hoy) recibiendo 2 o menos
}

export const WALL_MAX_CONCEDED = 2;
// % de victorias solo cuenta desde 10 partidos: con 1 partido ganado sería 100 % y no es justo con quien lleva 30.
export const WIN_PCT_MIN_PJ = 10;
export const PREVENTED_HELP = 'Goles evitados: cuántos goles menos recibió su equipo con él que el promedio del grupo por partido (GC/PJ medio − su GC/PJ, por partidos jugados).';

export const computePlayerStats = (infos: PlayerInfo[], views: MatchView[]): Map<number, PlayerStats> => {
  const played = views.filter((v) => !v.upcoming).sort((a, b) => a.date.getTime() - b.date.getTime());
  const out = new Map<number, PlayerStats>();
  // Goles que recibe un equipo por partido, en promedio, en todo el periodo (base de "goles evitados").
  const groupGcpj = played.length ? played.reduce((acc, m) => acc + m.white + m.black, 0) / (played.length * 2) : 0;
  infos.forEach((info) => {
    const s: PlayerStats = {
      id: info.id, info, pj: 0, g: 0, a: 0, og: 0, w: 0, d: 0, l: 0, ga: 0, gpj: 0, wp: 0, rating: null, team: null, whitePct: 50,
      form: [], streak: null, goalStreak: 0, noGoalStreak: 0,
      splits: { white: { pj: 0, g: 0, w: 0, gc: 0 }, black: { pj: 0, g: 0, w: 0, gc: 0 } },
      isKeeper: info.posShort === 'POR', gc: 0, gcpj: 0, cleanSheets: 0, goalsPrevented: 0, wallStreak: 0,
    };
    let ratingSum = 0;
    played.forEach((m) => {
      const side = m.sideOf.get(info.id);
      const c = m.counts.get(info.id);
      if (!side) {
        // Eventos sin alineación cuentan igual para goles/asistencias.
        if (c) { s.g += c.goals; s.a += c.assists; s.og += c.ownGoals; }
        return;
      }
      const res = resultFor(m, side);
      const goals = c?.goals ?? 0;
      const conceded = side === 'white' ? m.black : m.white;
      s.pj++;
      s.gc += conceded;
      if (conceded === 0) s.cleanSheets++;
      s.splits[side].gc += conceded;
      s.g += goals;
      s.a += c?.assists ?? 0;
      s.og += c?.ownGoals ?? 0;
      if (res === 'V') s.w++;
      if (res === 'E') s.d++;
      if (res === 'P') s.l++;
      s.splits[side].pj++;
      s.splits[side].g += goals;
      if (res === 'V') s.splits[side].w++;
      ratingSum += m.ratings.get(info.id) ?? 6;
      s.form.push({ matchId: m.id, res, goals, conceded, side, date: m.date });
    });
    s.ga = s.g + s.a;
    s.gpj = s.pj ? s.g / s.pj : 0;
    s.wp = s.pj ? Math.round((s.w / s.pj) * 100) : 0;
    s.gcpj = s.pj ? s.gc / s.pj : 0;
    s.goalsPrevented = s.pj ? Math.round((groupGcpj - s.gcpj) * s.pj) : 0;
    for (let i = s.form.length - 1; i >= 0 && s.form[i].conceded <= WALL_MAX_CONCEDED; i--) s.wallStreak++;
    s.rating = s.pj ? Math.round((ratingSum / s.pj) * 10) / 10 : null;
    const wpj = s.splits.white.pj;
    const bpj = s.splits.black.pj;
    s.team = s.pj ? (wpj >= bpj ? 'white' : 'black') : null;
    s.whitePct = s.pj ? Math.round((wpj / s.pj) * 100) : 50;
    for (let i = s.form.length - 1; i >= 0 && s.form[i].goals > 0; i--) s.goalStreak++;
    for (let i = s.form.length - 1; i >= 0 && s.form[i].goals === 0; i--) s.noGoalStreak++;
    if (s.isKeeper) s.streak = s.wallStreak >= 2 ? { kind: 'wall', n: s.wallStreak } : null;
    else if (s.goalStreak >= 2) s.streak = { kind: 'fire', n: s.goalStreak };
    else if (s.noGoalStreak >= 3 && expectedToScore(info)) s.streak = { kind: 'drought', n: s.noGoalStreak };
    out.set(info.id, s);
  });
  return out;
};

/* ---------------- Rivalidad ---------------- */

export interface TeamRecord { white: number; draws: number; black: number; gfWhite: number; gfBlack: number; formWhite: FormResult[]; formBlack: FormResult[]; played: number }

export const teamRecord = (views: MatchView[]): TeamRecord => {
  const played = views.filter((v) => !v.upcoming).sort((a, b) => a.date.getTime() - b.date.getTime());
  const r: TeamRecord = { white: 0, draws: 0, black: 0, gfWhite: 0, gfBlack: 0, formWhite: [], formBlack: [], played: played.length };
  played.forEach((m) => {
    r.gfWhite += m.white;
    r.gfBlack += m.black;
    if (m.result === 'white') r.white++;
    else if (m.result === 'black') r.black++;
    else r.draws++;
  });
  const last = played.slice(-5);
  r.formWhite = last.map((m) => resultFor(m, 'white'));
  r.formBlack = last.map((m) => resultFor(m, 'black'));
  return r;
};

/* ---------------- Socios, duplas y cara a cara ---------------- */

export const assistPairs = (views: MatchView[]): Map<string, number> => {
  const pairs = new Map<string, number>();
  views.forEach((m) => m.events.forEach((e) => {
    if (e.type === 'goal' && e.assistId != null) {
      const k = `${e.assistId}>${e.playerId}`;
      pairs.set(k, (pairs.get(k) ?? 0) + 1);
    }
  }));
  return pairs;
};

export interface Partners {
  bestAssister?: { id: number; n: number };
  assistsMostTo?: { id: number; n: number };
  winsMostWith?: { id: number; w: number; pj: number };
}

export const partnersOf = (playerId: number, views: MatchView[]): Partners => {
  const pairs = assistPairs(views);
  const res: Partners = {};
  pairs.forEach((n, k) => {
    const [from, to] = k.split('>').map(Number);
    if (to === playerId && (!res.bestAssister || n > res.bestAssister.n)) res.bestAssister = { id: from, n };
    if (from === playerId && (!res.assistsMostTo || n > res.assistsMostTo.n)) res.assistsMostTo = { id: to, n };
  });
  const together = new Map<number, { w: number; pj: number }>();
  views.filter((m) => !m.upcoming).forEach((m) => {
    const side = m.sideOf.get(playerId);
    if (!side) return;
    const won = m.result === side;
    m.lineup[side].forEach((mate) => {
      if (mate === playerId) return;
      const t = together.get(mate) ?? { w: 0, pj: 0 };
      t.pj++;
      if (won) t.w++;
      together.set(mate, t);
    });
  });
  together.forEach((t, id) => {
    if (t.pj < 3) return;
    const cur = res.winsMostWith;
    if (!cur || t.w / t.pj > cur.w / cur.pj || (t.w / t.pj === cur.w / cur.pj && t.pj > cur.pj)) res.winsMostWith = { id, ...t };
  });
  return res;
};

export const headToHead = (a: number, b: number, views: MatchView[]) => {
  const r = { a: 0, draws: 0, b: 0, n: 0 };
  views.filter((m) => !m.upcoming).forEach((m) => {
    const sa = m.sideOf.get(a);
    const sb = m.sideOf.get(b);
    if (!sa || !sb || sa === sb) return;
    r.n++;
    if (m.result === 'draw') r.draws++;
    else if (m.result === sa) r.a++;
    else r.b++;
  });
  return r;
};

/* ---------------- Curiosidades del Inicio ---------------- */

export interface Insight { kind: 'fire' | 'drought' | 'duo' | 'shame'; title: string; text: string; value: number }

export const insightsOf = (stats: PlayerStats[], views: MatchView[], nameOf: (id: number) => string, shortOf: (id: number) => string): Insight[] => {
  const out: Insight[] = [];
  const fire = [...stats].filter((s) => s.goalStreak >= 2).sort((a, b) => b.goalStreak - a.goalStreak)[0];
  if (fire) out.push({ kind: 'fire', title: 'Racha de fuego', text: `${fire.info.name} lleva ${fire.goalStreak} partidos seguidos marcando.`, value: fire.goalStreak });
  let duo: { k: string; n: number } | null = null;
  assistPairs(views).forEach((n, k) => { if (n >= 2 && (!duo || n > duo.n)) duo = { k, n }; });
  if (duo) {
    const { k, n } = duo as { k: string; n: number };
    const [from, to] = k.split('>').map(Number);
    out.push({ kind: 'duo', title: 'Dupla letal', text: `${shortOf(from)} → ${shortOf(to)}: ${n} asistencias.`, value: n });
  }
  const drought = [...stats].filter((s) => s.noGoalStreak >= 3 && expectedToScore(s.info)).sort((a, b) => b.noGoalStreak - a.noGoalStreak)[0];
  if (drought) out.push({ kind: 'drought', title: 'Sequía', text: `${nameOf(drought.id)} lleva ${drought.noGoalStreak} partidos sin gol.`, value: drought.noGoalStreak });
  return out;
};

/* ---------------- Logros ---------------- */

export interface Achievement { id: string; group: 'Goles' | 'Arco' | 'Rachas' | 'Vergüenza'; name: string; desc: string; glyph: string; unlocked: boolean; count?: number; progress?: number; shame?: boolean; soon?: boolean }

export const achievementsOf = (s: PlayerStats, views: MatchView[]): Achievement[] => {
  const perMatch = views.filter((m) => !m.upcoming).map((m) => m.counts.get(s.id)?.goals ?? 0);
  const hat = perMatch.filter((g) => g >= 3).length;
  const poker = perMatch.filter((g) => g >= 4).length;
  let fireRuns = 0;
  let run = 0;
  let unbeaten = 0;
  let bestUnbeaten = 0;
  s.form.forEach((f) => {
    run = f.goals > 0 ? run + 1 : 0;
    if (run === 3) fireRuns++;
    unbeaten = f.res === 'P' ? 0 : unbeaten + 1;
    bestUnbeaten = Math.max(bestUnbeaten, unbeaten);
  });
  const mvp3: Achievement = { id: 'mvp3', group: 'Rachas', name: 'MVP ×3', desc: 'Elegido tres veces', glyph: 'star', unlocked: false, soon: true };
  const unbeaten5: Achievement = { id: 'inv', group: 'Rachas', name: 'Invicto ×5', desc: '5 sin perder', glyph: 'shield', unlocked: bestUnbeaten >= 5, progress: bestUnbeaten >= 5 ? undefined : bestUnbeaten / 5 };
  const stone: Achievement = { id: 'stone', group: 'Vergüenza', name: 'Mano de piedra', desc: s.og ? `${s.og} autogol${s.og > 1 ? 'es' : ''}` : 'Primer autogol', glyph: 'own', unlocked: s.og > 0, count: s.og, shame: true };
  const tronco: Achievement = { id: 'tronco', group: 'Vergüenza', name: 'Tronco ×3', desc: 'Votado tronco 3 veces', glyph: 'T', unlocked: false, shame: true, soon: true };
  if (s.isKeeper) return keeperAchievements(s, [unbeaten5, mvp3], [stone, tronco]);

  const goalsBadge = (n: number, name: string, desc: string): Achievement => ({
    id: `g${n}`, group: 'Goles', name, desc: s.g >= n ? desc : `Faltan ${n - s.g}`, glyph: String(n), unlocked: s.g >= n, progress: s.g >= n ? undefined : s.g / n,
  });
  return [
    { id: 'g1', group: 'Goles', name: 'Primer gol', desc: 'Abriste la cuenta', glyph: '1', unlocked: s.g >= 1 },
    goalsBadge(10, '10 goles', 'Doble dígito'),
    goalsBadge(25, '25 goles', 'Un cuarto de centenar'),
    goalsBadge(50, '50 goles', 'Medio centenar'),
    { id: 'hat', group: 'Goles', name: 'Hat-trick', desc: '3 en un partido', glyph: '3', unlocked: hat > 0, count: hat },
    { id: 'poker', group: 'Goles', name: 'Póker', desc: '4 en un partido', glyph: '4', unlocked: poker > 0, count: poker },
    { id: 'fire', group: 'Rachas', name: 'Racha de fuego', desc: '3 seguidos marcando', glyph: 'fire', unlocked: fireRuns > 0, count: fireRuns },
    unbeaten5,
    mvp3,
    stone,
    tronco,
  ];
};

// Arqueros: el grupo "Goles" no les aplica, así que se cambia por "Arco" (vallas, Muro, goles evitados, partidos
// bajo los palos) y en Vergüenza se suma el "Colador" (8 o más recibidos en un partido).
const COLADOR = 8;
const keeperAchievements = (s: PlayerStats, rachas: Achievement[], shame: Achievement[]): Achievement[] => {
  let wallRuns = 0;
  let run = 0;
  let bestWall = 0;
  s.form.forEach((f) => {
    run = f.conceded <= WALL_MAX_CONCEDED ? run + 1 : 0;
    if (run === 3) wallRuns++;
    bestWall = Math.max(bestWall, run);
  });
  const colador = s.form.filter((f) => f.conceded >= COLADOR).length;
  const progress = (value: number, goal: number) => (value >= goal ? undefined : Math.max(0, value) / goal);
  const missing = (value: number, goal: number, done: string, unit: string) => (value >= goal ? done : `Faltan ${goal - Math.max(0, value)} ${unit}`);
  const matchesBadge = (n: number, done: string): Achievement => ({
    id: `pj${n}`, group: 'Arco', name: `${n} bajo los palos`, desc: missing(s.pj, n, done, 'partidos'), glyph: String(n), unlocked: s.pj >= n, progress: progress(s.pj, n),
  });
  const preventedBadge = (n: number, done: string): Achievement => ({
    id: `ev${n}`, group: 'Arco', name: `+${n} evitados`, desc: missing(s.goalsPrevented, n, done, 'goles'), glyph: `+${n}`, unlocked: s.goalsPrevented >= n, progress: progress(s.goalsPrevented, n),
  });
  return [
    { id: 'cs1', group: 'Arco', name: 'Valla invicta', desc: 'Un partido sin recibir gol', glyph: '0', unlocked: s.cleanSheets > 0, count: s.cleanSheets },
    { id: 'wall3', group: 'Arco', name: 'Muro ×3', desc: `3 seguidos con ${WALL_MAX_CONCEDED} o menos`, glyph: 'shield', unlocked: wallRuns > 0, count: wallRuns, progress: wallRuns > 0 ? undefined : bestWall / 3 },
    preventedBadge(10, 'Diez goles menos que el promedio'),
    preventedBadge(25, 'Un cuarto de centenar atajado'),
    matchesBadge(10, 'Ya es fijo en el arco'),
    matchesBadge(25, 'Dueño del arco'),
    ...rachas,
    shame[0],
    { id: 'colador', group: 'Vergüenza', name: 'Colador', desc: `${COLADOR} o más recibidos en un partido`, glyph: String(COLADOR), unlocked: colador > 0, count: colador, shame: true },
    shame[1],
  ];
};

/* ---------------- Equilibrar equipos ---------------- */

export interface BalanceInput { id: number; rating: number; posShort: PosShort }

const sum = (list: { rating: number }[]) => list.reduce((acc, p) => acc + p.rating, 0);
export const avgRating = (list: { rating: number }[]) => (list.length ? sum(list) / list.length : 0);

// Reparte minimizando la diferencia de rating medio, con un portero por lado cuando hay dos.
export const balanceTeams = (pool: BalanceInput[]): Record<Side, number[]> => {
  const gks = pool.filter((p) => p.posShort === 'POR').sort((a, b) => b.rating - a.rating);
  const rest = pool.filter((p) => !gks.slice(0, 2).includes(p)).sort((a, b) => b.rating - a.rating);
  let w: BalanceInput[] = gks[0] ? [gks[0]] : [];
  let b: BalanceInput[] = gks[1] ? [gks[1]] : [];
  rest.forEach((p) => {
    const target = w.length < b.length ? w : b.length < w.length ? b : sum(w) <= sum(b) ? w : b;
    target.push(p);
  });
  const lockedW = gks[0]?.id;
  const lockedB = gks[1]?.id;
  const diff = (x: BalanceInput[], y: BalanceInput[]) => Math.abs(avgRating(x) - avgRating(y));
  for (let pass = 0; pass < 50; pass++) {
    let best = diff(w, b);
    let swapI = -1;
    let swapJ = -1;
    for (let i = 0; i < w.length; i++) {
      for (let j = 0; j < b.length; j++) {
        if (w[i].id === lockedW || b[j].id === lockedB) continue;
        const nw = [...w];
        const nb = [...b];
        nw[i] = b[j];
        nb[j] = w[i];
        const d = diff(nw, nb);
        if (d < best - 1e-9) {
          best = d;
          swapI = i;
          swapJ = j;
        }
      }
    }
    if (swapI < 0) break;
    const nw = [...w];
    const nb = [...b];
    nw[swapI] = b[swapJ];
    nb[swapJ] = w[swapI];
    w = nw;
    b = nb;
  }
  return { white: w.map((p) => p.id), black: b.map((p) => p.id) };
};

export const DEFAULT_RATING = 6;
