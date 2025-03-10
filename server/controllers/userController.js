const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ClientHistory = require('../models/ClientHistory');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, availability, services, active } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.availability = availability || user.availability;
    user.services = services || user.services;
    
    if (active !== undefined) {
      user.active = active;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.availability = req.body.availability;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Find all appointments with this beautician
    const appointments = await Appointment.find({ beautician: id });
    const appointmentIds = appointments.map(a => a._id);
    
    // 2. Delete all client history entries related to these appointments
    await ClientHistory.deleteMany({ 
      $or: [
        { appointment: { $in: appointmentIds } },
        { beautician: id }
      ] 
    });
    
    // 3. Delete all appointments with this beautician
    await Appointment.deleteMany({ beautician: id });
    
    // 4. Finally delete the user
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 