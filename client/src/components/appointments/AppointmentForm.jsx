import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Autocomplete,
  Box,
  FormControlLabel,
  Switch,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationDialog from '../common/ConfirmationDialog';
import LoadingOverlay from '../common/LoadingOverlay';

const AppointmentForm = ({ open, onClose, appointment = null, initialSlot = null, onSave }) => {
  const [services, setServices] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [appointmentPreview, setAppointmentPreview] = useState(null);
  const [recurringOptions, setRecurringOptions] = useState({
    isRecurring: false,
    frequency: 'weekly',
    occurrences: 1
  });
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);

  // Form state
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [beauticianId, setBeauticianId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [appointmentTime, setAppointmentTime] = useState(dayjs().format('HH:mm'));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching form data...');
        
        // Fetch clients
        let clientsResponse;
        try {
          clientsResponse = await api.get('/clients');
          console.log('Clients response:', clientsResponse.data);
        } catch (err) {
          console.error('Error fetching clients:', err);
          throw new Error('Failed to fetch clients. Please try again.');
        }
        
        // Fetch services
        let servicesResponse;
        try {
          servicesResponse = await api.get('/services');
          console.log('Services response:', servicesResponse.data);
        } catch (err) {
          console.error('Error fetching services:', err);
          throw new Error('Failed to fetch services. Please try again.');
        }
        
        // Fetch beauticians
        let beauticiansResponse;
        try {
          beauticiansResponse = await api.get('/users', {
            params: { role: 'beautician' }
          });
          console.log('Beauticians response:', beauticiansResponse.data);
        } catch (err) {
          console.error('Error fetching beauticians:', err);
          throw new Error('Failed to fetch beauticians. Please try again.');
        }
        
        // Set the data
        setClients(clientsResponse.data);
        setServices(servicesResponse.data);
        setBeauticians(beauticiansResponse.data);
        
        // If we have an existing appointment, set the form values
        if (appointment) {
          setClientId(appointment.client._id);
          setServiceId(appointment.service._id);
          setBeauticianId(appointment.beautician._id);
          setAppointmentDate(dayjs(appointment.dateTime).format('YYYY-MM-DD'));
          setAppointmentTime(dayjs(appointment.dateTime).format('HH:mm'));
          setNotes(appointment.notes || '');
        } else if (initialSlot) {
          // If we have an initial slot, set the date, time and beautician
          setAppointmentDate(initialSlot.date.format('YYYY-MM-DD'));
          setAppointmentTime(initialSlot.time);
          if (initialSlot.beauticianId) {
            setBeauticianId(initialSlot.beauticianId);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError(err.message || 'Failed to load form data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [appointment, initialSlot]);

  const initialValues = {
    clientId: clientId,
    serviceId: serviceId,
    beauticianId: beauticianId,
    startTime: dayjs(`${appointmentDate}T${appointmentTime}`),
    notes: notes,
    status: 'scheduled'
  };

  const validationSchema = Yup.object({
    clientId: Yup.string().required('Client is required'),
    serviceId: Yup.string().required('Service is required'),
    beauticianId: Yup.string().required('Beautician is required'),
    notes: Yup.string().max(500, 'Notes must be less than 500 characters')
  });

  // Define handleSubmit before using it in formik
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Form values:', values);
      
      const service = services.find(s => s._id === values.serviceId);
      if (!service) {
        console.error('Service not found for ID:', values.serviceId);
        setError('Service not found');
        setLoading(false);
        return;
      }
      
      // Create a combined date/time string and convert to ISO format
      const dateTimeStr = `${appointmentDate}T${appointmentTime}`;
      console.log('Date/time string:', dateTimeStr);
      
      const dateTime = dayjs(dateTimeStr).toISOString();
      const endTime = dayjs(dateTimeStr).add(service.duration, 'minute').toISOString();
      
      console.log('Appointment date/time:', dateTime);
      console.log('End time:', endTime);
      
      const appointmentData = {
        client: values.clientId,
        service: values.serviceId,
        beautician: values.beauticianId,
        dateTime: dateTime,
        endTime: endTime,
        notes: values.notes,
        status: values.status
      };
      
      console.log('Submitting appointment data:', JSON.stringify(appointmentData, null, 2));
      
      let response;
      try {
        if (appointment) {
          // Update existing appointment
          response = await api.put(`/appointments/${appointment._id}`, appointmentData);
        } else {
          // Create new appointment
          response = await api.post('/appointments', appointmentData);
        }
        
        console.log('API Response:', response);
        
        if (response.status === 201 || response.status === 200) {
          const data = response.data;
          console.log('Appointment saved successfully:', data);
          
          // Update appointment preview
          setAppointmentPreview({
            client: `${data.client.firstName} ${data.client.lastName}`,
            service: data.service.name,
            beautician: `${data.beautician.firstName} ${data.beautician.lastName}`,
            startTime: dayjs(data.dateTime).format('MMM D, YYYY h:mm A'),
            endTime: dayjs(data.endTime).format('h:mm A'),
            duration: data.service.duration,
            price: data.service.price
          });
          
          // Call onSave callback if provided
          if (onSave) {
            onSave(data);
          }
          
          // Close the form after a short delay
          setTimeout(() => {
            onClose(true);
          }, 1500);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        if (apiError.response) {
          console.error('Response data:', apiError.response.data);
          console.error('Response status:', apiError.response.status);
          setError(`Error: ${apiError.response.data.message || apiError.message}`);
        } else if (apiError.request) {
          console.error('Request error:', apiError.request);
          setError('Network error. Please check your connection and try again.');
        } else {
          console.error('Error message:', apiError.message);
          setError(`Error: ${apiError.message}`);
        }
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError(err.message || 'Error saving appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickClientCreate = async () => {
    try {
      setLoading(true);
      
      const response = await api.post('/clients', newClientData);
      const newClient = response.data;
      
      setClients([...clients, newClient]);
      setClientId(newClient._id);
      
      setShowQuickClientForm(false);
      setLoading(false);
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Failed to create client. Please try again.');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit
  });

  useEffect(() => {
    // Update appointment preview when form values change
    if (formik.values.clientId && formik.values.serviceId && formik.values.beauticianId) {
      const client = clients.find(c => c._id === formik.values.clientId);
      const service = services.find(s => s._id === formik.values.serviceId);
      const beautician = beauticians.find(b => b._id === formik.values.beauticianId);
      
      if (client && service && beautician) {
        const startTime = dayjs(`${appointmentDate}T${appointmentTime}`);
        const endTime = startTime.add(service.duration, 'minute');
        
        setAppointmentPreview({
          client: `${client.firstName} ${client.lastName}`,
          service: service.name,
          beautician: `${beautician.firstName} ${beautician.lastName}`,
          startTime: startTime.format('MMM D, YYYY h:mm A'),
          endTime: endTime.format('h:mm A'),
          duration: service.duration,
          price: service.price
        });
      }
    }
  }, [formik.values, clients, services, beauticians, appointmentDate, appointmentTime]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Dialog 
            open={open} 
            onClose={() => onClose(false)}
            maxWidth="md"
            fullWidth
          >
            <LoadingOverlay loading={loading} />
            
            <DialogTitle>
              {appointment ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
            
            <form onSubmit={formik.handleSubmit}>
              <DialogContent>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                <Grid container spacing={2}>
                  {/* Client Selection */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={formik.touched.clientId && Boolean(formik.errors.clientId)}>
                      <InputLabel>Client</InputLabel>
                      <Select
                        name="clientId"
                        value={formik.values.clientId}
                        onChange={formik.handleChange}
                        label="Client"
                      >
                        {clients.map(client => (
                          <MenuItem key={client._id} value={client._id}>
                            {client.firstName} {client.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.clientId && formik.errors.clientId && (
                        <Typography color="error" variant="caption">
                          {formik.errors.clientId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Quick Add Client Button */}
                  <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setShowQuickClientForm(true)}
                      sx={{ mt: { xs: 0, md: 1 } }}
                    >
                      Quick Add Client
                    </Button>
                  </Grid>
                  
                  {/* Service Selection */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}>
                      <InputLabel>Service</InputLabel>
                      <Select
                        name="serviceId"
                        value={formik.values.serviceId}
                        onChange={(e) => {
                          formik.handleChange(e);
                          const selectedService = services.find(s => s._id === e.target.value);
                          setSelectedService(selectedService);
                        }}
                        label="Service"
                      >
                        {services.map(service => (
                          <MenuItem key={service._id} value={service._id}>
                            {service.name} - ${service.price} ({service.duration} min)
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.serviceId && formik.errors.serviceId && (
                        <Typography color="error" variant="caption">
                          {formik.errors.serviceId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Beautician Selection */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={formik.touched.beauticianId && Boolean(formik.errors.beauticianId)}>
                      <InputLabel>Beautician</InputLabel>
                      <Select
                        name="beauticianId"
                        value={formik.values.beauticianId}
                        onChange={formik.handleChange}
                        label="Beautician"
                      >
                        {beauticians.map(beautician => (
                          <MenuItem key={beautician._id} value={beautician._id}>
                            {beautician.firstName} {beautician.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.beauticianId && formik.errors.beauticianId && (
                        <Typography color="error" variant="caption">
                          {formik.errors.beauticianId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Date Selection */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Appointment Date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  {/* Time Selection */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Appointment Time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  {/* Status Selection */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        label="Status"
                      >
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="no-show">No Show</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Recurring Appointment Option */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={recurringOptions.isRecurring}
                          onChange={(e) => setRecurringOptions({
                            ...recurringOptions,
                            isRecurring: e.target.checked
                          })}
                        />
                      }
                      label="Recurring Appointment"
                    />
                    
                    {recurringOptions.isRecurring && (
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              select
                              label="Frequency"
                              value={recurringOptions.frequency}
                              onChange={(e) => setRecurringOptions({
                                ...recurringOptions,
                                frequency: e.target.value
                              })}
                            >
                              <MenuItem value="daily">Daily</MenuItem>
                              <MenuItem value="weekly">Weekly</MenuItem>
                              <MenuItem value="biweekly">Bi-weekly</MenuItem>
                              <MenuItem value="monthly">Monthly</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Number of Occurrences"
                              value={recurringOptions.occurrences}
                              onChange={(e) => setRecurringOptions({
                                ...recurringOptions,
                                occurrences: parseInt(e.target.value)
                              })}
                              InputProps={{ inputProps: { min: 1, max: 12 } }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Grid>

                  {/* Notes */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="notes"
                      label="Notes"
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
                      helperText={formik.touched.notes && formik.errors.notes}
                    />
                  </Grid>

                  {/* Appointment Preview */}
                  {appointmentPreview && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="h6" gutterBottom>
                          Appointment Preview
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2">Client: {appointmentPreview.client}</Typography>
                            <Typography variant="body2">Service: {appointmentPreview.service}</Typography>
                            <Typography variant="body2">Beautician: {appointmentPreview.beautician}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Start: {appointmentPreview.startTime}</Typography>
                            <Typography variant="body2">End: {appointmentPreview.endTime}</Typography>
                            <Typography variant="body2">Duration: {appointmentPreview.duration} minutes</Typography>
                            <Typography variant="body2">Price: ${appointmentPreview.price}</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => onClose(false)}>Cancel</Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading || formik.isSubmitting}
                >
                  {loading ? 'Saving...' : (appointment ? 'Update' : 'Create')}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </motion.div>
      </AnimatePresence>

      <ConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title={confirmationData?.title}
        message={confirmationData?.message}
        onConfirm={confirmationData?.onConfirm}
      />

      {/* Quick Client Creation Dialog */}
      <Dialog open={showQuickClientForm} onClose={() => setShowQuickClientForm(false)}>
        <DialogTitle>Quick Add Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newClientData.firstName}
                onChange={(e) => setNewClientData({
                  ...newClientData,
                  firstName: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newClientData.lastName}
                onChange={(e) => setNewClientData({
                  ...newClientData,
                  lastName: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newClientData.email}
                onChange={(e) => setNewClientData({
                  ...newClientData,
                  email: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={newClientData.phone}
                onChange={(e) => setNewClientData({
                  ...newClientData,
                  phone: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuickClientForm(false)}>Cancel</Button>
          <Button onClick={handleQuickClientCreate} variant="contained" color="primary">
            Add Client
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AppointmentForm; 