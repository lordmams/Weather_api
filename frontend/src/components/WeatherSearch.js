import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WeatherSearch.css';

const WeatherSearch = () => {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    try {
      // Simuler un délai pour l'expérience utilisateur
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(`/weather/${encodeURIComponent(city.trim())}`);
    } catch (error) {
      console.error('Erreur de navigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const popularCities = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 
    'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
  ];

  const handleCityClick = (selectedCity) => {
    setCity(selectedCity);
    navigate(`/weather/${encodeURIComponent(selectedCity)}`);
  };

  return (
    <div className="weather-search">
      <div className="search-container">
        <div className="search-header">
          <h1>🌤️ Recherche Météo</h1>
          <p>Trouvez la météo actuelle et les prévisions pour n'importe quelle ville</p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Entrez le nom d'une ville..."
              className="search-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={loading || !city.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Recherche...
                </>
              ) : (
                '🔍 Rechercher'
              )}
            </button>
          </div>
        </form>

        <div className="popular-cities">
          <h3>🏙️ Villes populaires</h3>
          <div className="cities-grid">
            {popularCities.map((cityName) => (
              <button
                key={cityName}
                onClick={() => handleCityClick(cityName)}
                className="city-button"
                disabled={loading}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">🌡️</div>
            <h3>Météo Actuelle</h3>
            <p>Température, conditions, humidité et vent en temps réel</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Prévisions 7 Jours</h3>
            <p>Prévisions détaillées pour la semaine à venir</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Données Multi-Sources</h3>
            <p>Agrégation de données de plusieurs fournisseurs météo</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Performance Optimisée</h3>
            <p>Cache Redis et base de données PostgreSQL pour des réponses rapides</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSearch; 