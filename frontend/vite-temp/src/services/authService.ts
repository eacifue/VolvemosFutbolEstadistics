import apiClient from './api';

export interface AuthUser {
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { username, password });
    const data = response.data as LoginResponse;

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ username: data.username, role: data.role } satisfies AuthUser)
    );

    return data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      const user = JSON.parse(raw) as AuthUser;
      return user;
    } catch {
      return null;
    }
  },

  isAdmin(): boolean {
    return authService.getUser()?.role === 'Admin';
  },
};
