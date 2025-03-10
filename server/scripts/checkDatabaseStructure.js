require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabaseStructure() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get database information
    const db = mongoose.connection.db;
    console.log(`\nDatabase name: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`- ${collection.name}`);
      
      // Count documents in each collection
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  Documents: ${count}`);
      
      // Sample document from each collection (if any)
      if (count > 0) {
        const sample = await db.collection(collection.name).findOne({});
        console.log(`  Sample document fields: ${Object.keys(sample).join(', ')}`);
      }
    }
    
    // Check for specific collections we expect
    const hasUsers = collections.some(c => c.name === 'users');
    const hasClients = collections.some(c => c.name === 'clients');
    const hasServices = collections.some(c => c.name === 'services');
    const hasAppointments = collections.some(c => c.name === 'appointments');
    
    console.log('\nExpected collections:');
    console.log(`- users: ${hasUsers ? '✅ Found' : '❌ Missing'}`);
    console.log(`- clients: ${hasClients ? '✅ Found' : '❌ Missing'}`);
    console.log(`- services: ${hasServices ? '✅ Found' : '❌ Missing'}`);
    console.log(`- appointments: ${hasAppointments ? '✅ Found' : '❌ Missing'}`);
    
  } catch (error) {
    console.error('Error checking database structure:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkDatabaseStructure(); 