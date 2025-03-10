import React from 'react';
import { Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { 
  CheckCircle as CompletedIcon,
  Cancel as NoShowIcon,
  AccessTime as ArrivedIcon
} from '@mui/icons-material';

const AppointmentContextMenu = ({ open, anchorPosition, onClose, onStatusChange }) => {
  const handleStatusChange = (status) => {
    console.log('Setting status to:', status);
    onStatusChange(status);
    onClose();
  };

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ? { top: anchorPosition.y, left: anchorPosition.x } : undefined}
      sx={{ zIndex: 9999 }}
    >
      <MenuItem onClick={() => handleStatusChange('arrived')}>
        <ListItemIcon>
          <ArrivedIcon sx={{ color: '#f9a825' }} />
        </ListItemIcon>
        <Typography>Arrived</Typography>
      </MenuItem>
      <MenuItem onClick={() => handleStatusChange('completed')}>
        <ListItemIcon>
          <CompletedIcon sx={{ color: '#4caf50' }} />
        </ListItemIcon>
        <Typography>Completed</Typography>
      </MenuItem>
      <MenuItem onClick={() => handleStatusChange('noShow')}>
        <ListItemIcon>
          <NoShowIcon sx={{ color: '#f44336' }} />
        </ListItemIcon>
        <Typography>No Show</Typography>
      </MenuItem>
    </Menu>
  );
};

export default AppointmentContextMenu; 