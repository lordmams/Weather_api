const app = require('./app');
const { connectRedis } = require('../services/cacheService');
const WeatherData = require('../models/WeatherData');

// Définir le port d'écoute
const PORT = process.env.PORT || 3000;

// Initialisation des services
async function initializeServices() {
  try {
    // Connexion à Redis (optionnel)
    try {
      await connectRedis();
      console.log('✅ Redis connecté');
    } catch (error) {
      console.log('⚠️ Redis non disponible, application continue sans cache');
    }

    // Initialisation de la base de données
    const weatherData = new WeatherData();
    await weatherData.init();
    console.log('✅ Base de données initialisée');

    // Nettoyage automatique des anciennes données (tous les jours)
    setInterval(async () => {
      await weatherData.cleanupOldData(30); // Garder 30 jours
    }, 24 * 60 * 60 * 1000); // 24 heures

  } catch (error) {
    console.error('❌ Erreur initialisation services:', error);
    // Don't exit the process, let the server start anyway
  }
}

// Démarrer le serveur
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  await initializeServices();
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

// Exporter le serveur pour pouvoir le fermer proprement dans les tests
module.exports = server; 