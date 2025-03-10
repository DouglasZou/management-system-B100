require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Models
const User = require('../models/User');
const Client = require('../models/Client');
const Service = require('../models/Service');

// Hardcode the connection string
const mongoURI = 'mongodb://localhost:27017/Salon-management';

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('MongoDB Connected...');
    
    try {
      // Clear existing data
      await User.deleteMany({});
      await Client.deleteMany({});
      await Service.deleteMany({});
      
      console.log('Existing data cleared');
      
      // Create admin user
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
          saturday: [{ start: '09:00', end: '17:00' }],
          sunday: []
        }
      });
      
      await adminUser.save();
      console.log('Admin user created:', adminUser);
      
      // Create beautician
      const beauticianPassword = await bcrypt.hash('beauty123', salt);
      
      const beautician = new User({
        firstName: 'Beauty',
        lastName: 'Expert',
        email: 'beautician@example.com',
        password: beauticianPassword,
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
      console.log('Beautician created:', beautician);
      
      // Create clients
      const clients = [
        {
          firstName: 'Douglas',
          lastName: 'Zou',
          email: 'douglas@example.com',
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
      
      const createdClients = await Client.insertMany(clients);
      console.log(`${createdClients.length} clients created`);
      
      // Create services
      const services = [
        {
          name: 'Kidney Care 肾保养',
          description: 'Kidney care treatment',
          duration: 90,
          price: 68,
          category: 'massage',
          active: true
        },
        {
          name: 'Facial Treatment',
          description: 'Deep cleansing facial',
          duration: 60,
          price: 45,
          category: 'facial',
          active: true
        },
        {
          name: 'Massage',
          description: 'Full body massage',
          duration: 60,
          price: 55,
          category: 'massage',
          active: true
        }
      ];
      
      const createdServices = await Service.insertMany(services);
      console.log(`${createdServices.length} services created`);
      
      console.log('Database populated successfully!');
      mongoose.connection.close();
    } catch (error) {
      console.error('Error creating test data:', error);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 