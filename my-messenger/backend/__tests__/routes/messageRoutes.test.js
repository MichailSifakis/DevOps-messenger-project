import request from 'supertest';
import express from 'express';
import messageRoutes from '../../routes/messageRoutes.js';
import userRoutes from '../../routes/userRoutes.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

let token1, user1Code, token2, user2Code;

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

beforeEach(async () => {
  await clearTestDB();
  
  // Create two test users
  const res1 = await request(app)
    .post('/api/users/signup')
    .send({ gmail: 'user1@test.com', password: 'hash1' });
  token1 = res1.body.token;
  user1Code = res1.body.code;
  
  const res2 = await request(app)
    .post('/api/users/signup')
    .send({ gmail: 'user2@test.com', password: 'hash2' });
  token2 = res2.body.token;
  user2Code = res2.body.code;
});

describe('POST /api/messages', () => {
  it('should send a message', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        fromCode: user1Code,
        toCode: user2Code,
        text: 'Hello!'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.text).toBe('Hello!');
    expect(res.body.fromCode).toBe(user1Code);
  });

  it('should reject without token', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ fromCode: user1Code, toCode: user2Code, text: 'Test' });
    
    expect(res.status).toBe(401);
  });

  it('should reject with missing fields', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token1}`)
      .send({ fromCode: user1Code });
    
    expect(res.status).toBe(400);
  });
});

describe('GET /api/messages/thread', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token1}`)
      .send({ fromCode: user1Code, toCode: user2Code, text: 'Hi' });
    
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token2}`)
      .send({ fromCode: user2Code, toCode: user1Code, text: 'Hey' });
  });

  it('should get thread between two users', async () => {
    const res = await request(app)
      .get(`/api/messages/thread?a=${user1Code}&b=${user2Code}`)
      .set('Authorization', `Bearer ${token1}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].text).toBe('Hi');
  });

  it('should reject without token', async () => {
    const res = await request(app)
      .get(`/api/messages/thread?a=${user1Code}&b=${user2Code}`);
    
    expect(res.status).toBe(401);
  });
});

describe('GET /api/messages/conversations', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token1}`)
      .send({ fromCode: user1Code, toCode: user2Code, text: 'First message' });
    
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token2}`)
      .send({ fromCode: user2Code, toCode: user1Code, text: 'Reply' });
  });

  it('should get list of conversations for user', async () => {
    const res = await request(app)
      .get(`/api/messages/conversations?code=${user1Code}`)
      .set('Authorization', `Bearer ${token1}`);
    
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should reject without token', async () => {
    const res = await request(app)
      .get(`/api/messages/conversations?code=${user1Code}`);
    
    expect(res.status).toBe(401);
  });

  it('should reject without code parameter', async () => {
    const res = await request(app)
      .get('/api/messages/conversations')
      .set('Authorization', `Bearer ${token1}`);
    
    expect(res.status).toBe(400);
  });
});