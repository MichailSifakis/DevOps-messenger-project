import express from 'express';
import { appendMessage, getThreadBetweenCodes, readMessages } from '../utils/messageStore.js';
import { protect } from '../middleware/authMiddleware.js';
import { getIO } from '../socket.js';
import { Message } from '../models/Message.js';

const router = express.Router();

// Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { fromCode, toCode, text } = req.body;
    if (!fromCode || !toCode || !text) {
      res.status(400).json({ message: 'fromCode, toCode and text are required' });
      return;
    }
    
    const timestamp = Date.now();
    const message = { fromCode, toCode, text, timestamp };
    const savedMessage = await appendMessage(message);
    
    const io = getIO();
    if (io) {
      io.to(toCode).emit('message', savedMessage);
    }
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get thread between two codes
router.get('/thread', protect, async (req, res) => {
  try {
    const { a, b } = req.query;
    if (!a || !b) {
      res.status(400).json({ message: 'query params a and b (codes) are required' });
      return;
    }
    
    const thread = await getThreadBetweenCodes(a, b);
    res.json(thread);
  } catch (error) {
    console.error('Error getting thread:', error);
    res.status(500).json({ message: 'Error getting thread' });
  }
});

// Delete entire thread between two users
router.delete('/thread', protect, async (req, res) => {
  try {
    const { a, b } = req.query;
    if (!a || !b) {
      return res.status(400).json({ message: 'query params a and b (codes) are required' });
    }
    
    const result = await Message.deleteMany({
      $or: [
        { fromCode: a, toCode: b },
        { fromCode: b, toCode: a }
      ]
    });
    
    res.json({ 
      deleted: result.deletedCount,
      message: `Deleted ${result.deletedCount} messages` 
    });
  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ message: 'Error deleting thread' });
  }
});

// Get recent conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'query param code is required' });
    }
    
    // Fetch ALL messages from MongoDB where user is involved
    const all = await readMessages();
    const mine = all.filter(m => m.fromCode === code || m.toCode === code);
    
    const map = new Map();
    for (const m of mine) {
      const peer = m.fromCode === code ? m.toCode : m.fromCode;
      const existing = map.get(peer);
      if (!existing || m.timestamp > existing.lastTimestamp) {
        map.set(peer, { 
          peerCode: peer, 
          lastText: m.text, 
          lastTimestamp: m.timestamp 
        });
      }
    }
    
    const list = Array.from(map.values()).sort((a,b) => b.lastTimestamp - a.lastTimestamp);
    res.json(list);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Error getting conversations' });
  }
});

export default router;


