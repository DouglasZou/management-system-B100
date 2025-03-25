import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import api from '../../services/api';
import { MuiTelInput } from 'mui-tel-input';

const ClientDialog = ({ open, onClose, client }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: '',
    gender: '',
    custID: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize phone with default Singapore number format
  const [phoneValue, setPhoneValue] = useState('+65');
  
  // Set initial form data when dialog opens or client changes
  useEffect(() => {
    if (open && client) {
      setFormData({
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        phone: client.phone || '',
        email: client.email || '',
        notes: client.notes || '',
        gender: client.gender || '',
        custID: client.custID || ''
      });
      setPhoneValue(client.phone || '+65');
    } else if (open) {
      // Reset form for new client
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        notes: '',
        gender: '',
        custID: ''
      });
      setPhoneValue('+65');
    }
  }, [open, client]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhoneChange = (newValue, info) => {
    setPhoneValue(newValue);
    setFormData(prev => ({
      ...prev,
      phone: newValue
    }));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Log the data being sent
      console.log('Submitting client data:', formData);
      
      // Ensure notes and gender are explicitly included
      const clientData = {
        ...formData,
        notes: formData.notes || '',
        gender: formData.gender || '',
        phone: phoneValue // This will include the country code
      };
      
      console.log('Processed client data:', clientData);
      
      let response;
      
      if (client) {
        // Update existing client
        response = await api.put(`/clients/${client._id}`, clientData);
      } else {
        // Create new client
        response = await api.post('/clients', clientData);
      }
      
      console.log('Response from server:', response.data);
      
      onClose(response.data); // Close dialog and pass the new/updated client data
    } catch (error) {
      console.error('Error saving client:', error);
      console.error('Response data:', error.response?.data);
      setError('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{client ? 'Edit Client' : 'New Client'}</Typography>
          <IconButton onClick={() => onClose(null)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="custID"
                label="Customer ID"
                value={formData.custID}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name 名"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name 姓"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MuiTelInput
                value={phoneValue}
                onChange={handlePhoneChange}
                defaultCountry="SG"
                fullWidth
                label="Phone 电话"
                required
                langOfCountryName="en"
                preferredCountries={['SG', 'CN', 'MY', 'ID']}
                excludedCountries={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email 邮箱"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender 性别</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender 性别"
                >
                  <MenuItem value="male">Male 男</MenuItem>
                  <MenuItem value="female">Female 女</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes 备注"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={() => onClose(null)} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading || !formData.firstName || !formData.lastName || !formData.phone}
        >
          {client ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientDialog; 