import { User } from '../models/User.js';

export async function readUsers() {
  try {
    return await User.find({});
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export async function findUserByGmail(gmail) {
  try {
    return await User.findOne({ gmail: gmail.toLowerCase() });
  } catch (error) {
    console.error('Error finding user by gmail:', error);
    return null;
  }
}

export async function findUserByCode(code) {
  try {
    return await User.findOne({ code });
  } catch (error) {
    console.error('Error finding user by code:', error);
    return null;
  }
}

export async function upsertUser(updatedUser) {
  try {
    const user = await User.findById(updatedUser.id);
    if (!user) {
      const newUser = new User(updatedUser);
      await newUser.save();
      return newUser;
    }
    
    Object.assign(user, updatedUser);
    await user.save();
    return user;
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

export async function createUser({ gmail, passwordHash }) {
  // Check if user exists
  const existing = await findUserByGmail(gmail);
  if (existing) {
    const error = new Error('User already exists');
    error.status = 409;
    throw error;
  }

  // Generate unique 6-digit code
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existingCode = await User.findOne({ code });
    if (!existingCode) isUnique = true;
  }

  const newUser = new User({
    gmail: gmail.toLowerCase(),
    passwordHash,
    code
  });

  await newUser.save();
  return {
    id: newUser._id.toString(),
    gmail: newUser.gmail,
    code: newUser.code
  };
}


