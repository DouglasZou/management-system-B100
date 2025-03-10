const Client = require('../models/Client');

const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ firstName: 1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients' });
  }
};

const createClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }
    
    const client = await Client.create({
      firstName,
      lastName,
      email,
      phone
    });
    
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error creating client' });
  }
};

module.exports = {
  getClients,
  createClient
}; 