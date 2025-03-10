const express = require('express');
const router = express.Router();
const {
  getSalonConfig,
  updateSalonConfig,
  updateOperatingHours,
  updateAppointmentRules
} = require('../controllers/configController');
const { protect } = require('../middleware/auth');
const checkAdmin = require('../middleware/checkAdmin');

// All routes require admin access
router.use(protect);
router.use(checkAdmin);

router.get('/', getSalonConfig);
router.put('/', updateSalonConfig);
router.put('/operating-hours', updateOperatingHours);
router.put('/appointment-rules', updateAppointmentRules);

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Config API is working' });
});

module.exports = router; 