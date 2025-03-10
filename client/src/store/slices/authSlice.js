import { createSlice } from '@reduxjs/toolkit';

// Add this helper function
const loadState = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) return { token: null, user: null };
    return { token, user };
  } catch (err) {
    console.error('Error loading auth state:', err);
    return { token: null, user: null };
  }
};

const initialState = {
  ...loadState(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err) {
        console.error('Error saving auth state:', err);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer; 