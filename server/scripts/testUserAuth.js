require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { MONGO_URI } = require('../config');

async function testUserAuth() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users in the database`);
    
    for (const user of users) {
      console.log(`User: ${user.firstName} ${user.lastName} (${user.email}), Role: ${user.role}`);
      
      // Test with a known password (for testing only)
      const testPassword = 'password123';
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`Password match with '${testPassword}': ${isMatch}`);
    }
    
    // Test specific user login
    const testEmail = 'beautician@example.com';
    const testPassword = 'password123';
    
    const testUser = await User.findOne({ email: testEmail });
    if (testUser) {
      console.log(`\nTesting login for ${testEmail}:`);
      console.log(`User found: ${testUser.firstName} ${testUser.lastName}, Role: ${testUser.role}`);
      
      const isMatch = await bcrypt.compare(testPassword, testUser.password);
      console.log(`Password match: ${isMatch}`);
      
      if (!isMatch) {
        // Create a new hash for debugging
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(testPassword, salt);
        console.log(`New hash for '${testPassword}': ${newHash}`);
        console.log(`Current hash in DB: ${testUser.password}`);
      }
    } else {
      console.log(`\nUser with email ${testEmail} not found`);
    }
    
  } catch (error) {
    console.error('Error testing user authentication:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testUserAuth(); 