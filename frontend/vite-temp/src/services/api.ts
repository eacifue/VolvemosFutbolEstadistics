import axios from 'axios';

// Dashboard endpoint
export const getDashboard = async () => {
    const res = await apiClient.get('/dashboard');
    return res.data;
};

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api' || 'http://localhost:5186/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Players endpoints
export const getPlayers = async () => {
    const res = await apiClient.get('/players');
    return res.data;
};

export const getPlayer = async (id: number) => {
    const res = await apiClient.get(`/players/${id}`);
    return res.data;
};

export const createPlayer = async (player: any) => {
    const res = await apiClient.post('/players', player);
    return res.data;
};

export const updatePlayer = async (id: number, player: any) => {
    const res = await apiClient.put(`/players/${id}`, player);
    return res.data;
};

export const deletePlayer = async (id: number) => {
    await apiClient.delete(`/players/${id}`);
};

export const getPlayerStats = async (id: number) => {
    const res = await apiClient.get(`/players/${id}/stats`);
    return res.data;
};

export const getAllPlayersStats = async () => {
    const res = await apiClient.get('/players/stats');
    return res.data;
};

// Teams endpoints
export const getTeams = async () => {
    const res = await apiClient.get('/teams');
    return res.data;
};

// Positions endpoints
export const getPositions = async () => {
    const res = await apiClient.get('/positions');
    return res.data;
};

// Event types endpoints
export const getEventTypes = async () => {
    const res = await apiClient.get('/eventtypes');
    return res.data;
};

// Matches endpoints
export const getMatches = async () => {
    const res = await apiClient.get('/matches');
    return res.data;
};

export const getMatch = async (id: number) => {
    const res = await apiClient.get(`/matches/${id}`);
    return res.data;
};

export const createMatch = async (match: any) => {
    const res = await apiClient.post('/matches', match);
    return res.data;
};

export const updateMatch = async (id: number, match: any) => {
    const res = await apiClient.put(`/matches/${id}`, match);
    return res.data;
};

export const deleteMatch = async (id: number) => {
    await apiClient.delete(`/matches/${id}`);
};

// Match Events endpoints
export const getMatchEvents = async (matchId: number) => {
    const res = await apiClient.get(`/matchevents/match/${matchId}`);
    return res.data;
};

export const createMatchEvent = async (event: any) => {
    const res = await apiClient.post('/matchevents', event);
    return res.data;
};

export const updateMatchEvent = async (id: number, event: any) => {
    const res = await apiClient.put(`/matchevents/${id}`, event);
    return res.data;
};

export const deleteMatchEvent = async (id: number) => {
    await apiClient.delete(`/matchevents/${id}`);
};

export const deleteMatchEventsByMatch = async (matchId: number) => {
    await apiClient.delete(`/matchevents/match/${matchId}`);
};

// Match Players endpoints
export const getMatchPlayers = async (matchId: number) => {
    const res = await apiClient.get(`/matchplayers/match/${matchId}`);
    return res.data;
};

export const addPlayerToMatch = async (matchPlayer: any) => {
    const res = await apiClient.post('/matchplayers', matchPlayer);
    return res.data;
};

export const removePlayerFromMatch = async (matchId: number, playerId: number) => {
    await apiClient.delete(`/matchplayers/${matchId}/${playerId}`);
};

export default apiClient;
