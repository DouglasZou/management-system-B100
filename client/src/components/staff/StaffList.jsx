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
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { format } from 'date-fns';
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
    await fetchServiceHistory(staffMember._id);
  };

  const filteredServiceHistory = useMemo(() => {
    if (!serviceHistory) return [];
    
    return serviceHistory.filter(record => {
      if (!record?.client) return false;
      
      // Client search filter
      const searchStr = historySearchTerm.toLowerCase();
      const clientName = `${record.client.firstName || ''} ${record.client.lastName || ''}`.toLowerCase();
      const custID = (record.client.custID || '').toLowerCase();
      const phone = (record.client.phone || '').toLowerCase();
      const matchesSearch = clientName.includes(searchStr) || 
                           custID.includes(searchStr) || 
                           phone.includes(searchStr);
      
      // Date range filter
      let matchesDateRange = true;
      if (selectedDateRange[0] && selectedDateRange[1]) {
        const visitDate = new Date(record.dateTime);
        const startDate = new Date(selectedDateRange[0]);
        const endDate = new Date(selectedDateRange[1]);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        matchesDateRange = visitDate >= startDate && visitDate <= endDate;
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
          return clientName.includes(searchStr) || 
                 custID.includes(searchStr) || 
                 phone.includes(searchStr);
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
    worksheet.addRow(['Date 日期', 'Service 服务', 'Customer 顾客', 'Cust ID 顾客号', 'Status 状态']);
    worksheet.getRow(3).font = { bold: true };
    
    // Set column widths
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 15;
    
    // Add data rows starting from row 4
    dateFilteredHistory.forEach(item => {
      worksheet.addRow([
        format(new Date(item.dateTime), 'MMM d, yyyy h:mm a'),
        item.service.name,
        `${item.client.firstName} ${item.client.lastName}`,
        item.client.custID || '',
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
                      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                           onClick={() => handleStaffProfileClick(staffMember)}>
                        <Avatar sx={{ mr: 2 }}>
                          {staffMember?.firstName ? staffMember.firstName.charAt(0) : '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {staffMember?.firstName || ''} {staffMember?.lastName || ''}
                          </Typography>
                        </Box>
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

        <Dialog
          open={openProfileDialog}
          onClose={() => {
            setOpenProfileDialog(false);
            setSelectedDateRange([null, null]);
          }}
          maxWidth="md"
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
                
                <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    placeholder="Search by customer name, ID, or phone"
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    sx={{ width: 250 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
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
                
                {loadingHistory ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : historyError ? (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {historyError}
                  </Alert>
                ) : filteredServiceHistory.length === 0 ? (
                  <Typography color="text.secondary">
                    No service history found.
                  </Typography>
                ) : (
                  <TableContainer sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date 日期</TableCell>
                          <TableCell>Service 服务</TableCell>
                          <TableCell>Customer 顾客</TableCell>
                          <TableCell>Cust ID 顾客号</TableCell>
                          <TableCell>Status 状态</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredServiceHistory.map((record) => (
                          <TableRow key={record._id}>
                            <TableCell>
                              {format(new Date(record.dateTime), 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell>{record.service.name}</TableCell>
                            <TableCell>
                              {record.client.firstName} {record.client.lastName}
                            </TableCell>
                            <TableCell>{record.client.custID || '-'}</TableCell>
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
            <Button onClick={() => setOpenProfileDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default StaffList; 