import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  console.log('Auth State:', { token, user });
  console.log('Current Location:', location.pathname);

  if (!token || !user) {
    console.log('Redirecting to login - No auth');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 