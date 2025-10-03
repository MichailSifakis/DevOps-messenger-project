import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

export function readMessages() {
  ensureDataFileExists();
  const fileContent = fs.readFileSync(messagesFilePath, 'utf-8');
  try {
    const messages = JSON.parse(fileContent);
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
}

export function writeMessages(messages) {
  ensureDataFileExists();
  fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf-8');
}

export function appendMessage(message) {
  const messages = readMessages();
  messages.push(message);
  writeMessages(messages);
  return message;
}

export function getThreadBetweenCodes(codeA, codeB) {
  const messages = readMessages();
  return messages.filter(m =>
    (m.fromCode === codeA && m.toCode === codeB) ||
    (m.fromCode === codeB && m.toCode === codeA)
  ).sort((a,b) => a.timestamp - b.timestamp);
}


