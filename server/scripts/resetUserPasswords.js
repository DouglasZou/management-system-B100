require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { MONGO_URI } = require('../config');

async function resetUserPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users in the database`);
    
    // Reset password for each user
    for (const user of users) {
      console.log(`Resetting password for user: ${user.firstName} ${user.lastName} (${user.email})`);
      
      // Set a default password
      user.password = 'password123';
      
      // Save the user - this will trigger the pre-save hook that hashes the password
      await user.save();
      
      console.log(`Password reset successfully for ${user.email}`);
    }
    
    console.log('\nAll passwords have been reset to "password123"');
    
  } catch (error) {
    console.error('Error resetting user passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetUserPasswords(); 