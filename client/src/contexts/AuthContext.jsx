import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (err) {
      // Do not clear token/user here; keep session intact until explicit logout
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      let message = 'Login failed';
      if (err.code === 'ERR_NETWORK' || !err.response) {
        message = 'Cannot connect to server. Please ensure the backend is running at http://localhost:8081';
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (fullName, email, password) => {
    setError(null);
    try {
      const response = await authAPI.register({ fullName, email, password });
      const data = response.data;
      // Do NOT auto-login; allow user to sign in manually
      const msg = data.verificationLink
        ? 'Registration successful. Please verify your email, then sign in.'
        : 'Registration successful. You can now sign in.';
      setError(msg);
      return { requiresVerification: true, message: msg };
    } catch (err) {
      let message = 'Registration failed. Please check your connection and try again.';
      if (err.code === 'ERR_NETWORK' || !err.response) {
        message = 'Cannot connect to server. Please ensure the backend is running at http://localhost:8081';
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data;
      setUser((prev) => ({ ...prev, ...updatedUser }));
      return updatedUser;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Update failed');
    }
  };

  const updatePassword = async (data) => {
    try {
      await authAPI.updatePassword(data);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Password update failed');
    }
  };

  const updateTheme = useCallback(async (theme) => {
    try {
      await authAPI.updateTheme({ theme });
      setUser((prev) => ({ ...prev, theme }));
    } catch (err) {
      console.error('Theme update failed:', err);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    updateTheme,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};