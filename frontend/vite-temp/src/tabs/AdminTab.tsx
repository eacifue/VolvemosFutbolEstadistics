import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ManagePlayers from '../pages/ManagePlayers';
import MatchManager from '../pages/MatchManager';

const AdminTab: React.FC = () => {
  const { isAdmin, user, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminView, setAdminView] = useState<'player' | 'match'>('player');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);

    if (!username.trim() || !password.trim()) {
      setAuthError(true);
      return;
    }

    try {
      setSubmitting(true);
      await login(username.trim(), password);
      setPassword('');
    } catch {
      setAuthError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="tab-panel">
        <div className="card admin-login-card">
          <div className="admin-login-title">Acceso administrador</div>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="admin-username">Usuario</label>
              <input
                id="admin-username"
                className="input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label htmlFor="admin-password">Contraseña</label>
              <input
                id="admin-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>
            {authError && <div className="admin-login-error">Credenciales incorrectas.</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ marginTop: 16 }}>
              {submitting ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-panel">
      <div>
        <div className="seg admin-seg">
          <div
            className={`seg-opt ${adminView === 'player' ? 'active' : ''}`}
            onClick={() => setAdminView('player')}
          >
            Jugador
          </div>
          <div
            className={`seg-opt ${adminView === 'match' ? 'active' : ''}`}
            onClick={() => setAdminView('match')}
          >
            Partido
          </div>
        </div>

        {adminView === 'player' ? <ManagePlayers /> : <MatchManager />}

        <button type="button" className="admin-logout" onClick={logout}>
          Cerrar sesión ({user?.username})
        </button>
      </div>
    </div>
  );
};

export default AdminTab;
