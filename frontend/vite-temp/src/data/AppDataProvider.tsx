import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getMatches, getPlayers, getPositions } from '../services/api';
import { subscribeStatsRefresh } from '../services/refreshBus';
import type { Match, Player, Position } from '../types';
import { buildMatchView, computePlayerStats, teamRecord, toInfo } from '../lib/stats';
import { getFriendlyErrorMessage } from '../utils/errorMessages';
import { AppDataContext, type AppData } from './context';

const CACHE_KEY = 'vf_cache_v1';

interface Cache { savedAt: string; players: Player[]; matches: Match[]; positions: Position[] }

const readCache = (): Cache | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : null;
  } catch {
    return null;
  }
};

const writeCache = (c: Cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    // Sin almacenamiento: la app funciona igual, solo no habrá datos sin conexión.
  }
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cached] = useState(readCache);
  const [players, setPlayers] = useState<Player[]>(cached?.players ?? []);
  const [matches, setMatches] = useState<Match[]>(cached?.matches ?? []);
  const [positions, setPositions] = useState<Position[]>(cached?.positions ?? []);
  const [savedAt, setSavedAt] = useState<Date | null>(cached ? new Date(cached.savedAt) : null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [p, m, pos] = await Promise.all([getPlayers(), getMatches() as Promise<Match[]>, getPositions() as Promise<Position[]>]);
      setPlayers(p);
      setMatches(m);
      setPositions(pos);
      const now = new Date();
      setSavedAt(now);
      writeCache({ savedAt: now.toISOString(), players: p, matches: m, positions: pos });
      setError(null);
      setOffline(false);
    } catch (err) {
      console.error('Error cargando datos:', err);
      const hasCache = readCache() != null;
      setOffline(hasCache);
      setError(hasCache ? null : getFriendlyErrorMessage(err, 'No pudimos cargar los partidos. Revisa tu conexión y vuelve a intentarlo.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Primera carga al montar; los datos llegan de forma asíncrona.
    void fetchAll();
    const unsubscribe = subscribeStatsRefresh(() => void fetchAll());
    const onOnline = () => void fetchAll();
    window.addEventListener('online', onOnline);
    return () => {
      unsubscribe();
      window.removeEventListener('online', onOnline);
    };
  }, [fetchAll]);

  const value = useMemo<AppData>(() => {
    const infos = players.map(toInfo).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const byId = new Map(infos.map((i) => [i.id, i]));
    const now = new Date();
    const views = matches.map((m) => buildMatchView(m, now)).sort((a, b) => b.date.getTime() - a.date.getTime());
    return {
      players,
      positions,
      matches,
      infos,
      views,
      stats: computePlayerStats(infos, views),
      record: teamRecord(views),
      info: (id) => byId.get(id),
      nameOf: (id) => byId.get(id)?.name ?? 'Jugador',
      shortOf: (id) => byId.get(id)?.short ?? 'Jugador',
      loading,
      error,
      offline,
      savedAt,
      refetch: fetchAll,
    };
  }, [players, positions, matches, loading, error, offline, savedAt, fetchAll]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};
