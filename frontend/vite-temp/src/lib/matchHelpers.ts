import type { AppData } from '../data/context';
import type { PitchPlayer } from '../components/vaf/pitch';
import type { TimelineEntry } from '../components/vaf/events';
import type { MatchView, Side } from './stats';

// Posiciones compartidas: vienen del servidor (pitchX/pitchY); sin posición se ubica por línea.
export const pitchPlayers = (m: MatchView, side: Side, data: AppData): PitchPlayer[] => {
  const spot = new Map((m.raw.matchPlayers ?? []).map((mp) => [mp.playerId, mp]));
  return m.lineup[side].map((id) => {
    const i = data.info(id);
    const c = m.counts.get(id);
    return {
      id,
      name: i?.name ?? 'Jugador',
      short: i?.label ?? 'Jugador',
      initials: i?.initials ?? '?',
      posShort: i?.posShort ?? 'MED',
      events: c ? { goals: c.goals, assists: c.assists, ownGoals: c.ownGoals, yellow: c.yellow, red: c.red } : undefined,
      x: spot.get(id)?.pitchX ?? undefined,
      y: spot.get(id)?.pitchY ?? undefined,
    };
  });
};

export const timelineOf = (m: MatchView, data: AppData): TimelineEntry[] =>
  m.timeline.map((r) => ({ key: r.key, side: r.side, type: r.type, player: data.shortOf(r.playerId), assist: r.assistId != null ? data.shortOf(r.assistId) : undefined }));

export const lastNameOf = (data: AppData, id: number): string => {
  const raw = data.info(id)?.raw;
  return raw?.lastName.trim().split(/\s+/)[0] || data.shortOf(id);
};
