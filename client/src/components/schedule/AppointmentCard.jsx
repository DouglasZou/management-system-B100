import React, { useState, useEffect, useRef } from 'react';
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
  Tooltip,
  IconButton
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
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import BlockoutDialog from './BlockoutDialog';

const AppointmentCard = ({ appointment, onClick, style, className, onDelete, hasCollision = false, isWeekView = false, beauticians }) => {
  // Add this debug log
  console.log('Raw appointment data:', {
    id: appointment._id,
    client: appointment.client,
    service: appointment.service.name
  });

  const [status, setStatus] = useState(appointment.status || 'scheduled');
  const [confirmation, setConfirmation] = useState(appointment.confirmation || 'unsent');
  const [updating, setUpdating] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const refreshDashboard = useDashboardRefresh();
  
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const longPressTimer = useRef(null);
  const pressPosition = useRef({ x: 0, y: 0 });
  
  const [touchTimer, setTouchTimer] = useState(null);
  const touchDuration = 500; // 500ms for long press
  
  // Add null checks to prevent errors
  if (!appointment || !appointment.client || !appointment.service || !appointment.dateTime || !appointment.beautician) {
    console.error('Invalid appointment data:', appointment);
    return null; // Don't render anything if data is incomplete
  }
  
  const { client, service, dateTime, beautician } = appointment;
  
  // Add this debug log too
  console.log('Extracted client data:', {
    name: `${client.firstName} ${client.lastName}`,
    custID: client.custID,
    hasCustomerId: Boolean(client.custID)
  });
  
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
    if (appointment.isBlockout) {
      return '#E0E0E0'; // Standard grey for all blockouts
    }
    
    // Regular appointment colors
    switch (status) {
      case 'arrived':
      case 'checked-in':
        return '#FFF176'; // Yellow
      case 'completed':
        return '#A5D6A7'; // Green
      case 'noShow':
      case 'no-show':
        return '#E53935'; // Red
      default:
        return '#F8BBD0'; // Pink for scheduled
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
  const handleContextMenu = (event) => {
    if (appointment.isBlockout) {
      // Don't show context menu for blockouts
      return;
    }
    
    if (!isMobile) {  // Only handle right-click on desktop
      event.preventDefault();
      setMenuAnchorEl(event.currentTarget);
    }
  };

  // Add touch handlers for mobile
  const handleTouchStart = (event) => {
    event.preventDefault(); // Prevent default touch behavior
    
    const timer = setTimeout(() => {
      setMenuAnchorEl(event.target);
    }, touchDuration);
    
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
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
      setMenuAnchorEl(null);
    }
  };
  
  // Add a function to handle delete
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close the menu
    setMenuAnchorEl(null);
    
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
    
    handleContextMenu(e);
    
    // Use the phone number directly as it now includes the country code
    const phoneNumber = appointment.client.phone.replace(/\D/g, '');
    
    // Generate the WhatsApp URL
    const message = getWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Add this function to handle confirmation toggle
  const handleConfirmationToggle = async (event) => {
    event.stopPropagation();
    try {
      setUpdating(true);
      const newConfirmation = confirmation === 'sent' ? 'unsent' : 'sent';
      
      // Update UI immediately for better user experience
      setConfirmation(newConfirmation);
      
      await api.patch(`/appointments/${appointment._id}/confirmation`, {
        confirmation: newConfirmation
      });
      
      setSnackbar({
        open: true,
        message: `WhatsApp reminder marked as ${newConfirmation}`,
        severity: 'success'
      });
      
      if (refreshDashboard) refreshDashboard();
      
    } catch (error) {
      // Revert the UI state if the API call fails
      setConfirmation(confirmation);
      console.error('Error updating confirmation status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update reminder status',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // Add a delete handler for blockouts
  const handleDeleteBlockout = async (event) => {
    event.stopPropagation();
    
    if (!appointment.isBlockout) return;
    
    try {
      setUpdating(true);
      await api.delete(`/staffBlockouts/${appointment._id}`);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Blockout deleted successfully',
        severity: 'success'
      });
      
      // Refresh the schedule
      window.dispatchEvent(new Event('appointmentUpdated'));
      
      // If onDelete callback is provided, call it
      if (onDelete) {
        onDelete(appointment._id);
      }
    } catch (error) {
      console.error('Error deleting blockout:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete blockout',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // First, let's add a state for blockout dialog
  const [blockoutDialogOpen, setBlockoutDialogOpen] = useState(false);

  // Add a function to handle blockout click
  const handleBlockoutClick = (event) => {
    event.stopPropagation();
    if (appointment.isBlockout) {
      console.log('Clicked blockout:', appointment);
      
      // Extract the correct ID from the appointment
      const blockoutId = appointment._id;
      console.log('Blockout ID:', blockoutId);
      
      // Open the dialog
      setBlockoutDialogOpen(true);
    } else if (onClick) {
      onClick();
    }
  };

  // Update the handleBlockoutDialogClose function
  const handleBlockoutDialogClose = (refresh = false) => {
    setBlockoutDialogOpen(false);
    
    if (refresh) {
      // Trigger a refresh of the schedule
      console.log('Refreshing schedule after blockout update/delete');
      
      // Option 1: Dispatch a custom event that ScheduleView listens for
      window.dispatchEvent(new CustomEvent('appointmentUpdated', {
        detail: { type: 'blockout', id: appointment._id }
      }));
      
      // Option 2: If onDelete callback is provided, call it to remove this blockout from the parent component
      if (onDelete && appointment.isBlockout) {
        onDelete(appointment._id);
      }
    }
  };

  return (
    <>
      <Paper
        elevation={3}
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
        onClick={appointment.isBlockout ? handleBlockoutClick : onClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
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
                padding: '3px',
                backgroundColor: 'white',
                borderRadius: '50%',
                border: '1px solid #e0e0e0',
                width: '22px',
                height: '22px',
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
            {/* Client name */}
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: isConcurrent ? '0.75rem' : '0.8rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.1,
                mb: 0.5 // Reduced margin to bring service chip closer
              }}
              className="appointment-client-name"
            >
              {client.custID ? `${client.custID} - ` : ''}{client.firstName} {client.lastName}
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
                width: isConcurrent ? '20%' : '60%',
                overflow: 'hidden'
              }}>
                <Tooltip title={service.name}>
                  <Chip 
                    label={isConcurrent ? service.name.substring(0, 2) + '..' : service.name}
                    size="small" 
                    sx={{
                      backgroundColor: getChipBackgroundColor(),
                      borderRadius: '4px',
                      height: 'auto',
                      width: '100%',
                      '& .MuiChip-label': {
                        padding: '1px 2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        fontSize: isConcurrent ? '0.65rem' : '0.7rem'
                      }
                    }} 
                    className="appointment-service-chip"
                  />
                </Tooltip>
                
                {/* Notes with word-break to prevent overflow */}
                {appointment.notes && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: isConcurrent ? '0.65rem' : '0.7rem',
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      mt: 0.5,
                      wordBreak: 'break-word', // Add word break
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
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
              mb: 0.5
            }}>
              {/* Client name and ID */}
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 'bold',
                fontSize: '0.8rem',
                lineHeight: 1.1,
                mb: 0.35, // margin to the service chip
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {appointment.client.custID ? `${appointment.client.custID} - ` : ''}{appointment.client.firstName} {appointment.client.lastName}
              </Typography>
              
              {/* Service chip */}
              <Chip 
                label={isMobile ? `${service.name.substring(0, 5)}..` : service.name} 
                size="small"
                sx={{ 
                  alignSelf: 'flex-start',
                  mb: 0.15, // margin to the notes
                  height: '19px', // Reduce height from default
                  '& .MuiChip-label': {
                    fontSize: '0.7rem',
                    padding: '0px 7px', // Reduce vertical padding from 1px to 0px
                    lineHeight: 1.1 // Add tighter line height
                  }
                }} 
              />
              
              {/* Notes */}
              {appointment.notes && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.6rem',
                    lineHeight: 1.1,
                    wordBreak: 'break-word'
                  }}
                >
                  {isMobile ? 
                    (appointment.notes.length > 4 ? 
                      `${appointment.notes.substring(0, 8)}..` : 
                      appointment.notes) : 
                    appointment.notes}
                </Typography>
              )}
            </Box>
            
            {/* Time and duration - positioned on the right */}
            <Box sx={{ 
              position: 'absolute',
              right: 8,
              bottom: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.65rem',
                  fontWeight: 'medium',
                  lineHeight: 1.1
                }}
              >
                {durationDisplay}
              </Typography>
              
              <Typography 
                variant="caption"
                sx={{ 
                  fontSize: '0.65rem',
                  fontWeight: 'medium',
                  lineHeight: 1.1
                }}
              >
                {time}
              </Typography>
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
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
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
      
      {/* Add the BlockoutDialog component at the end of the component */}
      {appointment.isBlockout && (
        <BlockoutDialog
          open={blockoutDialogOpen}
          onClose={handleBlockoutDialogClose}
          selectedTimeSlot={{
            dateTime: new Date(appointment.dateTime),
            beautician: appointment.beautician
          }}
          beauticians={beauticians || []}
          existingBlockout={{
            _id: appointment._id,
            beautician: typeof appointment.beautician === 'object' ? 
              appointment.beautician._id : appointment.beautician,
            startDateTime: new Date(appointment.dateTime),
            endDateTime: new Date(appointment.endTime),
            reason: appointment.service?.name || 'OTHER',
            notes: appointment.notes || ''
          }}
        />
      )}
    </>
  );
};

export default AppointmentCard; 