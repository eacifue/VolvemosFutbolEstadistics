export interface MatchEventSummaryDto {
  id: number;
  playerId: number;
  playerFullName: string;
  eventTypeId: number;
  eventTypeName: string;
  teamId: number;
}

export interface RecentMatchDto {
  id: number;
  matchDate: string;
  homeTeamId: number;
  awayTeamId: number;
  homeGoals: number;
  awayGoals: number;
  winner: 'Home' | 'Away' | 'Draw';
  events: MatchEventSummaryDto[];
}

export interface TopPlayerDto {
  playerId: number;
  firstName: string;
  lastName: string;
  teamName?: string;
  goals?: number;
  assists?: number;
  ownGoals?: number;
}

export interface TeamStatsDto {
  id: number;
  name: string;
  color: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface DashboardDto {
  totalMatches: number;
  whiteTeamWins: number;
  blackTeamWins: number;
  draws: number;
  whiteGoalsFor: number;
  blackGoalsFor: number;
  goalDifference: number;
  recentMatches: RecentMatchDto[];
  topScorers: TopPlayerDto[];
  topAssists: TopPlayerDto[];
  topOwnGoals: TopPlayerDto[];
  teamComparison: TeamStatsDto[];
}


export interface Position {
    id: number;
    name?: string;
}

export interface Player {
    id: number;
    firstName: string;
    lastName: string;
  teamId?: number;
  teamName?: string;
  team?: Team;
    positionId?: number;
    position?: Position;
  photoUrl?: string;
  avatarUrl?: string;
  imageUrl?: string;
  photo?: string;
  image?: string;
    goals: number;
    assists: number;
    matches: number;
    ownGoals: number;
    goalsPerGame: number;
    wins: number;
    losses: number;
    draws: number;
    goalStreak: number;
    noGoalStreak: number;
    createdAt: string;
    updatedAt: string;
}

export interface PlayerStatsDto {
    playerId: number;
    goals: number;
    assists: number;
    matches: number;
    ownGoals: number;
    goalsPerGame: number;
    wins: number;
    losses: number;
    draws: number;
    goalStreak: number;
    noGoalStreak: number;
}

export interface Team {
    id: number;
    name: string;
    color: string;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    createdAt: string;
    updatedAt: string;
}

export interface EventType {
    id: number;
    name?: string;
}

export interface MatchPlayer {
    id: number;
    matchId: number;
    playerId: number;
    player: Player;
    teamId: number;
    createdAt: string;
}

export interface MatchEvent {
    id: number;
    matchId: number;
    playerId: number;
    player: string;
    eventTypeId: number;
    eventType?: EventType;
    teamId: number;
    createdAt: string;
}

export interface Match {
    id: number;
    matchDate: string;
    homeTeamId?: number;
    awayTeamId?: number;
    homeTeam?: Team;
    awayTeam?: Team;
    matchPlayers: MatchPlayer[];
    events: MatchEvent[];
    createdAt: string;
    updatedAt: string;
}
