const mongoose = require('mongoose');
const WhatsappTemplate = require('../models/WhatsappTemplate');

mongoose.connect('mongodb://localhost:27017/Salon-management')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if default template exists
      const existingTemplate = await WhatsappTemplate.findOne({ isDefault: true });
      
      if (existingTemplate) {
        console.log('Default template already exists:', existingTemplate);
      } else {
        // Create default appointment confirmation template
        const defaultTemplate = new WhatsappTemplate({
          name: 'Appointment Confirmation',
          template: 'Hi {clientName},\n\n' +
            '𝗧𝗵𝗶𝘀 𝗶𝘀 𝗮 𝗰𝗼𝗻𝗳𝗶𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗼𝗳 𝘆𝗼𝘂𝗿 𝘂𝗽𝗰𝗼𝗺𝗶𝗻𝗴 𝗮𝗽𝗽𝗼𝗶𝗻𝘁𝗺𝗲𝗻𝘁 𝗮𝘁 𝗕𝘂𝗴𝗶𝘀 𝗯𝗿𝗮𝗻𝗰𝗵.\n\n' +
            'Date: {appointmentDate}\n' +
            'Service: {serviceName}\n\n' +
            'We look forward to seeing you! If you need to reschedule or have any questions, feel free to reply to this message.\n\n' +
            'See you soon!\n' +
            'BEAUTY 100 𝗕𝘂𝗴𝗶𝘀.',
          isDefault: true,
          variables: ['clientName', 'appointmentDate', 'serviceName'],
          description: 'Default appointment confirmation message'
        });
        
        await defaultTemplate.save();
        console.log('Default template created successfully:', defaultTemplate);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 