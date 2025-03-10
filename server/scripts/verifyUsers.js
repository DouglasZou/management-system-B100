require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function verifyUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Count users
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    if (userCount === 0) {
      console.log('No users found. Creating a test admin user...');
      
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        active: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      // List all users
      const users = await User.find({}, '-password');
      console.log('\nUsers in database:');
      
      users.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.email}), Role: ${user.role}, Active: ${user.active}`);
      });
      
      // Check if admin@example.com exists
      const adminUser = await User.findOne({ email: 'admin@example.com' });
      
      if (!adminUser) {
        console.log('\nAdmin user not found. Creating admin@example.com...');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const newAdmin = new User({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          active: true
        });
        
        await newAdmin.save();
        console.log('Admin user created successfully');
      } else {
        console.log('\nAdmin user found. Updating password...');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        adminUser.password = hashedPassword;
        adminUser.active = true;
        
        await adminUser.save();
        console.log('Admin user password updated');
      }
    }
    
  } catch (error) {
    console.error('Error verifying users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyUsers(); 