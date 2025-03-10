const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      console.log(`User not found for ID: ${decoded.user.id}`);
      // Clear the token cookie to force re-login
      res.clearCookie('token');
      return res.status(401).json({ 
        message: 'User not found, please log in again',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Add user from payload to request object
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
}; 