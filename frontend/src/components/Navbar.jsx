import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // Handle toggling dark theme
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span>⚡</span> o2h Portal
      </div>

      <ul className="nav-links">
        {isAuthenticated ? (
          <>
            <li>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/add-task" 
                className={`nav-link ${location.pathname === '/add-task' ? 'active' : ''}`}
              >
                Add Task
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
            </li>
            <li>
              <Link 
                to="/register" 
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>

      <div className="nav-actions">
        <button 
          className="theme-toggle" 
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
          id="darkModeToggle"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Hi, <strong>{currentUser?.name || 'User'}</strong>
            </span>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
