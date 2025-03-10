import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../../services/api';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const user = getCurrentUser();
  
  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If allowedRoles is empty or user's role is in allowedRoles, render the component
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return <Outlet />;
  }
  
  // If user's role is not allowed, redirect to appropriate page
  return user.role === 'admin' 
    ? <Navigate to="/dashboard" /> 
    : <Navigate to="/schedule" />;
};

export default PrivateRoute; 