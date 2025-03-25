import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Spa as SpaIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format, startOfDay, endOfDay } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import api from '../../services/api';
import { getCurrentUser } from '../../services/api';
import AppointmentDialog from '../schedule/AppointmentDialog';
import ClientDialog from '../clients/ClientDialog';

// Create a context for dashboard refreshing
export const DashboardRefreshContext = createContext();

const SimpleDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    clients: 0,
    services: 0,
    appointments: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const user = getCurrentUser();
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [beauticians, setBeauticians] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timezone = 'Asia/Singapore';
      const today = new Date();
      const zonedDate = utcToZonedTime(today, timezone);
      
      // Format dates to match your backend expectations
      const startDate = format(startOfDay(zonedDate), "yyyy-MM-dd'T'00:00:00.000'Z'");
      const endDate = format(endOfDay(zonedDate), "yyyy-MM-dd'T'23:59:59.999'Z'");
      
      console.log('Fetching data for date range:', { startDate, endDate });

      const response = await api.get('/dashboard/today', {
        params: {
          startDate,
          endDate
        }
      });

      setStats({
        clients: response.data?.stats?.clients || 0,
        services: response.data?.stats?.services || 0,
        appointments: response.data?.stats?.appointments || 0
      });
      setTodayAppointments(response.data?.appointments || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setStats({ clients: 0, services: 0, appointments: 0 });
      setTodayAppointments([]);
    } finally {
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
    fetchBeauticians();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Make fetchDashboardData available through context
  const refreshDashboard = () => {
    console.log('Dashboard refresh triggered');
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardRefreshContext.Provider value={refreshDashboard}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome 欢迎, {user?.firstName || 'User'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Here's an overview of today salon's schedule 本店当天日程概览.
        </Typography>
        
        {error && (
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
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Today's Appointments 预约数量</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.appointments}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Today's Clients 客户数量</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.clients}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpaIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Today's Services 服务数量</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.services}
              </Typography>
            </Paper>
          </Grid>
          
          {/* Today's Appointments */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Today's Appointments 今天的预约</Typography>
              </Box>
              
              {todayAppointments.length > 0 ? (
                <List>
                  {todayAppointments.map((appointment) => (
                    <ListItem 
                      key={appointment._id}
                      divider
                      sx={{ 
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main',
                        my: 1,
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle1" component="span">
                              {appointment.client?.firstName} {appointment.client?.lastName}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={appointment.service?.name} 
                              color="primary" 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                            <Typography variant="body2" component="span">
                              {format(new Date(appointment.dateTime), 'h:mm a')} - 
                              {format(new Date(appointment.endTime), 'h:mm a')}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={`$${appointment.service?.price}`}
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No appointments scheduled for today 今天没有预约
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAppointmentDialog(true)}
                  >
                    Add Appointment 添加预约
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions 快捷操作
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAppointmentDialog(true)}
                    sx={{ 
                      py: { xs: 0.75, sm: 1 }, // Smaller padding on mobile
                      fontSize: { xs: '0.75rem', sm: '0.875rem' } // Smaller font on mobile
                    }}
                  >
                    NEW APPOINTMENT 添加预约
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    onClick={() => setOpenClientDialog(true)}
                  >
                    ADD CLIENT 添加客户
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    component={Link}
                    to="/services"
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<SpaIcon />}
                  >
                    MANAGE SERVICES 服务管理
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    component={Link}
                    to="/settings"
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<SettingsIcon />}
                  >
                    SETTINGS 设置
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        
        <AppointmentDialog
          open={openAppointmentDialog}
          onClose={(refresh) => {
            setOpenAppointmentDialog(false);
            if (refresh) {
              fetchDashboardData();
              setSnackbar({
                open: true,
                message: 'Appointment created successfully!',
                severity: 'success'
              });
            }
          }}
          appointment={null}
          beauticians={beauticians}
          selectedDate={new Date()}
          selectedBeautician={beauticians[0] || null}
        />
        
        <ClientDialog
          open={openClientDialog}
          onClose={(newClient) => {
            setOpenClientDialog(false);
            if (newClient) {
              fetchDashboardData();
              setSnackbar({
                open: true,
                message: 'Client added successfully!',
                severity: 'success'
              });
            }
          }}
          client={null}
        />
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardRefreshContext.Provider>
  );
};

// Create a custom hook for easy access
export const useDashboardRefresh = () => useContext(DashboardRefreshContext);

export default SimpleDashboard; 