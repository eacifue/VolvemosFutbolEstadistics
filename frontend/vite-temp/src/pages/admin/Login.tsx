import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shell } from '../../components/Shell';
import { Button, Crest, TextField } from '../../components/vaf';
import { useToast } from '../../lib/toast';
import { getFriendlyErrorMessage } from '../../utils/errorMessages';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Escribe tu usuario y contraseña.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(username.trim(), password);
      setPassword('');
      toast({ tone: 'success', message: `Hola, ${username.trim()}`, detail: 'Ya puedes cargar partidos.' });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(status === 401 || status === 400 ? 'Usuario o contraseña incorrectos. Inténtalo de nuevo.' : getFriendlyErrorMessage(err, 'No pudimos entrar. Inténtalo de nuevo.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell header={false} nav={false}>
      <div className="vf-login-wrap">
        <form className="vf-login" onSubmit={submit} noValidate>
          <Crest size={64} />
          <h1 className="vf-login__title">Entrar como admin</h1>
          <p className="vf-small vf-dim">Solo los organizadores cargan partidos. Para mirar no hace falta cuenta.</p>
          <TextField label="Usuario" icon="players" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label="Contraseña" type="password" icon="lock" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={error ?? undefined} />
          <Button type="submit" variant="primary" size="lg" block loading={busy ? 'Entrando…' : false}>Entrar</Button>
          <button type="button" className="vf-link vf-link--btn" onClick={() => navigate('/')}>Volver a Inicio</button>
        </form>
      </div>
    </Shell>
  );
};
