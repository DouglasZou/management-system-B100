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
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import api from '../../services/api';

const categories = [
  { value: 'wellness', label: 'Wellness' },
  { value: 'slimming', label: 'Slimming' },
  { value: 'facial', label: 'Facial' },
  { value: 'others', label: 'Others' }
];

const ServiceForm = ({ open, onClose, service = null }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: service?.name || '',
      description: service?.description || '',
      duration: service?.duration || 60,
      price: service?.price || '',
      category: service?.category || 'other',
      active: service?.active ?? true
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      description: Yup.string().required('Description is required'),
      duration: Yup.number()
        .required('Duration is required')
        .positive('Duration must be positive')
        .integer('Duration must be a whole number'),
      price: Yup.number()
        .required('Price is required')
        .positive('Price must be positive'),
      category: Yup.string().required('Category is required')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        if (service) {
          await api.put(`/services/${service._id}`, values);
        } else {
          await api.post('/services', values);
        }
        
        onClose(true);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{service ? 'Edit Service' : 'Add Service'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Service Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="duration"
                name="duration"
                label="Duration (minutes)"
                type="number"
                value={formik.values.duration}
                onChange={formik.handleChange}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
                helperText={formik.touched.duration && formik.errors.duration}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                id="price"
                name="price"
                label="Price ($)"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="category"
                name="category"
                select
                label="Category"
                value={formik.values.category}
                onChange={formik.handleChange}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
              >
                {categories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.active}
                    onChange={(e) => formik.setFieldValue('active', e.target.checked)}
                    name="active"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => onClose(false)}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ServiceForm; 