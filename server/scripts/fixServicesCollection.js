require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function fixServicesCollection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.db.databaseName);
    
    // Check if services collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Collections in database:', collectionNames);
    
    const hasServices = collectionNames.includes('services');
    
    if (!hasServices) {
      console.log('Services collection does not exist. Creating it...');
      await mongoose.connection.db.createCollection('services');
      console.log('Services collection created successfully.');
    } else {
      console.log('Services collection exists.');
    }
    
    // Check if there are any services
    const serviceCount = await mongoose.connection.db.collection('services').countDocuments();
    console.log(`Found ${serviceCount} services in the collection`);
    
    // Get a sample service to check the structure
    if (serviceCount > 0) {
      const sample = await mongoose.connection.db.collection('services').findOne();
      console.log('Sample service document:');
      console.log(JSON.stringify(sample, null, 2));
      
      // Check if the sample has the required fields
      const requiredFields = ['name', 'duration', 'price'];
      const missingFields = requiredFields.filter(field => !sample.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.log(`Warning: Sample service is missing required fields: ${missingFields.join(', ')}`);
        
        // Update all services to ensure they have the required fields
        console.log('Updating all services to ensure they have required fields...');
        
        const services = await mongoose.connection.db.collection('services').find().toArray();
        
        for (const service of services) {
          const updates = {};
          
          if (!service.name) updates.name = 'Unnamed Service';
          if (!service.description) updates.description = '';
          if (!service.duration) updates.duration = 60;
          if (!service.price) updates.price = 0;
          if (!service.category) updates.category = 'other';
          if (service.active === undefined) updates.active = true;
          
          if (Object.keys(updates).length > 0) {
            await mongoose.connection.db.collection('services').updateOne(
              { _id: service._id },
              { $set: updates }
            );
            console.log(`Updated service ${service._id} with missing fields`);
          }
        }
      }
    }
    
    console.log('Fix completed.');
  } catch (error) {
    console.error('Error fixing services collection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixServicesCollection(); 