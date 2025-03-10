// Add this at the top to debug
console.log('Loading client controller...');

const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const ClientHistory = require('../models/ClientHistory');

// Add this to debug
console.log('Client model:', Client);

// Get all clients
exports.getClients = async (req, res) => {
  console.log('getClients function called');
  try {
    const clients = await Client.find().sort({ firstName: 1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients' });
  }
};

// Get single client
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client' });
  }
};

// Create client
exports.createClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    // Check if client with email already exists
    if (email) {
      const existingClient = await Client.findOne({ email });
      if (existingClient) {
        return res.status(400).json({ message: 'Client with this email already exists' });
      }
    }

    const client = await Client.create({
      firstName,
      lastName,
      email,
      phone
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Error creating client' });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error updating client' });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Find all appointments for this client
    const appointments = await Appointment.find({ client: id });
    const appointmentIds = appointments.map(a => a._id);
    
    // 2. Delete all client history entries for this client
    await ClientHistory.deleteMany({ client: id });
    
    // 3. Delete all appointments for this client
    await Appointment.deleteMany({ client: id });
    
    // 4. Finally delete the client
    const client = await Client.findByIdAndDelete(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addClientNote = async (req, res) => {
  try {
    const { content } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.notes.push({
      content,
      createdBy: req.user._id
    });

    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.importClients = async (req, res) => {
  res.status(501).json({ message: 'CSV import functionality temporarily disabled' });
};

exports.exportClients = async (req, res) => {
  res.status(501).json({ message: 'CSV export functionality temporarily disabled' });
}; 