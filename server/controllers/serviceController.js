const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const ClientHistory = require('../models/ClientHistory');
const mongoose = require('mongoose');

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
    // If we're only updating popularity
    if (req.body.hasOwnProperty('popularity')) {
      const isPopular = Boolean(req.body.popularity);
      const serviceId = req.params.id;
      
      console.log(`Updating service ${serviceId} popularity to ${isPopular}`);
      
      // Convert ID to ObjectId
      const objectId = new mongoose.Types.ObjectId(serviceId);
      
      // Update directly in the database
      const result = await mongoose.connection.db.collection('services').updateOne(
        { _id: objectId },
        { $set: { popularity: isPopular } }
      );
      
      console.log('MongoDB update result:', result);
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      // Fetch all services after update
      const services = await Service.find().sort({ name: 1 });
      return res.json(services);
    }

    // For full service updates
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
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

// Update service popularity
const updatePopularity = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const isPopular = Boolean(req.body.popularity);
    
    console.log(`Updating service ${serviceId} popularity to ${isPopular}`);
    
    // Use the MongoDB driver directly
    const objectId = new mongoose.Types.ObjectId(serviceId);
    const result = await mongoose.connection.db.collection('services').updateOne(
      { _id: objectId },
      { $set: { popularity: isPopular } }
    );
    
    console.log('MongoDB update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Get all services
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error updating service popularity:', error);
    res.status(500).json({ message: 'Error updating service popularity' });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  updatePopularity
}; 