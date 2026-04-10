import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, type AuthUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());

  useEffect(() => {
    console.log('AuthProvider mounted');
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    setUser({ username: response.username, role: response.role });
    setToken(response.token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAdmin: user?.role === 'Admin',
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
