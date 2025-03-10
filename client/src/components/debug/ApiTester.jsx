import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField, CircularProgress } from '@mui/material';
import api from '../../services/api';

const ApiTester = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [endpoint, setEndpoint] = useState('/clients');

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      console.log(`Testing API endpoint: ${endpoint}`);
      const response = await api.get(endpoint);
      
      console.log('API Response:', response);
      setResult(response.data);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>API Tester</Typography>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="API Endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            onClick={testApi}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Test API'}
          </Button>
        </Box>
        
        {error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.contrastText">{error}</Typography>
          </Box>
        )}
        
        {result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Result:</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 400, overflow: 'auto' }}>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ApiTester; 