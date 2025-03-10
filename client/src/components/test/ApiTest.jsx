import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import api from '../../services/api';

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testEndpoint = async (endpoint) => {
    setLoading(true);
    try {
      const response = await api.get(endpoint);
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'success',
          data: response.data
        }
      }));
    } catch (err) {
      console.error(`Error testing ${endpoint}:`, err);
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'error',
          error: err.message,
          details: err.response?.data
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>API Test</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={() => testEndpoint('/clients')}
          sx={{ mr: 1 }}
        >
          Test Clients API
        </Button>
        
        <Button 
          variant="contained" 
          onClick={() => testEndpoint('/services')}
          sx={{ mr: 1 }}
        >
          Test Services API
        </Button>
        
        <Button 
          variant="contained" 
          onClick={() => testEndpoint('/users')}
        >
          Test Users API
        </Button>
      </Box>
      
      {Object.entries(results).map(([endpoint, result]) => (
        <Paper key={endpoint} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{endpoint}</Typography>
          <Typography 
            color={result.status === 'success' ? 'success.main' : 'error.main'}
          >
            Status: {result.status}
          </Typography>
          
          {result.status === 'success' ? (
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          ) : (
            <>
              <Typography color="error">{result.error}</Typography>
              {result.details && (
                <pre>{JSON.stringify(result.details, null, 2)}</pre>
              )}
            </>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default ApiTest; 