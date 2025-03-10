const SalonConfig = require('../models/SalonConfig');

exports.getSalonConfig = async (req, res) => {
  try {
    let config = await SalonConfig.findOne();
    if (!config) {
      return res.status(404).json({ message: 'Salon configuration not found' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSalonConfig = async (req, res) => {
  try {
    const {
      salonName,
      contactEmail,
      contactPhone,
      address,
      operatingHours,
      appointmentRules,
      timezone,
      currency,
      logo,
      notificationSettings
    } = req.body;

    let config = await SalonConfig.findOne();
    
    if (!config) {
      config = new SalonConfig({
        salonName,
        contactEmail,
        contactPhone
      });
    }

    // Update fields if provided
    if (salonName) config.salonName = salonName;
    if (contactEmail) config.contactEmail = contactEmail;
    if (contactPhone) config.contactPhone = contactPhone;
    if (address) config.address = address;
    if (operatingHours) config.operatingHours = operatingHours;
    if (appointmentRules) config.appointmentRules = appointmentRules;
    if (timezone) config.timezone = timezone;
    if (currency) config.currency = currency;
    if (logo) config.logo = logo;
    if (notificationSettings) config.notificationSettings = notificationSettings;

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOperatingHours = async (req, res) => {
  try {
    const { operatingHours } = req.body;
    let config = await SalonConfig.findOne();

    if (!config) {
      return res.status(404).json({ message: 'Salon configuration not found' });
    }

    config.operatingHours = operatingHours;
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAppointmentRules = async (req, res) => {
  try {
    const { appointmentRules } = req.body;
    let config = await SalonConfig.findOne();

    if (!config) {
      return res.status(404).json({ message: 'Salon configuration not found' });
    }

    config.appointmentRules = {
      ...config.appointmentRules,
      ...appointmentRules
    };
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility function to check if appointment can be scheduled
exports.validateAppointmentTime = async (startTime, endTime) => {
  const config = await SalonConfig.findOne();
  if (!config) throw new Error('Salon configuration not found');

  const appointmentDate = new Date(startTime);
  const dayOfWeek = appointmentDate.toLocaleString('en-US', { weekday: 'long' });
  
  // Check operating hours
  const dayConfig = config.operatingHours.find(h => h.day === dayOfWeek);
  if (!dayConfig || !dayConfig.isOpen) {
    throw new Error('Salon is closed on this day');
  }

  // Check if within operating hours
  const [openHour] = dayConfig.openTime.split(':');
  const [closeHour] = dayConfig.closeTime.split(':');
  const appointmentHour = appointmentDate.getHours();

  if (appointmentHour < parseInt(openHour) || appointmentHour >= parseInt(closeHour)) {
    throw new Error('Appointment time is outside operating hours');
  }

  // Check advance booking limit
  const daysInAdvance = Math.ceil((appointmentDate - new Date()) / (1000 * 60 * 60 * 24));
  if (daysInAdvance > config.appointmentRules.maxDaysInAdvance) {
    throw new Error(`Appointments can only be booked up to ${config.appointmentRules.maxDaysInAdvance} days in advance`);
  }

  return true;
}; 