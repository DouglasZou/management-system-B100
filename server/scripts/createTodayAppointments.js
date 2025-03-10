require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function createTodayAppointments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.db.databaseName);
    
    // Get clients
    const clients = await mongoose.connection.collection('clients').find().toArray();
    if (clients.length === 0) {
      console.log('No clients found. Please add clients first.');
      return;
    }
    
    // Get services
    const services = await mongoose.connection.collection('services').find().toArray();
    if (services.length === 0) {
      console.log('No services found. Please add services first.');
      return;
    }
    
    // Get beauticians
    const beauticians = await mongoose.connection.collection('users').find({ role: 'beautician' }).toArray();
    if (beauticians.length === 0) {
      console.log('No beauticians found. Please add beauticians first.');
      return;
    }
    
    // Create today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create some appointments for today
    const appointments = [
      {
        client: clients[0]._id,
        service: services[0]._id,
        beautician: beauticians[0]._id,
        dateTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000),  // 11:00 AM
        notes: 'Morning appointment',
        status: 'scheduled',
        recurring: false,
        createdAt: new Date()
      },
      {
        client: clients[1] ? clients[1]._id : clients[0]._id,
        service: services[1] ? services[1]._id : services[0]._id,
        beautician: beauticians[0]._id,
        dateTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
        endTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),  // 2:00 PM
        notes: 'Afternoon appointment',
        status: 'scheduled',
        recurring: false,
        createdAt: new Date()
      },
      {
        client: clients[2] ? clients[2]._id : clients[0]._id,
        service: services[2] ? services[2]._id : services[0]._id,
        beautician: beauticians[0]._id,
        dateTime: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4:00 PM
        endTime: new Date(today.getTime() + 17 * 60 * 60 * 1000),  // 5:00 PM
        notes: 'Evening appointment',
        status: 'scheduled',
        recurring: false,
        createdAt: new Date()
      }
    ];
    
    // Delete existing appointments for today
    const deleteResult = await mongoose.connection.collection('appointments').deleteMany({
      dateTime: { 
        $gte: today, 
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
      }
    });
    console.log(`Deleted ${deleteResult.deletedCount} existing appointments for today`);
    
    // Insert new appointments
    const result = await mongoose.connection.collection('appointments').insertMany(appointments);
    console.log(`Created ${result.insertedCount} appointments for today`);
    
    // Get the created appointments with populated data for display
    const createdAppointments = await mongoose.connection.collection('appointments')
      .find({
        dateTime: { 
          $gte: today, 
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
        }
      })
      .toArray();
    
    console.log('Today\'s appointments:');
    for (const appt of createdAppointments) {
      const client = clients.find(c => c._id.toString() === appt.client.toString());
      const service = services.find(s => s._id.toString() === appt.service.toString());
      const time = new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      console.log(`- ${time}: ${client.firstName} ${client.lastName} - ${service.name}`);
    }
    
    console.log('Today\'s appointments created successfully!');
  } catch (error) {
    console.error('Error creating today\'s appointments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTodayAppointments(); 