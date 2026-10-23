import { useCallback, useEffect, useState } from 'react';
import { getDashboard, getPlayers, getMatches } from '../services/api';
import { subscribeStatsRefresh } from '../services/refreshBus';
import type { DashboardDto, Player, Match } from '../types';

interface AppData {
  dashboard: DashboardDto | null;
  players: Player[];
  matches: Match[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAppData = (): AppData => {
  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [dashboardData, playersData, matchesData] = await Promise.all([
        getDashboard(),
        getPlayers(),
        getMatches(),
      ]);
      setDashboard(dashboardData as DashboardDto);
      setPlayers(playersData as Player[]);
      setMatches(matchesData as Match[]);
      setError(null);
    } catch (err) {
      console.error('Error loading app data:', err);
      setError('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
    const unsubscribe = subscribeStatsRefresh(() => void fetchAll());
    return unsubscribe;
  }, [fetchAll]);

  return { dashboard, players, matches, loading, error, refetch: fetchAll };
};
