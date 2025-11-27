import { User } from '../../models/User.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
afterEach(async () => await clearTestDB());

describe('User Model', () => {
  it('should create a user successfully', async () => {
    const userData = {
      gmail: 'test@example.com',
      passwordHash: 'hashedpassword123',
      code: '123456'
    };
    
    const user = await User.create(userData);
    
    expect(user.gmail).toBe('test@example.com');
    expect(user.passwordHash).toBe('hashedpassword123');
    expect(user.code).toBe('123456');
    expect(user._id).toBeDefined();
  });

  it('should enforce unique gmail', async () => {
    const userData = {
      gmail: 'duplicate@example.com',
      passwordHash: 'hash123',
      code: '111111'
    };
    
    await User.create(userData);
    
    await expect(
      User.create({ ...userData, code: '222222' })
    ).rejects.toThrow();
  });

  it('should enforce unique code', async () => {
    await User.create({
      gmail: 'user1@example.com',
      passwordHash: 'hash1',
      code: '123456'
    });
    
    await expect(
      User.create({
        gmail: 'user2@example.com',
        passwordHash: 'hash2',
        code: '123456'
      })
    ).rejects.toThrow();
  });

  it('should lowercase gmail automatically', async () => {
    const user = await User.create({
      gmail: 'TEST@EXAMPLE.COM',
      passwordHash: 'hash',
      code: '654321'
    });
    
    expect(user.gmail).toBe('test@example.com');
  });

  it('should require all fields', async () => {
    await expect(User.create({ gmail: 'test@test.com' })).rejects.toThrow();
    await expect(User.create({ passwordHash: 'hash' })).rejects.toThrow();
    await expect(User.create({ code: '123456' })).rejects.toThrow();
  });
});