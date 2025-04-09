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

// DELETE - Delete a user
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // First, check if this is a beautician
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If it's a beautician, manually delete associated data
    if (user.role === 'beautician') {
      // Delete blockouts
      const StaffBlockout = require('../models/StaffBlockout');
      await StaffBlockout.deleteMany({ beautician: userId });
      console.log(`Manually deleted blockouts for beautician ${userId}`);
      
      // Delete appointments
      const Appointment = require('../models/Appointment');
      await Appointment.deleteMany({ beautician: userId });
      console.log(`Manually deleted appointments for beautician ${userId}`);
    }
    
    // Now delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 