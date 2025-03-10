const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Please add a duration in minutes'],
    min: [5, 'Duration must be at least 5 minutes']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: false,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add this to help with debugging
ServiceSchema.statics.findAndLog = async function() {
  const services = await this.find();
  console.log(`Found ${services.length} services using model`);
  return services;
};

// Add a method to update all existing services to have the active field
ServiceSchema.statics.ensureActiveField = async function() {
  const count = await this.updateMany(
    { active: { $exists: false } },
    { $set: { active: true } }
  );
  console.log(`Updated ${count.modifiedCount} services to have active field`);
};

module.exports = mongoose.model('Service', ServiceSchema, 'services'); 