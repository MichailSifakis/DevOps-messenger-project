import express from 'express';
import { addContact, listContacts, removeContact } from '../utils/contactStore.js';

const router = express.Router();

// Add contact by code
router.post('/', (req, res) => {
  const { ownerCode, peerCode } = req.body;
  if (!ownerCode || !peerCode) {
    res.status(400).json({ message: 'ownerCode and peerCode are required' });
    return;
  }
  const entry = addContact(ownerCode, peerCode);
  res.status(201).json(entry);
});

// List contacts
router.get('/', (req, res) => {
  const { ownerCode } = req.query;
  if (!ownerCode) {
    res.status(400).json({ message: 'ownerCode is required' });
    return;
  }
  res.json(listContacts(ownerCode));
});

export default router;

// Delete a contact
router.delete('/', (req, res) => {
  const { ownerCode, peerCode } = req.body || {};
  if (!ownerCode || !peerCode) {
    res.status(400).json({ message: 'ownerCode and peerCode are required' });
    return;
  }
  const result = removeContact(ownerCode, peerCode);
  res.json(result);
});


