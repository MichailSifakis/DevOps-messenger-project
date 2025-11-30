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
  
  // Return in Prometheus format (plain text)
  return `# HELP requests_total Total number of HTTP requests
# TYPE requests_total counter
requests_total ${requestCount}

# HELP errors_total Total number of HTTP errors (4xx and 5xx)
# TYPE errors_total counter
errors_total ${errorCount}

# HELP http_request_duration_ms Average HTTP request duration in milliseconds
# TYPE http_request_duration_ms gauge
http_request_duration_ms ${Math.round(avgLatency * 100) / 100}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${Math.round(process.uptime())}
`;
}