import React, { createContext, useContext, useState, useCallback } from 'react';
import { setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('cgdim-user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const login = useCallback((userData, token) => {
    setUser(userData);
    if (token) localStorage.setItem('cgdim-token', token);
    if (userData) localStorage.setItem('cgdim-user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cgdim-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
