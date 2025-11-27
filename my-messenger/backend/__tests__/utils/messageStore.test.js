import { 
  appendMessage, 
  getThreadBetweenCodes, 
  readMessages 
} from '../../utils/messageStore.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
afterEach(async () => await clearTestDB());

describe('Message Store', () => {
  describe('appendMessage', () => {
    it('should append a new message', async () => {
      const message = await appendMessage({
        fromCode: '123456',
        toCode: '654321',
        text: 'Hello!',
        timestamp: Date.now()
      });
      
      expect(message.id).toBeDefined();
      expect(message.fromCode).toBe('123456');
      expect(message.text).toBe('Hello!');
    });
  });

  describe('getThreadBetweenCodes', () => {
    it('should return messages between two users', async () => {
      await appendMessage({ fromCode: '111', toCode: '222', text: 'Hi', timestamp: 1000 });
      await appendMessage({ fromCode: '222', toCode: '111', text: 'Hey', timestamp: 2000 });
      await appendMessage({ fromCode: '333', toCode: '444', text: 'Other', timestamp: 3000 });
      
      const thread = await getThreadBetweenCodes('111', '222');
      
      expect(thread).toHaveLength(2);
      expect(thread[0].text).toBe('Hi');
      expect(thread[1].text).toBe('Hey');
    });

    it('should return empty array if no messages', async () => {
      const thread = await getThreadBetweenCodes('999', '888');
      expect(thread).toEqual([]);
    });

    it('should sort messages by timestamp', async () => {
      await appendMessage({ fromCode: 'A', toCode: 'B', text: 'Second', timestamp: 2000 });
      await appendMessage({ fromCode: 'A', toCode: 'B', text: 'First', timestamp: 1000 });
      
      const thread = await getThreadBetweenCodes('A', 'B');
      
      expect(thread[0].text).toBe('First');
      expect(thread[1].text).toBe('Second');
    });
  });

  describe('readMessages', () => {
    it('should return all messages', async () => {
      await appendMessage({ fromCode: 'A', toCode: 'B', text: 'Msg1', timestamp: 1000 });
      await appendMessage({ fromCode: 'C', toCode: 'D', text: 'Msg2', timestamp: 2000 });
      
      const messages = await readMessages();
      
      expect(messages).toHaveLength(2);
    });

    it('should return empty array when no messages', async () => {
      const messages = await readMessages();
      expect(messages).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle invalid message data gracefully', async () => {
      try {
        await appendMessage({ fromCode: '123' }); // Missing required fields
        // If it doesn't throw, fail the test
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('validation failed');
      }
    });
  });
});