const mongoose = require('mongoose');

const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  isOpen: { type: Boolean, default: true },
  openTime: { type: String, required: true },
  closeTime: { type: String, required: true }
});

const appointmentRuleSchema = new mongoose.Schema({
  maxDaysInAdvance: { type: Number, default: 60 },
  minHoursNotice: { type: Number, default: 24 },
  cancellationPolicy: { type: String },
  defaultDuration: { type: Number, default: 60 } // in minutes
});

const salonConfigSchema = new mongoose.Schema({
  salonName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  operatingHours: [operatingHoursSchema],
  appointmentRules: appointmentRuleSchema,
  timezone: { type: String, default: 'UTC' },
  currency: { type: String, default: 'USD' },
  logo: String,
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('SalonConfig', salonConfigSchema); 