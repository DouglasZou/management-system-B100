const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

exports.getAppointmentStats = async (req, res) => {
  try {
    const { startDate, endDate, beauticianId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (beauticianId) {
      query.beautician = beauticianId;
    }

    // Get appointment counts by status
    const statusCounts = await Appointment.aggregate([
      { $match: query },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    // Get appointments by day
    const dailyAppointments = await Appointment.aggregate([
      { $match: query },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      statusCounts,
      dailyAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, beauticianId } = req.query;
    const query = {
      status: 'completed'
    };

    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (beauticianId) {
      query.beautician = beauticianId;
    }

    // Get revenue by service category
    const revenueByCategory = await Appointment.aggregate([
      { $match: query },
      { $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceDetails'
      }},
      { $unwind: '$serviceDetails' },
      { $group: {
        _id: '$serviceDetails.category',
        totalRevenue: { $sum: '$serviceDetails.price' },
        count: { $sum: 1 }
      }}
    ]);

    // Get daily revenue
    const dailyRevenue = await Appointment.aggregate([
      { $match: query },
      { $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceDetails'
      }},
      { $unwind: '$serviceDetails' },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
        totalRevenue: { $sum: '$serviceDetails.price' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      revenueByCategory,
      dailyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBeauticianPerformance = async (req, res) => {
  try {
    const { startDate, endDate, beauticianId } = req.query;
    const query = {
      status: 'completed'
    };

    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (beauticianId) {
      query.beautician = beauticianId;
    }

    const performance = await Appointment.aggregate([
      { $match: query },
      { $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceDetails'
      }},
      { $unwind: '$serviceDetails' },
      { $group: {
        _id: '$beautician',
        totalRevenue: { $sum: '$serviceDetails.price' },
        appointmentCount: { $sum: 1 },
        serviceCategories: { $addToSet: '$serviceDetails.category' }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'beauticianDetails'
      }},
      { $unwind: '$beauticianDetails' }
    ]);

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 