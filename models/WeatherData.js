const { Pool } = require('pg');

class WeatherData {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async init() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS weather_data (
          id SERIAL PRIMARY KEY,
          city VARCHAR(100) NOT NULL,
          data_type VARCHAR(20) NOT NULL, -- 'current', 'forecast', 'history'
          source VARCHAR(50) NOT NULL, -- 'open-meteo', 'weatherapi'
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_weather_city_type 
        ON weather_data(city, data_type)
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_weather_created_at 
        ON weather_data(created_at)
      `);

      console.log('✅ Base de données météo initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation base:', error);
    }
  }

  async saveWeatherData(city, dataType, source, data) {
    try {
      const query = `
        INSERT INTO weather_data (city, data_type, source, data, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (city, data_type, source) 
        DO UPDATE SET 
          data = $4,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      await this.pool.query(query, [city, dataType, source, JSON.stringify(data)]);
      console.log(`💾 Données sauvegardées: ${city} - ${dataType} - ${source}`);
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  }

  async getWeatherData(city, dataType, source = null) {
    try {
      let query = `
        SELECT data, created_at, updated_at 
        FROM weather_data 
        WHERE city = $1 AND data_type = $2
      `;
      let params = [city, dataType];

      if (source) {
        query += ' AND source = $3';
        params.push(source);
      }

      query += ' ORDER BY updated_at DESC LIMIT 1';

      const result = await this.pool.query(query, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Erreur récupération:', error);
      return null;
    }
  }

  async getWeatherHistory(city, dataType, hours = 24) {
    try {
      const query = `
        SELECT data, created_at, source
        FROM weather_data 
        WHERE city = $1 
        AND data_type = $2 
        AND created_at >= NOW() - INTERVAL '${hours} hours'
        ORDER BY created_at DESC
      `;
      
      const result = await this.pool.query(query, [city, dataType]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur historique:', error);
      return [];
    }
  }

  async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT city) as unique_cities,
          COUNT(DISTINCT source) as unique_sources,
          MAX(created_at) as last_update
        FROM weather_data
      `;
      
      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erreur stats:', error);
      return null;
    }
  }

  async cleanupOldData(days = 30) {
    try {
      const query = `
        DELETE FROM weather_data 
        WHERE created_at < NOW() - INTERVAL '${days} days'
      `;
      
      const result = await this.pool.query(query);
      console.log(`🧹 Nettoyage: ${result.rowCount} anciens enregistrements supprimés`);
      return result.rowCount;
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      return 0;
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = WeatherData; 