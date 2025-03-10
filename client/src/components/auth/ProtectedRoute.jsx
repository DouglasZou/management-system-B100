import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute:', { isAuthenticated, loading, user, path: location.pathname });

  // If authentication is still loading, show a loading spinner
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    // Save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('Authenticated, rendering children');
  // If authenticated, render the children
  return children;
};

export default ProtectedRoute; 