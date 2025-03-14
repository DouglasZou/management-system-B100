import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Paper, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  Checkbox,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CheckCircle as CheckCircleFilledIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import { useDashboardRefresh } from '../dashboard/SimpleDashboard';

const AppointmentCard = ({ appointment, onClick, style, className, onDelete, hasCollision = false, isWeekView = false }) => {
  const [status, setStatus] = useState(appointment.status || 'scheduled');
  const [confirmation, setConfirmation] = useState(appointment.confirmation || 'unsent');
  const [updating, setUpdating] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const refreshDashboard = useDashboardRefresh();
  
  // Add null checks to prevent errors
  if (!appointment || !appointment.client || !appointment.service || !appointment.dateTime || !appointment.beautician) {
    console.error('Invalid appointment data:', appointment);
    return null; // Don't render anything if data is incomplete
  }
  
  const { client, service, dateTime, beautician } = appointment;
  
  // Format time
  const time = format(new Date(dateTime), 'h:mm a');
  
  // Calculate duration display
  const duration = service.duration || 60;
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  const durationDisplay = hours > 0 
    ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
    : `${mins}m`;
  
  // Determine if this is a very short appointment (less than 30 minutes)
  const isShortAppointment = duration < 30;
  
  // Get background color based on status - SOLID COLORS
  const getBackgroundColor = () => {
    switch (status) {
      case 'arrived':
      case 'checked-in':
        return '#FFF176'; // Solid yellow
      case 'completed':
        return '#A5D6A7'; // Solid green
      case 'noShow':
      case 'no-show':
        return '#E53935'; // Material Design Red 600 (matches the icon)
      default:
        return '#F8BBD0'; // Solid pink
    }
  };
  
  // Get chip background color based on status
  const getChipBackgroundColor = () => {
    switch (status) {
      case 'arrived':
      case 'checked-in':
        return 'rgba(245, 127, 23, 0.2)'; // Darker orange/amber for yellow cards
      case 'completed':
        return 'rgba(46, 125, 50, 0.2)'; // Darker green for green cards
      case 'noShow':
      case 'no-show':
        return 'rgba(198, 40, 40, 0.25)'; // Matching red for chip
      default:
        return 'rgba(173, 20, 87, 0.2)'; // Darker pink for pink cards
    }
  };
  
  // Get border color based on status
  const getBorderColor = () => {
    switch (status) {
      case 'arrived':
      case 'checked-in':
        return 'rgba(245, 127, 23, 0.5)'; // Darker yellow/amber
      case 'completed':
        return 'rgba(46, 125, 50, 0.5)'; // Darker green
      case 'noShow':
      case 'no-show':
        return 'rgba(198, 40, 40, 0.5)'; // Darker red
      default:
        return 'rgba(173, 20, 87, 0.5)'; // Darker pink
    }
  };
  
  // Handle opening the menu
  const handleOpenMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Opening menu for appointment:', appointment._id);
    setMenuAnchor(event.currentTarget);
  };
  
  // Handle closing the menu
  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      console.log(`Attempting to update appointment ${appointment._id} status from ${status} to ${newStatus}`);
      setUpdating(true);
      
      // Update appointment status - use the UI-friendly status values directly
      const response = await api.put(`/appointments/${appointment._id}/status`, {
        status: newStatus
      });
      
      console.log('Status update response:', response.data);
      
      // Update local state
      setStatus(newStatus);
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Appointment marked as ${newStatus}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update appointment status',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
      setMenuAnchor(null);
    }
  };
  
  // Add a function to handle delete
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close the menu
    setMenuAnchor(null);
    
    // Call the onDelete callback
    if (onDelete) {
      onDelete(appointment._id, () => {
        // Refresh the dashboard after successful deletion
        if (refreshDashboard) refreshDashboard();
      });
    }
  };
  
  // Determine if this appointment is concurrent
  const isConcurrent = hasCollision;
  
  // Add this helper function to format the WhatsApp message
  const getWhatsAppMessage = () => {
    const greeting = getTimeBasedGreeting();
    const appointmentDate = format(new Date(appointment.dateTime), 'MMM d, yyyy h:mm a');
    
    return encodeURIComponent(
      `Hi ${appointment.client.firstName},\n\n` +
      `𝗧𝗵𝗶𝘀 𝗶𝘀 𝗮 𝗰𝗼𝗻𝗳𝗶𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗼𝗳 𝘆𝗼𝘂𝗿 𝘂𝗽𝗰𝗼𝗺𝗶𝗻𝗴 𝗮𝗽𝗽𝗼𝗶𝗻𝘁𝗺𝗲𝗻𝘁 𝗮𝘁 𝗦𝗲𝗿𝗮𝗻𝗴𝗼𝗼𝗻 𝗯𝗿𝗮𝗻𝗰𝗵.\n\n` +
      `Date: ${appointmentDate}\n` +
      `Service: ${appointment.service.name}\n\n` +
      `We look forward to seeing you! If you need to reschedule or have any questions, feel free to reply to this message.\n\n` +
      `See you soon!\n` +
      `BEAUTY 100 Serangoon.`
    );
  };

  // Add this helper function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 18) return 'good afternoon';
    return 'good evening';
  };

  // Add this function to handle WhatsApp click
  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    handleCloseMenu();
    
    // Use the phone number directly as it now includes the country code
    const phoneNumber = appointment.client.phone.replace(/\D/g, '');
    
    // Generate the WhatsApp URL
    const message = getWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Modify the handleConfirmationToggle function
  const handleConfirmationToggle = async (e) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault(); // Prevent context menu
    
    try {
      const newConfirmation = confirmation === 'sent' ? 'unsent' : 'sent';
      setConfirmation(newConfirmation); // Update UI immediately
      
      // Update appointment confirmation status
      const response = await api.patch(`/appointments/${appointment._id}`, {
        confirmation: newConfirmation
      });
      
      if (response.data) {
        // Show success message
        setSnackbar({
          open: true,
          message: `WhatsApp reminder marked as ${newConfirmation}`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating confirmation status:', error);
      // Revert UI state on error
      setConfirmation(confirmation);
      setSnackbar({
        open: true,
        message: 'Failed to update reminder status',
        severity: 'error'
      });
    }
  };
  
  return (
    <>
      <Paper
        elevation={3}
        onClick={onClick}
        onContextMenu={handleOpenMenu}
        sx={{
          position: 'absolute',
          overflow: 'hidden',
          borderRadius: '4px',
          backgroundColor: getBackgroundColor(),
          display: 'flex',
          flexDirection: isShortAppointment ? 'row' : 'column',
          justifyContent: 'space-between',
          zIndex: 10,
          cursor: 'pointer',
          borderLeft: '5px solid', // Thicker border
          borderLeftColor: getBorderColor(), // Keep the color matching the status
          maxWidth: '100%', // Ensure it doesn't overflow container
          ...style
        }}
        className={className}
      >
        {/* Modify the checkbox wrapper */}
        <Box
          onClick={e => e.stopPropagation()} 
          sx={{
            position: 'absolute',
            top: -2,              // Changed from -8 to -6
            right: -2,            // Changed from -8 to -6
            zIndex: 11,
            display: 'flex',      // Added to ensure proper centering
            alignItems: 'center', // Added for vertical alignment
            justifyContent: 'center' // Added for horizontal alignment
          }}
        >
          <Tooltip 
            title={`WhatsApp reminder ${confirmation === 'sent' ? 'sent' : 'not sent'}`}
            placement="top"
          >
            <Checkbox
              checked={confirmation === 'sent'}
              onChange={handleConfirmationToggle}
              icon={<CheckCircleOutlineIcon />}
              checkedIcon={<CheckCircleFilledIcon />}
              sx={{
                padding: '3px',         // Reduced from 4px to 3px
                backgroundColor: 'white',
                borderRadius: '50%',
                border: '1px solid #e0e0e0',
                width: '22px',          // Added explicit width
                height: '22px',         // Added explicit height
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'scale(1.1)',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '16px',
                  color: confirmation === 'sent' ? '#4caf50' : '#bdbdbd',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            />
          </Tooltip>
        </Box>
        
        {isShortAppointment ? (
          // Compact layout for very short appointments
          <Box sx={{ 
            p: 0.5, // Reduced padding
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            minHeight: '40px' // Ensure minimum height
          }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: isConcurrent ? '0.75rem' : '0.8rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.1,
                mb: 1.2 // Original margin
              }}
              className="appointment-client-name"
            >
              {client.firstName} {client.lastName}
            </Typography>
            
            {/* Service and time row */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              mt: 0.5,
              width: '100%'
            }}>
              {/* Left side - Service chip and notes */}
              <Box sx={{
                width: isConcurrent ? '20%' : '60%', // Keep narrow width for concurrent appointments
                overflow: 'hidden'
              }}>
                <Tooltip title={service.name}>
                  <Chip 
                    label={isConcurrent ? service.name.substring(0, 2) + '..' : service.name} // Keep showing only first 2 chars
                    size="small" 
                    sx={{
                      backgroundColor: getChipBackgroundColor(),
                      borderRadius: '4px',
                      height: 'auto',
                      width: '100%', // Take full width of parent
                      '& .MuiChip-label': {
                        padding: '1px 2px', // Revert to original padding
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        fontSize: isConcurrent ? '0.65rem' : '0.7rem' // Revert to original font size
                      }
                    }} 
                    className="appointment-service-chip"
                  />
                </Tooltip>
                
                {/* Notes display with increased font size */}
                {appointment.notes && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: isConcurrent ? '0.65rem' : '0.7rem', // Increased font size for notes
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      mt: 0.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    {isConcurrent ? appointment.notes.substring(0, 2) + '..' : appointment.notes}
                  </Typography>
                )}
              </Box>
              
              {/* Right side - Duration and time */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                width: isConcurrent ? '80%' : '40%', // Even more width for time column
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: isConcurrent ? '0.6rem' : '0.65rem',
                    fontWeight: 'medium',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.1,
                    mb: 0.3
                  }}
                >
                  {durationDisplay}
                </Typography>
                
                <Typography 
                  variant="caption"
                  sx={{ 
                    fontSize: isConcurrent ? '0.6rem' : '0.65rem',
                    whiteSpace: 'nowrap',
                    fontWeight: 'medium',
                    lineHeight: 1.1
                  }}
                >
                  {time}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          // Regular layout for normal appointments
          <Box sx={{ p: 0.75 }}>
            {/* Client name row */}
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: isConcurrent ? '0.75rem' : '0.8rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.1,
                mb: 1.2 // Original margin
              }}
            >
              {client.firstName} {client.lastName}
            </Typography>
            
            {/* Service and time row */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              mt: 0.5,
              width: '100%'
            }}>
              {/* Left side - Service chip and notes */}
              <Box sx={{
                width: isConcurrent ? '20%' : '60%', // Keep narrow width for concurrent appointments
                overflow: 'hidden'
              }}>
                <Tooltip title={service.name}>
                  <Chip 
                    label={isConcurrent ? service.name.substring(0, 2) + '..' : service.name} // Keep showing only first 2 chars
                    size="small" 
                    sx={{
                      backgroundColor: getChipBackgroundColor(),
                      borderRadius: '4px',
                      height: 'auto',
                      width: '100%', // Take full width of parent
                      '& .MuiChip-label': {
                        padding: '1px 2px', // Revert to original padding
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        fontSize: isConcurrent ? '0.65rem' : '0.7rem' // Revert to original font size
                      }
                    }} 
                    className="appointment-service-chip"
                  />
                </Tooltip>
                
                {/* Notes display with increased font size */}
                {appointment.notes && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: isConcurrent ? '0.65rem' : '0.7rem', // Increased font size for notes
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      mt: 0.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    {isConcurrent ? appointment.notes.substring(0, 2) + '..' : appointment.notes}
                  </Typography>
                )}
              </Box>
              
              {/* Right side - Duration and time */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                width: isConcurrent ? '80%' : '40%', // Even more width for time column
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: isConcurrent ? '0.6rem' : '0.65rem',
                    fontWeight: 'medium',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.1,
                    mb: 0.3
                  }}
                >
                  {durationDisplay}
                </Typography>
                
                <Typography 
                  variant="caption"
                  sx={{ 
                    fontSize: isConcurrent ? '0.6rem' : '0.65rem',
                    whiteSpace: 'nowrap',
                    fontWeight: 'medium',
                    lineHeight: 1.1
                  }}
                >
                  {time}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Add loading indicator during status updates */}
        {updating && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 15
            }}
          >
            <CircularProgress size={20} />
          </Box>
        )}
      </Paper>
      
      {/* Status Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
              }
            }
          }
        }}
      >
        {/* Add WhatsApp option */}
        <MenuItem 
          onClick={handleWhatsAppClick}
          disabled={!appointment.client.phone}
        >
          <ListItemIcon>
            <WhatsAppIcon style={{ color: '#25D366' }} />
          </ListItemIcon>
          <ListItemText>WhatsApp 发送</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            console.log('Clicked Arrived option');
            handleStatusChange('arrived');
          }}
          disabled={updating}
        >
          <ListItemIcon>
            <AccessTimeIcon style={{ color: '#F57F17' }} />
          </ListItemIcon>
          <ListItemText>Arrived 到达</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            console.log('Clicked Completed option');
            handleStatusChange('completed');
          }}
          disabled={updating}
        >
          <ListItemIcon>
            <CheckCircleIcon style={{ color: '#2E7D32' }} />
          </ListItemIcon>
          <ListItemText>Completed 完成</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            console.log('Clicked No Show option');
            handleStatusChange('noShow');
          }}
          disabled={updating}
        >
          <ListItemIcon>
            <CancelIcon style={{ color: '#C62828' }} />
          </ListItemIcon>
          <ListItemText>No Show 没来</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleDelete}
          disabled={updating}
        >
          <ListItemIcon>
            <DeleteIcon style={{ color: '#757575' }} />
          </ListItemIcon>
          <ListItemText>Delete Appointment</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppointmentCard; 