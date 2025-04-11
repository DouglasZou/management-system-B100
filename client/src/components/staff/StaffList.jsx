import React, { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Reorder as ReorderIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import ConfirmationDialog from '../common/ConfirmationDialog';
import StaffDialog from './StaffDialog';
import { useDashboardRefresh } from '../dashboard/SimpleDashboard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const StatusChip = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { label: 'Completed 完成', color: 'success' };
      case 'no-show':
      case 'noshow':
        return { label: 'No Show 没来', color: 'error' };
      case 'arrived':
        return { label: 'Arrived 到达', color: 'warning' };
      case 'scheduled':
        return { label: 'Scheduled 已约', color: 'default' };
      default:
        return { label: status, color: 'default' };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{
        minWidth: '115px',
        maxWidth: '115px',
        justifyContent: 'center',
        '&.MuiChip-colorSuccess': {
          backgroundColor: 'green',
          color: 'white',
        },
        '&.MuiChip-colorError': {
          backgroundColor: '#d32f2f',
          color: 'white',
        },
        '&.MuiChip-colorWarning': {
          backgroundColor: '#ed6c02',
          color: 'white',
        }
      }}
    />
  );
};

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [selectedProfileStaff, setSelectedProfileStaff] = useState(null);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const refreshDashboard = useDashboardRefresh();
  const [reorderMode, setReorderMode] = useState(false);

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

  const handleCloseStaffDialog = async (success) => {
    setOpenStaffDialog(false);
    
    if (success) {
      // If a staff member was successfully added or updated
      await fetchStaff();
      
      // Fix the beautician display order
      await fixBeauticianDisplayOrder();
      
      // Refresh dashboard to update counts and lists
      if (refreshDashboard) refreshDashboard();
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

  const fetchServiceHistory = async (staffId) => {
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      
      const response = await api.get(`/appointments/beautician/${staffId}`);
      setServiceHistory(response.data);
    } catch (error) {
      console.error('Error fetching service history:', error);
      setHistoryError('Failed to load service history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStaffProfileClick = async (staffMember) => {
    setSelectedProfileStaff(staffMember);
    setOpenProfileDialog(true);
    setHistorySearchTerm('');
    setSelectedDateRange([null, null]);
    await fetchServiceHistory(staffMember._id);
  };

  const filteredHistory = useMemo(() => {
    if (!serviceHistory) return [];
    
    return serviceHistory.filter(record => {
      if (!record?.client || !record?.service) return false;
      
      // Client search filter
      const searchStr = historySearchTerm.toLowerCase();
      const clientName = `${record.client.firstName || ''} ${record.client.lastName || ''}`.toLowerCase();
      const custID = (record.client.custID || '').toLowerCase();
      const phone = (record.client.phone || '').toLowerCase();
      const notes = (record.notes || '').toLowerCase();
      const serviceName = (record.service.name || '').toLowerCase();
      
      const matchesSearch = clientName.includes(searchStr) || 
                           custID.includes(searchStr) || 
                           phone.includes(searchStr) ||
                           notes.includes(searchStr) ||
                           serviceName.includes(searchStr);
      
      // Date range filter
      let matchesDateRange = true;
      if (selectedDateRange[0] && selectedDateRange[1]) {
        const visitDate = new Date(record.dateTime);
        const startDate = startOfDay(selectedDateRange[0]);
        const endDate = endOfDay(selectedDateRange[1]);
        
        matchesDateRange = isWithinInterval(visitDate, { start: startDate, end: endDate });
      }
      
      return matchesSearch && matchesDateRange;
    });
  }, [serviceHistory, historySearchTerm, selectedDateRange]);

  const exportToExcel = async () => {
    if (!selectedProfileStaff || !serviceHistory || serviceHistory.length === 0) {
      return; // Don't export if no staff selected or no history
    }
    
    // Apply the same filtering as in your component
    const filteredHistory = historySearchTerm 
      ? serviceHistory.filter(record => {
          if (!record?.client) return false;
          
          const searchStr = historySearchTerm.toLowerCase();
          const clientName = `${record.client.firstName || ''} ${record.client.lastName || ''}`.toLowerCase();
          const custID = (record.client.custID || '').toLowerCase();
          const phone = (record.client.phone || '').toLowerCase();
          const notes = (record.notes || '').toLowerCase();
          
          return clientName.includes(searchStr) || 
                 custID.includes(searchStr) || 
                 phone.includes(searchStr) ||
                 notes.includes(searchStr);
        })
      : serviceHistory;
    
    // Apply date range filter if selected
    const dateFilteredHistory = selectedDateRange[0] && selectedDateRange[1]
      ? filteredHistory.filter(record => {
          const visitDate = new Date(record.dateTime);
          const startDate = new Date(selectedDateRange[0]);
          const endDate = new Date(selectedDateRange[1]);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          
          return visitDate >= startDate && visitDate <= endDate;
        })
      : filteredHistory;
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Service History');
    
    // Add beautician name as title
    worksheet.addRow([`Beautician: ${selectedProfileStaff.firstName} ${selectedProfileStaff.lastName}`]);
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(1).height = 25;
    
    // Add a blank row
    worksheet.addRow([]);
    
    // Add headers in row 3
    worksheet.addRow(['Date 日期', 'Service 服务', 'Customer 顾客', 'Cust ID 顾客号', 'Notes 备注', 'Status 状态']);
    worksheet.getRow(3).font = { bold: true };
    
    // Set column widths
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 25;
    worksheet.getColumn(6).width = 15;
    
    // Add data rows starting from row 4
    dateFilteredHistory.forEach(item => {
      worksheet.addRow([
        format(new Date(item.dateTime), 'MMM d, yyyy h:mm a'),
        item.service.name,
        `${item.client.firstName} ${item.client.lastName}`,
        item.client.custID || '',
        item.notes || '',
        item.status
      ]);
    });
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Create a blob from the buffer
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Generate file name
    const fileName = `${selectedProfileStaff.firstName}_${selectedProfileStaff.lastName}_Service_History_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Save the file
    saveAs(blob, fileName);
  };

  const handleReorder = async (staffId, direction) => {
    try {
      // Find the current staff member and their neighbors
      const currentIndex = filteredStaff.findIndex(s => s._id === staffId);
      if (currentIndex === -1) return;
      
      const currentStaff = filteredStaff[currentIndex];
      
      // Calculate new positions
      let updates = [];
      
      if (direction === 'up' && currentIndex > 0) {
        // Move up - swap with the staff member above
        const prevStaff = filteredStaff[currentIndex - 1];
        updates = [
          { userId: currentStaff._id, newOrder: prevStaff.displayOrder || currentIndex - 1 },
          { userId: prevStaff._id, newOrder: currentStaff.displayOrder || currentIndex }
        ];
      } else if (direction === 'down' && currentIndex < filteredStaff.length - 1) {
        // Move down - swap with the staff member below
        const nextStaff = filteredStaff[currentIndex + 1];
        updates = [
          { userId: currentStaff._id, newOrder: nextStaff.displayOrder || currentIndex + 1 },
          { userId: nextStaff._id, newOrder: currentStaff.displayOrder || currentIndex }
        ];
      } else {
        return; // Invalid direction or at the edge
      }
      
      // Send the updates to the server
      const response = await api.put('/users/order', { orderUpdates: updates });
      
      // Update the local state with the new order
      setStaff(response.data);
      
      // Refresh dashboard to update counts and lists
      if (refreshDashboard) refreshDashboard();
      
    } catch (err) {
      console.error('Error reordering staff:', err);
      setError('Failed to reorder staff. ' + (err.response?.data?.message || err.message));
    }
  };

  const fixBeauticianDisplayOrder = async () => {
    try {
      console.log('Fixing beautician display order...');
      
      // Get all beauticians sorted by creation date (oldest first)
      const response = await api.get('/users', {
        params: { 
          role: 'beautician',
          includeInactive: 'true'
        }
      });
      
      const beauticians = response.data.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      console.log(`Found ${beauticians.length} beauticians to reorder`);
      
      // Create an array of order updates
      const orderUpdates = beauticians.map((beautician, index) => ({
        userId: beautician._id,
        newOrder: index + 1
      }));
      
      // Send the updates to the server
      const updateResponse = await api.put('/users/order', { orderUpdates });
      
      // Update the local state with the new order
      setStaff(updateResponse.data);
      console.log('Beautician display order fixed successfully');
      
    } catch (error) {
      console.error('Error fixing beautician display order:', error);
      setError('Failed to fix beautician display order: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Staff Management 员工管理</Typography>
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ReorderIcon />}
              onClick={() => setReorderMode(!reorderMode)}
              sx={{ mr: 2 }}
            >
              {reorderMode ? 'Exit Reorder Mode' : 'Reorder Staff'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddStaff}
            >
              Add Staff Member
            </Button>
          </Box>
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
                      <Box
                        onClick={() => handleStaffProfileClick(staffMember)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            color: '#64b5f6',
                          },
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Avatar sx={{ mr: 2, bgcolor: '#8d6e63' }}>
                          {staffMember.firstName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontSize: '0.875rem',
                            color: '#1976d2'
                          }}
                        >
                          {staffMember.firstName} {staffMember.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{staffMember?.email || 'No email'}</Typography>
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
                      {staffMember?.createdAt ? format(new Date(staffMember.createdAt), 'MMM d, yyyy') : '-'}
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
                      {reorderMode ? (
                        <Box sx={{ display: 'flex' }}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleReorder(staffMember._id, 'up')}
                            disabled={filteredStaff.indexOf(staffMember) === 0}
                          >
                            <ArrowUpIcon />
                          </IconButton>
                          <IconButton 
                            color="primary"
                            onClick={() => handleReorder(staffMember._id, 'down')}
                            disabled={filteredStaff.indexOf(staffMember) === filteredStaff.length - 1}
                          >
                            <ArrowDownIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
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
                        </>
                      )}
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

        <Dialog
          open={openProfileDialog}
          onClose={() => {
            setOpenProfileDialog(false);
            setSelectedDateRange([null, null]);
            setHistorySearchTerm('');
          }}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Staff Profile 员工资料: {selectedProfileStaff?.firstName || ''} {selectedProfileStaff?.lastName || ''}
              </Typography>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={exportToExcel}
                disabled={loadingHistory || !serviceHistory || serviceHistory.length === 0}
                size="small"
              >
                Export History 导出记录
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedProfileStaff && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">Contact Information 联系方式</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{selectedProfileStaff.email}</Typography>
                </Box>
                {selectedProfileStaff.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{selectedProfileStaff.phone}</Typography>
                  </Box>
                )}
                
                <Typography variant="h6" sx={{ mt: 3 }}>Service History 服务记录</Typography>
                
                <Box sx={{ mt: 2, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                  <TextField
                    placeholder="Search by customer, service, ID, or notes"
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 300, flexShrink: 0 }}
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date"
                        value={selectedDateRange[0]}
                        onChange={(newValue) => {
                          setSelectedDateRange([newValue, selectedDateRange[1]]);
                        }}
                        slotProps={{ textField: { sx: { width: 170 } } }}
                      />
                      <Box sx={{ mx: 1 }}>to</Box>
                      <DatePicker
                        label="End Date"
                        value={selectedDateRange[1]}
                        onChange={(newValue) => {
                          setSelectedDateRange([selectedDateRange[0], newValue]);
                        }}
                        slotProps={{ textField: { sx: { width: 170 } } }}
                      />
                    </LocalizationProvider>
                    
                    <Button 
                      variant="contained"
                      onClick={() => {
                        setSelectedDateRange([null, null]);
                      }}
                      sx={{ 
                        ml: 1,
                        bgcolor: '#8d6e63',
                        '&:hover': {
                          bgcolor: '#6d4c41'
                        }
                      }}
                    >
                      CLEAR
                    </Button>
                  </Box>
                </Box>
                
                {loadingHistory ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : historyError ? (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {historyError}
                  </Alert>
                ) : filteredHistory.length === 0 ? (
                  <Typography color="text.secondary">
                    No service history found.
                  </Typography>
                ) : (
                  <TableContainer sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width="18%">Date 日期</TableCell>
                          <TableCell width="18%">Service 服务</TableCell>
                          <TableCell width="18%">Customer 顾客</TableCell>
                          <TableCell width="12%">Cust ID 顾客号</TableCell>
                          <TableCell width="22%">Notes 备注</TableCell>
                          <TableCell width="12%">Status 状态</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredHistory.map((record) => (
                          <TableRow key={record._id}>
                            <TableCell>
                              {format(new Date(record.dateTime), 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell>{record.service.name}</TableCell>
                            <TableCell>
                              {record.client.firstName} {record.client.lastName}
                            </TableCell>
                            <TableCell>{record.client.custID || '-'}</TableCell>
                            <TableCell>{record.notes || '-'}</TableCell>
                            <TableCell>
                              <StatusChip status={record.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenProfileDialog(false);
              setSelectedDateRange([null, null]);
              setHistorySearchTerm('');
            }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default StaffList; 