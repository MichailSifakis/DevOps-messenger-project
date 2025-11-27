import express from 'express';
import { addContact, listContacts, removeContact } from '../utils/contactStore.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add contact
router.post('/', protect, async (req, res) => {
  try {
    const { ownerCode, peerCode } = req.body;
    if (!ownerCode || !peerCode) {
      res.status(400).json({ message: 'ownerCode and peerCode are required' });
      return;
    }
    
    const entry = await addContact(ownerCode, peerCode);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ message: 'Error adding contact' });
  }
});

// List contacts
router.get('/', protect, async (req, res) => {
  try {
    const { ownerCode } = req.query;
    if (!ownerCode) {
      res.status(400).json({ message: 'ownerCode is required' });
      return;
    }
    
    const contacts = await listContacts(ownerCode);
    res.json(contacts);
  } catch (error) {
    console.error('Error listing contacts:', error);
    res.status(500).json({ message: 'Error listing contacts' });
  }
});

// Delete contact
router.delete('/', protect, async (req, res) => {
  try {
    const { ownerCode, peerCode } = req.body || {};
    if (!ownerCode || !peerCode) {
      res.status(400).json({ message: 'ownerCode and peerCode are required' });
      return;
    }
    
    const result = await removeContact(ownerCode, peerCode);
    res.json(result);
  } catch (error) {
    console.error('Error removing contact:', error);
    res.status(500).json({ message: 'Error removing contact' });
  }
});

export default router;


