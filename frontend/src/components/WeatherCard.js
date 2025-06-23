import React from 'react';
import './WeatherCard.css';

const WeatherCard = ({ data, onViewDetails }) => {
  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Cloudy': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunder': '⛈️',
      'Fog': '🌫️',
      'Mist': '🌫️',
      'Overcast': '☁️',
      'Partly cloudy': '⛅',
      'Sunny': '☀️'
    };
    
    if (!condition) return '🌤️';
    
    for (const [key, icon] of Object.entries(icons)) {
      if (condition.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '🌤️';
  };

  const getTemperature = (sources) => {
    if (!sources || sources.length === 0) return null;
    
    // Essayer de récupérer la température depuis les différentes sources
    for (const source of sources) {
      if (source.name === 'Open-Meteo' && source.data.temperature) {
        return Math.round(source.data.temperature);
      }
      if (source.name === 'WeatherAPI' && source.data.temp_c) {
        return Math.round(source.data.temp_c);
      }
      if (source.name === 'Database' && source.data.temperature) {
        return Math.round(source.data.temperature);
      }
    }
    return null;
  };

  const getHumidity = (sources) => {
    for (const source of sources) {
      if (source.name === 'WeatherAPI' && source.data.humidity) {
        return source.data.humidity;
      }
    }
    return null;
  };

  const getWindSpeed = (sources) => {
    for (const source of sources) {
      if (source.name === 'Open-Meteo' && source.data.windspeed) {
        return source.data.windspeed;
      }
      if (source.name === 'WeatherAPI' && source.data.wind_kph) {
        return source.data.wind_kph;
      }
    }
    return null;
  };

  const getCondition = (sources) => {
    for (const source of sources) {
      if (source.name === 'WeatherAPI' && source.data.condition?.text) {
        return source.data.condition.text;
      }
    }
    return 'Conditions météo';
  };

  const temperature = getTemperature(data.sources);
  const humidity = getHumidity(data.sources);
  const windSpeed = getWindSpeed(data.sources);
  const condition = getCondition(data.sources);
  const weatherIcon = getWeatherIcon(condition);

  return (
    <div className="weather-card card">
      <div className="weather-header">
        <h2>{data.city}</h2>
        <div className="weather-icon">{weatherIcon}</div>
      </div>

      {temperature && (
        <div className="temperature">
          {temperature}°C
        </div>
      )}

      <div className="weather-condition">
        {condition}
      </div>

      <div className="weather-info">
        {humidity && (
          <div className="weather-item">
            <h4>Humidité</h4>
            <p>{humidity}%</p>
          </div>
        )}
        
        {windSpeed && (
          <div className="weather-item">
            <h4>Vent</h4>
            <p>{Math.round(windSpeed)} km/h</p>
          </div>
        )}
      </div>

      <div className="sources-section">
        <h4>Sources de données :</h4>
        <div className="sources">
          {data.sources.map((source, index) => (
            <span 
              key={index}
              className={`source-badge source-${source.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {source.name}
            </span>
          ))}
        </div>
      </div>

      {onViewDetails && (
        <button 
          className="btn view-details-btn"
          onClick={onViewDetails}
        >
          Voir les détails
        </button>
      )}
    </div>
  );
};

export default WeatherCard; 