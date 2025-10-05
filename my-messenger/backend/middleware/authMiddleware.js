// JWT auth middleware
// - protect: verifies Bearer token and attaches decoded payload to req.user
// - generateToken: signs user id + code with expiry
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'superSecretKey';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
};

export const generateToken = (userId, code) => {
  return jwt.sign({ userId, code }, JWT_SECRET, { expiresIn: '1h' });
};