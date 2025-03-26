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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import api from '../../services/api';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useDashboardRefresh } from '../dashboard/SimpleDashboard';
import { MuiTelInput } from 'mui-tel-input';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    custID: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    gender: ''
  });
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [selectedProfileClient, setSelectedProfileClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const navigate = useNavigate();
  const refreshDashboard = useDashboardRefresh();
  const [phoneValue, setPhoneValue] = useState('+65');
  const [selectedBeautician, setSelectedBeautician] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [beauticians, setBeauticians] = useState([]);

  console.log('ClientList component rendered');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setFormData({
        custID: selectedClient.custID || '',
        firstName: selectedClient.firstName || '',
        lastName: selectedClient.lastName || '',
        email: selectedClient.email || '',
        phone: selectedClient.phone || '',
        notes: selectedClient.notes || '',
        gender: selectedClient.gender || ''
      });
      setPhoneValue(selectedClient.phone || '+65');
    } else {
      setFormData({
        custID: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
        gender: ''
      });
      setPhoneValue('+65');
    }
  }, [selectedClient]);

  useEffect(() => {
    fetchBeauticians();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBeauticians = async () => {
    try {
      const response = await api.get('/users', {
        params: { role: 'beautician', includeInactive: 'false' }
      });
      setBeauticians(response.data);
    } catch (error) {
      console.error('Error fetching beauticians:', error);
    }
  };

  const handleOpenForm = (client = null) => {
    setSelectedClient(client);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedClient(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhoneChange = (newValue, info) => {
    setPhoneValue(newValue);
    setFormData(prev => ({
      ...prev,
      phone: newValue
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add this console log
      console.log('Form data:', {
        custID: formData.custID,  // Check if this exists
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: phoneValue,
        gender: formData.gender,
        notes: formData.notes
      });
      
      const clientData = {
        custID: formData.custID,  // Make sure this is explicitly set
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: phoneValue,
        gender: formData.gender || '',
        notes: formData.notes || ''
      };
      
      // Add this console log
      console.log('Sending to server:', clientData);
      
      let response;
      if (selectedClient) {
        response = await api.put(`/clients/${selectedClient._id}`, clientData);
      } else {
        response = await api.post('/clients', clientData);
      }
      
      // Add this console log
      console.log('Response from server:', response.data);
      
      fetchClients();
      handleCloseForm();
      
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Error saving client:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setOpenConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      await api.delete(`/clients/${clientToDelete._id}`);
      
      if (refreshDashboard) refreshDashboard();
      
      fetchClients();
      setOpenConfirmDelete(false);
      setClientToDelete(null);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientVisitHistory = async (clientId) => {
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      
      // Fetch both active appointments and history
      const [appointmentsResponse, historyResponse] = await Promise.all([
        api.get(`/appointments/client/${clientId}`),
        api.get(`/clients/${clientId}/history`)
      ]);
      
      // Create a map to track which appointments we've already processed
      const processedAppointments = new Map();
      
      // Process historical records first (they take precedence)
      const historicalAppointments = historyResponse.data.map(hist => {
        // Mark this appointment ID as processed
        if (hist.appointment) {
          processedAppointments.set(hist.appointment._id || hist.appointment, true);
        }
        
        return {
          _id: hist._id,
          date: hist.date,
          service: hist.service,
          beautician: hist.beautician,
          status: hist.status,
          isHistorical: true
        };
      });
      
      // Only include active appointments that aren't already in history
      const activeAppointments = appointmentsResponse.data
        .filter(apt => !processedAppointments.has(apt._id))
        .map(apt => ({
          _id: apt._id,
          date: apt.dateTime,
          service: apt.service,
          beautician: apt.beautician,
          status: apt.status,
          isActive: true
        }));
      
      // Combine and sort by date (newest first)
      const allHistory = [...activeAppointments, ...historicalAppointments]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setClientHistory(allHistory);
      setLoadingHistory(false);
    } catch (error) {
      console.error('Error fetching client history:', error);
      setHistoryError('Failed to load visit history');
      setLoadingHistory(false);
    }
  };

  const handleViewProfile = (client) => {
    setSelectedProfileClient(client);
    setOpenProfileDialog(true);
    fetchClientVisitHistory(client._id);
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'arrived':
      case 'checked-in':
        return 'Arrived 到达';
      case 'completed':
        return 'Completed 完成';
      case 'noShow':
      case 'no-show':
        return 'No Show 没来';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'arrived':
      case 'checked-in':
        return 'warning';
      case 'completed':
        return 'success';
      case 'noShow':
      case 'no-show':
        return 'error';
      default:
        return 'default';
    }
  };

  const StatusChip = ({ status }) => {
    const formattedStatus = formatStatus(status);
    const color = getStatusColor(status);
    
    return (
      <Chip
        label={formattedStatus}
        color={color}
        size="small"
        sx={{ 
          minWidth: '115px',
          maxWidth: '115px',
          justifyContent: 'center',
          '& .MuiChip-label': {
            padding: '0 8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            width: '100%',
            textAlign: 'center'
          }
        }}
      />
    );
  };

  const filteredClients = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return clients.filter(client => {
      return (
        (client.custID || '').toLowerCase().includes(searchLower) ||
        client.firstName.toLowerCase().includes(searchLower) ||
        client.lastName.toLowerCase().includes(searchLower) ||
        (client.email || '').toLowerCase().includes(searchLower) ||
        (client.phone || '').includes(searchTerm)
      );
    });
  }, [clients, searchTerm]);

  const openWhatsApp = (phoneNumber) => {
    // Remove any spaces, dashes, or other characters
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    // WhatsApp API URL
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredHistory = useMemo(() => {
    return clientHistory.filter(visit => {
      // Filter by beautician if selected
      if (selectedBeautician && visit.beautician._id !== selectedBeautician) {
        return false;
      }
      
      // Filter by date range if selected
      if (selectedDateRange[0] && selectedDateRange[1]) {
        const visitDate = new Date(visit.date);
        const startDate = new Date(selectedDateRange[0]);
        const endDate = new Date(selectedDateRange[1]);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        if (visitDate < startDate || visitDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [clientHistory, selectedBeautician, selectedDateRange]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Clients 客户列表
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Client 添加客户
          </Button>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search by ID, name, email, or phone 搜索客户..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
          sx={{ mb: 3 }}
        />
        
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
                  <TableCell>ID</TableCell>
                  <TableCell>Name 姓名</TableCell>
                  <TableCell>Email 邮箱</TableCell>
                  <TableCell>Phone 电话</TableCell>
                  <TableCell>Actions 操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>{client.custID || '-'}</TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleViewProfile(client)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          color: '#1976d2',
                          cursor: 'pointer',
                          textAlign: 'left',
                          padding: 0,
                          fontWeight: 'normal'
                        }}
                      >
                        {client.firstName} {client.lastName}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        {client.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Button
                          onClick={() => openWhatsApp(client.phone)}
                          sx={{
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {client.phone || 'No phone'}
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenForm(client)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(client)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No clients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedClient ? 'Edit Client 编辑客户' : 'Add New Client 添加客户'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="custID"
                label="Customer ID"
                value={formData.custID}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="firstName"
                label="First Name 名"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="lastName"
                label="Last Name 姓"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email 邮箱"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MuiTelInput
                value={phoneValue}
                onChange={handlePhoneChange}
                defaultCountry="SG"
                fullWidth
                label="Phone 电话"
                required
                langOfCountryName="en"
                preferredCountries={['SG', 'CN', 'MY', 'ID']}
                excludedCountries={[]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender 性别</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender 性别"
                >
                  <MenuItem value="male">Male 男</MenuItem>
                  <MenuItem value="female">Female 女</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes 备注"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
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
            disabled={loading || !formData.firstName || !formData.lastName || !phoneValue}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <ConfirmationDialog
        open={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        title="Delete Client"
        message={`Are you sure you want to delete ${clientToDelete?.firstName} ${clientToDelete?.lastName}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
      
      <Dialog 
        open={openProfileDialog} 
        onClose={() => setOpenProfileDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Client Profile 客户资料: {selectedProfileClient?.firstName} {selectedProfileClient?.lastName}
        </DialogTitle>
        <DialogContent>
          {selectedProfileClient && (
            <Box sx={{ p: 2 }}>
              {/* Profile Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <Avatar 
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: 'primary.main',
                    mr: 2
                  }}
                >
                  {selectedProfileClient?.firstName?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {selectedProfileClient?.firstName} {selectedProfileClient?.lastName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mr: 2 
                      }}
                    >
                      CUST ID 顾客号: {selectedProfileClient.custID || 'Not assigned'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                      }}
                    >
                      GENDER 性别: {selectedProfileClient.gender || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Contact Details Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                    </Box>
                    <Typography>
                      {selectedProfileClient.email || 'No email'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                    </Box>
                    <Typography>
                      {selectedProfileClient.phone || 'No phone'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Notes Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Notes 备注
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    minHeight: 60
                  }}
                >
                  <Typography color="text.secondary">
                    {selectedProfileClient.notes || 'No notes 无备注'}
                  </Typography>
                </Paper>
              </Box>

              {/* Visit History section continues as before */}
              <Typography variant="h6">Visit History 访问记录</Typography>
              
              <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Therapist 护理师</InputLabel>
                  <Select
                    value={selectedBeautician}
                    onChange={(e) => setSelectedBeautician(e.target.value)}
                    label="Therapist 护理师"
                  >
                    <MenuItem value="">All Therapists</MenuItem>
                    {beauticians.map((beautician) => (
                      <MenuItem key={beautician._id} value={beautician._id}>
                        {beautician.firstName} {beautician.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={selectedDateRange[0]}
                    onChange={(newValue) => {
                      setSelectedDateRange([newValue, selectedDateRange[1]]);
                    }}
                    renderInput={(params) => <TextField {...params} sx={{ width: 150 }} />}
                  />
                  <Box sx={{ mx: 1 }}>to</Box>
                  <DatePicker
                    label="End Date"
                    value={selectedDateRange[1]}
                    onChange={(newValue) => {
                      setSelectedDateRange([selectedDateRange[0], newValue]);
                    }}
                    renderInput={(params) => <TextField {...params} sx={{ width: 150 }} />}
                  />
                </LocalizationProvider>
                
                <Button 
                  variant="contained"
                  onClick={() => {
                    setSelectedBeautician('');
                    setSelectedDateRange([null, null]);
                  }}
                  sx={{ ml: 1 }}
                >
                  Clear
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
              ) : filteredHistory.length === 0 ? (
                <Typography color="text.secondary">
                  No matching visits found.
                </Typography>
              ) : (
                <TableContainer sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date 日期</TableCell>
                        <TableCell>Service 服务</TableCell>
                        <TableCell>Therapist 护理师</TableCell>
                        <TableCell>Status 状态</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredHistory.map((visit) => (
                        <TableRow key={visit._id}>
                          <TableCell>
                            {format(new Date(visit.date), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell>{visit.service.name}</TableCell>
                          <TableCell>
                            {visit.beautician.firstName} {visit.beautician.lastName}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={visit.status} />
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
    </Box>
  );
};

export default ClientList; 