import axios from 'axios';

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
const request = async (promise: Promise<any>) => {
  const res = await promise;
  return res.data;
};

// ==================== DASHBOARD ====================
export const getDashboard = () =>
  request(apiClient.get('/dashboard'));

// ==================== PLAYERS ====================
export const getPlayers = () =>
  request(apiClient.get('/players'));

export const getPlayer = (id: number) =>
  request(apiClient.get(`/players/${id}`));

export const createPlayer = (player: any) =>
  request(apiClient.post('/players', player));

export const updatePlayer = (id: number, player: any) =>
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

export const getMatch = (id: number) =>
  request(apiClient.get(`/matches/${id}`));

export const createMatch = (match: any) =>
  request(apiClient.post('/matches', match));

export const updateMatch = (id: number, match: any) =>
  request(apiClient.put(`/matches/${id}`, match));

export const deleteMatch = (id: number) =>
  apiClient.delete(`/matches/${id}`);

// ==================== MATCH EVENTS ====================
export const getMatchEvents = (matchId: number) =>
  request(apiClient.get(`/matchevents/match/${matchId}`));

export const createMatchEvent = (event: any) =>
  request(apiClient.post('/matchevents', event));

export const updateMatchEvent = (id: number, event: any) =>
  request(apiClient.put(`/matchevents/${id}`, event));

export const deleteMatchEvent = (id: number) =>
  apiClient.delete(`/matchevents/${id}`);

export const deleteMatchEventsByMatch = (matchId: number) =>
  apiClient.delete(`/matchevents/match/${matchId}`);

// ==================== MATCH PLAYERS ====================
export const getMatchPlayers = (matchId: number) =>
  request(apiClient.get(`/matchplayers/match/${matchId}`));

export const addPlayerToMatch = (matchPlayer: any) =>
  request(apiClient.post('/matchplayers', matchPlayer));

export const removePlayerFromMatch = (
  matchId: number,
  playerId: number
) =>
  apiClient.delete(`/matchplayers/${matchId}/${playerId}`);

// ✅ Export del cliente (por si lo necesitas en otros lados)
export default apiClient;