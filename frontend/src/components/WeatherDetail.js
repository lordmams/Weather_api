import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { weatherService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './WeatherDetail.css';

const WeatherDetail = () => {
  const { city } = useParams();
  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    loadWeatherData();
  }, [city]);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [current, forecast, history] = await Promise.allSettled([
        weatherService.getCurrentWeather(city),
        weatherService.getForecast(city),
        weatherService.getHistory(city)
      ]);

      if (current.status === 'fulfilled') {
        setCurrentData(current.value.data);
      }

      if (forecast.status === 'fulfilled') {
        setForecastData(forecast.value.data);
      }

      if (history.status === 'fulfilled') {
        setHistoryData(history.value.data);
      }

    } catch (err) {
      setError('Erreur lors du chargement des données météo');
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (data) => {
    if (!data || !data.data || !data.data.time) return [];
    
    return data.data.time.map((time, index) => ({
      date: new Date(time).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      temperature: data.data.temperature_2m_max?.[index] || 0
    }));
  };

  const formatForecastData = (data) => {
    if (!data || !data.time) return [];
    return data.time.map((time, index) => ({
      date: new Date(time).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }),
      max: data.temperature_2m_max?.[index] ?? null,
      min: data.temperature_2m_min?.[index] ?? null,
      weatherCode: data.weathercode?.[index] ?? null
    }));
  };

  const getWeatherIcon = (code, isDay = true) => {
    const icons = {
      0: '☀️', // Ciel dégagé
      1: '🌤️', // Peu nuageux
      2: '⛅', // Partiellement nuageux
      3: '☁️', // Couvert
      80: '🌧️', // Averses
      95: '⛈️', // Orage
    };
    return icons[code] || '🌤️';
  };

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Ciel dégagé',
      1: 'Peu nuageux',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      80: 'Averses',
      95: 'Orage',
    };
    return descriptions[code] || 'Inconnu';
  };

  const formatTemperature = (temp) => {
    return temp ? `${Math.round(temp)}°C` : 'N/A';
  };

  const formatWindDirection = (direction) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const index = Math.round(direction / 22.5) % 16;
    return directions[index];
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement des données météo pour {city}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        ❌ {error}
        <Link to="/" className="btn" style={{ marginTop: '16px', display: 'inline-block' }}>
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="weather-detail">
      <div className="detail-header">
        <Link to="/" className="back-link">← Retour au dashboard</Link>
        <h1>🌤️ Météo - {city}</h1>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Actuel
        </button>
        <button 
          className={`tab ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          Prévisions
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historique
        </button>
      </div>

      {activeTab === 'current' && currentData && (
        <div className="tab-content">
          <div className="card">
            <h2>Météo actuelle</h2>
            <div className="current-weather">
              {currentData.sources.map((source, index) => (
                <div key={index} className="source-data">
                  <h3>{source.name}</h3>
                  {source.data && (
                    <div className="weather-card">
                      <div className="weather-main">
                        <div className="weather-icon-large">
                          {getWeatherIcon(source.data.weathercode, source.data.is_day)}
                        </div>
                        <div className="weather-temp">
                          <span className="temperature-large">{formatTemperature(source.data.temperature)}</span>
                          <span className="weather-desc">{getWeatherDescription(source.data.weathercode)}</span>
                        </div>
                      </div>
                      <div className="weather-details">
                        <div className="weather-item">
                          <span className="label">Vent</span>
                          <span className="value">{source.data.windspeed} km/h {formatWindDirection(source.data.winddirection)}</span>
                        </div>
                        <div className="weather-item">
                          <span className="label">Période</span>
                          <span className="value">{source.data.is_day ? 'Jour' : 'Nuit'}</span>
                        </div>
                        <div className="weather-item">
                          <span className="label">Heure</span>
                          <span className="value">{new Date(source.data.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && forecastData && (
        <div className="tab-content">
          <div className="card">
            <h2>Prévisions 7 jours</h2>
            <div className="forecast-data">
              {forecastData.sources.map((source, index) => {
                const chartData = formatForecastData(source.data);
                console.log('Forecast chart data:', chartData, source.data);
                return (
                  <div key={index} className="source-data">
                    <h3>{source.name}</h3>
                    {source.data && (
                      <div className="forecast-container">
                        <div className="forecast-chart">
                          {chartData.length === 0 ? (
                            <div style={{textAlign: 'center', color: '#aaa', padding: '40px 0'}}>Aucune donnée de prévision disponible.</div>
                          ) : (
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="max" fill="#ff6b6b" name="Max" />
                                <Bar dataKey="min" fill="#4ecdc4" name="Min" />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        {chartData.length > 0 && (
                          <div className="forecast-days">
                            {chartData.map((day, dayIndex) => (
                              <div key={dayIndex} className="forecast-day">
                                <div className="day-header">
                                  <span className="day-name">{day.date}</span>
                                  <span className="day-icon">{getWeatherIcon(day.weatherCode)}</span>
                                </div>
                                <div className="day-temps">
                                  <span className="temp-max">{day.max}°</span>
                                  <span className="temp-min">{day.min}°</span>
                                </div>
                                <div className="day-desc">{getWeatherDescription(day.weatherCode)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && historyData && (
        <div className="tab-content">
          <div className="card">
            <h2>Historique des températures</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatChartData(historyData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="history-summary">
              <h3>Résumé des données</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Période</span>
                  <span className="summary-value">7 derniers jours</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Température max</span>
                  <span className="summary-value">
                    {Math.max(...(historyData.data?.temperature_2m_max?.filter(t => t !== null) || [0]))}°C
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Température min</span>
                  <span className="summary-value">
                    {Math.min(...(historyData.data?.temperature_2m_max?.filter(t => t !== null) || [0]))}°C
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Moyenne</span>
                  <span className="summary-value">
                    {Math.round(
                      (historyData.data?.temperature_2m_max?.filter(t => t !== null) || []).reduce((a, b) => a + b, 0) / 
                      (historyData.data?.temperature_2m_max?.filter(t => t !== null) || []).length
                    )}°C
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDetail; 