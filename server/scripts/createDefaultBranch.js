const mongoose = require('mongoose');
const Branch = require('../models/Branch');

mongoose.connect('mongodb://localhost:27017/Salon-management')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if a default branch exists
      const existingBranch = await Branch.findOne({ isDefault: true });
      
      if (existingBranch) {
        console.log('Default branch already exists:', existingBranch);
      } else {
        // Create a default branch
        const defaultBranch = new Branch({
          name: 'Beauty 100',
          address: '123 Main Street, City, Country',
          phone: '+1 234 567 8900',
          email: 'contact@beauty100.com',
          website: 'www.beauty100.com',
          isDefault: true
        });
        
        await defaultBranch.save();
        console.log('Default branch created successfully:', defaultBranch);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 