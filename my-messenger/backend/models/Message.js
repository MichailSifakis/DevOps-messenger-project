import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  fromCode: { 
    type: String, 
    required: true,
    index: true
  },
  toCode: { 
    type: String, 
    required: true,
    index: true
  },
  text: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Number, 
    default: () => Date.now() 
  }
}, { 
  timestamps: false 
});

// Compound index for faster thread queries
MessageSchema.index({ fromCode: 1, toCode: 1 });

const Message = mongoose.model('Message', MessageSchema);

export { Message };