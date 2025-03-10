import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const AppointmentTable = ({ appointments, onEdit, onDelete, onRefresh }) => {
  const formatDateTime = (dateTime) => {
    try {
      return format(new Date(dateTime), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>客户</TableCell>
                <TableCell>服务</TableCell>
                <TableCell>美容师</TableCell>
                <TableCell align="center">日期时间</TableCell>
                <TableCell align="center">价格</TableCell>
                <TableCell align="center">状态</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <TableRow key={appointment._id} hover>
                    <TableCell>
                      {appointment.client?.firstName} {appointment.client?.lastName}
                    </TableCell>
                    <TableCell>{appointment.service?.name}</TableCell>
                    <TableCell>
                      {appointment.beautician?.firstName} {appointment.beautician?.lastName}
                    </TableCell>
                    <TableCell align="center">{formatDateTime(appointment.dateTime)}</TableCell>
                    <TableCell align="center">${appointment.service?.price}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={appointment.status}
                        color={
                          appointment.status === 'completed' ? 'success' :
                          appointment.status === 'cancelled' ? 'error' :
                          'primary'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary" 
                            onClick={() => onEdit(appointment)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {onDelete && (
                          <Tooltip title="Delete">
                            <IconButton 
                              color="error" 
                              onClick={() => onDelete(appointment)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No appointments found. Click "Add Appointment" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentTable; 