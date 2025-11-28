import { 
  createUser, 
  findUserByGmail, 
  findUserByCode, 
  readUsers,
  upsertUser  
} from '../../utils/userStore.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';
import mongoose from 'mongoose'; 

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
afterEach(async () => await clearTestDB());

describe('User Store', () => {
  describe('createUser', () => {
    it('should create a new user with unique code', async () => {
      const user = await createUser({
        gmail: 'newuser@test.com',
        passwordHash: 'hash123'
      });
      
      expect(user.gmail).toBe('newuser@test.com');
      expect(user.code).toBeDefined();
      expect(user.code).toMatch(/^\d{6}$/);
    });

    it('should throw error if user already exists', async () => {
      await createUser({ gmail: 'existing@test.com', passwordHash: 'hash' });
      
      await expect(
        createUser({ gmail: 'existing@test.com', passwordHash: 'hash2' })
      ).rejects.toThrow('User already exists');
    });
  });

  describe('findUserByGmail', () => {
    it('should find user by gmail', async () => {
      await createUser({ gmail: 'find@test.com', passwordHash: 'hash' });
      
      const user = await findUserByGmail('find@test.com');
      
      expect(user).toBeDefined();
      expect(user.gmail).toBe('find@test.com');
    });

    it('should return null if user not found', async () => {
      const user = await findUserByGmail('notfound@test.com');
      expect(user).toBeNull();
    });

    it('should be case-insensitive', async () => {
      await createUser({ gmail: 'case@test.com', passwordHash: 'hash' });
      
      const user = await findUserByGmail('CASE@TEST.COM');
      expect(user).toBeDefined();
    });
  });

  describe('findUserByCode', () => {
    it('should find user by code', async () => {
      const created = await createUser({ gmail: 'code@test.com', passwordHash: 'hash' });
      
      const user = await findUserByCode(created.code);
      
      expect(user).toBeDefined();
      expect(user.code).toBe(created.code);
    });
  });

  describe('readUsers', () => {
    it('should return all users', async () => {
      await createUser({ gmail: 'user1@test.com', passwordHash: 'hash1' });
      await createUser({ gmail: 'user2@test.com', passwordHash: 'hash2' });
      
      const users = await readUsers();
      
      expect(users).toHaveLength(2);
    });

    it('should return empty array if no users', async () => {
      const users = await readUsers();
      expect(users).toEqual([]);
    });
  });

  describe('upsertUser', () => {
    it('should create new user if not exists', async () => {
      const newUserData = {
        id: new mongoose.Types.ObjectId().toString(),
        gmail: 'newupdate@test.com',
        passwordHash: 'hash123',
        code: '999999'
      };
      
      const result = await upsertUser(newUserData);
      
      expect(result).toBeDefined();
      expect(result.gmail).toBe('newupdate@test.com');
      expect(result.code).toBe('999999');
    });

    it('should update existing user', async () => {
      const created = await createUser({ 
        gmail: 'toupdate@test.com', 
        passwordHash: 'oldhash' 
      });
      
      const updated = await upsertUser({
        id: created.id,
        gmail: 'toupdate@test.com',
        passwordHash: 'newhash',
        code: created.code
      });
      
      expect(updated.passwordHash).toBe('newhash');
    });
  });
});