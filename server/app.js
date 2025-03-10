require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { PORT, MONGO_URI } = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const serviceRoutes = require('./routes/services');
const appointmentRoutes = require('./routes/appointments');
const healthRoutes = require('./routes/health');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
console.log('Connecting to MongoDB:', MONGO_URI);
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB:', mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Load all models
require('./models/User');
require('./models/Client');
require('./models/Service');
require('./models/Appointment');
console.log('Registered Models:', Object.keys(mongoose.models));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Check if routes are registered
console.log('Registered routes:');
console.log('- /api/auth');
console.log('- /api/users');
console.log('- /api/clients');
console.log('- /api/services');
console.log('- /api/appointments');
console.log('- /api/health');
console.log('- /api/dashboard');

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; 