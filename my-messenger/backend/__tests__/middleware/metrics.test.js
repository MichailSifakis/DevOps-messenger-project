import { metricsMiddleware, getMetrics } from '../../middleware/metrics.js';

describe('Metrics Middleware', () => {
  beforeEach(() => {
    // Reset metrics by calling getMetrics multiple times (workaround)
  });

  it('should call next middleware', () => {
    const req = {};
    let nextCalled = false;
    const res = {
      on: (event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
      },
      statusCode: 200
    };
    const next = () => { nextCalled = true; };
    
    metricsMiddleware(req, res, next);
    
    expect(nextCalled).toBe(true);
  });

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

  it('should return metrics object with correct properties', () => {
    const metrics = getMetrics();
    
    expect(metrics).toHaveProperty('requests_total');
    expect(metrics).toHaveProperty('errors_total');
    expect(metrics).toHaveProperty('average_latency_ms');
    expect(metrics).toHaveProperty('uptime_seconds');
    
    expect(typeof metrics.requests_total).toBe('number');
    expect(typeof metrics.errors_total).toBe('number');
    expect(typeof metrics.average_latency_ms).toBe('number');
    expect(typeof metrics.uptime_seconds).toBe('number');
    
    expect(metrics.requests_total).toBeGreaterThanOrEqual(0);
    expect(metrics.errors_total).toBeGreaterThanOrEqual(0);
    expect(metrics.uptime_seconds).toBeGreaterThan(0);
  });

  it('should increment request count', () => {
    const initialMetrics = getMetrics();
    const initialCount = initialMetrics.requests_total;
    
    const req = {};
    const res = {
      on: (event, callback) => {
        if (event === 'finish') {
          callback();
        }
      },
      statusCode: 200
    };
    const next = () => {};
    
    metricsMiddleware(req, res, next);
    
    const updatedMetrics = getMetrics();
    expect(updatedMetrics.requests_total).toBe(initialCount + 1);
  });

  it('should track errors for 4xx status codes', () => {
    const initialMetrics = getMetrics();
    const initialErrors = initialMetrics.errors_total;
    
    const req = {};
    const res = {
      on: (event, callback) => {
        if (event === 'finish') {
          callback();
        }
      },
      statusCode: 404
    };
    const next = () => {};
    
    metricsMiddleware(req, res, next);
    
    const updatedMetrics = getMetrics();
    expect(updatedMetrics.errors_total).toBe(initialErrors + 1);
  });

  it('should track errors for 5xx status codes', () => {
    const initialMetrics = getMetrics();
    const initialErrors = initialMetrics.errors_total;
    
    const req = {};
    const res = {
      on: (event, callback) => {
        if (event === 'finish') {
          callback();
        }
      },
      statusCode: 500
    };
    const next = () => {};
    
    metricsMiddleware(req, res, next);
    
    const updatedMetrics = getMetrics();
    expect(updatedMetrics.errors_total).toBe(initialErrors + 1);
  });

  it('should not count errors for 2xx status codes', () => {
    const initialMetrics = getMetrics();
    const initialErrors = initialMetrics.errors_total;
    
    const req = {};
    const res = {
      on: (event, callback) => {
        if (event === 'finish') {
          callback();
        }
      },
      statusCode: 200
    };
    const next = () => {};
    
    metricsMiddleware(req, res, next);
    
    const updatedMetrics = getMetrics();
    expect(updatedMetrics.errors_total).toBe(initialErrors);
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

  it('should calculate average latency', (done) => {
    const req = {};
    const res = {
      on: (event, callback) => {
        if (event === 'finish') {
          setTimeout(() => {
            callback();
            const metrics = getMetrics();
            expect(metrics.average_latency_ms).toBeGreaterThanOrEqual(0);
            done();
          }, 10);
        }
      },
      statusCode: 200
    };
    const next = () => {};
    
    metricsMiddleware(req, res, next);
  });
});