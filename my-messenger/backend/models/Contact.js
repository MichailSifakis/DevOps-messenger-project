import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  ownerCode: { 
    type: String, 
    required: true,
    index: true
  },
  peerCode: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
});

// Prevent duplicate contacts
ContactSchema.index({ ownerCode: 1, peerCode: 1 }, { unique: true });

const Contact = mongoose.model('Contact', ContactSchema);

export { Contact };