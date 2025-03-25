const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  custID: {
    type: String,
    trim: true,
    set: v => v === '' ? null : v,  // Convert empty string to null
    get: v => v || ''  // Convert null to empty string when retrieving
  },
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
  timestamps: true,
  toJSON: { getters: true },  // Enable getters when converting to JSON
  toObject: { getters: true }  // Enable getters when converting to object
});

// Add logging middleware
clientSchema.pre('save', function(next) {
  console.log('Saving client with data:', {
    id: this._id,
    name: `${this.firstName} ${this.lastName}`,
    custID: this.custID
  });
  next();
});

clientSchema.post('save', function(doc) {
  console.log('Saved client:', doc.toObject());
});

clientSchema.pre('findOneAndUpdate', function(next) {
  console.log('Pre-update middleware:', this.getUpdate());
  next();
});

module.exports = mongoose.model('Client', clientSchema); 