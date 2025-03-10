require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/Salon-management',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_for_development_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
}; 