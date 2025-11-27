import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Connect to in-memory MongoDB before all tests
export async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri);
  console.log('✅ Test DB connected');
}

// Disconnect and stop MongoDB after all tests
export async function teardownTestDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('❌ Test DB disconnected');
}

// Clear all collections between tests
export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}