import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';
import ServiceDialog from './ServiceDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      console.log('Fetching all services...');
      const response = await api.get('/services');
      console.log('Services fetched:', response.data);
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchServices();
  }, []);
  
  // Handle dialog open/close
  const handleOpenDialog = (service = null) => {
    setSelectedService(service);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
  };
  
  // Handle service save
  const handleSaveService = async (serviceData) => {
    try {
      // Always set active to true
      const serviceWithActive = {
        ...serviceData,
        active: true
      };
      
      if (selectedService) {
        // Update existing service
        await api.put(`/services/${selectedService._id}`, serviceWithActive);
      } else {
        // Create new service
        await api.post('/services', serviceWithActive);
      }
      
      fetchServices();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };
  
  // Handle delete dialog
  const handleOpenDeleteDialog = (service) => {
    setSelectedService(service);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedService(null);
  };
  
  // Handle service delete
  const handleDeleteService = async () => {
    try {
      await api.delete(`/services/${selectedService._id}`);
      fetchServices();
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };
  
  // Create a custom table that doesn't include the Status column
  const renderTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name 123</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Duration (min)</TableCell>
              <TableCell>Price ($)</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service._id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{service.duration}</TableCell>
                <TableCell>${service.price}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenDialog(service)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleOpenDeleteDialog(service)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Services
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Service
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        renderTable()
      )}
      
      {/* Service Dialog */}
      <ServiceDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveService}
        service={selectedService}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteService}
        title="Delete Service"
        content={`Are you sure you want to delete ${selectedService?.name}?`}
      />
    </Box>
  );
};

export default ServicesList; 