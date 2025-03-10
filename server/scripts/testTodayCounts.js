require('dotenv').config();
const axios = require('axios');

async function testTodayCounts() {
  const baseUrl = 'http://localhost:5001/api';
  
  try {
    console.log('Testing today\'s counts endpoint...');
    
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
    
    // Test getting today's counts
    try {
      console.log('\nTesting GET /dashboard/today-counts endpoint:');
      const countsRes = await axios.get(`${baseUrl}/dashboard/today-counts`);
      console.log('Response:', countsRes.data);
      
      console.log('\nToday\'s statistics:');
      console.log(`- Appointments: ${countsRes.data.appointments}`);
      console.log(`- Unique Clients: ${countsRes.data.clients}`);
      console.log(`- Unique Services: ${countsRes.data.services}`);
    } catch (error) {
      console.error('Error testing today\'s counts endpoint:');
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Error message:', error.message);
    }
    
    console.log('\nTest completed.');
  } catch (error) {
    console.error('Error testing today\'s counts:', error);
  }
}

testTodayCounts(); 