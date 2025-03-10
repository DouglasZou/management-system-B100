const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Service = require('../models/Service');
const mongoose = require('mongoose');
const { deleteService } = require('../controllers/serviceController');

// Get service count - IMPORTANT: This needs to be BEFORE the /:id route
router.get('/count', async (req, res) => {
  try {
    console.log('Getting service count');
    
    // Check if services collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'services' }).toArray();
    if (collections.length === 0) {
      console.log('Services collection does not exist');
      return res.status(500).json({ message: 'Services collection does not exist' });
    }
    
    const count = await Service.countDocuments();
    console.log(`Found ${count} services`);
    
    // If count is 0, check if the collection is actually empty
    if (count === 0) {
      const rawCount = await mongoose.connection.db.collection('services').countDocuments();
      console.log(`Raw count from collection: ${rawCount}`);
      
      if (rawCount > 0) {
        console.log('Collection has documents but model is not finding them. Possible schema mismatch.');
        
        // Get a sample document to check structure
        const sample = await mongoose.connection.db.collection('services').findOne();
        console.log('Sample document:', sample);
      }
    }
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting service count:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Get all services
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all services');
    const services = await Service.find().sort({ name: 1 });
    console.log(`Found ${services.length} services`);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Add a route to get only active services for appointment booking
router.get('/active', async (req, res) => {
  try {
    console.log('Fetching active services');
    const services = await Service.find({ active: true }).sort('name');
    console.log(`Found ${services.length} active services`);
    res.json(services);
  } catch (error) {
    console.error('Error fetching active services:', error);
    res.status(500).json({ message: 'Error fetching active services' });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service' });
  }
});

// Create service
router.post('/', async (req, res) => {
  try {
    const { name, description, duration, price, category, active } = req.body;
    
    const service = await Service.create({
      name,
      description,
      duration,
      price,
      category,
      active: active !== undefined ? active : true
    });
    
    res.status(201).json(service);
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({ message: 'Error creating service' });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    const { name, description, duration, price, category, active } = req.body;
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, duration, price, category, active },
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service' });
  }
});

// Delete service
router.delete('/:id', deleteService);

module.exports = router; 