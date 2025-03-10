require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5001/api'; // Adjust to match your server port

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    // Test credentials - replace with valid credentials for your system
    const credentials = {
      email: 'admin@example.com',
      password: 'password123'
    };
    
    console.log(`Attempting login with email: ${credentials.email}`);
    
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    console.log('User data received:', response.data.user ? 'Yes' : 'No');
    
    if (response.data.user) {
      console.log('User details:', {
        id: response.data.user._id,
        name: `${response.data.user.firstName} ${response.data.user.lastName}`,
        email: response.data.user.email,
        role: response.data.user.role
      });
    }
    
  } catch (error) {
    console.error('Login test failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
  }
}

testLogin(); 