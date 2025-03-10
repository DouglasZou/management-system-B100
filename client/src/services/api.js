import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', //api url
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials if your API uses cookies for authentication
  withCredentials: true,
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    // Check if the error is an authentication error
    if (error.response && error.response.status === 401) {
      // If the user wasn't found, redirect to login
      if (error.response.data.code === 'USER_NOT_FOUND') {
        console.log('User not found, redirecting to login');
        // Clear local storage
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Authentication functions
export const login = async (email, password) => {
  try {
    console.log('Login attempt for:', email);
    
    // Use the correct endpoint based on your server routes
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('User logged in successfully:', response.data.email);
    } else {
      console.error('Login response missing token:', response.data);
      throw new Error('Invalid login response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  // You could add token expiration check here
  return true;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}; 