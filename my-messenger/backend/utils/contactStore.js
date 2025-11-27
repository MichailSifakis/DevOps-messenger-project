import { Contact } from '../models/Contact.js';

export async function addContact(ownerCode, peerCode) {
  try {
    // Check if contact already exists
    const existing = await Contact.findOne({ ownerCode, peerCode });
    if (existing) {
      return {
        ownerCode: existing.ownerCode,
        peerCode: existing.peerCode,
        createdAt: existing.createdAt
      };
    }

    const contact = new Contact({ ownerCode, peerCode });
    await contact.save();

    return {
      ownerCode: contact.ownerCode,
      peerCode: contact.peerCode,
      createdAt: contact.createdAt
    };
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}

export async function listContacts(ownerCode) {
  try {
    const contacts = await Contact.find({ ownerCode });
    return contacts.map(c => ({
      ownerCode: c.ownerCode,
      peerCode: c.peerCode,
      createdAt: c.createdAt
    }));
  } catch (error) {
    console.error('Error listing contacts:', error);
    return [];
  }
}

export async function removeContact(ownerCode, peerCode) {
  try {
    const result = await Contact.deleteOne({ ownerCode, peerCode });
    return { removed: result.deletedCount > 0 };
  } catch (error) {
    console.error('Error removing contact:', error);
    return { removed: false };
  }
}

export async function readContacts() {
  try {
    const contacts = await Contact.find({});
    return contacts.map(c => ({
      ownerCode: c.ownerCode,
      peerCode: c.peerCode,
      createdAt: c.createdAt
    }));
  } catch (error) {
    console.error('Error reading contacts:', error);
    return [];
  }
}