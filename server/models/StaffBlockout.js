const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffBlockoutSchema = new Schema({
  beautician: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    enum: ['LEAVE', 'LUNCH', 'MEETING', 'TRAINING', 'OTHER'],
    default: 'OTHER',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  versionKey: '__v'
});

// Add validation to ensure endDateTime is after startDateTime
staffBlockoutSchema.pre('validate', function(next) {
  if (this.startDateTime && this.endDateTime) {
    if (this.endDateTime <= this.startDateTime) {
      this.invalidate('endDateTime', 'End time must be after start time');
    }
  }
  next();
});

const StaffBlockout = mongoose.models.StaffBlockout || mongoose.model('StaffBlockout', staffBlockoutSchema);

module.exports = StaffBlockout; 