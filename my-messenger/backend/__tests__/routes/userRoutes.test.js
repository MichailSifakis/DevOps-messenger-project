import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/userRoutes.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
afterEach(async () => await clearTestDB());

describe('POST /api/users/signup', () => {
  it('should create a new user and return token', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        gmail: 'newuser@test.com',
        password: 'hashedpassword'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('code');
    expect(res.body.gmail).toBe('newuser@test.com');
  });

  it('should reject signup with missing fields', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ gmail: 'test@test.com' });
    
    expect(res.status).toBe(400);
  });

  it('should reject duplicate gmail', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ gmail: 'dup@test.com', password: 'hash' });
    
    const res = await request(app)
      .post('/api/users/signup')
      .send({ gmail: 'dup@test.com', password: 'hash2' });
    
    expect(res.status).toBe(409);
  });
});

describe('POST /api/users/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ gmail: 'login@test.com', password: 'correcthash' });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ gmail: 'login@test.com', password: 'correcthash' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.gmail).toBe('login@test.com');
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ gmail: 'login@test.com', password: 'wronghash' });
    
    expect(res.status).toBe(401);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ gmail: 'notfound@test.com', password: 'hash' });
    
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ gmail: 'user1@test.com', password: 'hash1' });
    
    await request(app)
      .post('/api/users/signup')
      .send({ gmail: 'user2@test.com', password: 'hash2' });
  });

  it('should return all users', async () => {
    const res = await request(app).get('/api/users');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe('POST /api/users/login - edge cases', () => {
  it('should reject login with missing password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ gmail: 'test@test.com' });
    
    expect(res.status).toBe(400);
  });

  it('should reject login with missing gmail', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ password: 'hash' });
    
    expect(res.status).toBe(400);
  });
});