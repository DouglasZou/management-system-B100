require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function checkServicesCollection() {
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
      
      // Create the services collection
      await mongoose.connection.db.createCollection('services');
      console.log('Services collection created successfully.');
      
      // Add some sample services
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
        }
      ];
      
      await mongoose.connection.db.collection('services').insertMany(sampleServices);
      console.log(`Added ${sampleServices.length} sample services`);
    } else {
      console.log('Services collection exists.');
      
      // Check if there are any services
      const serviceCount = await mongoose.connection.db.collection('services').countDocuments();
      console.log(`Found ${serviceCount} services in the collection`);
      
      if (serviceCount === 0) {
        console.log('Services collection is empty. Adding sample services...');
        
        // Add some sample services
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
          }
        ];
        
        await mongoose.connection.db.collection('services').insertMany(sampleServices);
        console.log(`Added ${sampleServices.length} sample services`);
      } else {
        // List all services
        const services = await mongoose.connection.db.collection('services').find().toArray();
        console.log('Services in the collection:');
        services.forEach(service => {
          console.log(`- ${service.name} (${service.duration} min, $${service.price})`);
        });
      }
    }
    
    console.log('Check completed.');
  } catch (error) {
    console.error('Error checking services collection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkServicesCollection(); 