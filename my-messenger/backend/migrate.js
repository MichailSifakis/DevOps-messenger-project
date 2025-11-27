import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';
import { Message } from './models/Message.js';
import { Contact } from './models/Contact.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/messenger';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Message.deleteMany({});
    await Contact.deleteMany({});
    console.log('🗑️  Cleared existing collections');

    // Migrate users
    const usersPath = path.join(__dirname, 'data/users.json');
    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      for (const user of usersData) {
        await User.create({
          gmail: user.gmail,
          passwordHash: user.passwordHash,
          code: user.code
        });
      }
      console.log(`✅ Migrated ${usersData.length} users`);
    } else {
      console.log('⚠️  No users.json found, skipping users migration');
    }

    // Migrate messages
    const messagesPath = path.join(__dirname, 'data/messages.json');
    if (fs.existsSync(messagesPath)) {
      const messagesData = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));
      for (const msg of messagesData) {
        await Message.create({
          fromCode: msg.fromCode,
          toCode: msg.toCode,
          text: msg.text,
          timestamp: msg.timestamp
        });
      }
      console.log(`✅ Migrated ${messagesData.length} messages`);
    } else {
      console.log('⚠️  No messages.json found, skipping messages migration');
    }

    // Migrate contacts
    const contactsPath = path.join(__dirname, 'data/contacts.json');
    if (fs.existsSync(contactsPath)) {
      const contactsData = JSON.parse(fs.readFileSync(contactsPath, 'utf-8'));
      for (const contact of contactsData) {
        try {
          await Contact.create({
            ownerCode: contact.ownerCode,
            peerCode: contact.peerCode
          });
        } catch (e) {
          // Skip duplicates
        }
      }
      console.log(`✅ Migrated ${contactsData.length} contacts`);
    } else {
      console.log('⚠️  No contacts.json found, skipping contacts migration');
    }

    console.log('\n🎉 Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();