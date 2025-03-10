require('dotenv').config();
const axios = require('axios');

async function testServicesApi() {
  const baseUrl = 'http://localhost:5001/api';
  
  try {
    console.log('Testing services API...');
    console.log(`Using base URL: ${baseUrl}`);
    
    // Test server connection first
    try {
      console.log('\nTesting server connection:');
      const healthRes = await axios.get(`${baseUrl}/health`);
      console.log('Server health check response:', healthRes.data);
    } catch (error) {
      console.error('ERROR: Server connection failed!');
      console.error('Error details:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused. Make sure your server is running on port 5001.');
      }
      return; // Exit if server is not running
    }
    
    // Test getting all services
    try {
      console.log('\nTesting GET /services endpoint:');
      const servicesRes = await axios.get(`${baseUrl}/services`);
      console.log(`Response: Found ${servicesRes.data.length} services`);
      if (servicesRes.data.length > 0) {
        console.log('First service:', servicesRes.data[0]);
      }
    } catch (error) {
      console.error('Error testing services endpoint:');
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Error message:', error.message);
    }
    
    // Test getting service count
    try {
      console.log('\nTesting GET /services/count endpoint:');
      const countRes = await axios.get(`${baseUrl}/services/count`);
      console.log('Response:', countRes.data);
    } catch (error) {
      console.error('Error testing services count endpoint:');
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Error message:', error.message);
    }
    
    // Test creating a service
    try {
      console.log('\nTesting POST /services endpoint:');
      const newService = {
        name: 'Test Service',
        description: 'This is a test service',
        duration: 60,
        price: 50,
        category: 'test',
        active: true
      };
      
      const createRes = await axios.post(`${baseUrl}/services`, newService);
      console.log('Response:', createRes.data);
    } catch (error) {
      console.error('Error testing service creation:');
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Error message:', error.message);
    }
    
    console.log('\nServices API tests completed.');
  } catch (error) {
    console.error('Error testing services API:', error);
  }
}

testServicesApi(); 