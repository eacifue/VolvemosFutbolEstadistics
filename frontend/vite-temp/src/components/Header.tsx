import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">⚽</span>
                        Volvemos al Fútbol
                    </Link>

                    <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <Link to="/" className={`nav-link ${isActive('/')}`}>
                            Inicio
                        </Link>
                        <Link to="/jugadores" className={`nav-link ${isActive('/jugadores')}`}>
                            Jugadores
                        </Link>
                        <Link to="/gestionar-jugadores" className={`nav-link ${isActive('/gestionar-jugadores')}`}>
                            Gestionar Jugadores
                        </Link>
                        <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                            Admin
                        </Link>
                    </nav>

                    <button 
                        className="menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
