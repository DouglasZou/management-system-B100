require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function directMongoTest() {
  try {
    console.log('Connecting directly to MongoDB...');
    console.log('Connection string:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Check services collection
    const servicesCollection = mongoose.connection.collection('services');
    const serviceCount = await servicesCollection.countDocuments();
    console.log(`Found ${serviceCount} services in the collection`);
    
    if (serviceCount > 0) {
      const services = await servicesCollection.find().toArray();
      console.log('Services in the collection:');
      services.forEach(service => {
        console.log(`- ${service.name} (${service.duration} min, $${service.price})`);
      });
    } else {
      console.log('No services found in the collection');
      
      // Add a sample service directly
      console.log('Adding a sample service directly to the collection...');
      const result = await servicesCollection.insertOne({
        name: 'Direct Test Service',
        description: 'Added directly via MongoDB driver',
        duration: 60,
        price: 50,
        category: 'test',
        active: true
      });
      
      console.log('Sample service added:', result.insertedId);
    }
    
    console.log('Direct MongoDB test completed successfully!');
  } catch (error) {
    console.error('Error in direct MongoDB test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

directMongoTest(); 