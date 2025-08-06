import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  cart: [],
  tracks: [],
  currentTrack: null,
  isPlaying: false,
  isPreviewMode: true
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: []
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload
      };
    case 'ADD_TO_CART':
      return {
        ...state,
        cart: [...state.cart, action.payload]
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.track._id !== action.payload)
      };
    case 'SET_TRACKS':
      return {
        ...state,
        tracks: action.payload
      };
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload
      };
    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload
      };
    case 'SET_PREVIEW_MODE':
      return {
        ...state,
        isPreviewMode: action.payload
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    axios.defaults.withCredentials = true;

    // Check if user is authenticated on app load
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/me');
      dispatch({ type: 'SET_USER', payload: response.data });
      loadCart();
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    // First check for mock users
    const mockUsers = [
      {
        email: 'demo@xcysound.com',
        password: 'demo123',
        user: {
          id: '1',
          username: 'demo_user',
          email: 'demo@xcysound.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'user',
          purchasedTracks: [],
          cart: []
        }
      },
      {
        email: 'admin@xcysound.com',
        password: 'admin123',
        user: {
          id: '2',
          username: 'admin',
          email: 'admin@xcysound.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          purchasedTracks: [],
          cart: []
        }
      }
    ];

    const mockUser = mockUsers.find(user =>
      user.email === email && user.password === password
    );

    if (mockUser) {
      // Mock successful login
      dispatch({ type: 'SET_USER', payload: mockUser.user });
      dispatch({ type: 'SET_CART', payload: [] });
      return { success: true, user: mockUser.user };
    }

    // If not mock credentials, try real API
    try {
      const response = await axios.post('/auth/login', { email, password });
      dispatch({ type: 'SET_USER', payload: response.data.user });
      loadCart();
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      dispatch({ type: 'SET_USER', payload: response.data.user });
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadCart = async () => {
    try {
      const response = await axios.get('/payments/cart');
      dispatch({ type: 'SET_CART', payload: response.data.items });
    } catch (error) {
      console.error('Load cart error:', error);
    }
  };

  const addToCart = async (trackId) => {
    try {
      await axios.post('/payments/cart/add', { trackId });
      loadCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to cart'
      };
    }
  };

  const removeFromCart = async (trackId) => {
    try {
      await axios.delete(`/payments/cart/remove/${trackId}`);
      dispatch({ type: 'REMOVE_FROM_CART', payload: trackId });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from cart'
      };
    }
  };

  const loadTracks = async (params = {}) => {
    try {
      const response = await axios.get('/music', { params });
      dispatch({ type: 'SET_TRACKS', payload: response.data.tracks });
      return response.data;
    } catch (error) {
      console.error('Load tracks error:', error);
      return { tracks: [], total: 0 };
    }
  };

  const searchTracks = async (query, params = {}) => {
    try {
      const response = await axios.get(`/music/search/${query}`, { params });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return { tracks: [], total: 0 };
    }
  };

  const playTrack = (track, isPreview = true) => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
    dispatch({ type: 'SET_PREVIEW_MODE', payload: isPreview });
    dispatch({ type: 'SET_PLAYING', payload: true });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    addToCart,
    removeFromCart,
    loadTracks,
    searchTracks,
    playTrack,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
