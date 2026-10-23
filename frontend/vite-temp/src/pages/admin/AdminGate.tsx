import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Login } from './Login';

// Lectura pública, escritura solo admin: sin sesión, cualquier ruta /admin muestra el login.
export const AdminGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Login />;
};
