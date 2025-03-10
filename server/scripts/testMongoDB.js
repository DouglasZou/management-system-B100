require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoDBConnection() {
  console.log('Testing MongoDB connection...');
  console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'Not defined'}`);
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database information
    const db = mongoose.connection.db;
    const stats = await db.stats();
    console.log(`\nDatabase: ${db.databaseName}`);
    console.log(`Collections: ${stats.collections}`);
    console.log(`Documents: ${stats.objects}`);
    console.log(`Storage size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    if (collections.length > 0) {
      console.log('\nCollections:');
      for (const collection of collections) {
        console.log(`- ${collection.name}`);
      }
    } else {
      console.log('\nNo collections found. Database is empty.');
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nTips:');
      console.log('1. Make sure MongoDB is running on your machine');
      console.log('2. Check if the connection string is correct');
      console.log('3. If using MongoDB Atlas, ensure your IP is whitelisted');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testMongoDBConnection(); 