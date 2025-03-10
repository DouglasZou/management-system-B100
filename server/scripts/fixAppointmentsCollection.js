require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function fixAppointmentsCollection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.db.databaseName);
    
    // Check if appointments collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Collections in database:', collectionNames);
    
    const hasAppointments = collectionNames.includes('appointments');
    
    if (!hasAppointments) {
      console.log('Appointments collection does not exist. Creating it...');
      
      // Create the appointments collection
      await mongoose.connection.db.createCollection('appointments');
      console.log('Appointments collection created successfully.');
    } else {
      console.log('Appointments collection exists.');
      
      // Check the structure of documents in the collection
      const appointmentSample = await mongoose.connection.db.collection('appointments').findOne();
      
      if (appointmentSample) {
        console.log('Sample appointment document:');
        console.log(JSON.stringify(appointmentSample, null, 2));
      } else {
        console.log('Appointments collection is empty.');
      }
    }
    
    console.log('Fix completed.');
  } catch (error) {
    console.error('Error fixing appointments collection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixAppointmentsCollection(); 