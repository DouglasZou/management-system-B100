require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function createTestAppointment() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Load ALL models first to ensure they're registered
    require('../models/User');
    require('../models/Client');
    require('../models/Service');
    const Appointment = require('../models/Appointment');
    
    console.log('All models loaded');
    
    // Get a client, service, and beautician ID from your database
    const clientId = await mongoose.connection.db.collection('clients').findOne().then(doc => doc._id);
    const serviceId = await mongoose.connection.db.collection('services').findOne().then(doc => doc._id);
    const beauticianId = await mongoose.connection.db.collection('users').findOne({ role: 'beautician' }).then(doc => doc ? doc._id : null);
    
    if (!clientId || !serviceId || !beauticianId) {
      console.error('Could not find required IDs:');
      console.log('Client ID:', clientId);
      console.log('Service ID:', serviceId);
      console.log('Beautician ID:', beauticianId);
      return;
    }
    
    // Create a test appointment
    const appointment = new Appointment({
      client: clientId,
      service: serviceId,
      beautician: beauticianId,
      dateTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      notes: 'Test appointment created by script',
      status: 'scheduled',
      createdBy: beauticianId // Use beautician as creator for now
    });
    
    console.log('Saving appointment:', appointment);
    await appointment.save();
    console.log('Appointment saved successfully with ID:', appointment._id);
    
    // Populate the appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('client', 'firstName lastName email phone')
      .populate('service', 'name price duration')
      .populate('beautician', 'firstName lastName');
      
    console.log('Populated appointment:', JSON.stringify(populatedAppointment, null, 2));
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error creating test appointment:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestAppointment(); 