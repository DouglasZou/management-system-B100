import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import ErrorBoundary from './components/common/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/routing/PrivateRoute';
import SimpleDashboard from './components/dashboard/SimpleDashboard';
import ScheduleView from './components/schedule/ScheduleView';
import ServiceList from './components/services/ServiceList';
import ClientList from './components/clients/ClientList';
import Settings from './components/settings/Settings';
import StaffList from './components/staff/StaffList';
import { DashboardRefreshContext } from './components/dashboard/SimpleDashboard';
import { useState, useCallback } from 'react';

// Create a theme top bar color
const theme = createTheme({
  palette: {
    primary: {
      main: '#7e6543',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);
  
  const refreshDashboard = useCallback(() => {
    setDashboardRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DashboardRefreshContext.Provider value={refreshDashboard}>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Private routes - accessible by all authenticated users */}
              <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                  {/* Routes for all users */}
                  <Route path="/schedule" element={<ScheduleView />} />
                  <Route path="/dashboard" element={<SimpleDashboard />} />
                  <Route path="/clients" element={<ClientList />} />
                  
                  {/* Admin-only routes */}
                  <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/services" element={<ServiceList />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/staff" element={<StaffList />} />
                  </Route>
                  
                  {/* Default redirect based on role */}
                  <Route path="/" element={<RoleBasedRedirect />} />
                </Route>
              </Route>
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </DashboardRefreshContext.Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Helper component to redirect based on user role
const RoleBasedRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }
  
  return user.role === 'admin' 
    ? <Navigate to="/dashboard" replace /> 
    : <Navigate to="/schedule" replace />;
};

export default App;
