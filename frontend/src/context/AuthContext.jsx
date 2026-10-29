import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ips_pg_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('ips_pg_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
          localStorage.setItem('ips_pg_user', JSON.stringify(freshUser));
        } catch (err) {
          // If token invalid, clean up
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    const { token: jwtToken, user: authUser } = response;
    setToken(jwtToken);
    setUser(authUser);
    localStorage.setItem('ips_pg_token', jwtToken);
    localStorage.setItem('ips_pg_user', JSON.stringify(authUser));
    return authUser;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    const { token: jwtToken, user: authUser } = response;
    setToken(jwtToken);
    setUser(authUser);
    localStorage.setItem('ips_pg_token', jwtToken);
    localStorage.setItem('ips_pg_user', JSON.stringify(authUser));
    return authUser;
  };

  const logout = () => {
    localStorage.removeItem('ips_pg_token');
    localStorage.removeItem('ips_pg_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('ips_pg_user', JSON.stringify(updatedUser));
  };

  const getDashboardPath = (role = user?.role) => {
    switch (role) {
      case 'STUDENT':
        return '/student';
      case 'PG_OWNER':
        return '/owner';
      case 'MESS_OWNER':
        return '/mess';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        getDashboardPath
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

export default AuthContext;

