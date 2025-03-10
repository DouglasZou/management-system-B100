import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real application, this would call an API endpoint to send a password reset email
      // For now, we'll just simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError('Failed to send password reset email. Please try again later.');
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Beauty 100
          </Typography>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            Forgot Password
          </Typography>
          
          {success ? (
            <Box sx={{ mt: 3 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                If an account exists with this email, you will receive password reset instructions shortly.
              </Alert>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => navigate('/login')}
              >
                Return to Login
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  autoFocus
                  disabled={loading}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                </Button>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <MuiLink 
                    component={Link} 
                    to="/login" 
                    variant="body2"
                    underline="hover"
                  >
                    Back to Login
                  </MuiLink>
                </Box>
              </form>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 