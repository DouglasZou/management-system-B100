const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const mongoose = require('mongoose');
const Client = require('../models/Client');
const ClientHistory = require('../models/ClientHistory');
const appointmentController = require('../controllers/appointmentController');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, beautician } = req.query;
    
    let query = {};
    
    // Filter by date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.dateTime = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      const startOfStartDate = new Date(startDate);
      startOfStartDate.setHours(0, 0, 0, 0);
      
      const endOfEndDate = new Date(endDate);
      endOfEndDate.setHours(23, 59, 59, 999);
      
      query.dateTime = { $gte: startOfStartDate, $lte: endOfEndDate };
    }
    
    // Filter by beautician
    if (beautician) {
      query.beautician = beautician;
    }
    
    const appointments = await Appointment.find(query)
      .populate('client', 'firstName lastName phone email')
      .populate('service', 'name duration price')
      .populate('beautician', 'firstName lastName')
      .sort({ dateTime: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a test route to check if the appointments collection is accessible
router.get('/test', async (req, res) => {
  try {
    const count = await Appointment.countDocuments();
    res.json({ 
      message: 'Appointments API is working',
      count: count,
      collectionExists: true
    });
  } catch (error) {
    console.error('Error testing appointments API:', error);
    res.status(500).json({ 
      message: 'Error testing appointments API',
      error: error.message
    });
  }
});

// Check availability route
router.get('/check-availability', async (req, res) => {
  try {
    const { beauticianId, date } = req.query;
    
    if (!beauticianId || !date) {
      return res.status(400).json({ 
        message: 'Beautician ID and date are required' 
      });
    }
    
    // Get the beautician
    const beautician = await User.findById(beauticianId);
    if (!beautician) {
      return res.status(404).json({ message: 'Beautician not found' });
    }
    
    // Get the day of the week
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Check if the beautician works on this day
    const dayAvailability = beautician.availability[dayOfWeek];
    if (!dayAvailability || dayAvailability.length === 0) {
      return res.json({ available: false, reason: 'Beautician does not work on this day' });
    }
    
    // Check if the time is within the beautician's working hours
    const timeStr = dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    let isAvailable = false;
    for (const slot of dayAvailability) {
      if (timeStr >= slot.start && timeStr <= slot.end) {
        isAvailable = true;
        break;
      }
    }
    
    if (!isAvailable) {
      return res.json({ 
        available: false, 
        reason: 'Time is outside beautician working hours' 
      });
    }
    
    // Check if the beautician has any appointments at this time
    const startTime = new Date(date);
    const endTime = new Date(date);
    endTime.setMinutes(endTime.getMinutes() + 60); // Default 1 hour
    
    const existingAppointments = await Appointment.find({
      beautician: beauticianId,
      date: { $lt: endTime, $gt: startTime },
      status: { $nin: ['cancelled', 'no-show'] }
    });
    
    if (existingAppointments.length > 0) {
      return res.json({ 
        available: false, 
        reason: 'Beautician has another appointment at this time' 
      });
    }
    
    // If we get here, the beautician is available
    return res.json({ available: true });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Error checking availability' });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'firstName lastName email phone')
      .populate('service', 'name duration price')
      .populate('beautician', 'firstName lastName');
      
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment' });
  }
});

// Create appointment
router.post('/', async (req, res) => {
  try {
    console.log('Creating appointment with data:', req.body);
    
    const { client, service, beautician, dateTime, notes, status } = req.body;
    
    // Validate required fields
    if (!client || !service || !beautician || !dateTime) {
      return res.status(400).json({ 
        message: 'Client, service, beautician, and dateTime are required' 
      });
    }
    
    // Get service details to calculate endTime
    const serviceDetails = await Service.findById(service);
    if (!serviceDetails) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Calculate endTime based on service duration
    const startDateTime = new Date(dateTime);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(startDateTime.getMinutes() + (serviceDetails.duration || 60)); // Default to 60 minutes if duration not specified
    
    console.log('Calculated appointment times:', {
      startDateTime,
      endDateTime,
      duration: serviceDetails.duration || 60
    });
    
    // Create new appointment
    const appointment = new Appointment({
      client,
      service,
      beautician,
      dateTime: startDateTime,
      endTime: endDateTime, // Add the calculated endTime
      notes,
      status: status || 'scheduled',
      // Use a default user ID since we're bypassing authentication
      createdBy: '67bdc6faea8c6ae0feec4147' // Use your admin user ID here
    });
    
    console.log('Saving appointment:', JSON.stringify(appointment, null, 2));
    
    try {
      await appointment.save();
      console.log('Appointment saved successfully with ID:', appointment._id);
    } catch (saveError) {
      console.error('Error saving appointment to database:', saveError);
      return res.status(500).json({ 
        message: 'Error saving appointment to database',
        error: saveError.message
      });
    }
    
    // Populate the appointment with related data
    let populatedAppointment;
    try {
      populatedAppointment = await Appointment.findById(appointment._id)
        .populate('client', 'firstName lastName email phone')
        .populate('service', 'name price duration')
        .populate('beautician', 'firstName lastName');
        
      console.log('Populated appointment:', JSON.stringify(populatedAppointment, null, 2));
    } catch (populateError) {
      console.error('Error populating appointment:', populateError);
      // Still return the unpopulated appointment
      return res.status(201).json(appointment);
    }
    
    res.status(201).json(populatedAppointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: err.stack
    });
  }
});

// Update an appointment
router.put('/:id', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const updateData = req.body;
    
    console.log('Updating appointment:', appointmentId);
    console.log('Update data:', updateData);
    
    // First update the appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    )
    .populate('client')
    .populate('service')
    .populate('beautician');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Then check if there's a corresponding client history record
    const existingHistory = await ClientHistory.findOne({ appointment: appointmentId });
    
    // If there is, update it with the new appointment data
    if (existingHistory) {
      console.log('Updating corresponding client history record');
      
      // Update the client history with the new appointment data
      existingHistory.service = appointment.service._id;
      existingHistory.beautician = appointment.beautician._id;
      existingHistory.date = appointment.dateTime;
      existingHistory.notes = appointment.notes || '';
      
      await existingHistory.save();
      console.log('Client history updated');
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    console.log('Delete appointment request received');
    
    // Check if the appointment exists
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Find and delete any associated client history records
    const deletedHistory = await ClientHistory.deleteMany({ appointment: req.params.id });
    console.log(`Deleted ${deletedHistory.deletedCount} client history records for appointment ${req.params.id}`);
    
    // Delete the appointment
    await Appointment.findByIdAndDelete(req.params.id);
    console.log(`Deleted appointment ${req.params.id}`);
    
    // Return success response
    res.json({ 
      message: 'Appointment and associated history deleted successfully',
      historyRecordsDeleted: deletedHistory.deletedCount
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a test route
router.post('/test', (req, res) => {
  console.log('Test endpoint called with data:', req.body);
  res.json({ success: true, message: 'Test endpoint working' });
});

// Update the count route to work without authentication temporarily
router.get('/count', async (req, res) => {
  try {
    console.log('Getting appointment count');
    const count = await Appointment.countDocuments();
    console.log(`Found ${count} appointments`);
    res.json({ count });
  } catch (error) {
    console.error('Error getting appointment count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update the appointment status route to create history entries
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find the appointment with populated fields
    const appointment = await Appointment.findById(req.params.id)
      .populate('client')
      .populate('service')
      .populate('beautician');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update appointment status
    appointment.status = status;
    await appointment.save();
    
    // Record in client history for significant status changes
    if (['arrived', 'completed', 'noShow', 'no-show'].includes(status)) {
      // Check if history already exists for this appointment
      const existingHistory = await ClientHistory.findOne({ appointment: appointment._id });
      
      if (existingHistory) {
        // Update existing history
        existingHistory.status = status;
        await existingHistory.save();
        console.log(`Updated history record for appointment ${appointment._id} with status ${status}`);
      } else {
        // Create new history record
        const newHistory = await ClientHistory.create({
          client: appointment.client._id,
          appointment: appointment._id,
          service: appointment.service._id,
          beautician: appointment.beautician._id,
          date: appointment.dateTime,
          status: status,
          notes: appointment.notes || ''
        });
        console.log(`Created new history record ${newHistory._id} for appointment ${appointment._id} with status ${status}`);
      }
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Keep only this specific route for confirmation
router.patch('/:id/confirmation', appointmentController.updateConfirmation);

// Add this route to get appointments by beautician ID with better error handling
router.get('/beautician/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Beautician ID is required' });
    }

    const appointments = await Appointment.find({ 
      beautician: req.params.id,
      // Only get appointments that have all required relations
      client: { $exists: true },
      service: { $exists: true }
    })
    .populate('client', 'firstName lastName custID phone')
    .populate('service', 'name')
    .sort({ dateTime: -1 });
    
    // Filter out any appointments with missing data
    const validAppointments = appointments.filter(apt => 
      apt.client && apt.service && apt.dateTime
    );
    
    res.json(validAppointments);
  } catch (error) {
    console.error('Error fetching beautician appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route to get appointments by client ID
router.get('/client/:id', async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      client: req.params.id 
    })
    .populate('service', 'name duration price')
    .populate('beautician', 'firstName lastName')
    .sort({ dateTime: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new route
router.patch('/:id/seeConsultant', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { seeConsultant } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { seeConsultant },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error updating seeConsultant:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 