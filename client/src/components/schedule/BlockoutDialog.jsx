import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import api from '../../services/api';

const BlockoutDialog = ({ open, onClose, selectedTimeSlot, beauticians, existingBlockout }) => {
  const [formData, setFormData] = useState({
    beautician: '',
    startDateTime: null,
    endDateTime: null,
    reason: 'OTHER',
    notes: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');

  useEffect(() => {
    if (existingBlockout) {
      setDialogMode('edit');
      console.log('Existing blockout data:', existingBlockout);
      
      // Make sure we have the correct beautician ID
      const beauticianId = typeof existingBlockout.beautician === 'object' ? 
        existingBlockout.beautician._id : existingBlockout.beautician;
      
      setFormData({
        beautician: beauticianId,
        startDateTime: existingBlockout.startDateTime || new Date(existingBlockout.dateTime),
        endDateTime: existingBlockout.endDateTime || new Date(existingBlockout.endTime),
        reason: existingBlockout.reason || 'OTHER',
        notes: existingBlockout.notes || ''
      });
    } else if (selectedTimeSlot) {
      setDialogMode('create');
      const endTime = new Date(selectedTimeSlot.dateTime);
      endTime.setHours(endTime.getHours() + 1); // Default 1 hour duration

      setFormData({
        beautician: selectedTimeSlot.beautician._id,
        startDateTime: selectedTimeSlot.dateTime,
        endDateTime: endTime,
        reason: 'OTHER',
        notes: ''
      });
    }
  }, [selectedTimeSlot, existingBlockout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!existingBlockout || !existingBlockout._id) {
        throw new Error('Missing blockout ID');
      }
      
      console.log('Deleting blockout with ID:', existingBlockout._id);
      
      // Make the API call with the correct ID
      const response = await api.delete(`/staffBlockouts/${existingBlockout._id}`);
      console.log('Delete response:', response);
      
      // Close the dialog and trigger a refresh
      onClose(true);
      
      // Dispatch an event to refresh the schedule
      window.dispatchEvent(new CustomEvent('appointmentUpdated', {
        detail: { type: 'blockout', action: 'delete', id: existingBlockout._id }
      }));
    } catch (error) {
      console.error('Error deleting blockout:', error);
      setError(error.response?.data?.message || error.message || 'Failed to delete blockout');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.beautician || !formData.startDateTime || !formData.endDateTime || !formData.reason) {
        throw new Error('Please fill in all required fields');
      }
      
      const blockoutData = {
        beautician: formData.beautician,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        reason: formData.reason,
        notes: formData.notes || ''
      };
      
      console.log('Submitting blockout data:', blockoutData);
      
      if (dialogMode === 'edit' && existingBlockout && existingBlockout._id) {
        console.log('Updating blockout with ID:', existingBlockout._id);
        const response = await api.put(`/staffBlockouts/${existingBlockout._id}`, blockoutData);
        console.log('Update response:', response);
        
        // Dispatch an event to refresh the schedule
        window.dispatchEvent(new CustomEvent('appointmentUpdated', {
          detail: { type: 'blockout', action: 'update', id: existingBlockout._id }
        }));
      } else {
        console.log('Creating new blockout');
        const response = await api.post('/staffBlockouts', blockoutData);
        console.log('Create response:', response);
        
        // Dispatch an event to refresh the schedule
        window.dispatchEvent(new CustomEvent('appointmentUpdated', {
          detail: { type: 'blockout', action: 'create', id: response.data._id }
        }));
      }
      
      // Close the dialog and trigger a refresh
      onClose(true);
    } catch (error) {
      console.error(`Error ${dialogMode === 'edit' ? 'updating' : 'creating'} blockout:`, error);
      setError(error.response?.data?.message || error.message || `Failed to ${dialogMode === 'edit' ? 'update' : 'create'} blockout`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogMode === 'edit' ? 'Edit Blockout 编辑封锁' : 'Block Time 封锁时间'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Beautician 美容师</InputLabel>
            <Select
              name="beautician"
              value={formData.beautician}
              onChange={handleChange}
              label="Beautician 美容师"
            >
              {beauticians.map(beautician => (
                <MenuItem key={beautician._id} value={beautician._id}>
                  {beautician.firstName} {beautician.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mb: 2 }}>
              <DateTimePicker
                label="Start Time 开始时间"
                value={formData.startDateTime}
                onChange={(newValue) => setFormData(prev => ({ ...prev, startDateTime: newValue }))}
                slotProps={{ 
                  textField: { fullWidth: true },
                  minutesStep: 15
                }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <DateTimePicker
                label="End Time 结束时间"
                value={formData.endDateTime}
                onChange={(newValue) => setFormData(prev => ({ ...prev, endDateTime: newValue }))}
                slotProps={{ 
                  textField: { fullWidth: true },
                  minutesStep: 15
                }}
                minDateTime={formData.startDateTime}
              />
            </Box>
          </LocalizationProvider>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Reason 原因</InputLabel>
            <Select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              label="Reason 原因"
            >
              <MenuItem value="LEAVE">Leave 请假</MenuItem>
              <MenuItem value="LUNCH">Lunch Break 午休</MenuItem>
              <MenuItem value="MEETING">Meeting 会议</MenuItem>
              <MenuItem value="TRAINING">Training 培训</MenuItem>
              <MenuItem value="OTHER">Other 其他</MenuItem>
            </Select>
          </FormControl>

          <TextField
            name="notes"
            label="Notes 备注"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={loading}>Cancel 取消</Button>
        
        {dialogMode === 'edit' && (
          <Button 
            onClick={handleDelete} 
            color="error"
            disabled={loading}
            sx={{ marginRight: 'auto' }}
          >
            Delete 删除
          </Button>
        )}
        
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !formData.beautician || !formData.startDateTime || !formData.endDateTime || !formData.reason}
        >
          {dialogMode === 'edit' ? 'Update 更新' : 'Save 保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockoutDialog; 