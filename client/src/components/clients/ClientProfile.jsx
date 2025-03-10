import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('ClientProfile component rendered with id:', id);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching client data for id:', id);
        
        // Fetch client details
        const clientResponse = await api.get(`/clients/${id}`);
        console.log('Client data received:', clientResponse.data);
        setClient(clientResponse.data);
        
        // Fetch client history
        const historyResponse = await api.get(`/clients/${id}/history`);
        console.log('History data received:', historyResponse.data);
        setHistory(historyResponse.data);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'arrived':
        return 'primary';
      case 'completed':
        return 'success';
      case 'noShow':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'arrived':
        return 'Arrived';
      case 'completed':
        return 'Completed';
      case 'noShow':
        return 'No Show';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/clients')}
        sx={{ mb: 3 }}
      >
        Back to Clients
      </Button>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : client ? (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Client Profile 客户资料
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">
                  {client.firstName} {client.lastName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{client.phone || 'No phone number'}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{client.email || 'No email address'}</Typography>
                </Box>
                
                {client.gender && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Gender:
                    </Typography>
                    <Typography>
                      {client.gender.charAt(0).toUpperCase() + client.gender.slice(1)}
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1">
                  {client.notes || 'No notes'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Visit History
            </Typography>
            
            {history.length === 0 ? (
              <Typography color="text.secondary">
                No visit history found for this client.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Beautician</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((visit) => {
                      const serviceName = visit.service ? visit.service.name : 'Unknown Service';
                      const beauticianName = visit.beautician 
                        ? `${visit.beautician.firstName || ''} ${visit.beautician.lastName || ''}`.trim() 
                        : 'Unknown Beautician';
                        
                      return (
                        <TableRow key={visit._id}>
                          <TableCell>
                            {format(new Date(visit.date), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell>{serviceName}</TableCell>
                          <TableCell>{beauticianName}</TableCell>
                          <TableCell>
                            <Chip
                              label={formatStatus(visit.status)}
                              color={getStatusColor(visit.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      ) : (
        <Alert severity="error">Client not found</Alert>
      )}
    </Box>
  );
};

export default ClientProfile; 