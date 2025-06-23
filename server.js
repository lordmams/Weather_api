const app = require('./app');
const { connectRedis } = require('./services/cacheService');

// Définir le port d'écoute
const PORT = process.env.PORT || 3000;

// Connexion à Redis au démarrage
connectRedis();

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Exporter le serveur pour pouvoir le fermer proprement dans les tests
module.exports = server; 