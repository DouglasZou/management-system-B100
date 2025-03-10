const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const ClientHistory = require('../models/ClientHistory');

// Get all services
const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services' });
  }
};

// Get single service
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service' });
  }
};

// Create service
const createService = async (req, res) => {
  try {
    const { name, description, duration, price, category, active } = req.body;
    
    const service = await Service.create({
      name,
      description,
      duration,
      price,
      category,
      active
    });
    
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service' });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const { name, description, duration, price, category, active } = req.body;
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, duration, price, category, active },
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service' });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Find all appointments using this service
    const appointments = await Appointment.find({ service: id });
    const appointmentIds = appointments.map(a => a._id);
    
    // 2. Delete all client history entries related to these appointments
    await ClientHistory.deleteMany({ 
      $or: [
        { appointment: { $in: appointmentIds } },
        { service: id }
      ] 
    });
    
    // 3. Delete all appointments using this service
    await Appointment.deleteMany({ service: id });
    
    // 4. Finally delete the service
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
}; 