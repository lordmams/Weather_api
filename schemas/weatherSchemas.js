const currentWeatherSchema = {
  type: 'object',
  properties: {
    city: { type: 'string' },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', enum: ['Open-Meteo', 'WeatherAPI'] },
          data: { type: 'object' }
        },
        required: ['name', 'data']
      }
    }
  },
  required: ['city', 'sources']
};

const forecastSchema = {
  type: 'object',
  properties: {
    city: { type: 'string' },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', enum: ['Open-Meteo', 'WeatherAPI'] },
          data: { type: 'object' }
        },
        required: ['name', 'data']
      }
    }
  },
  required: ['city', 'sources']
};

const historySchema = {
  type: 'object',
  properties: {
    city: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        time: { type: 'array', items: { type: 'string' } },
        temperature_2m_max: { type: 'array', items: { type: 'number' } }
      },
      required: ['time', 'temperature_2m_max']
    }
  },
  required: ['city', 'data']
};

const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  },
  required: ['message']
};

module.exports = {
  currentWeatherSchema,
  forecastSchema,
  historySchema,
  errorSchema
}; 