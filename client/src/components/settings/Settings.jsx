import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { getCurrentUser } from '../../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const user = getCurrentUser();
  
  const [generalSettings, setGeneralSettings] = useState({
    salonName: 'Beauty 100',
    address: '123 Main Street, City, Country',
    phone: '+1 234 567 8900',
    email: 'contact@beauty100.com',
    website: 'www.beauty100.com'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    marketingEmails: false
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    });
  };
  
  const handleNotificationSettingsChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="General" />
          <Tab label="Notifications" />
          <Tab label="Account" />
        </Tabs>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Settings saved successfully!
          </Alert>
        )}
        
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Salon Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="salonName"
                  label="Salon Name"
                  value={generalSettings.salonName}
                  onChange={handleGeneralSettingsChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  value={generalSettings.phone}
                  onChange={handleGeneralSettingsChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Email Address"
                  value={generalSettings.email}
                  onChange={handleGeneralSettingsChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="website"
                  label="Website"
                  value={generalSettings.website}
                  onChange={handleGeneralSettingsChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Address"
                  value={generalSettings.address}
                  onChange={handleGeneralSettingsChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationSettingsChange}
                      name="emailNotifications"
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onChange={handleNotificationSettingsChange}
                      name="smsNotifications"
                      color="primary"
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onChange={handleNotificationSettingsChange}
                      name="appointmentReminders"
                      color="primary"
                    />
                  }
                  label="Appointment Reminders"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onChange={handleNotificationSettingsChange}
                      name="marketingEmails"
                      color="primary"
                    />
                  }
                  label="Marketing Emails"
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  value={user?.firstName || ''}
                  fullWidth
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  value={user?.lastName || ''}
                  fullWidth
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  value={user?.email || ''}
                  fullWidth
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Role"
                  value={user?.role || ''}
                  fullWidth
                  margin="normal"
                  disabled
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings; 