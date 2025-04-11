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
    
    // First, ensure all users have a displayOrder field
    const usersWithoutOrder = await User.find({ ...query, displayOrder: { $exists: false } });
    if (usersWithoutOrder.length > 0) {
      console.log(`Found ${usersWithoutOrder.length} users without displayOrder, adding default values`);
      
      // Add a default high display order to users without one
      for (const user of usersWithoutOrder) {
        await User.findByIdAndUpdate(user._id, { $set: { displayOrder: 999 } });
      }
    }
    
    // Sort by displayOrder first, then by name
    const users = await User.find(query)
      .select('-password')
      .sort({ displayOrder: 1, firstName: 1, lastName: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/order', protect, async (req, res) => {
  try {
    console.log('Received order update request:', req.body);
    const { orderUpdates } = req.body; // Array of {userId, newOrder} objects
    
    if (!Array.isArray(orderUpdates)) {
      return res.status(400).json({ message: 'orderUpdates must be an array' });
    }
    
    // Update each user's display order
    for (const update of orderUpdates) {
      if (!update.userId || typeof update.newOrder !== 'number') {
        console.log('Skipping invalid update:', update);
        continue; // Skip invalid entries
      }
      
      const result = await User.findByIdAndUpdate(
        update.userId, 
        { displayOrder: update.newOrder },
        { new: true }
      );
      console.log(`Updated user ${update.userId} to order ${update.newOrder}:`, result ? 'Success' : 'Failed');
    }
    
    // Get the updated list of users
    const updatedUsers = await User.find({ role: 'beautician' })
      .select('-password')
      .sort({ displayOrder: 1, firstName: 1, lastName: 1 });
    
    console.log(`Returning ${updatedUsers.length} updated users`);
    res.json(updatedUsers);
  } catch (error) {
    console.error('Error updating user order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
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