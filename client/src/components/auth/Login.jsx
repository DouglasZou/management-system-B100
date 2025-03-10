import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, isAuthenticated } from '../../services/api';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../../services/api';
import logo from '../../../logo01.jpg';
import serangoonBg from '../../../serangoon.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'beautician' // Default role
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/schedule');
    }
  }, [navigate]);

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSubmitError('');
    setSuccessMessage('');
    
    try {
      console.log('Attempting login with:', {
        email: formData.email,
        role: formData.role
      });
      
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      console.log('Login successful:', response.data);
      
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/schedule');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more detailed error messages
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
        
        // Special handling for role mismatch
        if (error.response.data.message === 'Invalid role for this user') {
          errorMessage = `This user is not registered as a ${formData.role}. Please select the correct role.`;
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${serangoonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#bfaf98',
          opacity: 1,
          zIndex: 2
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 3 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            backgroundColor: '#ffffff',
            position: 'relative'
            // borderRadius: '1rem'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3 
          }}>
            <img 
              src={logo} 
              alt="Beauty 100 Logo" 
              style={{
                maxWidth: '180px',
                height: 'auto',
                marginBottom: '0.5rem'
              }}
            />
          </Box>

          <Typography variant="h5" component="h1" align="center" gutterBottom>
            BEAUTY 100 - Serangoon
          </Typography>
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              autoFocus
              inputProps={{ 'data-testid': 'email-input' }}
              error={!!errors.email}
              helperText={errors.email}
            />
            
            <TextField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              inputProps={{ 'data-testid': 'password-input' }}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!errors.role}
            >
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="beautician">Beautician</MenuItem>
              </Select>
              {errors.role && (
                <FormHelperText>{errors.role}</FormHelperText>
              )}
            </FormControl>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
              data-testid="login-button"
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <MuiLink 
              component={Link} 
              to="/forgot-password" 
              variant="body2"
              underline="hover"
            >
              Forgot password?
            </MuiLink>
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Typography color="primary" variant="body2">
                Don't have an account? Sign Up
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 