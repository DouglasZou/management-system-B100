require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Use a default value if MONGO_URI is not defined
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Salon-management';

console.log('Connecting to:', mongoURI);

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('MongoDB Connected...');
    console.log('Connected to database:', mongoose.connection.db.databaseName);
    
    // List all collections in the current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in this database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 