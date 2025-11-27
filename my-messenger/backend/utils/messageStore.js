import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Message } from '../models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const messagesFilePath = path.join(dataDir, 'messages.json');

function ensureDataFileExists() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(messagesFilePath)) {
    fs.writeFileSync(messagesFilePath, JSON.stringify([] , null, 2), 'utf-8');
  }
}

export async function readMessages() {
  try {
    const messages = await Message.find({});
    return messages.map(m => ({
      id: m._id.toString(),
      fromCode: m.fromCode,
      toCode: m.toCode,
      text: m.text,
      timestamp: m.timestamp
    }));
  } catch (error) {
    console.error('Error reading messages:', error);
    return [];
  }
}

export function writeMessages(messages) {
  ensureDataFileExists();
  fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf-8');
}

export async function appendMessage(message) {
  try {
    const newMessage = new Message({
      fromCode: message.fromCode,
      toCode: message.toCode,
      text: message.text,
      timestamp: message.timestamp || Date.now()
    });
    
    await newMessage.save();
    
    return {
      id: newMessage._id.toString(),
      fromCode: newMessage.fromCode,
      toCode: newMessage.toCode,
      text: newMessage.text,
      timestamp: newMessage.timestamp
    };
  } catch (error) {
    console.error('Error appending message:', error);
    throw error;
  }
}

export async function getThreadBetweenCodes(codeA, codeB) {
  try {
    const messages = await Message.find({
      $or: [
        { fromCode: codeA, toCode: codeB },
        { fromCode: codeB, toCode: codeA }
      ]
    }).sort({ timestamp: 1 });

    return messages.map(m => ({
      id: m._id.toString(),
      fromCode: m.fromCode,
      toCode: m.toCode,
      text: m.text,
      timestamp: m.timestamp
    }));
  } catch (error) {
    console.error('Error getting thread:', error);
    return [];
  }
}


