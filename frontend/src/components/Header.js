import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            🌤️ Météo API
          </Link>
          
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/stats" 
              className={`nav-link ${isActive('/stats') ? 'active' : ''}`}
            >
              Statistiques
            </Link>
            <a 
              href="http://localhost:3000/api-docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-link"
            >
              API Docs
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 