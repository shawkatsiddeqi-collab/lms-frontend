import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../utils/helpers';
import { ROUTES, ROLES } from '../utils/constants';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = storage.get('token');
        const storedUser = storage.get('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        storage.remove('token');
        storage.remove('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Get dashboard route based on role
  const getDashboardRoute = useCallback((role) => {
    const routes = {
      [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
      [ROLES.TEACHER]: ROUTES.TEACHER_DASHBOARD,
      [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
    };
    return routes[role] || ROUTES.HOME;
  }, []);

  // Login function - FIXED FOR YOUR BACKEND RESPONSE STRUCTURE
  const login = useCallback(async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('Login response:', response.data);

      // ✅ YOUR BACKEND RETURNS DATA DIRECTLY AT ROOT LEVEL
      // Response structure: { _id, name, email, role, token }
      const responseData = response.data;
      
      // Check if we got a valid response with token
      if (responseData && responseData.token) {
        // Extract token
        const newToken = responseData.token;
        
        // Extract user data (everything except token)
        const { token: _, ...userData } = responseData;
        
        console.log('Token:', newToken);
        console.log('User data:', userData);

        // Validate user has required fields
        if (!userData.role) {
          console.error('No role in user data:', userData);
          toast.error('Invalid user data - no role');
          return { success: false, message: 'Invalid user data' };
        }

        // Set state
        setToken(newToken);
        setUser(userData);
        
        // Save to localStorage
        storage.set('token', newToken);
        storage.set('user', userData);
        
        // Set authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        toast.success(`Welcome back, ${userData.name || 'User'}!`);
        
        // Navigate to appropriate dashboard
        const dashboardRoute = getDashboardRoute(userData.role);
        console.log('Navigating to:', dashboardRoute);
        navigate(dashboardRoute, { replace: true });
        
        return { success: true };
      } 
      // Handle case where backend returns { success: false, message: "..." }
      else if (responseData.success === false) {
        const message = responseData.message || 'Login failed';
        toast.error(message);
        return { success: false, message };
      }
      // Handle unexpected response structure
      else {
        console.error('Unexpected response structure:', responseData);
        toast.error('Unexpected response from server');
        return { success: false, message: 'Unexpected response from server' };
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, message };
    }
  }, [navigate, getDashboardRoute]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      console.log('Attempting registration with:', { email: userData.email });
      
      const response = await api.post('/auth/register', userData);
      
      console.log('Registration response:', response.data);
      
      // Handle different response structures
      const responseData = response.data;
      
      // If registration returns success message
      if (responseData.message) {
        toast.success(responseData.message || 'Registration successful!');
        return { success: true, message: responseData.message };
      }
      
      // If registration returns user data (auto-login)
      if (responseData.token) {
        toast.success('Registration successful!');
        return { success: true, message: 'Registration successful!' };
      }
      
      toast.success('Registration successful! Please wait for admin approval.');
      return { success: true, message: 'Registration successful!' };
      
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    console.log('Logging out...');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    storage.remove('token');
    storage.remove('user');
    
    // Clear authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Show toast
    toast.success('Logged out successfully');
    
    // Navigate to login
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate]);

  // Check if user has required role
  const hasRole = useCallback((requiredRole) => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  }, [user]);

  // Update user data
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    storage.set('user', updatedUser);
  }, [user]);

  // Check if authenticated
  const isAuthenticated = Boolean(token && user);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
    updateUser,
    getDashboardRoute,
  }), [user, token, loading, isAuthenticated, login, register, logout, hasRole, updateUser, getDashboardRoute]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;