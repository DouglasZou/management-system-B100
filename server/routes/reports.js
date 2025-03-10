const express = require('express');
const router = express.Router();
const {
  getAppointmentStats,
  getRevenueReport,
  getBeauticianPerformance
} = require('../controllers/reportController');
const auth = require('../middleware/auth');
const checkAdmin = require('../middleware/checkAdmin');

router.use(auth);

// Admin only routes
router.get('/appointments', checkAdmin, getAppointmentStats);
router.get('/revenue', checkAdmin, getRevenueReport);
router.get('/beautician-performance', checkAdmin, getBeauticianPerformance);

// Beautician can view their own performance
router.get('/my-performance', auth, async (req, res) => {
  req.query.beauticianId = req.user._id;
  await getBeauticianPerformance(req, res);
});

module.exports = router; 