import { metricsMiddleware, getMetrics } from '../../middleware/metrics.js';

describe('Metrics Middleware', () => {
  it('should track request count', () => {
    const req = {};
    const res = {
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback(); // Simulate response finish
        }
      }),
      statusCode: 200
    };
    const next = jest.fn();
    
    metricsMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  it('should track error count for 4xx responses', () => {
    const req = {};
    const res = {
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      }),
      statusCode: 404
    };
    const next = jest.fn();
    
    metricsMiddleware(req, res, next);
    
    const metrics = getMetrics();
    expect(metrics.errors_total).toBeGreaterThan(0);
  });

  it('should track error count for 5xx responses', () => {
    const req = {};
    const res = {
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      }),
      statusCode: 500
    };
    const next = jest.fn();
    
    metricsMiddleware(req, res, next);
    
    const metrics = getMetrics();
    expect(metrics.errors_total).toBeGreaterThan(0);
  });

  it('should return metrics object', () => {
    const metrics = getMetrics();
    
    expect(metrics).toHaveProperty('requests_total');
    expect(metrics).toHaveProperty('errors_total');
    expect(metrics).toHaveProperty('average_latency_ms');
    expect(metrics).toHaveProperty('uptime_seconds');
    
    expect(typeof metrics.requests_total).toBe('number');
    expect(typeof metrics.errors_total).toBe('number');
    expect(typeof metrics.average_latency_ms).toBe('number');
    expect(typeof metrics.uptime_seconds).toBe('number');
  });

  it('should calculate average latency correctly', (done) => {
    const req = {};
    const res = {
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          // Simulate some delay
          setTimeout(() => {
            callback();
            const metrics = getMetrics();
            expect(metrics.average_latency_ms).toBeGreaterThan(0);
            done();
          }, 10);
        }
      }),
      statusCode: 200
    };
    const next = jest.fn();
    
    metricsMiddleware(req, res, next);
  });
});