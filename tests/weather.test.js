const request = require('supertest');
const app = require('../src/app'); // Importer l'app, pas le serveur
const axios = require('axios');
const geocodingService = require('../services/geocodingService');
const { disconnectRedis } = require('../services/cacheService');
const Ajv = require('ajv');
const { currentWeatherSchema, forecastSchema, historySchema, errorSchema } = require('../schemas/weatherSchemas');

const ajv = new Ajv();

jest.mock('axios');
jest.mock('../services/geocodingService');

afterAll(async () => {
  await disconnectRedis();
});

describe('Weather API Endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /weather/current/:city', () => {
    it('should return aggregated data when all sources are available', async () => {
      geocodingService.getCoordinatesForCity.mockResolvedValue({ name: 'Paris', latitude: 48.85, longitude: 2.35 });
      const mockOpenMeteo = { data: { current_weather: { temperature: 15.0, windspeed: 10.0 } } };
      const mockWeatherApi = { data: { current: { temp_c: 16.0, condition: { text: 'Cloudy' } } } };
      axios.get.mockResolvedValueOnce(mockOpenMeteo).mockResolvedValueOnce(mockWeatherApi);

      const response = await request(app).get('/weather/current/Paris');
      
      expect(response.status).toBe(200);
      expect(ajv.validate(currentWeatherSchema, response.body)).toBe(true);
      expect(response.body.sources).toHaveLength(2);
    });

    it('should return data from one source if the other fails', async () => {
      geocodingService.getCoordinatesForCity.mockResolvedValue({ name: 'Paris', latitude: 48.85, longitude: 2.35 });
      const mockOpenMeteo = { data: { current_weather: { temperature: 15.0, windspeed: 10.0 } } };
      axios.get.mockResolvedValueOnce(mockOpenMeteo).mockRejectedValueOnce(new Error('API Down'));

      const response = await request(app).get('/weather/current/Paris');
      
      expect(response.status).toBe(200);
      expect(ajv.validate(currentWeatherSchema, response.body)).toBe(true);
      expect(response.body.sources).toHaveLength(1);
    });
    
    it('should handle malformed responses from a source', async () => {
      geocodingService.getCoordinatesForCity.mockResolvedValue({ name: 'Paris', latitude: 48.85, longitude: 2.35 });
      const mockOpenMeteo = { data: { current_weather: { temperature: 15.0, windspeed: 10.0 } } };
      const mockMalformed = { data: { current: {} } };
      axios.get.mockResolvedValueOnce(mockOpenMeteo).mockResolvedValueOnce(mockMalformed);
      
      const response = await request(app).get('/weather/current/Paris');
      
      expect(response.status).toBe(200);
      expect(ajv.validate(currentWeatherSchema, response.body)).toBe(true);
      expect(response.body.sources).toHaveLength(1);
    });

    it('should return 404 if the city is not found', async () => {
      geocodingService.getCoordinatesForCity.mockRejectedValue({ statusCode: 404, message: "City not found" });
      const response = await request(app).get('/weather/current/InvalidCity');
      expect(response.status).toBe(404);
      expect(ajv.validate(errorSchema, response.body)).toBe(true);
    });
  });

  describe('GET /weather/forecast/:city', () => {
    it('should return aggregated forecast data', async () => {
      geocodingService.getCoordinatesForCity.mockResolvedValue({ name: 'London', latitude: 51.5, longitude: -0.12 });
      const mockOpenMeteo = { data: { daily: { time: ['d1'] }}};
      const mockWeatherApi = { data: { forecast: { forecastday: [{ date: 'd1', day: { maxtemp_c: 12, mintemp_c: 5, condition: {text: 'Sunny'} }}] }}};
      axios.get.mockResolvedValueOnce(mockOpenMeteo).mockResolvedValueOnce(mockWeatherApi);
      
      const response = await request(app).get('/weather/forecast/London');
      expect(response.status).toBe(200);
      expect(ajv.validate(forecastSchema, response.body)).toBe(true);
      expect(response.body.sources).toHaveLength(2);
    });

    it('should return 404 if the city is not found', async () => {
      geocodingService.getCoordinatesForCity.mockRejectedValue({ statusCode: 404, message: "City not found" });
      const response = await request(app).get('/weather/forecast/InvalidCity');
      expect(response.status).toBe(404);
      expect(ajv.validate(errorSchema, response.body)).toBe(true);
    });
  });

  describe('GET /weather/history/:city', () => {
    it('should return history for a valid city', async () => {
      geocodingService.getCoordinatesForCity.mockResolvedValue({ name: 'Berlin', latitude: 52.52, longitude: 13.40 });
      const mockHistory = { data: { daily: { time: Array(8).fill('d'), temperature_2m_max: Array(8).fill(10) } } };
      axios.get.mockResolvedValueOnce(mockHistory);
      
      const response = await request(app).get('/weather/history/Berlin');
      expect(response.status).toBe(200);
      expect(ajv.validate(historySchema, response.body)).toBe(true);
      expect(response.body.city).toBe('Berlin');
    });
    
    it('should return 404 if the city is not found', async () => {
      geocodingService.getCoordinatesForCity.mockRejectedValue({ statusCode: 404, message: "City not found" });
      const response = await request(app).get('/weather/history/InvalidCity');
      expect(response.status).toBe(404);
      expect(ajv.validate(errorSchema, response.body)).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'API is running');
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('# HELP');
    });
  });
}); 