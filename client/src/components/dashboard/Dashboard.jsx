import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Spa as SpaIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Add as AddIcon,
  EventNote as EventNoteIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { getCurrentUser } from '../../services/api';
import { format } from 'date-fns';
import AppointmentDialog from '../schedule/AppointmentDialog';
import ClientDialog from '../clients/ClientDialog';
import DashboardActions from './DashboardActions';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    appointments: 0,
    clients: 0,
    services: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [beauticians, setBeauticians] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      
      // Use a simpler approach first - just get the counts
      const appointmentsRes = await api.get('/appointments/count');
      const clientsRes = await api.get('/clients/count');
      const servicesRes = await api.get('/services/count');
      
      console.log('Counts retrieved:', {
        appointments: appointmentsRes.data.count,
        clients: clientsRes.data.count,
        services: servicesRes.data.count
      });
      
      setStats({
        appointments: appointmentsRes.data.count || 0,
        clients: clientsRes.data.count || 0,
        services: servicesRes.data.count || 0
      });
      
      // Fetch upcoming appointments
      console.log('Fetching upcoming appointments...');
      const today = new Date();
      const upcomingRes = await api.get('/appointments', {
        params: {
          startDate: today.toISOString(),
          limit: 5,
          sort: 'date'
        }
      });
      
      setUpcomingAppointments(upcomingRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load dashboard data. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const fetchBeauticians = async () => {
    try {
      const response = await api.get('/users', {
        params: { role: 'beautician' }
      });
      setBeauticians(response.data);
    } catch (error) {
      console.error('Error fetching beauticians:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatAppointmentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={2}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box 
            sx={{ 
              bgcolor: `${color}.light`, 
              color: `${color}.main`,
              p: 1,
              borderRadius: 1,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const handleOpenAppointmentDialog = () => {
    setOpenAppointmentDialog(true);
  };

  const handleCloseAppointmentDialog = (refresh = false) => {
    setOpenAppointmentDialog(false);
    if (refresh) {
      fetchDashboardData();
    }
  };

  const handleOpenClientDialog = () => {
    setOpenClientDialog(true);
  };

  const handleCloseClientDialog = (newClient) => {
    setOpenClientDialog(false);
    if (newClient) {
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2, p: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.firstName || 'User'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Dashboard data could not be loaded. You can still use the quick actions below.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName || 'User'}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's an overview of your salon's performance.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Appointments" 
            value={stats.appointments} 
            icon={<EventIcon />} 
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Clients" 
            value={stats.clients} 
            icon={<PeopleIcon />} 
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Services" 
            value={stats.services} 
            icon={<SpaIcon />} 
            color="warning"
          />
        </Grid>
        
        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {upcomingAppointments.length > 0 ? (
              <List>
                {upcomingAppointments.map((appointment) => (
                  <React.Fragment key={appointment._id}>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {formatAppointmentDate(appointment.date || appointment.dateTime)}
                            </Typography>
                            {" — "}
                            {appointment.service?.name || 'No service specified'}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 3 }}>
                No upcoming appointments
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 