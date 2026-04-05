// frontend/src/hooks/useAuth.js
// Custom hook for authentication

import { useState, useCallback, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { storage } from '../utils/storage';

export const useAuth = () => {
  const [user, setUser] = useState(() => storage.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(storage.isAuthenticated());

  // Login function
  const login = useCallback(async (nrp, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(nrp, password);
      const { token, user: userData } = response.data;

      storage.setToken(token);
      storage.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    storage.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (storage.isAuthenticated()) {
        try {
          await authAPI.verify();
        } catch {
          logout();
        }
      }
    };

    verifyToken();
  }, [logout]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
  };
};

export default useAuth;
