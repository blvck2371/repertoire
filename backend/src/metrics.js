const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const EXCLUDED_PATHS = ['/api/metrics', '/api/health'];

function metricsMiddleware(req, res, next) {
  if (EXCLUDED_PATHS.includes(req.path)) {
    return next();
  }

  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;
    const status = res.statusCode.toString();

    httpRequestDuration.observe({ method, route, status }, duration);
    httpRequestTotal.inc({ method, route, status });
  });
  next();
}

async function getMetrics() {
  return register.metrics();
}

function getContentType() {
  return register.contentType;
}

module.exports = { metricsMiddleware, getMetrics, getContentType };
