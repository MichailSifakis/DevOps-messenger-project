import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function generateToken(userId, code) {
  return jwt.sign(
    { 
      id: userId, 
      code: code 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}