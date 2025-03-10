require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');
const Service = require('../models/Service');

async function testServicesModel() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.db.databaseName);
    
    // Test finding all services using the model
    console.log('\nTesting Service.find():');
    const services = await Service.find();
    console.log(`Found ${services.length} services using the model`);
    
    if (services.length > 0) {
      console.log('First service from model:');
      console.log(services[0]);
    } else {
      console.log('No services found using the model');
      
      // Check if there are actually services in the collection
      const rawCount = await mongoose.connection.db.collection('services').countDocuments();
      console.log(`Raw count from collection: ${rawCount}`);
      
      if (rawCount > 0) {
        console.log('Collection has documents but model is not finding them. Possible schema mismatch.');
        
        // Get a sample document to check structure
        const sample = await mongoose.connection.db.collection('services').findOne();
        console.log('Sample document from raw collection:');
        console.log(JSON.stringify(sample, null, 2));
        
        // Try to create a new service
        console.log('\nTrying to create a new service:');
        const newService = new Service({
          name: 'Test Service',
          description: 'This is a test service',
          duration: 60,
          price: 50,
          category: 'test',
          active: true
        });
        
        await newService.save();
        console.log('New service created successfully:');
        console.log(newService);
      }
    }
    
    console.log('\nTest completed.');
  } catch (error) {
    console.error('Error testing services model:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testServicesModel(); 