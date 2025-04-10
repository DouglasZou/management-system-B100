const mongoose = require('mongoose');

const whatsappTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  variables: [{
    type: String,
    trim: true
  }], // e.g., ['clientName', 'appointmentDate', 'serviceName']
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WhatsappTemplate', whatsappTemplateSchema); 