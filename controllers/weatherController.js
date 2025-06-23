const axios = require('axios');
const geocodingService = require('../services/geocodingService');
const { getCache, setCache } = require('../services/cacheService');
const WeatherData = require('../models/WeatherData');

// Instance du modèle de données
const weatherData = new WeatherData();

// Helper function to handle geocoding and errors
const getCoords = async (city, res) => {
  try {
    return await geocodingService.getCoordinatesForCity(city);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
    return null;
  }
};

const getCurrentWeather = async (req, res) => {
    const { city } = req.params;
    const cacheKey = `weather:current:${city}`;

    try {
        // 1. Vérifier le cache Redis
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            console.log(`[Current] Cache hit for ${city}`);
            return res.status(200).json(cachedData);
        }
        console.log(`[Current] Cache miss for ${city}.`);

        // 2. Vérifier la base de données (données récentes < 10 minutes)
        const dbData = await weatherData.getWeatherData(city, 'current');
        if (dbData && (new Date() - new Date(dbData.updated_at)) < 10 * 60 * 1000) {
            console.log(`[Current] DB hit for ${city}`);
            const aggregatedData = {
                city: city,
                sources: [
                    {
                        name: 'Database',
                        data: JSON.parse(dbData.data),
                        timestamp: dbData.updated_at
                    }
                ]
            };
            await setCache(cacheKey, aggregatedData, 600);
            return res.status(200).json(aggregatedData);
        }

        // 3. Récupérer depuis les APIs externes
        const location = await getCoords(city, res);
        if (!location) return;

        const { latitude, longitude } = location;
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_KEY}&q=${latitude},${longitude}`;

        const results = await Promise.allSettled([
            axios.get(openMeteoUrl),
            axios.get(weatherApiUrl)
        ]);

        const aggregatedData = {
            city: location.name,
            sources: []
        };

        // 4. Traiter et sauvegarder les données
        if (results[0].status === 'fulfilled' && results[0].value.data.current_weather) {
            const openMeteoData = results[0].value.data.current_weather;
            aggregatedData.sources.push({
                name: 'Open-Meteo',
                data: openMeteoData
            });
            // Sauvegarder en base
            await weatherData.saveWeatherData(city, 'current', 'open-meteo', openMeteoData);
        }

        if (results[1].status === 'fulfilled' && results[1].value.data.current) {
            const weatherApiData = results[1].value.data.current;
            aggregatedData.sources.push({
                name: 'WeatherAPI',
                data: weatherApiData
            });
            // Sauvegarder en base
            await weatherData.saveWeatherData(city, 'current', 'weatherapi', weatherApiData);
        }

        if (aggregatedData.sources.length === 0) {
            return res.status(502).json({ message: 'Could not retrieve weather data from any source.' });
        }
        
        // 5. Mettre en cache et retourner
        await setCache(cacheKey, aggregatedData, 600); // Cache for 10 minutes
        res.status(200).json(aggregatedData);

    } catch (error) {
        console.error('Error in getCurrentWeather:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

const getForecast = async (req, res) => {
    const { city } = req.params;
    const cacheKey = `weather:forecast:${city}`;
    
    try {
        // 1. Vérifier le cache Redis
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            console.log(`[Forecast] Cache hit for ${city}`);
            return res.status(200).json(cachedData);
        }
        console.log(`[Forecast] Cache miss for ${city}.`);

        // 2. Vérifier la base de données (données récentes < 1 heure)
        const dbData = await weatherData.getWeatherData(city, 'forecast');
        if (dbData && (new Date() - new Date(dbData.updated_at)) < 60 * 60 * 1000) {
            console.log(`[Forecast] DB hit for ${city}`);
            const aggregatedData = {
                city: city,
                sources: [
                    {
                        name: 'Database',
                        data: JSON.parse(dbData.data),
                        timestamp: dbData.updated_at
                    }
                ]
            };
            await setCache(cacheKey, aggregatedData, 3600);
            return res.status(200).json(aggregatedData);
        }

        // 3. Récupérer depuis les APIs externes
        const location = await getCoords(city, res);
        if (!location) return;
        
        const { latitude, longitude } = location;
        const weatherApiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHERAPI_KEY}&q=${latitude},${longitude}&days=7`;
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

        const results = await Promise.allSettled([
            axios.get(openMeteoUrl),
            axios.get(weatherApiUrl)
        ]);

        const aggregatedData = {
            city: location.name,
            sources: []
        };

        // 4. Traiter et sauvegarder les données
        if (results[0].status === 'fulfilled' && results[0].value.data.daily) {
            const openMeteoData = results[0].value.data.daily;
            aggregatedData.sources.push({
                name: 'Open-Meteo',
                data: openMeteoData
            });
            await weatherData.saveWeatherData(city, 'forecast', 'open-meteo', openMeteoData);
        }

        if (results[1].status === 'fulfilled' && results[1].value.data?.forecast?.forecastday) {
            const weatherApiData = results[1].value.data.forecast.forecastday;
            aggregatedData.sources.push({
                name: 'WeatherAPI',
                data: weatherApiData
            });
            await weatherData.saveWeatherData(city, 'forecast', 'weatherapi', weatherApiData);
        }

        if (aggregatedData.sources.length === 0) {
            return res.status(502).json({ message: 'Could not retrieve forecast data from any source.' });
        }

        // 5. Mettre en cache et retourner
        await setCache(cacheKey, aggregatedData, 3600); // Cache for 1 hour
        res.status(200).json(aggregatedData);

    } catch (error) {
        console.error('Error in getForecast:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

const getHistory = async (req, res) => {
    const { city } = req.params;
    const cacheKey = `weather:history:${city}`;
    
    try {
        // 1. Vérifier le cache Redis
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            console.log(`[History] Cache hit for ${city}`);
            return res.status(200).json(cachedData);
        }
        console.log(`[History] Cache miss for ${city}.`);

        // 2. Vérifier la base de données (données récentes < 24 heures)
        const dbData = await weatherData.getWeatherData(city, 'history');
        if (dbData && (new Date() - new Date(dbData.updated_at)) < 24 * 60 * 60 * 1000) {
            console.log(`[History] DB hit for ${city}`);
            const historicalData = {
                city: city,
                data: JSON.parse(dbData.data),
                timestamp: dbData.updated_at
            };
            await setCache(cacheKey, historicalData, 3600 * 24);
            return res.status(200).json(historicalData);
        }

        // 3. Récupérer depuis l'API externe
        const location = await getCoords(city, res);
        if (!location) return;

        const { latitude, longitude } = location;
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        
        const historicalUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max`;

        const response = await axios.get(historicalUrl);

        const historicalData = {
            city: location.name,
            data: response.data.daily
        };
        
        // 4. Sauvegarder en base
        await weatherData.saveWeatherData(city, 'history', 'open-meteo', response.data.daily);
        
        // 5. Mettre en cache et retourner
        await setCache(cacheKey, historicalData, 3600 * 24); // Cache for 24 hours
        res.status(200).json(historicalData);

    } catch (error) {
        console.error('Error in getHistory:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

// Nouvel endpoint pour les statistiques de persistance
const getStats = async (req, res) => {
    try {
        const stats = await weatherData.getStats();
        res.status(200).json({
            database: stats,
            cache: {
                info: 'Redis cache actif'
            }
        });
    } catch (error) {
        console.error('Error in getStats:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getHistory,
  getStats
}; 