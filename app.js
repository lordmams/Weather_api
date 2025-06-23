// Importer les dépendances
const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const { register } = require('./services/monitoringService');
const monitoringMiddleware = require('./middleware/monitoringMiddleware');

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Créer l'application Express
const app = express();

// Configuration Swagger
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API Météorologique',
    version: '1.0.0',
    description: 'API d\'agrégation de données météorologiques provenant de plusieurs sources',
    contact: {
      name: 'Support API',
      email: 'support@weather-api.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Serveur de développement'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Vérification de l\'état de l\'API',
        description: 'Endpoint pour vérifier que l\'API fonctionne correctement',
        responses: {
          '200': {
            description: 'API opérationnelle',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    message: { type: 'string', example: 'API is running' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/weather/current/{city}': {
      get: {
        summary: 'Météo actuelle',
        description: 'Récupère les données météorologiques actuelles pour une ville donnée',
        parameters: [
          {
            name: 'city',
            in: 'path',
            required: true,
            description: 'Nom de la ville',
            schema: { type: 'string' },
            example: 'Paris'
          }
        ],
        responses: {
          '200': {
            description: 'Données météorologiques récupérées avec succès',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CurrentWeather'
                }
              }
            }
          },
          '404': {
            description: 'Ville non trouvée',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Erreur interne du serveur',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/weather/forecast/{city}': {
      get: {
        summary: 'Prévisions météo',
        description: 'Récupère les prévisions météorologiques sur 7 jours pour une ville donnée',
        parameters: [
          {
            name: 'city',
            in: 'path',
            required: true,
            description: 'Nom de la ville',
            schema: { type: 'string' },
            example: 'London'
          }
        ],
        responses: {
          '200': {
            description: 'Prévisions récupérées avec succès',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Forecast'
                }
              }
            }
          },
          '404': {
            description: 'Ville non trouvée',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/weather/history/{city}': {
      get: {
        summary: 'Historique météo',
        description: 'Récupère l\'historique météorologique des 7 derniers jours pour une ville donnée',
        parameters: [
          {
            name: 'city',
            in: 'path',
            required: true,
            description: 'Nom de la ville',
            schema: { type: 'string' },
            example: 'Berlin'
          }
        ],
        responses: {
          '200': {
            description: 'Historique récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/History'
                }
              }
            }
          },
          '404': {
            description: 'Ville non trouvée',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/metrics': {
      get: {
        summary: 'Métriques Prometheus',
        description: 'Endpoint pour récupérer les métriques Prometheus',
        responses: {
          '200': {
            description: 'Métriques au format Prometheus',
            content: {
              'text/plain': {
                schema: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      CurrentWeather: {
        type: 'object',
        properties: {
          city: { type: 'string', example: 'Paris' },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', enum: ['Open-Meteo', 'WeatherAPI'] },
                data: { type: 'object' }
              }
            }
          }
        }
      },
      Forecast: {
        type: 'object',
        properties: {
          city: { type: 'string', example: 'London' },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', enum: ['Open-Meteo', 'WeatherAPI'] },
                data: { type: 'object' }
              }
            }
          }
        }
      },
      History: {
        type: 'object',
        properties: {
          city: { type: 'string', example: 'Berlin' },
          data: {
            type: 'object',
            properties: {
              time: { type: 'array', items: { type: 'string' } },
              temperature_2m_max: { type: 'array', items: { type: 'number' } }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'City not found' }
        }
      }
    }
  }
};

// --- Middlewares ---
// Placer le middleware de monitoring au début pour capturer toutes les requêtes
app.use(monitoringMiddleware);
// Middleware pour parser le JSON
app.use(express.json());

// --- Routes ---
const weatherRoutes = require('./routes/weather');

// Route de base pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Exposer le endpoint /metrics pour Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Utiliser le routeur pour les routes météo
app.use('/weather', weatherRoutes);

module.exports = app; // Exporter pour les tests et le serveur 