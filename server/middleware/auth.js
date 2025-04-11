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
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id
      const user = await User.findById(decoded.user.id);
      
      if (!user) {
        console.log(`User not found for ID: ${decoded.user.id}`);
        return res.status(401).json({ 
          message: 'User not found, please log in again',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Add user from payload to request object
      req.user = decoded.user;
      next();
    } catch (error) {
      // If token is expired, try to refresh it
      if (error.name === 'TokenExpiredError') {
        try {
          // Decode the expired token without verification
          const decodedExpired = jwt.decode(token);
          
          if (!decodedExpired || !decodedExpired.user || !decodedExpired.user.id) {
            return res.status(401).json({ 
              message: 'Invalid token format',
              code: 'INVALID_TOKEN'
            });
          }
          
          // Find the user
          const user = await User.findById(decodedExpired.user.id);
          
          if (!user) {
            return res.status(401).json({ 
              message: 'User not found, please log in again',
              code: 'USER_NOT_FOUND'
            });
          }
          
          // Generate a new token
          const newToken = jwt.sign(
            { 
              user: {
                id: user._id,
                email: user.email,
                role: user.role
              } 
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
          );
          
          // Set the new token in the response header
          res.setHeader('x-auth-token', newToken);
          
          // Add user to request
          req.user = decodedExpired.user;
          next();
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          return res.status(401).json({ 
            message: 'Token expired and could not be refreshed',
            code: 'TOKEN_REFRESH_FAILED'
          });
        }
      } else {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ 
          message: 'Token is not valid',
          error: error.message
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 