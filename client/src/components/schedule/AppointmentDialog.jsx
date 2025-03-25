import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider,
  Autocomplete,
  useMediaQuery
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import ClientDialog from '../clients/ClientDialog'; // Import the ClientDialog component
import { useTheme } from '@mui/material/styles';

const AppointmentDialog = ({ open, onClose, appointment, beauticians, selectedDate, selectedBeautician, selectedTimeSlot }) => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    client: '',
    service: '',
    beautician: '',
    dateTime: new Date(),
    notes: '',
    status: 'scheduled'
  });
  
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for the new client dialog
  const [openClientDialog, setOpenClientDialog] = useState(false);
  
  // Fetch clients and services on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching clients and active services...');
        
        // Fetch clients first
        const clientsResponse = await api.get('/clients');
        console.log('Clients fetched:', clientsResponse.data.length);
        setClients(clientsResponse.data);
        
        // Then fetch services
        const servicesResponse = await api.get('/services/active');
        console.log('Active services fetched:', servicesResponse.data.length);
        setServices(servicesResponse.data);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', error.response?.data || error.message);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Set initial form data when dialog opens or appointment changes
  useEffect(() => {
    if (open) {
      if (appointment) {
        // Log the appointment object to see what status it has
        console.log('Appointment being edited:', appointment);
        console.log('Appointment status:', appointment.status);
        
        // Editing an existing appointment
        setFormData({
          client: appointment.client._id,
          service: appointment.service._id,
          beautician: appointment.beautician._id,
          dateTime: new Date(appointment.dateTime),
          notes: appointment.notes || '',
          status: appointment.status || 'scheduled'
        });
      } else if (selectedTimeSlot) {
        // Creating a new appointment with pre-selected time and beautician
        setFormData({
          client: '',
          service: '',
          beautician: selectedTimeSlot.beautician ? selectedTimeSlot.beautician._id : '',
          dateTime: selectedTimeSlot.dateTime,
          notes: '',
          status: 'scheduled'
        });
      } else {
        // Creating a new appointment with default values
        setFormData({
          client: '',
          service: '',
          beautician: selectedBeautician ? selectedBeautician._id : '',
          dateTime: new Date(),
          notes: '',
          status: 'scheduled'
        });
      }
    }
  }, [open, appointment, selectedTimeSlot, selectedBeautician]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (newDate) => {
    setFormData(prev => ({ ...prev, dateTime: newDate }));
  };
  
  const handleClientChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, client: newValue ? newValue._id : '' }));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create payload
      const payload = {
        client: formData.client,
        service: formData.service,
        beautician: formData.beautician,
        dateTime: formData.dateTime,
        notes: formData.notes
      };
      
      // For existing appointments
      if (appointment) {
        // IMPORTANT: Always include the current status in the update
        // This ensures the status is preserved even if it's not changed in the form
        console.log('Original appointment status:', appointment.status);
        payload.status = appointment.status || 'scheduled';
        
        console.log('Updating appointment with payload:', payload);
        const response = await api.put(`/appointments/${appointment._id}`, payload);
        console.log('Appointment updated:', response.data);
        onClose(true);
      } else {
        // For new appointments
        payload.status = 'scheduled'; // Default status for new appointments
        const response = await api.post('/appointments', payload);
        console.log('Appointment created:', response.data);
        onClose(true);
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError('Failed to save appointment. ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!appointment) return;
    
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setLoading(true);
      
      try {
        await api.delete(`/appointments/${appointment._id}`);
        onClose(true); // Close dialog and refresh data
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setError('Failed to delete appointment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle opening the new client dialog
  const handleOpenClientDialog = () => {
    setOpenClientDialog(true);
  };
  
  // Handle closing the new client dialog
  const handleCloseClientDialog = (newClient) => {
    setOpenClientDialog(false);
    
    // If a new client was created, add it to the clients list and select it
    if (newClient) {
      setClients(prev => [...prev, newClient]);
      setFormData(prev => ({ ...prev, client: newClient._id }));
    }
  };
  
  // In your useEffect or wherever you fetch beauticians
  useEffect(() => {
    const fetchBeauticians = async () => {
      try {
        // Only fetch active beauticians
        const response = await api.get('/users', {
          params: { role: 'beautician', includeInactive: 'false' }
        });
        setBeauticians(response.data);
      } catch (error) {
        console.error('Error fetching beauticians:', error);
      }
    };
    
    fetchBeauticians();
  }, []);
  
  const handleQuickClientCreate = async () => {
    try {
      setLoading(true);
      
      // Ensure all fields are included
      const newClientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || '',
        gender: formData.gender || ''
      };
      
      const response = await api.post('/clients', newClientData);
      const newClient = response.data;
      
      // Update clients list and select the new client
      setClients([...clients, newClient]);
      setFormData(prev => ({ ...prev, client: newClient._id }));
      
      setShowQuickClientForm(false);
      setLoading(false);
    } catch (err) {
      console.error('Error creating client:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to create client. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <>
      <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {appointment ? 'Edit Appointment 编辑预约' : 'New Appointment 添加预约'}
            </Typography>
            <IconButton onClick={() => onClose(false)} size="small">
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
            
            {/* Client selection with New Client button */}
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Client 客户</Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
                gap: { xs: 1, sm: 1 },
                alignItems: { xs: 'stretch', sm: 'center' }
              }}>
                <Autocomplete
                  options={clients}
                  getOptionLabel={(option) => 
                    typeof option === 'string' ? option : 
                    `${option.custID ? `[${option.custID}] ` : ''}${option.firstName} ${option.lastName}`
                  }
                  value={clients.find(c => c._id === formData.client) || null}
                  onChange={handleClientChange}
                  renderInput={(params) => <TextField {...params} placeholder="Select client 选择" />}
                  sx={{ width: { xs: '100%', sm: '65%' } }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={handleOpenClientDialog}
                  sx={{ 
                    height: { xs: '48px', sm: '56px' },
                    width: { xs: '100%', sm: '35%' },
                    mt: { xs: 0.5, sm: 0 }, // Add margin top on mobile
                    whiteSpace: 'nowrap'
                  }}
                >
                  NEW CLIENT 新建客户
                </Button>
              </Box>
            </Box>
            
            {/* Service selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Service 服务</Typography>
              <FormControl fullWidth>
                <Select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select service 选择</MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service._id} value={service._id}>
                      {service.name} ({service.duration} min - ${service.price})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Beautician selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Therapist 护理师</Typography>
              <FormControl fullWidth>
                <Select
                  name="beautician"
                  value={formData.beautician}
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select therapist 选择</MenuItem>
                  {beauticians.map((beautician) => (
                    <MenuItem key={beautician._id} value={beautician._id}>
                      {beautician.firstName} {beautician.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Date & Time picker */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Date & Time 时间</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  value={formData.dateTime}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  ampm={true}
                  minutesStep={15}
                />
              </LocalizationProvider>
            </Box>
            
            {/* Notes */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Notes 备注</Typography>
              <TextField
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {appointment && (
            <Button 
              onClick={handleDelete} 
              color="error" 
              disabled={loading}
              sx={{ mr: 'auto' }}
            >
              Delete 删除
            </Button>
          )}
          <Button onClick={() => onClose(false)} disabled={loading}>
            Cancel 取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            disabled={loading || !formData.client || !formData.service || !formData.beautician}
          >
            {appointment ? 'Update 更新' : 'Create 完成'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Client Dialog */}
      <ClientDialog 
        open={openClientDialog} 
        onClose={handleCloseClientDialog} 
        client={null} // Pass null to indicate a new client
      />
    </>
  );
};

export default AppointmentDialog; 