require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function debugModels() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Load all models
    require('../models/User');
    require('../models/Client');
    require('../models/Service');
    require('../models/Appointment');
    
    // Check registered models
    console.log('Registered Models:', Object.keys(mongoose.models));
    
    // Check collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in each collection
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }
    
    // Try to fetch one document from each collection
    for (const collection of collections) {
      const doc = await mongoose.connection.db.collection(collection.name).findOne();
      console.log(`Sample from ${collection.name}:`, doc ? 'Found' : 'None');
      if (doc) {
        console.log(`ID: ${doc._id}`);
      }
    }
    
    console.log('Debug completed successfully!');
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugModels(); 