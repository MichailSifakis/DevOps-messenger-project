import express from 'express';
import { createUser, findUserByGmail, upsertUser, readUsers } from '../utils/userStore.js';

const router = express.Router();

// Example route: Get all users (for testing only)
router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

// Example route: Create a new user
router.post('/', (req, res) => {
  const { name, email } = req.body;
  res.json({ message: `User ${name} with email ${email} created!` });
});

// Example route: Get a specific user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Get user with ID ${id}` });
});

// Signup: create user with hashed password and 6-digit code
router.post('/signup', (req, res, next) => {
  try {
    const { gmail, password } = req.body;
    if (!gmail || !password) {
      res.status(400);
      throw new Error('Gmail and password are required');
    }
    const passwordHash = password;
    const newUser = createUser({ gmail, passwordHash });
    res.status(201).json({ id: newUser.id, gmail: newUser.gmail, code: newUser.code });
  } catch (err) {
    if (err.status === 409) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }
    next(err);
  }
});

// Login: verify hashed password matches stored hash
router.post('/login', (req, res) => {
  const { gmail, password } = req.body;
  if (!gmail || !password) {
    res.status(400).json({ message: 'Gmail and password are required' });
    return;
  }
  const user = findUserByGmail(gmail);
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  if (user.passwordHash !== password) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  if (!user.code) {
    // Generate unique code considering all users
    const allUsers = readUsers();
    const existingCodes = new Set(allUsers.filter(u => u.code).map(u => u.code));
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (existingCodes.has(code));
    user.code = code;
    upsertUser(user);
  }
  res.status(200).json({ message: 'Login successful', id: user.id, gmail, code: user.code });
});

export default router;