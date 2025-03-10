require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists. Updating password...');
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await User.updateOne(
        { email: 'admin@example.com' },
        { 
          $set: { 
            password: hashedPassword,
            active: true
          } 
        }
      );
      
      console.log('Test user password updated');
    } else {
      // Create new test user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const newUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        phone: '123-456-7890',
        active: true
      });
      
      await newUser.save();
      console.log('Test user created successfully');
    }
    
    // Display all users
    const users = await User.find({}, '-password');
    console.log('\nAll users in database:');
    console.table(users.map(user => ({
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      active: user.active
    })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser(); 