import type { Match, MatchEvent } from '../types';

export const TEAM_WHITE = 1;
export const TEAM_BLACK = 2;

const GOAL = 1;
const ASSIST = 2;
const OWN_GOAL = 3;

const goalsForTeam = (events: MatchEvent[], teamId: number, opponentTeamId: number): number => {
  const scored = events.filter((e) => e.eventTypeId === GOAL && e.teamId === teamId).length;
  const conceded = events.filter((e) => e.eventTypeId === OWN_GOAL && e.teamId === opponentTeamId).length;
  return scored + conceded;
};

export interface MatchScore {
  white: number;
  black: number;
}

export const matchScore = (match: Match): MatchScore => ({
  white: goalsForTeam(match.events ?? [], TEAM_WHITE, TEAM_BLACK),
  black: goalsForTeam(match.events ?? [], TEAM_BLACK, TEAM_WHITE),
});

export interface MatchEntry {
  playerId: number;
  playerName: string;
  teamId: number;
  positionName?: string;
  goals: number;
  assists: number;
  ownGoals: number;
}

export const matchEntries = (match: Match): MatchEntry[] => {
  return (match.matchPlayers ?? []).map((mp) => {
    const playerEvents = (match.events ?? []).filter((e) => e.playerId === mp.playerId);
    return {
      playerId: mp.playerId,
      playerName: mp.player ? `${mp.player.firstName} ${mp.player.lastName}` : '—',
      teamId: mp.teamId,
      positionName: mp.player?.position?.name,
      goals: playerEvents.filter((e) => e.eventTypeId === GOAL).length,
      assists: playerEvents.filter((e) => e.eventTypeId === ASSIST).length,
      ownGoals: playerEvents.filter((e) => e.eventTypeId === OWN_GOAL).length,
    };
  });
};

export const playerPrimaryTeam = (playerId: number, matches: Match[]): number | null => {
  const counts = new Map<number, number>();
  matches.forEach((m) => {
    (m.matchPlayers ?? []).forEach((mp) => {
      if (mp.playerId === playerId) {
        counts.set(mp.teamId, (counts.get(mp.teamId) ?? 0) + 1);
      }
    });
  });
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
};
