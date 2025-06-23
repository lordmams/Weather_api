import React, { useState, useEffect } from 'react';
import { weatherService } from '../services/api';
import './Stats.css';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await weatherService.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        ❌ {error}
      </div>
    );
  }

  return (
    <div className="stats">
      <div className="stats-header">
        <h1>📊 Statistiques de l'API</h1>
        <p>Vue d'ensemble des performances et de l'utilisation</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              {stats.database?.total_records || 0}
            </div>
            <div className="stat-label">Enregistrements en base</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {stats.database?.unique_cities || 0}
            </div>
            <div className="stat-label">Villes uniques</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {stats.database?.unique_sources || 0}
            </div>
            <div className="stat-label">Sources de données</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {stats.database?.last_update ? 
                new Date(stats.database.last_update).toLocaleDateString('fr-FR') : 
                'N/A'
              }
            </div>
            <div className="stat-label">Dernière mise à jour</div>
          </div>
        </div>
      )}

      <div className="info-cards">
        <div className="card">
          <h3>🔄 Cache Redis</h3>
          <p>Le cache Redis améliore les performances en stockant temporairement les données fréquemment demandées.</p>
          <ul>
            <li><strong>Météo actuelle</strong> : Cache de 10 minutes</li>
            <li><strong>Prévisions</strong> : Cache de 1 heure</li>
            <li><strong>Historique</strong> : Cache de 24 heures</li>
          </ul>
        </div>

        <div className="card">
          <h3>💾 Persistance PostgreSQL</h3>
          <p>Les données sont persistées en base de données pour l'analyse historique et la réduction des appels API.</p>
          <ul>
            <li><strong>Agrégation</strong> : Données multi-sources</li>
            <li><strong>Historique</strong> : Conservation 30 jours</li>
            <li><strong>Nettoyage</strong> : Automatique quotidien</li>
          </ul>
        </div>

        <div className="card">
          <h3>📈 Monitoring</h3>
          <p>Surveillance en temps réel des performances et de la santé de l'API.</p>
          <ul>
            <li><strong>Prometheus</strong> : Métriques détaillées</li>
            <li><strong>Grafana</strong> : Dashboards visuels</li>
            <li><strong>Alertes</strong> : Notifications automatiques</li>
          </ul>
        </div>
      </div>

      <div className="api-info">
        <div className="card">
          <h3>🔗 Endpoints disponibles</h3>
          <div className="endpoints">
            <div className="endpoint">
              <code>GET /weather/current/:city</code>
              <span>Météo actuelle</span>
            </div>
            <div className="endpoint">
              <code>GET /weather/forecast/:city</code>
              <span>Prévisions 7 jours</span>
            </div>
            <div className="endpoint">
              <code>GET /weather/history/:city</code>
              <span>Historique 7 jours</span>
            </div>
            <div className="endpoint">
              <code>GET /weather/stats</code>
              <span>Statistiques</span>
            </div>
            <div className="endpoint">
              <code>GET /health</code>
              <span>Santé de l'API</span>
            </div>
            <div className="endpoint">
              <code>GET /metrics</code>
              <span>Métriques Prometheus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats; 