import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import AppointmentForm from './AppointmentForm';
import ConfirmationDialog from '../common/ConfirmationDialog';
import ErrorBoundary from '../common/ErrorBoundary';
import AppointmentTable from './AppointmentTable';
import axios from 'axios';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching appointments...');
        
        // First, check if the API is working
        try {
          const testResponse = await api.get('/appointments/test');
          console.log('API test response:', testResponse.data);
        } catch (testErr) {
          console.error('API test failed:', testErr);
        }
        
        // Try with explicit URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        console.log('Using API URL:', apiUrl);
        
        try {
          const directResponse = await axios.get(`${apiUrl}/appointments`);
          console.log('Direct API response:', directResponse.data);
          setAppointments(directResponse.data);
          setLoading(false);
          return;
        } catch (directErr) {
          console.error('Direct API request failed:', directErr);
        }
        
        // Fall back to normal request
        const response = await api.get('/appointments');
        console.log('Appointments response:', response.data);
        setAppointments(response.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [refreshTrigger]);

  const handleFormClose = (shouldRefresh) => {
    setOpenForm(false);
    setSelectedAppointment(null);
    if (shouldRefresh) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setOpenForm(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setOpenConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/appointments/${appointmentToDelete._id}`);
      setAppointments(appointments.filter(a => a._id !== appointmentToDelete._id));
      setOpenConfirmation(false);
      setAppointmentToDelete(null);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment. Please try again.');
    }
  };

  const formatDateTime = (dateTime) => {
    try {
      return format(new Date(dateTime), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          预约列表
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddAppointment}
        >
          添加预约
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <AppointmentTable 
          appointments={appointments} 
          onEdit={handleEditAppointment}
          onDelete={handleDeleteClick}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      <ErrorBoundary>
        <AppointmentForm
          open={openForm}
          onClose={handleFormClose}
          appointment={selectedAppointment}
        />
      </ErrorBoundary>

      <ConfirmationDialog
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment? This action cannot be undone.`}
      />
    </Box>
  );
};

export default AppointmentList; 