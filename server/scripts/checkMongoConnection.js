require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function checkMongoConnection() {
  try {
    console.log('Checking MongoDB connection...');
    console.log('Connection string:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if required collections exist
    const requiredCollections = ['users', 'clients', 'services', 'appointments'];
    const missingCollections = [];
    
    for (const collName of requiredCollections) {
      if (!collections.some(c => c.name === collName)) {
        missingCollections.push(collName);
      }
    }
    
    if (missingCollections.length > 0) {
      console.log('\nMissing collections:');
      missingCollections.forEach(coll => console.log(`- ${coll}`));
      
      // Create missing collections
      console.log('\nCreating missing collections...');
      for (const collName of missingCollections) {
        await mongoose.connection.db.createCollection(collName);
        console.log(`- Created collection: ${collName}`);
      }
    } else {
      console.log('\nAll required collections exist.');
    }
    
    // Check document counts in each collection
    console.log('\nDocument counts:');
    for (const collName of requiredCollections) {
      const count = await mongoose.connection.db.collection(collName).countDocuments();
      console.log(`- ${collName}: ${count} documents`);
    }
    
    console.log('\nCheck completed successfully!');
  } catch (error) {
    console.error('Error checking MongoDB connection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkMongoConnection(); 