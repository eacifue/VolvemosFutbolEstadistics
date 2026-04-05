import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Players from './pages/Players';
import Admin from './pages/Admin';
import ManagePlayers from './pages/ManagePlayers';
import './styles/main.css';

const App: React.FC = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jugadores" element={<Players />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/gestionar-jugadores" element={<ManagePlayers />} />
            </Routes>
        </Router>
    );
};

export default App;