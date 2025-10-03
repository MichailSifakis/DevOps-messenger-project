import express from 'express';
import { findUserByGmail } from '../utils/userStore.js';
import { appendMessage, getThreadBetweenCodes, readMessages } from '../utils/messageStore.js';
import { getIO } from '../socket.js';

const router = express.Router();

// Send a message { fromCode, toCode, text }
router.post('/', (req, res) => {
  const { fromCode, toCode, text } = req.body;
  if (!fromCode || !toCode || !text) {
    res.status(400).json({ message: 'fromCode, toCode and text are required' });
    return;
  }
  const timestamp = Date.now();
  const message = { id: `${timestamp}`, fromCode, toCode, text, timestamp };
  appendMessage(message);
  const io = getIO();
  if (io) {
    io.to(toCode).emit('message', message);
  }
  res.status(201).json(message);
});

// Get thread messages between two codes
router.get('/thread', (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) {
    res.status(400).json({ message: 'query params a and b (codes) are required' });
    return;
  }
  const thread = getThreadBetweenCodes(a, b);
  res.json(thread);
});

// Get recent conversations for a given code
router.get('/conversations', (req, res) => {
  const { code } = req.query;
  if (!code) {
    res.status(400).json({ message: 'query param code is required' });
    return;
  }
  const all = readMessages();
  const mine = all.filter(m => m.fromCode === code || m.toCode === code);
  const map = new Map();
  for (const m of mine) {
    const peer = m.fromCode === code ? m.toCode : m.fromCode;
    const existing = map.get(peer);
    if (!existing || m.timestamp > existing.lastTimestamp) {
      map.set(peer, { peerCode: peer, lastText: m.text, lastTimestamp: m.timestamp });
    }
  }
  const list = Array.from(map.values()).sort((a,b) => b.lastTimestamp - a.lastTimestamp);
  res.json(list);
});

export default router;


