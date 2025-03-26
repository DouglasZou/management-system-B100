import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { useDashboardRefresh } from '../dashboard/SimpleDashboard';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: 'other'
  });
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const refreshDashboard = useDashboardRefresh();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      setFormData({
        name: selectedService.name || '',
        description: selectedService.description || '',
        duration: selectedService.duration || 60,
        price: selectedService.price || 0,
        category: selectedService.category || 'other'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        category: 'other'
      });
    }
  }, [selectedService]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (service = null) => {
    setSelectedService(service);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedService(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (selectedService) {
        // Update existing service
        await api.put(`/services/${selectedService._id}`, formData);
      } else {
        // Create new service
        await api.post('/services', formData);
      }
      
      fetchServices();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setOpenConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      await api.delete(`/services/${serviceToDelete._id}`);
      
      if (refreshDashboard) refreshDashboard();
      
      fetchServices();
      setOpenConfirmDelete(false);
      setServiceToDelete(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Services 服务列表</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            添加服务
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading && !openForm ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name 名称</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Duration (min)</TableCell>
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
                    <TableCell>{service.category}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenForm(service)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(service)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {services.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No services found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Service Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Service Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                select
                fullWidth
              >
                <MenuItem value="wellness">Wellness</MenuItem>
                <MenuItem value="slimming">Slimming</MenuItem>
                <MenuItem value="facial">Facial</MenuItem>
                <MenuItem value="others">Others</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="duration"
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="price"
                label="Price ($)"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        title="Delete Service"
        message={`Are you sure you want to delete ${serviceToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default ServiceList; 