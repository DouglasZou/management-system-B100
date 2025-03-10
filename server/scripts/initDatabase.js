require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Client = require('../models/Client');
const Service = require('../models/Service');

async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if we already have data
    const userCount = await User.countDocuments();
    const clientCount = await Client.countDocuments();
    const serviceCount = await Service.countDocuments();
    
    console.log(`Current data: ${userCount} users, ${clientCount} clients, ${serviceCount} services`);
    
    if (userCount > 0 && clientCount > 0 && serviceCount > 0) {
      console.log('Database already has data. Skipping initialization.');
      return;
    }
    
    console.log('Initializing database with test data...');
    
    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        active: true,
        availability: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }],
          saturday: [{ start: '09:00', end: '13:00' }],
          sunday: []
        }
      });
      
      await adminUser.save();
      console.log('Admin user created');
    }
    
    // Create beautician if it doesn't exist
    const beauticianExists = await User.findOne({ email: 'beautician@example.com' });
    
    if (!beauticianExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('beauty123', salt);
      
      const beautician = new User({
        firstName: 'Beauty',
        lastName: 'Expert',
        email: 'beautician@example.com',
        password: hashedPassword,
        role: 'beautician',
        active: true,
        availability: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }],
          saturday: [{ start: '09:00', end: '17:00' }],
          sunday: []
        }
      });
      
      await beautician.save();
      console.log('Beautician created');
    }
    
    // Create services if they don't exist
    if (await Service.countDocuments() === 0) {
      const services = [
        {
          name: 'Bust Care 胸保养',
          description: 'bust care',
          duration: 90,
          price: 68,
          category: 'other',
          active: true
        },
        {
          name: 'Kidney Care 肾保养',
          description: 'kidney treatment',
          duration: 90,
          price: 68,
          category: 'other',
          active: true
        },
        {
          name: 'Slimming 瘦身',
          description: 'slimming',
          duration: 70,
          price: 180,
          category: 'other',
          active: true
        }
      ];
      
      await Service.insertMany(services);
      console.log(`${services.length} services created`);
    }
    
    // Create clients if they don't exist
    if (await Client.countDocuments() === 0) {
      const clients = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          notes: 'Regular client'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '987-654-3210',
          notes: 'New client'
        }
      ];
      
      await Client.insertMany(clients);
      console.log(`${clients.length} clients created`);
    }
    
    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

initDatabase(); 