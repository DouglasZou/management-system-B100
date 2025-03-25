const express = require('express');
const router = express.Router();
const { getClients, createClient } = require('../controllers/simpleClientController');
const { deleteClient } = require('../controllers/clientController');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');
const ClientHistory = require('../models/ClientHistory');
const mongoose = require('mongoose');

router.get('/', getClients);
router.post('/', async (req, res) => {
  try {
    console.log('Creating client with data:', req.body);
    
    // Include custID in clientData
    const clientData = {
      custID: req.body.custID,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      notes: req.body.notes || '',
      gender: req.body.gender || ''
    };
    
    console.log('Processed client data:', clientData);
    
    const client = new Client(clientData);
    await client.save();
    
    console.log('Client saved successfully:', client);
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add a simple GET route to fetch all clients
router.get('/all', async (req, res) => {
  try {
    console.log('Fetching all clients');
    const clients = await Client.find().sort({ firstName: 1 });
    console.log(`Found ${clients.length} clients`);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
});

// Update the count route to work without authentication temporarily
router.get('/count', async (req, res) => {
  try {
    console.log('Getting client count');
    const count = await Client.countDocuments();
    console.log(`Found ${count} clients`);
    res.json({ count });
  } catch (error) {
    console.error('Error getting client count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update the route to get client history to include all status types
router.get('/:id/history', async (req, res) => {
  try {
    console.log(`Fetching history for client: ${req.params.id}`);
    
    const clientHistory = await ClientHistory.find({ client: req.params.id })
      .populate('service')
      .populate('beautician')
      .populate('appointment')
      .sort({ date: -1 });
    
    console.log(`Found ${clientHistory.length} history records`);
    
    // Log the status distribution
    const statusCounts = {
      arrived: clientHistory.filter(h => h.status === 'arrived').length,
      completed: clientHistory.filter(h => h.status === 'completed').length,
      noShow: clientHistory.filter(h => h.status === 'noShow').length
    };
    console.log('Status distribution:', statusCounts);
    
    res.json(clientHistory);
  } catch (error) {
    console.error('Error fetching client history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Make sure there's a route to get a single client by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching client with ID:', req.params.id);
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      console.log('Client not found');
      return res.status(404).json({ message: 'Client not found' });
    }
    
    console.log('Client found:', client);
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Error fetching client' });
  }
});

// Update your client routes to use the new controller
router.delete('/:id', deleteClient);

// Similarly for the PUT route to update clients
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating client with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const updateData = {
      custID: req.body.custID,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      notes: req.body.notes || '',
      gender: req.body.gender || ''
    };
    
    console.log('Processed update data:', updateData);
    
    const client = await Client.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    console.log('Client updated successfully:', client);
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add this temporary debug route
router.get('/debug/:id', async (req, res) => {
  try {
    // Direct MongoDB query
    const client = await mongoose.connection.collection('clients')
      .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    
    console.log('Raw MongoDB client data:', client);
    res.json(client);
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 