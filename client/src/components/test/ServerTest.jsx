import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';

const ServerTest = () => {
  const [serverStatus, setServerStatus] = useState('unknown');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkServer = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to connect directly without using the api service
      const response = await axios.get('http://localhost:5001/api/health');
      console.log('Server response:', response.data);
      setServerStatus('online');
    } catch (err) {
      console.error('Server check error:', err);
      setError(err.message || 'Failed to connect to server');
      setServerStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkServer();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Server Connection Test
        </Typography>
        
        <Typography variant="body1" paragraph>
          Server Status: <strong>{serverStatus}</strong>
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Button 
          variant="contained" 
          onClick={checkServer} 
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Server Connection'}
        </Button>
      </Paper>
    </Box>
  );
};

export default ServerTest; 