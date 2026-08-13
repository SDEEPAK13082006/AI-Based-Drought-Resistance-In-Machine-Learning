import React, { createContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => localStorage.getItem('username'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  const login = (accessToken, username) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('username', username);
    setToken(accessToken);
    setUser(username);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
