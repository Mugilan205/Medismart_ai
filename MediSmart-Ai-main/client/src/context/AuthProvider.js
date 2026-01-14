import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          // Clear invalid tokens
          localStorage.removeItem('token');
          if (error.response?.status !== 401) {
            console.error('Failed to load user', error);
          }
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Logged in successfully!');
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting registration with:', { ...userData, password: '[HIDDEN]' });
      const res = await api.post('/auth/register', userData);
      console.log('Registration response:', res.data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Registered successfully!');
      return res.data;
    } catch (error) {
      console.error('Registration failed:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors array
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        errorMessage = `Validation failed: ${validationErrors}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
