import { 
  addContact, 
  listContacts, 
  removeContact,
  readContacts  
} from '../../utils/contactStore.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';

beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
afterEach(async () => await clearTestDB());

describe('Contact Store', () => {
  describe('addContact', () => {
    it('should add a new contact', async () => {
      const contact = await addContact('111111', '222222');
      
      expect(contact.ownerCode).toBe('111111');
      expect(contact.peerCode).toBe('222222');
      expect(contact.createdAt).toBeDefined();
    });

    it('should return existing contact if duplicate', async () => {
      await addContact('111', '222');
      const duplicate = await addContact('111', '222');
      
      expect(duplicate.ownerCode).toBe('111');
    });
  });

  describe('listContacts', () => {
    it('should list contacts for owner', async () => {
      await addContact('owner1', 'peer1');
      await addContact('owner1', 'peer2');
      await addContact('owner2', 'peer3');
      
      const contacts = await listContacts('owner1');
      
      expect(contacts).toHaveLength(2);
      expect(contacts.map(c => c.peerCode)).toEqual(['peer1', 'peer2']);
    });
  });

  describe('removeContact', () => {
    it('should remove a contact', async () => {
      await addContact('111', '222');
      
      const result = await removeContact('111', '222');
      
      expect(result.removed).toBe(true);
      const contacts = await listContacts('111');
      expect(contacts).toHaveLength(0);
    });

    it('should return false if contact not found', async () => {
      const result = await removeContact('999', '888');
      expect(result.removed).toBe(false);
    });
  });

  describe('readContacts', () => {
    it('should return all contacts', async () => {
      await addContact('owner1', 'peer1');
      await addContact('owner2', 'peer2');
      
      const contacts = await readContacts();
      
      expect(contacts.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array when no contacts', async () => {
      const contacts = await readContacts();
      expect(contacts).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for non-existent owner', async () => {
      const contacts = await listContacts('nonexistent');
      expect(contacts).toEqual([]);
    });
  });
});