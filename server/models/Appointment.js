const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  beautician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Beautician is required']
  },
  dateTime: {
    type: Date,
    required: [true, 'Date and time are required']
  },
  endTime: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'arrived', 'checked-in', 'completed', 'no-show', 'noShow', 'cancelled'],
    default: 'scheduled'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmation: {
    type: String,
    enum: ['sent', 'unsent'],
    default: 'unsent'
  }
}, {
  timestamps: true
});

// Add index for faster queries
appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ beautician: 1, dateTime: 1 });
appointmentSchema.index({ client: 1, dateTime: 1 });

// Add this to ensure custID is always populated
appointmentSchema.pre('find', function() {
  this.populate({
    path: 'client',
    select: 'firstName lastName custID email phone'
  });
});

appointmentSchema.pre('findOne', function() {
  this.populate({
    path: 'client',
    select: 'firstName lastName custID email phone'
  });
});

// Check if model already exists to prevent the OverwriteModelError
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 