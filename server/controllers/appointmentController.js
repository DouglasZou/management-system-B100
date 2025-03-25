const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { validateAppointmentTime } = require('./configController');
const ClientHistory = require('../models/ClientHistory');
const Service = require('../models/Service');
const mongoose = require('mongoose');

exports.createAppointment = async (req, res) => {
  try {
    const { client, service, beautician, dateTime, notes } = req.body;
    
    // Validate required fields
    if (!client || !service || !beautician || !dateTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get service duration
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const duration = serviceData.duration || 60;
    const appointmentStart = new Date(dateTime);
    const appointmentEnd = new Date(new Date(dateTime).getTime() + (duration * 60000));
    
    // Check for overlapping appointments (allow max 2 concurrent)
    const overlappingAppointments = await Appointment.find({
      beautician,
      dateTime: {
        $lt: appointmentEnd
      },
      $expr: {
        $gt: [
          { $add: ["$dateTime", { $multiply: [{ $ifNull: ["$duration", 60] }, 60000] }] },
          appointmentStart
        ]
      }
    }).populate('service');
    
    // If there are already 2 concurrent appointments, reject
    if (overlappingAppointments.length >= 2) {
      return res.status(400).json({ 
        message: 'Maximum concurrent appointments reached for this time slot' 
      });
    }
    
    // Create the appointment
    const appointment = await Appointment.create({
      client,
      service,
      beautician,
      dateTime,
      notes,
      status: 'scheduled'
    });
    
    // Populate the appointment data
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'client',
        select: 'firstName lastName custID phone email',
        model: 'Client'
      })
      .populate('service', 'name duration price')
      .populate('beautician', 'firstName lastName');
    
    // Add debug log
    console.log('Populated client data:', populatedAppointment.client);
    
    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { startDate, endDate, beauticianId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (beauticianId) {
      query.beautician = beauticianId;
    }

    // If user is beautician, only show their appointments
    if (req.user.role === 'beautician') {
      query.beautician = req.user._id;
    }

    // Add this debug log to check raw client data
    const clients = await mongoose.model('Client').find({});
    console.log('All clients with their custIDs:', 
      clients.map(c => ({
        id: c._id,
        name: `${c.firstName} ${c.lastName}`,
        custID: c.custID
      }))
    );

    const appointments = await Appointment.find(query)
      .populate({
        path: 'client',
        select: 'firstName lastName custID email phone',
        model: 'Client'
      })
      .lean();

    // Add this debug log
    console.log('First appointment client data:', appointments[0]?.client);

    res.json(appointments);
  } catch (error) {
    console.error('Error in getAppointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission
    if (req.user.role !== 'admin' && appointment.beautician.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check for conflicts
    const existingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      beautician: appointment.beautician,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ],
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = 'rescheduled';
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Delete any client history entries for this appointment
    await ClientHistory.deleteMany({ appointment: id });
    
    // 2. Delete the appointment
    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation } = req.body;
    
    console.log('Updating confirmation:', { id, confirmation });

    // Use findOne first to check if appointment exists
    const appointment = await Appointment.findOne({ _id: id });
    
    if (!appointment) {
      console.log('Appointment not found:', id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update the confirmation status
    appointment.confirmation = confirmation;
    await appointment.save();

    console.log('Updated appointment:', appointment);
    res.json(appointment);
  } catch (error) {
    console.error('Error updating confirmation:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 