import request from 'supertest';
import express from 'express';
import contactRoutes from '../../routes/contactRoutes.js';
import userRoutes from '../../routes/userRoutes.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);

let token, userCode;

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());

beforeEach(async () => {
  await clearTestDB();
  
  const res = await request(app)
    .post('/api/users/signup')
    .send({ gmail: 'test@test.com', password: 'hash' });
  token = res.body.token;
  userCode = res.body.code;
});

describe('POST /api/contacts', () => {
  it('should add a contact', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ownerCode: userCode, peerCode: '999999' });
    
    expect(res.status).toBe(201);
    expect(res.body.peerCode).toBe('999999');
  });

  it('should reject without token', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .send({ ownerCode: userCode, peerCode: '999999' });
    
    expect(res.status).toBe(401);
  });
});

describe('GET /api/contacts', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ownerCode: userCode, peerCode: '111111' });
  });

  it('should list contacts', async () => {
    const res = await request(app)
      .get(`/api/contacts?ownerCode=${userCode}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].peerCode).toBe('111111');
  });
});

describe('DELETE /api/contacts', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ownerCode: userCode, peerCode: '222222' });
  });

  it('should delete a contact', async () => {
    const res = await request(app)
      .delete('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ownerCode: userCode, peerCode: '222222' });
    
    expect(res.status).toBe(200);
    expect(res.body.removed).toBe(true);
  });
});