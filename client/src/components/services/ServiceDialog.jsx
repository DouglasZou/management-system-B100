import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';

const ServiceDialog = ({ open, onClose, onSave, service }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: ''
  });
  
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || '',
        price: service.price || '',
        category: service.category || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: ''
      });
    }
  }, [service]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = () => {
    // Convert string values to numbers where needed
    const serviceData = {
      ...formData,
      duration: parseInt(formData.duration, 10),
      price: parseFloat(formData.price)
    };
    
    onSave(serviceData);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{service ? 'Edit Service' : 'Add Service'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Service Name"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={2}
        />
        <TextField
          margin="dense"
          name="duration"
          label="Duration (minutes)"
          type="number"
          fullWidth
          value={formData.duration}
          onChange={handleChange}
          required
          inputProps={{ min: 5 }}
        />
        <TextField
          margin="dense"
          name="price"
          label="Price ($)"
          type="number"
          fullWidth
          value={formData.price}
          onChange={handleChange}
          required
          inputProps={{ min: 0, step: 0.01 }}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            label="Category"
          >
            <MenuItem value="facial">Facial</MenuItem>
            <MenuItem value="massage">Massage</MenuItem>
            <MenuItem value="other">Other</MenuItem>
            <MenuItem value="test">Test</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceDialog; 