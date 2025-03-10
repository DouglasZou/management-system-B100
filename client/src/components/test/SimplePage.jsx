import React from 'react';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const SimplePage = () => {
  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <Paper sx={{ p: 4, maxWidth: 500 }}>
        <Typography variant="h4" gutterBottom>
          Simple Test Page
        </Typography>
        <Typography variant="body1" paragraph>
          If you can see this, the basic React rendering is working.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            onClick={() => alert('Button clicked!')}
          >
            Click Me
          </Button>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/"
          >
            Back to Home
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SimplePage; 