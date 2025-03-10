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
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Grid,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { format } from 'date-fns';
import ConfirmationDialog from '../common/ConfirmationDialog';
import StaffDialog from './StaffDialog';
import { useDashboardRefresh } from '../dashboard/SimpleDashboard';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const refreshDashboard = useDashboardRefresh();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all users with role 'beautician', including inactive ones
      const response = await api.get('/users', {
        params: { 
          role: 'beautician',
          includeInactive: 'true'
        }
      });
      
      setStaff(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDeleteClick = (staffMember) => {
    setStaffToDelete(staffMember);
    setOpenConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/users/${staffToDelete._id}`);
      
      // Refresh the dashboard after successful deletion
      if (refreshDashboard) refreshDashboard();
      
      fetchStaff();
      setOpenConfirmDelete(false);
      setStaffToDelete(null);
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setError('Failed to delete staff member. ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirmDelete(false);
    setStaffToDelete(null);
  };

  // Filter staff based on search term
  const filteredStaff = staff.filter(staffMember => {
    const fullName = `${staffMember.firstName} ${staffMember.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           staffMember.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setOpenStaffDialog(true);
  };

  const handleEditStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setOpenStaffDialog(true);
  };

  const handleCloseStaffDialog = (newStaff) => {
    setOpenStaffDialog(false);
    if (newStaff) {
      fetchStaff();
    }
  };

  const handleStatusToggle = async (staffMember) => {
    try {
      const newStatus = !staffMember.active;
      
      await api.put(`/users/${staffMember._id}`, {
        ...staffMember,
        active: newStatus
      });
      
      // Update local state to reflect the change
      setStaff(staff.map(s => 
        s._id === staffMember._id ? {...s, active: newStatus} : s
      ));
      
      // Refresh dashboard to update counts and lists
      if (refreshDashboard) refreshDashboard();
      
    } catch (err) {
      console.error('Error updating staff status:', err);
      setError('Failed to update staff status. ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Staff Management 员工管理</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddStaff}
          >
            Add Staff Member
          </Button>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search staff by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredStaff.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No staff members found
            </Typography>
            {searchTerm && (
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => setSearchTerm('')}
                sx={{ mt: 1 }}
              >
                Clear Search
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Date Registered</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow key={staffMember._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {staffMember.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {staffMember.firstName} {staffMember.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{staffMember.email}</Typography>
                        </Box>
                        {staffMember.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{staffMember.phone}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {format(new Date(staffMember.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={staffMember.active ? "Click to deactivate" : "Click to activate"}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={staffMember.active}
                              onChange={() => handleStatusToggle(staffMember)}
                              color="primary"
                            />
                          }
                          label={
                            <Chip
                              label={staffMember.active ? "Active" : "Inactive"}
                              color={staffMember.active ? "success" : "default"}
                              size="small"
                            />
                          }
                          labelPlacement="end"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditStaff(staffMember)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteClick(staffMember)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <ConfirmationDialog
          open={openConfirmDelete}
          title="Delete Staff Member"
          content={`Are you sure you want to delete ${staffToDelete?.firstName} ${staffToDelete?.lastName}? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        <StaffDialog
          open={openStaffDialog}
          onClose={handleCloseStaffDialog}
          staff={selectedStaff}
        />
      </Paper>
    </Box>
  );
};

export default StaffList; 