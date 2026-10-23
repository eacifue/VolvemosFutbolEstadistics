import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Skeleton, StateView } from './components/vaf';
import { Inicio } from './pages/Inicio';
import { Partidos } from './pages/Partidos';
import { PartidoDetalle } from './pages/PartidoDetalle';
import { Ranking } from './pages/Ranking';
import { Jugadores } from './pages/Jugadores';
import { Perfil } from './pages/Perfil';
import { Logros } from './pages/Logros';
import { Comparar } from './pages/Comparar';
import { AdminGate } from './pages/admin/AdminGate';

// El admin solo lo usan los organizadores: se descarga aparte.
const Gestion = lazy(() => import('./pages/admin/Gestion').then((m) => ({ default: m.Gestion })));
const AdminPartido = lazy(() => import('./pages/admin/AdminPartido').then((m) => ({ default: m.AdminPartido })));
const EnCancha = lazy(() => import('./pages/admin/EnCancha').then((m) => ({ default: m.EnCancha })));
const Armar = lazy(() => import('./pages/admin/Armar').then((m) => ({ default: m.Armar })));
const EditarAlineacion = lazy(() => import('./pages/admin/EditarAlineacion').then((m) => ({ default: m.EditarAlineacion })));
const Cuotas = lazy(() => import('./pages/admin/Cuotas').then((m) => ({ default: m.Cuotas })));

const NoEncontrado: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Shell>
      <main className="vf-main">
        <StateView kind="error" title="Esta jugada no existe" body="La página que buscas no está. Vuelve al inicio para ver el último partido." action="Ir a Inicio" onAction={() => navigate('/')} />
      </main>
    </Shell>
  );
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const admin = (el: React.ReactNode) => (
  <AdminGate>
    <Suspense fallback={<main className="vf-main"><Skeleton shape="row" count={6} /></main>}>{el}</Suspense>
  </AdminGate>
);

const App: React.FC = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/partidos" element={<Partidos />} />
      <Route path="/partidos/:id" element={<PartidoDetalle />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/jugadores" element={<Jugadores />} />
      <Route path="/jugadores/:id" element={<Perfil />} />
      <Route path="/jugadores/:id/logros" element={<Logros />} />
      <Route path="/comparar/:a/:b" element={<Comparar />} />
      <Route path="/admin" element={admin(<Gestion />)} />
      <Route path="/admin/armar" element={admin(<Armar />)} />
      <Route path="/admin/armar/:id" element={admin(<Armar />)} />
      <Route path="/admin/partidos/:id" element={admin(<AdminPartido />)} />
      <Route path="/admin/partidos/:id/en-cancha" element={admin(<EnCancha />)} />
      <Route path="/admin/partidos/:id/alineacion" element={admin(<EditarAlineacion />)} />
      <Route path="/admin/partidos/:id/cuotas" element={admin(<Cuotas />)} />
      <Route path="*" element={<NoEncontrado />} />
    </Routes>
  </>
);

export default App;
