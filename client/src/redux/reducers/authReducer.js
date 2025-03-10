import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGOUT
} from '../constants/authConstants';

// Get user from localStorage
const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

// Get token from localStorage
const tokenFromStorage = localStorage.getItem('token') || null;

const initialState = {
  loading: false,
  token: tokenFromStorage,
  user: userFromStorage,
  error: null,
  isAuthenticated: !!tokenFromStorage
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null
      };
    case LOGIN_FAIL:
    case REGISTER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case LOGOUT:
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false
      };
    default:
      return state;
  }
}; 