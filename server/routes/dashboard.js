const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Service = require('../models/Service');
const User = require('../models/User');
const { 
  getDashboardStats,
  getAppointmentCount,
  getClientCount,
  getServiceCount
} = require('../controllers/dashboardController');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Get counts
    const appointmentCount = await Appointment.countDocuments();
    const clientCount = await Client.countDocuments();
    const serviceCount = await Service.countDocuments();
    const userCount = await User.countDocuments();
    
    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ dateTime: -1 })
      .limit(5)
      .populate('client', 'firstName lastName')
      .populate('service', 'name price')
      .populate('beautician', 'firstName lastName');
    
    // Get upcoming appointments
    const now = new Date();
    const upcomingAppointments = await Appointment.find({
      dateTime: { $gte: now },
      status: { $nin: ['cancelled', 'no-show'] }
    })
      .sort({ dateTime: 1 })
      .limit(5)
      .populate('client', 'firstName lastName')
      .populate('service', 'name price')
      .populate('beautician', 'firstName lastName');
    
    res.json({
      counts: {
        appointments: appointmentCount,
        clients: clientCount,
        services: serviceCount,
        users: userCount
      },
      recentAppointments,
      upcomingAppointments
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error getting dashboard statistics' });
  }
});

// Get dashboard stats
router.get('/', protect, getDashboardStats);

// Get appointment count
router.get('/appointments/count', protect, getAppointmentCount);

// Get client count
router.get('/clients/count', protect, getClientCount);

// Get service count
router.get('/services/count', protect, getServiceCount);

// Get today's appointments
router.get('/today', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Convert string dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    const appointments = await Appointment.find({
      dateTime: {
        $gte: start,
        $lte: end
      }
    }).populate('client service beautician');

    // Count unique clients and services for today only
    const uniqueClients = new Set();
    const uniqueServices = new Set();
    
    appointments.forEach(appointment => {
      if (appointment.client) uniqueClients.add(appointment.client._id.toString());
      if (appointment.service) uniqueServices.add(appointment.service._id.toString());
    });

    // Get counts for today
    const stats = {
      appointments: appointments.length,
      clients: uniqueClients.size,  // Count of unique clients today
      services: uniqueServices.size  // Count of unique services today
    };

    res.json({
      stats,
      appointments
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get today's counts
router.get('/today-counts', async (req, res) => {
  try {
    console.log('Getting today\'s counts');
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`Date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);
    
    // Find appointments for today with valid references
    const appointments = await Appointment.find({
      dateTime: { $gte: today, $lt: tomorrow }
    })
    .populate('client')
    .populate('service')
    .populate('beautician');
    
    // Filter out appointments with missing references
    const validAppointments = appointments.filter(
      appt => appt.client && appt.service && appt.beautician
    );
    
    // Count unique clients and services for today
    const uniqueClients = new Set();
    const uniqueServices = new Set();
    
    validAppointments.forEach(appointment => {
      uniqueClients.add(appointment.client._id.toString());
      uniqueServices.add(appointment.service._id.toString());
    });
    
    const counts = {
      appointments: validAppointments.length,
      clients: uniqueClients.size,
      services: uniqueServices.size
    };
    
    console.log('Today\'s counts:', counts);
    
    res.json(counts);
  } catch (error) {
    console.error('Error getting today\'s counts:', error);
    res.status(500).json({ message: 'Error getting today\'s counts', error: error.message });
  }
});

module.exports = router; 