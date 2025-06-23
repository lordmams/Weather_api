const axios = require('axios');
const { getCache, setCache } = require('./cacheService');

/**
 * Retrieves geographic coordinates (latitude and longitude) for a given city.
 * It first checks for a cached result and, if not found, queries the API-Ninjas Geocoding API.
 * Successful results are cached for 24 hours.
 * 
 * @param {string} city The name of the city to geocode.
 * @returns {Promise<object>} A promise that resolves to an object containing the city's name, latitude, and longitude.
 * @throws {Error} Throws an error if the city is not found or if the API call fails.
 */
const getCoordinatesForCity = async (city) => {
  const cacheKey = `geocoding:${city}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log(`[Geocoding] Cache hit for ${city}`);
    return cachedData;
  }
  console.log(`[Geocoding] Cache miss for ${city}. Fetching from API.`);

  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/geocoding', {
      params: { city },
      headers: { 'X-Api-Key': process.env.API_NINJAS_KEY }
    });

    if (response.data && response.data.length > 0) {
      const { name, latitude, longitude } = response.data[0];
      const locationData = { name, latitude, longitude };
      // Cache for 24 hours
      await setCache(cacheKey, locationData, 3600 * 24); 
      return locationData;
    } else {
      const error = new Error(`City '${city}' not found.`);
      error.statusCode = 404;
      throw error;
    }
  } catch (error) {
    // If the error is already a 404, just re-throw it.
    if (error.statusCode === 404) {
      throw error;
    }
    // Otherwise, create a standardized error.
    console.error(`Error fetching geocoding data for ${city}:`, error.message);
    const standardizedError = new Error(error.response?.data?.error || `Failed to get coordinates for ${city}.`);
    standardizedError.statusCode = error.response?.status || 500;
    throw standardizedError;
  }
};

module.exports = { getCoordinatesForCity }; 