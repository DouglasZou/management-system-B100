import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  InputAdornment,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import api, { getCurrentUser } from '../../services/api';

const StaffDialog = ({ open, onClose, staff }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: null,
    phone: '',
    role: 'beautician',
    active: true
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const currentUser = getCurrentUser();
  console.log('Current user:', currentUser);
  
  // Set initial form data when dialog opens or staff changes
  useEffect(() => {
    if (open && staff) {
      setFormData({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        email: staff.email || '',
        password: '',
        confirmPassword: '',
        dateOfBirth: staff.dateOfBirth ? new Date(staff.dateOfBirth) : null,
        phone: staff.phone || '',
        role: staff.role || 'beautician',
        active: staff.active !== undefined ? staff.active : true
      });
    } else if (open) {
      // Reset form for new staff
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: null,
        phone: '',
        role: 'beautician',
        active: true
      });
    }
    
    // Reset errors and submit error when dialog opens
    if (open) {
      setErrors({});
      setSubmitError('');
    }
  }, [open, staff]);
  
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
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date
    });
    
    if (errors.dateOfBirth) {
      setErrors({
        ...errors,
        dateOfBirth: ''
      });
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Only validate password for new staff
    if (!staff) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSubmitError('');
    
    try {
      console.log('Current user token:', localStorage.getItem('token'));
      let response;
      
      // Format the date properly for the API
      const formattedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
        phone: formData.phone,
        role: formData.role,
        active: formData.active
      };
      
      // Add password only for new staff or if changed for existing staff
      if (!staff || formData.password) {
        formattedData.password = formData.password;
      }
      
      console.log('Sending data:', formattedData);
      
      if (staff) {
        // Update existing staff
        response = await api.put(`/users/${staff._id}`, formattedData);
      } else {
        // For new staff, use the auth/register endpoint which might have different permissions
        response = await api.post('/auth/register', formattedData);
      }
      
      console.log('Staff operation successful:', response.data);
      onClose(response.data);
    } catch (error) {
      console.error('Staff operation error:', error);
      console.error('Error details:', error.response?.data);
      
      // More detailed error message
      setSubmitError(
        error.response?.data?.message || 
        `Operation failed (${error.message}). Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </Typography>
          <IconButton onClick={() => onClose(null)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        
        <Box component="form" noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            
            {!staff && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                    required={!staff}
                    margin="normal"
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
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    fullWidth
                    required={!staff}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth}
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
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
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="active-label">Status</InputLabel>
                <Select
                  labelId="active-label"
                  name="active"
                  value={formData.active}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => onClose(null)} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : staff ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffDialog; 