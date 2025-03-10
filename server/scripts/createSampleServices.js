require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');
const Service = require('../models/Service');

async function createSampleServices() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.db.databaseName);
    
    // Sample services
    const sampleServices = [
      {
        name: 'Bust Care 胸保养',
        description: 'Bust care treatment',
        duration: 90,
        price: 68,
        category: 'other',
        active: true
      },
      {
        name: 'Kidney Care 肾保养',
        description: 'Kidney care treatment',
        duration: 90,
        price: 68,
        category: 'other',
        active: true
      },
      {
        name: 'Slimming 瘦身',
        description: 'Slimming treatment',
        duration: 70,
        price: 180,
        category: 'other',
        active: true
      },
      {
        name: 'Facial Treatment',
        description: 'Basic facial treatment',
        duration: 60,
        price: 45,
        category: 'facial',
        active: true
      },
      {
        name: 'Massage',
        description: 'Full body massage',
        duration: 60,
        price: 55,
        category: 'massage',
        active: true
      }
    ];
    
    // Delete existing services
    console.log('Deleting existing services...');
    await Service.deleteMany({});
    
    // Create new services
    console.log('Creating sample services...');
    const createdServices = await Service.create(sampleServices);
    
    console.log(`Created ${createdServices.length} sample services:`);
    createdServices.forEach(service => {
      console.log(`- ${service.name} (${service.duration} min, $${service.price})`);
    });
    
    console.log('Sample services created successfully!');
  } catch (error) {
    console.error('Error creating sample services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSampleServices(); 