const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, updateAvailability, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Get all users - with optional role filter
router.get('/', async (req, res) => {
  try {
    const { role, includeInactive } = req.query;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    // Only include active users unless specifically requested
    if (includeInactive !== 'true') {
      query.active = true;
    }
    
    const users = await User.find(query).select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', protect, updateUser);
router.put('/:id/availability', protect, updateAvailability);

// Get all users
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({ active: true }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Users API is working' });
});

router.delete('/:id', deleteUser);

module.exports = router; 