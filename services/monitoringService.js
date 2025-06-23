const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'weather-api'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define a custom histogram metric for HTTP request durations
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 300, 400, 500, 750, 1000, 2500, 5000] // Buckets for response time from 50ms to 5s
});

// Register the custom metric
register.registerMetric(httpRequestDurationMicroseconds);

module.exports = {
  register,
  httpRequestDurationMicroseconds
}; 