let requestCount = 0;
let errorCount = 0;
const requestDurations = [];

export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  requestCount++;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestDurations.push(duration);
    
    if (res.statusCode >= 400) {
      errorCount++;
    }
    
    // Keep only last 1000 requests
    if (requestDurations.length > 1000) {
      requestDurations.shift();
    }
  });
  
  next();
}

export function getMetrics() {
  const avgLatency = requestDurations.length > 0
    ? requestDurations.reduce((a, b) => a + b, 0) / requestDurations.length
    : 0;
  
  return {
    requests_total: requestCount,
    errors_total: errorCount,
    average_latency_ms: Math.round(avgLatency * 100) / 100,
    uptime_seconds: Math.round(process.uptime())
  };
}