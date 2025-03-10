const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true // allows null/undefined values
  },
  phone: {
    type: String,
    trim: true
  },
  countryCode: {
    type: String,
    default: '+65' // Default to Singapore
  },
  notes: {
    type: String,
    default: ''  // Add default empty string to ensure field exists
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''  // Add default empty string
  },
  active: {
    type: Boolean,
    default: true
  },
  preferences: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema); 