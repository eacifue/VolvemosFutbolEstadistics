// Updated header layout for fixed glass navigation, active route indicators, and accessible mobile dropdown behavior.
import React, { useState } from 'react';
import { Link, useInRouterContext, useLocation } from 'react-router-dom';
import '../styles/Header.css';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const inRouterContext = useInRouterContext();

    if (!inRouterContext) {
        console.error('Header is outside Router context');
        return null;
    }

    const location = useLocation();
    const { user, isAdmin, login, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    const handleLogin = async (username: string, password: string) => {
        await login(username, password);
    };

    return (
        <>
            <header className="header" role="banner">
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="logo">
                            <span className="logo-icon">⚽</span>
                            <span className="logo-text ellipsis">Volvemos al Fútbol</span>
                        </Link>

                        <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Navegacion principal">
                            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setMobileMenuOpen(false)}>
                                Inicio
                            </Link>
                            <Link to="/jugadores" className={`nav-link ${isActive('/jugadores')}`} onClick={() => setMobileMenuOpen(false)}>
                                Jugadores
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={() => setMobileMenuOpen(false)}>
                                    Admin
                                </Link>
                            )}
                        </nav>

                        <div className="header-auth">
                            {user ? (
                                <div className="user-badge" title={user.username}>
                                    <span className="avatar-circle">{user.username.charAt(0).toUpperCase()}</span>
                                    <span className="user-name">{user.username}</span>
                                    <button className="auth-btn logout-btn" onClick={logout}>Salir</button>
                                </div>
                            ) : (
                                <button className="auth-btn login-btn" onClick={() => setLoginOpen(true)}>
                                    Iniciar sesión
                                </button>
                            )}

                            <button
                                className="menu-toggle"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-expanded={mobileMenuOpen}
                                aria-label="Abrir menu"
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />
        </>
    );
};

export default Header;
