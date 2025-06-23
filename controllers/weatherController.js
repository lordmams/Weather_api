const axios = require('axios');
const geocodingService = require('../services/geocodingService');
const { getCache, setCache } = require('../services/cacheService');

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
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            console.log(`[Current] Cache hit for ${city}`);
            return res.status(200).json(cachedData);
        }
        console.log(`[Current] Cache miss for ${city}.`);

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

        if (results[0].status === 'fulfilled' && results[0].value.data.current_weather) {
            aggregatedData.sources.push({
                name: 'Open-Meteo',
                data: results[0].value.data.current_weather
            });
        }
        if (results[1].status === 'fulfilled' && results[1].value.data.current) {
            aggregatedData.sources.push({
                name: 'WeatherAPI',
                data: results[1].value.data.current
            });
        }

        if (aggregatedData.sources.length === 0) {
            return res.status(502).json({ message: 'Could not retrieve weather data from any source.' });
        }
        
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
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            console.log(`[Forecast] Cache hit for ${city}`);
            return res.status(200).json(cachedData);
        }
        console.log(`[Forecast] Cache miss for ${city}.`);

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

        if (results[0].status === 'fulfilled' && results[0].value.data.daily) {
            aggregatedData.sources.push({
                name: 'Open-Meteo',
                data: results[0].value.data.daily
            });
        }
        if (results[1].status === 'fulfilled' && results[1].value.data?.forecast?.forecastday) {
            aggregatedData.sources.push({
                name: 'WeatherAPI',
                data: results[1].value.data.forecast.forecastday
            });
        }

        if (aggregatedData.sources.length === 0) {
            return res.status(502).json({ message: 'Could not retrieve forecast data from any source.' });
        }

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
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            console.log(`[History] Cache hit for ${city}`);
            return res.status(200).json(cachedData);
        }
        console.log(`[History] Cache miss for ${city}.`);

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
        
        await setCache(cacheKey, historicalData, 3600 * 24); // Cache for 24 hours
        res.status(200).json(historicalData);

    } catch (error) {
        console.error('Error in getHistory:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getHistory
}; 