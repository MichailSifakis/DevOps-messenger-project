import jwt from 'jsonwebtoken';
import { generateToken, protect } from '../../middleware/authMiddleware.js';

describe('Auth Middleware', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken('user123', '654321');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
      expect(decoded.id).toBe('user123');
      expect(decoded.code).toBe('654321');
    });
  });

  describe('protect middleware', () => {
    it('should allow valid token', () => {
      const token = generateToken('user123', '654321');
      
      const req = {
        headers: { authorization: `Bearer ${token}` }
      };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      protect(req, res, next);
      
      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('user123');
    });

    it('should reject missing token', () => {
      const req = { headers: {} };
      let statusCode;
      let jsonResponse;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (data) => {
          jsonResponse = data;
        }
      };
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      protect(req, res, next);
      
      expect(statusCode).toBe(401);
      expect(jsonResponse).toEqual({ message: 'No token provided' });
      expect(nextCalled).toBe(false);
    });

    it('should reject invalid token', () => {
      const req = {
        headers: { authorization: 'Bearer invalidtoken' }
      };
      let statusCode;
      let jsonResponse;
      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (data) => {
          jsonResponse = data;
        }
      };
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      protect(req, res, next);
      
      expect(statusCode).toBe(401);
      expect(jsonResponse).toEqual({ message: 'Invalid token' });
      expect(nextCalled).toBe(false);
    });
  });
});