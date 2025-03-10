const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Simple health check endpoint
router.get('/', (req, res) => {
  try {
    const status = {
      status: 'ok',
      timestamp: new Date(),
      server: 'Beauty100 API',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
    
    console.log('Health check requested:', status);
    res.json(status);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

module.exports = router; 