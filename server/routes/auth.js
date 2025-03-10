const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, role } = req.body;
    
    // Validate role
    if (role !== 'admin' && role !== 'beautician') {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      role
    });
    
    // Save the user - this will trigger the pre-save hook that hashes the password
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    console.log('Login attempt:', { email, role });
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user._id, role: user.role, requestedRole: role });
    
    // Check if role matches - but make this optional to debug
    if (role && user.role !== role) {
      console.log('Role mismatch:', { userRole: user.role, requestedRole: role });
      return res.status(400).json({ message: 'Invalid role for this user' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password match, generating token');
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          throw err;
        }
        
        console.log('Login successful, returning token');
        
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 