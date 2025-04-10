import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox
} from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [branchInfo, setBranchInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Fetch branch settings on component mount
  useEffect(() => {
    fetchBranchInfo();
    fetchTemplates();
  }, []);
  
  const fetchBranchInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/branches/default');
      setBranchInfo(response.data);
    } catch (err) {
      console.error('Error fetching branch info:', err);
      setError('Failed to load branch information. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTemplates = async () => {
    try {
      const response = await api.get('/whatsapp-templates');
      setTemplates(response.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBranchInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await api.put('/branches/default', branchInfo);
      setBranchInfo(response.data);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving branch info:', err);
      setError('Failed to save branch information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateEdit = async (template) => {
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleTemplateSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (selectedTemplate._id) {
        await api.put(`/whatsapp-templates/${selectedTemplate._id}`, selectedTemplate);
      } else {
        await api.post('/whatsapp-templates', selectedTemplate);
      }
      
      setTemplateDialogOpen(false);
      fetchTemplates();
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultTemplate = async (templateId) => {
    try {
      // Update all templates to not be default
      await api.put('/whatsapp-templates/set-default', { templateId });
      
      // Refresh templates
      fetchTemplates();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error setting default template:', err);
      setError('Failed to set default template');
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="General" />
          <Tab label="WhatsApp Templates" />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Settings saved successfully!
          </Alert>
        )}
        
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Salon Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="name"
                    label="Salon Name"
                    value={branchInfo.name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="phone"
                    label="Phone Number"
                    value={branchInfo.phone}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="email"
                    label="Email Address"
                    value={branchInfo.email}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="website"
                    label="Website"
                    value={branchInfo.website}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="address"
                    label="Address"
                    value={branchInfo.address}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">WhatsApp Templates</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => handleTemplateEdit({
                  name: '',
                  template: '',
                  variables: [],
                  description: ''
                })}
              >
                Add Template
              </Button>
            </Box>
            
            <List>
              {templates.map((template) => (
                <ListItem
                  key={template._id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={template.isDefault}
                        onChange={() => handleSetDefaultTemplate(template._id)}
                        sx={{ mr: 1 }}
                      />
                      <IconButton edge="end" onClick={() => handleTemplateEdit(template)}>
                        <EditIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={template.name}
                    secondary={
                      <>
                        {template.description}
                        {template.isDefault && (
                          <Typography component="span" sx={{ ml: 1, color: 'primary.main' }}>
                            (Default)
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {activeTab === 0 && !loading && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSaveSettings}
              disabled={saving}
            >
              Save Settings
            </Button>
          </Box>
        )}
      </Paper>

      {/* Template Edit Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?._id ? 'Edit Template' : 'New Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Template Name"
                value={selectedTemplate?.name || ''}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  name: e.target.value
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Template"
                value={selectedTemplate?.template || ''}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  template: e.target.value
                })}
                fullWidth
                multiline
                rows={6}
                helperText="Available variables: {clientName}, {appointmentDate}, {serviceName}"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={selectedTemplate?.description || ''}
                onChange={(e) => setSelectedTemplate({
                  ...selectedTemplate,
                  description: e.target.value
                })}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTemplateSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 