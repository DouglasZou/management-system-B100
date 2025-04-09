const express = require('express');
const router = express.Router();
const StaffBlockout = require('../models/StaffBlockout');
const { isAuthenticated } = require('../middleware/auth');

// GET - Get all blockouts with optional filtering
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, beautician } = req.query;
    
    // Build query object
    const query = {};
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.startDateTime = { $gte: new Date(startDate) };
      query.endDateTime = { $lte: new Date(endDate) };
    }
    
    // Add beautician filter if provided
    if (beautician) {
      query.beautician = beautician;
    }
    
    const blockouts = await StaffBlockout.find(query)
      .populate('beautician', 'firstName lastName')
      .sort({ startDateTime: 1 });
    
    res.json(blockouts);
  } catch (error) {
    console.error('Error fetching blockouts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST - Create a new blockout
router.post('/', async (req, res) => {
  try {
    const { beautician, startDateTime, endDateTime, reason, notes } = req.body;
    
    // Validate required fields
    if (!beautician || !startDateTime || !endDateTime || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create new blockout
    const blockout = new StaffBlockout({
      beautician,
      startDateTime,
      endDateTime,
      reason,
      notes
    });
    
    await blockout.save();
    res.status(201).json(blockout);
  } catch (error) {
    console.error('Error creating blockout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET - Get a specific blockout by ID
router.get('/:id', async (req, res) => {
  try {
    const blockout = await StaffBlockout.findById(req.params.id)
      .populate('beautician', 'firstName lastName');
    
    if (!blockout) {
      return res.status(404).json({ message: 'Blockout not found' });
    }
    
    res.json(blockout);
  } catch (error) {
    console.error('Error fetching blockout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT - Update a blockout
router.put('/:id', async (req, res) => {
  try {
    const { beautician, startDateTime, endDateTime, reason, notes } = req.body;
    
    // Find and update the blockout
    const blockout = await StaffBlockout.findByIdAndUpdate(
      req.params.id,
      { beautician, startDateTime, endDateTime, reason, notes },
      { new: true, runValidators: true }
    );
    
    if (!blockout) {
      return res.status(404).json({ message: 'Blockout not found' });
    }
    
    res.json(blockout);
  } catch (error) {
    console.error('Error updating blockout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE - Delete a blockout
router.delete('/:id', async (req, res) => {
  try {
    const blockout = await StaffBlockout.findByIdAndDelete(req.params.id);
    
    if (!blockout) {
      return res.status(404).json({ message: 'Blockout not found' });
    }
    
    res.json({ message: 'Blockout deleted successfully' });
  } catch (error) {
    console.error('Error deleting blockout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 