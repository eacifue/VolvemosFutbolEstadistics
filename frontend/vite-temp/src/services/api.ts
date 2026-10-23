import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Player } from '../types';

export interface PlayerPayload { firstName: string; lastName: string; nickname?: string | null; idPosition?: number | null }
export interface MatchPayload { matchDate: string; homeTeamId?: number; awayTeamId?: number; venue?: string | null }
export interface PitchPosition { playerId: number; x: number | null; y: number | null }
export interface MatchEventPayload { matchId: number; playerId: number; eventTypeId: number; teamId: number }
export interface MatchPlayerPayload { matchId?: number; playerId: number; teamId: number }

// ✅ Base URL segura (NO rompe en producción ni en local)
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5186/api';

// ✅ Cliente centralizado
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor global para errores (debug profesional)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API ERROR:',
      error?.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// ✅ Helper para evitar repetir res.data
const request = async <T>(promise: Promise<AxiosResponse<T>>): Promise<T> => {
  const res = await promise;
  return res.data;
};

// ==================== DASHBOARD ====================
export const getDashboard = () =>
  request(apiClient.get('/dashboard', { params: { _ts: Date.now() } }));

// ==================== PLAYERS ====================
export const getPlayers = () =>
  request<Player[]>(apiClient.get('/players', { params: { _ts: Date.now() } }));

export const getPlayer = (id: number) =>
  request(apiClient.get(`/players/${id}`));

export const createPlayer = (player: PlayerPayload) =>
  request(apiClient.post('/players', player));

export const updatePlayer = (id: number, player: PlayerPayload) =>
  request(apiClient.put(`/players/${id}`, player));

export const deletePlayer = (id: number) =>
  apiClient.delete(`/players/${id}`);

export const getPlayerStats = (id: number) =>
  request(apiClient.get(`/players/${id}/stats`));

export const getAllPlayersStats = () =>
  request(apiClient.get('/players/stats'));

// ==================== TEAMS ====================
export const getTeams = () =>
  request(apiClient.get('/teams'));

// ==================== POSITIONS ====================
export const getPositions = () =>
  request(apiClient.get('/positions'));

// ==================== EVENT TYPES ====================
export const getEventTypes = () =>
  request(apiClient.get('/eventtypes'));

// ==================== MATCHES ====================
export const getMatches = () =>
  request(apiClient.get('/matches'));

export const getVenues = () =>
  request<string[]>(apiClient.get('/matches/venues'));

export const getMatch = (id: number) =>
  request(apiClient.get(`/matches/${id}`));

export const createMatch = (match: MatchPayload) =>
  request(apiClient.post('/matches', match));

export const updateMatch = (id: number, match: MatchPayload) =>
  request(apiClient.put(`/matches/${id}`, match));

export const deleteMatch = (id: number) =>
  apiClient.delete(`/matches/${id}`);

// ==================== MATCH EVENTS ====================
export const getMatchEvents = (matchId: number) =>
  request(apiClient.get(`/matchevents/match/${matchId}`));

export const createMatchEvent = (event: MatchEventPayload) =>
  request(apiClient.post('/matchevents', event));

export const updateMatchEvent = (id: number, event: MatchEventPayload) =>
  request(apiClient.put(`/matchevents/${id}`, event));

export const deleteMatchEvent = (id: number) =>
  apiClient.delete(`/matchevents/${id}`);

export const deleteMatchEventsByMatch = (matchId: number) =>
  apiClient.delete(`/matchevents/match/${matchId}`);

// ==================== MATCH PLAYERS ====================
export const getMatchPlayers = (matchId: number) =>
  request(apiClient.get(`/matchplayers/match/${matchId}`));

export const addPlayerToMatch = (matchPlayer: MatchPlayerPayload) =>
  request(apiClient.post('/matchplayers', matchPlayer));

export const removePlayerFromMatch = (
  matchId: number,
  playerId: number
) =>
  apiClient.delete(`/matchplayers/${matchId}/${playerId}`);

// Posiciones de la cancha que ven todos (x/y en % 0–100; null = ubicación automática)
export const updatePitchPositions = (matchId: number, positions: PitchPosition[]) =>
  request(apiClient.put(`/matchplayers/${matchId}/positions`, positions));

// Pasa a un jugador al otro equipo sin sacarlo del partido
export const changePlayerTeam = (matchId: number, playerId: number, teamId: number) =>
  request(apiClient.patch(`/matchplayers/${matchId}/${playerId}`, { teamId }));

// ✅ Export del cliente (por si lo necesitas en otros lados)
export default apiClient;