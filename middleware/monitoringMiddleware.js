const { httpRequestDurationMicroseconds } = require('../services/monitoringService');

const monitoringMiddleware = (req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ route: req.route?.path || req.path, code: res.statusCode, method: req.method });
  });
  next();
};

module.exports = monitoringMiddleware; 