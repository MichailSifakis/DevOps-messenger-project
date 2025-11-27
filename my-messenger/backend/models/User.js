import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  gmail: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  }
}, { 
  timestamps: true 
});

const User = mongoose.model('User', UserSchema);

export { User };