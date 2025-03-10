const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Service = require('../models/Service');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Count appointments, clients, and services
    const appointmentsCount = await Appointment.countDocuments();
    const clientsCount = await Client.countDocuments();
    const servicesCount = await Service.countDocuments();
    
    // Get upcoming appointments
    const today = new Date();
    const upcomingAppointments = await Appointment.find({
      date: { $gte: today }
    })
    .sort({ date: 1 })
    .limit(5)
    .populate('client', 'firstName lastName')
    .populate('service', 'name');
    
    res.json({
      stats: {
        appointments: appointmentsCount,
        clients: clientsCount,
        services: servicesCount
      },
      upcomingAppointments
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment count
exports.getAppointmentCount = async (req, res) => {
  try {
    const count = await Appointment.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error getting appointment count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get client count
exports.getClientCount = async (req, res) => {
  try {
    const count = await Client.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error getting client count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get service count
exports.getServiceCount = async (req, res) => {
  try {
    const count = await Service.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error getting service count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 