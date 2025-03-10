import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Spa as SpaIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AppointmentDialog from '../schedule/AppointmentDialog';
import ClientDialog from '../clients/ClientDialog';
import api from '../../services/api';

const DashboardActions = ({ onActionComplete }) => {
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [beauticians, setBeauticians] = useState([]);

  useEffect(() => {
    // Fetch beauticians for the appointment dialog
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

    fetchBeauticians();
  }, []);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenAppointmentDialog(true);
              return false;
            }}
            style={{ width: '100%' }}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AddIcon />}
            >
              NEW APPOINTMENT
            </Button>
          </div>
        </Grid>
        
        <Grid item xs={12}>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenClientDialog(true);
              return false;
            }}
            style={{ width: '100%' }}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<PeopleIcon />}
            >
              ADD CLIENT
            </Button>
          </div>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            component={Link}
            to="/services"
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<SpaIcon />}
          >
            MANAGE SERVICES
          </Button>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            component={Link}
            to="/settings"
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<SettingsIcon />}
          >
            SETTINGS
          </Button>
        </Grid>
      </Grid>
      
      {/* Appointment Dialog */}
      <AppointmentDialog
        open={openAppointmentDialog}
        onClose={(refresh) => {
          setOpenAppointmentDialog(false);
          if (refresh && onActionComplete) onActionComplete();
        }}
        appointment={null}
        beauticians={beauticians}
        selectedDate={new Date()}
        selectedBeautician={beauticians[0] || null}
      />
      
      {/* Client Dialog */}
      <ClientDialog
        open={openClientDialog}
        onClose={(newClient) => {
          setOpenClientDialog(false);
          if (newClient && onActionComplete) onActionComplete();
        }}
        client={null}
      />
    </Paper>
  );
};

export default DashboardActions; 