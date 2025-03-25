import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField
} from '@mui/material';
import {
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import api from '../../services/api';
import AppointmentCard from './AppointmentCard';
import AppointmentDialog from './AppointmentDialog';
import AppointmentContextMenu from './AppointmentContextMenu';

const ScheduleView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [beauticians, setBeauticians] = useState([]);
  const [selectedBeautician, setSelectedBeautician] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showBeauticianWeek, setShowBeauticianWeek] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    open: false,
    position: null,
    appointmentId: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Time slots for the day view (9 AM to 9 PM)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 9);
  
  // Fetch appointments when date or selected beautician changes
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let params = {};
      
      if (showBeauticianWeek) {
        // For beautician week view, get appointments for the selected week and beautician
        const start = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const end = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        params.startDate = start;
        params.endDate = end;
        params.beautician = selectedBeautician._id;
      } else {
        // For day view, get appointments for the selected date
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        params.date = dateStr;
      }
      
      console.log('Fetching appointments with params:', params);
      const response = await api.get('/appointments', { params });
      console.log('Fetched appointments:', response.data);
      
      // Filter out invalid appointments
      const validAppointments = response.data.filter(appointment => 
        appointment && appointment.client && appointment.service && appointment.beautician
      );
      
      setAppointments(validAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedBeautician, showBeauticianWeek]);
  
  // Fetch beauticians on component mount
  useEffect(() => {
    const fetchBeauticians = async () => {
      try {
        setLoading(true);
        // Only fetch active beauticians
        const response = await api.get('/users', {
          params: { role: 'beautician', includeInactive: 'false' }
        });
        setBeauticians(response.data);
        
        // Set the first beautician as selected if none is selected
        if (response.data.length > 0 && !selectedBeautician) {
          setSelectedBeautician(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching beauticians:', error);
        setError('Failed to load beauticians');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBeauticians();
  }, []);
  
  // Fetch appointments when dependencies change
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  
  // Handle date navigation
  const handleDateChange = (days) => {
    const newDate = addDays(selectedDate, days);
    setSelectedDate(newDate);
  };
  
  // Handle date picker change
  const handleDatePickerChange = (newDate) => {
    setSelectedDate(newDate);
    setOpenDatePicker(false);
  };
  
  // Open dialog to add a new appointment
  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setOpenDialog(true);
  };
  
  // Open dialog to edit an existing appointment
  const handleEditAppointment = async (appointment) => {
    try {
      // Fetch the latest appointment data from the server
      const response = await api.get(`/appointments/${appointment._id}`);
      const latestAppointment = response.data;
      
      console.log('Latest appointment data:', latestAppointment);
      
      // Set the selected appointment with the latest data
      setSelectedAppointment(latestAppointment);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching latest appointment data:', error);
      // Fall back to using the provided appointment data
      setSelectedAppointment(appointment);
      setOpenDialog(true);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = (refresh = false) => {
    setOpenDialog(false);
    setSelectedAppointment(null);
    setSelectedTimeSlot(null);
    
    if (refresh) {
      fetchAppointments();
    }
  };
  
  // Handle time slot click to add a new appointment
  const handleTimeSlotClick = (hour, minutes, beauticianId, day = null) => {
    // Create a new date object based on the selected date
    const dateTime = new Date(selectedDate);
    
    // If a specific day is provided (for week view), set that day
    if (day) {
      dateTime.setDate(day.getDate());
      dateTime.setMonth(day.getMonth());
      dateTime.setFullYear(day.getFullYear());
    }
    
    // Set the hour and minutes
    dateTime.setHours(hour);
    dateTime.setMinutes(minutes);
    dateTime.setSeconds(0);
    dateTime.setMilliseconds(0);
    
    // Find the beautician object
    const selectedBeauticianObj = beauticians.find(b => b._id === beauticianId);
    
    // Set the selected time slot with the correct beautician
    setSelectedTimeSlot({
      dateTime,
      beautician: selectedBeauticianObj
    });
    
    // Open the appointment dialog with the beautician pre-selected
    setSelectedAppointment(null);
    setOpenDialog(true);
  };
  
  // Handle beautician click to view their weekly schedule
  const handleBeauticianClick = (beautician) => {
    setSelectedBeautician(beautician);
    setShowBeauticianWeek(true);
  };
  
  // Handle context menu
  const handleContextMenu = (event, appointmentId, statusChangeHandler) => {
    event.preventDefault();
    console.log('Context menu opened for appointment:', appointmentId);
    setContextMenu({
      open: true,
      position: { x: event.clientX, y: event.clientY },
      appointmentId,
      statusChangeHandler
    });
  };
  
  const handleCloseContextMenu = () => {
    setContextMenu({
      open: false,
      position: null,
      appointmentId: null,
      statusChangeHandler: null
    });
  };
  
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      fetchAppointments(); // Refresh the appointments list
      setSnackbar({
        open: true,
        message: `Appointment status updated to ${newStatus}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update appointment status',
        severity: 'error'
      });
    }
  };
  
  // Add a function to handle appointment deletion
  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.delete(`/appointments/${appointmentId}`);
        fetchAppointments(); // Refresh the appointments list
        setSnackbar({
          open: true,
          message: 'Appointment deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete appointment',
          severity: 'error'
        });
      }
    }
  };
  
  // 1. Add current time indicator for better user orientation
  const renderCurrentTimeIndicator = (isWeekView = false) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Only show if current time is within the schedule view
    if (currentHour < 9 || currentHour > 21) return null;
    
    // Calculate position
    const hourHeight = 60; // Height of one hour in pixels
    const minutePercentage = currentMinute / 60;
    const topPosition = (currentHour - 9) * hourHeight + (minutePercentage * hourHeight);
    
    return (
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${topPosition}px`,
          height: '2px',
          backgroundColor: '#f44336',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      />
    );
  };
  
  // Add this helper function to detect overlapping appointments
  const getOverlappingAppointments = (appointment, allAppointments, beauticianId) => {
    const appointmentStart = new Date(appointment.dateTime);
    const appointmentEnd = new Date(new Date(appointment.dateTime).getTime() + (appointment.service.duration * 60000));
    
    return allAppointments.filter(app => {
      // Skip the current appointment
      if (app._id === appointment._id) return false;
      
      // Only check appointments for the same beautician
      if (app.beautician._id !== beauticianId) return false;
      
      const appStart = new Date(app.dateTime);
      const appEnd = new Date(new Date(app.dateTime).getTime() + (app.service.duration * 60000));
      
      // Check if appointments overlap
      return (
        (appStart < appointmentEnd && appStart >= appointmentStart) || 
        (appEnd > appointmentStart && appEnd <= appointmentEnd) ||
        (appStart <= appointmentStart && appEnd >= appointmentEnd)
      );
    });
  };
  
  // Fix the renderAppointment function to handle up to 3 concurrent appointments evenly
  const renderAppointment = (appointment, beauticianIndex) => {
    // Get overlapping appointments
    const overlappingApps = getOverlappingAppointments(
      appointment, 
      appointments, 
      appointment.beautician._id
    );
    
    // Sort overlapping appointments by start time instead of ID
    const sortedApps = [appointment, ...overlappingApps].sort((a, b) => {
      const aTime = new Date(a.dateTime);
      const bTime = new Date(b.dateTime);
      return aTime - bTime; // Sort by time ascending (earlier times first)
    });
    
    // Find the position of the current appointment in the sorted list
    const positionIndex = sortedApps.findIndex(app => app._id === appointment._id);
    
    // Determine the number of concurrent appointments (max 3)
    const concurrentCount = Math.min(sortedApps.length, 3);
    
    // Calculate width and position based on number of concurrent appointments
    let width, left;
    
    if (concurrentCount === 1) {
      // Single appointment - use full width
      width = '96%';
      left = '2%';
    } else if (concurrentCount === 2) {
      // Two concurrent appointments - split into two columns
      width = '48%';
      left = positionIndex === 0 ? '1%' : '51%';
    } else {
      // Three concurrent appointments - split into three columns
      width = '32%';
      if (positionIndex === 0) {
        left = '1%';
      } else if (positionIndex === 1) {
        left = '34%';
      } else {
        left = '67%';
      }
    }
    
    // Calculate position and height
    const startTime = new Date(appointment.dateTime);
    const hour = startTime.getHours();
    const minutes = startTime.getMinutes();
    const duration = appointment.service.duration || 60;
    
    // Calculate the position within the cell
    const minutePercentage = minutes / 60;
    const positionInCell = minutePercentage * 60; // 60px is the height of each hour cell
    
    return (
      <AppointmentCard
        key={appointment._id}
        appointment={appointment}
        onClick={() => handleEditAppointment(appointment)}
        className={concurrentCount > 1 ? 'concurrent-appointment' : ''}
        hasCollision={concurrentCount > 1}
        style={{
          position: 'absolute',
          top: `${positionInCell}px`,
          left: left,
          width: width,
          height: `${(duration / 60) * 60}px`, // Convert duration to height
          zIndex: 10
        }}
        onDelete={handleDeleteAppointment}
        onContextMenu={(e) => handleContextMenu(e, appointment._id, (newStatus) => handleStatusChange(appointment._id, newStatus))}
        isWeekView={showBeauticianWeek}
      />
    );
  };
  
  // Render day view
  const renderDayView = () => {
    return (
      <TableContainer 
        component={Paper} 
        sx={{ 
          overflowX: 'auto', // Enable horizontal scrolling on small screens
          minWidth: { xs: '100%', md: 'auto' } // Full width on mobile, auto on larger screens
        }}
      >
        <Table 
          sx={{ 
            tableLayout: 'fixed',
            minWidth: '650px', // Ensure minimum width for content
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  width: '6%', // Same width as individual view
                  bgcolor: '#f5f5f5',
                  fontWeight: 'bold',
                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                  padding: '8px 4px',
                  height: '60px !important', // Force consistent height with !important
                  fontSize: '0.85rem',
                  textAlign: 'center' // Center the text
                }}
              >
                Time
              </TableCell>
              {beauticians.map((beautician) => (
                <TableCell 
                  key={beautician._id} 
                  align="center"
                  onClick={() => handleBeauticianClick(beautician)}
                  sx={{ 
                    bgcolor: '#904e4e', // beautician bar color
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#ce7c7c' }, // beautician hover color
                    padding: '8px 4px',
                    height: '60px',
                    fontSize: '0.9rem'
                  }}
                >
                  {beautician.firstName} {beautician.lastName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((hour) => (
              <TableRow key={hour}>
                <TableCell 
                  align="center"
                  sx={{ 
                    bgcolor: '#f5f5f5',
                    fontWeight: 'bold',
                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                    padding: '2px',
                    fontSize: '0.8rem',
                    height: '60px !important', // Force consistent height with !important
                    width: '6%' // Same width as individual view
                  }}
                >
                  {hour < 12 ? 
                    `${hour === 0 ? 12 : hour}:00 AM` : 
                    `${hour === 12 ? 12 : hour - 12}:00 PM`}
                </TableCell>
                {beauticians.map((beautician, index) => {
                  // Get appointments for this beautician
                  const beauticianAppointments = appointments.filter(
                    app => app.beautician._id === beautician._id
                  );
                  
                  return (
                    <TableCell 
                      key={beautician._id}
                      sx={{ 
                        position: 'relative',
                        height: '60px !important',
                        padding: 0,
                        paddingLeft: '2px',
                        paddingRight: '2px',
                        borderRight: 'none'
                      }}
                    >
                      {/* Click handlers for 15-minute intervals */}
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '25%',
                          cursor: 'pointer',
                          zIndex: 2
                        }}
                        onClick={() => handleTimeSlotClick(hour, 0, beautician._id)}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '25%',
                          left: 0,
                          right: 0,
                          height: '25%',
                          cursor: 'pointer',
                          zIndex: 2
                        }}
                        onClick={() => handleTimeSlotClick(hour, 15, beautician._id)}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          height: '25%',
                          cursor: 'pointer',
                          zIndex: 2
                        }}
                        onClick={() => handleTimeSlotClick(hour, 30, beautician._id)}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '75%',
                          left: 0,
                          right: 0,
                          height: '25%',
                          cursor: 'pointer',
                          zIndex: 2
                        }}
                        onClick={() => handleTimeSlotClick(hour, 45, beautician._id)}
                      />
                      
                      {/* Visual grid lines */}
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '25%',
                          left: 0,
                          right: 0,
                          borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '75%',
                          left: 0,
                          right: 0,
                          borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}
                      />
                      
                      {/* Appointments */}
                      {beauticianAppointments
                        .filter(app => {
                          const appTime = new Date(app.dateTime);
                          const appHour = appTime.getHours();
                          return appHour === hour;
                        })
                        .map(appointment => renderAppointment(appointment, index))}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render beautician week view
  const renderBeauticianWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <TableContainer 
        component={Paper} 
        sx={{ 
          overflowX: 'auto', // Enable horizontal scrolling on small screens
          minWidth: { xs: '100%', md: 'auto' } // Full width on mobile, auto on larger screens
        }}
      >
        <Table 
          sx={{ 
            tableLayout: 'fixed',
            minWidth: '750px', // Ensure minimum width for content
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell 
                width="6%" 
                align="center"
                sx={{ 
                  bgcolor: '#f5f5f5',
                  fontWeight: 'bold',
                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                  height: '60px',
                  padding: '8px 2px'
                }}
              >
                Time
              </TableCell>
              {days.map((day, index) => (
                <TableCell 
                  key={day.toISOString()}
                  align="center"
                  sx={{ 
                    fontWeight: 'bold',
                    padding: '8px 4px',
                    borderBottom: '2px solid #e0e0e0',
                    width: `${100 / 8}%` // Ensure equal width for all columns
                  }}
                >
                  <Box>
                    {format(day, 'EEE')} {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day.getDay()]}
                    <br />
                    {format(day, 'MMM d')}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map((hour) => (
              <TableRow key={hour}>
                <TableCell 
                  align="center"
                  sx={{ 
                    bgcolor: '#f5f5f5',
                    fontWeight: 'bold',
                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                    padding: '2px',
                    fontSize: '0.8rem',
                    height: '60px !important',
                    width: '6%'
                  }}
                >
                  {hour < 12 ? 
                    `${hour === 0 ? 12 : hour}:00 AM` : 
                    `${hour === 12 ? 12 : hour - 12}:00 PM`}
                </TableCell>
                {days.map((day, index) => {
                  // Find appointments for this day at this hour
                  const dayAppointments = appointments.filter(appointment => {
                    if (!appointment || !appointment.dateTime) {
                      return false;
                    }
                    
                    const appointmentDate = new Date(appointment.dateTime);
                    return (
                      isSameDay(appointmentDate, day) &&
                      appointmentDate.getHours() === hour
                    );
                  });
                  
                  // Instead, just use a simpler check like we did in the day view:
                  const hasCollision = dayAppointments.length > 1; // Simplified check
                  
                  return (
                    <TableCell 
                      key={day.toISOString()}
                      sx={{ 
                        position: 'relative',
                        height: '60px !important',
                        padding: 0,
                        paddingLeft: '2px',
                        paddingRight: '2px',
                        borderRight: 'none'
                      }}
                    >
                      {/* Quarter-hour grid lines with click handlers */}
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '25%',
                          cursor: 'pointer',
                          zIndex: 2
                        }}
                        onClick={() => handleTimeSlotClick(hour, 0, selectedBeautician._id, day)}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '25%',
                          left: 0,
                          right: 0,
                          height: '25%',
                          cursor: 'pointer',
                          zIndex: 2
                        }}
                        onClick={() => handleTimeSlotClick(hour, 15, selectedBeautician._id, day)}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          height: '25%',
                          cursor: 'pointer',
                          zIndex: 2
                        }}
                        onClick={() => handleTimeSlotClick(hour, 30, selectedBeautician._id, day)}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '75%',
                          left: 0,
                          right: 0,
                          height: '25%',
                          cursor: 'pointer',
                          zIndex: 2
                        }}
                        onClick={() => handleTimeSlotClick(hour, 45, selectedBeautician._id, day)}
                      />
                      
                      {/* Visual grid lines */}
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '25%',
                          left: 0,
                          right: 0,
                          borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: '75%',
                          left: 0,
                          right: 0,
                          borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}
                      />
                      
                      {/* Appointments */}
                      <Box className="appointment-container">
                        {dayAppointments.map((appointment, index) => {
                          return renderAppointment(appointment, index);
                        })}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Header with title and action buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 1.5
      }}>
        {showBeauticianWeek ? (
          // Custom header for beautician week view
          <Typography variant="h5" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => setShowBeauticianWeek(false)} 
              size="small" 
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            {selectedBeautician?.firstName}'s Schedule 个人日程
          </Typography>
        ) : (
          // Regular schedule header
          <Typography variant="h5" sx={{ fontWeight: 'medium' }}>Branch Schedule 店日程</Typography>
        )}
        
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddAppointment}
            size="small"
            sx={{ mr: 1 }}
          >
            New Appt 添加预约
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchAppointments}
            size="small"
          >
            Refresh 刷新日程
          </Button>
        </Box>
      </Box>
      
      {/* Main content */}
      <Paper sx={{ mb: 2 }}>
        {/* Date navigation - different for day view and beautician week view */}
        <Box sx={{ 
          py: 0.75,
          px: 2,
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          borderBottom: '1px solid #e0e0e0' 
        }}>
          {/* Left side - calendar picker for day view only */}
          {!showBeauticianWeek ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={selectedDate}
                onChange={handleDatePickerChange}
                slotProps={{
                  textField: {
                    variant: "outlined",
                    size: "small",
                    sx: { 
                      width: '150px',
                      '& .MuiOutlinedInput-root': {
                        height: '36px'
                      }
                    }
                  }
                }}
              />
            </LocalizationProvider>
          ) : (
            // Empty space for beautician view
            <Box sx={{ width: '150px' }} />
          )}
          
          {/* Center - navigation controls */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => handleDateChange(showBeauticianWeek ? -7 : -1)} 
              size="small"
            >
              <PrevIcon fontSize="small" />
            </IconButton>
            
            <Typography sx={{ 
              mx: 1.5, 
              textAlign: 'center', 
              fontSize: '0.9rem',
              fontWeight: 'medium',
              minWidth: '150px'
            }}>
              {showBeauticianWeek 
                ? `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
                : format(selectedDate, 'MMMM d, yyyy')
              }
            </Typography>
            
            <IconButton 
              onClick={() => handleDateChange(showBeauticianWeek ? 7 : 1)} 
              size="small"
            >
              <NextIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Right side - empty space for balance */}
          <Box sx={{ width: '120px' }} />
        </Box>
        
        {/* Schedule content */}
        <Box sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 1.5 }}>{error}</Alert>
          ) : (
            showBeauticianWeek ? renderBeauticianWeekView() : renderDayView()
          )}
        </Box>
      </Paper>
      
      {/* Appointment dialog */}
      <AppointmentDialog
        open={openDialog}
        onClose={handleCloseDialog}
        appointment={selectedAppointment}
        beauticians={beauticians}
        selectedDate={selectedDate}
        selectedBeautician={selectedBeautician}
        selectedTimeSlot={selectedTimeSlot}
      />
      
      <AppointmentContextMenu
        open={contextMenu.open}
        anchorPosition={contextMenu.position}
        onClose={handleCloseContextMenu}
        onStatusChange={handleStatusChange}
      />
    </Box>
  );
};

export default ScheduleView; 