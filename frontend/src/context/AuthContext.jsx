import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  // Sync token changes to localStorage
  const saveToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  // Fetch current user details
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user');
      if (response.data && response.data.success) {
        setUser(response.data.data);
      } else {
        saveToken(null);
      }
    } catch (err) {
      saveToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Attempt auto-login on bootstrap
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Listen to global unauthenticated events (intercepted 401s)
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data && response.data.success) {
      const { access_token, user: userData } = response.data.data;
      saveToken(access_token);
      setUser(userData);
      return response.data;
    }
    throw new Error(response.data?.message || 'Login failed');
  };

  // Register handler
  const register = async (name, email, password, passwordConfirmation, role = 'user') => {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      role
    });
    if (response.data && response.data.success) {
      const { access_token, user: userData } = response.data.data;
      saveToken(access_token);
      setUser(userData);
      return response.data;
    }
    throw new Error(response.data?.message || 'Registration failed');
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      // Ignore network errors on logout, proceed with client flush
    } finally {
      saveToken(null);
    }
  };

  // Refresh token handler
  const refreshToken = async () => {
    const response = await api.post('/refresh');
    if (response.data && response.data.success) {
      const { access_token, user: userData } = response.data.data;
      saveToken(access_token);
      setUser(userData);
      return response.data;
    }
    throw new Error(response.data?.message || 'Token refresh failed');
  };

  // Social login handler
  const socialLogin = async (email, name, provider, providerId) => {
    const response = await api.post('/social-login', {
      email,
      name,
      provider,
      provider_id: providerId
    });
    if (response.data && response.data.success) {
      const { access_token, user: userData } = response.data.data;
      saveToken(access_token);
      setUser(userData);
      return response.data;
    }
    throw new Error(response.data?.message || 'Social login failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshToken,
        socialLogin,
        refreshProfile: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
