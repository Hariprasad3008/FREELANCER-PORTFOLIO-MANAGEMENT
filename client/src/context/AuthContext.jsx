import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { getSocket, disconnectSocket } from '../services/socket.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('freelancer_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('freelancer_token') || null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Fetch current user from server on refresh
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('freelancer_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('freelancer_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      localStorage.removeItem('freelancer_token');
      localStorage.removeItem('freelancer_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Socket Connection & Presence tracking
  useEffect(() => {
    if (user && token) {
      const socket = getSocket(token);
      if (socket) {
        socket.on('online_users', (users) => {
          setOnlineUsers(users);
        });
      }
      return () => {
        if (socket) {
          socket.off('online_users');
        }
      };
    } else {
      disconnectSocket();
      setOnlineUsers([]);
    }
  }, [user, token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('freelancer_token', res.data.token);
      localStorage.setItem('freelancer_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('freelancer_token', res.data.token);
      localStorage.setItem('freelancer_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('freelancer_token');
    localStorage.removeItem('freelancer_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('freelancer_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        onlineUsers,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!user && !!token,
        isFreelancer: user?.role?.toLowerCase() === 'freelancer',
        isClient: user?.role?.toLowerCase() === 'client',
        isAdmin: user?.role?.toLowerCase() === 'admin',
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
