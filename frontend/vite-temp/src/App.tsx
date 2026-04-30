// Added a content offset wrapper so fixed header navigation does not overlap routed pages.
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import MatchDetailScreen from './pages/MatchDetailScreen';
import Players from './pages/Players';
import Admin from './pages/Admin';
import ManagePlayers from './pages/ManagePlayers';
import './styles/main.css';

const App: React.FC = () => {
    return (
        <>
            <Header />
            <main className="main-content-offset">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/partidos" element={<MatchDetailScreen />} />
                    <Route path="/jugadores" element={<Players />} />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/gestionar-jugadores"
                        element={
                            <AdminRoute>
                                <ManagePlayers />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </main>
        </>
    );
};

export default App;