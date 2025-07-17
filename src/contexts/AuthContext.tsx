import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/admin/me');
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/admin/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific error cases
      if (error.response?.status === 423) {
        alert('Account is temporarily locked due to too many failed attempts. Please try again later.');
      } else if (error.response?.status === 401) {
        alert('Invalid username or password');
      } else {
        alert('Login failed. Please try again.');
      }
      
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};