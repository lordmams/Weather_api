import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🌤️ Weather API
        </Link>
        
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            🔍 Recherche
          </Link>
          <Link 
            to="/stats" 
            className={`navbar-link ${location.pathname === '/stats' ? 'active' : ''}`}
          >
            📊 Statistiques
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 