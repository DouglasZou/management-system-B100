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
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import api from '../../services/api';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useDashboardRefresh } from '../dashboard/SimpleDashboard';
import { MuiTelInput } from 'mui-tel-input';

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

  const handleOpenProfile = async (client) => {
    setSelectedProfileClient(client);
    setOpenProfileDialog(true);
    
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      
      console.log(`Fetching history for client: ${client._id}`);
      const response = await api.get(`/clients/${client._id}/history`);
      console.log('Client history:', response.data);
      
      const sortedHistory = response.data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setClientHistory(sortedHistory);
    } catch (err) {
      console.error('Error fetching client history:', err);
      setHistoryError('Failed to load visit history');
    } finally {
      setLoadingHistory(false);
    }
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
                        onClick={() => handleOpenProfile(client)}
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
              <Typography variant="h6">Contact Information 联系方式</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Customer ID:
                </Typography>
                <Typography>{selectedProfileClient.custID || 'Not assigned'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{selectedProfileClient.email || 'No email'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{selectedProfileClient.phone || 'No phone'}</Typography>
              </Box>
              
              {selectedProfileClient.gender && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Gender 性别:
                  </Typography>
                  <Typography>
                    {selectedProfileClient.gender.charAt(0).toUpperCase() + selectedProfileClient.gender.slice(1)}
                  </Typography>
                </Box>
              )}
              
              <Typography variant="h6" sx={{ mt: 3 }}>Notes 备注</Typography>
              <Typography>{selectedProfileClient.notes || 'No notes 无备注'}</Typography>
              
              <Typography variant="h6" sx={{ mt: 3 }}>Visit History 访问记录</Typography>
              
              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : historyError ? (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {historyError}
                </Alert>
              ) : clientHistory.length === 0 ? (
                <Typography color="text.secondary">
                  No visit history found for this client.
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
                      {clientHistory.map((visit) => (
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