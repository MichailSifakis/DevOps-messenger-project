import express from 'express';
import { createUser, findUserByGmail, upsertUser, readUsers } from '../utils/userStore.js';
import { generateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (for testing)
router.get('/', async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Signup
router.post('/signup', async (req, res, next) => {
  try {
    const { gmail, password } = req.body;
    if (!gmail || !password) {
      return res.status(400).json({ message: 'Gmail and password are required' });
    }
    
    const passwordHash = password;
    const newUser = await createUser({ gmail, passwordHash });
    const token = generateToken(newUser.id, newUser.code);
    
    // Return user data with token
    res.status(201).json({ 
      id: newUser.id, 
      gmail: newUser.gmail, 
      code: newUser.code, 
      token 
    });
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ message: 'User already exists' });
    }
    next(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { gmail, password } = req.body;
    if (!gmail || !password) {
      return res.status(400).json({ message: 'Gmail and password are required' });
    }
    
    const user = await findUserByGmail(gmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (user.passwordHash !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Ensure user has a code
    if (!user.code) {
      const allUsers = await readUsers();
      const existingCodes = new Set(allUsers.filter(u => u.code).map(u => u.code));
      let code;
      do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
      } while (existingCodes.has(code));
      
      user.code = code;
      await upsertUser({ id: user._id.toString(), gmail: user.gmail, passwordHash: user.passwordHash, code: user.code });
    }
    
    const token = generateToken(user._id.toString(), user.code);
    
    // Return user data with token
    res.status(200).json({ 
      message: 'Login successful', 
      id: user._id.toString(), 
      gmail: user.gmail, 
      code: user.code, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;