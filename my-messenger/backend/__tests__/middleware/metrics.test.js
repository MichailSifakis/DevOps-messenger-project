import { metricsMiddleware, getMetrics } from '../../middleware/metrics.js';

describe('Metrics Middleware', () => {
  it('should call next middleware', () => {
    const req = {};
    let nextCalled = false;
    const res = {
      on: () => {},
      statusCode: 200
    };
    const next = () => { nextCalled = true; };
    
    metricsMiddleware(req, res, next);
    
    expect(nextCalled).toBe(true);
  });

  it('should return metrics object', () => {
    const metrics = getMetrics();
    
    expect(metrics).toHaveProperty('requests_total');
    expect(metrics).toHaveProperty('errors_total');
    expect(metrics).toHaveProperty('average_latency_ms');
    expect(metrics).toHaveProperty('uptime_seconds');
  });

  it('should track metrics as numbers', () => {
    const metrics = getMetrics();
    
    expect(typeof metrics.requests_total).toBe('number');
    expect(typeof metrics.errors_total).toBe('number');
    expect(typeof metrics.average_latency_ms).toBe('number');
    expect(typeof metrics.uptime_seconds).toBe('number');
  });
});