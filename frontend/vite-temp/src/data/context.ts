import { createContext, useContext } from 'react';
import type { Match, Player, Position } from '../types';
import type { MatchView, PlayerInfo, PlayerStats, TeamRecord } from '../lib/stats';

export interface AppData {
  players: Player[];
  positions: Position[];
  matches: Match[];
  infos: PlayerInfo[];
  views: MatchView[]; // más reciente primero
  stats: Map<number, PlayerStats>;
  record: TeamRecord;
  info: (id: number) => PlayerInfo | undefined;
  nameOf: (id: number) => string;
  shortOf: (id: number) => string;
  loading: boolean;
  error: string | null;
  offline: boolean;
  savedAt: Date | null;
  refetch: () => Promise<void>;
}

export const AppDataContext = createContext<AppData | null>(null);

export const useAppData = (): AppData => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData debe usarse dentro de AppDataProvider');
  return ctx;
};
