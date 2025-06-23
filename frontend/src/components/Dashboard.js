import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import WeatherCard from './WeatherCard';
import './Dashboard.css';

const Dashboard = () => {
  const [searchCity, setSearchCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentCities, setRecentCities] = useState([]);
  const navigate = useNavigate();

  // Villes populaires pour les suggestions
  const popularCities = ['Paris', 'London', 'New York', 'Tokyo', 'Berlin', 'Madrid', 'Rome', 'Sydney'];

  useEffect(() => {
    // Charger les villes récentes depuis localStorage
    const saved = localStorage.getItem('recentCities');
    if (saved) {
      setRecentCities(JSON.parse(saved));
    }
  }, []);

  const searchWeather = async (city) => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/weather/current/${encodeURIComponent(city)}`);
      setWeatherData(response.data);
      
      // Ajouter à l'historique des villes récentes
      const updatedCities = [city, ...recentCities.filter(c => c !== city)].slice(0, 5);
      setRecentCities(updatedCities);
      localStorage.setItem('recentCities', JSON.stringify(updatedCities));
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des données météo');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchWeather(searchCity);
  };

  const handleCityClick = (city) => {
    setSearchCity(city);
    searchWeather(city);
  };

  const handleViewDetails = (city) => {
    navigate(`/weather/${encodeURIComponent(city)}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🌤️ Dashboard Météo</h1>
        <p>Consultez la météo en temps réel avec agrégation multi-sources</p>
      </div>

      <form onSubmit={handleSubmit} className="search-container">
        <input
          type="text"
          className="input"
          placeholder="Entrez le nom d'une ville..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {recentCities.length > 0 && (
        <div className="recent-section">
          <h3>Villes récentes</h3>
          <div className="recent-cities">
            {recentCities.map((city) => (
              <span
                key={city}
                className="city-chip"
                onClick={() => handleCityClick(city)}
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="popular-section">
        <h3>Villes populaires</h3>
        <div className="popular-cities">
          {popularCities.map((city) => (
            <span
              key={city}
              className="city-chip"
              onClick={() => handleCityClick(city)}
            >
              {city}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="error">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Récupération des données météo...</p>
        </div>
      )}

      {weatherData && (
        <div className="weather-result">
          <WeatherCard 
            data={weatherData} 
            onViewDetails={() => handleViewDetails(weatherData.city)}
          />
        </div>
      )}

      <div className="info-section">
        <div className="card">
          <h3>ℹ️ À propos de cette API</h3>
          <p>
            Cette application agrège les données météorologiques de plusieurs sources :
          </p>
          <ul>
            <li><strong>Open-Meteo</strong> : Données météo européennes de haute qualité</li>
            <li><strong>WeatherAPI</strong> : Données mondiales avec prévisions détaillées</li>
            <li><strong>Cache Redis</strong> : Optimisation des performances</li>
            <li><strong>Base PostgreSQL</strong> : Persistance des données historiques</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 