import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import api from '../../services/api';
import dayjs from 'dayjs';

const SimpleAppointmentForm = ({ open, onClose, initialSlot, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    beauticianId: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: dayjs().format('HH:mm'),
    notes: ''
  });
  
  useEffect(() => {
    if (open) {
      fetchFormData();
      
      // Set initial values if provided
      if (initialSlot) {
        setFormData(prev => ({
          ...prev,
          date: initialSlot.date.format('YYYY-MM-DD'),
          time: initialSlot.time,
          beauticianId: initialSlot.beauticianId || ''
        }));
      }
    }
  }, [open, initialSlot]);
  
  const fetchFormData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching form data...');
      
      // Fetch clients
      const clientsRes = await api.get('/clients');
      console.log('Clients:', clientsRes.data);
      
      // Fetch services
      const servicesRes = await api.get('/services');
      console.log('Services:', servicesRes.data);
      
      // Fetch beauticians
      const beauticiansRes = await api.get('/users', { params: { role: 'beautician' } });
      console.log('Beauticians:', beauticiansRes.data);
      
      setClients(clientsRes.data);
      setServices(servicesRes.data);
      setBeauticians(beauticiansRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching form data:', err);
      setError('Failed to load form data. Please try again.');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!formData.clientId || !formData.serviceId || !formData.beauticianId) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Create appointment data
      const service = services.find(s => s._id === formData.serviceId);
      if (!service) {
        setError('Invalid service selected');
        setLoading(false);
        return;
      }
      
      const dateTimeStr = `${formData.date}T${formData.time}`;
      const dateTime = dayjs(dateTimeStr).toISOString();
      const endTime = dayjs(dateTimeStr).add(service.duration, 'minute').toISOString();
      
      const appointmentData = {
        client: formData.clientId,
        service: formData.serviceId,
        beautician: formData.beauticianId,
        dateTime,
        endTime,
        notes: formData.notes,
        status: 'scheduled'
      };
      
      console.log('Submitting appointment:', appointmentData);
      
      // Send to API
      const response = await api.post('/appointments', appointmentData);
      console.log('API Response:', response.data);
      
      if (onSave) {
        onSave(response.data);
      }
      
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create appointment');
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>New Appointment</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Client"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            >
              {clients.map(client => (
                <MenuItem key={client._id} value={client._id}>
                  {client.firstName} {client.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Service"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            >
              {services.map(service => (
                <MenuItem key={service._id} value={service._id}>
                  {service.name} - ${service.price} ({service.duration} min)
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Beautician"
              name="beauticianId"
              value={formData.beauticianId}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            >
              {beauticians.map(beautician => (
                <MenuItem key={beautician._id} value={beautician._id}>
                  {beautician.firstName} {beautician.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              fullWidth
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              fullWidth
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
            />
          </Grid>
        </Grid>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          Create Appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleAppointmentForm; 