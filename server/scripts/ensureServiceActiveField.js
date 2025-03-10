// Create a script to ensure all services have the active field
const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

const ensureServiceActiveField = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    
    // Update all services without an active field
    const result = await Service.updateMany(
      { active: { $exists: false } },
      { $set: { active: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} services to have active field`);
    
    // Verify all services now have the active field
    const services = await Service.find();
    console.log(`Total services: ${services.length}`);
    console.log(`Services with active field: ${services.filter(s => s.active !== undefined).length}`);
    
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error:', error);
  }
};

ensureServiceActiveField(); 