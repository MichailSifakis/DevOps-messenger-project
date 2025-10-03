import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const usersFilePath = path.join(dataDir, 'users.json');

function ensureDataFileExists() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([] , null, 2), 'utf-8');
  }
}

export function readUsers() {
  ensureDataFileExists();
  const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
  try {
    const users = JSON.parse(fileContent);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

export function writeUsers(users) {
  ensureDataFileExists();
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

export function findUserByGmail(gmail) {
  const users = readUsers();
  return users.find((u) => u.gmail === gmail) || null;
}

export function upsertUser(updatedUser) {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === updatedUser.id);
  if (idx !== -1) {
    users[idx] = updatedUser;
    writeUsers(users);
    return updatedUser;
  }
  users.push(updatedUser);
  writeUsers(users);
  return updatedUser;
}

export function createUser({ gmail, passwordHash }) {
  const users = readUsers();
  if (users.some((u) => u.gmail === gmail)) {
    const error = new Error('User already exists');
    error.status = 409;
    throw error;
  }
  // Generate a unique 6-digit code
  let code;
  const existingCodes = new Set(users.map(u => u.code));
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (existingCodes.has(code));

  const newUser = { id: Date.now().toString(), gmail, passwordHash, code };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}


