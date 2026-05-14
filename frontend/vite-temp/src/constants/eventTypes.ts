import type { MatchEvent } from '../types';

export const EVENT_TYPE_IDS = {
  goal: 1,
  assist: 2,
  ownGoal: 3,
} as const;

export type EventTypeId = typeof EVENT_TYPE_IDS[keyof typeof EVENT_TYPE_IDS];

export const isOwnGoalEvent = (event: Pick<MatchEvent, 'eventTypeId'>): boolean => {
  return event.eventTypeId === EVENT_TYPE_IDS.ownGoal;
};

export const isGoalForTeam = (
  event: Pick<MatchEvent, 'eventTypeId' | 'teamId'>,
  teamId: number,
  opponentTeamId?: number,
): boolean => {
  if (event.eventTypeId === EVENT_TYPE_IDS.goal) {
    return event.teamId === teamId;
  }

  if (event.eventTypeId === EVENT_TYPE_IDS.ownGoal) {
    if (typeof opponentTeamId === 'number') {
      return event.teamId === opponentTeamId;
    }

    return event.teamId !== teamId;
  }

  return false;
};

export const getEventTypeLabelById = (eventTypeId: number): string => {
  if (eventTypeId === EVENT_TYPE_IDS.goal) return 'Gol';
  if (eventTypeId === EVENT_TYPE_IDS.assist) return 'Asistencia';
  if (eventTypeId === EVENT_TYPE_IDS.ownGoal) return 'Autogol';
  return 'Evento';
};

export const getEventIconById = (eventTypeId: number): string => {
  if (eventTypeId === EVENT_TYPE_IDS.goal) return '⚽';
  if (eventTypeId === EVENT_TYPE_IDS.assist) return '🎯';
  if (eventTypeId === EVENT_TYPE_IDS.ownGoal) return '🥅';
  return '•';
};
