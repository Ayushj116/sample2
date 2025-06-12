import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { STORAGE_KEYS } from '../constants';
import { User } from '../types';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  hasCompletedOnboarding: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check onboarding status
      const onboardingCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      setHasCompletedOnboarding(onboardingCompleted === 'true');
      
      // Check authentication
      const token = await authService.getToken();
      const userData = await authService.getCurrentUser();
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
        
        // Initialize notification service
        try {
          await notificationService.initialize();
          notificationService.connect(userData.id);
        } catch (error) {
          console.warn('Failed to initialize notifications:', error);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const response = await authService.login({ phone, password });
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        // Initialize notification service
        try {
          await notificationService.initialize();
          notificationService.connect(response.data.user.id);
        } catch (error) {
          console.warn('Failed to initialize notifications:', error);
        }
        
        return response;
      }
      throw new Error(response.message);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        // Initialize notification service
        try {
          await notificationService.initialize();
          notificationService.connect(response.data.user.id);
        } catch (error) {
          console.warn('Failed to initialize notifications:', error);
        }
        
        return response;
      }
      throw new Error(response.message);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      notificationService.disconnect();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await authService.updateUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Complete onboarding error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
        hasCompletedOnboarding,
        login,
        register,
        logout,
        updateUser,
        completeOnboarding,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};