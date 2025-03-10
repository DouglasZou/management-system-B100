require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️ .env file not found. Creating a sample .env file...');
    
    const sampleEnv = `
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/beauty100

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
`;
    
    fs.writeFileSync(envPath, sampleEnv.trim());
    console.log('✅ Sample .env file created. Please update it with your actual values.');
  } else {
    console.log('✅ .env file exists.');
    
    // Check for required variables
    const content = fs.readFileSync(envPath, 'utf8');
    const requiredVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
    const missingVars = [];
    
    for (const variable of requiredVars) {
      if (!content.includes(`${variable}=`)) {
        missingVars.push(variable);
      }
    }
    
    if (missingVars.length > 0) {
      console.log(`⚠️ Missing required environment variables: ${missingVars.join(', ')}`);
      console.log('   Please add them to your .env file.');
    }
  }
}

// Check MongoDB connection string
function checkMongoDBUri() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('⚠️ MONGODB_URI is not defined in environment variables.');
    return;
  }
  
  console.log(`ℹ️ MongoDB URI: ${uri}`);
  
  // Basic validation
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.log('⚠️ MONGODB_URI does not start with mongodb:// or mongodb+srv://');
  }
}

// Check JWT secret
function checkJwtSecret() {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.log('⚠️ JWT_SECRET is not defined in environment variables.');
    return;
  }
  
  if (secret.length < 32) {
    console.log('⚠️ JWT_SECRET is too short. It should be at least 32 characters for security.');
  }
}

// Main function
function checkServerConfig() {
  console.log('Checking server configuration...');
  
  checkEnvFile();
  checkMongoDBUri();
  checkJwtSecret();
  
  console.log('\nDone checking server configuration.');
}

checkServerConfig(); 