import type { Match, MatchEvent, Player } from '../types';

export type GoalkeeperStats = {
  goalsConceded: number;
  matchesPlayed: number;
  avgGoalsConceded: number;
};

const GOAL_EVENT_ID = 1;

const getPositionName = (player: Player): string => {
  const value = player.position;
  if (typeof value === 'string') {
    return value;
  }

  return value?.name ?? '';
};

export const isGoalkeeperPlayer = (player: Player): boolean => {
  const normalized = getPositionName(player).trim().toLowerCase();
  return normalized === 'arquero' || normalized === 'portero' || normalized === 'goalkeeper';
};

const getScoreFromEvents = (events: MatchEvent[] | undefined, teamId: number): number => {
  if (!Array.isArray(events)) {
    return 0;
  }

  return events.filter((event) => event?.teamId === teamId && event?.eventTypeId === GOAL_EVENT_ID).length;
};

const roundToTwo = (value: number): number => Number(value.toFixed(2));

export const getGoalkeeperStats = (player: Player, matches: Match[]): GoalkeeperStats => {
  if (!isGoalkeeperPlayer(player) || !Array.isArray(matches) || matches.length === 0) {
    return { goalsConceded: 0, matchesPlayed: 0, avgGoalsConceded: 0 };
  }

  let goalsConceded = 0;
  let matchesPlayed = 0;

  for (const match of matches) {
    const roster = Array.isArray(match?.matchPlayers) ? match.matchPlayers : [];
    const playerInMatch = roster.find((entry) => entry?.playerId === player.id);

    if (!playerInMatch) {
      continue;
    }

    const rawHomeScore = Number((match as unknown as { homeScore?: number }).homeScore);
    const rawAwayScore = Number((match as unknown as { awayScore?: number }).awayScore);

    const homeScore = Number.isFinite(rawHomeScore) ? rawHomeScore : getScoreFromEvents(match.events, 1);
    const awayScore = Number.isFinite(rawAwayScore) ? rawAwayScore : getScoreFromEvents(match.events, 2);

    matchesPlayed += 1;

    if (playerInMatch.teamId === 1) {
      goalsConceded += awayScore;
    } else if (playerInMatch.teamId === 2) {
      goalsConceded += homeScore;
    }
  }

  const avgGoalsConceded = matchesPlayed > 0 ? roundToTwo(goalsConceded / matchesPlayed) : 0;

  return {
    goalsConceded,
    matchesPlayed,
    avgGoalsConceded,
  };
};
