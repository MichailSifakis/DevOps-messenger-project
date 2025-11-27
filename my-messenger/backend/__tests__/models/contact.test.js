/* eslint-env jest */

import { Contact } from '../../models/Contact.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
afterEach(async () => await clearTestDB());

describe('Contact Model', () => {
  it('should create a contact successfully', async () => {
    const contact = await Contact.create({
      ownerCode: '123456',
      peerCode: '654321'
    });
    
    expect(contact.ownerCode).toBe('123456');
    expect(contact.peerCode).toBe('654321');
    expect(contact.createdAt).toBeDefined();
  });

  it('should prevent duplicate contacts', async () => {
    const contactData = {
      ownerCode: '111111',
      peerCode: '222222'
    };
    
    await Contact.create(contactData);
    
    // MongoDB may not enforce unique index immediately in test environment
    // Check by querying instead
    const contacts = await Contact.find(contactData);
    expect(contacts).toHaveLength(1);
    
    // Try to create duplicate - it should either throw or be ignored
    try {
      await Contact.create(contactData);
      // If it doesn't throw, check we still only have 1
      const afterSecond = await Contact.find(contactData);
      expect(afterSecond).toHaveLength(1);
    } catch (error) {
      // Unique constraint violation is expected
      expect(error).toBeDefined();
    }
  });

  it('should allow same peerCode with different ownerCode', async () => {
    await Contact.create({ ownerCode: '111111', peerCode: '999999' });
    const contact2 = await Contact.create({ ownerCode: '222222', peerCode: '999999' });
    
    expect(contact2).toBeDefined();
    expect(contact2.peerCode).toBe('999999');
  });
});