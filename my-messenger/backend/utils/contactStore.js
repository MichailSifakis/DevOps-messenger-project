import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const contactsFilePath = path.join(dataDir, 'contacts.json');

function ensureDataFileExists() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(contactsFilePath)) {
    fs.writeFileSync(contactsFilePath, JSON.stringify([] , null, 2), 'utf-8');
  }
}

export function readContacts() {
  ensureDataFileExists();
  const fileContent = fs.readFileSync(contactsFilePath, 'utf-8');
  try {
    const contacts = JSON.parse(fileContent);
    return Array.isArray(contacts) ? contacts : [];
  } catch {
    return [];
  }
}

export function writeContacts(contacts) {
  ensureDataFileExists();
  fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2), 'utf-8');
}

export function listContacts(ownerCode) {
  const contacts = readContacts();
  return contacts.filter(c => c.ownerCode === ownerCode);
}

export function addContact(ownerCode, peerCode) {
  const contacts = readContacts();
  const exists = contacts.some(c => c.ownerCode === ownerCode && c.peerCode === peerCode);
  if (exists) return { ownerCode, peerCode };
  const entry = { ownerCode, peerCode, createdAt: Date.now() };
  contacts.push(entry);
  writeContacts(contacts);
  return entry;
}

export function removeContact(ownerCode, peerCode) {
  const contacts = readContacts();
  const filtered = contacts.filter(c => !(c.ownerCode === ownerCode && c.peerCode === peerCode));
  writeContacts(filtered);
  return { removed: contacts.length !== filtered.length };
}


