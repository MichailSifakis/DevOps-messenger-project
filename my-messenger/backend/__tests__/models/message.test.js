import { Message } from '../../models/Message.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
afterEach(async () => await clearTestDB());

describe('Message Model', () => {
  it('should create a message successfully', async () => {
    const messageData = {
      fromCode: '123456',
      toCode: '654321',
      text: 'Hello, World!',
      timestamp: Date.now()
    };
    
    const message = await Message.create(messageData);
    
    expect(message.fromCode).toBe('123456');
    expect(message.toCode).toBe('654321');
    expect(message.text).toBe('Hello, World!');
    expect(message.timestamp).toBeDefined();
  });

  it('should auto-generate timestamp if not provided', async () => {
    const message = await Message.create({
      fromCode: '111111',
      toCode: '222222',
      text: 'Test message'
    });
    
    expect(message.timestamp).toBeDefined();
    expect(typeof message.timestamp).toBe('number');
  });

  it('should require fromCode, toCode, and text', async () => {
    await expect(Message.create({ text: 'test' })).rejects.toThrow();
    await expect(Message.create({ fromCode: '123' })).rejects.toThrow();
  });
});