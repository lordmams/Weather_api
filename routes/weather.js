const express = require('express');
const router = express.Router();
const {
  getCurrentWeather,
  getForecast,
  getHistory
} = require('../controllers/weatherController');

// Route to get the current weather for a specific city
router.get('/current/:city', getCurrentWeather);

// Route to get the 7-day weather forecast for a specific city
router.get('/forecast/:city', getForecast);

// Route to get the weather history for the last 7 days for a specific city
router.get('/history/:city', getHistory);

module.exports = router; 