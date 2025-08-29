'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, handleApiError } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'provider' | 'admin';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await apiService.getCurrentUser();
          if (response.data) {
            setUser(response.data);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ emailOrPhone, password });
      
      if (response.data) {
        setUser(response.data.user);
        return true;
      } else {
        handleApiError(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      handleApiError(error, 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.data) {
        // Auto-login after successful registration
        const loginResponse = await apiService.login({
          emailOrPhone: userData.email,
          password: userData.password
        });
        
        if (loginResponse.data) {
          setUser(loginResponse.data.user);
          return true;
        }
      } else {
        handleApiError(response.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      handleApiError(error, 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might be logged out
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
