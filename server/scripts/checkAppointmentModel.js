require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Service = require('../models/Service');
const User = require('../models/User');
const { MONGO_URI } = require('../config');

async function checkAppointmentModel() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Check if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Available collections:', collectionNames);
    
    // Check if required collections exist
    const requiredCollections = ['appointments', 'clients', 'services', 'users'];
    for (const collection of requiredCollections) {
      if (!collectionNames.includes(collection)) {
        console.error(`Missing required collection: ${collection}`);
      } else {
        console.log(`Collection ${collection} exists`);
      }
    }
    
    // Check if we can fetch data from each collection
    try {
      const clientCount = await Client.countDocuments();
      console.log(`Found ${clientCount} clients`);
      
      const serviceCount = await Service.countDocuments();
      console.log(`Found ${serviceCount} services`);
      
      const userCount = await User.countDocuments();
      console.log(`Found ${userCount} users`);
      
      const appointmentCount = await Appointment.countDocuments();
      console.log(`Found ${appointmentCount} appointments`);
    } catch (error) {
      console.error('Error counting documents:', error);
    }
    
    // Try to create a test appointment
    try {
      // Get a client
      const client = await Client.findOne();
      if (!client) {
        console.error('No clients found in database');
        return;
      }
      
      // Get a service
      const service = await Service.findOne();
      if (!service) {
        console.error('No services found in database');
        return;
      }
      
      // Get a beautician
      const beautician = await User.findOne({ role: 'beautician' });
      if (!beautician) {
        console.error('No beauticians found in database');
        return;
      }
      
      console.log('Creating test appointment with:');
      console.log('- Client:', client._id, `(${client.firstName} ${client.lastName})`);
      console.log('- Service:', service._id, `(${service.name})`);
      console.log('- Beautician:', beautician._id, `(${beautician.firstName} ${beautician.lastName})`);
      
      // Create a test appointment
      const testAppointment = new Appointment({
        client: client._id,
        service: service._id,
        beautician: beautician._id,
        dateTime: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // Add 1 hour for endTime
        notes: 'Test appointment',
        status: 'scheduled',
        createdBy: beautician._id // Use beautician as creator for test
      });
      
      // Save without awaiting to check schema validation
      const validationError = testAppointment.validateSync();
      if (validationError) {
        console.error('Validation error:', validationError);
      } else {
        console.log('Appointment validation passed');
        
        // Try to save
        await testAppointment.save();
        console.log('Test appointment created successfully with ID:', testAppointment._id);
        
        // Clean up - delete the test appointment
        await Appointment.findByIdAndDelete(testAppointment._id);
        console.log('Test appointment deleted');
      }
    } catch (error) {
      console.error('Error creating test appointment:', error);
    }
    
  } catch (error) {
    console.error('Error checking appointment model:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkAppointmentModel(); 