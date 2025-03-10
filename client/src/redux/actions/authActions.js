import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { 
  LOGIN_SUCCESS, 
  LOGIN_FAIL, 
  LOGOUT, 
  REGISTER_SUCCESS, 
  REGISTER_FAIL 
} from '../constants/authConstants';

// Login user
export const login = (credentials) => async (dispatch) => {
  try {
    console.log('Auth action: login attempt with:', credentials.email);
    const response = await api.post('/auth/login', credentials);
    console.log('Auth action: login response:', response.data);
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data._id,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      role: response.data.role
    }));
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        token: response.data.token,
        user: {
          id: response.data._id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          role: response.data.role
        }
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Auth action: login error:', error);
    dispatch({
      type: LOGIN_FAIL,
      payload: error.response?.data?.message || 'Login failed'
    });
    throw error;
  }
};

// Logout user
export const logout = () => (dispatch) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  dispatch({ type: LOGOUT });
};

// Register user
export const register = (userData) => async (dispatch) => {
  try {
    console.log('Auth action: register attempt with:', userData.email);
    const response = await api.post('/auth/register', userData);
    console.log('Auth action: register response:', response.data);
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data._id,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      role: response.data.role
    }));
    
    dispatch({
      type: REGISTER_SUCCESS,
      payload: {
        token: response.data.token,
        user: {
          id: response.data._id,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          role: response.data.role
        }
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Auth action: register error:', error);
    dispatch({
      type: REGISTER_FAIL,
      payload: error.response?.data?.message || 'Registration failed'
    });
    throw error;
  }
}; 