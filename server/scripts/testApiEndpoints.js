require('dotenv').config();
const axios = require('axios');

async function testApiEndpoints() {
  const baseUrl = 'http://localhost:5001/api';
  
  try {
    console.log('Testing API endpoints...');
    
    // Test appointment count
    try {
      console.log('\nTesting /appointments/count endpoint:');
      const appointmentsRes = await axios.get(`${baseUrl}/appointments/count`);
      console.log('Response:', appointmentsRes.data);
    } catch (error) {
      console.error('Error testing appointments count:', error.response?.data || error.message);
    }
    
    // Test client count
    try {
      console.log('\nTesting /clients/count endpoint:');
      const clientsRes = await axios.get(`${baseUrl}/clients/count`);
      console.log('Response:', clientsRes.data);
    } catch (error) {
      console.error('Error testing clients count:', error.response?.data || error.message);
    }
    
    // Test service count
    try {
      console.log('\nTesting /services/count endpoint:');
      const servicesRes = await axios.get(`${baseUrl}/services/count`);
      console.log('Response:', servicesRes.data);
    } catch (error) {
      console.error('Error testing services count:', error.response?.data || error.message);
    }
    
    console.log('\nAPI endpoint tests completed.');
  } catch (error) {
    console.error('Error testing API endpoints:', error);
  }
}

testApiEndpoints(); 