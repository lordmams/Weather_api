# 🌤️ API Météorologique - Projet Complet

Ce projet implémente une **API REST complète** qui agrège des données météorologiques provenant de plusieurs sources externes, en suivant les meilleures pratiques de développement incluant le **Test-Driven Development (TDD)**, les **tests de contrat**, les **tests de charge**, et un **système de monitoring avancé**.

## 🎨 Nouvelle Interface Frontend Moderne

- **Onglets & boutons** : Bleus cohérents, contrastés, accessibles.
- **Cartes météo** : Affichage visuel, icônes météo, graphiques colorés.
- **Responsive** : Adapté mobile & desktop.

## 🏗️ Architecture & Stack Technologique

- **Backend**: Node.js avec Express.js
- **Tests**: Jest & Supertest (TDD)
- **Tests de charge**: Locust (Python)
- **Client HTTP**: Axios pour les appels aux API externes
- **Cache**: Redis avec TTL intelligent
- **Base de données**: PostgreSQL (pour données persistantes)
- **Monitoring**: Prometheus + Grafana
- **Documentation**: Swagger/OpenAPI
- **Containerisation**: Docker & Docker Compose
- **Validation**: Ajv pour les schémas JSON

## 🚀 Fonctionnalités Implémentées

### ✅ **Endpoints API**
- `GET /health` - Vérification de l'état de l'API
- `GET /weather/current/:city` - Météo actuelle avec agrégation multi-sources
- `GET /weather/forecast/:city` - Prévisions sur 7 jours
- `GET /weather/history/:city` - Historique des 7 derniers jours
- `GET /metrics` - Métriques Prometheus
- `GET /api-docs` - Documentation interactive Swagger

### ✅ **Agrégation Multi-Sources**
- **Open-Meteo** (sans clé API requise)
- **WeatherAPI** (avec clé API)
- Gestion intelligente des pannes (fallback)
- Agrégation des données avec consensus

### ✅ **Tests Complets**
- **Tests unitaires** avec Jest (TDD)
- **Tests d'intégration** avec Supertest
- **Tests de contrat** avec validation Ajv
- **Tests de charge** avec Locust (5 scénarios)
- **Validation des schémas** JSON

### ✅ **Monitoring & Observabilité**
- Métriques Prometheus personnalisées
- Dashboard Grafana configuré
- Middleware de monitoring
- Métriques de performance

### ✅ **Performance & Cache**
- Cache Redis avec TTL approprié
- Gestion intelligente des requêtes
- Optimisation des appels API externes

## 📦 Installation & Démarrage

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- Python 3.8+ (pour Locust)

### 1. Cloner et installer
```bash
git clone <repository>
cd weather_api
npm install
```

### 2. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les clés API (optionnel)
nano .env
```

### 3. Démarrer les services
```bash
# Démarrer tous les services (API, Redis, PostgreSQL, Prometheus, Grafana)
npm run docker:up

# Ou démarrer seulement l'API en mode développement
npm run dev
```

### 4. Vérifier l'installation
```bash
# Test de santé
curl http://localhost:3000/health

# Documentation API
open http://localhost:3000/api-docs

# Monitoring
open http://localhost:4000  # Grafana (admin/admin)
open http://localhost:9090  # Prometheus
```

## 🧪 Tests

### Tests unitaires et d'intégration
```bash
npm test
```

### Tests de charge
```bash
# Installer Locust
pip install locust

# Tests automatisés
npm run test:load smoke    # Test rapide
npm run test:load stress   # Test de stress
npm run test:load all      # Tous les scénarios

# Ou manuellement
cd tests/load
locust -f locustfile.py --host=http://localhost:3000
```

### Scénarios de test de charge disponibles
- **smoke**: 10 utilisateurs, 1 minute
- **load**: 50 utilisateurs, 5 minutes  
- **stress**: 100 utilisateurs, 10 minutes
- **spike**: 200 utilisateurs, 2 minutes
- **endurance**: 30 utilisateurs, 30 minutes

## 📊 Monitoring

### Métriques disponibles
- Temps de réponse par endpoint
- Taux d'erreur
- Utilisation du cache
- Appels aux APIs externes
- Utilisation des ressources

### Dashboards Grafana
- Performance de l'API
- Santé des services
- Métriques météorologiques
- Alertes automatiques

## 🔧 Configuration

### Variables d'environnement
```env
# APIs externes
OPENWEATHER_API_KEY=your_key_here
WEATHERAPI_KEY=your_key_here

# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/weather_db
REDIS_URL=redis://localhost:6379

# Configuration serveur
PORT=3000
NODE_ENV=development
```

### Services Docker
- **API**: Port 3000
- **PostgreSQL**: Port 5432
- **Redis**: Port 6380
- **Prometheus**: Port 9090
- **Grafana**: Port 4000

## 📈 Performance

### Métriques cibles
- Temps de réponse < 500ms (p95)
- Taux d'erreur < 5%
- Disponibilité > 99.9%
- Cache hit ratio > 80%

### Optimisations implémentées
- Cache Redis avec TTL intelligent
- Appels parallèles aux APIs externes
- Gestion des timeouts
- Fallback en cas de panne

## 🏆 Objectifs Atteints

### ✅ **TDD (Test-Driven Development)**
- Tests écrits avant l'implémentation
- Cycle Red-Green-Refactor respecté
- Couverture de tests > 80%

### ✅ **Agrégation de Données**
- Multiples sources météo
- Gestion des pannes
- Agrégation intelligente

### ✅ **Tests Multi-Niveaux**
- Tests unitaires
- Tests d'intégration
- Tests de contrat
- Tests de charge

### ✅ **Monitoring & Alertes**
- Métriques Prometheus
- Dashboards Grafana
- Alertes automatiques

### ✅ **Qualité du Code**
- Architecture modulaire
- Gestion d'erreurs robuste
- Documentation complète
- Bonnes pratiques

## 📚 Documentation API

### Accès à la documentation
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI Spec**: Documentation complète des endpoints

### Exemples d'utilisation
```bash
# Météo actuelle
curl http://localhost:3000/weather/current/Paris

# Prévisions
curl http://localhost:3000/weather/forecast/London

# Historique
curl http://localhost:3000/weather/history/Berlin
```
