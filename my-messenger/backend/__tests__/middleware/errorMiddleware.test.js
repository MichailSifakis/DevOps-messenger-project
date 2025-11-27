import errorHandler from '../../middleware/errorMiddleware.js';

describe('Error Middleware', () => {
  it('should handle errors with status code', (done) => {
    const err = new Error('Test error');
    err.status = 404;
    
    const req = {};
    const res = {
      status: function(code) {
        expect(code).toBe(404);
        return this;
      },
      json: function(data) {
        expect(data.message).toBe('Test error');
        done();
      }
    };
    const next = () => {};
    
    errorHandler(err, req, res, next);
  });

  it('should default to 500 for errors without status', (done) => {
    const err = new Error('Server error');
    
    const req = {};
    const res = {
      status: function(code) {
        expect(code).toBe(500);
        return this;
      },
      json: function(data) {
        expect(data.message).toBe('Server error');
        done();
      }
    };
    const next = () => {};
    
    errorHandler(err, req, res, next);
  });

  it('should handle errors with custom properties', (done) => {
    const err = new Error('Custom error');
    err.status = 403;
    
    const req = {};
    const res = {
      status: function(code) {
        expect(code).toBe(403);
        return this;
      },
      json: function(data) {
        expect(data.message).toBe('Custom error');
        done();
      }
    };
    const next = () => {};
    
    errorHandler(err, req, res, next);
  });
});