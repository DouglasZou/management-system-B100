import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'exists' : 'not found');
        
        if (!token) {
          console.log('No token found, user is not authenticated');
          setLoading(false);
          return;
        }
        
        // Set token in axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Set Authorization header with token');
        
        // Verify token with backend
        console.log('Verifying token with backend...');
        const response = await api.get('/auth/me');
        console.log('Auth check response:', response.data);
        
        setUser(response.data);
        setIsAuthenticated(true);
        console.log('User authenticated:', response.data);
      } catch (err) {
        console.error('Auth check error:', err);
        // Clear invalid token
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = '';
        console.log('Cleared invalid token');
      } finally {
        setLoading(false);
        console.log('Auth check complete, loading set to false');
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage:', token);
      
      // Set token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove token from axios headers
    api.defaults.headers.common['Authorization'] = '';
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/auth/profile', userData);
      
      setUser(response.data);
      
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 