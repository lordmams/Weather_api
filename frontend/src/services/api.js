import axios from 'axios';

// Configuration de base pour axios
const api = axios.create({
  baseURL: '/api', // Utilise le proxy nginx
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 Requête API: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse API: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur de réponse:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Service météo
export const weatherService = {
  // Météo actuelle
  getCurrentWeather: (city) => api.get(`/weather/current/${encodeURIComponent(city)}`),
  
  // Prévisions
  getForecast: (city) => api.get(`/weather/forecast/${encodeURIComponent(city)}`),
  
  // Historique
  getHistory: (city) => api.get(`/weather/history/${encodeURIComponent(city)}`),
  
  // Statistiques
  getStats: () => api.get('/weather/stats'),
  
  // Santé de l'API
  getHealth: () => api.get('/health'),
};

export default api; 