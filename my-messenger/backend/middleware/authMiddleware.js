// Example authentication middleware
const protect = (req, res, next) => {
  const token = req.headers.authorization;

  if (token && token === 'Bearer exampleToken') {
    next(); 
  } else {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
};

export default protect;